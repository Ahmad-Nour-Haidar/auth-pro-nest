import {
  IsEmail,
  MaxLength,
  IsString,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';

export class CheckEmailDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
