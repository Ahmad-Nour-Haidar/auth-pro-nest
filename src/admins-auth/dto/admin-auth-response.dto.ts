import { Expose } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { AdminResponseDto } from '../../admins/dto/admin-response.dto';

export class AdminAuthResponseDto extends PartialType(
  OmitType(AdminResponseDto, [] as const),
) {
  @Expose() two_factor_secret?: string;
  @Expose() two_factor_qr_code?: string;
}
