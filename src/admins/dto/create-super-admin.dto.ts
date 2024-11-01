import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ForbiddenException } from '@nestjs/common';
import { OmitType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';

export class CreateSuperAdminDto extends OmitType(CreateAdminDto, [
  'roles',
] as const) {
  @Transform(({ value }) => {
    if (
      value.toString() !== process.env.SUPER_ADMIN_ACCESS_PASSWORD.toString()
    ) {
      throw new ForbiddenException('Access password is incorrect');
    }
    return value; // Ensure to return the value after transformation
  })
  @IsNotEmpty({ message: 'Access password is required' })
  @IsString({ message: 'Access password must be a string' })
  access_password: string;
}
