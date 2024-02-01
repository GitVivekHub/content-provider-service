import {IsNotEmpty,IsEmail,IsString} from 'class-validator'

export class CreateUserDto {
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

    @IsString()
    organization:string

    
    source_code:string

    approved:boolean
    enable: string
    gender : string
    age : string
    phone: string


}