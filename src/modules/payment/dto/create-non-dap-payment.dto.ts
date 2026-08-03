import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PayeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  woreda?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kebele?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rateValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentReason?: string;
}

export class CreateNonDapPaymentDto {
  @ApiProperty({ example: 'January 2026' })
  @IsString()
  @IsNotEmpty()
  schedulePeriod: string;

  @ApiProperty({ example: 'Monthly' })
  @IsString()
  @IsNotEmpty()
  scheduleType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentReason?: string;

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

  @ApiProperty({ type: [PayeeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayeeDto)
  payees: PayeeDto[];
}
