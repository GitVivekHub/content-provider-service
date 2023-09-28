import { Controller,Post,UseGuards,Request, Body} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role.guard';
import {ProviderService} from './provider.service'
import {LoggerService} from '../services/logger/logger.service'
import {CreateContentDto} from '../dto/createContent.dto'

@Controller('provider')
export class ProviderController {
    
    constructor (private readonly providerService:ProviderService, private readonly logggerService:LoggerService){}
    @Post('/createContent')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("provider"))
    async createContent(@Request() request,@Body() createContentdto?:CreateContentDto){
        console.log(createContentdto);
        this.logggerService.log('POST /createContent',request.user.id);
        let id = request.user.id
        console.log("id",id)
        return this.providerService.createContent(id,createContentdto)
    }
}
