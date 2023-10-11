import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateContentDto {

    code:number
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
    seeker_id:string
}