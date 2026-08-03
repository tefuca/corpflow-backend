import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermissions(['DASHBOARD', 'view'])
  @ApiOperation({ summary: 'Get dashboard summary' })
  async getSummary(@CurrentUser('sub') userId: number) {
    return this.dashboardService.getSummary(userId);
  }

  @Get('metrics')
  @RequirePermissions(['DASHBOARD', 'view'])
  @ApiOperation({ summary: 'Get dashboard metrics' })
  async getMetrics() {
    return this.dashboardService.getMetrics();
  }
}