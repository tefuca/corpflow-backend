import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../modules/rbac/guards/permission.guard';
import { RequirePermission } from '../../modules/rbac/decorators/require-permission.decorator';
import { CommissionRateService } from '../services/commission-rate.service';
import { CreateCommissionRateDto } from '../dto/create-commission-rate.dto';

@ApiTags('Commission Rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/v1/commission-rates')
export class CommissionRateController {
  constructor(private readonly service: CommissionRateService) {}

  @Post()
  @RequirePermission('commission-rate:create')
  @ApiOperation({ summary: 'Create commission rate rule' })
  async create(@Body() dto: CreateCommissionRateDto) {
    const rate = await this.service.create(dto);
    return { success: true, data: rate };
  }

  @Get()
  @RequirePermission('commission-rate:read')
  @ApiOperation({ summary: 'List all commission rates' })
  async findAll() {
    return { success: true, data: await this.service.findAll() };
  }

  @Get(':id')
  @RequirePermission('commission-rate:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { success: true, data: await this.service.findOne(id) };
  }

  @Put(':id')
  @RequirePermission('commission-rate:update')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCommissionRateDto>) {
    return { success: true, data: await this.service.update(id, dto) };
  }

  @Delete(':id')
  @RequirePermission('commission-rate:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true, message: 'Commission rate deleted' };
  }
}
