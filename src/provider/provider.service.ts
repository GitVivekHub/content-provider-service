import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {HasuraService} from '../services/hasura/hasura.service'
import { CreateContentDto } from 'src/dto/createContent.dto';
import * as bcrypt from "bcrypt"

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

    async resetPassword(email, resetPasswordDto) {
        console.log("email", email)
        console.log("resetPasswordDto", resetPasswordDto)
        const user = await this.hasuraService.findOne(email)
        if(user) {
            const passwordMatches = await bcrypt.compare(resetPasswordDto.currentPassword, user.password);
            if(passwordMatches) {
                const newPassword = await bcrypt.hash(resetPasswordDto.newPassword,10) 
                return this.hasuraService.updatePassword(user.id, newPassword)
                
            } else {
                throw new HttpException('Password is incorrect!', HttpStatus.UNAUTHORIZED);
            }
            
        }
    }

    async createCollection(provider_id, body) {
      return this.hasuraService.createCollection(provider_id, body)
    }

    async getCollection(provider_id) {
        return this.hasuraService.getCollection(provider_id)
    }

    async updateCollection(id, provider_id, body) {
        return this.hasuraService.updateCollection(id, provider_id, body)
    }

    async deleteCollection(id, provider_id) {
        return this.hasuraService.deleteCollection(id, provider_id)
    }
}
