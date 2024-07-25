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
} from "utils/generator";
import { v4 as uuidv4 } from "uuid";

// getting course data
import * as fs from "fs";
import { HasuraService } from "./services/hasura/hasura.service";
import { AuthService } from "./auth/auth.service";
const file = fs.readFileSync("./course.json", "utf8");
const courseData = JSON.parse(file);

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly hasuraService: HasuraService,
    private readonly authService: AuthService
  ) {}

  private nameSpace = process.env.HASURA_NAMESPACE;
  private base_url = process.env.BASE_URL;
  private namespace = process.env.NAMESPACE;

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
      console.log("flnResponse", flnResponse)
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
      for (let item of icarResponse) {

        if (item.icon) {
          if (!this.isValidUrl(item.icon)) {
            item.icon = await this.hasuraService.getImageUrl(item.icon);
          }
        }

        // if (item.flncontentProviderRelationshp.image) {
        //   if (!this.isValidUrl(item.flncontentProviderRelationshp.image)) {
        //     item.flncontentProviderRelationshp.image = await this.hasuraService.getImageUrl(item.flncontentProviderRelationshp.image);
        //   }
        // }

      }

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
    const itemId = ratingDto.message.ratings.id;
    const rating = ratingDto.message.ratings.value;
    const feedback = ratingDto.message.ratings.feedback;

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
          url: `${this.base_url}/feedback/${id}`,
          mime_type: "text/html",
        },
        required: "false",
      },
    };
    const resp = ratingDto;
    return resp;
  }

  generateFeedbackUrl(): string {
    // Generate and return a feedback URL
    // For simplicity, you can use a static URL or generate a unique URL as needed
    return "https://example.com/feedback";
  }

  async handleSubmit(description, id) {
    try {
      const courseData = await this.hasuraService.SubmitFeedback(
        description,
        id
      );
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
  };
}
