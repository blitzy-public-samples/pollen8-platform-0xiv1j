import { AuthController } from 'src/backend/controllers/AuthController';
import { AuthService } from 'src/backend/services/AuthService';
import { UserService } from 'src/backend/services/UserService';
import { Request, Response, NextFunction } from 'express';
import { AuthError } from 'src/backend/errors/AuthError';
import { validatePhoneNumber } from 'src/shared/utils/index';

jest.mock('src/backend/services/AuthService');
jest.mock('src/backend/services/UserService');
jest.mock('src/shared/utils/index');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    mockUserService = new UserService() as jest.Mocked<UserService>;
    authController = new AuthController(mockAuthService, mockUserService);
  });

  const mockRequest = (options: Partial<Request> = {}): Partial<Request> => {
    return {
      body: {},
      params: {},
      ...options,
    };
  };

  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNextFunction: NextFunction = jest.fn();

  describe('sendVerificationCode', () => {
    it('sends code successfully', async () => {
      const req = mockRequest({ body: { phoneNumber: '+1234567890' } });
      const res = mockResponse();
      
      (validatePhoneNumber as jest.Mock).mockReturnValue(true);
      mockAuthService.sendVerificationCode.mockResolvedValue();

      await authController.sendVerificationCode(req as Request, res as Response, mockNextFunction);

      expect(mockAuthService.sendVerificationCode).toHaveBeenCalledWith('+1234567890');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Verification code sent successfully' });
    });

    it('handles invalid phone number', async () => {
      const req = mockRequest({ body: { phoneNumber: 'invalid' } });
      const res = mockResponse();
      
      (validatePhoneNumber as jest.Mock).mockReturnValue(false);

      await authController.sendVerificationCode(req as Request, res as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalledWith(expect.any(AuthError));
    });
  });

  describe('verifyCode', () => {
    it('logs in user successfully', async () => {
      const req = mockRequest({ body: { phoneNumber: '+1234567890', code: '123456' } });
      const res = mockResponse();
      
      mockAuthService.verifyCode.mockResolvedValue(true);
      mockAuthService.login.mockResolvedValue({ token: 'mock-token', user: { id: '1', phoneNumber: '+1234567890' } });

      await authController.verifyCode(req as Request, res as Response, mockNextFunction);

      expect(mockAuthService.verifyCode).toHaveBeenCalledWith('+1234567890', '123456');
      expect(mockAuthService.login).toHaveBeenCalledWith('+1234567890');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mock-token',
        user: { id: '1', phoneNumber: '+1234567890' }
      });
    });

    it('handles invalid code', async () => {
      const req = mockRequest({ body: { phoneNumber: '+1234567890', code: 'invalid' } });
      const res = mockResponse();
      
      mockAuthService.verifyCode.mockResolvedValue(false);

      await authController.verifyCode(req as Request, res as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalledWith(expect.any(AuthError));
    });
  });

  describe('login', () => {
    it('authenticates user successfully', async () => {
      const req = mockRequest({ body: { phoneNumber: '+1234567890' } });
      const res = mockResponse();
      
      mockAuthService.login.mockResolvedValue({ token: 'mock-token', user: { id: '1', phoneNumber: '+1234567890' } });

      await authController.login(req as Request, res as Response, mockNextFunction);

      expect(mockAuthService.login).toHaveBeenCalledWith('+1234567890');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mock-token',
        user: { id: '1', phoneNumber: '+1234567890' }
      });
    });
  });

  describe('logout', () => {
    it('ends user session successfully', async () => {
      const req = mockRequest({ user: { id: '1' } });
      const res = mockResponse();
      
      mockAuthService.logout.mockResolvedValue();

      await authController.logout(req as Request, res as Response, mockNextFunction);

      expect(mockAuthService.logout).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Logged out successfully' });
    });
  });
});