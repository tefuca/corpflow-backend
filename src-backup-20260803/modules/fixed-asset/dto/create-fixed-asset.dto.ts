import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  MaxLength,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { AssetStatus, DepreciationMethod } from '../entities/fixed-asset.entity';

export class CreateFixedAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  assetCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  assetName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subCategory?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  purchaseCost?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  currentValue?: number;

  @IsEnum(DepreciationMethod)
  @IsOptional()
  depreciationMethod?: DepreciationMethod;

  @IsNumber()
  @Min(1)
  @IsOptional()
  usefulLifeYears?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  salvageValue?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  assignedTo?: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  vendor?: string;

  @IsDateString()
  @IsOptional()
  warrantyExpiry?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}