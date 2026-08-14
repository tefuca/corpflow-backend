import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExecutionStatus } from '../entities/execution.entity';

export class UpdateExecutionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ExecutionStatus })
  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  executionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  processorReference?: string;
}