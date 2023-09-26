import { Controller, Post, UseGuards, Request, Get, UsePipes, ValidationPipe, Res, Body, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { OtpSendDTO } from './dto/otp-send.dto';
import { OtpVerifyDTO } from './dto/otp-verify.dto';
import {CreateuserDto} from '../dto/createUser.dto'
import { Response } from 'express';
import { LoggerService } from 'src/services/logger/logger.service';
import * as fs from 'fs';
import { promisify } from 'util';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService, private readonly logger: LoggerService) { }
    @Post('/register')
    @UsePipes(ValidationPipe)
    async create(@Body() createUserDto: CreateuserDto) {
        this.logger.log('POST /register',`User Email Id : ${createUserDto.email}`);
        return this.authService.create(createUserDto);
    }

    @Post('/login1')
    async login1(@Body() request, @Res() response: Response){
        console.log(request);
        let token=this.authService.generateToken(request)
        let validUser = await this.authService.validateUser(request)
        delete request.password
        if(validUser){
            return response.status(200).json({
                success: true,
                message: 'Logged in successfully!',
                data: {
                    token: token,
                    user: request.user
                }
            }); 
        }
        else{
            return response.status(200).json({
                success: true,
                message: 'Logged in Failed',
                data: {
                    token: token,
                    user: request.user
                }
            }); 
        }
    }
    @Post('/login')
    @UseGuards(AuthGuard("local"))
    login(@Request() request, @Res() response: Response) {
        this.logger.log('POST /login');
        let token = this.authService.generateToken(request.user)
        this.logger.log('POST /login','logged In successfully')
        delete request.user.password
        return response.status(200).json({
            success: true,
            message: 'Logged in successfully!',
            data: {
                token: token,
                user: request.user
            }
        });
    }

    @Post('/otp-send')
    @UsePipes(ValidationPipe)
    public sendOtp(@Body() body: OtpSendDTO, @Res() response: Response) {
        this.logger.log('POST /otp-send',);
        return this.authService.sendOtp(body, response);
    }

    @Post('/otp-verify')
    @UsePipes(ValidationPipe)
    public verifyOtp(@Body() body: OtpVerifyDTO, @Res() response: Response) {
        this.logger.log('POST /otp-verify',);
        return this.authService.verifyOtp(body, response);
    }

    @Get('info-log')
    async infoLog() {
        try {
            const readFile = promisify(fs.readFile);
            const data = await readFile('combined.log', 'utf-8');
            return data;
        } catch (error) {
            // Handle errors, e.g., file not found or invalid JSON
            throw new Error('Unable to fetch data');
        }
    }

    @Get('error-log')
    async errorLog() {
        try {
            const readFile = promisify(fs.readFile);
            const data = await readFile('error.log', 'utf-8');
            return data;
        } catch (error) {
            // Handle errors, e.g., file not found or invalid JSON
            throw new Error('Unable to fetch data');
        }
    }

}
