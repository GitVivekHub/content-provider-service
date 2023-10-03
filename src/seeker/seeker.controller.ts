import { Body, Controller, Patch, UseGuards, Request, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateContentDto } from 'src/dto/createContent.dto';
import { ResetPasswordDto } from 'src/dto/resetPassword.dto';
import { RoleGuard } from 'src/role.guard';
import { LoggerService } from 'src/services/logger/logger.service';
import { SeekerService } from './seeker.service';

@Controller('seeker')
export class SeekerController {

    constructor (private readonly seekerService:SeekerService, private readonly logggerService:LoggerService){}

    @Patch('/resetPassword')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("seeker"))
    async resetPassword(@Request() request, @Body() resetPasswordDto: ResetPasswordDto){
        this.logggerService.log('Patch /resetPassword',request.user.id);
        return this.seekerService.resetPassword(request.user.email, resetPasswordDto)
    }

    @Post('/getContent')
    async getContent(@Request() request,@Body() getContentdto?:CreateContentDto){
        console.log("getContentdto", getContentdto);
        this.logggerService.log('POST /getContent');
        return this.seekerService.getContent(getContentdto)
    }
    
}
