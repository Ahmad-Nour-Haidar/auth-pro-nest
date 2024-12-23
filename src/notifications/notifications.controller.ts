import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { SendNotificationByEntityIdDto } from './dto/send-notification-by-entity-id.dto';
import { NotificationsService } from './notifications.service';
import { SendNotificationByEntitiesIdsDto } from './dto/send-notification-by-entities-ids.dto';
import { CurrentUser, UUIDV4Param } from '../common/decorators';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admins/entities/admin.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser() entity: User | Admin): Promise<Notification[]> {
    return this.notificationsService.findAll(entity.id);
  }

  @Get(':id')
  async findOne(@UUIDV4Param() id: string): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/mark-as-read')
  async markAsRead(@UUIDV4Param() id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-as-read')
  async markAllAsRead(@CurrentUser() entity: User | Admin): Promise<void> {
    return this.notificationsService.markAllAsRead(entity.id);
  }

  @Post('send-to-entity')
  async sendToEntity(@Body() dto: SendNotificationByEntityIdDto) {
    await this.notificationsService.sendNotificationByEntityId(dto);
  }

  @Post('send-to-entities')
  async sendToEntities(@Body() dto: SendNotificationByEntitiesIdsDto) {
    await this.notificationsService.sendNotificationByEntitiesIds(dto);
  }
}
