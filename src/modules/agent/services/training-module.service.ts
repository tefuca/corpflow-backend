import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingModule } from '../entities/training-module.entity';
import { AgentTraining } from '../entities/agent-training.entity';

@Injectable()
export class TrainingModuleService {
  constructor(
    @InjectRepository(TrainingModule) private moduleRepo: Repository<TrainingModule>,
    @InjectRepository(AgentTraining) private agentTrainingRepo: Repository<AgentTraining>,
  ) {}

  async createModule(dto: { title: string; description?: string; durationHours?: number; passingScore?: number }) {
    const mod = this.moduleRepo.create(dto);
    return this.moduleRepo.save(mod);
  }

  async findAllModules() {
    return this.moduleRepo.find({ order: { createdAt: 'DESC' } });
  }

  async assignTraining(agentId: string, trainingModuleId: string, assignedBy: string) {
    const at = this.agentTrainingRepo.create({
      agentId, trainingModuleId, assignedBy, assignedAt: new Date(), status: 'assigned',
    });
    return this.agentTrainingRepo.save(at);
  }

  async updateTrainingStatus(id: string, status: string, score?: number) {
    const updates: any = { status };
    if (score !== undefined) updates.score = score;
    if (status === 'completed') updates.completedAt = new Date();
    await this.agentTrainingRepo.update(id, updates);
    return this.agentTrainingRepo.findOne({ where: { id }, relations: ['agent', 'trainingModule'] });
  }

  async getAgentTraining(agentId: string) {
    return this.agentTrainingRepo.find({
      where: { agentId },
      relations: ['trainingModule'],
      order: { assignedAt: 'DESC' },
    });
  }
}

