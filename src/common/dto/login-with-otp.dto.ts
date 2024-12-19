import {
  IsString,
  IsNotEmpty,
  Length,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class LoginWithOtpDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  code: string;
}
