import { Module } from '@nestjs/common';
import { AdminsAuthController } from './admins-auth.controller';
import { AdminsAuthService } from './admins-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../admins/entities/admin.entity';
import { AdminLocalStrategy } from './strategies/admin-local.strategy';
import { JwtStrategy } from '../common/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]), // JWT Module configuration
  ],
  controllers: [AdminsAuthController],
  providers: [AdminsAuthService, AdminLocalStrategy],
})
export class AdminsAuthModule {}
