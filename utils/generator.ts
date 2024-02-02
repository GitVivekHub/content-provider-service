import { components } from 'types/schema';
import { SwayamApiResponse } from 'types/SwayamApiResponse';
import { SwayamCourse } from 'types/SwayamCourese';


export const scholarshipCatalogGenerator = (
  apiData: any,
  query: string,
) => {
  console.log("apidata 370", apiData)
  const courses: ReadonlyArray<{ node: any }> =
    apiData;
  const providerWise = {};
  let categories: any = new Set();

  courses.forEach((course, index) => {
    const item = course;
    const provider = 'fln';
    // creating the provider wise map
    if (providerWise[provider]) {
      providerWise[provider].push(item);
    } else {
      providerWise[provider] = [item];
    }
  });

  categories = [];

  const catalog = {};
  catalog['descriptor'] = { name: `Catalog for ${query}` };

  // adding providers
  catalog['providers'] = Object.keys(providerWise).map((provider: string) => {
    const providerObj: components['schemas']['Provider'] = {
      id: provider,
      descriptor: {
        name: provider,
      },
      categories: providerWise[provider].map((course: any) => {
        const providerItem = {
          id: course.category,
          parent_category_id: course.category || '',
          descriptor: {
            name: course.category,
          }
        };
        return providerItem;
      }),
      items: providerWise[provider].map((course: any) => {
        const providerItem = {
          id: `${course.id}`,
          parent_item_id: '',
          descriptor: {
            domain: course.domain,
            name: course.name ? course.name : '',
            code: course.code ? course.code : '123',
            description: course.description,
            provider: course.provider,
            creator: course.creator,
            category: course.category,
            applicationDeadline: course.applicationDeadline,
            amount: course.amount,
            duration: course.duration,
            eligibilityCriteria: course.eligibilityCriteria,
            applicationProcessing: course.applicationProcessing,
            selectionCriteria: course.selectionCriteria,
            noOfRecipients: course.noOfRecipients,
            termsAndConditions: course.termsAndConditions,
            curricularGoals: course.curricularGoals,
            learningOutcomes: course.learningOutcomes,
            additionalResources: course.additionalResources,
            applicationSubmissionDate: course.applicationSubmissionDate,
            contactInformation: course.contactInformation,
            status: course.status,
            keywords: course.keywords,
            createdAt: course.createdAt,

            images: [
              {
                url:
                  course.image == null
                    ? encodeURI(
                      'https://thumbs.dreamstime.com/b/set-colored-pencils-placed-random-order-16759556.jpg'
                    )
                    : encodeURI('https://image/'+course.image),
              },
            ],
          },
          price: {
            currency: 'INR',
            value: 0 + '', // map it to an actual response
          },
          category_id: course.primaryCategory || '',
          recommended: course.featured ? true : false,
          time: {
            label: 'Course Schedule',
            duration: `P${12}W`, // ISO 8601 duration format
            range: {
              start: '2023-07-23T18:30:00.000000Z',
              end: '2023-10-12T18:30:00.000000Z'
            },
          },
          rating: Math.floor(Math.random() * 6).toString(), // map it to an actual response
          tags: [
            {
              descriptor: {
                name: "courseInfo"
              },
              list: [
                {
                  descriptor: {
                    name: 'credits',
                  },
                  value: course.credits || '',
                },
                {
                  descriptor: {
                    name: 'instructors',
                  },
                  value: '',
                },
                {
                  descriptor: {
                    name: 'offeringInstitue',
                  },
                  value: course.sourceOrganisation || '',
                },
                {
                  descriptor: {
                    name: 'url',
                  },
                  value: encodeURI(course.link || ''),
                },
                {
                  descriptor: {
                    name: 'enrollmentEndDate',
                  },
                  value: course.createdAt || '',
                },
              ],
            },
          ],
          rateable: false,
        };
        return providerItem;
      }),
    };
    return providerObj;
  });

  return catalog;
};

export const generateOrder = (
  action: string,
  message_id: string,
  item: any,
  providerId: string,
  providerDescriptor: any,
  categoryId: string,
) => {
  const order = {
    id: message_id + Date.now(),
    ref_order_ids: [],
    state: action === 'confirm' ? 'COMPLETE' : 'ACTIVE',
    type: 'DRAFT',
    provider: {
      id: providerId,
      descriptor: providerDescriptor,
      category_id: categoryId,
    },
    items: [item],
    fulfillments: {
      id: '',
      type: 'ONLINE',
      tracking: false,
      customer: {},
      agent: {},
      contact: {},
    },
    created_at: new Date(Date.now()),
    updated_at: new Date(Date.now()),
    tags: [
      {
        display: true,
        name: 'order tags',
        list: [
          {
            name: 'tag_name',
            value: 'value of the key in name',
            display: true,
          },
        ],
      },
    ],
  };

  return order;
};

export const selectItemMapper = (item: any) => {
  console.log("item 563", item)
  const selectItemOrder = {
    provider: {
      id: `${item.user_id}`,
      descriptor: {
        name: item.publisher,
      },
      category_id: item.publisher,
    },
    items: [
      {
        id: `${item.id}`,
        parent_item_id: `${item.id}`,
        descriptor: {
          name: item.title,
          long_desc: item.description,
          // images: [
          //   {
          //     "url": "https://infyspringboard.onwingspan.com/web/assets/images/infosysheadstart/everyday-conversational-english.png"
          //   }
          // ],
          media: [
            {
              "url": item.url
            }
          ]
        },
        price: {
          currency: 'INR',
          value: '0',
        },
        category_id: item.crop,
        recommended: false,
        // time: {
        //   label: 'Course Schedule',
        //   duration: `P${item.weeks}W` || '', // ISO 8601 duration format
        //   range: {
        //     start: item?.startDate?.toString()?  item.startDate.toString() : '',
        //     end: item?.endDate?.toString()? item.endDate.toString() : '',
        //   },
        // },
        rating: Math.floor(Math.random() * 6).toString(),
        tags: [
          {
            name: 'courseDetails',
            list: [
              {
                name: 'title',
                value: item.title ?? '',
              },
              {
                name: 'description',
                value: item.description ?? '',
              },
              {
                name: 'url',
                value: item.url ?? '',
              },
              {
                name: 'language',
                value: item.language ?? '',
              },
              {
                name: 'fileType',
                value: item.fileType ?? '',
              },
              {
                name: 'contentType',
                value: item.contentType ?? '',
              },
              {
                name: 'monthOrSeason',
                value: item.monthOrSeason ?? '',
              },
              {
                name: 'publishDate',
                value: item.publishDate ?? '',
              },
              {
                name: 'expiryDate',
                value: item.expiryDate ?? '',
              },
              // {
              //   name: 'state',
              //   value: item.state ?? '',
              // },
              // {
              //   name: 'region',
              //   value: item.region ?? '',
              // },
              {
                name: 'target_users',
                value: item.target_users ?? '',
              },
              {
                name: 'branch',
                value: item.branch ?? '',
              }
            ],
          },
          {
            name: 'eligibility',
            list: [
              {
                name: 'criterion1',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'criterion2',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'criterion3',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'criterion4',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
            ],
          },
          {
            name: 'courseHighlights',
            list: [
              {
                name: 'highlight1',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'highlight2',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'highlight3',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'highlight4',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
            ],
          },
          {
            name: 'prerequisites',
            list: [
              {
                name: 'prerequisite1',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'prerequisite2',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'prerequisite3',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'prerequisite4',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
            ],
          },
        ],
        rateable: false,
      },
    ],
  };

  return selectItemOrder;
};



export const IcarCatalogGenerator = (
  apiData: any,
  query: string,
) => {
  const courses: ReadonlyArray<{ node: any }> =
    apiData;
  const providerWise = {};
  let categories: any = new Set();

  courses.forEach((course: any, index) => {
    const item = course;
    const provider = course.user_id;
    // creating the provider wise map
    if (providerWise[provider]) {
      providerWise[provider].push(item);
    } else {
      providerWise[provider] = [item];
    }
  });

  categories = [];

  const catalog = {};
  catalog['descriptor'] = { name: `Catalog for ${query}` };
  // adding providers
  catalog['providers'] = Object.keys(providerWise).map((provider: string) => {
    
    const providerObj: components['schemas']['Provider'] = {
      id: provider,
      descriptor: {
        name: 'Icar',
      },
      
      categories: providerWise[provider].map((content: any) => {

        const providerItem = {
          id: `${content.id}`,
          parent_category_id: `${content.id}` || '',
          descriptor: {
            name: content.publisher,
          }
        };
        
        return providerItem;
      }),
      items: providerWise[provider].map((content: any) => {
        const average = averageRating(content);

        const providerItem = {
          id: `${content.id}`,
          parent_item_id: `${content.id}`,
          descriptor: {
            name: content.title,
            content_id: content.content_id ,
            description: content.description ,
            icon: content.icon,
            publisher: content.publisher,
            // domain: course.domain,
            // crop: content.crop,
            // language: content.language,
            // url: content.url,
            // branch: content.branch,
            // fileType: content.fileType,
            // title: content.title,
            // contentType: content.contentType,
            // monthOrSeason: content.monthOrSeason,
            // user_id: content.user_id,
            // publishDate: content.publishDate,
            // expiryDate: content.expiryDate,
            // district: content.district,
            // state: content.state,
            // region: content.region,
            // target_users:content.target_users,


            images: [
              {
                url:
                content.image == null
                    ? encodeURI(
                      'https://thumbs.dreamstime.com/b/set-colored-pencils-placed-random-order-16759556.jpg'
                    )
                    : encodeURI('https://image/'+content.icon),
              },
            ],
          },
          price: {
            currency: 'INR',
            value: 0 + '', // map it to an actual response
          },
          category_id: content.primaryCategory || '',
          recommended: content.featured ? true : false,
          time: {
            label: 'Course Schedule',
            duration: `P${12}W`, // ISO 8601 duration format
            range: {
              start: '2023-07-23T18:30:00.000000Z',
              end: '2023-10-12T18:30:00.000000Z'
            },
          },
          // rating: averageRating(content) || '',
          // rateable: true,
          ...(isNaN(average) ? {} : { rating: average.toString(), rateable: true }),
          
          //rating: averageRating(content),
          tags: [
            {
              descriptor: {
                name: "courseInfo"
              },
              list: [
                {
                  descriptor: {
                    name: 'credits',
                  },
                  value: content.credits || '',
                },
                {
                  descriptor: {
                    name: 'instructors',
                  },
                  value: '',
                },
                {
                  descriptor: {
                    name: 'offeringInstitue',
                  },
                  value: content.sourceOrganisation || '',
                },
                {
                  descriptor: {
                    name: 'url',
                  },
                  value: encodeURI(content.link || ''),
                },
                {
                  descriptor: {
                    name: 'enrollmentEndDate',
                  },
                  value: content.createdAt || '',
                },
              ],
            },
          ],
        };
        return providerItem;
      }),
    };
    return providerObj;
  });

  return catalog;
}



export const averageRating = (
  data: any
) => {
  let sum = 0;
  const crr = data.ContentRatingRelationship
  if(crr.length) {
    crr.forEach(i => sum += i.ratingValue)
  }
  const average = sum/crr.length
  return average
}


export const feedback = (data: any) => {
  const result = {
    ratingValues: [],
    feedbacks: [],
  };

  const filteredData = data.ContentRatingRelationship
  .filter(item => item.feedback && item.feedback.trim() !== "null" && item.feedback.trim() !== "undefined");
  filteredData.sort((a, b) => b.id - a.id);


  const maxItems = Math.min(filteredData.length, 5);

  for (let i = 0; i < maxItems; i++) {
    const currentItem = filteredData[i];
    if (currentItem.ratingValue) {
      result.ratingValues.push(currentItem.ratingValue);
    }
    if (currentItem.feedback) {
      result.feedbacks.push(currentItem.feedback);
    }
  }

  return result;
};















