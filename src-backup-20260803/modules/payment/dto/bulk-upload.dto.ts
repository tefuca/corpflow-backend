import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UploadType } from '../entities/bulk-upload.entity';

export class BulkUploadDto {
  @ApiProperty({ enum: UploadType })
  @IsEnum(UploadType)
  uploadType: UploadType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
