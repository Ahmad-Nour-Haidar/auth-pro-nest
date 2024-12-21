import { Module } from '@nestjs/common';
import { UsersAuthController } from './users-auth.controller';
import { UsersAuthService } from './users-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLocalStrategy } from './strategies/user-local.strategy';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  controllers: [UsersAuthController],
  providers: [UsersAuthService, UserLocalStrategy],
})
export class UsersAuthModule {}
