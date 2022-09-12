import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ParticipantController } from './participant.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ParticipantController],
})
export class ParticipantModule {}
