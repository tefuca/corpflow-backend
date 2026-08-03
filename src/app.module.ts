import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Existing modules (keep your current ones, add new ones)
import { AuthModule } from './modules/auth/auth.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { PaymentModule } from './modules/payment/payment.module';

// NEW Feature Modules
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { FixedAssetsModule } from './modules/fixed-assets/fixed-assets.module';
import { HrModule } from './modules/hr/hr.module';
import { ProjectModule } from './modules/project/project.module';
import { AgentModule } from './modules/agent/agent.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DocumentModule } from './modules/document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Serve uploaded files (receipts, KYC docs, asset tags)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Database — PostgreSQL (matches your existing .env)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'password'),
        database: config.get<string>('DB_NAME', 'crms_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('APP_ENV') === 'development',
        logging: config.get<string>('APP_ENV') === 'development',
        extra: {
          max: config.get<number>('DB_POOL_SIZE', 10),
        },
      }),
    }),

    // Existing modules
    AuthModule,
    RbacModule,
    PaymentModule,

    // NEW modules
    ProcurementModule,
    InventoryModule,
    FixedAssetsModule,
    HrModule,
    ProjectModule,
    AgentModule,
    FinanceModule,
    NotificationModule,
    DocumentModule,
  ],
})
export class AppModule {}