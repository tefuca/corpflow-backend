import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Activity, ActivityStatus, ActivityPriority } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AuditLogService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    userId: string,
  ): Promise<Activity> {
    const existing = await this.activityRepository.findOne({
      where: { activityCode: createActivityDto.activityCode },
    });

    if (existing) {
      throw new ConflictException(
        `Activity with code "${createActivityDto.activityCode}" already exists`,
      );
    }

    const activity = this.activityRepository.create({
      ...createActivityDto,
      actualCost: 0,
      completionPercentage: 0,
      createdById: userId,
      updatedById: userId,
    });

    const saved = await this.activityRepository.save(activity);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.CREATE,
      entityType: 'Activity',
      entityId: result.id,
      description: `Created activity: ${result.name} (${result.activityCode})`,
      performedById: userId,
    });

    return result;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: ActivityStatus,
    priority?: ActivityPriority,
    projectId?: string,
    assignedToId?: string,
  ): Promise<{ data: Activity[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.activityRepository.findAndCount({
      where,
      relations: ['project'],
      skip: (page - 1) * limit,
      take: limit,
      order: { plannedStartDate: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID "${id}" not found`);
    }

    return activity;
  }

  async findByCode(activityCode: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { activityCode },
      relations: ['project'],
    });

    if (!activity) {
      throw new NotFoundException(
        `Activity with code "${activityCode}" not found`,
      );
    }

    return activity;
  }

  async findByProject(projectId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { projectId },
      order: { plannedStartDate: 'ASC' },
    });
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    userId: string,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    Object.assign(activity, updateActivityDto, { updatedById: userId });

    const saved = await this.activityRepository.save(activity);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Activity',
      entityId: result.id,
      description: `Updated activity: ${result.name}`,
      performedById: userId,
    });

    return result;
  }

  async remove(id: string, userId: string): Promise<void> {
    const activity = await this.findOne(id);

    await this.activityRepository.softRemove(activity);

    await this.auditLogService.create({
      action: AuditAction.DELETE,
      entityType: 'Activity',
      entityId: activity.id,
      description: `Deleted activity: ${activity.name} (${activity.activityCode})`,
      performedById: userId,
    });
  }

  async restore(id: string, userId: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID "${id}" not found`);
    }

    activity.deletedAt = null;
    activity.updatedById = userId;

    const saved = await this.activityRepository.save(activity);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.RESTORE,
      entityType: 'Activity',
      entityId: result.id,
      description: `Restored activity: ${result.name}`,
      performedById: userId,
    });

    return result;
  }

  async updateStatus(
    id: string,
    status: ActivityStatus,
    userId: string,
  ): Promise<Activity> {
    const activity = await this.findOne(id);

    if (status === ActivityStatus.IN_PROGRESS && !activity.actualStartDate) {
      activity.actualStartDate = new Date();
    }

    if (status === ActivityStatus.COMPLETED) {
      activity.actualEndDate = new Date();
      activity.completionPercentage = 100;
    }

    activity.status = status;
    activity.updatedById = userId;

    const saved = await this.activityRepository.save(activity);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Activity',
      entityId: result.id,
      description: `Updated activity status: ${result.name} -> ${status}`,
      performedById: userId,
    });

    return result;
  }

  async updateProgress(
    id: string,
    completionPercentage: number,
    actualCost: number,
    userId: string,
  ): Promise<Activity> {
    if (completionPercentage < 0 || completionPercentage > 100) {
      throw new BadRequestException('Completion percentage must be between 0 and 100');
    }

    const activity = await this.findOne(id);
    activity.completionPercentage = completionPercentage;
    activity.actualCost = actualCost;
    activity.updatedById = userId;

    if (completionPercentage === 100) {
      activity.status = ActivityStatus.COMPLETED;
      activity.actualEndDate = new Date();
    } else if (completionPercentage > 0 && activity.status === ActivityStatus.NOT_STARTED) {
      activity.status = ActivityStatus.IN_PROGRESS;
      activity.actualStartDate = new Date();
    }

    const saved = await this.activityRepository.save(activity);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Activity',
      entityId: result.id,
      description: `Updated activity progress: ${result.name} (${completionPercentage}%)`,
      performedById: userId,
    });

    return result;
  }
}
