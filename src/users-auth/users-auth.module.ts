import { Module } from '@nestjs/common';
import { UsersAuthController } from './users-auth.controller';
import { UsersAuthService } from './users-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLocalStrategy } from './strategies/user-local.strategy';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersAuthController],
  providers: [UsersAuthService, UserLocalStrategy, UsersService],
})
export class UsersAuthModule {}
