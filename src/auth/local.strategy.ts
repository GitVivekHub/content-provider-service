import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { User } from "src/entity/user.entity";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly usersService: UsersService) {
        super();
    }

    async validate(email: string, password: string): Promise<User> {
        const user: User = await this.usersService.findOne(email)

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