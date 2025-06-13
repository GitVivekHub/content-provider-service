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
                    : encodeURI('https://image/' + course.image),
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



export const IcarCatalogGenerator2 = (
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
            name: content.publisher ? content.publisher : "",
          }
        };

        return providerItem;
      }),

      locations: providerWise[provider].map((content: any) => {

        const LocationsItem = {
          id: "L1",
          state: {
            name: Array.isArray(content.state) && content.state.length > 0
              ? content.state.join(', ')
              : (content.state ? content.state : ""),
            code: ""
          }
        }
        return LocationsItem
      }
      ),



      items: providerWise[provider].map((content: any) => {
        const average = averageRating(content);

        const providerItem = {
          id: `${content.id}`,
          parent_item_id: `${content.id}` ? `${content.id}` : "",
          descriptor: {
            name: content.title ? content.title : "",
            content_id: content.content_id ? content.content_id : "",
            description: content.description ? content.description : "",
            icon: content.icon ? content.icon : "",
            publisher: content.publisher ? content.publisher : "",
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
                    : encodeURI('https://image/' + content.icon),
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
                name: "Content Info"
              },
              list: [
                {
                  descriptor: {
                    name: 'Crop',
                  },
                  value: content.crop || '',
                },
                {
                  descriptor: {
                    name: 'Language',
                  },
                  value: content.language || '',
                },
                {
                  descriptor: {
                    name: 'Branch',
                  },
                  value: content.branch || '',
                },
                {
                  descriptor: {
                    name: 'Publish Date',
                  },
                  value: content.publishDate || '',
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

export const IcarCatalogGenerator = (apiData: any, query: string) => {
  const courses: ReadonlyArray<{ node: any }> = apiData;
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
  catalog["descriptor"] = { name: `Catalog for ${query}` };
  // adding providers
  catalog["providers"] = Object.keys(providerWise).map((provider: string) => {
    const providerObj: components["schemas"]["Provider"] = {
      id: provider == "null" ? "2030" : provider,
      descriptor: {
        name: "Icar",
        //   images: [
        //     {
        //         "url": "https://agri_acad.example.org/logo.png"
        //     }
        // ],
        short_desc: "Icar Academic aggregator",
      },

      // categories: providerWise[provider].map((content: any) => {

      //   const providerItem = {
      //     id: `${content.id}`,
      //     parent_category_id: `${content.id}` || '',
      //     descriptor: {
      //       name: content.publisher,
      //     }
      //   };

      //   return providerItem;
      // }),
      items: providerWise[provider].map((content: any) => {
        const average = averageRating(content);

        const providerItem = {
          id: content.id == "null" ? "2030" : content.id?.toString(),
          descriptor: {
            name: content?.title ?? "",
            short_desc: content?.description?.slice(0, 30) + "...",
            long_desc: content?.description ?? "",
            media: [
              {
                mimetype: content.mimetype ? content.mimetype : "video/mp4",
                url:
                  encodeURI(content?.url?.trim()) == "undefined"
                    ? "https://icar.tekdinext.com/assets/school_logo-5f321ef5.png"
                    : encodeURI(content?.url?.trim()),
              },
            ],
            images: [
              {
                url:
                  encodeURI(content?.url?.trim()) == "undefined"
                    ? "https://icar.tekdinext.com/assets/school_logo-5f321ef5.png"
                    : encodeURI(content?.url?.trim()),
              },
            ],
          },
          //rating: averageRating(content) || 0,
          // price: {
          //   currency: 'INR',
          //   value: 0 + '', // map it to an actual response
          // },
          // category_id: content.primaryCategory || '',
          // recommended: content.featured ? true : false,
          // time: {
          //   label: 'Course Schedule',
          //   duration: `P${12}W`, // ISO 8601 duration format
          //   range: {
          //     start: '2023-07-23T18:30:00.000000Z',
          //     end: '2023-10-12T18:30:00.000000Z'
          //   },
          // },
          // // rating: averageRating(content) || '',
          // // rateable: true,
          // ...(isNaN(average) ? {} : { rating: average.toString(), rateable: true }),

          //rating: averageRating(content),
          // tags: [
          //   {
          //     descriptor: {
          //       name: "courseInfo"
          //     },
          //     list: [
          //       {
          //         descriptor: {
          //           name: 'credits',
          //         },
          //         value: content.credits || '',
          //       },
          //       {
          //         descriptor: {
          //           name: 'instructors',
          //         },
          //         value: '',
          //       },
          //       {
          //         descriptor: {
          //           name: 'offeringInstitue',
          //         },
          //         value: content.sourceOrganisation || '',
          //       },
          //       {
          //         descriptor: {
          //           name: 'url',
          //         },
          //         value: encodeURI(content.link || ''),
          //       },
          //       {
          //         descriptor: {
          //           name: 'enrollmentEndDate',
          //         },
          //         value: content.createdAt || '',
          //       },
          //     ],
          //   },
          // ],
        };
        if (averageRating(content)) {
          providerItem["rating"] = averageRating(content).toString();
        }
        return providerItem;
      }),
    };
    return providerObj;
  });

  return catalog;
};



export const averageRating = (
  data: any
) => {
  let sum = 0;
  const crr = data.ContentRatingRelationship
  if (crr.length) {
    crr.forEach(i => sum += i.ratingValue)
  }
  const average = sum / crr.length
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

export const flnCatalogGenerator = (
  apiData: any,
  query: string,
) => {
  console.log("apidata", apiData)
  console.log("query", query)
  const courses: ReadonlyArray<{ node: any }> =
    apiData;
  const providerWise = {};
  //let categories: any = new Set();

  courses.forEach((course: any, index) => {
    console.log("course 234", course)
    const item = course;
    const provider = course.user_id;
    // creating the provider wise map
    if (providerWise[provider]) {
      providerWise[provider].push(item);
    } else {
      providerWise[provider] = [item];
    }
  });

  //categories = [];

  const catalog = {};
  if (query) {
    catalog['descriptor'] = { name: `Catalog for ${query}` };
  } else {
    catalog['descriptor'] = {}
  }


  // adding providers
  console.log("providerWise", providerWise)
  catalog['providers'] = Object.keys(providerWise).map((provider: string) => {
    // console.log("--------> ",providerWise[provider])
    const providerObj: components['schemas']['Provider'] = {
      id: provider,
      descriptor: {
        name: providerWise[provider][0].flncontentProviderRelationshp?.organization ? providerWise[provider][0].flncontentProviderRelationshp.organization : "",
        short_desc: providerWise[provider][0].flncontentProviderRelationshp.description ? providerWise[provider][0].flncontentProviderRelationshp.description : "",
        images: getMediaArray(providerWise[provider][0].flncontentProviderRelationshp.image)
      },
      categories: providerWise[provider][0].flncontentProviderRelationshp.categories ? providerWise[provider][0].flncontentProviderRelationshp.categories : [],
      fulfillments: providerWise[provider][0].flncontentProviderRelationshp.fulfillments ? providerWise[provider][0].flncontentProviderRelationshp?.fulfillments : [],
      // categories: providerWise[provider].map((course: any) => {
      //   const providerItem = {
      //     id: course?.category ? course.category : '',
      //     descriptor: {
      //       code: course?.category ? course.category : '',
      //       name: course?.category ? course.category : '',
      //     }
      //   };
      //   return providerItem;
      // }),

      // categories: Array.from(new Set(providerWise[provider].map((course) => course.category)))
      // .map((categoryId) => {
      //     const course = providerWise[provider].find((course) => course.category === categoryId);
      //     return {
      //         id: course?.category || '',
      //         descriptor: {
      //             code: course?.category || '',
      //             name: course?.category || '',
      //         }
      //     };
      // }),

      // fulfillments: [
      //   {
      //     "id": "1",
      //     "type": "ONLINE",
      //     "tracking": false
      //   },
      //   {
      //     "id": "2",
      //     "type": "IN-PERSON",
      //     "tracking": false
      //   },
      //   {
      //     "id": "3",
      //     "type": "HYBRID",
      //     "tracking": false
      //   }
      // ],
      items: providerWise[provider].map((course: any) => {
        const average = averageRating(course);

        const providerItem = {
          id: `${course.id}`,
          quantity: {
            maximum: {
              count: 1
            }
          },
          descriptor: {
            name: course.title,
            short_desc: course.description ? course.description : '',
            long_desc: course.description ? course.description : '',
            images: getMediaArray(course.image),
            media: getMediaArray(course.image)
          },
          creator: {
            descriptor: {
              name: course.author ? course.author : '',
              // short_desc: '',
              // long_desc: '',
              // images: [],
            }
          },
          price: {
            currency: 'INR',
            value: 0 + '', // map it to an actual response
          },
          // category_id: course.primaryCategory || '',
          // recommended: course.featured ? true : false,
          // code: course.code ? course.code : '123',
          // competency: course.competency,
          // contentType: course.contentType,
          // domain: course.domain,
          // goal: course.goal,
          // language: course.language,
          // link: course.link,
          // sourceOrganisation: course.sourceOrganisation,
          // themes: course.themes,
          // title: course.title,
          // minAge: course.minAge,
          // maxAge: course.maxAge,
          // author: course.author,
          // curricularGoals: course.curricularGoals,
          // learningOutcomes: course.learningOutcomes,
          // category: course.category,
          // persona: course.persona,
          // license: course.license,
          // conditions: course.conditions,
          // createdAt: course.createdAt,
          // updatedAt: course.updatedAt,
          // urlType: course.urlType,
          // time: {
          //   range: {
          //     start: '2023-07-23T18:30:00.000000Z',
          //     end: '2023-10-12T18:30:00.000000Z'
          //   },
          // },
          category_ids: course?.category ? course.category : [],
          fulfillment_ids: course?.fulfillments ? course.fulfillments : [],
          rating: isNaN(average) ? average.toString() : "0",
          rateable: true,
          "add-ons": [{
            //id: "",
            descriptor: {
              // name: "",
              // short_desc: '',
              // long_desc: '',
              media: [
                {
                  mimetype: course.mimeType || "",
                  url: course.link || ""
                }
              ],
            }
          }],
          tags: [
            {
              display: true,
              descriptor: {
                name: "courseInfo",
                code: "courseInfo",
              },
              list: [
                {
                  display: true,
                  descriptor: {
                    code: "sourceOrganisation",
                    name: 'Source Organisation',
                  },
                  value: course.sourceOrganisation || 'sourceOrganisation',
                },
                // {
                //   display: true,
                //   descriptor: {
                //     code: 'url',
                //     name: 'url',
                //   },
                //   value: encodeURI(course.url || ''),
                // },
                // {
                //   display: true,
                //   descriptor: {
                //     code: 'enrollmentEndDate',
                //     name: 'EnrollmentEndDate',
                //   },
                //   value: course.createdAt || '',
                // },
                {
                  display: true,
                  descriptor: {
                    code: 'competency',
                    name: 'Competency',
                  },
                  value: course.competency || 'competency',
                },
                // {
                //   display: true,
                //   descriptor: {
                //     code: 'contentType',
                //     name: 'Content Type',
                //   },
                //   value: course.contentType || 'contentType',
                // },
                {
                  display: true,
                  descriptor: {
                    code: 'domain',
                    name: 'Domain',
                  },
                  value: course.domain || 'domain',
                },
                {
                  display: true,
                  descriptor: {
                    code: 'curriculargoal',
                    name: 'Curricular Goal',
                  },
                  value: course.goal || 'curriculargoal',
                },
                {
                  display: true,
                  descriptor: {
                    code: 'language',
                    name: 'Language',
                  },
                  value: course.language || 'language',
                },
                // {
                //   display: true,
                //   descriptor: {
                //     code: 'themes',
                //     name: 'Themes',
                //   },
                //   value: course.themes || 'themes',
                // },
                {
                  display: true,
                  descriptor: {
                    code: 'minAge',
                    name: 'minAge',
                  },
                  value: `${course.minAge}` || 'minAge',
                },
                {
                  display: true,
                  descriptor: {
                    code: 'maxAge',
                    name: 'maxAge',
                  },
                  value: `${course.maxAge}` || 'maxAge',
                },
                // {
                //   display: true,
                //   descriptor: {
                //     code: 'author',
                //     name: 'author',
                //   },
                //   value: course.author || 'author',
                // },
                // {
                //   display: true,
                //   descriptor: {
                //     code: 'curricularGoals',
                //     name: 'curricularGoals',
                //   },
                //   value: course.curricularGoals || 'curricularGoals',
                // },
                {
                  display: true,
                  descriptor: {
                    code: 'learningOutcomes',
                    name: 'learningOutcomes',
                  },
                  value: course.learningOutcomes || 'learningOutcomes',
                },
                // {
                //   display: true,
                //   descriptor: {
                //     code: 'persona',
                //     name: 'persona',
                //   },
                //   value: course.persona || 'persona',
                // },
                // {
                //   display: true,
                //   descriptor: {
                //     code: 'license',
                //     name: 'license',
                //   },
                //   value: course.license || 'license',
                // },
                {
                  display: true,
                  descriptor: {
                    code: 'createdon',
                    name: 'createdon',
                  },
                  value: course.createdAt || 'createdAt',
                },
                {
                  display: true,
                  descriptor: {
                    code: 'lastupdatedon',
                    name: 'lastupdatedon',
                  },
                  value: course.updatedAt || 'updatedAt',
                },
              ],
            },
          ]
        };
        return providerItem;
      }),
    };
    return providerObj;
  });

  return catalog;
};

const getMediaArray = (url: string | undefined) => {
  if (url) {
    const formattedUrl = isValidUrl(url)
    if (formattedUrl) {
      return [
        {
          url: url,
        },
      ]
    }
    else {
      return [
        {
          url: encodeURI('https://image/' + url)
        }
      ]
    }
  }
  return [];
};

const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
};

export const PmKisanIcarGenerator = (apiData: any, query: string) => {
  const schemes: ReadonlyArray<{ node: any }> = apiData;
  const providerWise: Record<string, any[]> = {};
  const defaultProvider = 'SchemeFinder';

  // Create provider-wise mapping
  schemes.forEach((scheme: any) => {
    const provider = defaultProvider;
    if (providerWise[provider]) {
      providerWise[provider].push(scheme);
    } else {
      providerWise[provider] = [scheme];
    }
  });

  // Catalog descriptor
  const catalog: any = {
    descriptor: query ? { name: `Catalog for ${query}` } : {},
    providers: Object.keys(providerWise).map((provider: string) => {
      return {
        descriptor: {
          name: 'SchemeFinder',
          short_desc: 'A Scheme Discovery and Application Service helps users discover',
        },
        items: providerWise[provider].map((item: any) => {
          return {
            id: item.content_id || '',
            descriptor: {
              name: item?.title ?? '',
              short_desc: (item?.description || '').slice(0, 30) + '...',
              long_desc: item?.description ?? '',
            },
            tags: [
              {
                display: true,
                descriptor: {
                  code: 'scheme-details',
                  name: 'Scheme Details',
                },
                list: [
                  {
                    descriptor: { code: 'title', name: 'Title' },
                    value: item.title || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'agri_domain', name: 'Agricultural Domain' },
                    value: item.agri_domain || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'scope', name: 'Scope' },
                    value: item.scope || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'scheme_id', name: 'Scheme ID' },
                    value: item.scheme_id || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'scheme-intro', name: 'Scheme Introduction' },
                    value: item.scheme_intro?.summary || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'scheme-benefits', name: 'Scheme Benefits' },
                    value: item.scheme_benefits?.summary || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'scheme-eligibility', name: 'Scheme Eligibility' },
                    value: item.scheme_eligibility?.summary || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'scheme-support', name: 'Scheme Support' },
                    value: item.scheme_support?.summary || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'scheme-misc', name: 'Additional Information' },
                    value: item.scheme_misc?.summary || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'scheme-application', name: 'Scheme Application' },
                    value: item.scheme_application?.summary || '',
                    display: true,
                  },
                  {
                    descriptor: { code: 'faq-url', name: 'FAQ URL' },
                    value: item.faq_url || '',
                    display: true,
                  },
                ],
              },
            ],
          };
        }),
      };
    }),
  };

  return catalog;
};

















