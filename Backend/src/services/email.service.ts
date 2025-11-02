import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    // Create transporter based on environment
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp'; // smtp, gmail, sendgrid, etc.

    if (emailProvider === 'gmail') {
      // NOTE: Using 'gmail' requires a Gmail App Password and is often blocked
      // on cloud platforms even with 587. Using a transactional service (SMTP) is highly recommended.
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD, // Gmail App Password
        },
      });
    } else {
      // Generic SMTP (works with most email providers like SendGrid, Mailgun)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.example.com', // Replace default with a placeholder or set via ENV
        
        // *** CRITICAL FIX FOR CLOUD DEPLOYMENTS ***
        // Port 587 is often blocked by providers like Render/Hostinger. 
        // 2525 is a common alternative port that is usually open.
        port: parseInt(process.env.SMTP_PORT || '2525', 10),

        // secure: true for port 465 (which is often blocked), secure: false for ports 587 and 2525
        secure: process.env.SMTP_SECURE === 'true', 
        auth: {
          user: process.env.EMAIL_USER || process.env.SMTP_USER,
          pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD,
        },
        // For development/testing
        ...(process.env.NODE_ENV === 'development' && {
          tls: {
            rejectUnauthorized: false,
          },
        }),
      });
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Auth System'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Plain text version
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0;">Password Reset Request</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hello,</p>
            <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #667eea; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #667eea; word-break: break-all;">${resetUrl}</p>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  /**
   * Send OTP email for verification
   */
  async sendOTPEmail(email: string, otp: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0;">Email Verification</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hello,</p>
            <p>Thank you for signing up! Please verify your email address using the OTP code below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; border-radius: 10px; display: inline-block;">
                <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea;">${otp}</p>
              </div>
            </div>
            <p style="font-size: 12px; color: #666;">
              Enter this code in the verification page to complete your registration. This code will expire in 10 minutes.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              If you didn't create an account, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0;">Welcome!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hello ${name},</p>
            <p>Welcome to our platform! Your account has been successfully created.</p>
            <p>We're excited to have you on board. If you have any questions, feel free to reach out to our support team.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/sign-in" 
                 style="background: #667eea; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Sign In
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              Thank you for joining us!
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Our Platform',
      html,
    });
  }

  /**
   * Test email connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✓ Email service is ready to send emails');
      return true;
    } catch (error: any) {
      console.error('✗ Email service connection failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;