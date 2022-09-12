import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Event, InterviewEvaluation } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  findAll(): Promise<InterviewEvaluation[]> {
    return this.prismaService.interviewEvaluation.findMany({
      include: { reviewee: true, reviewer: true },
    });
  }

  @Get(':id')
  findSpecificById(@Param('id') id: string): Promise<InterviewEvaluation> {
    return this.prismaService.interviewEvaluation.findUnique({
      where: { id },
      include: { reviewee: true, reviewer: true },
    });
  }

  @Post()
  async create(@Body() createEvaluationInput: InterviewEvaluation) {
    return this.prismaService.interviewEvaluation.create({
      data: createEvaluationInput,
      include: { reviewee: true, reviewer: true },
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEvaluationInput: InterviewEvaluation,
  ) {
    return this.prismaService.interviewEvaluation.update({
      where: { id },
      data: updateEvaluationInput,
      include: { reviewee: true, reviewer: true },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prismaService.interviewEvaluation.delete({ where: { id } });
  }
}
