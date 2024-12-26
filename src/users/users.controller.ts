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
import { SuperAdminOnly } from '../common/decorators';
import { transformToDto } from '../common/util/transform.util';
import { UUIDV4Param } from '../common/decorators';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResponseService } from '../common/services/response.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { JwtAuthAdminGuard } from '../admins-auth/guards/jwt-auth-admin.guard';

@Controller('users')
@UseGuards(JwtAuthAdminGuard, RolesGuard)
@SuperAdminOnly()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
    private readonly i18n: CustomI18nService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_created),
      {
        user: transformToDto(UserResponseDto, user),
      },
    );
  }

  @Patch(':id')
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
  async findAll() {
    const users = await this.usersService.findAll();
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.users_retrieved),
      {
        users: users.map((user) => transformToDto(UserResponseDto, user)),
      },
    );
  }

  @Get(':id')
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
  async hardDelete(@UUIDV4Param() id: string) {
    await this.usersService.hardDelete(id);
    return this.responseService.success(
      this.i18n.tr(TranslationKeys.user_hard_deleted),
    );
  }

  @Patch('/block/:id')
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
