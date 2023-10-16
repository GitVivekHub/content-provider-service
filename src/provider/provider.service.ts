import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {HasuraService} from '../services/hasura/hasura.service'
import { CreateContentDto } from 'src/dto/createContent.dto';
import * as bcrypt from "bcrypt"

@Injectable()
export class ProviderService {

    constructor (private readonly hasuraService:HasuraService){}
    async createContent(id,createContentdto){
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

    async getCollectionContent(id) {
        return this.hasuraService.getCollectionContent(id)
    }

    async updateCollection(id, provider_id, body) {
        return this.hasuraService.updateCollection(id, provider_id, body)
    }

    async deleteCollection(id, provider_id) {
        return this.hasuraService.deleteCollection(id, provider_id)
    }

    async createContentCollection(body) {
        return this.hasuraService.createContentCollection(body)
    }

    async deleteContentCollection(id) {
        return this.hasuraService.deleteContentCollection(id)
    }
}
