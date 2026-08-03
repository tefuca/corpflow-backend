// src/modules/stock/dto/stock-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class StockResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'Item name' })
  name: string;

  @ApiProperty({ description: 'Item code/SKU' })
  code: string;

  @ApiProperty({ description: 'Available quantity', example: 100 })
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 2500.00 })
  unitPrice: number;

  @ApiProperty({ description: 'Item description', required: false })
  description?: string;

  @ApiProperty({ description: 'Item status', example: 'active' })
  status: string;

  @ApiProperty({ description: 'Created timestamp', type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp', type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ description: 'ID of user who created the record' })
  createdBy: number;
}