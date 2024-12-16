export enum Roles {
  superAdmin = 'superAdmin',
  admin = 'admin',
  manager = 'manager',
  user = 'user',
}

export function isSuperAdmin(roles: Roles[]): boolean {
  return roles.length === 1 && roles[0] === Roles.superAdmin;
}

export function isUser(roles: Roles[]): boolean {
  return roles.length === 1 && roles[0] === Roles.user;
}
