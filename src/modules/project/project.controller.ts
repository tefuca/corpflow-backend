import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ProjectService } from './project.service';

@ApiTags('Project')
@Controller('projects')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @RequirePermissions(['PROJECT_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get all projects' })
  async findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  @RequirePermissions(['PROJECT_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findOne(id);
  }

  @Post()
  @RequirePermissions(['PROJECT_MANAGEMENT', 'add'])
  @ApiOperation({ summary: 'Create project' })
  async create(@Body() dto: any, @CurrentUser('sub') userId: number) {
    return this.projectService.create(dto, userId);
  }

  @Put(':id')
  @RequirePermissions(['PROJECT_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Update project' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(['PROJECT_MANAGEMENT', 'delete'])
  @ApiOperation({ summary: 'Delete project' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.projectService.remove(id);
    return { message: 'Project deleted' };
  }
}