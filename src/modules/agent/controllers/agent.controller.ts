import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgentService } from '../services/agent.service';
import { CommissionEngineService } from '../services/commission-engine.service';
import { CreateAgentDto } from '../dto/create-agent.dto';
import { UpdateAgentDto } from '../dto/update-agent.dto';
import { StatusTransitionDto } from '../dto/status-transition.dto';

@Controller('agents')
@UseGuards(AuthGuard('jwt'))
export class AgentController {
  constructor(
    private agentService: AgentService,
    private commissionEngine: CommissionEngineService,
  ) {}

  @Post()
  create(@Body() dto: CreateAgentDto) {
    return this.agentService.create(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('dapId') dapId?: string,
    @Query('projectId') projectId?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.agentService.findAll({ status, dapId, projectId, clientId });
  }

  @Get('dashboard')
  dashboard() {
    return this.agentService.getDashboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.agentService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentService.remove(id);
  }

  @Post(':id/transition')
  transitionStatus(@Param('id') id: string, @Body() dto: StatusTransitionDto) {
    return this.commissionEngine.transitionStatus(id, dto.status, dto.changedBy, dto.reason);
  }

  @Post(':id/documents')
  uploadDocument(@Param('id') id: string, @Body() dto: { documentType: string; title: string; fileUrl: string; uploadedBy: string }) {
    return this.agentService.uploadDocument(id, dto);
  }

  @Post(':id/kpi')
  recordKpi(@Param('id') id: string, @Body() dto: { kpiDefinitionId: string; actualValue: number; measuredDate: string; periodStart: string; periodEnd: string }) {
    return this.agentService.recordKpi(id, dto);
  }
}

