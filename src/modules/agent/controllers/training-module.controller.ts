import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../modules/rbac/guards/permission.guard';
import { RequirePermission } from '../../modules/rbac/decorators/require-permission.decorator';
import { TrainingModuleService } from '../services/training-module.service';
import { CreateTrainingModuleDto } from '../dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from '../dto/update-training-module.dto';

@ApiTags('Training Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/v1/training-modules')
export class TrainingModuleController {
  constructor(private readonly service: TrainingModuleService) {}

  @Post()
  @RequirePermission('training:create')
  @ApiOperation({ summary: 'Create training module' })
  async create(@Body() body: DTO) {
    const mod = await this.service.create(body);
    return { success: true, data: mod };
  }

  @Get()
  @RequirePermission('training:read')
  async findAll() {
    return { success: true, data: await this.service.findAll() };
  }

  @Get(':id')
  @RequirePermission('training:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { success: true, data: await this.service.findOne(id) };
  }

  @Put(':id')
  @RequirePermission('training:update')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: DTO) {
    return { success: true, data: await this.service.update(id, body) };
  }

  @Delete(':id')
  @RequirePermission('training:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true, message: 'Training module deleted' };
  }
}
