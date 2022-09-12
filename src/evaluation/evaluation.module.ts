import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EvaluationController } from './evaluation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluationController],
})
export class EvaluationModule {}
