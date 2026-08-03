import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetStatus, BudgetType } from './entities/budget.entity';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @Roles('System Admin', 'Finance Manager')
  @ApiOperation({ summary: 'Create a new budget' })
  create(
    @Body() createBudgetDto: CreateBudgetDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.budgetsService.create(createBudgetDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all budgets with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: BudgetStatus })
  @ApiQuery({ name: 'budgetType', required: false, enum: BudgetType })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: BudgetStatus,
    @Query('budgetType') budgetType?: BudgetType,
    @Query('projectId') projectId?: string,
  ) {
    return this.budgetsService.findAll(page, limit, search, status, budgetType, projectId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get budget summary statistics' })
  getSummary() {
    return this.budgetsService.getBudgetSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.budgetsService.findOne(id);
  }

  @Get('code/:budgetCode')
  @ApiOperation({ summary: 'Get budget by budget code' })
  findByCode(@Param('budgetCode') budgetCode: string) {
    return this.budgetsService.findByCode(budgetCode);
  }

  @Patch(':id')
  @Roles('System Admin', 'Finance Manager')
  @ApiOperation({ summary: 'Update a budget' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.budgetsService.update(id, updateBudgetDto, userId);
  }

  @Delete(':id')
  @Roles('System Admin', 'Finance Manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a budget' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.budgetsService.remove(id, userId);
  }

  @Post(':id/restore')
  @Roles('System Admin')
  @ApiOperation({ summary: 'Restore a soft-deleted budget' })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.budgetsService.restore(id, userId);
  }

  @Post(':id/approve')
  @Roles('System Admin', 'Finance Manager', 'Management')
  @ApiOperation({ summary: 'Approve a pending budget' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approvalNotes') approvalNotes: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.budgetsService.approve(id, approvalNotes, userId);
  }

  @Post(':id/reject')
  @Roles('System Admin', 'Finance Manager', 'Management')
  @ApiOperation({ summary: 'Reject a pending budget' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('rejectionReason') rejectionReason: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.budgetsService.reject(id, rejectionReason, userId);
  }
}