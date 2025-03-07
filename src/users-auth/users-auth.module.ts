import { Module } from '@nestjs/common';
import { UsersAuthController } from './users-auth.controller';
import { UsersAuthService } from './users-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLocalStrategy } from './strategies/user-local.strategy';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { GoogleAuthService } from './services/google-auth.service';
import { VerifyCodeManagerService } from './services/verify-code-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  controllers: [UsersAuthController],
  providers: [
    UsersAuthService,
    UserLocalStrategy,
    JwtUserStrategy,
    GoogleAuthService,
    VerifyCodeManagerService,
  ],
})
export class UsersAuthModule {}
