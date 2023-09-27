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
    async updateapprovalStatus(id, createUserDto) {
        const user = new CreateUserDto();
        user.approved = createUserDto.approved
        user.reason = createUserDto.reason;
        console.log("User", user)
        const updateStatus = await this.hasuraService.updateapprovalStatus(id, user);
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

