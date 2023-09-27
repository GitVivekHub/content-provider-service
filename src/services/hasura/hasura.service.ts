import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { LoggerService } from 'src/services/logger/logger.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class HasuraService {
  private hasuraUrl = process.env.HASURA_URL;
  private adminSecretKey = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
 
  constructor(private readonly logger : LoggerService){}

async getProviderList(){
  const query = `query GetUser {
    User(where: {role: {_eq: "provider"}}) {
      approved
      email
      name
      role
      id
      reason
    }
  }`;
  try {
    const response = await this.queryDb(query);
    return response;
  } catch (error) {
    this.logger.error("Something Went wrong in creating Admin",error);
    throw new HttpException('Unable to Create Admin', HttpStatus.BAD_REQUEST);
  }
}
 async adminCreate(user){
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
      const userResponse = await this.queryDb(userMutation,user);
      console.log("Admin response",userResponse);
      this.logger.log("Admin Created")
      return userResponse.data.insert_User.returning[0];
    } catch (error) {
      this.logger.error("Something Went wrong in creating Admin",error);
      throw new HttpException('Unable to Create Admin', HttpStatus.BAD_REQUEST);
    }
 }


  async createProviderUser(providerUser){
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
      const response = await this.queryDb(query,providerUser)
      return response
    } catch (error) {
      throw new HttpException('Unabe to creatre Provider user', HttpStatus.BAD_REQUEST);
    }
  }
  async updateapprovalStatus(id,user){
    const query = `mutation updateApprovalStatus($id: Int!, $approved: Boolean, $reason: String) {
      update_User_by_pk(pk_columns: { id: $id }, _set: { approved: $approved, reason: $reason }) {
        id
        name
        approved
        reason
      }
    }`;
    try {
      console.log("approval",user.approval)
      const response = await this.queryDb(query,{id:id,approved:user.approved,reason:user.reason})
      return response
    } catch (error) {
      throw new HttpException('Unable to approved User', HttpStatus.BAD_REQUEST);
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
      const userResponse = await this.queryDb(query, {email});
      // this.logger.log("User Created")
      console.log("UserResponse",userResponse)
      return userResponse;
    } catch (error) {
      this.logger.error("User is Not Approved",error);
      throw new HttpException('User is Not approved', HttpStatus.BAD_REQUEST);
    }
  
    
  }

  async createUser(user){
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
      console.log("userResponse",userResponse)
      return userResponse.data.insert_User.returning[0];
    } catch (error) {
      
      this.logger.error("Something Went wrong in creating User",error);
      throw new HttpException(userResponse, HttpStatus.BAD_REQUEST);
    }
  }
  async findOne(email: string): Promise<any> {
    console.log(email)
    const query = `
      query ($email: String!) {
        User(where: {email: {_eq: $email} , approved: { _eq: true }}) {
          id
          mobile
          role
          email
          password
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