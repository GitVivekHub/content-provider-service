import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateTransactionDto } from 'src/dto/create-transaction.dto';
import { CreateLearnerDto } from 'src/dto/learner-dto';
import { User } from '../entity/user.entity'
import { Transaction } from '../entity/transaction.entity'
import { HasuraService } from 'src/services/hasura/hasura.service';
import { EmailService } from 'src/services/email/email.service';
import { CreateSaUserDto } from '../dto/sa-user.dto'
import { SaUser } from 'src/entity/sa-user.entity';
import { MiddlewareService } from 'src/services/middleware/middleware.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UploadDataDto } from '../dto/uploadCsv.dto'
import { getCiphers } from 'tls';
import { retry, retryWhen } from 'rxjs';

// import {axios} from 'axios';


@Injectable()
export class AdminService {

    private readonly baseUrl: string;
    constructor(
        private readonly hasuraService: HasuraService,
        private readonly emailService: EmailService,
        private readonly middleware: MiddlewareService,

    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // createUserDto.commission='10'
        // createUserDto.discount ='40'
        let user: User = new User();
        user.username = createUserDto.username
        user.email = createUserDto.email
        user.mobile = createUserDto.mobile
        user.password = createUserDto.password
        user.role = createUserDto.role
        user.name = createUserDto.name
        user.state = createUserDto.state

        await this.hasuraService.CheckUserExistence(user.email, user.mobile)
        const createdUser = await this.hasuraService.createUser(user);

        if (createUserDto.role == 'admin') {
            return createdUser
        }
        else {
            let saUser: SaUser = new SaUser();

            saUser.user_id = createdUser.id
            saUser.email = createUserDto.email
            saUser.mobile = createUserDto.mobile
            saUser.name = createUserDto.name
            saUser.collegeName = createUserDto.collegeName
            saUser.courseYear = createUserDto.courseYear
            saUser.addressLine1 = createUserDto.addressLine1
            saUser.addressLine2 = createUserDto.addressLine2
            saUser.addressLine3 = createUserDto.addressLine3
            saUser.bankName = createUserDto.bankName
            saUser.accountNo = createUserDto.accountNo
            saUser.ifscCode = createUserDto.ifscCode
            saUser.pan = createUserDto.pan
            saUser.areaSalesManager = createUserDto.areaSalesManager
            saUser.state = createUserDto.state


            var referralCode = this.emailService.generateRefCode(createUserDto.email)
            const createSaUser = await this.hasuraService.saUserCreate(saUser);

            let couponData = {
                plan_ids: [],
                user_id: createdUser.id,
                referralCode: referralCode,
                discount_pct: createUserDto.discount,
                commission: createUserDto.commission,
                quantity: createUserDto.quantity,
            }

            let apiBody = {
                plan_ids: [],
                code: referralCode,
                valid_from: Math.floor(Date.now() / 1000),
                discount_pct: createUserDto.discount,
                quantity: createUserDto.quantity,
                type: "SA",
            }
            if (createSaUser) {
                const token_res = await this.middleware.getAccessToken()
                if (token_res) {
                    const getPlanIds = await this.middleware.getAllPlans(token_res.access_token)
                    let promises = [];
                    if (getPlanIds) {
                        let plan = getPlanIds.plans
                        for (const plans of plan) {

                            apiBody.plan_ids = plans.ids
                            couponData.plan_ids.push(plans)
                            promises.push(this.middleware.createCoupon(apiBody, token_res.access_token));
                        }
                        let responseCoupon = await Promise.all(promises)
                        if (responseCoupon) {
                            couponData['medace_id'] = responseCoupon
                            couponData['status'] = true
                            const insertData = await this.hasuraService.couponDetails(couponData);

                        } else {
                            couponData['status'] = false
                            const insertData = await this.hasuraService.couponDetails(couponData);
                        }
                    }


                }

                await this.emailService.sendWelcomeEmail(createUserDto.email, createUserDto.name, createUserDto.mobile, referralCode)

            }
            return createdUser
        }
    }

    async saDetails(saCode) {
        return this.hasuraService.saDetails(saCode)
    }

    findAll(): Promise<User[]> {
        return this.hasuraService.getAllUsers()
    }

    findOne(username: string): Promise<User> {
        return this.hasuraService.getUserByUsername(username)
    }

    findOneById(id: number): Promise<User> {
        return this.hasuraService.getUserById(id)
    }

    findUserMobile(mobile: string, role: string): Promise<User> {
        return this.hasuraService.getUserByMobile(mobile, role)
    }

    deleteById(id: number) {
        return this.hasuraService.deleteById(id)
    }

    updateProfile(id: number, createSaUserDto?: CreateSaUserDto) {
        return this.hasuraService.updatedetails(id, createSaUserDto)
    }

    getTransaction() {
        return this.hasuraService.getTransaction();
    }

    getTransactionById(id) {
        return this.hasuraService.getTransactionById(id);
    }

    transactionFilter(duration: string) {
        return this.hasuraService.transactionFilter(duration);
    }

    async updateUserStatus(id: number, createSaUserDto?: CreateSaUserDto) {
        const data = await this.hasuraService.findMedaceId(Number(id))
        if (data.CouponCode.length > 0) {
            const token_res = await this.middleware.getAccessToken();
            let promises = [];
            if (token_res) {
                let medacedata = data.CouponCode[0].medace_id
                for (let medace_id of medacedata) {
                    promises.push(this.middleware.deactivateCoupon(medace_id.id, token_res.access_token))
                }
                const deactivateCoupon = await Promise.all(promises);
                if (deactivateCoupon) {
                    const updateCoupon = await this.hasuraService.updateUserStatus(id, createSaUserDto)
                    return updateCoupon
                } else {
                    return { status: 'error', message: 'Unable to update User status' };
                }
            }
        }
    }

    // async reactivateUser(id:number, createSaUserDto?: CreateSaUserDto){
    //     const data = await this.hasuraService.reactivateUser(id)
    // }

    async createTransaction(createTransactionDto: CreateTransactionDto) {
        let userId = await this.hasuraService.findSaCode(createTransactionDto.saCode)
        if (userId) {
            let transaction = new Transaction()
            transaction.user_id = userId;
            transaction.learner_id = createTransactionDto.learner_id;
            transaction.transactionAmount = createTransactionDto.transactionAmount;
            transaction.transactionDateTime = new Date(createTransactionDto.transactionDateTime * 1);
            transaction.transactionId = createTransactionDto.transactionId;
            let createtransaction = await this.hasuraService.createTransaction(transaction)

            if (createtransaction) {
                let learner = await this.hasuraService.createLearner(createTransactionDto)
                if (learner) {
                    return createtransaction
                } else {
                    return "error"
                }
            } else {
                return 'Transaction Not Created'
            }
        } else {
            return { status: 'error', message: 'SA code not found' };
        }
    }

    async transactionLogs() {
        const logs = await this.hasuraService.transactionLogs()
        let transactionDataLogs = []
        for (let i = 0; i < logs.length; i++) {
            transactionDataLogs.push({
                'SA Name': logs?.[i]?.saUserRelation?.name,
                'SA Email': logs?.[i]?.saUserRelation?.email,
                'SA Mobile': logs?.[i]?.saUserRelation?.mobile,
                'code': logs?.[i]?.saUserRelation?.saCodeRelation.referralCode,
                'Learner Name': logs?.[i]?.learnerRelation?.name,
                'Learner Mobile': logs?.[i]?.learnerRelation?.phone,
                'Transaction Amount': logs?.[i]?.transactionAmount,
                'Learner Discount Amount': ((logs?.[i]?.transactionAmount * 40) / 100),
                'SA Commission Amount': ((logs?.[i]?.transactionAmount * 10) / 100),
                'Transaction Id': logs?.[i]?.transactionId,
                'Transaction Date': logs?.[i]?.transactionDateTime
            })

        }
        return transactionDataLogs;

    }
    arraysHaveSameElements(arr1, arr2) {
        if (arr1.length !== arr2.length) {
          return false; // Arrays have different lengths, so they can't be the same
        }
        return arr1.every((element) => arr2.includes(element)) &&
               arr2.every((element) => arr1.includes(element));
      }

    async uploadCsv(result) {
        const expectedHeaders = ['Amount Paid', 'Transaction Id', 'Transaction Date', 'SA Name', 'SA Email', 'SA Phone', 'SA Code'];
        const csvheader = Object.keys(result[0])
        const areHeadersValid = this.arraysHaveSameElements(expectedHeaders,csvheader)
        // const areHeadersValid = expectedHeaders.every((expectedHeader) => {
        //     return csvheader.includes(expectedHeader);
        // })
        const updates = [];

        if (areHeadersValid) {
            for (const log of result) {
                updates.push({
                    amountPaid: log['Amount Paid'],
                    transactionId: log['Transaction Id'],
                    transactionDate: log['Transaction Date'],
                    saEmail: log['SA EMAIL'],
                    saCode: log['SA Code']
                })

            }
            const response = []
            for (let i = 0; i < updates.length; i++) {
                const findID = await this.hasuraService.findUserId(updates[i].saCode)
                console.log(updates[0].transactionId);
                const transactionId = await this.hasuraService.findTransactionId(updates[i].transactionId)
                if (findID && transactionId && updates[i].amountPaid ) {
                    let transactionData = {
                        user_id: findID,
                        amountPaid: Number(updates[i].amountPaid),
                        transactionId: Number(updates[i].transactionId),
                        transactionDate: updates[i].transactionDate
                    }

                    const inserTrans = await this.hasuraService.uploadCsvData(transactionData)
                    if (inserTrans) {
                        const updateTrans = await this.hasuraService.updateTransactionStatus({ id: (updates[i].transactionId) })
                        console.log(updateTrans)
                        response.push(inserTrans)
                    }
                }else{
                   response.push(`Unable to Find SA Code or Transaction ID. ${" UserId = " +  findID + " transactionId = " + updates[i].transactionId}`) 
                }
            }
            return response;
        
        } else {
            return {
                error: "Invalid CSV headers"
            }
        }
    }

    async transactionsPoint(id) {
        let transactionCount = await this.hasuraService.getTransactionCount(id);

        if (transactionCount) {
            console.log("transactionCount", transactionCount.data.Transaction_aggregate.aggregate.count)
            console.log("transactionAmount", transactionCount.data.Transaction_aggregate.aggregate.sum.transactionAmount)

            let count = transactionCount.data.Transaction_aggregate.aggregate.count
            let points = count * 10
            let level = Math.floor(points / 10000)
            let transactionAmount = transactionCount.data.Transaction_aggregate.aggregate.sum.transactionAmount
            let referalCode = transactionCount.data.SA_user[0].referralCode

            return { transactionCount: count, points: points, level: level, transactionAmount: transactionAmount, referalCode: referalCode }
        } else {
            return { transactionCount: 0, points: 0, level: 0, transactionAmount: 0, referalCode: null }
        }

    }

    async totalCommissionDetails() {
        let data = await this.hasuraService.getTransaction();
        const transactions = data.data.Transaction;
        console.log(transactions)
        const totalCommission = transactions.reduce((total, transaction) => {
            const commissionAmount = (transaction.transactionAmount * transaction?.saUserRelation?.saCodeRelation?.commission || 0) / 100;
            return total + commissionAmount;
        }, 0);
        return {
            "totalCommission": totalCommission
        };

    }

    async pendingCommissionDetails() {
        const data = await this.hasuraService.pendingTransaction()
        const transactions = data.data.Transaction;
        const pendingCommission = transactions.reduce((total, transaction) => {
            const commissionAmount = (transaction?.transactionAmount * transaction?.saUserRelation?.saCodeRelation?.commission || 0) / 100;
            return total + commissionAmount;
        }, 0);
        return {
            "PendingCommission": pendingCommission
        };
    }

    async pendingPaymentDetails() {
        const data = await this.hasuraService.pendingTransaction();
        return data
    }

    // async paymentDetails(id: number) {
    //     let totalPaymentDetails = await this.hasuraService.totalPayment({ id })
    //     let amountPaidDetails = await this.hasuraService.totalAmountPaid(id)

    //     let totalPayment = totalPaymentDetails.data.Transaction_aggregate.aggregate.sum.transactionAmount
    //     let amountPaid = amountPaidDetails.data.SA_payment_aggregate.aggregate.sum.amountPaid

    //     const paymentDetails = {
    //         totalPayment: totalPayment,
    //         pendingPayment: totalPayment - amountPaid,
    //     };
    //     return paymentDetails;
    // }

    sendEmail(email, name, mobile, referalCode) {
        return this.emailService.sendWelcomeEmail(email, name, mobile, referalCode)
    }

    getMedaceToken() {
        return this.middleware.getAccessToken()
    }

    getAllPlans(token) {
        return this.middleware.getAllPlans(token)
    }

    createCoupon(couponData, token) {
        // let coupon = this.emailService.generateRefCode("surajcs206@gmail.com")
        // console.log("coupon", coupon)
        // return
        return this.middleware.createCoupon(couponData, token)
    }
}

