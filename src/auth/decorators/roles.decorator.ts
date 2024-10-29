import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enums/roles.enum';

export const ALLOWED_ROLES_KEY = 'roles';

export const RolesDecorator = (...roles: Roles[]) =>
  SetMetadata(ALLOWED_ROLES_KEY, roles);
