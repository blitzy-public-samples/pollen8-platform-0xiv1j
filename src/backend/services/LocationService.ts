import axios from 'axios';
import { LocationError } from 'src/backend/errors/LocationError';
import { LOCATION_API_CONFIG } from 'src/backend/config/locationApi';
import { redisClient } from 'src/backend/config/redis';

export class LocationService {
  constructor() {}

  async getCityFromZipCode(zipCode: string): Promise<{ city: string; state: string }> {
    try {
      // Check Redis cache
      const cachedData = await redisClient.get(`zipcode:${zipCode}`);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Make API request
      const response = await axios.get(`${LOCATION_API_CONFIG.baseUrl}/zipcode/${zipCode}`, {
        headers: { 'Authorization': `Bearer ${LOCATION_API_CONFIG.apiKey}` }
      });

      const { city, state } = response.data;

      // Cache the result
      await redisClient.set(`zipcode:${zipCode}`, JSON.stringify({ city, state }), 'EX', 86400); // Cache for 24 hours

      return { city, state };
    } catch (error) {
      throw new LocationError(`Failed to get city from ZIP code: ${error.message}`);
    }
  }

  validateZipCode(zipCode: string): boolean {
    // Regex for US ZIP code (5 digits or 5+4 digits)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }

  async getCoordinatesFromZipCode(zipCode: string): Promise<{ latitude: number; longitude: number }> {
    try {
      // Check Redis cache
      const cachedData = await redisClient.get(`coordinates:${zipCode}`);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Make API request
      const response = await axios.get(`${LOCATION_API_CONFIG.baseUrl}/geocode/${zipCode}`, {
        headers: { 'Authorization': `Bearer ${LOCATION_API_CONFIG.apiKey}` }
      });

      const { latitude, longitude } = response.data;

      // Cache the result
      await redisClient.set(`coordinates:${zipCode}`, JSON.stringify({ latitude, longitude }), 'EX', 86400); // Cache for 24 hours

      return { latitude, longitude };
    } catch (error) {
      throw new LocationError(`Failed to get coordinates from ZIP code: ${error.message}`);
    }
  }

  async calculateDistance(zipCode1: string, zipCode2: string): Promise<number> {
    try {
      const coords1 = await this.getCoordinatesFromZipCode(zipCode1);
      const coords2 = await this.getCoordinatesFromZipCode(zipCode2);

      // Haversine formula
      const R = 6371; // Radius of the Earth in km
      const dLat = this.deg2rad(coords2.latitude - coords1.latitude);
      const dLon = this.deg2rad(coords2.longitude - coords1.longitude);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(coords1.latitude)) * Math.cos(this.deg2rad(coords2.latitude)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in km

      return distance;
    } catch (error) {
      throw new LocationError(`Failed to calculate distance between ZIP codes: ${error.message}`);
    }
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}