import {
  Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @RequirePermissions(['REPORT_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get all reports' })
  async findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  @RequirePermissions(['REPORT_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get report by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.findOne(id);
  }

  @Post('generate')
  @RequirePermissions(['REPORT_MANAGEMENT', 'add'])
  @ApiOperation({ summary: 'Generate report' })
  async generate(@Body() dto: any, @CurrentUser('sub') userId: number) {
    return this.reportService.generate(dto, userId);
  }

  @Get('export/:type')
  @RequirePermissions(['REPORT_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Export report' })
  @ApiQuery({ name: 'format', required: false, enum: ['pdf', 'excel', 'csv'] })
  async export(
    @Param('type') type: string,
    @Query('format') format: string = 'pdf',
    @Res() res: Response,
  ) {
    return this.reportService.export(type, format, res);
  }
}