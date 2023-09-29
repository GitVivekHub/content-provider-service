import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { EmailService } from 'src/services/email/email.service';
import { CreateUserDto } from '../dto/createUser.dto'
import * as bcrypt from 'bcrypt';


// import {axios} from 'axios';


@Injectable()
export class AdminService {

    private readonly baseUrl: string;
    constructor(
        private readonly hasuraService: HasuraService,
        private readonly emailService: EmailService,
    ) { }

    async getProviderList() {
        const response = await this.hasuraService.getProviderList();
        return response;
    }

    async getProviderInfoById(id) {
        const response = await this.hasuraService.getProviderInfoById(id);
        return response;
    }

    async getSeekerList() {
        const response = await this.hasuraService.getSeekerList();
        return response;
    }

    async getSeekerInfoById(id) {
        const response = await this.hasuraService.getSeekerInfoById(id);
        return response;
    }

    async updateapprovalStatus(id, createUserDto) {
        const updateStatus = await this.hasuraService.updateapprovalStatus(id, createUserDto);
        return updateStatus
    }

    async updateEnableStatus(id, createUserDto) {
        const updateStatus = await this.hasuraService.updateEnableStatus(id, createUserDto);
        return updateStatus
    }

    async createAdmin(createUserDto) {
        const user = new CreateUserDto();
        user.email = createUserDto.email
        user.password = await bcrypt.hash(createUserDto.password,10)
        user.name = createUserDto.name
        user.role = createUserDto.role
        user.approved = true

        const createAdmin = await this.hasuraService.adminCreate(user);
        return createAdmin;
    }

}

