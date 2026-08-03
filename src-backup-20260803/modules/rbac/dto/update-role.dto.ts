import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleStatus } from '../entities/role.entity';

export class UpdateRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roleName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roleDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(RoleStatus)
  status?: RoleStatus;
}
