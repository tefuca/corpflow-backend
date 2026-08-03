import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  startDate?: Date;

  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  endDate?: Date;

  @ApiProperty({ required: false })
  budget?: number;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 'medium', required: false })
  priority?: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty()
  createdBy: number;
}