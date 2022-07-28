import {
  Body,
  Controller,
  Delete,
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
  @Permit(PermissionType.SuperAdmin)
  findAll(): Promise<User[]> {
    return this.prismaService.user.findMany({
      include: { participant: true, profile: true, roles: true },
    });
  }

  @Get(':id')
  findSpecificById(@Param('id') id: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { id },
      include: { participant: true, profile: true, roles: true },
    });
  }

  @Post()
  async create(@Body() createUserInput: User) {
    if (createUserInput?.password) {
      const salt = await genSalt();
      createUserInput.password = await hash(createUserInput.password, salt);
    }

    return this.prismaService.user.create({
      data: createUserInput,
      include: { participant: true, profile: true, roles: true },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserInput: User) {
    if (updateUserInput?.password) {
      const salt = await genSalt();
      updateUserInput.password = await hash(updateUserInput.password, salt);
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateUserInput,
      include: { participant: true, profile: true, roles: true },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prismaService.user.delete({
      where: { id },
      include: { participant: true, profile: true, roles: true },
    });
  }
}
