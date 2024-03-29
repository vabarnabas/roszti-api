import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { EventsController } from './events/events.controller';
import { EventsModule } from './events/events.module';
import { PermissionGuard } from './common/guards/permission.guard';
import { EvaluationModule } from './evaluation/evaluation.module';
import { ParticipantModule } from './participant/participant.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, EventsModule, EvaluationModule, ParticipantModule],
  controllers: [AppController, EventsController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
