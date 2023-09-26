import { IsNotEmpty, IsEmail,IsString,MinLength,Matches } from 'class-validator';

export class Requesteduserdto{
    id:number

    @IsNotEmpty()
    name:string

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @Matches(/^[6-9]\d{9}$/)
    mobile:string

    @IsNotEmpty()
    @IsEmail()
    email

}