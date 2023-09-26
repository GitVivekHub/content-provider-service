import { Body, Controller, Get, Param, Post, Res, Put, Patch, Delete, UseGuards, HttpException, HttpStatus, UseInterceptors, UploadedFile, ValidationPipe, UsePipes, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateTransactionDto } from '../dto/create-transaction.dto'
import { Requesteduserdto } from 'src/dto/requested-user-dto';
import { CreateLearnerDto } from 'src/dto/learner-dto';
import { AdminService } from './admin.service';
import { Response, response } from 'express';
import * as fs from 'fs';
import { CsvService } from 'src/services/csv/csv.service';
import { CreateSaUserDto } from '../dto/sa-user.dto'
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import * as csvParser from 'csv-parser';
import { diskStorage } from 'multer';
import { UploadDataDto } from 'src/dto/uploadCsv.dto';
import { validate, IsNotEmpty } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoggerService } from 'src/services/logger/logger.service';
import * as path from 'path';


@Controller('admin')
export class AdminController {

    constructor(public adminService: AdminService, private readonly csvService: CsvService,private readonly logger:LoggerService) { }

    @Post('/register')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    @UsePipes(ValidationPipe)
    async create(@Body() createUserDto: CreateUserDto) {
        this.logger.log('POST /register',`User Email Id : ${createUserDto.email}`);
        return this.adminService.create(createUserDto);
    }

    @Get('/users')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async findAll() {
        this.logger.log('POST /users','getAll Users Fetched API');
        return this.adminService.findAll()
    }

    @Get('/findOne/:username')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async findOne(@Param('username') username) {
        return this.adminService.findOne(username)

    }

    @Get('/userById/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async findById(@Param('id') id) {
        this.logger.log('GET /userById/:id',id);
        return this.adminService.findOneById(id)
    }

    @Delete('/deleteById/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async deleteById(@Param('id') id) {
        return this.adminService.deleteById(id)
    }

    @Get('/transaction')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async transaction() {
        this.logger.log('GET /transaction','get all Transaction API');
        return this.adminService.getTransaction()

    }

    @Get('/transactionFilter/:duration')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async transactionFilter(@Param('duration') duration) {
        return this.adminService.transactionFilter(duration)

    }

    @Get('/transactionById/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async transactionById(@Param('id') id) {
        return this.adminService.getTransactionById(id)
    } 

    @Get('/downloadCsvFile')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async downloadCsv(@Res() res: Response) {

        const data = await this.adminService.transactionLogs()
        this.logger.log('GET /downloadCsvFile',"Transaction Log fetched for CSV")
        const headers = ['SA Name', 'SA Email', 'SA Mobile', 'code', 'Learner Name', 'Learner Mobile', 'Transaction Amount', 'Learner Discount Amount', 'SA Commission Amount', 'Transaction Id', 'Transaction Date'];
        const fileName = 'transactions.csv';

        await this.csvService.createCsvFile(data, headers, fileName);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        const fileStream = fs.createReadStream(fileName);
        fileStream.pipe(res);
    }

    @Patch('/updateUserProfile/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async updateProfile(@Param('id') id: number, @Body() createSaUserDto?: CreateSaUserDto) {
        this.logger.log('Patch /updateUserProfile/:id',`Update user Profile for ${id}`)
        return this.adminService.updateProfile(id, createSaUserDto);

    }

    @Patch('/updateUserStatus/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    updateUserStatus(@Param('id') id: number, @Body() createSaUserDto?: CreateSaUserDto) {
        this.logger.log('Patch /updateUserStatus/:id',`Update status for User id ${id}`)
        return this.adminService.updateUserStatus(id, createSaUserDto)
    }

    @Post('/createTransaction')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    @UsePipes(ValidationPipe)
    async createTransaction(@Body() payload: CreateTransactionDto) {
        this.logger.log('Post /createTransaction','created transaction API Hit')
        return this.adminService.createTransaction(payload);
    }

    // @Patch('/reactivateUser/:id')
    // @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    // reactivateUser(@Param('id') id: number, @Body() createSaUserDto?: CreateSaUserDto) {
    //     return this.adminService.reactivateUser(id, createSaUserDto)
    // }


    @Post('/uploadCsvFile')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './files'
        })
    }))
    async uploadCSV(@UploadedFile() file: Express.Multer.File) {
        const results = [];
        this.logger.log('uploadCsv /upload API')
        return new Promise((resolve, reject) => {
            createReadStream(file.path)
                .pipe(csvParser())
                .on('data', (data) => {
                    results.push(data)
                }
                )
                .on('end', async () => {
                    const data = await this.adminService.uploadCsv(results)
                    resolve(data)
                })
                .on('error', (error) => {
                    reject(error);
                })
        })

    }

    @Get('/transactionsPoint/:id')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    transactionPoint(@Param('id') id: number) {
        return this.adminService.transactionsPoint(id)
    }

    @Get('/totalCommissionDetails')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async totalPaymentDetails() {
        this.logger.log('Get /totalCommissionDetails')
        return this.adminService.totalCommissionDetails()
    }

    @Get('/pendingCommissionDetails')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async pendingCommissionDetails() {
        this.logger.log('Get /pendingCommissionDetails')
        return this.adminService.pendingCommissionDetails()
    }


    // @Get('/paymentDetails/:id')
    // @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    // async paymentDetails(@Param('id') id) {
    //     return this.adminService.paymentDetails(id)
    // }

    @Get('/pendingPaymentDetails')
    @UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    async pendingPaymentDetails() {
        return this.adminService.pendingPaymentDetails();
    }

    @Get('/saDetails/:code')
    async saDetails(@Param('code') saCode: string) {
        return this.adminService.saDetails(saCode)
    }

    // @Get('/downloadCsvFileUser')
    // //@UseGuards(AuthGuard("jwt"), new RoleGuard("admin"))
    // async downloadUserCsv(@Res() res: Response) {

    //     const data = await this.adminService.userLogs()

    //     const headers = ['Name','Email','mobile','approved'];
    //     const fileName = 'requesteduser.csv';

    //     await this.csvService.createCsvFile(data, headers, fileName);

    //     res.setHeader('Content-Type', 'text/csv');
    //     res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    //     const fileStream = fs.createReadStream(fileName);
    //     fileStream.pipe(res);
    // }
    // @Post('/sendEmail')
    // async sendEmail(@Body() body) {
    //     let email = body.email
    //     let subject = body.subject
    //     let text = body.text
    //     let name = body.name
    //     return this.adminService.sendEmail(email, name, text)
    // }

    @Post('/getMedaceToken')
    async getMedaceToken() {
        return this.adminService.getMedaceToken()
    }

    @Post('/getAllPlans')
    async getAllPlans(@Body() body) {
        console.log("token", body.token)
        return this.adminService.getAllPlans(body.token)
    }

    @Post('/createCoupon')
    async createCoupon(@Body() body) {
        console.log("body", body)
        return this.adminService.createCoupon(body.couponData, body.token)
    }

    
}







