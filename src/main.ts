import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as Sentry from '@sentry/node';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


config(); 


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN_HERE', // Replace with your actual Sentry DSN
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join('src','.', 'views'));


  app.enableCors();
  await app.listen(3000);
}
bootstrap();
