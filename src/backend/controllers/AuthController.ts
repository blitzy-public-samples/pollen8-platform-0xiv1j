import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/backend/services/AuthService';
import { UserService } from 'src/backend/services/UserService';
import { AuthError } from 'src/backend/errors/AuthError';
import { validatePhoneNumber } from 'src/shared/utils/index';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;
  }

  public sendVerificationCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phoneNumber } = req.body;

      // Validate phone number format
      if (!validatePhoneNumber(phoneNumber)) {
        throw new AuthError('Invalid phone number format');
      }

      // Send verification code
      await this.authService.sendVerificationCode(phoneNumber);

      res.status(200).json({ message: 'Verification code sent successfully' });
    } catch (error) {
      next(error);
    }
  }

  public verifyCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phoneNumber, code } = req.body;

      // Verify the code
      const isVerified = await this.authService.verifyCode(phoneNumber, code);

      if (!isVerified) {
        throw new AuthError('Invalid verification code');
      }

      // Generate token
      const { token, user } = await this.authService.login(phoneNumber);

      res.status(200).json({ token, user });
    } catch (error) {
      next(error);
    }
  }

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phoneNumber } = req.body;

      // Login and generate token
      const { token, user } = await this.authService.login(phoneNumber);

      res.status(200).json({ token, user });
    } catch (error) {
      next(error);
    }
  }

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id; // Assuming user ID is attached to request by authentication middleware

      // Logout the user
      await this.authService.logout(userId);

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}