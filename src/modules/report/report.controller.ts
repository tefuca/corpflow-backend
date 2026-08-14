import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportService } from './report.service';

@ApiTags('Report')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('payments')
  @ApiOperation({ summary: 'Payment reports with filters' })
  @ApiQuery({ name: 'from', required: false, type: String, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, type: String, example: '2026-12-31' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'executed' })
  getPaymentReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
  ) {
    return this.reportService.getPaymentReport({ from, to, status });
  }

  @Get('agents')
  @ApiOperation({ summary: 'Agent performance report' })
  @ApiQuery({ name: 'dapId', required: false, type: String })
  getAgentReport(@Query('dapId') dapId?: string) {
    return this.reportService.getAgentReport(dapId);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Project financial report' })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  getProjectReport(@Query('projectId') projectId?: string) {
    return this.reportService.getProjectReport(projectId);
  }

  @Get('financial')
  @ApiOperation({ summary: 'General ledger / financial summary report' })
  @ApiQuery({ name: 'period', required: false, type: String, example: '2026-Q3' })
  getFinancialReport(@Query('period') period?: string) {
    return this.reportService.getFinancialReport(period);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Audit trail report' })
  @ApiQuery({ name: 'user', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  getAuditReport(
    @Query('user') user?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportService.getAuditReport({ user, action, from, to });
  }

  @Get('export/:type')
  @ApiOperation({ summary: 'Export report as CSV/JSON' })
  async exportReport(
    @Param('type') type: 'csv' | 'json',
    @Query('report') reportType: string,
    @Res() res: Response,
  ) {
    const data = await this.reportService.exportReport(reportType);
    
    if (type === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}.csv"`);
      return res.send(this.reportService.toCsv(data));
    }
    
    return res.json(data);
  }
}