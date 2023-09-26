import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateSaUserDto } from '../dto/sa-user.dto'
import { User } from '../entity/user.entity'
import { HasuraService } from 'src/services/hasura/hasura.service';
import {EmailService} from 'src/services/email/email.service'


@Injectable()
export class UsersService {

    // constructor(
    //     @InjectRepository(User) private readonly userRepository: Repository<User>,
    //     @InjectRepository(Enrollment) private readonly enrollmentRepository: Repository<Enrollment>,
    //     @InjectRepository(Assesment) private readonly assesmentRepository: Repository<Assesment>,
    //     @InjectRepository(Benefit) private readonly benefitRepository: Repository<Benefit>
    // ) { }
    constructor(
        private readonly hasuraService: HasuraService,
        private readonly emailService: EmailService
    ) { }

    updateUserDetails(id: number, createSaUserDto?: CreateSaUserDto): Promise<User> {
        return this.hasuraService.updateUsersDetails(id, createSaUserDto)
    }


    findById(id: number): Promise<User[]> {
        return this.hasuraService.getUserById(id)
    }

    findOne(email: string): Promise<User> {
        return this.hasuraService.getUserByUsername(email);
    }

    findUserMobile(mobile: string, role: string): Promise<User> {
        console.log(mobile, role)
        return this.hasuraService.getUserByMobile(mobile, role)
    }

    deleteById(id: number) {
        return this.hasuraService.deleteById(id);
    }

    findUserDetail(id: number) {
        return this.hasuraService.findUserDetail(id);
    }

    getTransactionById(id) {
        return this.hasuraService.getTransactionById(id);
    }

    getUserTransaction(id){
        console.log(id);
        return this.hasuraService.getUserTransaction(id);
    }


    async transactionsPoint(id) {
        let transactionCount = await this.hasuraService.getTransactionCount(id);

        if (transactionCount) {
            console.log("transactionCount", transactionCount.data.Transaction_aggregate.aggregate.count)
            console.log("transactionAmount", transactionCount.data.Transaction_aggregate.aggregate.sum.transactionAmount)
            
            let count = transactionCount.data.Transaction_aggregate.aggregate.count
            let points = count * 10
            let level = Math.floor(points/10000)
            let transactionAmount = transactionCount.data.Transaction_aggregate.aggregate.sum.transactionAmount
            let referalCode = transactionCount.data.SA_user[0].referralCode

            return { transactionCount: count, points: points, level: level, transactionAmount: transactionAmount, referalCode: referalCode }
        } else {
            return { transactionCount: 0, points: 0, level: 0, transactionAmount: 0, referalCode: null}
        }

    }

    async paymentDetails(id:number){
        let totalPaymentDetails = await this.hasuraService.totalPayment({id})
        let amountPaidDetails = await this.hasuraService.totalAmountPaid(id)

        let totalPayment = totalPaymentDetails.data.Transaction_aggregate.aggregate.sum.transactionAmount
        let amountPaid = amountPaidDetails.data.SA_payment_aggregate.aggregate.sum.amountPaid

        const paymentDetails = {
            totalPayment: totalPayment,
            pendingPayment: totalPayment - amountPaid,
          };

        return paymentDetails;
        
    }

    async pendingPaymentDetails(id:number){
            const userId = id
            const requiredData = await this.hasuraService.getTransactionByUserID(userId)
            return requiredData;
            
    }

    async totalCommissionDetail(id){
        let data = await this.hasuraService.getUserTransaction(id)
        const transactions = data.data.Transaction;

        const totalCommission = transactions.reduce((total, transaction) => {
            const commissionAmount = (transaction.transactionAmount * transaction?.saUserRelation?.saCodeRelation?.commission ?? 0) / 100;
            return total + commissionAmount;
          }, 0);
          console.log(totalCommission);
          return {
           "totalCommission": totalCommission
        };
    }

    async pendingCommissionDetails(id){
        const data = await this.hasuraService.getTransactionByUserID(id)
        const transactions = data.data.Transaction;
        const pendingCommission = transactions.reduce((total, transaction) => {
            const commissionAmount = (transaction.transactionAmount * transaction?.saUserRelation?.saCodeRelation?.commission ?? 0) / 100;
            return total + commissionAmount;
          }, 0);
          console.log(pendingCommission)
          return {
           "PendingCommission": pendingCommission
        };
    }

    async createNewUser(payload) {
        const user = await this.hasuraService.createNewUser(payload)
        console.log(user)
        let id = user?.data?.insert_Requested_user?.returning[0]?.id
        if(id){
            await this.emailService.sendRequestedUserEmail(payload)
        }
        return user
    }
}
