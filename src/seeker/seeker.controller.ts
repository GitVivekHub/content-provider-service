import { Body, Controller, Patch, UseGuards, Request, Post, Delete, Param, Get } from '@nestjs/common';
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

    @Post('/searchContent')
    async getContent(@Request() request,@Body() getContentdto?:CreateContentDto){
        console.log("getContentdto", getContentdto);
        this.logggerService.log('POST /getContent');
        return this.seekerService.getContent(getContentdto)
    }

    @Post('/searchCollection')
    async searchCollection(@Request() request,@Body() body){
        console.log("getCollectionDto", body);
        this.logggerService.log('POST /getCollection');
        return this.seekerService.searchCollection(body)
    }

    @Post('/bookmarkContent')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("seeker"))
    async createContentBookmark(@Request() request,@Body() createContentdto?:CreateContentDto){
        console.log("user", request.user);
        console.log("createContentdto", createContentdto);
        this.logggerService.log('POST /createContent',request.user.id);
        let id = request.user.id
        console.log("id",id)
        return this.seekerService.createContentBookmark(id,createContentdto)
    }

    @Delete('/bookmarkContent/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("seeker"))
    async removeBookmarkContent(@Request() request, @Param('id') id){
        console.log("user", request.user);
        this.logggerService.log('POST /createContent',request.user.id);
        let seeker_id = request.user.id
        console.log("id",id)
        return this.seekerService.removeBookmarkContent(id, seeker_id)
    }

    @Get('/bookmarkContent')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("seeker"))
    async getBookmarkContent(@Request() request){
        console.log("user", request.user);
        this.logggerService.log('POST /createContent',request.user.id);
        let seeker_id = request.user.id
        return this.seekerService.getBookmarkContent(seeker_id)
    }

    @Get('/collection')
    async getCollection(@Request() request){
        return this.seekerService.getCollection()
    }

    @Get('/collection/:id')
    async getCollectionContent(@Request() request, @Param('id') id){
        return this.seekerService.getCollectionContent(id)
    }
    
}
