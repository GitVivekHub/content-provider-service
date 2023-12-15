import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from './services/logger/logger.service';
import { ProviderModule } from './provider/provider.module';
import { SeekerModule } from './seeker/seeker.module';
import { HasuraService } from './services/hasura/hasura.service';
import { S3Service } from './services/s3/s3.service';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    {
      ...HttpModule.register({}),
      global: true,
    }, 
    AuthModule, 
    AdminModule, ProviderModule, SeekerModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService, HasuraService, S3Service],
})
export class AppModule {}
