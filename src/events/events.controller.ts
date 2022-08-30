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
import { Event } from '@prisma/client';
import { Permit } from 'src/common/decorators/permit.decorator';
import { PermissionType } from 'src/common/types/permission.types';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('events')
export class EventsController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  findAll(): Promise<Event[]> {
    return this.prismaService.event.findMany({
      include: { participants: true },
    });
  }

  @Get(':id')
  findSpecificById(@Param('id') id: string): Promise<Event> {
    return this.prismaService.event.findUnique({
      where: { id },
      include: { participants: true },
    });
  }

  @Post()
  @Permit(PermissionType.EventManagement)
  async create(@Body() createUserInput: Event) {
    return this.prismaService.event.create({
      data: createUserInput,
      include: { participants: true },
    });
  }

  @Post('users/add/:id')
  @Permit(PermissionType.EventManagement)
  async connectUser(@Param('id') id: string, @Body() body: { userId: string }) {
    const events = await this.prismaService.event.findMany({
      where: {
        OR: [{ id: { equals: id } }, { slug: { equals: id } }],
      },
      include: { participants: true },
    });

    if (events.length === 0) throw new ForbiddenException('Access denied.');

    if (body.userId) {
      const users = await this.prismaService.user.findMany({
        where: {
          OR: [
            { id: { equals: body.userId } },
            { userName: { equals: body.userId } },
          ],
        },
        include: { participant: true, profile: true, roles: true },
      });

      if (users.length === 0) throw new ForbiddenException('Access denied.');

      return await this.prismaService.event.update({
        where: { id: events[0].id },
        data: {
          participants: {
            connect: { id: users[0].id },
          },
        },
        include: { participants: true },
      });
    } else {
      throw new ForbiddenException('Access denied.');
    }
  }

  @Post('users/remove/:id')
  @Permit(PermissionType.EventManagement)
  async disconnectUser(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    const events = await this.prismaService.event.findMany({
      where: {
        OR: [{ id: { equals: id } }, { slug: { equals: id } }],
      },
      include: { participants: true },
    });

    if (events.length === 0) throw new ForbiddenException('Access denied.');

    if (body.userId) {
      const users = await this.prismaService.user.findMany({
        where: {
          OR: [
            { id: { equals: body.userId } },
            { userName: { equals: body.userId } },
          ],
        },
        include: { participant: true, profile: true, roles: true },
      });

      if (users.length === 0) throw new ForbiddenException('Access denied.');

      return await this.prismaService.event.update({
        where: { id: events[0].id },
        data: {
          participants: {
            disconnect: { id: users[0].id },
          },
        },
        include: { participants: true },
      });
    } else {
      throw new ForbiddenException('Access denied.');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserInput: Event) {
    return this.prismaService.event.update({
      where: { id },
      data: updateUserInput,
      include: { participants: true },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prismaService.event.delete({ where: { id } });
  }
}
