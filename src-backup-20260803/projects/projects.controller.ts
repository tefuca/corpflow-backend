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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus, ProjectPriority } from './entities/project.entity';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles('System Admin', 'Operation Lead', 'Management')
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  @ApiQuery({ name: 'priority', required: false, enum: ProjectPriority })
  @ApiQuery({ name: 'cluster', required: false, type: String })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: ProjectStatus,
    @Query('priority') priority?: ProjectPriority,
    @Query('cluster') cluster?: string,
  ) {
    return this.projectsService.findAll(page, limit, search, status, priority, cluster);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get project summary statistics' })
  getSummary() {
    return this.projectsService.getProjectSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Get('code/:projectCode')
  @ApiOperation({ summary: 'Get project by project code' })
  findByCode(@Param('projectCode') projectCode: string) {
    return this.projectsService.findByCode(projectCode);
  }

  @Patch(':id')
  @Roles('System Admin', 'Operation Lead', 'Management')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @Roles('System Admin', 'Management')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a project' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.remove(id, userId);
  }

  @Post(':id/restore')
  @Roles('System Admin')
  @ApiOperation({ summary: 'Restore a soft-deleted project' })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.restore(id, userId);
  }

  @Patch(':id/status')
  @Roles('System Admin', 'Operation Lead', 'Management')
  @ApiOperation({ summary: 'Update project status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ProjectStatus,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.updateStatus(id, status, userId);
  }

  @Patch(':id/completion')
  @Roles('System Admin', 'Operation Lead', 'Project Manager')
  @ApiOperation({ summary: 'Update project completion percentage' })
  updateCompletion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('completionPercentage') completionPercentage: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.updateCompletion(id, completionPercentage, userId);
  }
}