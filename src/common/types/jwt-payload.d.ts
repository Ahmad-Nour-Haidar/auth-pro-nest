import { Roles } from '../../admins/enums/roles.enum';

export type JwtPayload = {
  id: string;
  roles: Roles[];
  iat: number;
};

export type JwtSignPayload = {
  id: string;
  roles: Roles[];
};
