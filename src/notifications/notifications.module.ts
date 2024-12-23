import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FirebaseAdminService } from './services/firebase-admin.service';
import { DeviceTokenModule } from '../device-token/device-token.module';

@Module({
  imports: [DeviceTokenModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseAdminService],
})
export class NotificationsModule {}
