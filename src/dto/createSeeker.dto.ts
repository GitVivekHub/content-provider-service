import {IsNotEmpty,IsString} from 'class-validator'

export class CreateSeekerDto {
    user_id:number
    siteName: string
    siteByLine: string
    logo: string
    apiEndPoint: string
    positionSiteName: boolean
    positionByLine: boolean
    positionLogo: boolean
    bookmark: string
    rating: string
    share: string
    filters: {}
    displayOrder: {}
    orderBy: string
    filterBy: string
    pagination: number
    lableTitle: string
    lableAuthor: string
    lableDesc: string
    lableRating: string
}