import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { Project } from '../projects/entities/project.entity';
import { Agent } from '../agents/entities/agent.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  async getOverallStats() {
    const [totalPayments, totalProjects, totalAgents, totalActivities] = await Promise.all([
      this.paymentRepo.count(),
      this.projectRepo.count(),
      this.agentRepo.count(),
      this.auditLogRepo.count(),
    ]);

    return {
      totalPayments,
      totalProjects,
      totalAgents,
      totalActivities,
      timestamp: new Date(),
    };
  }

  async getFinancialSummary() {
    const result = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'totalAmount')
      .addSelect('COUNT(*)', 'count')
      .addSelect('p.status', 'status')
      .groupBy('p.status')
      .getRawMany();

    return {
      byStatus: result,
      generatedAt: new Date(),
    };
  }

  async getPaymentSummary() {
    const pending = await this.paymentRepo.count({ where: { status: 'pending' } });
    const approved = await this.paymentRepo.count({ where: { status: 'approved' } });
    const executed = await this.paymentRepo.count({ where: { status: 'executed' } });
    const failed = await this.paymentRepo.count({ where: { status: 'failed' } });

    return { pending, approved, executed, failed };
  }

  async getAgentSummary() {
    const total = await this.agentRepo.count();
    const active = await this.agentRepo.count({ where: { status: 'A-100' } }); // adjust status
    const dormant = await this.agentRepo.count({ where: { status: 'Dormant' } });

    return { total, active, dormant };
  }

  async getRecentActivities(limit: number) {
    return this.auditLogRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getProjectSummary() {
    const total = await this.projectRepo.count();
    const active = await this.projectRepo.count({ where: { status: 'active' } });
    const completed = await this.projectRepo.count({ where: { status: 'completed' } });
    const onHold = await this.projectRepo.count({ where: { status: 'on_hold' } });

    return { total, active, completed, onHold };
  }
}