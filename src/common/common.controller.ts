import { Controller, Get } from '@nestjs/common';
import { Roles } from '../admins/enums/roles.enum';

@Controller('common')
export class CommonController {
  @Get('admins-roles')
  adminsRoles(): { roles: string[] } {
    return { roles: this.getEnumValues(Roles) };
  }

  private getEnumValues<T>(enumObject: T): string[] {
    return Object.values(enumObject).filter(
      (value) => typeof value === 'string',
    );
  }
}
