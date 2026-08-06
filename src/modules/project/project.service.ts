import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Project, ProjectStatus, ProjectPriority } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuditLogService } from '../audit-log/audit-logs.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    const existing = await this.projectRepository.findOne({
      where: { projectCode: createProjectDto.projectCode },
    });

    if (existing) {
      throw new ConflictException(
        `Project with code "${createProjectDto.projectCode}" already exists`,
      );
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      totalSpent: 0,
      completionPercentage: 0,
      createdById: userId,
      updatedById: userId,
    });

    const saved = await this.projectRepository.save(project);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.CREATE,
      entityType: 'Project',
      entityId: result.id,
      description: `Created project: ${result.name} (${result.projectCode})`,
      performedById: userId,
    });

    return result;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: ProjectStatus,
    priority?: ProjectPriority,
    cluster?: string,
  ): Promise<{ data: Project[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (cluster) where.cluster = cluster;
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.projectRepository.findAndCount({
      where,
      relations: ['activities', 'payments'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['activities', 'payments'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return project;
  }

  async findByCode(projectCode: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { projectCode },
      relations: ['activities', 'payments'],
    });

    if (!project) {
      throw new NotFoundException(
        `Project with code "${projectCode}" not found`,
      );
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id);

    if (project.status === ProjectStatus.CLOSED) {
      throw new BadRequestException('Cannot update a closed project');
    }

    Object.assign(project, updateProjectDto, { updatedById: userId });

    const saved = await this.projectRepository.save(project);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Project',
      entityId: result.id,
      description: `Updated project: ${result.name}`,
      performedById: userId,
    });

    return result;
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id);

    await this.projectRepository.softRemove(project);

    await this.auditLogService.create({
      action: AuditAction.DELETE,
      entityType: 'Project',
      entityId: project.id,
      description: `Deleted project: ${project.name} (${project.projectCode})`,
      performedById: userId,
    });
  }

  async restore(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    project.deletedAt = null;
    project.updatedById = userId;

    const saved = await this.projectRepository.save(project);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.RESTORE,
      entityType: 'Project',
      entityId: result.id,
      description: `Restored project: ${result.name}`,
      performedById: userId,
    });

    return result;
  }

  async updateStatus(
    id: string,
    status: ProjectStatus,
    userId: string,
  ): Promise<Project> {
    return this.update(id, { status } as UpdateProjectDto, userId);
  }

  async updateCompletion(
    id: string,
    completionPercentage: number,
    userId: string,
  ): Promise<Project> {
    if (completionPercentage < 0 || completionPercentage > 100) {
      throw new BadRequestException('Completion percentage must be between 0 and 100');
    }

    const project = await this.findOne(id);
    project.completionPercentage = completionPercentage;

    if (completionPercentage === 100) {
      project.status = ProjectStatus.COMPLETED;
      project.actualEndDate = new Date();
    }

    project.updatedById = userId;

    const saved = await this.projectRepository.save(project);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Project',
      entityId: result.id,
      description: `Updated project completion: ${result.name} (${completionPercentage}%)`,
      performedById: userId,
    });

    return result;
  }

  async getProjectSummary(): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    totalSpent: number;
  }> {
    const totalProjects = await this.projectRepository.count({
      where: { deletedAt: null },
    });

    const activeProjects = await this.projectRepository.count({
      where: { status: ProjectStatus.ACTIVE, deletedAt: null },
    });

    const completedProjects = await this.projectRepository.count({
      where: { status: ProjectStatus.COMPLETED, deletedAt: null },
    });

    const result = await this.projectRepository
      .createQueryBuilder('project')
      .select('COALESCE(SUM(project.totalBudget), 0)', 'totalBudget')
      .addSelect('COALESCE(SUM(project.totalSpent), 0)', 'totalSpent')
      .where('project.deletedAt IS NULL')
      .getRawOne();

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget: parseFloat(result.totalBudget),
      totalSpent: parseFloat(result.totalSpent),
    };
  }
}
