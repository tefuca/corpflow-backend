import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SelectedAgentDto {
  @ApiProperty()
  @IsNumber()
  agentId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class CreateDapPaymentDto {
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  periodFrom: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  periodTo: string;

  @ApiProperty({ example: 'Monthly' })
  @IsString()
  @IsNotEmpty()
  scheduleType: string;

  @ApiProperty()
  @IsNumber()
  dapId: number;

  @ApiProperty()
  @IsNumber()
  activityTypeId: number;

  @ApiProperty({ example: 'Fixed Amount' })
  @IsString()
  @IsNotEmpty()
  rateType: string;

  @ApiProperty()
  @IsNumber()
  rateValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  baseAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ type: [SelectedAgentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedAgentDto)
  selectedAgents: SelectedAgentDto[];
}
