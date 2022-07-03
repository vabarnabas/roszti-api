import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('events')
export class EventsController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  findAll(): Promise<Event[]> {
    return this.prismaService.event.findMany({
      include: { participants: true, role: true },
    });
  }

  @Get(':id')
  findSpecificById(@Param('id') id: string): Promise<Event> {
    return this.prismaService.event.findUnique({
      where: { id },
      include: { participants: true, role: true },
    });
  }

  @Post()
  async create(@Body() createUserInput: Event) {
    return this.prismaService.event.create({
      data: createUserInput,
      include: { participants: true, role: true },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserInput: Event) {
    return this.prismaService.event.update({
      where: { id },
      data: updateUserInput,
      include: { participants: true, role: true },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prismaService.event.delete({ where: { id } });
  }
}
