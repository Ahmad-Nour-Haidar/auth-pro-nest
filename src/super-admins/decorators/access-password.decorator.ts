import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_ACCESS_PASSWORD = 'super_admin_access_password';

export const SuperAdminAccessPassword = () =>
  SetMetadata(SUPER_ADMIN_ACCESS_PASSWORD, true);
