import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockItemStatus } from '../entities/stock-item.entity';

export class CreateStockItemDto {
  @ApiProperty({ description: 'Unique item code' })
  @IsString()
  @IsNotEmpty()
  itemCode: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiPropertyOptional({ description: 'Item status', enum: StockItemStatus, default: StockItemStatus.ACTIVE })
  @IsOptional()
  @IsEnum(StockItemStatus)
  status?: StockItemStatus;
}