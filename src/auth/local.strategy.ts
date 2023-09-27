import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import * as bcrypt from "bcrypt"
import { AuthService } from "./auth.service";
import {User} from '../entity/userEntity'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly authService: AuthService) { super()}

    async validate(email: string, password: string): Promise<User> {
        const user: User = await this.authService.findOne(email)

        if(user === undefined) throw new UnauthorizedException
        
        if(user) {
            const passwordMatches = await bcrypt.compare(password, user.password);
            if(passwordMatches) {
                return user;
            } else {
                throw new UnauthorizedException
            }
            
        } else {
            throw new UnauthorizedException
        }
    }
}