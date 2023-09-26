import {IsNotEmpty,IsEmail,IsString} from 'class-validator'

export class CreateuserDto {
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsNotEmpty()
    name:string

    @IsNotEmpty()
    @IsString()
    role:string

    @IsNotEmpty()
    @IsString()
    password:string

    approved:boolean
}