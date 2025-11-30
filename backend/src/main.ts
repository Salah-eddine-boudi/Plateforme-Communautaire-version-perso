import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // AUTORISER REACT À DISCUTER AVEC NESTJS :
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
