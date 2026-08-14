import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixedAsset } from '../entities/fixed-asset.entity';
import { CreateFixedAssetDto } from '../dto/create-fixed-asset.dto';
import { UpdateFixedAssetDto } from '../dto/update-fixed-asset.dto';
import { FixedAssetResponseDto } from '../dto/fixed-asset-response.dto';

@Injectable()
export class FixedAssetService {
  constructor(
    @InjectRepository(FixedAsset)
    private fixedAssetRepo: Repository<FixedAsset>,
  ) {}

  async create(dto: CreateFixedAssetDto, userId: string) {
    const existing = await this.fixedAssetRepo.findOne({
      where: { assetCode: dto.assetCode },
    });
    if (existing) {
      throw new ConflictException(`Asset code ${dto.assetCode} already exists`);
    }

    const entity = this.fixedAssetRepo.create({
      ...dto,
      currentValue: dto.currentValue ?? dto.purchaseCost ?? 0,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.fixedAssetRepo.save(entity);
    const result = Array.isArray(saved) ? saved[0] : saved;
    return FixedAssetResponseDto.fromEntity(result);
  }

  async findAll(query?: any) {   // <-- FIXED: accept optional query
    const assets = await this.fixedAssetRepo.find(query);
    return assets.map(a => FixedAssetResponseDto.fromEntity(a));
  }

  async findOne(id: string) {
    const asset = await this.fixedAssetRepo.findOne({ where: { id } });
    if (!asset) throw new NotFoundException('Fixed asset not found');
    return FixedAssetResponseDto.fromEntity(asset);
  }

  async update(id: string, dto: UpdateFixedAssetDto, userId: string) {
    const entity = await this.fixedAssetRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Fixed asset not found');

    if (dto.assetCode && dto.assetCode !== entity.assetCode) {
      const existing = await this.fixedAssetRepo.findOne({
        where: { assetCode: dto.assetCode },
      });
      if (existing) throw new ConflictException('Asset code already in use');
    }

    Object.assign(entity, dto, { updatedBy: userId });
    const saved = await this.fixedAssetRepo.save(entity);
    const result = Array.isArray(saved) ? saved[0] : saved;
    return FixedAssetResponseDto.fromEntity(result);
  }

  async remove(id: string, userId: string) {
    const asset = await this.fixedAssetRepo.findOne({ where: { id } });
    if (!asset) throw new NotFoundException('Fixed asset not found');
    await this.fixedAssetRepo.softRemove(asset);
  }
}
