import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Finance Manager' })
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiPropertyOptional({ example: 'Manages financial operations' })
  @IsOptional()
  @IsString()
  roleDescription?: string;
}
