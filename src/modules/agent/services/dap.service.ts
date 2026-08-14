import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dap } from '../entities/dap.entity';
import { CreateDapDto, UpdateDapDto } from '../dto/dap.dto';

@Injectable()
export class DapService {
  constructor(@InjectRepository(Dap) private dapRepo: Repository<Dap>) {}

  async create(dto: CreateDapDto) {
    const dapCode = `DAP-${Date.now().toString().slice(-6)}`;
    const dap = this.dapRepo.create({ ...dto, dapCode });
    return this.dapRepo.save(dap);
  }

  async findAll() {
    return this.dapRepo.find({ relations: ['agents'], order: { createdAt: 'DESC' } as any });
  }

  async findOne(id: string) {
    const dap = await this.dapRepo.findOne({ where: { id }, relations: ['agents', 'commissions'] });
    if (!dap) throw new NotFoundException('DAP not found');
    return dap;
  }

  async update(id: string, dto: UpdateDapDto) {
    await this.dapRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.dapRepo.softDelete(id);
    return { deleted: true, id };
  }
}

