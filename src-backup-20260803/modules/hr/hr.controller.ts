import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { HrService } from './hr.service';

@ApiTags('HR')
@Controller('hr')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get()
  @RequirePermissions(['HR_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get all HR records' })
  async findAll() {
    return this.hrService.findAll();
  }

  @Get(':id')
  @RequirePermissions(['HR_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get HR record by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hrService.findOne(id);
  }

  @Post()
  @RequirePermissions(['HR_MANAGEMENT', 'add'])
  @ApiOperation({ summary: 'Create HR record' })
  async create(@Body() dto: any, @CurrentUser('sub') userId: number) {
    return this.hrService.create(dto, userId);
  }

  @Put(':id')
  @RequirePermissions(['HR_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Update HR record' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.hrService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(['HR_MANAGEMENT', 'delete'])
  @ApiOperation({ summary: 'Delete HR record' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.hrService.remove(id);
    return { message: 'HR record deleted' };
  }
}