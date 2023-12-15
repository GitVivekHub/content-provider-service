import { Module } from '@nestjs/common';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { LoggerService } from 'src/services/logger/logger.service';
import { SeekerController } from './seeker.controller';
import { SeekerService } from './seeker.service';

@Module({
  controllers: [SeekerController],
  providers: [SeekerService, HasuraService, LoggerService]
})
export class SeekerModule {}
