import { IsNotEmpty, IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
    id: number;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @Matches(/^[6-9]\d{9}$/)
    mobile: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsString()
    @Matches("[A-Z]{5}[0-9]{4}[A-Z]{1}")
    pan:string


    @IsNotEmpty()
    @IsString()
    collegeName: string;
    courseYear: string;
    addressLine1: string;
    addressLine2: string;
    bankName: string;
    accountNo: string;
    role: string;
    name: string;

    @IsNotEmpty()
    @IsString()
    ifscCode: string;
    referralCode: string;
    discount: string;
    commission: string;
    quantity: number;
    state:string;
    areaSalesManager:string
   
    status: boolean;

    addressLine3:string
}
