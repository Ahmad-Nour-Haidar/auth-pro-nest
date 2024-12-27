import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { Expose } from 'class-transformer';

export class UserAuthResponseDto extends PartialType(
  OmitType(UserResponseDto, [] as const),
) {
  @Expose() two_factor_secret?: string;
  @Expose() two_factor_qr_code?: string;
}
