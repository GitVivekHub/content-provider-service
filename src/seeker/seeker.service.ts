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
        return this.hasuraService.findContent(getContentdto);
    }
}
