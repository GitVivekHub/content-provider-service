import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { EmailService } from 'src/services/email/email.service';
import { UtilService } from 'src/services/email/utility';
import { LoggerService } from 'src/services/logger/logger.service';

@Module({
  imports: [],
  providers: [AdminService,HasuraService,EmailService,UtilService,LoggerService],
  controllers: [AdminController]
})
export class AdminModule {}
