import { Roles } from '../enums/roles.enum';

export class ResponseAdminDto {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly full_name?: string;
  readonly roles: Roles[];

  constructor(admin: Partial<ResponseAdminDto>) {
    this.id = admin.id;
    this.email = admin.email;
    this.username = admin.username;
    this.full_name = admin.full_name;
    this.roles = admin.roles;
  }
}
