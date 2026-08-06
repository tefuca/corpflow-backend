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
import { StockModule } from './modules/stock/stock.module';
import { FixedAssetModule } from './modules/fixed-asset/fixed-asset.module';
import { HrModule } from './modules/hr/hr.module';
import { ProjectModule } from './modules/project/project.module';
import { AgentModule } from './modules/agent/agent.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DocumentModule } from './modules/document/document.module';
import { ActivityModule } from './modules/activity/activities.module';
import { AuditLogModule } from './modules/audit-log/audit-logs.module';
import { AssetModule } from './modules/asset/assets.module';
import { BudgetModule } from './modules/budget/budgets.module';
import { ExecutionModule } from './modules/execution/executions.module';
import { MasterDataModule } from './modules/master-data/master-data.module';

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
    StockModule,
    FixedAssetModule,
    HrModule,
    ProjectModule,
    AgentModule,
    FinanceModule,
    NotificationModule,
    DocumentModule,
    ActivityModule, 
    AuditLogModule,
    AssetModule,
    BudgetModule, 
    ExecutionModule, 
    MasterDataModule,
  ],
})
export class AppModule {}
