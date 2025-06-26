import { HttpService } from "@nestjs/axios";
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { lastValueFrom, map } from "rxjs";
import { components } from "types/schema";
import { SwayamApiResponse } from "types/SwayamApiResponse";
import {
  selectItemMapper,
  scholarshipCatalogGenerator,
  IcarCatalogGenerator,
  flnCatalogGenerator,
  PmKisanIcarGenerator,
} from "utils/generator";
import { v4 as uuidv4 } from "uuid";
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { encrypt, decrypt, getUniqueKey, decryptRequest } from './utils/encryption';
import { LoggerService } from './services/logger/logger.service';
import { format } from 'date-fns';

// getting course data
import * as fs from "fs";
import { HasuraService } from "./services/hasura/hasura.service";
import { AuthService } from "./auth/auth.service";
const file = fs.readFileSync("./course.json", "utf8");
const courseData = JSON.parse(file);

// PM Kisan Portal Errors
const PMKissanProtalErrors = {
  "Income Tax Payee": {
    "text": "{{farmer_name}}, you are an Income Tax Payee. Please contact your nearest CSC center for further assistance.",
    "types": ["status", "payment", "installment"]
  },
  "Land Seeding, KYS": {
    "text": "{{farmer_name}}, your land is under seeding/KYS process. Please wait for completion.",
    "types": ["status", "payment", "installment"]
  },
  "No Errors": {
    "text": "{{farmer_name}}, your {{latest_installment_paid}} installment has been processed successfully. Registration date: {{Reg_Date (DD-MM-YYYY)}}",
    "types": ["status", "payment", "installment"]
  }
};

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly hasuraService: HasuraService,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService
  ) { }

  private nameSpace = process.env.HASURA_NAMESPACE;
  private base_url = process.env.BASE_URL;
  private namespace = process.env.NAMESPACE;

  private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();
  private readonly OTP_VALIDITY_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  private tempOTPStore = {
    otp: null,
    identifier: null,
    mobileNumber: null,
    timestamp: null,
  };

  // 5 minutes in milliseconds
  private readonly OTP_EXPIRY_TIME = 5 * 60 * 1000;

  getHello(): string {
    return "Icar-network Backend is running!!";
  }

  async getCoursesFromFln(body: {
    context: components["schemas"]["Context"];
    message: { intent: components["schemas"]["Intent"] };
  }) {
    console.log("body 98", JSON.stringify(body));
    const intent: any = body.message.intent;
    console.log("intent: ", intent);

    // destructuring the intent
    const provider = intent?.provider?.descriptor?.name;
    const query = intent?.item?.descriptor?.name
      ? intent.item.descriptor.name
      : "";
    const tagGroup = intent?.item?.tags;
    console.log("query: ", query);
    console.log("tag group: ", tagGroup);

    const flattenedTags: any = {};
    if (tagGroup) {
      (tagGroup[0].list as any[])?.forEach((tag) => {
        flattenedTags[tag.name] = tag.value;
      });
    }
    console.log("flattened tags: ", flattenedTags);
    const domain = flattenedTags?.domain !== "" ? flattenedTags?.domain : null;
    const theme = flattenedTags?.theme !== "" ? flattenedTags?.theme : null;
    const goal = flattenedTags?.goal !== "" ? flattenedTags?.goal : null;
    const competency =
      flattenedTags?.competency !== "" ? flattenedTags?.competency : null;
    const language =
      flattenedTags?.language !== "" ? flattenedTags?.language : null;
    const contentType =
      flattenedTags?.contentType !== "" ? flattenedTags?.contentType : null;

    let obj = {};
    if (flattenedTags.domain) {
      obj["domain"] = flattenedTags.domain;
    }
    if (flattenedTags?.theme) {
      obj["theme"] = flattenedTags?.theme;
    }
    if (flattenedTags?.goal) {
      obj["goal"] = flattenedTags?.goal;
    }
    if (flattenedTags?.competency) {
      obj["competency"] = flattenedTags?.competency;
    }
    if (flattenedTags?.language) {
      obj["language"] = flattenedTags?.language;
    }
    if (flattenedTags?.contentType) {
      obj["contentType"] = flattenedTags?.contentType;
    }

    console.log("filter obj", obj);
    console.log("217", body.context.domain);
    try {
      const resp = await this.hasuraService.findContent(query);
      const flnResponse: any = resp.data.fln_content;
      console.log("flnResponse", flnResponse);
      for (let item of flnResponse) {
        if (item.image) {
          if (!this.isValidUrl(item.image)) {
            item.image = await this.hasuraService.getImageUrl(item.image);
          }
        }

        if (item.flncontentProviderRelationshp.image) {
          if (!this.isValidUrl(item.flncontentProviderRelationshp.image)) {
            item.flncontentProviderRelationshp.image =
              await this.hasuraService.getImageUrl(
                item.flncontentProviderRelationshp.image
              );
          }
        }
      }
      // const promises = flnResponse.map(async (item) => {
      //   //console.log("item", item)
      //   if (item.image) {
      //     if (this.isValidUrl(item.image)) {
      //       return item
      //     } else {
      //       let imageUrl = await this.s3Service.getFileUrl(item.image)
      //       if (imageUrl) {
      //         item.image = `${imageUrl}`
      //         return item;
      //       } else {
      //         return item;
      //       }
      //     }
      //   }
      //   return item

      // })
      // let flnResponseUpdated = await Promise.all(promises)
      //return flnResponse
      const catalog = flnCatalogGenerator(flnResponse, query);
      body.context.action = "on_search";
      const courseData: any = {
        context: body.context,
        message: {
          catalog: catalog,
        },
      };
      // console.log("courseData", courseData)
      // console.log("courseData 158", JSON.stringify(courseData))
      return courseData;
    } catch (err) {
      console.log("err: ", err);
      throw new InternalServerErrorException(err);
    }
  }

  async handleSearch2(body: {
    context: components["schemas"]["Context"];
    message: { intent: components["schemas"]["Intent"] };
  }) {
    const intent: any = body.message.intent;

    // destructuring the intent
    const provider = intent?.provider?.descriptor?.name;
    const query = intent?.item?.descriptor?.name;
    const tagGroup = intent?.item?.tags;

    const flattenedTags: any = {};
    if (tagGroup) {
      (tagGroup[0].list as any[])?.forEach((tag) => {
        flattenedTags[tag.name] = tag.value;
      });
    }
    const domain = flattenedTags?.domain !== "" ? flattenedTags?.domain : null;
    const theme = flattenedTags?.theme !== "" ? flattenedTags?.theme : null;
    const goal = flattenedTags?.goal !== "" ? flattenedTags?.goal : null;
    const competency =
      flattenedTags?.competency !== "" ? flattenedTags?.competency : null;
    const language =
      flattenedTags?.language !== "" ? flattenedTags?.language : null;
    const contentType =
      flattenedTags?.contentType !== "" ? flattenedTags?.contentType : null;

    let obj = {};
    if (flattenedTags.domain) {
      obj["domain"] = flattenedTags.domain;
    }
    if (flattenedTags?.theme) {
      obj["theme"] = flattenedTags?.theme;
    }
    if (flattenedTags?.goal) {
      obj["goal"] = flattenedTags?.goal;
    }
    if (flattenedTags?.competency) {
      obj["competency"] = flattenedTags?.competency;
    }
    if (flattenedTags?.language) {
      obj["language"] = flattenedTags?.language;
    }
    if (flattenedTags?.contentType) {
      obj["contentType"] = flattenedTags?.contentType;
    }

    try {
      const resp = await this.hasuraService.findIcarContent(query);
      const icarResponse: any = resp.data.icar_.Content;
      console.log("icarResponse", icarResponse.length);
      const catalog = IcarCatalogGenerator(icarResponse, query);
      body.context.action = "on_search";
      const courseData: any = {
        context: body.context,
        message: {
          catalog: catalog,
        },
      };
      return courseData;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async handleSearch(body: {
    context: components["schemas"]["Context"];
    message: { intent: components["schemas"]["Intent"] };
  }) {
    const intent: any = body.message.intent;

    // destructuring the intent
    const provider = intent?.provider?.descriptor?.name;
    const query = intent?.item?.descriptor?.name;
    const tagGroup = intent?.item?.tags;
    const categoryCode = intent?.category?.descriptor?.code;
    const schemeCode = intent?.item?.descriptor?.name;
    const requestDomain = body.context.domain;

    const flattenedTags: any = {};
    if (tagGroup) {
      (tagGroup[0].list as any[])?.forEach((tag) => {
        flattenedTags[tag.name] = tag.value;
      });
    }
    const domain = flattenedTags?.domain !== "" ? flattenedTags?.domain : null;
    const theme = flattenedTags?.theme !== "" ? flattenedTags?.theme : null;
    const goal = flattenedTags?.goal !== "" ? flattenedTags?.goal : null;
    const competency =
      flattenedTags?.competency !== "" ? flattenedTags?.competency : null;
    const language =
      flattenedTags?.language !== "" ? flattenedTags?.language : null;
    const contentType =
      flattenedTags?.contentType !== "" ? flattenedTags?.contentType : null;

    let obj = {};
    if (flattenedTags.domain) {
      obj["domain"] = flattenedTags.domain;
    }
    if (flattenedTags?.theme) {
      obj["theme"] = flattenedTags?.theme;
    }
    if (flattenedTags?.goal) {
      obj["goal"] = flattenedTags?.goal;
    }
    if (flattenedTags?.competency) {
      obj["competency"] = flattenedTags?.competency;
    }
    if (flattenedTags?.language) {
      obj["language"] = flattenedTags?.language;
    }
    if (flattenedTags?.contentType) {
      obj["contentType"] = flattenedTags?.contentType;
    }

    try {
      // Construct the query string
      // Construct the query string
      let searchQuery = "";
      const filters = [];

      // Add category code filter if it's not empty
      if (categoryCode && categoryCode.trim() !== "") {
        filters.push(`usecase: {_ilike: "${categoryCode}"}`);
      }

      // Add scheme code filter if it's not empty
      if (schemeCode && schemeCode.trim() !== "") {
        filters.push(`scheme_id: {_ilike: "${schemeCode}"}`);
      }

      // Construct the where clause if any filters are present
      if (filters.length > 0) {
        searchQuery = `(where: { ${filters.join(", ")} }, `;
      } else {
        searchQuery = ""; // or handle case where no filters are applied
      }

      const resp = await this.hasuraService.findIcarContent(searchQuery);
      const icarResponse: any = resp.data.icar_.Content;
      for (let item of icarResponse) {
        if (item.icon) {
          if (!this.isValidUrl(item.icon)) {
            item.icon = await this.hasuraService.getImageUrl(item.icon);
          }
        }
      }
      // Use different catalog generator based on domain
      let catalog;
      catalog = IcarCatalogGenerator(icarResponse, query);

      body.context.action = "on_search";
      const courseData: any = {
        context: body.context,
        message: {
          catalog: catalog,
        },
      };
      return courseData;
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err,
      });
    }
  }

  async searchForIntentQuery(body) {
    // Default values
    const defaultQuery = "farming practices";
    const defaultLimit = 5;
    const defaultFilter = "type:document";
    const defaultSearchMethod = "HYBRID";
    const defaultHybridParams = {
      retrievalMethod: "disjunction",
      rankingMethod: "rrf",
      alpha: 0.5,
      rrfK: 60,
    };

    const query = body?.message?.intent?.item?.descriptor?.name || defaultQuery;

    let limit = defaultLimit;
    let filter = defaultFilter;
    let searchMethod = defaultSearchMethod;
    let hybridParams = { ...defaultHybridParams };

    const tags = body?.message?.intent?.item?.fulfillment?.tags || [];

    for (const tag of tags) {
      const code = tag.descriptor?.code;

      if (code === "searchParam") {
        for (const param of tag.list || []) {
          const paramCode = param.descriptor?.code;
          const value = param.value;

          if (paramCode === "limit" && !isNaN(parseInt(value))) {
            limit = parseInt(value);
          }

          if (paramCode === "filter_string") {
            filter = value;
          }

          if (paramCode === "search_method") {
            searchMethod = value.toUpperCase(); // normalize casing
          }
        }
      }

      if (code === "hybrid_parameters") {
        for (const param of tag.list || []) {
          const paramCode = param.descriptor?.code;
          const value = param.value;

          if (paramCode === "retrievalMethod") {
            hybridParams.retrievalMethod = value;
          }

          if (paramCode === "rankingMethod") {
            hybridParams.rankingMethod = value;
          }

          if (paramCode === "alpha" && !isNaN(parseFloat(value))) {
            hybridParams.alpha = parseFloat(value);
          }

          if (paramCode === "rrfK" && !isNaN(parseInt(value))) {
            hybridParams.rrfK = parseInt(value);
          }
        }
      }
    }

    const payload = {
      q: query,
      limit,
      filter,
      searchMethod,
      hybridParameters: hybridParams,
    };

    try {
      const response = await axios.post(
        "http://3.6.146.174:8882/indexes/oan-index/search",
        payload
      );

      body.context.action = "on_search";

      const mappedData = this.mapVectorDbData(body?.context, response.data);

      return mappedData;
    } catch (error) {
      console.error("Error making Axios request:", error.message);
      throw new Error("Failed to fetch data from the search endpoint");
    }
  }

  async mapVectorDbData(context, inputData) {
    return {
      context,
      message: {
        catalog: {
          descriptor: {
            name: inputData.query || "Farming Practices",
          },
          providers: [
            {
              id: "19a02a67-d2f0-4ea7-b7e1-b2cf4fa57f56",
              descriptor: {
                name: "Agri Acad",
                short_desc: "Agri Academic aggregator",
                images: [
                  {
                    url: "https://agri_acad.example.org/logo.png",
                  },
                ],
              },
              items: inputData.hits.map((hit) => ({
                id: hit.doc_id,
                descriptor: {
                  name: hit.name,
                  short_desc: hit.source,
                  long_desc: hit.text,
                },
                tags: [
                  {
                    descriptor: {
                      name: "Document Type",
                      code: "DOC_TYPE",
                    },
                    list: [
                      {
                        descriptor: {
                          name: "Type",
                          code: "TYPE",
                        },
                        value: hit.type,
                      },
                    ],
                  },
                  {
                    descriptor: {
                      name: "Source",
                      code: "SOURCE",
                    },
                    list: [
                      {
                        descriptor: {
                          name: "Source",
                          code: "SRC",
                        },
                        value: hit.source,
                      },
                    ],
                  },
                  {
                    descriptor: {
                      name: "Highlights",
                      code: "HIGHLIGHTS",
                    },
                    list: hit._highlights.map((highlight) => ({
                      descriptor: {
                        name: "Highlight Text",
                        code: "H_TEXT",
                      },
                      value: highlight.text,
                    })),
                  },
                ],
              })),
            },
          ],
        },
      },
    };
  }

  async handleSelect(selectDto: any) {
    // fine tune the order here

    // order['id'] = selectDto.context.transaction_id + Date.now();

    const itemId = selectDto.message.order.items[0].id;

    const courseData = await this.hasuraService.findIcarContentById(itemId);
    console.log("contentData", courseData.data.icar_.Content);

    delete courseData.data.icar_.Content[0].url;

    //return

    //const itemId = selectDto.message.order.items[0].id;
    //const order: any = selectItemMapper(courseData[itemId]);

    const order: any = selectItemMapper(courseData.data.icar_.Content[0]);

    // order?.items.map((item) => {
    //   item['descriptor']['long_desc'] = longDes;
    //   item['tags'] = [...item['tags'],]
    // });

    selectDto.message.order = order;
    selectDto.context.action = "on_select";
    const resp = selectDto;
    return resp;
  }

  async handleInit(initDto: any) {
    const data = {
      itemId: initDto.message.order.items[0].id,
      name: initDto.message.order.fulfillments[0].customer.person.name,
      age: initDto.message.order.fulfillments[0].customer.person.age,
      gender: initDto.message.order.fulfillments[0].customer.person.gender,
      email: initDto.message.order.fulfillments[0].customer.contact.email,
      phone: initDto.message.order.fulfillments[0].customer.contact.phone,
      role: "seeker",
    };

    const existinguser = await this.hasuraService.IsUserExist(data.email);

    if (existinguser === false) {
      const user = await this.authService.createUser(data);
    }

    initDto.context.action = "on_init";
    const resp = initDto;
    return resp;
  }

  async handleConfirm(confirmDto: any) {
    // fine tune the order here
    const itemId = confirmDto.message.order.items[0].id;
    // const email = confirmDto.message.order.fulfillments[0].customer.contact.email;
    // const order_id = uuidv4();

    // const seeker = await this.hasuraService.FindUserByEmail(email)
    // const id = seeker.data[`${this.nameSpace}`].Seeker[0].id;

    // const presentOrder = await this.hasuraService.IsOrderExist(itemId, id)
    // if (!presentOrder) {

    //   const Order = await this.hasuraService.GenerateOrderId(itemId, id, order_id)
    // }

    // const OrderDetails = await this.hasuraService.GetOrderId(itemId, id)
    // const orderId = OrderDetails.data[`${this.nameSpace}`].Order[0].order_id
    // console.log("orderId", orderId)

    const courseData = await this.hasuraService.findIcarContentById(itemId);
    const order: any = selectItemMapper(courseData.data.icar_.Content[0]);
    order["fulfillments"] = confirmDto.message.order.fulfillments;
    order["id"] = confirmDto.context.transaction_id + Date.now();
    //rder['id'] = orderId
    order["state"] = "COMPLETE";
    order["type"] = "DEFAULT";
    order["created_at"] = new Date(Date.now());
    order["updated_at"] = new Date(Date.now());
    confirmDto.context.action = "on_confirm";
    confirmDto.message.order = order;

    return confirmDto;
    // storing draft order in database
    const createOrderGQL = `mutation insertDraftOrder($order: dsep_orders_insert_input!) {
      insert_dsep_orders_one (
        object: $order
      ) {
        order_id
      }
    }`;

    await lastValueFrom(
      this.httpService
        .post(
          process.env.HASURA_URI,
          {
            query: createOrderGQL,
            variables: {
              order: {
                order_id: confirmDto.message.order.id,
                user_id:
                  confirmDto.message?.order?.fulfillments[0]?.customer?.person
                    ?.name,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                status: confirmDto.message.order.state,
                order_details: confirmDto.message.order,
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-hasura-admin-secret": process.env.SECRET,
            },
          }
        )
        .pipe(map((item) => item.data))
    );

    confirmDto.message.order = order;

    // update order as confirmed in database
    const updateOrderGQL = `mutation updateDSEPOrder($order_id: String, $changes: dsep_orders_set_input) {
      update_dsep_orders (
        where: {order_id: {_eq: $order_id}},
        _set: $changes
      ) {
        affected_rows
        returning {
          order_id
          status
          order_details
        }
      }
    }`;

    try {
      const res = await lastValueFrom(
        this.httpService
          .post(
            process.env.HASURA_URI,
            {
              query: updateOrderGQL,
              variables: {
                order_id: order.id,
                changes: {
                  order_details: order,
                  status: order.state,
                },
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": process.env.SECRET,
              },
            }
          )
          .pipe(map((item) => item.data))
      );
      console.log("res in test api update: ", res.data);

      confirmDto.message.order = order;
      confirmDto.context.action = "on_confirm";
      console.log("action: ", confirmDto.context.action);
      return confirmDto;
    } catch (err) {
      console.log("err: ", err);
      throw new InternalServerErrorException(err);
    }
  }

  async handleConfirm2(confirmDto: any) {
    // fine tune the order here
    const itemId = confirmDto.message.order.items[0].id;
    const order: any = selectItemMapper(courseData[itemId]);
    order["fulfillments"] = confirmDto.message.order.fulfillments;
    order["id"] = confirmDto.context.transaction_id + Date.now();
    order["state"] = "COMPLETE";
    order["type"] = "DEFAULT";
    order["created_at"] = new Date(Date.now());
    order["updated_at"] = new Date(Date.now());
    confirmDto.message.order = order;
    // storing draft order in database
    const createOrderGQL = `mutation insertDraftOrder($order: dsep_orders_insert_input!) {
      insert_dsep_orders_one (
        object: $order
      ) {
        order_id
      }
    }`;

    await lastValueFrom(
      this.httpService
        .post(
          process.env.HASURA_URI,
          {
            query: createOrderGQL,
            variables: {
              order: {
                order_id: confirmDto.message.order.id,
                user_id:
                  confirmDto.message?.order?.fulfillments[0]?.customer?.person
                    ?.name,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                status: confirmDto.message.order.state,
                order_details: confirmDto.message.order,
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-hasura-admin-secret": process.env.SECRET,
            },
          }
        )
        .pipe(map((item) => item.data))
    );

    confirmDto.message.order = order;

    // update order as confirmed in database
    const updateOrderGQL = `mutation updateDSEPOrder($order_id: String, $changes: dsep_orders_set_input) {
      update_dsep_orders (
        where: {order_id: {_eq: $order_id}},
        _set: $changes
      ) {
        affected_rows
        returning {
          order_id
          status
          order_details
        }
      }
    }`;

    try {
      const res = await lastValueFrom(
        this.httpService
          .post(
            process.env.HASURA_URI,
            {
              query: updateOrderGQL,
              variables: {
                order_id: order.id,
                changes: {
                  order_details: order,
                  status: order.state,
                },
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": process.env.SECRET,
              },
            }
          )
          .pipe(map((item) => item.data))
      );
      console.log("res in test api update: ", res.data);

      confirmDto.message.order = order;
      confirmDto.context.action = "on_confirm";
      console.log("action: ", confirmDto.context.action);
      return confirmDto;
    } catch (err) {
      console.log("err: ", err);
      throw new InternalServerErrorException(err);
    }
  }

  async handleRating(ratingDto: any) {
    const itemId = ratingDto.message.ratings[0].id;
    const rating = ratingDto.message.ratings[0].value ?? null;
    const feedback = ratingDto.message.ratings[0].feedback ?? null;

    const courseData = await this.hasuraService.rateIcarContentById(
      itemId,
      rating,
      feedback
    );
    const id = courseData.data.icar_.insert_Rating.returning[0].id;

    ratingDto.context.action = "on_rating";
    ratingDto.message = {
      feedback_form: {
        form: {
          //url: `${this.base_url}/feedback/${id}`,
          url: `https://icar-api.tekdinext.com/feedback/${id}`,
          mime_type: "text/html",
        },
        required: false,
      },
    };
    const resp = ratingDto;
    return resp;
  }

  async sendOTP(mobileNumber: string, type: string = "Ben_id"): Promise<any> {
    try {
      // Auto-detect the type if not provided
      // let detectedType = type;
      // if (!detectedType) {
      //   if (/^[6-9]\d{9}$/.test(mobileNumber)) {
      //     detectedType = "Mobile";
      //   } else if (mobileNumber.length == 14 && /^[6-9]\d{9}$/.test(mobileNumber.substring(0, 10))) {
      //     detectedType = "MobileAadhar";
      //   } else if (mobileNumber.length == 12 && /^\d+$/.test(mobileNumber)) {
      //     detectedType = "Aadhar";
      //   } else if (mobileNumber.length == 11) {
      //     detectedType = "Ben_id";
      //   } else {
      //     // Default to Ben_id if format doesn't match any known pattern
      //     detectedType = "Ben_id";
      //   }
      // }



      let key = getUniqueKey();
      // Create the request data as a JSON string
      let requestData = JSON.stringify({
        Types: type,
        Values: mobileNumber,
        Token: process.env.PM_KISSAN_TOKEN,
      });

      console.log("Request data: ", requestData);

      // Encrypt the request data
      let encrypted_text = await encrypt(requestData, key);
      console.log("encrypted text without @: ", encrypted_text);

      // Format the request data as expected by PM Kisan service
      let data = {
        EncryptedRequest: encrypted_text + "@" + key,
      };

      console.log("(in sendOTP)the data in the data var is as: ", data);

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.PM_KISAN_BASE_OTP_URL}/ChatbotOTP`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
        timeout: 10000, // 10 second timeout
      };
      console.log(config);
      let response: any = await axios.request(config);
      console.log("sendOTP", response.status);

      if (response.status >= 200 && response.status < 300) {
        response = await response.data;

        // Extract the encrypted response and key
        const [encryptedResponse, responseKey] = (
          response.d.output || ""
        ).split("@");

        if (!encryptedResponse) {
          console.error("No encrypted response received");
          return {
            d: {
              output: {
                status: "False",
                Message: "Invalid response format",
              },
            },
          };
        }

        // Use the response key for decryption
        let decryptedData: any = await decryptRequest(
          encryptedResponse,
          responseKey || key
        );
        console.log("Response from decryptedData(sendOTP)", decryptedData);

        try {
          const parsedData = JSON.parse(decryptedData);
          response.d.output = parsedData;
          response["status"] =
            response.d.output.Rsponce !== "False" ? "OK" : "NOT_OK";
        } catch (e) {
          console.error("Error parsing decrypted data:", e);
          response["status"] = "NOT_OK";
        }

        return response;
      } else {
        return {
          d: {
            output: {
              status: "False",
              Message: "Try again",
            },
          },
        };
      }
    } catch (error) {
      console.error(
        "Error in sendOTP:",
        error.message,
        error.response?.data || error
      );

      /*
      // Check for network-related errors
      if (error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNABORTED' ||
          error.message.includes('Network Error') ||
          error.message.includes('timeout') ||
          error.message.includes('connect') ||
          error.message.includes('ENOTFOUND')) {
        console.log("Network connectivity issue detected - not sending OTP");
        return {
          d: {
            output: {
              status: "False",
              Message: "Network connectivity issue detected. Please check your internet connection and try again.",
            },
          },
        };
      }
      */
      return {
        d: {
          output: {
            status: "False",
            Message: "Try again",
          },
        },
      };
    }
  }

  async verifyOTP(
    mobileNumber: string,
    otp: string,
    type?: string
  ): Promise<any> {
    try {
      // Auto-detect the type if not provided
      let detectedType = type;
      if (!detectedType) {
        // Comment out other cases and keep only Ben_id
        // if (/^[6-9]\d{9}$/.test(mobileNumber)) {
        //   detectedType = "Mobile";
        // } else if (mobileNumber.length == 14 && /^[6-9]\d{9}$/.test(mobileNumber.substring(0, 10))) {
        //   detectedType = "MobileAadhar";
        // } else if (mobileNumber.length == 12 && /^\d+$/.test(mobileNumber)) {
        //   detectedType = "Aadhar";
        // } else if (mobileNumber.length == 11) {
        //   detectedType = "Ben_id";
        // } else {
        //   // Default to Ben_id if format doesn't match any known pattern
        //   detectedType = "Ben_id";
        // }

        // Always use Ben_id
        detectedType = "Ben_id";
      }

      console.log(`Detected type for verification ${mobileNumber}: ${detectedType}`);

      let requestData = `{\"Types\":\"${detectedType}\",\"Values\":\"${mobileNumber}\",\"OTP\":\"${otp}\",\"Token\":\"${process.env.PM_KISSAN_TOKEN}\"}`;
      console.log("Request data: ", requestData);
      let key = getUniqueKey();
      let encrypted_text = await encrypt(requestData, key); //without @

      console.log("encrypted text without @: ", encrypted_text);

      let data = {
        EncryptedRequest: `${encrypted_text}@${key}`,
      };
      console.log("(inside verifyOTP)the data in the data var is : ", data);
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.PM_KISAN_BASE_OTP_URL}/ChatbotOTPVerified`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      let response: any = await axios.request(config);
      console.log("verifyOTP", response.status);
      if (response.status >= 200 && response.status < 300) {
        response = await response.data;
        let decryptedData: any = await decryptRequest(response.d.output, key);
        console.log("Response of VerifyOTP", response);
        console.log("Response from decryptedData(verifyOTP)", decryptedData);
        response["status"] =
          response.d.output.Rsponce != "False" ? "OK" : "NOT_OK";
        return response;
      } else {
        return {
          d: {
            output: {
              status: "False",
              Message: "Try again",
            },
          },
        };
      }
    } catch (error) {
      console.error("Error in verifyOTP:", error);
      return {
        d: {
          output: {
            status: "False",
            Message: "Try again",
          },
        },
      };
    }
  }

  async handleStatus(body: any) {
    console.log("Input body:", JSON.stringify(body, null, 2));

    try {
      const orderId = body.message?.order_id;

      if (!orderId) {
        return this.createStatusErrorResponse(body.context, "missing_order_id", "Please provide a valid order ID");
      }

      // Check if this is an OTP validation request
      const isOtpValidation = /^\d{4,6}$/.test(orderId);
      if (isOtpValidation) {
        return await this.handleOtpValidation(body, orderId);
      }

      // Handle other status requests if needed
      return this.createStatusErrorResponse(body.context, "invalid_request", "Invalid status request");

    } catch (err) {
      console.error("❌ Error in handleStatus:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      throw new InternalServerErrorException(err.message, { cause: err });
    }
  }

  private async handleOtpValidation(body: any, orderId: string) {
    try {
      const storedData = this.tempOTPStore;

      if (!storedData?.mobileNumber) {
        return this.createStatusErrorResponse(
          body.context,
          "no_stored_data",
          "No stored data found. Please restart the process."
        );
      }

      // Verify OTP
      const verifyResponse = await this.verifyOTP(storedData.mobileNumber, orderId);

      if (verifyResponse.status !== "OK") {
        return this.createStatusErrorResponse(
          body.context,
          "invalid_otp",
          "Invalid or expired OTP. Please try again."
        );
      }

      console.log("✅ OTP validation successful!");

      // Clear OTP after successful validation
      this.clearTempOTPStore();

      // Fetch user data after successful OTP verification
      try {
        const context = {
          userAadhaarNumber: storedData.identifier || storedData.mobileNumber,
          lastAadhaarDigits: "",
          queryType: "status"
        };

        const userDataResponse = await this.fetchUserData(context, {});
        return this.createSuccessResponse(body.context, orderId, storedData.mobileNumber, userDataResponse);

      } catch (fetchError) {
        console.error("❌ Error in fetchUserData:", fetchError);
        return this.createFetchErrorResponse(body.context, orderId, storedData.mobileNumber, fetchError);
      }

    } catch (error) {
      console.error("❌ Error in OTP validation:", error);
      return this.createStatusErrorResponse(
        body.context,
        "otp_validation_failed",
        "Failed to validate OTP. Please try again."
      );
    }
  }

  private clearTempOTPStore() {
    this.tempOTPStore = {
      otp: null,
      identifier: null,
      mobileNumber: null,
      timestamp: null,
    };
  }

  private createStatusErrorResponse(context: any, code: string, message: string) {
    return {
      context: { ...context, action: "on_status", timestamp: new Date().toISOString(), ttl: "PT10M" },
      message: {
        order: {
          id: "error",
          tags: [{
            display: true,
            descriptor: {
              name: "Error",
              code: code,
              short_desc: message,
            },
          }],
        },
      },
    };
  }

  private createSuccessResponse(context: any, orderId: string, mobileNumber: string, userDataResponse: string) {
    return {
      context: { ...context, action: "on_status", timestamp: new Date().toISOString(), ttl: "PT10M" },
      message: {
        order: {
          id: orderId,
          state: "COMPLETED",
          provider: {
            id: "pm_kisan_provider",
            descriptor: {
              name: "PM Kisan Portal",
              short_desc: "PM Kisan Beneficiary Status Service",
            },
          },
          items: [{
            id: "pm_kisan_status",
            descriptor: {
              name: "Beneficiary Status",
              short_desc: "PM Kisan beneficiary details and payment status",
            },
          }],
          fulfillments: [{
            customer: {
              person: { name: "Beneficiary" },
              contact: { phone: mobileNumber || "XXXXXXXXXX" },
            },
            state: {
              descriptor: {
                name: "Status",
                code: "completed",
                short_desc: "OTP verified and user data retrieved",
                long_desc: userDataResponse,
              },
              updated_at: new Date().toISOString(),
            },
          }],
        },
      },
    };
  }

  private createFetchErrorResponse(context: any, orderId: string, mobileNumber: string, fetchError: any) {
    return {
      context: { ...context, action: "on_status", timestamp: new Date().toISOString(), ttl: "PT10M" },
      message: {
        order: {
          id: orderId,
          state: "FAILED",
          provider: {
            id: "pm_kisan_provider",
            descriptor: {
              name: "PM Kisan Portal",
              short_desc: "PM Kisan Beneficiary Status Service",
            },
          },
          items: [{
            id: "pm_kisan_status",
            descriptor: {
              name: "Beneficiary Status",
              short_desc: "Failed to retrieve beneficiary data",
            },
          }],
          fulfillments: [{
            customer: {
              person: { name: "Beneficiary" },
              contact: { phone: mobileNumber || "XXXXXXXXXX" },
            },
            state: {
              descriptor: {
                name: "Error",
                code: "fetch_user_data_failed",
                short_desc: "Failed to retrieve beneficiary data",
                long_desc: fetchError.message || "An error occurred while fetching user data",
              },
              updated_at: new Date().toISOString(),
            },
          }],
        },
      },
    };
  }

  generateFeedbackUrl(): string {
    // Generate and return a feedback URL
    // For simplicity, you can use a static URL or generate a unique URL as needed
    return "https://example.com/feedback";
  }

  async handleSubmit(description, id) {
    console.log("description", description);
    console.log("id", id);
    try {
      const courseData = await this.hasuraService.SubmitFeedback(
        description,
        id
      );
      console.log("courseData", courseData);
      return { message: "feedback submitted Successfully" };
    } catch (error) {
      return error;
    }
  }

  // Function to check if a string is a valid URL
  isValidUrl(str: string) {
    try {
      new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  }
  async handlePmKisanSearch(body: {
    context: components["schemas"]["Context"];
    message: { intent: components["schemas"]["Intent"] };
  }) {
    const intent: any = body.message.intent;

    // destructuring the intent
    const provider = intent?.provider?.descriptor?.name;
    const query = intent?.item?.descriptor?.name;
    const tagGroup = intent?.item?.tags;
    const categoryCode = intent?.category?.descriptor?.code.toLowerCase();
    const schemeCode = intent?.item?.descriptor?.name.toLowerCase();
    const requestDomain = body.context.domain;

    const flattenedTags: any = {};
    if (tagGroup) {
      (tagGroup[0].list as any[])?.forEach((tag) => {
        flattenedTags[tag.name] = tag.value;
      });
    }
    const domain = flattenedTags?.domain !== "" ? flattenedTags?.domain : null;
    const theme = flattenedTags?.theme !== "" ? flattenedTags?.theme : null;
    const goal = flattenedTags?.goal !== "" ? flattenedTags?.goal : null;
    const competency =
      flattenedTags?.competency !== "" ? flattenedTags?.competency : null;
    const language =
      flattenedTags?.language !== "" ? flattenedTags?.language : null;
    const contentType =
      flattenedTags?.contentType !== "" ? flattenedTags?.contentType : null;

    let obj = {};
    if (flattenedTags.domain) {
      obj["domain"] = flattenedTags.domain;
    }
    if (flattenedTags?.theme) {
      obj["theme"] = flattenedTags?.theme;
    }
    if (flattenedTags?.goal) {
      obj["goal"] = flattenedTags?.goal;
    }
    if (flattenedTags?.competency) {
      obj["competency"] = flattenedTags?.competency;
    }
    if (flattenedTags?.language) {
      obj["language"] = flattenedTags?.language;
    }
    if (flattenedTags?.contentType) {
      obj["contentType"] = flattenedTags?.contentType;
    }

    try {
      // Construct the query string
      // Construct the query string
      let searchQuery = "";
      const filters = [];

      // Add category code filter if it's not empty
      if (categoryCode && categoryCode.trim() !== "") {
        filters.push(`usecase: {_ilike: "${categoryCode}"}`);
      }

      // Add scheme code filter if it's not empty
      if (schemeCode && schemeCode.trim() !== "") {
        filters.push(`scheme_id: {_ilike: "${schemeCode}"}`);
      }

      // Construct the where clause if any filters are present
      if (filters.length > 0) {
        searchQuery = `(where: { ${filters.join(", ")} }, `;
      } else {
        searchQuery = ""; // or handle case where no filters are applied
      }

      const resp = await this.hasuraService.findIcarContent(searchQuery);
      const icarResponse: any = resp.data.icar_.Content;
      for (let item of icarResponse) {
        if (item.icon) {
          if (!this.isValidUrl(item.icon)) {
            item.icon = await this.hasuraService.getImageUrl(item.icon);
          }
        }
      }
      let catalog;
      catalog = PmKisanIcarGenerator(icarResponse, query);

      body.context.action = "on_search";
      const courseData: any = {
        context: body.context,
        message: {
          catalog: catalog,
        },
      };
      return courseData;
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err,
      });
    }
  }
  async handlePmkisanInit(body: any) {
    // Extract registration number from customer tags
    const customerTags = body?.message?.order?.fulfillments?.[0]?.customer?.person?.tags;
    let registrationNumber = this.extractRegistrationNumber(customerTags);

    // Validate registration number
    if (!registrationNumber) {
      return this.createErrorResponse(body.context, "missing_registration", "Valid registration number is required for OTP generation");
    }

    // Sanitize and validate mobile number
    const phone = body?.message?.order?.fulfillments?.[0]?.customer?.contact?.phone;
    const isValidPhone = typeof phone === "string" && /^[6-9]\d{9}$/.test(phone);

    try {
      // Generate and store OTP using registration number
      const otpResponse = await this.sendOTP(registrationNumber);

      if (otpResponse.status === "OK") {
        // Store registration number for later OTP verification
        this.tempOTPStore = {
          otp: null,
          identifier: registrationNumber,
          mobileNumber: registrationNumber,
          timestamp: new Date().toISOString(),
        };
   // Build status message
      let otpMessage = "Request for OTP is sent. Please enter the OTP when received and Submit.";
      if (!isValidPhone) {
        otpMessage += " However, the provided contact phone number is invalid and will not be used.";
      }
        return {
          context: { ...body.context, action: "on_init", timestamp: new Date().toISOString() },
          message: {
            order: {
              provider: { id: "NA" },
              items: [{
                id: "NA",
                tags: [{
                  display: true,
                  descriptor: {
                    name: "Otp Status",
                    code: "otp_status",
                    short_desc: otpMessage
                  }
                }]
              }],
              type: "DEFAULT"
            }
          }
        };
      } else {
        return this.createErrorResponse(
          body.context,
          "otp_error",
          otpResponse.d?.output?.Message || "Failed to generate OTP. Please try again later."
        );
      }
    } catch (error) {
      console.log("ORDER_STATUS", error);
      return this.createErrorResponse(body.context, "processing_error", "Failed to process request. Please try again later.");
    }
  }

  private extractRegistrationNumber(customerTags: any[]): string | null {
    if (!customerTags || !Array.isArray(customerTags)) {
      return null;
    }

    for (const tag of customerTags) {
      if (tag.descriptor?.code === "reg-details" && tag.list && Array.isArray(tag.list)) {
        for (const item of tag.list) {
          if (item.descriptor?.code === "reg-number") {
            const regNumber = String(item.value).trim();
            // Validate: should not be empty and should be alphanumeric
            if (regNumber && regNumber.length > 0 && /^[A-Z0-9]+$/i.test(regNumber)) {
              return regNumber;
            }
          }
        }
      }
    }
    return null;
  }

  private createErrorResponse(context: any, code: string, message: string) {
    return {
      context: { ...context, action: "on_init", timestamp: new Date().toISOString() },
      message: {
        order: {
          provider: { id: "NA" },
          items: [{
            id: "NA",
            tags: [{
              display: true,
              descriptor: {
                name: "Error",
                code: code,
                short_desc: message
              }
            }]
          }],
          type: "DEFAULT"
        }
      }
    };
  }

  // Utility functions
  private titleCase(str: string): string {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private addOrdinalSuffix(num: number): string {
    if (num === 0) return 'No';
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return num + "st";
    }
    if (j === 2 && k !== 12) {
      return num + "nd";
    }
    if (j === 3 && k !== 13) {
      return num + "rd";
    }
    return num + "th";
  }

  private AADHAAR_GREETING_MESSAGE(
    BeneficiaryName: string,
    FatherName: string,
    DOB: string,
    Address: string,
    DateOfRegistration: string,
    LatestInstallmentPaid: number,
    Reg_No: string,
    StateName: string,
    DistrictName: string,
    SubDistrictName: string,
    VillageName: string,
    eKYC_Status: string
  ): string {
    return `Beneficiary Name - ${BeneficiaryName}
Beneficiary Location - ${StateName}, ${DistrictName}, ${SubDistrictName}, ${VillageName}
Registration Number - ${Reg_No}
Registration Date - ${format(new Date(DateOfRegistration), 'M/d/yyyy h:mm:ss a')}
Last Installment Status - ${LatestInstallmentPaid == 0 ? "No" : this.addOrdinalSuffix(LatestInstallmentPaid)} Installment payment done
eKYC - ${eKYC_Status == 'Y' ? 'Done' : 'Not Done'}`;
  }

  async getUserData(
    mobileNumber: string,
    type: string = "Ben_id"
  ): Promise<any> {
    let res: any;
    try {
      const requestData = `{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"Token\":\"${process.env.PM_KISSAN_TOKEN}\"}`;
      console.log("Request data: ", requestData);
      let key = getUniqueKey();
      let encrypted_text = await encrypt(requestData, key);
      console.log("encrypted text without @: ", encrypted_text);

      let data = {
        "EncryptedRequest": `${encrypted_text}@${key}`,
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.PM_KISAN_BASE_URL}/ChatbotUserDetails`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
        timeout: 60000, // 10 second timeout
      };

      console.log("getUserData config:", config);
      res = await axios.request(config);
      this.logger.log("getUserData response status:", res.status);

      if (res.status >= 200 && res.status < 300) {
        res = await res.data;
        console.log("getUserData raw response:", res);

        if (res.d && res.d.output) {
          let decryptedData: any = await decryptRequest(
            res.d.output,
            key
          );
          console.log("Response of getUserData", res);
          console.log("decrypted data(from getUserData): ", decryptedData);

          try {
            res.d.output = JSON.parse(decryptedData);
            res["status"] = res.d.output.Rsponce != "False" ? "OK" : "NOT_OK";
          } catch (parseError) {
            console.error("Error parsing decrypted data:", parseError);
            res.d.output = {
              Rsponce: "False",
              Message: "Error parsing response"
            };
            res["status"] = "NOT_OK";
          }
        } else {
          console.error("Invalid response structure:", res);
          res = {
            d: {
              output: {
                Rsponce: "False",
                Message: "Invalid response structure",
              },
            },
            status: "NOT_OK"
          };
        }
      } else {
        console.error("getUserData HTTP error:", res.status);
        res = {
          d: {
            output: {
              Rsponce: "False",
              Message: "HTTP request failed",
            },
          },
          status: "NOT_OK"
        };
      }
    } catch (error) {
      console.error("getUserData error:", error.message);
      res = {
        d: {
          output: {
            Rsponce: "False",
            Message: "Unable to get user details",
          },
        },
        status: "NOT_OK"
      };
    }
    return res;
  }

  async fetchUserData(context: any, event: any): Promise<string> {
    this.logger.log("Fetch user data");
    this.logger.log("Current queryType:", context.queryType);
    const userIdentifier = `${context.userAadhaarNumber}${context.lastAadhaarDigits}`;
    let res;
    let type = "Ben_id";

    // Comment out other cases and keep only Ben_id
    // if (/^[6-9]\d{9}$/.test(userIdentifier)) {
    //   type = "Mobile";
    //   res = await this.getUserData(userIdentifier, "Mobile");
    // } else if (
    //   userIdentifier.length == 14 &&
    //   /^[6-9]\d{9}$/.test(userIdentifier.substring(0, 10))
    // ) {
    //   type = "MobileAadhar";
    //   res = await this.getUserData(userIdentifier, "MobileAadhar");
    // } else if (userIdentifier.length == 12 && /^\d+$/.test(userIdentifier)) {
    //   type = "Aadhar";
    //   res = await this.getUserData(userIdentifier, "Aadhar");
    // } else if (userIdentifier.length == 11) {
    //   type = "Ben_id";
    //   res = await this.getUserData(userIdentifier, "Ben_id");
    // } else {
    //   return Promise.reject(
    //     new Error(
    //       "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number"
    //     )
    //   );
    // }

    // Always use Ben_id
    res = await this.getUserData(userIdentifier, "Ben_id");

    if (res.d.output.Message == "Unable to get user details") {
      // Instead of throwing an error, return a formatted error message
      return `=== PM KISAN BENEFICIARY STATUS ===\n\nError: Unable to retrieve beneficiary details. Please check your registration number and try again.\n\n=== PAYMENT STATUS & ISSUES ===\n\nNo payment information available due to retrieval error.`;
    }

    let userDetails = this.AADHAAR_GREETING_MESSAGE(
      this.titleCase(res.d.output["BeneficiaryName"]),
      this.titleCase(res.d.output["FatherName"]),
      res.d.output["DOB"],
      res.d.output["Address"],
      res.d.output["DateOfRegistration"],
      res.d.output["LatestInstallmentPaid"],
      res.d.output["Reg_No"],
      this.titleCase(res.d.output["StateName"]),
      this.titleCase(res.d.output["DistrictName"]),
      this.titleCase(res.d.output["SubDistrictName"]),
      this.titleCase(res.d.output["VillageName"]),
      res.d.output["eKYC_Status"]
    );

    this.logger.log("ChatbotBeneficiaryStatus");
    this.logger.log("using...", userIdentifier, type);
    let userErrors = [];

    try {
      var token = getUniqueKey();
      let requestData = `{\"Types\":\"${type}\",\"Values\":\"${userIdentifier}\",\"Token\":\"${process.env.PM_KISSAN_TOKEN}\"}`;

      let encrypted_text = await encrypt(requestData, token);
      let data = {
        "EncryptedRequest": `${encrypted_text}@${token}`
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.PM_KISAN_BASE_URL}/ChatbotBeneficiaryStatus`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      this.logger.log("In fetchUserData:", JSON.stringify(config));
      let errors: any = await axios.request(config);
      errors = await errors.data;
      this.logger.log("related issues", JSON.stringify(errors));

      let decryptedData: any = await decryptRequest(
        errors.d.output,
        token
      );

      // Parse the decrypted data to get the actual API response
      try {
        errors = JSON.parse(decryptedData);
        this.logger.log("Decrypted API response:", JSON.stringify(errors));
      } catch (parseError) {
        this.logger.error("Error parsing decrypted data:", parseError);
        // Fallback to original response if parsing fails
        errors = {
          "Rsponce": "False",
          "Message": "Error parsing API response"
        };
      }

      this.logger.log("Response from FetchUserdata: ", JSON.stringify(errors));

      if (errors.Rsponce == "True") {
        const queryType = typeof context.queryType === 'object'
          ? context.queryType.class
          : context.queryType;

        Object.entries(errors).forEach(([key, value]) => {
          if (key != "Rsponce" && key != "Message") {
            if (
              value &&
              PMKissanProtalErrors[`${value}`] &&
              PMKissanProtalErrors[`${value}`]["types"].indexOf(
                queryType
              ) != -1
            ) {
              this.logger.log(`ERRORVALUE: ${key} ${value}`);
              userErrors.push(
                PMKissanProtalErrors[`${value}`]["text"].replace(
                  "{{farmer_name}}",
                  this.titleCase(res.d.output["BeneficiaryName"])
                )
              );
            }
          }
        });
      }

      if (!userErrors.length) {
        userErrors.push(
          PMKissanProtalErrors["No Errors"]["text"]
            .replace(
              "{{farmer_name}}",
              this.titleCase(res.d.output["BeneficiaryName"])
            )
            .replace(
              "{{latest_installment_paid}}",
              res.d.output["LatestInstallmentPaid"]
            )
            .replace(
              "{{Reg_Date (DD-MM-YYYY)}}",
              format(new Date(res.d.output["DateOfRegistration"]), "dd-MM-yyyy")
            )
        );
      }
    } catch (error) {
      this.logger.error("ChatbotBeneficiaryStatus error", error);
    }

    return `=== PM KISAN BENEFICIARY STATUS ===\n\n${userDetails}\n\n=== PAYMENT STATUS & ISSUES ===\n\n${userErrors.join("\n")}`;
  }
}
