import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissionRate } from '../entities/commission-rate.entity';
import { CreateCommissionRateDto } from '../dto/create-commission-rate.dto';

@Injectable()
export class CommissionRateService {
  constructor(@InjectRepository(CommissionRate) private repo: Repository<CommissionRate>) {}

  async create(dto: CreateCommissionRateDto) {
    const rate = this.repo.create(dto);
    return this.repo.save(rate);
  }

  async findAll() {
    return this.repo.find({ relations: ['dap', 'client', 'project'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const rate = await this.repo.findOne({ where: { id }, relations: ['dap', 'client', 'project'] });
    if (!rate) throw new NotFoundException('Commission rate not found');
    return rate;
  }

  async update(id: string, dto: Partial<CreateCommissionRateDto>) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.softDelete(id);
    return { deleted: true, id };
  }
}

