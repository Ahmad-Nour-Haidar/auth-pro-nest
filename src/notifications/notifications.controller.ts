import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SendNotificationByEntityIdDto } from './dto/send-notification-by-entity-id.dto';
import { NotificationsService } from './notifications.service';
import { SendNotificationByEntitiesIdsDto } from './dto/send-notification-by-entities-ids.dto';
import {
  CurrentEntityType,
  CurrentUser,
  UUIDV4Param,
} from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admins/entities/admin.entity';
import { ResponseService } from '../common/services/response.service';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { EntityTypeEnum } from '../common/enums/entity-type.enum';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly responseService: ResponseService,
    private readonly i18n: CustomI18nService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() entity: User | Admin,
    @Query() query: Record<string, any>,
  ) {
    const result = await this.notificationsService.findAll(entity.id, query);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.notifications_retrieved_successfully),
      result,
    );
  }

  @Get(':id')
  async findOne(@UUIDV4Param() id: string) {
    const notification = await this.notificationsService.findOne(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.notification_retrieved_successfully),
      { notification },
    );
  }

  @Patch(':id/mark-as-read')
  async markAsRead(@UUIDV4Param() id: string) {
    const notification = await this.notificationsService.markAsRead(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.notification_marked_successfully),
      {
        notification,
      },
    );
  }

  @Patch('mark-all-as-read')
  async markAllAsRead(@CurrentUser() entity: User | Admin) {
    await this.notificationsService.markAllAsRead(entity.id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.notifications_marked_successfully),
    );
  }

  /// ----------------- test -----------------
  @Post()
  async create(
    @Body() body: any,
    @CurrentUser() entity: Admin | User,
    @CurrentEntityType() entityType: EntityTypeEnum,
  ) {
    const notifications = await this.notificationsService.create({
      ...body,
      entity_id: entity.id,
      entity_type: entityType,
    });
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.notifications_retrieved_successfully),
      { notifications },
    );
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
