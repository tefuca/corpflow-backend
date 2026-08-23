import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import seedAdmin from './database/seeds/admin.seed'; // Admin seeder

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS — FIXED: Only call once with all origins
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter & response transformer
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // API prefix
  app.setGlobalPrefix('api/v1');

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

  // Run admin seed on startup (creates default admin if not exists)
  try {
    const dataSource = app.get(DataSource);
    await seedAdmin(dataSource);
    console.log('✅ Admin seed completed');
  } catch (err) {
    console.warn('⚠️ Seed skipped or failed:', err.message);
  }

  const port = configService.get<number>('APP_PORT', 3000);
  await app.listen(port);

  console.log(`\n🚀 CRMS Backend running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`📦 Environment: ${configService.get('APP_ENV', 'development')}`);
}

bootstrap();
