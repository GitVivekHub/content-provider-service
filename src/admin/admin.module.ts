import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../entity/user.entity';
import { CsvService } from 'src/services/csv/csv.service';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { EmailService } from 'src/services/email/email.service';
import { UtilService } from 'src/services/email/utility';
import { MiddlewareService } from 'src/services/middleware/middleware.service';
import { LoggerService } from 'src/services/logger/logger.service';




@Module({
  imports: [],
  providers: [AdminService, CsvService,HasuraService,EmailService,UtilService, MiddlewareService,LoggerService],
  controllers: [AdminController]
})
export class AdminModule {}
