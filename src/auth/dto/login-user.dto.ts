import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class LoginUserDto extends OmitType(CreateUserDto, [
  'username',
  'full_name',
] as const) {}
