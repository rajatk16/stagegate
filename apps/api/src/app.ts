import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';

import { AppModule } from './app.module';

export const createApp = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  return app;
};
