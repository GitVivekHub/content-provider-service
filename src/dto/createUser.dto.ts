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

    organization:string

    approved:boolean

    reason:string

    source_code:string
}