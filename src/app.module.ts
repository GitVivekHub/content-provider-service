import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MiddlewareService } from './services/middleware/middleware.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from './services/logger/logger.service';
import { ProviderModule } from './provider/provider.module';
import { SeekerModule } from './seeker/seeker.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    {
      ...HttpModule.register({}),
      global: true,
    },
    UsersModule, 
    AuthModule, 
    AdminModule, ProviderModule, SeekerModule,
  ],
  controllers: [AppController],
  providers: [AppService, MiddlewareService, LoggerService],
})
export class AppModule {}
