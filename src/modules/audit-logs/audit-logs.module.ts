import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditLogService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
  forwardRef(() => AuthModule),
  TypeOrmModule.forFeature([AuditLog])
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}