import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { CurrentUser, SuperAdminOnly } from '../common/decorators';
import { transformToDto } from '../utilities/transform.util';
import { UUIDV4Param } from '../common/decorators/uuid-param.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResponseService } from '../common/services/response.service';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LodashService } from '../common/services/lodash.service';
import { JwtAuthUserGuard } from '../users-auth/guards/jwt-auth-user.guard';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';

@Controller('users')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthUserGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
    private readonly lodashService: LodashService,
    private readonly i18n: CustomI18nService,
  ) {}

  @Post()
  @SuperAdminOnly()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_created),
      {
        user: transformToDto(UserResponseDto, user),
      },
    );
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.account_updated),
      {
        user: this.lodashService.omitKeys(updatedUser, [
          'password',
          'password_changed_at',
          'verify_code',
          'roles',
        ]),
      },
    );
  }

  @Patch(':id')
  @SuperAdminOnly()
  async update(
    @UUIDV4Param() id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_updated),
      {
        user: transformToDto(UserResponseDto, updatedUser),
      },
    );
  }

  @Get()
  @SuperAdminOnly()
  async findAll() {
    const users = await this.usersService.findAll();
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.users_retrieved),
      {
        users: users.map((user) => transformToDto(UserResponseDto, user)),
      },
    );
  }

  @Get('me')
  async me(@CurrentUser() user: User) {
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_retrieved),
      {
        user: this.lodashService.omitKeys(user, [
          'password',
          'password_changed_at',
          'verify_code',
          'roles',
        ]),
      },
    );
  }

  @Get(':id')
  @SuperAdminOnly()
  async findOne(@UUIDV4Param() id: string) {
    const user = await this.usersService.findOne(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_retrieved),
      {
        user: transformToDto(UserResponseDto, user),
      },
    );
  }

  @Delete(':id')
  @SuperAdminOnly()
  async softDelete(@UUIDV4Param() id: string) {
    const user = await this.usersService.softDelete(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_soft_deleted),
      {
        user: transformToDto(UserResponseDto, user),
      },
    );
  }

  @Patch('/restore/:id')
  @SuperAdminOnly()
  async restore(@UUIDV4Param() id: string) {
    const user = await this.usersService.restore(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_restored),
      {
        user: transformToDto(UserResponseDto, user),
      },
    );
  }

  @Delete('/hard-delete/:id')
  @SuperAdminOnly()
  async hardDelete(@UUIDV4Param() id: string) {
    await this.usersService.hardDelete(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_hard_deleted),
    );
  }

  @Patch('/block/:id')
  @SuperAdminOnly()
  async block(@UUIDV4Param() id: string) {
    const user = await this.usersService.blockUser(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_blocked),
      {
        user: transformToDto(UserResponseDto, user),
      },
    );
  }

  @Patch('/unblock/:id')
  @SuperAdminOnly()
  async unblock(@UUIDV4Param() id: string) {
    const user = await this.usersService.unblockUser(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_unblocked),
      {
        user: transformToDto(UserResponseDto, user),
      },
    );
  }
}
