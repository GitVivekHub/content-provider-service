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
    content_id: string
    publisher: string
    collection: boolean
    urlType: string
    url: string
    mimeType: string
    minAge: number
    maxAge: number
    author: string
    curricularGoals: string
    learningOutcomes: string
    category: string
}