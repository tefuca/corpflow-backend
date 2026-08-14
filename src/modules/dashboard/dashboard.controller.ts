import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get overall dashboard statistics' })
  getOverallStats() {
    return this.dashboardService.getOverallStats();
  }

  @Get('financial')
  @ApiOperation({ summary: 'Get financial summary' })
  getFinancialSummary() {
    return this.dashboardService.getFinancialSummary();
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payment status summary' })
  getPaymentSummary() {
    return this.dashboardService.getPaymentSummary();
  }

  @Get('agents')
  @ApiOperation({ summary: 'Get agent performance summary' })
  getAgentSummary() {
    return this.dashboardService.getAgentSummary();
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get recent activities / audit trail' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  getRecentActivities(@Query('limit') limit: number = 10) {
    return this.dashboardService.getRecentActivities(+limit);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get project status summary' })
  getProjectSummary() {
    return this.dashboardService.getProjectSummary();
  }
}