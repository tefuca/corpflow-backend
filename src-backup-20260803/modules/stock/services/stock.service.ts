import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from '../entities/stock-item.entity';
import { CreateStockItemDto } from '../dto/create-stock-item.dto';
import { UpdateStockItemDto } from '../dto/update-stock-item.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
  ) {}

  async findAll(): Promise<StockItem[]> {
    return this.stockItemRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<StockItem> {
    const item = await this.stockItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Stock item with ID ${id} not found`);
    }
    return item;
  }

  async create(dto: CreateStockItemDto, userId: number): Promise<StockItem> {
    const item = this.stockItemRepository.create({
      ...dto,
      createdById: userId,
      updatedById: userId,
    });
    return this.stockItemRepository.save(item);
  }

  async update(id: number, dto: UpdateStockItemDto, userId: number): Promise<StockItem> {
    const item = await this.findOne(id);
    const updated = this.stockItemRepository.merge(item, {
      ...dto,
      updatedById: userId,
    });
    return this.stockItemRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.stockItemRepository.softDelete(item.id);
  }
}