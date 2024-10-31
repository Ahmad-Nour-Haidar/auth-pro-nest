import { CreateUserDto } from '../../users/dto/create-user.dto';
import { PartialType } from '@nestjs/mapped-types';

export class RegisterUserDto extends PartialType(CreateUserDto) {}
