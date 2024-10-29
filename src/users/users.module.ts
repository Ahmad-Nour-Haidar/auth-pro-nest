import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { BcryptService } from './services/bcrypt.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService, BcryptService],
  exports: [BcryptService],
})
export class UsersModule {}
