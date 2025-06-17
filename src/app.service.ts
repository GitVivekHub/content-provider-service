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

// getting course data
import * as fs from "fs";
import { HasuraService } from "./services/hasura/hasura.service";
import { AuthService } from "./auth/auth.service";
import axios from "axios";
const file = fs.readFileSync("./course.json", "utf8");
const courseData = JSON.parse(file);

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly hasuraService: HasuraService,
    private readonly authService: AuthService
  ) { }

  private nameSpace = process.env.HASURA_NAMESPACE;
  private base_url = process.env.BASE_URL;
  private namespace = process.env.NAMESPACE;

  private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();
  private readonly OTP_VALIDITY_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  private tempOTPStore = {
    otp: null,
    identifier: null,
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
        filters.push(`usecase: {_eq: "${categoryCode}"}`);
      }

      // Add scheme code filter if it's not empty
      if (schemeCode && schemeCode.trim() !== "") {
        filters.push(`scheme_id: {_eq: "${schemeCode}"}`);
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

  // async searchForIntentQuery(body) {
  //   let query =
  //     body?.message?.intent?.item?.descriptor?.name || "farming practices";

  //   try {
  //     const response = await axios.post(
  //       "http://3.6.146.174:8882/indexes/oan-index/search",
  //       {
  //         q: query,
  //         limit: 5,
  //         filter: "type:document",
  //         searchMethod: "HYBRID",
  //         hybridParameters: {
  //           retrievalMethod: "disjunction",
  //           rankingMethod: "rrf",
  //           alpha: 0.5,
  //           rrfK: 60,
  //         },
  //       }
  //     );

  //     body.context.action = "on_search";

  //     const mappedData = this.mapVectorDbData(body?.context, response.data);

  //     return mappedData;
  //   } catch (error) {
  //     console.error("Error making Axios request:", error.message);
  //     throw new Error("Failed to fetch data from the search endpoint");
  //   }
  // }

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

  async sendOTP(identifier: string, type: string = "OrderId"): Promise<any> {
    try {
      // Generate a 4-digit OTP
      const otp = String(Math.floor(1000 + Math.random() * 9000));

      // Store OTP temporarily with current timestamp
      this.tempOTPStore = {
        otp,
        identifier,
        timestamp: Date.now(),
      };

      // Log the OTP to console with a visual indicator
      console.log(
        "\x1b[32m%s\x1b[0m",
        `🔐 OTP for ${type} ${identifier}: ${otp}`
      ); // Green colored output
      console.log(
        "OTP_GENERATION",
        `Generated OTP for ${type} ${identifier}: ${otp}`
      );
      console.log("OTP will expire in 5 minutes");

      return {
        status: "OK",
        d: {
          output: {
            status: "True",
            Message: "OTP sent successfully",
            Rsponce: "True",
          },
        },
      };
    } catch (error) {
      console.log("OTP_GENERATION", error);
      return {
        status: "NOT_OK",
        d: {
          output: {
            status: "False",
            Message: "Failed to generate OTP",
            Rsponce: "False",
          },
        },
      };
    }
  }

  private validateOTP(identifier: string, inputOtp: string): boolean {
    const storedData = this.tempOTPStore;

    if (!storedData || !storedData.otp) {
      console.log("No OTP found for validation");
      return false;
    }

    // Calculate time elapsed since OTP generation
    const timeElapsed = Date.now() - storedData.timestamp;
    const isExpired = timeElapsed > this.OTP_EXPIRY_TIME;

    if (isExpired) {
      console.log(`OTP expired. Time elapsed: ${timeElapsed / 1000} seconds`);
      // Clear expired OTP
      this.tempOTPStore = {
        otp: null,
        identifier: null,
        timestamp: null,
      };
      return false;
    }

    const isValid =
      storedData.identifier === identifier && storedData.otp === inputOtp;
    console.log(
      `OTP validation result: ${isValid}, Time remaining: ${(this.OTP_EXPIRY_TIME - timeElapsed) / 1000
      } seconds`
    );

    if (isValid) {
      // Clear OTP after successful validation
      this.tempOTPStore = {
        otp: null,
        identifier: null,
        timestamp: null,
      };
    }

    return isValid;
  }

  async handleStatus(body: any) {
    try {
      // Create response context

      // Get the order ID
      const orderId = body.message?.order_id;

      if (!orderId) {
        return {
          context: {...body.context, action: "on_status", timestamp: new Date().toISOString(),ttl: "PT10M"},
          message: {
            order: {
              id: "error",
              tags: [
                {
                  display: true,
                  descriptor: {
                    name: "Error",
                    code: "missing_order_id",
                    short_desc: "Please provide a valid order ID",
                  },
                },
              ],
            },
          },
        };
      }

      // Check if this is an OTP validation request (second status call)
      const isOtpValidation = /^\d{4}$/.test(orderId);

      if (isOtpValidation) {
        try {
          // Validate the OTP
          const storedData = this.tempOTPStore;

          // Log validation attempt
          console.log("Validating OTP:", {
            inputOTP: orderId,
            storedOTP: storedData?.otp,
            storedIdentifier: storedData?.identifier,
            currentTimestamp: new Date().toISOString(),
            storedTimestamp: storedData?.timestamp
              ? new Date(storedData.timestamp).toISOString()
              : null,
          });

          const isValid =
            storedData &&
            storedData.otp === orderId &&
            Date.now() - storedData.timestamp < this.OTP_EXPIRY_TIME;

          if (!isValid) {
            return {
              context: {...body.context, action: "on_status", timestamp: new Date().toISOString(),ttl: "PT10M"},
              message: {
                order: {
                  id: orderId,
                  tags: [
                    {
                      display: false,
                      descriptor: {
                        name: "Error",
                        code: "invalid_otp",
                        short_desc: "Invalid or expired OTP. Please try again.",
                      },
                    },
                  ],
                },
              },
            };
          }

          // Clear OTP after successful validation
          this.tempOTPStore = {
            otp: null,
            identifier: null,
            timestamp: null,
          };

          // Return success response with scheme status
          return {
            context: {...body.context, action: "on_status", timestamp: new Date().toISOString(),ttl: "PT10M"},
            message: {
              order: {
                id: orderId,
                provider: {
                  id: "PM KISAAn",
                  descriptor: {
                    name: "PM KISAN",
                    short_desc: "Pradhan Mantri Kisan Samman Nidhi",
                  },
                },
                items: [
                  {
                    id: "SchemeId",
                    descriptor: {
                      name: "PM KISAN Scheme",
                      short_desc: "Direct Benefit Transfer Scheme",
                    },
                  },
                ],
                fulfillments: [
                  {
                    customer: {
                      person: {
                        name: "Test Farmer",
                      },
                      contact: {
                        phone: "XXXXXXXXXX",
                      },
                    },
                    state: {
                      descriptor: {
                        name: "Scheme Status",
                        code: "scheme-status",
                        short_desc: "Pending Sanction",
                        long_desc: "Your application is under process",
                        additional_desc: {
                          url: "",
                          content_type: "text/plain",
                        },
                      },
                      updated_at: new Date().toISOString(),
                      updated_by: "system",
                    },
                  },
                ],
              },
            },
          };
        } catch (error) {
          console.log("OTP_VALIDATION", error);
          return {
            context: {...body.context, action: "on_status", timestamp: new Date().toISOString(),ttl: "PT10M"},
            message: {
              order: {
                id: orderId,
                tags: [
                  {
                    display: true,
                    descriptor: {
                      name: "Error",
                      code: "otp_validation_failed",
                      short_desc: "Failed to validate OTP. Please try again.",
                    },
                  },
                ],
              },
            },
          };
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message, {
        cause: err,
      });
    }
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
        filters.push(`usecase: {_eq: "${categoryCode}"}`);
      }

      // Add scheme code filter if it's not empty
      if (schemeCode && schemeCode.trim() !== "") {
        filters.push(`scheme_id: {_eq: "${schemeCode}"}`);
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
    // Extract phone number from the request
    const phoneNumber = body?.message?.order?.id;
    // Basic sanitation: check if phone number is a 10-digit string starting with 6-9
    const isValidPhone = /^[6-9]\d{9}$/.test(phoneNumber);
    if (!isValidPhone) {
      return {
        responses: [
          {
            context: body.context,
            message: {
              order: {
                id: phoneNumber,
                tags: [
                  {
                    display: true,
                    descriptor: {
                      name: "Error",
                      code: "invalid_mobile",
                      short_desc: "Please provide a valid 10-digit mobile number"
                    }
                  }
                ],
                type: "DEFAULT"
              }
            }
          }
        ]
      };
    }
    // Build the response object as per requirements
    const context = body.context || {};
    const now = new Date().toISOString();

    try {
      // Generate and store OTP
      const otpResponse = await this.sendOTP(phoneNumber); // Using mobile number as identifier

      if (otpResponse.status === "OK") {
        return {
          context: {...context, action: "on_init", timestamp: now},
          message: {
            order: {
              id: phoneNumber,
              tags: [
                {
                  display: true,
                  descriptor: {
                    name: "Otp Status",
                    code: "otp_status",
                    short_desc:
                      "Request for OTP is sent. Please enter the OTP when received and Submit",
                  },
                },
              ],
            },
          },
        };
      } else {
        return {
          context: {...context, action: "on_init", timestamp: now},
          message: {
            order: {
              id: phoneNumber,
              tags: [
                {
                  display: true,
                  descriptor: {
                    name: "Error",
                    code: "otp_error",
                    short_desc:
                      "Failed to generate OTP. Please try again later.",
                  },
                },
              ],
            },
          },
        };
      }
    } catch (error) {
      console.log("ORDER_STATUS", error);
      return {
        context: {...context, action: "on_init", timestamp: now},
        message: {
          order: {
            id: phoneNumber,
            tags: [
              {
                display: true,
                descriptor: {
                  name: "Error",
                  code: "processing_error",
                  short_desc:
                    "Failed to process status request. Please try again later.",
                },
              },
            ],
          },
        },
      };
    }
  }
}
