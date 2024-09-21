import request from 'supertest';
import { app } from 'src/backend/app';
import { User } from 'src/backend/models/User';
import { AuthService } from 'src/backend/services/AuthService';
import { SMSService } from 'src/backend/services/SMSService';
import { connectToDatabase, disconnectFromDatabase } from 'src/backend/config/database';

jest.mock('src/backend/services/SMSService');

describe('Authentication Integration Tests', () => {
  let mockSMSService: jest.Mocked<SMSService>;

  beforeAll(async () => {
    await setupTestDatabase();
    mockSMSService = SMSService as jest.Mocked<SMSService>;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  afterEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  async function setupTestDatabase(): Promise<void> {
    await connectToDatabase({
      // Add test database configuration here
    });
    await User.destroy({ where: {}, truncate: true });
  }

  async function teardownTestDatabase(): Promise<void> {
    await disconnectFromDatabase();
  }

  describe('Phone number verification flow', () => {
    it('should successfully verify a phone number and create a new user', async () => {
      const phoneNumber = '+1234567890';
      const verificationCode = '123456';
      mockSMSService.sendSMS.mockResolvedValue(undefined);
      mockSMSService.getVerificationCode.mockReturnValue(verificationCode);

      const sendVerificationResponse = await request(app)
        .post('/api/v1/auth/send-verification')
        .send({ phoneNumber });

      expect(sendVerificationResponse.status).toBe(200);

      const verifyResponse = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phoneNumber, code: verificationCode });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body).toHaveProperty('token');

      const user = await User.findOne({ where: { phoneNumber } });
      expect(user).not.toBeNull();
    });
  });

  describe('Login with existing user', () => {
    it('should successfully log in an existing user', async () => {
      const phoneNumber = '+1987654321';
      await User.create({ phoneNumber });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body.user.phoneNumber).toBe(phoneNumber);
    });
  });

  describe('Logout', () => {
    it('should successfully log out a user', async () => {
      const phoneNumber = '+1122334455';
      const user = await User.create({ phoneNumber });
      const token = AuthService.generateToken(user);

      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutResponse.status).toBe(200);

      const protectedResponse = await request(app)
        .get('/api/v1/protected-route')
        .set('Authorization', `Bearer ${token}`);

      expect(protectedResponse.status).toBe(401);
    });
  });

  describe('Invalid verification code', () => {
    it('should return an error for an invalid verification code', async () => {
      const phoneNumber = '+1234567890';
      const invalidCode = '000000';

      const verifyResponse = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phoneNumber, code: invalidCode });

      expect(verifyResponse.status).toBe(400);
      expect(verifyResponse.body).toHaveProperty('error');
    });
  });

  describe('Rate limiting', () => {
    it('should rate limit excessive verification requests', async () => {
      const phoneNumber = '+1234567890';
      const requests = Array(10).fill(null).map(() =>
        request(app).post('/api/v1/auth/send-verification').send({ phoneNumber })
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(res => res.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Wait for rate limit window to pass
      await new Promise(resolve => setTimeout(resolve, 60000));

      const newResponse = await request(app)
        .post('/api/v1/auth/send-verification')
        .send({ phoneNumber });

      expect(newResponse.status).toBe(200);
    });
  });
});