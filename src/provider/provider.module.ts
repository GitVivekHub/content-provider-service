import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { LoggerService } from 'src/services/logger/logger.service';
import { S3Service } from 'src/services/s3/s3.service';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService, HasuraService, LoggerService, S3Service]
})
export class ProviderModule {}
