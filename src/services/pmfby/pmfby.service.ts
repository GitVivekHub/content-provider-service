import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PmfbyService {
  private readonly logger = new Logger(PmfbyService.name);

  constructor(
  ) { }

  /**
   * Get PMFBY authentication token
   */
  async getPmfbyToken() {
    try {
      let config = {
        headers: {
          'Content-Type': 'application/json'
        },
        url: `${process.env.PMFBY_BASE_URL}/api/v2/external/service/login`,
        method: 'post',
        data: {
          "deviceType": "web",
          "mobile": process.env.PMFBY_MOBILE,
          "otp": 123456,
          "password": process.env.PMFBY_PASSWORD,
        }
      }
      const response = await axios.request(config);


      // Check if token exists in the expected location
      if (!response.data) {
        this.logger.error('No data in API response');
        throw new Error('Invalid token response from PMFBY service: No data returned');
      }


      const token = response.data.data.token

      if (!token) {
        this.logger.error('Token not found in API response', response.data);
        throw new Error('Invalid token response from PMFBY service: No token found');
      }

      return token;
    } catch (error) {
      this.logger.error(`Error getting PMFBY token: ${error.message}`);
      if (error.response) {
        this.logger.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error(`Failed to get PMFBY token: ${error.message}`);
    }
  }

  /**
   * Get Farmer ID from mobile number
   */
  async getFarmerId(mobileNumber: string): Promise<string> {
    try {
      // Static authToken for demo purposes
      const authToken = process.env.PMFBY_AUTH_TOKEN;
      const config = {
        url: `${process.env.PMFBY_BASE_URL}/api/v1/services/services/farmerMobileExists`,
        method: 'get',
        params: {
          mobile: mobileNumber,
          authToken: authToken
        }
      }
      const response = await axios.request(config);

      // Fix: Correctly access farmerID from the nested structure
      const farmerId = response?.data?.data?.result?.farmerID;

      if (!farmerId) {
        this.logger.error('Farmer ID not found in API response', response.data);
      }
      return farmerId;
    } catch (error) {
      this.logger.error(`Error fetching farmer ID: ${error.message}`);
    }
  }

  /**
   * Get Claim Status
   */
  async getClaimStatus(farmerId: string, season: string, year: string, token: string): Promise<any> {
    try {
      const config = {
        url: `${process.env.PMFBY_BASE_URL}/api/v1/claims/claims/claimSearchReport`,
        method: 'get',
        params: {
          season: season,
          year: year,
          farmerID: farmerId,
          searchType: 'farmerID'
        },
        headers: {
          'token': token
        }
      }

      const response = await axios.request(config);

      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching claim status: ${error.message}`);
      throw new Error(`Failed to get claim status: ${error.message}`);
    }
  }

  /**
   * Get Policy Status
   */
  async getPolicyStatus(farmerId: string, season: string, year: string, token: string): Promise<any> {
    try {
      // Construct the sssyID as per requirements: 040${season}00${year}
      const sssyID = `040${season}00${year}`;
      const config = {
        url: `${process.env.PMFBY_BASE_URL}/api/v1/policy/policy/farmerpolicylist`,
        method: 'get',
        params: {
          listType: 'POLICY_LIST',
          farmerID: farmerId,
          sssyID: sssyID
        },
        headers: {
          'token': token
        }
      }
      const response = await axios.request(config);

      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching policy status: ${error.message}`);
      throw new Error(`Failed to get policy status: ${error.message}`);
    }
  }
} 