import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as process from 'node:process';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    // host: 'smtp.mailtrap.io',
    // port: 587,
    // secure: false, // true for port 465, false for other ports
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD_EMAIL,
    },
  });

  async sendMail(mailOptions: any): Promise<void> {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      throw new UnauthorizedException(
        'An error occurred while sending the email to the address you provided. Please ensure you have an active internet connection and that the email address is correct, then try again.',
      );
    }
  }
}
