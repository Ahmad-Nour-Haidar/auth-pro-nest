import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import { User } from '../../users/entities/user.entity';
import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ConfigService } from '@nestjs/config';
import { Admin } from '../../admins/entities/admin.entity';

@Injectable()
export class MailService {
  private transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor(configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      // host: 'smtp.mailtrap.io',
      // port: 587,
      // secure: false, // true for port 465, false for other ports
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: configService.get<string>('EMAIL'),
        pass: configService.get<string>('PASSWORD_EMAIL'),
      },
    });
  }

  async sendMail(mailOptions: any): Promise<void> {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      throw new UnauthorizedException(
        'An error occurred while sending the email to the address you provided. Please ensure you have an active internet connection and that the email address is correct, then try again.',
      );
    }
  }

  async sendVerificationEmail(user: User | Admin, code: any) {
    const logoUrl =
      'https://res.cloudinary.com/dofzmmyai/image/upload/v1735835092/users/dqzmeiv5rytlp8cx72jo.png'; // Replace with your logo URL
    const template = fs.readFileSync('./src/view/email-template.html', 'utf8');
    const emailContent = template
      .replace('{{username}}', user.full_name ?? user.username)
      .replace('{{verification_code}}', code.toString().split('').join(' '))
      .replace('{{logo_url}}', logoUrl);

    await this.transporter.sendMail({
      from: '"ProFinder" <ProFinder@gmail.com>',
      to: user.email,
      subject: 'Your Verification Code',
      html: emailContent,
    });
  }
}
