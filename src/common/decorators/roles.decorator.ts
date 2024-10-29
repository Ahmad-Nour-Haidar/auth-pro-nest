import { SetMetadata } from '@nestjs/common';
import { Roles } from '../../auth/enums/roles.enum';

export const ALLOWED_ROLES_KEY = 'roles';

export const RolesDecorator = (...roles: Roles[]) =>
  SetMetadata(ALLOWED_ROLES_KEY, roles);

export const SuperAdminOnly = () =>
  SetMetadata(ALLOWED_ROLES_KEY, [Roles.SuperAdmin]);

export const UserOnly = () => SetMetadata(ALLOWED_ROLES_KEY, [Roles.User]);

export const AdminOrHigher = () =>
  SetMetadata(ALLOWED_ROLES_KEY, [Roles.SuperAdmin, Roles.Admin]);
