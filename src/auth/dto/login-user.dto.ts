import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class LoginUserDto extends OmitType(CreateUserDto, [
  'roles',
  'username',
  'full_name',
] as const) {}
