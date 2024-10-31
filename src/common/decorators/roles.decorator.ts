import { SetMetadata } from '@nestjs/common';
import { Roles } from '../../admins/enums/roles.enum';

export const ALLOWED_ROLES_KEY = 'roles';

export const RolesDecorator = (...roles: Roles[]) =>
  SetMetadata(ALLOWED_ROLES_KEY, roles);

export const SuperAdminOnly = () =>
  SetMetadata(ALLOWED_ROLES_KEY, [Roles.SuperAdmin]);

export const AdminOnly = () => SetMetadata(ALLOWED_ROLES_KEY, [Roles.Admin]);

export const AdminOrHigher = () =>
  SetMetadata(ALLOWED_ROLES_KEY, [Roles.SuperAdmin, Roles.Admin]);
