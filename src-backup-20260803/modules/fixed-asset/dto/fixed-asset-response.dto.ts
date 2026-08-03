import { FixedAsset, AssetStatus, DepreciationMethod } from '../entities/fixed-asset.entity';

export class FixedAssetResponseDto {
  id: string;
  assetCode: string;
  assetName: string;
  category: string;
  subCategory?: string;
  purchaseDate?: Date;
  purchaseCost: number;
  currentValue: number;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  salvageValue: number;
  location?: string;
  department?: string;
  assignedTo?: string;
  status: AssetStatus;
  vendor?: string;
  warrantyExpiry?: Date;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: FixedAsset): FixedAssetResponseDto {
    const dto = new FixedAssetResponseDto();
    Object.assign(dto, entity);
    return dto;
  }
}

export class PaginatedFixedAssetResponseDto {
  data: FixedAssetResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  static create(
    entities: FixedAsset[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedFixedAssetResponseDto {
    const dto = new PaginatedFixedAssetResponseDto();
    dto.data = entities.map(FixedAssetResponseDto.fromEntity);
    dto.total = total;
    dto.page = page;
    dto.limit = limit;
    dto.totalPages = Math.ceil(total / limit);
    return dto;
  }
}