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

    @IsString()
    approved:boolean

    @IsString()
    reason:string

    @IsString()
    source_code:string

    @IsString()
    enable: string
}