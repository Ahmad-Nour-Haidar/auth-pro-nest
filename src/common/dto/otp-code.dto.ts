import { IsString, IsNotEmpty, Length } from 'class-validator';

export class OtpCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  code: string;
}
