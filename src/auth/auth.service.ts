import { Injectable} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { error } from 'console';
import { User } from 'src/entity/user.entity';
import { LoggerService } from 'src/services/logger/logger.service';
import { UsersService } from 'src/users/users.service';
import {CreateuserDto} from '../dto/createUser.dto'
import {HasuraService} from '../services/hasura/hasura.service'
import {EmailService} from '../services/email/email.service'
const crypto = require("crypto");
const axios = require('axios');


@Injectable()
export class AuthService {
    private gupshupUserId = process.env.GUPSHUP_USERID
    private gupshuppassword = process.env.GUPSHUP_PSW
    private gupshupUrl = process.env.GUPSHUP_URL
    private tokenExpiry = process.env.TOKEN_EXPIRY
    private otpExpiry = parseInt(process.env.OTP_EXPIRY_IN_MINUTES)

    public smsKey = '13893kjefbekbkb'

    constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService,private readonly logger:LoggerService,private readonly hasuraService:HasuraService,private readonly emailService:EmailService) { }
    async validateUser(request){
        let result = await this.hasuraService.isUserApproved(request.email);
        console.log(result,"result");
        return result;
    }
    async create (createUserDto){
        const user = new CreateuserDto();
        user.email=createUserDto.email
        user.password=createUserDto.password
        user.name=createUserDto.name
        user.role=createUserDto.role
        
        // await this.hasuraService.CheckUserExistence(user.email)
        if(user.role === 'admin'){
            user.approved=true;
            const createUser = await this.hasuraService.createUser1(user);
            return createUser
        }else{
            const createUser = await this.hasuraService.createUser1(user);
            // await this.emailService.sendRequestedUserEmail(createUser);
            return createUser;
        }
    }
    generateToken(payload: User): string {
        const plainObject = JSON.parse(JSON.stringify(payload))

        const token = this.jwtService.sign(plainObject, { expiresIn: 8640000 })
        if(!token){
                this.logger.log('POST /login','log in failed')
            } 
        return token
        }

    public async sendOtp(req, response) {
        const mobile = req.mobile;
        const reason = req.reason;
        const role = req.role;

        const user = await this.usersService.findUserMobile(mobile, role)
        if (user) {
            if (user?.saUserRelation?.saCodeRelation?.status && role === 'student' || role === 'admin') {
                const sendOtpRes = await this.sendOtpSMS(mobile, reason)

                if (sendOtpRes.success) {
                    return response.status(200).json(sendOtpRes);
                } else {
                    return response.status(400).json(sendOtpRes);
                }
            }else{
                
                return response.status(200).json({
                    success: false,
                    message: 'Your account is no longer active. Please contact',
                    data: {}
                });
            }

        } else {
            this.logger.error('POST /sendOtp',"Mobile no not Registered")
            return response.status(200).json({
                success: false,
                message: 'Mobile no. not registered!',
                data: {}
            });
        }
    }

    public async verifyOtp(req, response) {
        const mobile = req.mobile;
        const hash = req.hash;
        const otp = req.otp;
        const reason = req.reason;
        const role = req.role;

        const user = await this.usersService.findUserMobile(mobile, role)

        if (user) {
            const otpVerify = await this.otpVerification(mobile, hash, otp, reason);

            if (otpVerify === 'Timeout please try again') {
                return response.status(400).json({
                    success: false,
                    message: 'Timeout please try again',
                    data: {}
                });
            }

            if (otpVerify === 'OTP verified successfully') {
                let token = this.generateToken(user)
                delete user.password
                return response.status(200).json({
                    success: true,
                    message: 'OTP verified successfully!',
                    data: {
                        token: token,
                        user: user
                    }
                });
            }

            if (otpVerify === 'Incorrect OTP') {
                return response.status(400).json({
                    success: false,
                    message: 'Incorrect OTP',
                    data: {}
                });
            }
        } else {
            return response.status(200).json({
                success: false,
                message: 'Mobile no. not registered!',
                data: {}
            });
        }



    }

    public async otpVerification(mobile, hash, otp, reason) {
        let [hashValue, expires] = hash.split(".");
        let now = Date.now();

        if (now > parseInt(expires)) {

            return 'Timeout please try again';

        }

        const data = `${mobile}.${otp}.${reason}.${expires}`;
        const smsKey = this.smsKey;

        const newCalculatedHash = crypto
            .createHmac("sha256", smsKey)
            .update(data)
            .digest("hex");

        if (newCalculatedHash === hashValue) {

            return 'OTP verified successfully';

        } else {

            return 'Incorrect OTP';

        }
    }

    public async sendOtpSMS(mobile, reason) {

        const otp = crypto.randomInt(100000, 999999);
        const ttl = 5 * 60 * 1000;
        const expires = Date.now() + ttl;
        const data = `${mobile}.${otp}.${reason}.${expires}`;
        const smsKey = this.smsKey;

        const hash = crypto
            .createHmac("sha256", smsKey)
            .update(data)
            .digest("hex");
        const fullhash = `${hash}.${expires}`;


        const mobileStr = mobile.toString();

        if (otp && fullhash) {

            const otpRes = await this.sendSMS(mobile, otp)
            //const otpRes = true
            if (otpRes) {
                return {
                    success: true,
                    message: `Otp successfully sent to XXXXXX${mobileStr.substring(6)}`,
                    data: {
                        //otp: otp,
                        hash: fullhash
                    }
                }

            } else {
                return {
                    success: false,
                    message: 'Unable to send OTP!',
                    data: {}
                }

            }

        } else {
            return {
                success: false,
                message: 'Unable to send OTP!',
                data: {}
            }

        }
    }

    public async sendSMS(mobileNo, otp) {

        let msg = `${otp} is your OTP for verifying your mobile number on Manipal MedAce. Do not share it with anyone.
        Manipal MedAce`

        let encodeMsg = encodeURIComponent(msg)
        

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${this.gupshupUrl}?msg=${msg}&v=1.1&userid=${this.gupshupUserId}&password=${this.gupshuppassword}&send_to=${mobileNo}&msg_type=text&method=sendMessage`,
            headers: {}
        };

        try {
            const res = await axios.request(config)
            return res.data
        } catch (err) {
            console.log("otp err", err)
        }


    }


}
