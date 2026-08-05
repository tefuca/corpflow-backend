import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { AgentStatusHistory } from '../entities/agent-status-history.entity';
import { AgentDocument } from '../entities/agent-document.entity';
import { CommissionRecord } from '../entities/commission-record.entity';
import { KpiAchievement } from '../entities/kpi-achievement.entity';
import { CreateAgentDto } from '../dto/create-agent.dto';
import { UpdateAgentDto } from '../dto/update-agent.dto';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
    @InjectRepository(AgentStatusHistory)
    private historyRepo: Repository<AgentStatusHistory>,
    @InjectRepository(AgentDocument)
    private docRepo: Repository<AgentDocument>,
    @InjectRepository(CommissionRecord)
    private commissionRepo: Repository<CommissionRecord>,
    @InjectRepository(KpiAchievement)
    private kpiRepo: Repository<KpiAchievement>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateAgentDto) {
    const agentCode = await this.generateAgentCode();
    const agent = this.agentRepo.create({
      ...dto,
      agentCode,
      status: 'A-100',
    });
    return this.agentRepo.save(agent);
  }

  async findAll(filters?: { status?: string; dapId?: string; projectId?: string; clientId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.dapId) where.dapId = filters.dapId;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.clientId) where.clientId = filters.clientId;
    return this.agentRepo.find({
      where,
      relations: ['dap', 'project', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const agent = await this.agentRepo.findOne({
      where: { id },
      relations: ['dap', 'project', 'client', 'statusHistory', 'documents'],
    });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async update(id: string, dto: UpdateAgentDto) {
    await this.agentRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const agent = await this.findOne(id);
    await this.agentRepo.softDelete(id);
    return { deleted: true, id };
  }

  async getDashboard() {
    const total = await this.agentRepo.count();
    const active = await this.agentRepo.count({ where: { status: 'A-500' } });
    const dormant = await this.agentRepo.count({ where: { status: 'A-600' } });
    const terminated = await this.agentRepo.count({ where: { status: 'A-700' } });
    const statusCounts = await this.agentRepo
      .createQueryBuilder('agent')
      .select('agent.status', 'status')
      .addSelect('COUNT(agent.id)', 'count')
      .groupBy('agent.status')
      .getRawMany();
    return { total, active, dormant, terminated, statusCounts };
  }

  async uploadDocument(agentId: string, dto: { documentType: string; title: string; fileUrl: string; uploadedBy: string }) {
    const doc = this.docRepo.create({ ...dto, agentId });
    return this.docRepo.save(doc);
  }

  async verifyDocument(docId: string, verifiedBy: string) {
    await this.docRepo.update(docId, { verified: true, verifiedBy, verifiedAt: new Date() });
    return this.docRepo.findOne({ where: { id: docId } });
  }

  async recordKpi(agentId: string, dto: { kpiDefinitionId: string; actualValue: number; measuredDate: string; periodStart: string; periodEnd: string }) {
    const achievement = this.kpiRepo.create({
      agentId,
      ...dto,
      measuredDate: new Date(dto.measuredDate),
      measurementPeriodStart: new Date(dto.periodStart),
      measurementPeriodEnd: new Date(dto.periodEnd),
      status: 'pending',
    });
    return this.kpiRepo.save(achievement);
  }

  private async generateAgentCode(): Promise<string> {
    const date = new Date();
    const prefix = 'AGT';
    const ts = date.getFullYear().toString().slice(-2) +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${ts}-${random}`;
  }
}

