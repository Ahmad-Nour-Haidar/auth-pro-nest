import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { UsersService } from './users.service';
import { CreateMethod } from '../auth/enums/create-method.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, CreateMethod.LocalEmail);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/update-roles')
  async updateRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
  ) {
    return await this.usersService.updateRoles(id, updateUserRolesDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.restore(id);
  }

  @Delete(':id/hard-delete')
  async hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.hardDelete(id);
  }
}
