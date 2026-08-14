import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityStatus, ActivityPriority } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  activityCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({ enum: ActivityPriority })
  @IsOptional()
  @IsEnum(ActivityPriority)
  priority?: ActivityPriority;

  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty()
  @IsDateString()
  plannedStartDate: string;

  @ApiProperty()
  @IsDateString()
  plannedEndDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  milestoneIds?: string[];
}