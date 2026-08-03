import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExecutionStatus, ExecutionType } from '../entities/execution.entity';

export class CreateExecutionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  executionCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: ExecutionType })
  @IsOptional()
  @IsEnum(ExecutionType)
  executionType?: ExecutionType;

  @ApiProperty()
  @IsUUID()
  paymentId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsDateString()
  executionDate: string;
}