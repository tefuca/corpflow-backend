import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID()
  dapId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  kycStatus?: string;

  @IsOptional()
  @IsString()
  amlStatus?: string;

  @IsOptional()
  @IsNumber()
  trainingCompletionPct?: number;

  @IsOptional()
  @IsNumber()
  transactionVolumeTotal?: number;

  @IsOptional()
  @IsNumber()
  customerCount?: number;
}

