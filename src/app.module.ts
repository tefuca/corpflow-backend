import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
// REMOVE: import { UsersModule } from './users/users.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { PaymentModule } from './modules/payment/payment.module';

import { ProcurementModule } from './modules/procurement/procurement.module';
import { StockModule } from './modules/stock/stock.module';
import { FixedAssetModule } from './modules/fixed-asset/fixed-asset.module';
import { HrModule } from './modules/hr/hr.module';
import { ProjectModule } from './modules/project/project.module';
import { AgentModule } from './modules/agent/agent.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DocumentModule } from './modules/document/document.module';
import { ActivitiesModule } from './modules/activity/activities.module';
import { AuditLogModule } from './modules/audit-logs/audit-logs.module';
import { BudgetsModule } from './modules/budget/budgets.module';
import { ExecutionsModule } from './modules/execution/executions.module';
import { MasterDataModule } from './modules/master-data/master-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

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

    AuthModule,
    // REMOVE: UsersModule,
    RbacModule,
    PaymentModule,

    ProcurementModule,
    StockModule,
    FixedAssetModule,
    HrModule,
    ProjectModule,
    AgentModule,
    FinanceModule,
    NotificationModule,
    DocumentModule,
    ActivitiesModule,
    AuditLogModule,
    BudgetsModule,
    ExecutionsModule,
    MasterDataModule,
  ],
})
export class AppModule {}
