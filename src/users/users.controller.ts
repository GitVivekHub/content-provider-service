import { Body, Controller, Get, Param, Post, Patch, UseGuards, Request,Res } from '@nestjs/common';
import {Response} from 'express'
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role.guard';
import {CreateSaUserDto} from '../dto/sa-user.dto'
import { UsersService } from './users.service';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { Requesteduserdto } from 'src/dto/requested-user-dto';
import { LoggerService } from 'src/services/logger/logger.service';

@Controller('users')
export class UsersController {

    constructor(private readonly userService:UsersService, private readonly logger: LoggerService){}
    

    @Patch('/updateProfile')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("student"))
    async create(@Request() req,@Body() createSaUserDto?:CreateSaUserDto) {
        this.logger.log('PATCH /updateProfile',req.user.id);
        const id = req.user.id
        return this.userService.updateUserDetails(id,createSaUserDto);
    }

    @Get('/profile/')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("student"))
    async getProfile(@Request() req){
        this.logger.log('GET /profile',req.user.id);
        const id = req.user.id
        return this.userService.findUserDetail(id)
        
    }

    @Get('/transactions')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("student"))
    transactionById(@Request() request){
        this.logger.log('GET /transactions',request.user.id);
        let id = request.user.id
        return this.userService.getUserTransaction(id);
    }

    @Get('/transactionsPoint')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("student"))
    transactionPoint(@Request() request){
        this.logger.log('GET /transactionsPoint');
        let id = request.user.id
        return this.userService.transactionsPoint(id)
    }

    @Get('/paymentDetails')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("student"))
    async paymentDetails(@Request() request){
        this.logger.log('GET /paymentDetails');
        let id = request.user.id
        return this.userService.paymentDetails(id)
    }
    

    @Get('/totalCommissionDetails')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("student"))
    async totalPaymentDetails(@Request() request) {
        this.logger.log('GET /totalCommissionDetails');
        let id = request.user.id
        return this.userService.totalCommissionDetail(id)
    }

    @Get('/pendingCommissionDetails')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("student"))
    async pendingCommissionDetails(@Request() request) {
        this.logger.log('GET /pendingCommissionDetails');
        let id = request.user.id
        return this.userService.pendingCommissionDetails(id)
    }

    @Get('/pendingPaymentDetails')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("student"))
    async pendingPaymentDetails(@Request() request){
        this.logger.log('GET /pendingPaymentDetails');
        let id = request.user.id
        return this.userService.pendingPaymentDetails(id)
    }

    @Post('/requestUser')
    async inviteUser(@Body() requestedUserDto: Requesteduserdto) {
        this.logger.log('POST /requestUser');
        return this.userService.createNewUser(requestedUserDto)
    }

}
