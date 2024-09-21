import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { JWT_SECRET } from '../config/jwt';
import { sendSMS } from '../services/SMSService';
import { generateVerificationCode } from '../utils/codeGenerator';
import { AuthError } from '../errors/AuthError';

export class AuthService {
  constructor() {}

  async sendVerificationCode(phoneNumber: string): Promise<void> {
    try {
      // Generate a verification code
      const code = generateVerificationCode();

      // Store the code and its expiration time in the database
      const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      await User.update(
        { verificationCode: code, verificationCodeExpires: expirationTime },
        { where: { phoneNumber } }
      );

      // Send the code via SMS to the provided phone number
      await sendSMS(phoneNumber, `Your Pollen8 verification code is: ${code}`);
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new AuthError('Failed to send verification code');
    }
  }

  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const user = await User.findOne({ where: { phoneNumber } });
      if (!user) {
        throw new AuthError('User not found');
      }

      if (user.verificationCode !== code) {
        return false;
      }

      if (user.verificationCodeExpires < new Date()) {
        throw new AuthError('Verification code has expired');
      }

      // Mark the user as verified
      await user.update({ isVerified: true, verificationCode: null, verificationCodeExpires: null });
      return true;
    } catch (error) {
      console.error('Error verifying code:', error);
      throw new AuthError('Failed to verify code');
    }
  }

  async login(phoneNumber: string): Promise<{ token: string; user: User }> {
    try {
      let user = await User.findOne({ where: { phoneNumber } });
      if (!user) {
        user = await User.create({ phoneNumber });
      }

      if (!user.isVerified) {
        throw new AuthError('Phone number not verified');
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      await user.update({ lastLogin: new Date() });

      return { token, user };
    } catch (error) {
      console.error('Error logging in:', error);
      throw new AuthError('Failed to log in');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({ lastLogout: new Date() });
      }
      // Note: For a stateless JWT-based auth system, we don't need to invalidate tokens server-side.
      // The client should discard the token on logout.
    } catch (error) {
      console.error('Error logging out:', error);
      throw new AuthError('Failed to log out');
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw new AuthError('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new AuthError('Invalid or expired token');
    }
  }
}