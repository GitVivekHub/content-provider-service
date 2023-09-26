import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateSaUserDto } from '../../dto/sa-user.dto'
import { CreateTransactionDto } from '../../dto/create-transaction.dto'
import { subDays, subMonths, subYears } from 'date-fns'
import { User } from '../../entity/user.entity'
import { SaUser } from '../../entity/sa-user.entity'
import { Transaction } from '../../entity/transaction.entity'
import axios from 'axios';
import { LoggerService } from 'src/services/logger/logger.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class HasuraService {
  private hasuraUrl = process.env.HASURA_URL;
  private adminSecretKey = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
 
  constructor(private readonly logger : LoggerService){}


  async createUser(user: User): Promise<any> {

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userMutation = `
      mutation ($username: String!, $password: String!, $mobile: String!, $role: String!,$email: String!,$name:String,$state:String) {
        insert_User(objects: {username: $username, password: $password, mobile: $mobile, role: $role, email: $email,name:$name,state:$state}) {
          returning {
            id,role
          }
        }
      }
    `;

    try {
      const userResponse = await this.queryDb(userMutation, { ...user, password: hashedPassword });
      this.logger.log("User Created")
      return userResponse.data.insert_User.returning[0];
    } catch (error) {
      this.logger.error("Something Went wrong in creating User",error);
      throw new HttpException('Unable to Create User', HttpStatus.BAD_REQUEST);
    }
  }

  async saUserCreate(SaUser: SaUser): Promise<any> {
    const saUserMutation = `
  mutation ($email: String!, $mobile: String!, $user_id: Int!, $name: String!, $collegeName: String, $courseYear: String, $addressLine1: String, $addressLine2: String, $addressLine3: String, $bankName: String!, $accountNo: String!, $ifscCode: String!,$pan:String,$areaSalesManager:String,$state:String) {
    insert_SA_user(objects: [{ email: $email, mobile: $mobile, user_id: $user_id, name: $name, collegeName: $collegeName, courseYear: $courseYear, addressLine1: $addressLine1, addressLine2: $addressLine2, addressLine3: $addressLine3, bankName: $bankName, accountNo: $accountNo, ifscCode: $ifscCode,pan:$pan,areaSalesManager:$areaSalesManager,state:$state}]) {
      returning {
        user_id
      }
    }
  }
`;
    try {
      let saUserResponse = await this.queryDb(saUserMutation, SaUser);
      this.logger.log("SA user Created")
      return saUserResponse;
    } catch (error) {
      this.logger.error("Unable to create saUser",error);
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }

  }

  async couponDetails(couponData) {
    const query = `
    mutation ($user_id:Int!,$referralCode:String,$discount_pct:Int,$offer_price:Int,$quantity:Int,$commission:Int,$medace_id:json,$plan_ids:json,$status:Boolean) {
      insert_CouponCode(objects: [{user_id:$user_id,referralCode:$referralCode,discount_pct:$discount_pct,commission:$commission,quantity:$quantity,medace_id:$medace_id,plan_ids:$plan_ids,status:$status}]) {
        returning {
          user_id,referralCode,discount_pct,commission,quantity,medace_id,plan_ids,status
        }
      }
    }
  `;
    try {
      const couponDbResponse = await this.queryDb(query, couponData);
      this.logger.log("Coupon in Manipal Dashboard DB created")
      return couponDbResponse;
    } catch (error) {
      this.logger.error("Failure in Coupon Creation at Manpal Dashbord end",error)
      throw new HttpException('Failed to create Coupon', HttpStatus.BAD_REQUEST);
    }
  }

  async saDetails(saCode) {
    const query = `
      query matchSaCode($saCode: String!) {
        CouponCode(where: { referralCode: { _eq: $saCode } }) {
          referralCode
          UserRelation{
            email
            name
            mobile
          }
        }
      }
    `;
    console.log("HI");
    try {
      const response = await this.queryDb(query, { saCode });
      console.log(response)
      if (Array.isArray(response.data.CouponCode) && response.data.CouponCode.length === 0) {
        throw new HttpException('Unable to find SA Code', HttpStatus.NOT_FOUND);
      }
      return response
    } catch (error) {
      throw new HttpException('Unable to find SA Code', HttpStatus.NOT_FOUND);
    }
  }

  async getAllUsers(): Promise<any[]> {
    const query = `
    query {
      User {
        id
        name
        username
        mobile
        role
        email
        state
        saUserRelation{
          user_id
          name,
          areaSalesManager
          saCodeRelation{
            referralCode
            commission
            discount_pct
            status
            }
        }
      }
    }
  `;
    try {
      const response = await this.queryDb(query);
      return response
    } catch (error) {
      console.log("Hi")
      this.logger.error("Failed to fetch ALL users",error);
      throw new HttpException('Failed to fetch users', HttpStatus.NOT_FOUND);
    }
  }

  async getUserByUsername(email: string): Promise<any> {
    console.log(email)
    const query = `
      query ($email: String!) {
        User(where: {email: {_eq: $email}, role: {_eq: "admin"}}) {
          id
          username
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
      return response.data.User[0] || null;
    } catch (error) {
      throw new HttpException('Failed to fetch user by username', HttpStatus.NOT_FOUND);
    }
  }

  async getUserByMobile(mobile: string, role: string): Promise<any> {
    console.log("118", mobile, role)
    const query = `
      query ($mobile: String!, $role: String!) {
        User(where: {mobile: {_eq: $mobile}, role: {_eq: $role}}) {
          id
          username
          mobile
          role
          saUserRelation{
            saCodeRelation{
              referralCode
              status
            }
          }
        }
      }
    `;

    try {
      console.log("HI");
      const response = await this.queryDb(query, {
        mobile, role
      });
      
      return response.data.User[0]
    } catch (error) {
      this.logger.error("Unable to fetch user by Mobile",error);
      throw new HttpException('Failed to fetch user by mobile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserById(id: number): Promise<any> {
    const query = `
      query ($user_id: Int!) {
        SA_user(where: {user_id: {_eq: $user_id}}) {
          id
          name
          mobile
          email
          collegeName
          courseYear
          addressLine1
          bankName
          ifscCode
          accountNo
          pan
          saCodeRelation{
            referralCode
            commission
            discount_pct
            status
          }
          
        }
      }
    `;

    try {
      const response = await this.queryDb(query, {
        user_id: id,
      });
      if(response)
      return response;
    } catch (error) {
      this.logger.error('Unable to fetch Profile',error);
      throw new HttpException('Failed to fetch user by ID', HttpStatus.NOT_FOUND);
    }
  }

  async deleteById(id: number): Promise<any> {
    const query = `
      mutation DeleteUserById($id: Int!) {
        delete_User(where: { id: { _eq: $id } }) {
          affected_rows
        }
      }
    `;
    try {
      const response = await this.queryDb(query, { id });
      console.log(id);
      const ans = await this.deleteSauser(id)
      console.log(ans);
      return response
    } catch (error) {
      throw new HttpException('Failed to Deleteuser', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteSauser(user_id) {
    const query = `
    mutation DeleteUserById($user_id: Int!) {
      delete_SA_user(where: { user_id: { _eq: $user_id } }) {
        affected_rows
      }
    }
  `;
    try {
      const response = await this.queryDb(query, { user_id });
      return response
    } catch (error) {
      throw new HttpException('Failed to Deleteuser', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async updatedetails(id: number, saUserDto ?: CreateSaUserDto): Promise<any> {
   const query = ` mutation UpdateUser($id: Int!, $email: String, $mobile: String) {
      update_User(where: { id: { _eq: $id } }, _set: { email: $email, mobile: $mobile }) {

        affected_rows

      }
    }`;
    
    try {
      const response = await this.queryDb(query, {
        id: id,
        email:saUserDto.email,
        mobile:saUserDto.mobile
      });
      if(response.data.update_User.affected_rows > 0){
        const updateSaUser = await this.updateAdminSadetails(id,saUserDto)
      }
      return response
      
    } catch (error) {
      this.logger.error("Failed to Update User",error);
      throw new HttpException('Failed to Update User', HttpStatus.NOT_MODIFIED);
    }
  }

  async updateAdminSadetails(id:number,  saUserDto?:CreateSaUserDto){
      const query = `mutation (
        $user_id: Int,
        $name:String,
        $collegeName: String,
        $courseYear: String,
        $addressLine1: String,
        $addressLine2: String,
        $addressLine3: String,
        $bankName: String,
        $accountNo: String,
        $ifscCode: String,
        $pan:String
        $email:String,
        $mobile:String
      ) {
        update_SA_user(
          where: { user_id: { _eq: $user_id } }
          _set: {
            name:$name
            collegeName: $collegeName
            courseYear: $courseYear
            addressLine1: $addressLine1
            addressLine2: $addressLine2
            addressLine3: $addressLine3
            bankName: $bankName
            accountNo: $accountNo
            ifscCode: $ifscCode
            pan: $pan
            email:$email
            mobile:$mobile
          }
        ) {
          returning {
            email
            mobile
            collegeName
            courseYear
            addressLine1
            addressLine2
            addressLine3
            bankName
            accountNo
            ifscCode
            name
            pan
          }
        }
      }`;
      try {
        const response = await this.queryDb(query, {
          user_id: id,
          email:saUserDto.email,
          mobile:saUserDto.mobile,
          collegeName: saUserDto.collegeName,
          courseYear: saUserDto.courseYear,
          addressLine1: saUserDto.addressLine1,
          addressLine2: saUserDto.addressLine2,
          addressLine3: saUserDto.addressLine3,
          bankName: saUserDto.bankName,
          accountNo: saUserDto.accountNo,
          ifscCode: saUserDto.ifscCode,
          name: saUserDto.name,
          pan: saUserDto.pan
        });
        console.log(response)
        return response;
      } catch (error) {
        throw new HttpException('Failed to Update Profile', HttpStatus.NOT_MODIFIED);
      }
  
  }
  

  async getUserTransaction(id) {
    const query = `query ($user_id: Int!) {
      Transaction(where: {user_id: {_eq: $user_id}}) {
        id
        user_id
        learner_id
        saUserRelation {
          email
          name
          mobile
          saCodeRelation{
            referralCode
            discount_pct
            commission
          }
        }
        learnerRelation{
          name
          phone
          email
          learner_id
        }
        transactionAmount
        transactionId
        transactionDateTime
      }
    }
  `;
    try {
      const response = await this.queryDb(query, {
        user_id: id
      });
      return response
    } catch (error) {

    }

  }
  async getTransaction(): Promise<any> {
    const query = `
    query {
      Transaction {
        id
        user_id
        learner_id
        saUserRelation {
          email
          name
          mobile
          saCodeRelation{
            referralCode
            discount_pct
            commission
          }
        }
        learnerRelation{
          name
          phone
          email
          learner_id
        }
        transactionAmount
        transactionId
        transactionDateTime
      }
    }
  `;

    try {
      const response = await this.queryDb(query);
      return response
    } catch (error) {
      this.logger.error("Failed to fetch transaction",error);
      throw new HttpException('Failed to Find Transaction', HttpStatus.NOT_FOUND);
    }
  }

  async pendingTransaction() {
    const query = `query GetTransaction {
      Transaction(where: {status: {_eq: "pending"}}) {
        id
        user_id
        learner_id
        saUserRelation {
          email
          name
          mobile
          saCodeRelation{
            referralCode
            discount_pct
            commission
          }
        }
        learnerRelation{
          name
          phone
          email
          learner_id
        }
        transactionAmount
        transactionId
        transactionDateTime
      }
    }
    `
    try {
      const response = await this.queryDb(query);
      return response
    } catch (error) {
      this.logger.error("Failed to fetch transactionwith status pending",error);
      throw new HttpException('Failed to fetch Transaction', HttpStatus.NOT_FOUND);
    }
  }

  async getTransactionByUserID(id) {

    const query = `query GetTransactionByUserID($user_id: Int!) {
      Transaction(where: { user_id: { _eq: $user_id },status: { _eq: "pending" } }) {
        id
        user_id
        transactionAmount
        transactionId
        transactionDateTime
        learnerRelation{
          name
          phone
          email
          learner_id
        }
        saUserRelation {
          email
          name
          mobile
          saCodeRelation {
            referralCode
            commission
          }
        }
      }
    }
    `;
    try {
      const response = await this.queryDb(query, { user_id: id });
      return response
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.NOT_FOUND);
    }
  }

  async getTransactionById(id: number): Promise<any> {
    const query = `
  query ($transactionId: String!) {
    Transaction(where: {transactionId: {_eq: $transactionId}}) {
      id
      user_id
      learner_id
      saUserRelation {
        email
        name
        mobile,
        saCodeRelation{
          referralCode
          commission
          discount_pct
        }
      }

      learnerRelation {
        name
        phone
        email
        learner_id
      }
      transactionAmount
      transactionId
    }
  }
`;


    try {
      const response = await this.queryDb(query, {
        transactionId: String(id)
      });
      console.log(response)
      return response
    } catch (error) {
      throw new HttpException('Failed to fetch Transaction by ID', HttpStatus.NOT_FOUND);
    }
  }

  async totalPaymentDetails() {
    const query = `query {
      Transaction_aggregate {
        aggregate {
          count
          sum {
            transactionAmount
          }
        }
      }
    }`;
    try {
      const response = await this.queryDb(query);
      console.log(response)
      return response
    } catch (error) {
      throw new HttpException('Failed to fetch Total Payment', HttpStatus.NOT_FOUND);
    }
  }

  async totalPendingDetails() {
    const query = `query {
      SA_payment_aggregate {
        aggregate {
          sum {
            amountPaid
          }
        }
      }
    }`;

    try {
      const response = await this.queryDb(query);
      console.log(response)
      return response
    } catch (error) {
      throw new HttpException('Failed to fetch Total Payment', HttpStatus.NOT_FOUND);
    }
  }

  async totalPayment({ id }) {
    const query = `query ($id: Int!) {
      Transaction_aggregate(where: {user_id: {_eq: $id}}) {
        aggregate {
          count
          sum {
            transactionAmount
          }
        }
      }
    }`;

    try {
      const response = await this.queryDb(query, {
        id,
      });
      return response
    } catch (error) {
      throw new HttpException('Failed to fetch Transaction by ID', HttpStatus.NOT_FOUND);
    }
  }

  async totalAmountPaid(id: number) {
    const query = `query ($id: Int!) {
      SA_payment_aggregate(where: {user_id: {_eq: $id}}) {
        aggregate {
          sum {
            amountPaid
          }
        }
      }
    }`;

    try {
      const response = await this.queryDb(query, {
        id,
      });
      return response
    } catch (error) {
      throw new HttpException('Failed to fetch Total Payment', HttpStatus.NOT_FOUND);
    }
  }

  async getTransactionCount(id: number): Promise<any> {
    const query = `
      query ($id: Int!) {
        Transaction_aggregate(where: {user_id: {_eq: $id}}) {
          aggregate {
            count
            sum {
              transactionAmount
            }
          }
        }
        SA_user(where: {user_id: {_eq: $id}}) {
          saCodeRelation{
            referralCode
          }
        }
      }
    `;

    try {
      const response = await this.queryDb(query, {
        id,
      });
      console.log(response)
      return response
    } catch (error) {
      throw new HttpException('Failed to fetch Transaction by ID', HttpStatus.NOT_FOUND);
    }
  }

  async findUserDetail(id: number) {
    const query = `
      query ($user_id: Int!) {
        SA_user(where: {user_id: {_eq: $user_id}}) {
          user_id
          name
          mobile
          email
          collegeName
          courseYear
          addressLine1
          addressLine2
          addressLine3
          bankName
          accountNo
          ifscCode
          pan,
          saCodeRelation{
            referralCode
            discount_pct
            commission
          }
        }
      }
    `;

    try {
      const response = await this.queryDb(query, {
        user_id: id,
      });
      return response
    } catch (error) {
      this.logger.error('Something went wrong in fetching Profile',error)
      throw new HttpException('Failed to fetch user details', HttpStatus.NOT_FOUND);
    }

  }

  
  async updateUsersDetails(id: number, createSaUserDto?: CreateSaUserDto): Promise<any> {
    const query = `mutation (
      $user_id: Int!,
      $name:String,
      $collegeName: String,
      $courseYear: String,
      $addressLine1: String,
      $addressLine2: String,
      $addressLine3: String,
      $bankName: String,
      $accountNo: String,
      $ifscCode: String,
      $pan:String
    ) {
      update_SA_user(
        where: { user_id: { _eq: $user_id } }
        _set: {
          name:$name
          collegeName: $collegeName
          courseYear: $courseYear
          addressLine1: $addressLine1
          addressLine2: $addressLine2
          addressLine3: $addressLine3
          bankName: $bankName
          accountNo: $accountNo
          ifscCode: $ifscCode
          pan: $pan
        }
      ) {
        returning {
          collegeName
          courseYear
          addressLine1
          addressLine2
          addressLine3
          bankName
          accountNo
          ifscCode
          name
          pan
        }
      }
    }`;
    try {
      const response = await this.queryDb(query, {
        user_id: id,
        collegeName: createSaUserDto.collegeName,
        courseYear: createSaUserDto.courseYear,
        addressLine1: createSaUserDto.addressLine1,
        addressLine2: createSaUserDto.addressLine2,
        addressLine3: createSaUserDto.addressLine3,
        bankName: createSaUserDto.bankName,
        accountNo: createSaUserDto.accountNo,
        ifscCode: createSaUserDto.ifscCode,
        name: createSaUserDto.name,
        pan:createSaUserDto.pan
      });
      return response;
    } catch (error) {
      this.logger.error('PATCH /updateProfile',error)
      throw new HttpException('Failed to Update Profile', HttpStatus.NOT_MODIFIED);
    }


  }

  async findMedaceId(user_id) {
    const query = `query GetCouponCode($user_id: Int) {
      CouponCode(where: {user_id: {_eq: $user_id}}) {
        referralCode
        medace_id
        status
      }
    }`;
    try {
      const response = await this.queryDb(query, { user_id });
      this.logger.log("Medace ID found in DB")
      return response.data
    } catch (error) {
      this.logger.error('Unable to find Medace ID',error)
      throw new HttpException('Unable to find Medace ID', HttpStatus.NOT_FOUND);
    }
  }


  async updateUserStatus(id: number, createSaUserDto?: CreateSaUserDto): Promise<any> {
    const query = `mutation (
      $user_id: Int!,
      $status: Boolean!
    ) {
      update_CouponCode(
        where: { user_id: { _eq: $user_id } }
        _set: {
          status: $status
        }
      ) {
        returning {
          referralCode
          user_id
          medace_id
        }
    }
    }`;


    try {
      const response = await this.queryDb(query, {
        user_id: id,
        status: createSaUserDto.status
      });
      this.logger.log('Coupon deactivated at Manipal dashboard End');
      return response.data.update_CouponCode.returning[0];
    } catch (error) {
      throw new HttpException('Failed to Update User Status', HttpStatus.NOT_MODIFIED);
    }
  }

  async transactionFilter(duration: string): Promise<any> {
    let startDate = null;
    let endDate = new Date();
    console.log(duration);

    if (duration === 'weekly') {
      startDate = subDays(endDate, 7);
      console.log(startDate);
    } else if (duration === 'monthly') {
      startDate = subMonths(endDate, 1);
    } else if (duration === 'yearly') {
      startDate = subYears(endDate, 1);
    }

    const query = `
      query FetchTransactions($startDate: date!, $endDate: date!) {
        Transaction(where: { created_at: { _gte: $startDate, _lte: $endDate } }, order_by: { created_at: desc }) {
          id
          user_id
          created_at
          learner_id
          transactionAmount
          transactionId
        }
      }
    `;

    try {
      const response = await this.queryDb(query, { startDate, endDate });
      return response;
    } catch (error) {
      throw new HttpException('Failed to Update User', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Integration Transaction API

  async findSaCode(saCode) {
    const query = `
    query matchSaCode($saCode: String!) {
      CouponCode(where: { referralCode: { _eq: $saCode } }) {
        user_id
      }
    }
  `;
    try {
      const response = await this.queryDb(query, { saCode })
      this.logger.log("User Id found for SA Code")
      const userId = response.data.CouponCode[0].user_id;
      return userId;
    } catch (error) {
      this.logger.error('User Id Not found',error);
      throw new HttpException('Failed to Find SA Code', HttpStatus.NOT_FOUND);
    }
  }

  async createTransaction(transaction: Transaction) {

    const query = `mutation insertTransaction($user_id:Int,$learner_id:String,$transactionId:String,$transactionAmount:Int,$transactionDateTime:timestamptz){
      insert_Transaction(objects:{user_id:$user_id,learner_id:$learner_id,transactionId:$transactionId,transactionAmount:$transactionAmount,
        transactionDateTime:$transactionDateTime}

        )
      {returning{
        id,user_id,learner_id,transactionId,transactionAmount,transactionDateTime
      }
      }}`;

    try {
      var transresponse = await this.queryDb(query, transaction)
      this.logger.log('Transaction created');
      return transresponse.data.insert_Transaction.returning[0]
    } catch (error) {
      this.logger.error('failed to create transaction',error)
      throw new HttpException(transresponse, HttpStatus.BAD_REQUEST)
    }
  }

  async createLearner(createTransactionDto: CreateTransactionDto) {
    const query = `mutation insertTransaction($name:String,$email:String,$phone:String,$learner_id:String){
      insert_Learner(objects:{name:$name,email:$email,phone:$phone,learner_id:$learner_id})
      {returning{name}}}`

    try {
      const transresponse = await this.queryDb(query, {
        name: createTransactionDto.learnerName,
        email: createTransactionDto.learnerEmail,
        phone: createTransactionDto.learnerPhone,
        learner_id: createTransactionDto.learner_id
      })
      console.log(transresponse);
      return transresponse
    } catch (error) {
      console.log("860 error", error.message);
      throw new HttpException('Failed to Create Transaction', HttpStatus.NOT_FOUND);
    }
  }

  async transactionLogs() {
    const query = `
    query {
      Transaction {
        transactionAmount
        transactionId
        transactionDateTime
        saUserRelation {
          user_id
          email
          name
          mobile,
          saCodeRelation{
            referralCode
          }
        }
        learnerRelation {
          name
          phone
        }
      }
    }
    
  `;

    try {
      const response = await this.queryDb(query)
      const data = response.data.Transaction
      return data
    } catch (error) {
      this.logger.error("Faield to find Transaction logs",error);
      throw new HttpException('Failed to Find Transaction logs', HttpStatus.NOT_FOUND);
    }
  }

  async findUserId(saCode) {
    const query = `
      query matchSaCode($saCode: String!) {
        CouponCode(where: { referralCode: { _eq: $saCode } }) {
          user_id
        }
      }
    `;
  
    try {
      const response = await this.queryDb(query, { saCode });
      console.log(response)
      console.log(response.data.CouponCode.length)
      if (response?.data && response?.data?.CouponCode && response?.data?.CouponCode.length > 0) {
        const user_id = response.data.CouponCode[0].user_id;
        console.log(user_id,"987");
        return user_id;
      } 
    } catch (error) {
      return error
    }
  }

  async findTransactionId(transactionId){
    const query = `
    query CheckTransactionExists($transactionId: String) {
      Transaction(where: { transactionId: { _eq: $transactionId } }) {
        id
      }
    }`
      const userResponse = await this.queryDb(query,{ transactionId });
      console.log(userResponse);
      if(userResponse?.data?.Transaction?.length > 0){
        return true
      }else{
        return false
      }
    } 

  

  async uploadCsvData(transactionData) {
    console.log(transactionData)
    const mutation = `
        mutation UpdateTransactionLogs($user_id:Int,$amountPaid:Int,$transactionId:Int,$transactionDate:date) {
          insert_SA_payment(objects: {user_id: $user_id,amountPaid: $amountPaid,transactionDate:$transactionDate,transactionId:$transactionId}){
                affected_rows
            }
        }
    `;
    try {
      const response = await this.queryDb(mutation, transactionData)
      console.log(response)
      return response
    } catch (error) {
      return {
        error: "Failed To perform Database Operation"
      }
    }
  }

  async updateTransactionStatus({ id }) {
    const query = `mutation MyMutation($id: String!) {
      update_Transaction(where: { transactionId: { _eq: $id } }, _set: { status: "successful" }) {
        affected_rows
      }
    }`;

    try {
      const response = await this.queryDb(query, { id });
      return response;
    } catch (error) {
      throw new HttpException('Unable to Update Transaction Status', HttpStatus.NOT_FOUND);
    }
  }



  async findUserIdTransaction() {
    const query = `query MyQuery {
      Transaction_aggregate(distinct_on: user_id) {
        nodes {
          user_id
        }
      }
    }`

    try {
      const response = await this.queryDb(query)
      return response.data
    } catch (error) {
      throw new HttpException('Failed to perform database operation', HttpStatus.NOT_FOUND);
    }
  }

  async CheckUserExistence(email: string, mobile: string) {
    const query = `query MyQuery($email: String, $mobile: String) {
      User(
        where: {
          _or: [
            { email: { _eq: $email } },
            { mobile: { _eq: $mobile } }
          ]
        }
      ) {
        id
      }
    }`;

    const response = await this.queryDb(query, { email: email, mobile: mobile });    
    if (response.data.User.length > 0) {
      throw new HttpException('User with this email or mobile number already exists', HttpStatus.BAD_REQUEST);
    }

  }


  async createNewUser(requestedUserDto) {
    const query = `
    mutation ($name: String,$email:String,$mobile:String ) {
      insert_Requested_user(objects:{name:$name,email:$email,mobile:$mobile}) {
        returning {
          id
          name
        }
      }
    }
  `;

    try {
      const response = await this.queryDb(query, requestedUserDto)
      return response
    } catch (error) {
      throw new HttpException('Failed to Create user', HttpStatus.NOT_FOUND);
    }
  }

  async userDataLogs() {
    const query = `query {
      Requested_user {
        name
        email
        mobile
        approval
      }
    }`


    try {
      const response = await this.queryDb(query)
      const data = response.data.Requested_user
      return data
    } catch (error) {
      throw new HttpException('Failed to Fetch user', HttpStatus.NOT_FOUND);
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
            'x-hasura-admin-secret': this.adminSecretKey
          },
        }
      );
      return response.data;
    } catch (error) {
      return error;
      
    }
  }
}