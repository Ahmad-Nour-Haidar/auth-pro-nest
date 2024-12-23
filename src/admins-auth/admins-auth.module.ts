import { Module } from '@nestjs/common';
import { AdminsAuthController } from './admins-auth.controller';
import { AdminsAuthService } from './admins-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../admins/entities/admin.entity';
import { AdminLocalStrategy } from './strategies/admin-local.strategy';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), AdminsModule],
  controllers: [AdminsAuthController],
  providers: [AdminsAuthService, AdminLocalStrategy, JwtAdminStrategy],
  // exports: [JwtAdminStrategy],
})
export class AdminsAuthModule {}
