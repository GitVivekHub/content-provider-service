import {IsNotEmpty,IsString} from 'class-validator'

export class CreateProviderDto {
    @IsString()
    @IsNotEmpty()
    organization:string

    @IsString()
    @IsNotEmpty()
    source_code:string

    user_id:number
}