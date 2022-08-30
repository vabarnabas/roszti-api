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
  findAll(): Promise<User[]> {
    return this.prismaService.user.findMany({
      include: { participant: true, profile: true, roles: true },
    });
  }

  @Get(':id')
  async findSpecificById(@Param('id') id: string): Promise<User> {
    const users = await this.prismaService.user.findMany({
      where: { OR: [{ id: { equals: id } }, { userName: { equals: id } }] },
      include: { participant: true, profile: true, roles: true },
    });

    if (users.length === 0) throw new ForbiddenException('Access denied.');

    return users[0];
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

  @Post('roles/add/:id')
  @Permit(PermissionType.UserManagement)
  async connectRole(@Param('id') id: string, @Body() body: { roleId: string }) {
    const users = await this.prismaService.user.findMany({
      where: { OR: [{ id: { equals: id } }, { userName: { equals: id } }] },
      include: { participant: true, profile: true, roles: true },
    });

    if (users.length === 0) throw new ForbiddenException('Access denied.');

    if (body.roleId) {
      const role = await this.prismaService.role.findUnique({
        where: { id: body.roleId },
      });

      if (!role) throw new ForbiddenException('Access denied.');

      return await this.prismaService.user.update({
        where: { id: users[0].id },
        data: {
          roles: {
            connect: { id: body.roleId },
          },
        },
        include: { participant: true, profile: true, roles: true },
      });
    } else {
      throw new ForbiddenException('Access denied.');
    }
  }

  @Post('roles/remove/:id')
  @Permit(PermissionType.UserManagement)
  async disconnectRole(
    @Param('id') id: string,
    @Body() body: { roleId: string },
  ) {
    const users = await this.prismaService.user.findMany({
      where: { OR: [{ id: { equals: id } }, { userName: { equals: id } }] },
      include: { participant: true, profile: true, roles: true },
    });

    if (users.length === 0) throw new ForbiddenException('Access denied.');

    if (body.roleId) {
      const role = await this.prismaService.role.findUnique({
        where: { id: body.roleId },
      });

      if (!role) throw new ForbiddenException('Access denied.');

      return await this.prismaService.user.update({
        where: { id: users[0].id },
        data: {
          roles: {
            disconnect: { id: body.roleId },
          },
        },
        include: { participant: true, profile: true, roles: true },
      });
    } else {
      throw new ForbiddenException('Access denied.');
    }
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
