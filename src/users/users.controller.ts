import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { genSalt, hash } from 'bcrypt';
import { PermissionType } from 'src/common/types/permission.types';
import { Permit } from 'src/common/decorators/permit.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  // @Permit(PermissionType.SuperAdmin)
  findAll(): Promise<User[]> {
    return this.prismaService.user.findMany({
      include: { participant: true, profile: true, roles: true },
    });
  }

  @Get(':id')
  async findSpecificById(@Param('id') id: string): Promise<User> {
    const userById = await this.prismaService.user.findUnique({
      where: { id },
      include: { participant: true, profile: true, roles: true },
    });

    if (!userById) {
      const userByUserName = await this.prismaService.user.findUnique({
        where: { userName: id },
        include: { participant: true, profile: true, roles: true },
      });

      if (!userByUserName) {
        throw new ForbiddenException('Access denied.');
      } else {
        return userByUserName;
      }
    }

    return userById;
  }

  @Post()
  @Permit(PermissionType.UserManagement)
  async create(@Body() createUserInput: User) {
    if (createUserInput?.password) {
      const salt = await genSalt();
      createUserInput.password = await hash(createUserInput.password, salt);
    }

    return await this.prismaService.user.create({
      data: createUserInput,
      include: { participant: true, profile: true, roles: true },
    });
  }

  @Patch(':id')
  @Permit(PermissionType.UserManagement)
  async update(@Param('id') id: string, @Body() updateUserInput: User) {
    if (updateUserInput?.password) {
      const salt = await genSalt();
      updateUserInput.password = await hash(updateUserInput.password, salt);
    }

    const users = await this.prismaService.user.findMany({
      where: { OR: [{ id: { equals: id } }, { userName: { equals: id } }] },
    });

    if (users.length === 0) throw new ForbiddenException('Access denied.');

    return await this.prismaService.user.update({
      where: { id: users?.[0]?.id },
      data: updateUserInput,
      include: { participant: true, profile: true, roles: true },
    });
  }

  @Delete(':id')
  @Permit(PermissionType.UserManagement)
  async remove(@Param('id') id: string) {
    return await this.prismaService.user.delete({
      where: { id },
      include: { participant: true, profile: true, roles: true },
    });
  }
}
