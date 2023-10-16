import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { response } from 'express';
import { LoggerService } from 'src/services/logger/logger.service';


@Injectable()
export class HasuraService {
  private hasuraUrl = process.env.HASURA_URL;
  private adminSecretKey = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

  constructor(private readonly logger: LoggerService) { }

  async getProviderList() {
    const query = `query GetUser {
    User(where: {role: {_eq: "provider"}}) {
      id
      name
      email
      role
      approved
      enable
      reason
    }
  }`;
    try {
      const response = await this.queryDb(query);
      return response;
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin", error);
      throw new HttpException('Unable to Create Admin', HttpStatus.BAD_REQUEST);
    }
  }

  async getProviderInfoById(id) {
    const query = `query GetUser {
      Provider(where: {user_id: {_eq: ${id}}}) {
        provideruserRelation {
          id
          name
          email
          mobile
          enable
          approved
          role
        }
        addressLine1
        addressLine2
        addressLine3
        organization
      }
  }`;
    try {
      const response = await this.queryDb(query);
      return response;
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin", error);
      throw new HttpException('Unable to Create Admin', HttpStatus.BAD_REQUEST);
    }
  }

  async getSeekerInfoById(id) {
    const query = `query GetUser {
      Seeker(where: {user_id: {_eq: ${id}}}) {
        addressLine1
        addressLine2
        addressLine3
        organization
        source_code
        user_id
        seekerUserRelation {
          id
          name
          mobile
          email
          role
          approved
          enable
        }
      }
  }`;
    try {
      const response = await this.queryDb(query);
      return response;
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin", error);
      throw new HttpException('Unable to Create Admin', HttpStatus.BAD_REQUEST);
    }
  }

  async getSeekerList() {
    const query = `query GetUser {
    User(where: {role: {_eq: "seeker"}}) {
      id
      name
      email
      role
      approved
      enable
      reason
    }
  }`;
    try {
      const response = await this.queryDb(query);
      return response;
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin", error);
      throw new HttpException('Unable to Create Admin', HttpStatus.BAD_REQUEST);
    }
  }

  async adminCreate(user) {
    const userMutation = `
      mutation ($name: String!, $password: String!, $role: String!,$email: String!,$approved:Boolean) {
        insert_User(objects: {name:$name,password:$password,role:$role,email:$email,approved:$approved}) {
          returning {
            id,role
          }
        }
      }
    `;

    try {
      const userResponse = await this.queryDb(userMutation, user);
      console.log("Admin response", userResponse);
      this.logger.log("Admin Created")
      return userResponse.data.insert_User.returning[0];
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin", error);
      throw new HttpException('Unable to Create Admin', HttpStatus.BAD_REQUEST);
    }
  }


  async createProviderUser(providerUser) {
    const query = `mutation InsertProvider($user_id: Int,$organization:String,$source_code:String) {
      insert_Provider(objects: {user_id: $user_id, organization: $organization, source_code:$source_code}) {
        affected_rows
        returning {
          id
          user_id
          organization
          source_code
        }
      }
    }`

    try {
      const response = await this.queryDb(query, providerUser)
      return response
    } catch (error) {
      throw new HttpException('Unabe to creatre Provider user', HttpStatus.BAD_REQUEST);
    }
  }

  async createSeekerUser(seeker) {
    const query = `mutation InsertSeeker($user_id: Int,$organization:String,$source_code:String) {
      insert_Seeker(objects: {user_id: $user_id, organization: $organization, source_code:$source_code}) {
        affected_rows
        returning {
          id
          user_id
          organization
          source_code
        }
      }
    }`
    try {
      const response = await this.queryDb(query, seeker)
      return response;
    } catch (error) {
      throw new HttpException('Unabe to creatre Seeker user', HttpStatus.BAD_REQUEST);
    }
  }

  async updateapprovalStatus(id, user) {
    const query = `mutation updateApprovalStatus($id: Int!, $approved: Boolean, $reason: String) {
      update_User_by_pk(pk_columns: { id: $id }, _set: { approved: $approved, reason: $reason }) {
        id
        name
        approved
        reason
        enable
      }
    }`;
    try {
      console.log("approval", user.approval)
      const response = await this.queryDb(query, { id: id, approved: user.approved, reason: user.reason })
      return response
    } catch (error) {
      throw new HttpException('Unable to approved User', HttpStatus.BAD_REQUEST);
    }
  }

  async updateEnableStatus(id, user) {
    const query = `mutation updateApprovalStatus($id: Int!, $enable: Boolean) {
      update_User_by_pk(pk_columns: { id: $id }, _set: { enable: $enable}) {
        id
        name
        approved
        reason
        enable
      }
    }`;
    try {
      console.log("user", user)
      const response = await this.queryDb(query, { id: id, enable: user.enable })
      return response
    } catch (error) {
      throw new HttpException('Unable to approved User', HttpStatus.BAD_REQUEST);
    }
  }

  async updatePassword(id, password) {
    console.log("id", id)
    console.log("password", password)
    const query = `mutation updateApprovalStatus($id: Int!, $password: String) {
      update_User_by_pk(pk_columns: { id: $id }, _set: { password: $password}) {
        id
        name
        approved
        reason
        enable
      }
    }`;
    try {

      const response = await this.queryDb(query, { id: id, password: password })
      return response
    } catch (error) {
      throw new HttpException('Unable to update password!', HttpStatus.BAD_REQUEST);
    }
  }

  async isUserApproved(email: string) {
    const query = `
      query IsUserApproved($email: String!) {
        User(where: { email: { _eq: $email }, approved: { _eq: true } }) {
          id
        }
      }
    `;
    try {
      const userResponse = await this.queryDb(query, { email });
      // this.logger.log("User Created")
      console.log("UserResponse", userResponse)
      return userResponse;
    } catch (error) {
      this.logger.error("User is Not Approved", error);
      throw new HttpException('User is Not approved', HttpStatus.BAD_REQUEST);
    }


  }

  async createUser(user) {
    console.log(user)
    const userMutation = `
      mutation ($name: String!, $password: String!, $role: String!,$email: String!) {
        insert_User(objects: { password: $password, role: $role, email: $email,name:$name}) {
          returning {
            id,role
          }
        }
      }
    `;

    try {
      var userResponse = await this.queryDb(userMutation, user);
      this.logger.log("User Created")
      console.log("userResponse", userResponse)
      return userResponse.data.insert_User.returning[0];
    } catch (error) {

      this.logger.error("Something Went wrong in creating User", error);
      throw new HttpException(userResponse, HttpStatus.BAD_REQUEST);
    }
  }
  async findOne(email: string): Promise<any> {
    console.log(email)
    const query = `
      query ($email: String!) {
        User(where: {email: {_eq: $email}}) {
          id
          name
          email
          mobile
          password
          role
          approved
          enable
        }
      }
    `;

    try {
      const response = await this.queryDb(query, {
        email,
      });
      console.log(response);
      return response.data.User[0] || null;
    } catch (error) {
      throw new HttpException('Failed to fetch user by username', HttpStatus.NOT_FOUND);
    }
  }

  async createContent(id, createContentdto) {
    const query = `mutation InsertFlnContent($user_id:Int,$description: String,$code:String,$competency:String,$contentType:String,$domain:String,$goal:String,$image:String,$language:String,$link:String,$sourceOrganisation:String,$themes:String,$title:String, $content_id: String, $publisher: String, $collection: Boolean, $urlType: String, $url: String, $mimeType: String, $minAge: Int, $maxAge: Int, $author: String, $curricularGoals: String, $learningOutcomes: String ) {
      insert_fln_content(objects: {user_id:$user_id,description: $description,code: $code, competency:$competency, contentType:$contentType, domain:$domain, goal:$goal, image:$image, language:$language, link: $link, sourceOrganisation: $sourceOrganisation, themes: $themes, title: $title, content_id: $content_id, publisher: $publisher, collection: $collection, urlType: $urlType, url: $url, mimeType: $mimeType, minAge: $minAge, maxAge: $maxAge, author: $author, curricularGoals: $curricularGoals, learningOutcomes: $learningOutcomes  }) {
        returning {
          id
          user_id
        }
      }
    }
    `
    try {
      console.log("Response ", createContentdto);
      const response = await this.queryDb(query, { user_id: id, ...createContentdto });
      console.log("response", response);
      return response
    } catch (error) {
      throw new HttpException('Failed to create Content', HttpStatus.NOT_FOUND);
    }

  }

  async createContentBookmark(id, createContentdto) {
    const query = `mutation insert_bookmark_content($seeker_id:Int,$description: String,$code:String,$competency:String,$contentType:String,$domain:String,$goal:String,$image:String,$language:String,$link:String,$sourceOrganisation:String,$themes:String,$title:String) {
      insert_bookmark_content(objects: {seeker_id:$seeker_id,description: $description,code: $code, competency:$competency, contentType:$contentType, domain:$domain, goal:$goal, image:$image, language:$language, link: $link, sourceOrganisation: $sourceOrganisation, themes: $themes, title: $title}) {
        returning {
          id
          seeker_id
        }
      }
    }
    `
    try {
      console.log("Response ", createContentdto);
      const response = await this.queryDb(query, { seeker_id: id, ...createContentdto });
      console.log("response", response);
      return response
    } catch (error) {
      throw new HttpException('Failed to create Content', HttpStatus.NOT_FOUND);
    }

  }

  async removeBookmarkContent(id, seeker_id) {
    console.log("id", id)
    console.log("seeker_id", seeker_id)
    const query = `mutation MyMutation {
      delete_bookmark_content(where: {id: {_eq: ${id}}, seeker_id: {_eq: ${seeker_id}}}) {
        returning {
          id
        }
      }
    }`
    try {
      const response = await this.queryDb(query);
      console.log("response", response);
      return response
    } catch (error) {
      throw new HttpException('Failed to create Content', HttpStatus.NOT_FOUND);
    }

  }

  async getBookmarkContent(seeker_id) {
    const query = `query GetUser {
      bookmark_content(where: {seeker_id: {_eq: ${seeker_id}}}) {
        code
        competency
        contentType
        description
        domain
        goal
        image
        language
        link
        sourceOrganisation
        themes
        title
        id
        seeker_id
      }
  }`;
    try {
      const response = await this.queryDb(query);
      return response;
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin", error);
      throw new HttpException('Unable to Fetch content!', HttpStatus.BAD_REQUEST);
    }
  }

  async getContent(id) {
    const query = `query GetUser {
      fln_content(where: {user_id: {_eq: ${id}}}) {
        code
        competency
        contentType
        description
        domain
        goal
        image
        language
        link
        sourceOrganisation
        themes
        title
        id
        user_id
      }
  }`;
    try {
      const response = await this.queryDb(query);
      return response;
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin", error);
      throw new HttpException('Unable to Fetch content!', HttpStatus.BAD_REQUEST);
    }
  }

  async editContent(id, createContentdto) {
    // console.log("createContentdto", createContentdto)
    const query = `mutation UpdateMyData($id: Int!, $themes: String, $code: String, $competency: String, $contentType: String, $description: String, $domain: String, $goal: String, $language: String, $link: String, $sourceOrganisation: String, $title: String) {
      update_fln_content(where: { id: { _eq: $id } }, _set: {
        themes: $themes
        code: $code
        competency: $competency
        contentType: $contentType
        description: $description
        domain: $domain
        goal: $goal
        language: $language
        link: $link
        sourceOrganisation: $sourceOrganisation
        title: $title
      }) {
        affected_rows
        returning {
          code
          competency
          contentType
          description
          domain
          goal
          id
          image
          language
          link
          sourceOrganisation
          themes
          title
          user_id
        }
      }
    }
    `
    try {
      const response = await this.queryDb(query, {
        id: id,

        themes: createContentdto.themes,
        code: createContentdto.code,
        competency: createContentdto.competency,
        contentType: createContentdto.contentType,
        description: createContentdto.description,
        domain: createContentdto.domain,
        goal: createContentdto.goal,
        language: createContentdto.language,
        link: createContentdto.link,
        sourceOrganisation: createContentdto.sourceOrganisation,
        title: createContentdto.title
      });
      console.log(response)
      return response;
    } catch (error) {
      throw new HttpException('Failed to Update Profile', HttpStatus.NOT_MODIFIED);
    }

  }

  async findContent(getContentdto) {
    let result = 'where: {'
    Object.entries(getContentdto).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
      result += `${key}: {_eq: "${value}"}, `;
    });
    result += '}'
    console.log("result", result)
    const query = `query MyQuery {
      fln_content(${result}) {
        id
        code
        competency
        contentType
        description
        domain
        goal
        image
        language
        link
        sourceOrganisation
        themes
        title
        user_id
      }
      }`;
    try {
      const response = await this.queryDb(query);
      return response;
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin", error);
      throw new HttpException('Unable to Fetch content!', HttpStatus.BAD_REQUEST);
    }
  }

  async createCollection(provider_id, body) {
    console.log("provider_id", provider_id)
    console.log("body", body)
    const collectionMutation = `mutation MyMutation {
        insert_collection(objects: {
          provider_id: ${provider_id}, 
          title: "${body.title}",
          description: "${body.description}",
          icon: "${body.icon}",
          publisher: "${body.publisher}",
          author: "${body.author}",
          learningObjectives: "${body.learningObjectives}",
          language: "${body.language}",
          category: "${body.category}",
          themes: "${body.themes}",
          minAge: "${body.minAge}",
          maxAge: "${body.maxAge}",
          domain: "${body.domain}",
          curricularGoals: "${body.curricularGoals}",

        }) {
          returning {
            id
            provider_id
            title
            description
            icon
            publisher
            author
            learningObjectives
            category
            language
            themes
            minAge
            maxAge
            domain
            curricularGoals
            createdAt
            updatedAt
          }
        }
      }`;

    try {
      return await this.queryDb(collectionMutation);

    } catch (error) {

      this.logger.error("Something Went wrong in creating User", error);
      throw new HttpException("Something Went wrong in creating User", HttpStatus.BAD_REQUEST);
    }
  }

  async getCollection(provider_id) {
    console.log("provider_id", provider_id)
    const collectionMutation = `query MyQuery {
      collection(where: {provider_id: {_eq: ${provider_id}}}) {
        id
        provider_id
        title
        updatedAt
        createdAt
      }
    }
    `;

    try {
      return await this.queryDb(collectionMutation);

    } catch (error) {

      this.logger.error("Something Went wrong in creating User", error);
      throw new HttpException("Something Went wrong in creating User", HttpStatus.BAD_REQUEST);
    }
  }

  async getCollectionContent(id) {
    console.log("id", id)
    const collectionMutation = `query MyQuery {
      collection(where: {id: {_eq: ${id}}}) {
        collectionContentRelation {
          id
          content_id
          collection_id
          contentFlncontentRelation {
            code
            competency
            contentType
            description
            domain
            goal
            id
            image
            language
            link
            sourceOrganisation
            themes
            title
            user_id
          }
        }
      }
    } 
    `;

    try {
      return await this.queryDb(collectionMutation);

    } catch (error) {

      this.logger.error("Something Went wrong in fetching content list", error);
      throw new HttpException("Something Went wrong in content list", HttpStatus.BAD_REQUEST);
    }
  }

  async updateCollection(id, provider_id, body) {
    console.log("provider_id", provider_id)
    console.log("id", id)
    console.log("body", body)
    const collectionMutation = `mutation MyMutation {
      update_collection(where: {id: {_eq: ${id}}, provider_id: {_eq: ${provider_id}}}, _set: {title: "${body.title}"}) {
        affected_rows
        returning {
          provider_id
          title
          id
          createdAt
          updatedAt
        }
      }
    }
    `;

    try {
      return await this.queryDb(collectionMutation);

    } catch (error) {

      this.logger.error("Something Went wrong in creating User", error);
      throw new HttpException("Something Went wrong in creating User", HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCollection(id, provider_id) {
    console.log("provider_id", provider_id)
    console.log("id", id)
    const collectionMutation = `mutation MyMutation {
      delete_collection(where: {id: {_eq: 1}, provider_id: {_eq: 35}}) {
        affected_rows
      }
    }
    `;

    try {
      return await this.queryDb(collectionMutation);

    } catch (error) {

      this.logger.error("Something Went wrong in deleting collection", error);
      throw new HttpException("Something Went wrong in deleting collection", HttpStatus.BAD_REQUEST);
    }
  }

  async createContentCollection(body) {
    console.log("body", body)
    const collectionContentMutation = `mutation MyMutation {
      insert_contents(objects: {collection_id: ${body.collection_id}, content_id: ${body.content_id}}) {
        returning {
          collection_id
          content_id
          id
        }
      }
    }
    `;

    try {
      return await this.queryDb(collectionContentMutation);

    } catch (error) {

      this.logger.error("Something Went wrong in deleting collection", error);
      throw new HttpException("Something Went wrong in deleting collection", HttpStatus.BAD_REQUEST);
    }
  }

  async deleteContentCollection(id) {
    console.log("id", id)
    const collectionMutation = `mutation MyMutation {
      delete_contents(where: {id: {_eq: ${id}}}) {
        affected_rows
      }
    }
    `;

    try {
      return await this.queryDb(collectionMutation);

    } catch (error) {

      this.logger.error("Something Went wrong in deleting collection", error);
      throw new HttpException("Something Went wrong in deleting collection", HttpStatus.BAD_REQUEST);
    }
  }

  async queryDb(query: string, variables?: Record<string, any>): Promise<any> {
    try {
      const response = await axios.post(
        this.hasuraUrl,
        {
          query,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': '#z4X39Q!g1W7fDvX'
          },
        }
      );
      return response.data;
    } catch (error) {
      return error;

    }
  }


}