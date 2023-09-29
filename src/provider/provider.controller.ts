import { Controller,Post,UseGuards,Request, Body, Get, Patch, Param} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role.guard';
import {ProviderService} from './provider.service'
import {LoggerService} from '../services/logger/logger.service'
import {CreateContentDto} from '../dto/createContent.dto'

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
}
