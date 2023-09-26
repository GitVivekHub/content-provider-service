import {IsNotEmpty} from 'class-validator'

export class CreateTransactionDto {

    @IsNotEmpty()
    saCode: string

    @IsNotEmpty()
    learner_id:string

    @IsNotEmpty()
    learnerName: string

    @IsNotEmpty()
    learnerEmail: string

    @IsNotEmpty()
    learnerPhone: string

    @IsNotEmpty()
    transactionId: string

    @IsNotEmpty()
    transactionAmount: number
    
    @IsNotEmpty()
    transactionDateTime: number
}
