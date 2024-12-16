import { SetMetadata } from '@nestjs/common';
import { Roles } from '../../admins/enums/roles.enum';

export const ALLOWED_ROLES_KEY = 'roles';

export const RolesDecorator = (...roles: Roles[]) =>
  SetMetadata(ALLOWED_ROLES_KEY, roles);

export const SuperAdminOnly = () =>
  SetMetadata(ALLOWED_ROLES_KEY, [Roles.superAdmin]);

export const AdminOnly = () => SetMetadata(ALLOWED_ROLES_KEY, [Roles.admin]);

export const AdminOrHigher = () =>
  SetMetadata(ALLOWED_ROLES_KEY, [Roles.superAdmin, Roles.admin]);
