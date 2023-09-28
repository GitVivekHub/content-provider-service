import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateContentDto {

    @IsNotEmpty()
    @IsNumber()
    code:number


    @IsNotEmpty()
    @IsNumber()
    competency:string
    contentType:string
    description:string
    domain:string
    goal:string
    language:string
    link:string
    sourceOrganisation:string
    themes:string
    title:string
    user_id:string


    image:string
}