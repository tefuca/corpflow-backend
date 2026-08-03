import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@Query('limit') limit: string) {
    return this.auditLogService.findAll(limit ? +limit : 100);
  }
}