import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiDefinition } from '../entities/kpi-definition.entity';
import { CreateKpiDefinitionDto } from '../dto/create-kpi-definition.dto';

@Injectable()
export class KpiDefinitionService {
  constructor(@InjectRepository(KpiDefinition) private repo: Repository<KpiDefinition>) {}

  async create(dto: CreateKpiDefinitionDto) {
    const kpi = this.repo.create({ ...dto, active: true });
    return this.repo.save(kpi);
  }

  async findAll() {
    return this.repo.find({ relations: ['client', 'project'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const kpi = await this.repo.findOne({ where: { id }, relations: ['client', 'project'] });
    if (!kpi) throw new NotFoundException('KPI definition not found');
    return kpi;
  }

  async update(id: string, dto: Partial<CreateKpiDefinitionDto>) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.softDelete(id);
    return { deleted: true, id };
  }
}

