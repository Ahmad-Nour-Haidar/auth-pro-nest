import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BcryptService } from './services/bcrypt.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, BcryptService],
  exports: [BcryptService],
})
export class UsersModule {}
