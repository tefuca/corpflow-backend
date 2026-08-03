import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment-confirmation.entity';

export class PaymentExecutionDto {
  @ApiProperty()
  @IsNumber()
  scheduleId: number;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'TXN-2026-001234' })
  @IsString()
  @IsNotEmpty()
  transactionReference: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
