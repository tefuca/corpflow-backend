import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StockItemStatus } from '../entities/stock-item.entity';

export class UpdateStockItemDto {
  @ApiPropertyOptional({ description: 'Item name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'SKU identifier' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Item description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Item category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Current quantity in stock' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Reorder level threshold' })
  @IsOptional()
  @IsNumber()
  reorderLevel?: number;

  @ApiPropertyOptional({ description: 'Unit cost price' })
  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @ApiPropertyOptional({ description: 'Storage location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Item status', enum: StockItemStatus })
  @IsOptional()
  @IsEnum(StockItemStatus)
  status?: StockItemStatus;
}