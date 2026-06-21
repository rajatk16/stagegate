import { Logger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from '@/app.module';
import { setupSwagger } from '@/swagger/swagger.config';
import { GlobalExceptionFilter } from '@/common/filters/globalException.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string[]>('app.corsOrigins', {
    infer: true,
  });

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useLogger(app.get(Logger));

  setupSwagger(app);

  app.useGlobalFilters(app.get(GlobalExceptionFilter));
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
