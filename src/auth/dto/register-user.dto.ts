import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterUserDto extends OmitType(CreateUserDto, [
  'roles',
] as const) {}
