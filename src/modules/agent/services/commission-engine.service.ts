import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { Dap } from '../entities/dap.entity';
import { CommissionRecord } from '../entities/commission-record.entity';
import { AgentStatusHistory } from '../entities/agent-status-history.entity';
import { CommissionRate } from '../entities/commission-rate.entity';

@Injectable()
export class CommissionEngineService {
  constructor(
    @InjectRepository(Agent) private agentRepo: Repository<Agent>,
    @InjectRepository(Dap) private dapRepo: Repository<Dap>,
    @InjectRepository(CommissionRecord) private commissionRepo: Repository<CommissionRecord>,
    @InjectRepository(AgentStatusHistory) private historyRepo: Repository<AgentStatusHistory>,
    @InjectRepository(CommissionRate) private rateRepo: Repository<CommissionRate>,
    private dataSource: DataSource,
  ) {}

  async transitionStatus(agentId: string, newStatus: string, changedBy: string, reason?: string) {
    const agent = await this.agentRepo.findOne({ where: { id: agentId }, relations: ['dap'] });
    if (!agent) throw new BadRequestException('Agent not found');

    const oldStatus = agent.status;
    if (oldStatus === newStatus) return agent;

    this.validateTransition(oldStatus, newStatus);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Record history
      const history = queryRunner.manager.create(AgentStatusHistory, {
        agentId,
        previousStatus: oldStatus,
        newStatus,
        changedBy,
        changedAt: new Date(),
        reason,
      });
      await queryRunner.manager.save(history);

      // Update agent status and timestamps
      const updates: any = { status: newStatus };
      if (newStatus === 'A-200') updates.enrolledAt = new Date();
      if (newStatus === 'A-300') updates.trainingCompletedAt = new Date();
      if (newStatus === 'A-400') updates.activatedAt = new Date();
      if (newStatus === 'A-500') updates.lastTransactionAt = new Date();
      if (newStatus === 'A-600') updates.dormantSince = new Date();
      if (newStatus === 'A-700') { updates.terminatedAt = new Date(); updates.terminationReason = reason; }

      await queryRunner.manager.update(Agent, agentId, updates);
      await queryRunner.commitTransaction();

      // Post-transaction: calculate commission
      await this.calculateCommission(agentId, newStatus);

      return this.agentRepo.findOne({ where: { id: agentId }, relations: ['dap'] });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async calculateCommission(agentId: string, triggerStatus: string) {
    const agent = await this.agentRepo.findOne({ where: { id: agentId }, relations: ['dap'] });
    if (!agent || !agent.dap) return;

    // Get active commission rate
    const rate = await this.rateRepo.findOne({
      where: [
        { dapId: agent.dapId, effectiveFrom: undefined as any },
      ],
      order: { createdAt: 'DESC' },
    });

    let amount = 0;
    let commissionType = '';

    switch (triggerStatus) {
      case 'A-200':
        commissionType = 'enrollment_bonus';
        amount = rate?.enrollmentBonus || agent.dap.commissionRateEnrollment || 0;
        break;
      case 'A-300':
        commissionType = 'training_bonus';
        amount = rate?.trainingBonus || agent.dap.commissionRateTraining || 0;
        break;
      case 'A-400':
        commissionType = 'activation_commission';
        amount = rate?.activationCommission || agent.dap.commissionRateActivation || 0;
        break;
      case 'A-500':
        commissionType = 'transaction_commission';
        amount = (rate?.transactionRate || agent.dap.commissionRateTransaction || 0) * (agent.transactionVolumeTotal || 0) / 100;
        break;
      case 'A-600':
        // Hold commissions
        await this.holdCommissions(agentId);
        return;
      default:
        return;
    }

    if (amount <= 0) return;

    const commissionNumber = `COMM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const commission = this.commissionRepo.create({
      commissionNumber,
      dapId: agent.dapId,
      agentId,
      commissionType,
      amount,
      status: 'pending',
      periodStart: new Date(),
      periodEnd: new Date(),
      calculationBasis: `Status ${triggerStatus} trigger`,
      projectId: agent.projectId,
    });
    await this.commissionRepo.save(commission);

    // Update DAP totals
    agent.dap.totalCommissionEarned = Number(agent.dap.totalCommissionEarned || 0) + amount;
    agent.dap.activeAgentCount = await this.agentRepo.count({ where: { dapId: agent.dapId, status: 'A-500' } });
    await this.dapRepo.save(agent.dap);
  }

  async reconcileMonthly(dapId: string, periodStart: Date, periodEnd: Date) {
    const commissions = await this.commissionRepo.find({
      where: { dapId, periodStart, periodEnd, status: 'pending' },
      relations: ['agent', 'dap'],
    });

    const summary = {
      dapId,
      periodStart,
      periodEnd,
      totalRecords: commissions.length,
      totalAmount: commissions.reduce((sum, c) => sum + Number(c.amount), 0),
      byType: {} as Record<string, number>,
      adjustments: 0,
    };

    for (const c of commissions) {
      summary.byType[c.commissionType] = (summary.byType[c.commissionType] || 0) + Number(c.amount);
    }

    // Apply dormancy holds
    const dormantAgents = await this.agentRepo.find({ where: { dapId, status: 'A-600' } });
    for (const agent of dormantAgents) {
      const pendingTxn = commissions.filter(
        c => c.agentId === agent.id && c.commissionType === 'transaction_commission'
      );
      for (const c of pendingTxn) {
        c.status = 'held';
        c.holdReason = 'Agent dormant';
        await this.commissionRepo.save(c);
        summary.adjustments += Number(c.amount);
      }
    }

    return summary;
  }

  async approveCommissions(commissionIds: string[], approvedBy: string) {
    for (const id of commissionIds) {
      await this.commissionRepo.update(id, { status: 'approved', approvedBy, approvedAt: new Date() });
    }
    return { approved: commissionIds.length };
  }

  async payCommissions(commissionIds: string[], paymentReference: string) {
    for (const id of commissionIds) {
      await this.commissionRepo.update(id, { status: 'paid', paidAt: new Date(), paymentReference });
    }
    return { paid: commissionIds.length };
  }

  private async holdCommissions(agentId: string) {
    await this.commissionRepo.update(
      { agentId, status: 'pending', commissionType: 'transaction_commission' },
      { status: 'held', holdReason: 'Agent status changed to DORMANT' }
    );
  }

  private validateTransition(oldStatus: string, newStatus: string) {
    const allowed: Record<string, string[]> = {
      'A-100': ['A-200'],
      'A-200': ['A-300', 'A-700'],
      'A-300': ['A-400', 'A-700'],
      'A-400': ['A-500', 'A-600', 'A-700'],
      'A-500': ['A-600', 'A-700'],
      'A-600': ['A-500', 'A-700'],
      'A-700': [],
    };
    const list = allowed[oldStatus] || [];
    if (!list.includes(newStatus)) {
      throw new BadRequestException(`Invalid transition from ${oldStatus} to ${newStatus}`);
    }
  }
}

