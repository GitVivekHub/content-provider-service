import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoggerService } from 'src/services/logger/logger.service';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {JwtStrategy} from './jwt.strategy';
import {LocalStrategy} from './local.strategy'
import { EmailService } from 'src/services/email/email.service';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { UtilService } from 'src/services/email/utility';

@Module({
  imports: [
    PassportModule, 
    UsersModule, 
    JwtModule.register(
      {
        global: true,
        //secret: jwtConstants.secret,
        secret: "key",
        signOptions: { expiresIn: '3600s' },
      }
    )
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, LoggerService,EmailService,HasuraService,UtilService],
  exports: [AuthService]
})
export class AuthModule {}
