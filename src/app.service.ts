import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { components } from 'types/schema';
import { SwayamApiResponse } from 'types/SwayamApiResponse';
import { selectItemMapper, scholarshipCatalogGenerator, IcarCatalogGenerator } from 'utils/generator';

// getting course data
import * as fs from 'fs';
import { HasuraService } from './services/hasura/hasura.service';
const file = fs.readFileSync('./course.json', 'utf8');
const courseData = JSON.parse(file);

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService, private readonly hasuraService: HasuraService) { }

  private nameSpace = process.env.HASURA_NAMESPACE;


  getHello(): string {
    return 'Icar-network Backend is running!!';
  }

  async handleSearch(body: {
    context: components['schemas']['Context'];
    message: { intent: components['schemas']['Intent'] };
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
    const domain = flattenedTags?.domain !== '' ? flattenedTags?.domain : null;
    const theme = flattenedTags?.theme !== '' ? flattenedTags?.theme : null;
    const goal = flattenedTags?.goal !== '' ? flattenedTags?.goal : null;
    const competency = flattenedTags?.competency !== '' ? flattenedTags?.competency : null;
    const language = flattenedTags?.language !== '' ? flattenedTags?.language : null;
    const contentType = flattenedTags?.contentType !== '' ? flattenedTags?.contentType : null;

    let obj = {}
    if (flattenedTags.domain) {
      obj['domain'] = flattenedTags.domain
    }
    if (flattenedTags?.theme) {
      obj['theme'] = flattenedTags?.theme
    }
    if (flattenedTags?.goal) {
      obj['goal'] = flattenedTags?.goal
    }
    if (flattenedTags?.competency) {
      obj['competency'] = flattenedTags?.competency
    }
    if (flattenedTags?.language) {
      obj['language'] = flattenedTags?.language
    }
    if (flattenedTags?.contentType) {
      obj['contentType'] = flattenedTags?.contentType
    }


    try {
      const resp = await this.hasuraService.findIcarContent(query)
      const icarResponse: any = resp.data.icar_.Content;
      console.log("icarResponse", icarResponse.length)
      const catalog = IcarCatalogGenerator(icarResponse, query);
      body.context.action = 'on_search'
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

    const courseData = await this.hasuraService.findIcarContentById(itemId)
    console.log("contentData", courseData.data.icar_.Content)

    delete courseData.data.icar_.Content[0].url

    //return

    //const itemId = selectDto.message.order.items[0].id;
    //const order: any = selectItemMapper(courseData[itemId]);

    const order: any = selectItemMapper(courseData.data.icar_.Content[0]);



    // order?.items.map((item) => {
    //   item['descriptor']['long_desc'] = longDes;
    //   item['tags'] = [...item['tags'],]
    // });

    selectDto.message.order = order;
    selectDto.context.action = 'on_select';
    const resp = selectDto;
    return resp;
  }

  async handleInit(selectDto: any) {
    const itemId = selectDto.message.order.items[0].id;

    const courseData = await this.hasuraService.findIcarContentById(itemId)
    console.log("contentData", courseData.data.icar_.Content)

    delete courseData.data.icar_.Content[0].url

    //return

    //const itemId = selectDto.message.order.items[0].id;
    //const order: any = selectItemMapper(courseData[itemId]);

    const order: any = selectItemMapper(courseData.data.icar_.Content[0]);


    // fine tune the order here
    
    // const itemId = selectDto.message.order.items[0].id;
    // const order: any = selectItemMapper(courseData[itemId]);
    order['fulfillments'] = selectDto.message.order.fulfillments;
    selectDto.message.order = order;
    selectDto.context.action = 'on_init';
    const resp = selectDto;
    return resp;
  }

  async handleConfirm(confirmDto: any) {
    // fine tune the order here
    const itemId = confirmDto.message.order.items[0].id;

    const courseData = await this.hasuraService.findIcarContentById(itemId)
    const order: any = selectItemMapper(courseData.data.icar_.Content[0]);
    order['fulfillments'] = confirmDto.message.order.fulfillments;
    order['id'] = confirmDto.context.transaction_id + Date.now();
    order['state'] = 'COMPLETE';
    order['type'] = 'DEFAULT';
    order['created_at'] = new Date(Date.now());
    order['updated_at'] = new Date(Date.now());
    confirmDto.context.action = 'on_confirm'
    confirmDto.message.order = order;

    return confirmDto
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
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': process.env.SECRET,
            },
          },
        )
        .pipe(map((item) => item.data)),
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
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': process.env.SECRET,
              },
            },
          )
          .pipe(map((item) => item.data)),
      );
      console.log('res in test api update: ', res.data);

      confirmDto.message.order = order;
      confirmDto.context.action = 'on_confirm';
      console.log('action: ', confirmDto.context.action);
      return confirmDto;
    } catch (err) {
      console.log('err: ', err);
      throw new InternalServerErrorException(err);
    }
  }

  async handleConfirm2(confirmDto: any) {
    // fine tune the order here
    const itemId = confirmDto.message.order.items[0].id;
    const order: any = selectItemMapper(courseData[itemId]);
    order['fulfillments'] = confirmDto.message.order.fulfillments;
    order['id'] = confirmDto.context.transaction_id + Date.now();
    order['state'] = 'COMPLETE';
    order['type'] = 'DEFAULT';
    order['created_at'] = new Date(Date.now());
    order['updated_at'] = new Date(Date.now());
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
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': process.env.SECRET,
            },
          },
        )
        .pipe(map((item) => item.data)),
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
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': process.env.SECRET,
              },
            },
          )
          .pipe(map((item) => item.data)),
      );
      console.log('res in test api update: ', res.data);

      confirmDto.message.order = order;
      confirmDto.context.action = 'on_confirm';
      console.log('action: ', confirmDto.context.action);
      return confirmDto;
    } catch (err) {
      console.log('err: ', err);
      throw new InternalServerErrorException(err);
    }
  }

  async handleRating(ratingDto: any){

    const itemId = ratingDto.message.items[0].id;
    const rating = ratingDto.message.items[0].rating;
    // const feedback = ratingDto.message.items[0].feedback; 

    const courseData = await this.hasuraService.rateIcarContentById(itemId,rating)
    ratingDto.context.action = 'on_rating';
    const resp = ratingDto;
    return resp;

  }

}
