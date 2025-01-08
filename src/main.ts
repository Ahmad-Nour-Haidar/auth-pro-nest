import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { RequestMethod } from '@nestjs/common/enums/request-method.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipes
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
  );

  // app.useGlobalPipes(new TrimPipe());

  // Enable CORS if needed
  app.enableCors();

  // Set the global prefix for all routes
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`Application is running on PORT: ${port}`);
}

bootstrap().then((_) => {});

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ExpressAdapter } from '@nestjs/platform-express';
// import * as express from 'express';
// import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
// import { RequestMethod } from '@nestjs/common';
//
// const expressApp = express();
//
// async function bootstrap() {
//   const app = await NestFactory.create(
//     AppModule,
//     new ExpressAdapter(expressApp),
//   );
//
//   // Enable global validation pipes
//   app.useGlobalPipes(
//     new I18nValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );
//
//   app.useGlobalFilters(
//     new I18nValidationExceptionFilter({ detailedErrors: false }),
//   );
//
//   // Enable CORS
//   app.enableCors();
//
//   // Set global prefix
//   app.setGlobalPrefix('api', {
//     exclude: [{ path: '/', method: RequestMethod.GET }],
//   });
//
//   await app.init(); // Initialize the app without starting a standalone server
// }
//
// bootstrap().then((_) => {});
//
// export default expressApp; // Export the app for Vercel
