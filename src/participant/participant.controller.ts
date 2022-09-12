import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InterviewParticipant } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('participants')
export class ParticipantController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  findAll(): Promise<InterviewParticipant[]> {
    return this.prismaService.interviewParticipant.findMany({
      include: { evaluation: true },
    });
  }

  @Get(':id')
  findSpecificById(@Param('id') id: string): Promise<InterviewParticipant> {
    return this.prismaService.interviewParticipant.findUnique({
      where: { id },
      include: { evaluation: true },
    });
  }

  @Post()
  async create(@Body() createInput: InterviewParticipant) {
    return this.prismaService.interviewParticipant.create({
      data: createInput,
      include: { evaluation: true },
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInput: InterviewParticipant,
  ) {
    return this.prismaService.interviewParticipant.update({
      where: { id },
      data: updateInput,
      include: { evaluation: true },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prismaService.interviewParticipant.delete({ where: { id } });
  }
}
