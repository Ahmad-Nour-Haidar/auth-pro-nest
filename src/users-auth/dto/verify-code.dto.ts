import {
  IsEmail,
  MaxLength,
  IsString,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';

export class VerifyCodeDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'Verification code must be 6 characters long' })
  @Matches(/^\d{6}$/, { message: 'Verification code must be a 6-digit number' })
  readonly code: string;
}
