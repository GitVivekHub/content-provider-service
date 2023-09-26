import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from 'src/services/logger/logger.service';
const axios = require('axios')
const FormData = require('form-data');


@Injectable()
export class MiddlewareService {
    private username = process.env.MEDACE_USERNAME
    private password = process.env.MEDACE_PASSWORD
    private client_id = process.env.MEDACECLIENT_ID
    private URL = process.env.MEDACE_URL

    constructor (private readonly logger:LoggerService){}
    async getAccessToken() {
        // console.log("username", this.username)
        // console.log("password", this.password)
        // console.log("client_id", this.client_id)
        // console.log("URL", this.URL)


        let data = new FormData();
        data.append('username', 'saadmin');
        data.append('password', '2oWDiI483ubB');
        data.append('grant_type', 'password');
        data.append('client_id', '8M2Mb3vKs5OCNc7zYyX1Tese7AyM0wNTaVLrGIhx');
        data.append('token_type', 'JWT');
        data.append('asymmetric_jwt', 'true');

            
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${this.URL}/oauth2/access_token`,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...data.getHeaders()
            },
            data: data
        };

        const response = axios.request(config)
            .then((response) => {
                this.logger.log('Token received successfully from Medace')
                return response.data
            })
            .catch((error) => {
                this.logger.error("Unable to fetch Medace token",error)
                throw new HttpException('Failed to get access Token', HttpStatus.INTERNAL_SERVER_ERROR);
            });
        return response

    }

    async createCoupon(couponData, token) {

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${this.URL}/subscription/api/v1/coupon/`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cookie': 'sessionid=1|lh4pfpadpp5b1wgc1h5eibpes2c0uozd|wpjVxxWj5NQN|ImI4ZTM2NzUxYzdkZTVkOTRhNjZlZmI4YTZhZGRjMjBmZmNiOTEzZjQ4MmVlYjQ3ZTg4YmFiOGQ2ODZiYzFlNWUi:1qcGhr:f-QAiE-SuIm910SLHR8LLCYYfrc'
            },
            data: couponData
        };

        const response = await axios.request(config)
            .then((response) => {
                this.logger.log('Coupon Created At Medace')
                return response.data
            })
            .catch((error) => {
                this.logger.error('Failed to Create Coupon',error)
                throw new HttpException('Failed to create Coupon', HttpStatus.BAD_REQUEST);
            });
        return response

    }

    async getAllPlans(token) {

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${this.URL}/subscription/api/v1/plan/all`,
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        };

        const response = await axios.request(config)
            .then((response) => {
                this.logger.log('Plans received from Medace')
                return response.data
            })
            .catch((error) => {
                this.logger.error("Unable to fetch Plans from Medace",error)
                throw new HttpException('Failed to get Total plans', HttpStatus.BAD_REQUEST);
            });
        return response

    }

    async deactivateCoupon(id, token) {
        console.log("Medace id",id)
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: `${this.URL}/subscription/api/v1/coupon/${id}`,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        console.log("URL",config.url);

        const response = await axios.request(config)
            .then((response) => {
                this.logger.log('Coupon deactivaetd at medace End ')
                return response.data
            })
            .catch((error) => {
                this.logger.error("Unable to deactivate Coupon",error)
                throw new HttpException('Failed to deactivate coupon', HttpStatus.BAD_REQUEST);
            });
        return response
    }

}
