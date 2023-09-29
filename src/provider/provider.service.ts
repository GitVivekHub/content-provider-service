import { Injectable } from '@nestjs/common';
import {HasuraService} from '../services/hasura/hasura.service'
import { CreateContentDto } from 'src/dto/createContent.dto';

@Injectable()
export class ProviderService {

    constructor (private readonly hasuraService:HasuraService){}
    async createContent(id,createContentdto){
        // const content = new CreateContentDto();
        // content.code = createContentdto.code
        // content.competency = createContentdto.competency
        // content.contentType = createContentdto.contentType
        // content.description = createContentdto.description
        // content.domain = createContentdto.domain
        // content.goal = createContentdto.goal
        // content.language = createContentdto.language
        // content.link = createContentdto.link
        // content.sourceOrganisation = createContentdto.sourceOrganisation
        // content.themes = createContentdto.themes
        // content.title = createContentdto.title
        // content.image = createContentdto.image || null;
        return this.hasuraService.createContent(id,createContentdto)
    }

    async getContent(id){
        return this.hasuraService.getContent(id)
    }

    async editContent(id,createContentdto){
        return this.hasuraService.editContent(id,createContentdto)
    }
}
