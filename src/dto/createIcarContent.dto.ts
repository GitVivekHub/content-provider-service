import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateIcarContentDto {
    id:number
    content_id:string
    title:string
    description:string
    icon:string
    publisher:string
    crop:string
    url:string
    state:string[]
    district:string[]
    region:string[]
    language:string
    target_users:string[]
    publishDate: string
    expiryDate: string
    branch: string[]
    fileType: string
    contentType: string
    monthOrSeason: string
    user_id:number
}