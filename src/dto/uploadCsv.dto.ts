import { IsNotEmpty } from 'class-validator';

export class UploadDataDto {
  @IsNotEmpty({ message: 'Amount Paid is required' })
  amountPaid: number;

  @IsNotEmpty({ message: 'Transaction Id is required' })
  transactionId: string;

  @IsNotEmpty({ message: 'Transaction Date is required' })
  transactionDate: Date;

  @IsNotEmpty({ message: 'SA Email is required' })
  saEmail: string;

  @IsNotEmpty({ message: 'SA Code is required' })
  saCode: string;
}
