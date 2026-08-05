import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateCommissionRateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  dapId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsNumber()
  enrollmentBonus: number;

  @IsNumber()
  trainingBonus: number;

  @IsNumber()
  activationCommission: number;

  @IsNumber()
  transactionRate: number;

  @IsOptional()
  @IsNumber()
  reactivationBonus?: number;

  @IsOptional()
  @IsNumber()
  dormancyPenaltyRate?: number;

  @IsOptional()
  @IsString()
  effectiveFrom?: string;

  @IsOptional()
  @IsString()
  effectiveTo?: string;
}

