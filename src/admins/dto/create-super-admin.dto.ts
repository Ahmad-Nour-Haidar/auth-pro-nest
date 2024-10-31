import { CreateAdminDto } from './create-admin.dto';
import { Roles } from '../enums/roles.enum';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ForbiddenException } from '@nestjs/common';

export class CreateSuperAdminDto extends CreateAdminDto {
  @IsArray({ message: 'Roles must be an array' })
  readonly roles: Roles[] = [Roles.SuperAdmin];

  @IsNotEmpty({ message: 'Access password is required' })
  @IsString({ message: 'Access password must be a string' })
  @Transform(({ value }) => {
    if (value.toString() !== process.env.SUPER_ADMIN_ACCESS_PASSWORD) {
      throw new ForbiddenException('Access password is incorrect');
    }
  })
  access_password: string;
}

// export class CreateSuperAdminDto extends OmitType(CreateAdminDto, [
//   'password',
//   'confirm_password',
//   'roles',
// ] as const) {}
