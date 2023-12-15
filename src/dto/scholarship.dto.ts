import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ScholarshipDto {
    provider_id: number
    domain: string
    name: string
    description: string
    provider: string
    creator: string
    category: string
    applicationDeadline: string
    amount: number
    duration: string
    eligibilityCriteria: string
    applicationProcessing: string
    selectionCriteria: string
    noOfRecipients: string
    termsAndConditions: string
    additionalResources: string
    applicationForm: string
    applicationSubmissionDate: string
    contactInformation: string
    status: string
    keywords: string

}