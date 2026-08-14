import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { KpiDefinition } from '../entities/kpi-definition.entity';
import { KpiAchievement } from '../entities/kpi-achievement.entity';
import { ClientInvoice, InvoiceStatus } from '../../finance/entities/client-invoice.entity';
import { AgentStatus, KpiType } from '../../common/enums';

@Injectable()
export class ClientKpiBillingService {
  constructor(
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
    @InjectRepository(KpiDefinition)
    private kpiDefRepo: Repository<KpiDefinition>,
    @InjectRepository(KpiAchievement)
    private kpiAchRepo: Repository<KpiAchievement>,
    @InjectRepository(ClientInvoice)
    private invoiceRepo: Repository<ClientInvoice>,
    private dataSource: DataSource,
  ) {}

  async generateKpiInvoice(agentId: string, kpiDefinitionId: string, periodStart: Date, periodEnd: Date) {
    const agent = await this.agentRepo.findOne({
      where: { id: agentId },
      relations: ['client', 'project'],
    });

    const kpiDef = await this.kpiDefRepo.findOne({ where: { id: kpiDefinitionId } });

    if (!agent || !kpiDef) throw new Error('Agent or KPI not found');

    let actualValue = 0;
    let billedAmount = 0;

    switch (kpiDef.kpiType) {
      case KpiType.ACTIVATION:
        if (agent.status === AgentStatus.ACTIVATED || agent.status === AgentStatus.TRANSACTIONAL_ACTIVE) {
          actualValue = 1;
          billedAmount = kpiDef.fixedAmount || 0;
        }
        break;

      case KpiType.TRANSACTION_VOLUME:
        actualValue = agent.transactionVolumeTotal || 0;
        billedAmount = kpiDef.percentageRate 
          ? actualValue * (kpiDef.percentageRate / 100)
          : (kpiDef.fixedAmount || 0);
        break;

      case KpiType.CUSTOMER_ACQUISITION:
        actualValue = agent.customerCount || 0;
        billedAmount = (kpiDef.fixedAmount || 0) * actualValue;
        break;

      case KpiType.RETENTION:
        if (agent.status === AgentStatus.TRANSACTIONAL_ACTIVE) {
          actualValue = 1;
          billedAmount = kpiDef.fixedAmount || 0;
        }
        break;
    }

    const achievement = this.kpiAchRepo.create({
      agentId,
      kpiDefinitionId,
      actualValue,
      measuredDate: new Date(),
      measurementPeriodStart: periodStart,
      measurementPeriodEnd: periodEnd,
      status: 'approved',
      billedAmount,
      billed: false,
    });

    const savedAchievement = await this.kpiAchRepo.save(achievement);

    const invoiceNumber = `INV-KPI-${Date.now()}`;
    const invoice = this.invoiceRepo.create({
      invoiceNumber: invoiceNumber,
      clientId: agent.clientId,
      projectId: agent.projectId,
      invoiceType: 'kpi',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: billedAmount,
      tax: 0,
      total: billedAmount,
      status: InvoiceStatus.DRAFT,   // <-- FIXED: use enum instead of string
      agentId: agent.id,
      kpiType: kpiDef.kpiType,
    });

    const savedInvoice = await this.invoiceRepo.save(invoice) as any;

    savedAchievement.invoiceId = (savedInvoice as any).id;
    savedAchievement.billed = true;
    await this.kpiAchRepo.save(savedAchievement);

    return { achievement: savedAchievement, invoice: savedInvoice };
  }

  async batchGenerateInvoices(projectId: string, periodStart: Date, periodEnd: Date) {
    const agents = await this.agentRepo.find({
      where: { projectId, status: AgentStatus.TRANSACTIONAL_ACTIVE },
    });

    const results = [];
    for (const agent of agents) {
      const kpis = await this.kpiDefRepo.find({
        where: { projectId: agent.projectId, active: true },
      });

      for (const kpi of kpis) {
        try {
          const result = await this.generateKpiInvoice(agent.id, kpi.id, periodStart, periodEnd);
          results.push(result);
        } catch (e) {
          results.push({ error: e.message, agentId: agent.id, kpiId: kpi.id });
        }
      }
    }

    return { generated: results.length, results };
  }
}
