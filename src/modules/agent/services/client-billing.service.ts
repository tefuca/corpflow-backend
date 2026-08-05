import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { KpiDefinition } from '../entities/kpi-definition.entity';
import { KpiAchievement } from '../entities/kpi-achievement.entity';
import { ClientBillingRecord } from '../entities/client-billing-record.entity';

@Injectable()
export class ClientBillingService {
  constructor(
    @InjectRepository(Agent) private agentRepo: Repository<Agent>,
    @InjectRepository(KpiDefinition) private kpiDefRepo: Repository<KpiDefinition>,
    @InjectRepository(KpiAchievement) private kpiAchRepo: Repository<KpiAchievement>,
    @InjectRepository(ClientBillingRecord) private billingRepo: Repository<ClientBillingRecord>,
  ) {}

  async generateKpiInvoice(agentId: string, kpiDefinitionId: string, periodStart: Date, periodEnd: Date) {
    const agent = await this.agentRepo.findOne({ where: { id: agentId }, relations: ['client', 'project'] });
    const kpiDef = await this.kpiDefRepo.findOne({ where: { id: kpiDefinitionId } });
    if (!agent || !kpiDef) throw new Error('Agent or KPI not found');

    let actualValue = 0;
    let billedAmount = 0;

    switch (kpiDef.kpiType) {
      case 'activation':
        if (['A-400', 'A-500'].includes(agent.status)) { actualValue = 1; billedAmount = kpiDef.fixedAmount || 0; }
        break;
      case 'transaction_volume':
        actualValue = agent.transactionVolumeTotal || 0;
        billedAmount = kpiDef.percentageRate ? actualValue * (kpiDef.percentageRate / 100) : (kpiDef.fixedAmount || 0);
        break;
      case 'customer_acquisition':
        actualValue = agent.customerCount || 0;
        billedAmount = (kpiDef.fixedAmount || 0) * actualValue;
        break;
      case 'retention':
        if (agent.status === 'A-500') { actualValue = 1; billedAmount = kpiDef.fixedAmount || 0; }
        break;
    }

    const achievement = this.kpiAchRepo.create({
      agentId, kpiDefinitionId, actualValue,
      measuredDate: new Date(),
      measurementPeriodStart: periodStart,
      measurementPeriodEnd: periodEnd,
      status: 'approved', billedAmount, billed: false,
    });
    const savedAch = await this.kpiAchRepo.save(achievement);

    const billingNumber = `BILL-${Date.now()}`;
    const billing = this.billingRepo.create({
      billingNumber,
      clientId: agent.clientId,
      projectId: agent.projectId,
      agentId,
      kpiDefinitionId,
      amount: billedAmount,
      billingDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
    });
    const savedBill = await this.billingRepo.save(billing);

    savedAch.billed = true;
    await this.kpiAchRepo.save(savedAch);

    return { achievement: savedAch, billing: savedBill };
  }

  async batchGenerateInvoices(projectId: string, periodStart: Date, periodEnd: Date) {
    const agents = await this.agentRepo.find({ where: { projectId, status: 'A-500' } });
    const results = [];
    for (const agent of agents) {
      const kpis = await this.kpiDefRepo.find({ where: { projectId, active: true } });
      for (const kpi of kpis) {
        try {
          const r = await this.generateKpiInvoice(agent.id, kpi.id, periodStart, periodEnd);
          results.push(r);
        } catch (e) {
          results.push({ error: e.message, agentId: agent.id, kpiId: kpi.id });
        }
      }
    }
    return { generated: results.length, results };
  }
}

