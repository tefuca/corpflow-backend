import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixedAsset, DepreciationMethod } from '../entities/fixed-asset.entity';
import { DepreciationEntry } from '../entities/depreciation-entry.entity';

@Injectable()
export class DepreciationService {
  constructor(
    @InjectRepository(FixedAsset)
    private assetRepo: Repository<FixedAsset>,
    @InjectRepository(DepreciationEntry)
    private depRepo: Repository<DepreciationEntry>,
  ) {}

  async calculateDepreciation(assetId: string, periodStart: Date, periodEnd: Date) {
    const asset = await this.assetRepo.findOne({ where: { id: assetId } });
    if (!asset) throw new Error('Asset not found');

    const months = this.monthsBetween(periodStart, periodEnd);
    let depreciationAmount = 0;

    if (asset.depreciationMethod === DepreciationMethod.STRAIGHT_LINE) {
      const annualDepreciation = (Number(asset.purchaseCost) - Number(asset.salvageValue)) / asset.usefulLifeYears;
      depreciationAmount = (annualDepreciation / 12) * months;
    } else if (asset.depreciationMethod === DepreciationMethod.DECLINING_BALANCE) {
      const rate = Number(asset.depreciationRate) / 100 || (1 / asset.usefulLifeYears);
      const annualDepreciation = Number(asset.currentValue) * rate;
      depreciationAmount = (annualDepreciation / 12) * months;
    }

    const openingValue = Number(asset.currentValue);
    const closingValue = Math.max(openingValue - depreciationAmount, Number(asset.salvageValue));

    const entry = this.depRepo.create({
      assetId: asset.id,
      periodStart,
      periodEnd,
      openingValue,
      depreciationAmount,
      closingValue,
      posted: false,
    });

    const saved = await this.depRepo.save(entry);

    asset.currentValue = closingValue;
    await this.assetRepo.save(asset);

    return saved;
  }

  private monthsBetween(d1: Date, d2: Date): number {
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  }
}