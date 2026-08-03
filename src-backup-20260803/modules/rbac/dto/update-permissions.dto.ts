import { IsArray, IsInt, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PermissionItemDto {
  @ApiProperty()
  @IsInt()
  functionId: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  noAccess: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  canView: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  canAdd: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  canEdit: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  canDelete: boolean;
}

export class UpdatePermissionsDto {
  @ApiProperty({ type: [PermissionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  permissions: PermissionItemDto[];
}
