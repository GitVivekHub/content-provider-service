import { Controller,Post,UseGuards,Request, Body, Get, Patch, Param, Delete} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role.guard';
import {ProviderService} from './provider.service'
import {LoggerService} from '../services/logger/logger.service'
import {CreateContentDto} from '../dto/createContent.dto'
import { ResetPasswordDto } from 'src/dto/resetPassword.dto';

@Controller('provider')
export class ProviderController {
    
    constructor (private readonly providerService:ProviderService, private readonly logggerService:LoggerService){}

    @Post('/content')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async createContent(@Request() request,@Body() createContentdto?:CreateContentDto){
        console.log("user", request.user);
        console.log("createContentdto", createContentdto);
        this.logggerService.log('POST /createContent',request.user.id);
        let id = request.user.id
        console.log("id",id)
        return this.providerService.createContent(id,createContentdto)
    }

    @Get('/content')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async getContent(@Request() request){
        this.logggerService.log('GET /getContent',request.user.id);
        return this.providerService.getContent(request.user.id)
    }

    @Patch('/content/:id')
    // @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async editContent(@Request() request,@Param('id') id, @Body() createContentdto?:CreateContentDto){
        console.log("createContentdto", createContentdto);
        return this.providerService.editContent(id,createContentdto)
    }

    @Patch('/resetPassword')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async resetPassword(@Request() request, @Body() resetPasswordDto: ResetPasswordDto){
        this.logggerService.log('Patch /resetPassword',request.user.id);
        return this.providerService.resetPassword(request.user.email, resetPasswordDto)
    }

    @Post('/collection')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async createCollection(@Request() request,@Body() body){
        this.logggerService.log('POST /createContent',request.user.id);
        let provider_id = request.user.id
        console.log("provider_id",provider_id)
        console.log("body", body);
        return this.providerService.createCollection(provider_id, body)
    }

    @Get('/collection')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async getCollection(@Request() request){
        this.logggerService.log('POST /createContent',request.user.id);
        let provider_id = request.user.id
        console.log("provider_id",provider_id)
        return this.providerService.getCollection(provider_id)
    }

    @Patch('/collection/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async updateCollection(@Request() request, @Param('id') id, @Body() body){
        this.logggerService.log('POST /updateCollection',request.user.id);
        let provider_id = request.user.id
        console.log("provider_id",provider_id)
        console.log("id",id)
        console.log("body",body)
        return this.providerService.updateCollection(id, provider_id, body)
    }

    @Delete('/collection/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async deleteCollection(@Request() request, @Param('id') id){
        this.logggerService.log('POST /deleteCollection',request.user.id);
        let provider_id = request.user.id
        console.log("provider_id",provider_id)
        console.log("id",id)
        return this.providerService.deleteCollection(id, provider_id)
    }
}
