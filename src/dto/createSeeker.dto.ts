import {IsNotEmpty,IsString} from 'class-validator'

export class CreateSeekerDto {
    @IsString()
    @IsNotEmpty()
    organization:string

    @IsString()
    @IsNotEmpty()
    source_code:string

    address:string

    user_id:number
}