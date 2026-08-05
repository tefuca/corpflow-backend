import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Notification } from './entities/notification.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Notification, AuditLog])],
  providers: [],
  exports: [TypeOrmModule],
})
export class CommonModule {}
