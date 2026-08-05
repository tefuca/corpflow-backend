
import { IsString, IsOptional, IsNumber, IsUUID, IsEnum } from 'class-validator';

export class CreateKpiDefinitionDto {
  @IsString()
  kpiCode: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  kpiType: string;

  @IsOptional()
  @IsString()
  measurementPeriod?: string;

  @IsOptional()
  @IsString()
  billingTrigger?: string;

  @IsOptional()
  @IsNumber()
  fixedAmount?: number;

  @IsOptional()
  @IsNumber()
  percentageRate?: number;

  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
}
