import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { LoggerService } from 'src/services/logger/logger.service';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService,HasuraService,LoggerService]
})
export class ProviderModule {}
