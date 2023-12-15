import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as Sentry from '@sentry/node';
config(); 


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN_HERE', // Replace with your actual Sentry DSN
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
