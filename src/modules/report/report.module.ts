import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Payment } from '../payments/entities/payment.entity';
import { Agent } from '../agents/entities/agent.entity';
import { Project } from '../projects/entities/project.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Agent, Project, AuditLog])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}