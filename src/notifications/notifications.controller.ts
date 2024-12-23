import { Body, Controller, Post } from '@nestjs/common';
import { SendNotificationByEntityIdDto } from './dto/send-notification-by-entity-id.dto';
import { NotificationsService } from './notifications.service';
import { SendNotificationByEntitiesIdsDto } from './dto/send-notification-by-entities-ids.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send-to-entity')
  async sendToEntity(@Body() dto: SendNotificationByEntityIdDto) {
    await this.notificationsService.sendNotificationByEntityId(dto);
  }

  @Post('send-to-entities')
  async sendToEntities(@Body() dto: SendNotificationByEntitiesIdsDto) {
    await this.notificationsService.sendNotificationByEntitiesIds(dto);
  }
}
