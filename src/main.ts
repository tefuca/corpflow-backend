import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // API prefix
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
});
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('CRMS API')
    .setDescription('Corporate Resource Management System API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('RBAC', 'Role-Based Access Control')
    .addTag('Payment', 'Payment Management System')
    .addTag('HR', 'Human Resource Management')
    .addTag('Stock', 'Stock Tracking Management')
    .addTag('FixedAsset', 'Fixed Asset Management')
    .addTag('Project', 'Project Management')
    .addTag('Dashboard', 'Dashboard & Analytics')
    .addTag('Report', 'Reports & Analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('APP_PORT', 3000);
  await app.listen(port);

  console.log(`\n🚀 CRMS Backend running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`📦 Environment: ${configService.get('APP_ENV', 'development')}`);
}

bootstrap();
