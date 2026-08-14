import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetStatus, BudgetType } from '../entities/budget.entity';

export class CreateBudgetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  budgetCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: BudgetStatus })
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @ApiPropertyOptional({ enum: BudgetType })
  @IsOptional()
  @IsEnum(BudgetType)
  budgetType?: BudgetType;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}