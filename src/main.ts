import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { patchNestJsSwagger } from 'nestjs-zod';
import setupSwagger from 'swagger.config';
import { PrismaExceptionFilters } from './common/filters/prisma-exception.filter';
import { ZodFilter } from './common/filters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.enableCors();
  app.useGlobalFilters(new ZodFilter());
  app.useGlobalFilters(new PrismaExceptionFilters());

  patchNestJsSwagger();
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
