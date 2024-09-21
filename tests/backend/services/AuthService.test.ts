import { AuthService } from 'src/backend/services/AuthService';
import { User } from 'src/backend/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthError } from 'src/backend/errors/AuthError';
import { sendSMS } from 'src/backend/services/SMSService';
import { generateVerificationCode } from 'src/backend/utils/codeGenerator';
import { JWT_SECRET } from 'src/backend/config/jwt';

// Mock User model
const mockUserModel = () => {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
};

// Mock SMS service
const mockSMSService = () => {
  return jest.fn();
};

describe('AuthService', () => {
  let authService: AuthService;
  let mockUser: any;
  let mockSMS: jest.Mock;

  beforeEach(() => {
    mockUser = mockUserModel();
    mockSMS = mockSMSService();
    authService = new AuthService(mockUser, mockSMS);
  });

  describe('sendVerificationCode', () => {
    it('sends code successfully', async () => {
      const phoneNumber = '+1234567890';
      const verificationCode = '123456';

      jest.spyOn(generateVerificationCode, 'generateVerificationCode').mockReturnValue(verificationCode);

      await authService.sendVerificationCode(phoneNumber);

      expect(mockSMS).toHaveBeenCalledWith(phoneNumber, expect.stringContaining(verificationCode));
      expect(mockUser.update).toHaveBeenCalledWith(
        { phoneNumber },
        { verificationCode, verificationCodeExpires: expect.any(Date) }
      );
    });
  });

  describe('verifyCode', () => {
    it('validates code correctly', async () => {
      const phoneNumber = '+1234567890';
      const correctCode = '123456';
      const incorrectCode = '654321';

      mockUser.findOne.mockResolvedValue({
        verificationCode: correctCode,
        verificationCodeExpires: new Date(Date.now() + 600000), // 10 minutes from now
      });

      const validResult = await authService.verifyCode(phoneNumber, correctCode);
      const invalidResult = await authService.verifyCode(phoneNumber, incorrectCode);

      expect(validResult).toBe(true);
      expect(invalidResult).toBe(false);
    });
  });

  describe('login', () => {
    it('generates JWT token', async () => {
      const phoneNumber = '+1234567890';
      const userId = '123';

      mockUser.findOne.mockResolvedValue({ id: userId, phoneNumber });

      const result = await authService.login(phoneNumber);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');

      const decodedToken: any = jwt.verify(result.token, JWT_SECRET);
      expect(decodedToken.userId).toBe(userId);
    });
  });

  describe('logout', () => {
    it('invalidates user session', async () => {
      const userId = '123';

      await authService.logout(userId);

      expect(mockUser.update).toHaveBeenCalledWith(
        { id: userId },
        { lastLogout: expect.any(Date) }
      );
    });
  });

  describe('verifyToken', () => {
    it('validates JWT token', async () => {
      const userId = '123';
      const validToken = jwt.sign({ userId }, JWT_SECRET);
      const invalidToken = 'invalid.token.here';

      const decodedUser = await authService.verifyToken(validToken);
      expect(decodedUser).toHaveProperty('userId', userId);

      await expect(authService.verifyToken(invalidToken)).rejects.toThrow(AuthError);
    });
  });
});