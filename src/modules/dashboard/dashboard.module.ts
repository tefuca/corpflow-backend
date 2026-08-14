import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Payment } from '../payments/entities/payment.entity';
import { Project } from '../projects/entities/project.entity';
import { Agent } from '../agents/entities/agent.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Project, Agent, AuditLog])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}