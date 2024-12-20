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
import { CreateMethod } from './enums/create-method.enum';
import { CurrentUser, SuperAdminOnly } from '../common/decorators';
import { transformToDto } from '../utilities/transform.util';
import { UUIDV4Param } from '../common/decorators/uuid-param.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseService } from '../common/services/response.service';
import { Roles } from '../admins/enums/roles.enum';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @SuperAdminOnly()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto, {
      create_method: CreateMethod.localEmail,
    });
    return this.responseService.success('User created successfully', {
      admin: transformToDto(UserResponseDto, user),
    });
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return this.responseService.success('msg', {
      admin: transformToDto(UserResponseDto, updatedUser),
    });
  }

  @Patch(':id')
  @SuperAdminOnly()
  async update(
    @UUIDV4Param() id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return this.responseService.success('User updated successfully', {
      admin: transformToDto(UserResponseDto, updatedUser),
    });
  }

  @Get()
  @SuperAdminOnly()
  async findAll() {
    const users = await this.usersService.findAll();
    return this.responseService.success('Users retrieved successfully', {
      users: users.map((user) => transformToDto(UserResponseDto, user)),
    });
  }

  @Get('me')
  async me(@CurrentUser() user: User) {
    return this.responseService.success('msg', {
      user: transformToDto(UserResponseDto, user),
    });
  }

  @Get(':id')
  @SuperAdminOnly()
  async findOne(@UUIDV4Param() id: string) {
    const user = await this.usersService.findOne(id);
    return this.responseService.success('User retrieved successfully', {
      user: transformToDto(UserResponseDto, user),
    });
  }

  @Delete(':id')
  @SuperAdminOnly()
  async delete(@UUIDV4Param() id: string) {
    const user = await this.usersService.softDelete(id);
    return this.responseService.success('User soft deleted successfully', {
      user: transformToDto(UserResponseDto, user),
    });
  }

  @Patch('/restore/:id')
  @SuperAdminOnly()
  async restore(@UUIDV4Param() id: string) {
    const user = await this.usersService.restore(id);
    return this.responseService.success('User restored successfully', {
      user: transformToDto(UserResponseDto, user),
    });
  }

  @Delete('/hard-delete/:id')
  @SuperAdminOnly()
  async hardDelete(@UUIDV4Param() id: string) {
    await this.usersService.hardDelete(id);
    return this.responseService.success('User hard deleted successfully');
  }

  @Patch('/block/:id')
  @SuperAdminOnly()
  async block(@UUIDV4Param() id: string) {
    const user = await this.usersService.blockUser(id);
    return this.responseService.success('Admin blocked successfully', {
      user: transformToDto(UserResponseDto, user),
    });
  }

  @Patch('/unblock/:id')
  @SuperAdminOnly()
  async unblock(@UUIDV4Param() id: string) {
    const user = await this.usersService.unblockUser(id);
    return this.responseService.success('Admin unblocked successfully', {
      user: transformToDto(UserResponseDto, user),
    });
  }
}
