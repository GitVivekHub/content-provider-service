import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HasuraService } from 'src/services/hasura/hasura.service';
import * as bcrypt from "bcrypt"

@Injectable()
export class SeekerService {

    constructor (private readonly hasuraService:HasuraService){}

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

    async getContent(getContentdto) {
        return this.hasuraService.findContent1(getContentdto);
    }

    async searchCollection(getCollectiondto) {
        return this.hasuraService.findCollection(getCollectiondto);
    }

    async createContentBookmark(id,createContentdto){
        return this.hasuraService.createContentBookmark(id,createContentdto)
    }

    async removeBookmarkContent(id, seeker_id){
        return this.hasuraService.removeBookmarkContent(id, seeker_id)
    }

    // async getBookmarkContent(seeker_id){
    //     return this.hasuraService.getBookmarkContent(seeker_id)
    // }

    async getCollection() {
        return this.hasuraService.getAllCollection()
    }

    async getCollectionContent(id) {
        return this.hasuraService.getCollectionContent(id)
    }

    async createBookmark(seeker_id, body) {
        return this.hasuraService.createBookmark(seeker_id, body)
    }

    async getBookmark(seeker_id) {
        return this.hasuraService.getBookmark(seeker_id)
    }

    async getBookmarkContent(id, seeker_id) {
        return this.hasuraService.getBookmarkContent(id, seeker_id)
    }

    async updateBookmark(id, seeker_id, body) {
        return this.hasuraService.updateBookmark(id, seeker_id, body)
    }

    async deleteBookmark(id, seeker_id) {
        return this.hasuraService.deleteBookmark(id, seeker_id)
    }

    async addContentBookmark(body) {
        return this.hasuraService.addContentBookmark(body)
    }

    async deleteContentBookmark(id, seeker_id) {
        return this.hasuraService.deleteContentBookmark(id, seeker_id)
    }

    async createConfig(user_id,body){
        return this.hasuraService.createConfig(user_id,body)
    }

    async getConfig(user_id) {
        return this.hasuraService.getConfig(user_id)
    }
}
