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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityStatus, ActivityPriority } from './entities/activity.entity';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @Roles('System Admin', 'Operation Lead', 'Project Manager')
  @ApiOperation({ summary: 'Create a new activity' })
  create(
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.activitiesService.create(createActivityDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all activities with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ActivityStatus })
  @ApiQuery({ name: 'priority', required: false, enum: ActivityPriority })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'assignedToId', required: false, type: String })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: ActivityStatus,
    @Query('priority') priority?: ActivityPriority,
    @Query('projectId') projectId?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.activitiesService.findAll(page, limit, search, status, priority, projectId, assignedToId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get activities by project ID' })
  findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.activitiesService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.findOne(id);
  }

  @Get('code/:activityCode')
  @ApiOperation({ summary: 'Get activity by activity code' })
  findByCode(@Param('activityCode') activityCode: string) {
    return this.activitiesService.findByCode(activityCode);
  }

  @Patch(':id')
  @Roles('System Admin', 'Operation Lead', 'Project Manager')
  @ApiOperation({ summary: 'Update an activity' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.activitiesService.update(id, updateActivityDto, userId);
  }

  @Delete(':id')
  @Roles('System Admin', 'Operation Lead')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an activity' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.activitiesService.remove(id, userId);
  }

  @Post(':id/restore')
  @Roles('System Admin')
  @ApiOperation({ summary: 'Restore a soft-deleted activity' })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.activitiesService.restore(id, userId);
  }

  @Patch(':id/status')
  @Roles('System Admin', 'Operation Lead', 'Project Manager')
  @ApiOperation({ summary: 'Update activity status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ActivityStatus,
    @CurrentUser('sub') userId: string,
  ) {
    return this.activitiesService.updateStatus(id, status, userId);
  }

  @Patch(':id/progress')
  @Roles('System Admin', 'Operation Lead', 'Project Manager')
  @ApiOperation({ summary: 'Update activity progress' })
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('completionPercentage') completionPercentage: number,
    @Body('actualCost') actualCost: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.activitiesService.updateProgress(id, completionPercentage, actualCost, userId);
  }
}