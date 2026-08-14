import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { Agent } from '../agents/entities/agent.entity';
import { Project } from '../projects/entities/project.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  async getPaymentReport(filters: { from?: string; to?: string; status?: string }) {
    const query = this.paymentRepo.createQueryBuilder('p');
    
    if (filters.from && filters.to) {
      query.where('p.paymentDate BETWEEN :from AND :to', { from: filters.from, to: filters.to });
    }
    if (filters.status) {
      query.andWhere('p.status = :status', { status: filters.status });
    }

    return query.orderBy('p.paymentDate', 'DESC').getMany();
  }

  async getAgentReport(dapId?: string) {
    const query = this.agentRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.dap', 'dap');
    
    if (dapId) {
      query.where('a.dap_id = :dapId', { dapId });
    }

    return query.getMany();
  }

  async getProjectReport(projectId?: string) {
    if (projectId) {
      return this.projectRepo.findOne({
        where: { id: projectId },
        relations: ['activities', 'milestones', 'budgets'],
      });
    }
    return this.projectRepo.find({
      relations: ['activities', 'milestones'],
    });
  }

  async getFinancialReport(period?: string) {
    // Simplified — extend with GL journal entries if needed
    const payments = await this.paymentRepo.find();
    const totalOutflow = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      period: period || 'All time',
      totalPayments: payments.length,
      totalOutflow,
      generatedAt: new Date(),
    };
  }

  async getAuditReport(filters: { user?: string; action?: string; from?: string; to?: string }) {
    const where: any = {};
    
    if (filters.user) where.user = filters.user;
    if (filters.action) where.action = filters.action;
    if (filters.from && filters.to) {
      where.createdAt = Between(new Date(filters.from), new Date(filters.to));
    }

    return this.auditLogRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 1000,
    });
  }

  async exportReport(reportType: string) {
    switch (reportType) {
      case 'payments': return this.getPaymentReport({});
      case 'agents': return this.getAgentReport();
      case 'projects': return this.getProjectReport();
      case 'audit': return this.getAuditReport({});
      default: return [];
    }
  }

  toCsv(data: any[]): string {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }
}