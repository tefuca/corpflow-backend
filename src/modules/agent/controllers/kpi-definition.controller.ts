import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../modules/rbac/guards/permission.guard';
import { RequirePermission } from '../../modules/rbac/decorators/require-permission.decorator';
import { KpiDefinitionService } from '../services/kpi-definition.service';
import { CreateKpiDefinitionDto } from '../dto/create-kpi-definition.dto';

@ApiTags('KPI Definitions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/v1/kpi-definitions')
export class KpiDefinitionController {
  constructor(private readonly service: KpiDefinitionService) {}

  @Post()
  @RequirePermission('kpi:create')
  @ApiOperation({ summary: 'Create KPI definition for client billing' })
  async create(@Body() dto: CreateKpiDefinitionDto) {
    const kpi = await this.service.create(dto);
    return { success: true, data: kpi };
  }

  @Get()
  @RequirePermission('kpi:read')
  @ApiQuery({ name: 'clientId', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: Number })
  async findAll(@Query('clientId') clientId?: number, @Query('projectId') projectId?: number) {
    return { success: true, data: await this.service.findAll(clientId, projectId) };
  }

  @Get(':id')
  @RequirePermission('kpi:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { success: true, data: await this.service.findOne(id) };
  }

  @Put(':id')
  @RequirePermission('kpi:update')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateKpiDefinitionDto>) {
    return { success: true, data: await this.service.update(id, dto) };
  }

  @Delete(':id')
  @RequirePermission('kpi:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true, message: 'KPI definition deleted' };
  }
}
