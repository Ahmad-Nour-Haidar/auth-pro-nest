import { Module } from '@nestjs/common';
import { SuperAdminsController } from './super-admins.controller';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [AdminsModule],
  controllers: [SuperAdminsController],
})
export class SuperAdminsModule {}
