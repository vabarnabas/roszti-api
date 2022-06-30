import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AtGuard } from './common/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(9020);
}
bootstrap();
