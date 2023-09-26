import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HasuraService } from 'src/services/hasura/hasura.service';
import {EmailService} from 'src/services/email/email.service'
import { UtilService } from 'src/services/email/utility';
import { LoggerService } from 'src/services/logger/logger.service';

@Module({
  imports: [],
  providers: [UsersService, HasuraService, EmailService, UtilService, LoggerService],
  exports: [UsersService,HasuraService],
  controllers: [UsersController]
})
export class UsersModule {}
