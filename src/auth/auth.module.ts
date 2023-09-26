import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoggerService } from 'src/services/logger/logger.service';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {JwtStrategy} from './jwt.strategy';
import {LocalStrategy} from './local.strategy'

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
  providers: [AuthService, LocalStrategy, JwtStrategy, LoggerService],
  exports: [AuthService]
})
export class AuthModule {}
