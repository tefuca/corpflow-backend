import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsNumber } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsUUID()
  dapId: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsString()
  kycStatus?: string;

  @IsOptional()
  @IsString()
  amlStatus?: string;
}

