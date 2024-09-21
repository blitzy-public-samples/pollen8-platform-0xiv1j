import nodemailer from 'nodemailer';
import { User } from 'src/backend/models/User';
import { EmailError } from 'src/backend/errors/EmailError';
import { EMAIL_CONFIG } from 'src/backend/config/email';
import { EmailTemplate } from 'src/backend/utils/emailTemplates';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create a nodemailer transporter using EMAIL_CONFIG
    this.transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }

  async sendVerificationCode(email: string, verificationCode: string): Promise<void> {
    try {
      // Generate email content using the verification code template
      const emailContent = EmailTemplate.getVerificationCodeTemplate(verificationCode);

      // Send the email using the nodemailer transporter
      await this.transporter.sendMail({
        from: EMAIL_CONFIG.auth.user,
        to: email,
        subject: 'Pollen8 - Verification Code',
        html: emailContent,
      });
    } catch (error) {
      // Handle any errors and throw EmailError if sending fails
      throw new EmailError('Failed to send verification code email', error);
    }
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    try {
      // Generate email content using the welcome email template
      const emailContent = EmailTemplate.getWelcomeEmailTemplate(user);

      // Send the email using the nodemailer transporter
      await this.transporter.sendMail({
        from: EMAIL_CONFIG.auth.user,
        to: user.email,
        subject: 'Welcome to Pollen8!',
        html: emailContent,
      });
    } catch (error) {
      // Handle any errors and throw EmailError if sending fails
      throw new EmailError('Failed to send welcome email', error);
    }
  }

  async sendConnectionNotification(user: User, newConnection: User): Promise<void> {
    try {
      // Generate email content using the connection notification template
      const emailContent = EmailTemplate.getConnectionNotificationTemplate(user, newConnection);

      // Send the email using the nodemailer transporter
      await this.transporter.sendMail({
        from: EMAIL_CONFIG.auth.user,
        to: user.email,
        subject: 'New Connection on Pollen8',
        html: emailContent,
      });
    } catch (error) {
      // Handle any errors and throw EmailError if sending fails
      throw new EmailError('Failed to send connection notification email', error);
    }
  }

  async sendNetworkValueUpdate(user: User, newNetworkValue: number): Promise<void> {
    try {
      // Generate email content using the network value update template
      const emailContent = EmailTemplate.getNetworkValueUpdateTemplate(user, newNetworkValue);

      // Send the email using the nodemailer transporter
      await this.transporter.sendMail({
        from: EMAIL_CONFIG.auth.user,
        to: user.email,
        subject: 'Your Pollen8 Network Value Has Changed',
        html: emailContent,
      });
    } catch (error) {
      // Handle any errors and throw EmailError if sending fails
      throw new EmailError('Failed to send network value update email', error);
    }
  }
}