import { IsString, IsOptional, IsUUID } from 'class-validator';

export class StatusTransitionDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsUUID()
  changedBy: string;
}

