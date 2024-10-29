import { IsArray, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Roles } from '../../auth/enums/roles.enum';

export class UpdateUserRolesDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  id: string;

  @IsNotEmpty({ message: 'Roles are required' })
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(Roles, { each: true, message: 'Each role must be a valid role' })
  roles: Roles[];
}
