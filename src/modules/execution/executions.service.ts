import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Execution, ExecutionStatus, ExecutionType } from './entities/execution.entity';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { UpdateExecutionDto } from './dto/update-execution.dto';
import { AuditLogService } from '../audit-log/audit-logs.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class ExecutionsService {
  constructor(
    @InjectRepository(Execution)
    private readonly executionRepository: Repository<Execution>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createExecutionDto: CreateExecutionDto,
    userId: string,
  ): Promise<Execution> {
    const existing = await this.executionRepository.findOne({
      where: { executionCode: createExecutionDto.executionCode },
    });

    if (existing) {
      throw new ConflictException(
        `Execution with code "${createExecutionDto.executionCode}" already exists`,
      );
    }

    const execution = this.executionRepository.create({
      ...createExecutionDto,
      createdById: userId,
      updatedById: userId,
    });

    const saved = await this.executionRepository.save(execution);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.CREATE,
      entityType: 'Execution',
      entityId: result.id,
      description: `Created execution: ${result.executionCode}`,
      performedById: userId,
    });

    return result;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: ExecutionStatus,
    executionType?: ExecutionType,
    paymentId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: Execution[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (status) where.status = status;
    if (executionType) where.executionType = executionType;
    if (paymentId) where.paymentId = paymentId;
    if (search) {
      where.description = Like(`%${search}%`);
    }
    if (startDate && endDate) {
      where.executionDate = Between(startDate, endDate);
    }

    const [data, total] = await this.executionRepository.findAndCount({
      where,
      relations: ['payment'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Execution> {
    const execution = await this.executionRepository.findOne({
      where: { id },
      relations: ['payment'],
    });

    if (!execution) {
      throw new NotFoundException(`Execution with ID "${id}" not found`);
    }

    return execution;
  }

  async findByCode(executionCode: string): Promise<Execution> {
    const execution = await this.executionRepository.findOne({
      where: { executionCode },
      relations: ['payment'],
    });

    if (!execution) {
      throw new NotFoundException(
        `Execution with code "${executionCode}" not found`,
      );
    }

    return execution;
  }

  async findByPayment(paymentId: string): Promise<Execution[]> {
    return this.executionRepository.find({
      where: { paymentId },
      relations: ['payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateExecutionDto: UpdateExecutionDto,
    userId: string,
  ): Promise<Execution> {
    const execution = await this.findOne(id);

    if ([ExecutionStatus.COMPLETED, ExecutionStatus.ROLLED_BACK].includes(execution.status)) {
      throw new BadRequestException('Cannot update a completed or rolled-back execution');
    }

    Object.assign(execution, updateExecutionDto, { updatedById: userId });

    const saved = await this.executionRepository.save(execution);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Execution',
      entityId: result.id,
      description: `Updated execution: ${result.executionCode}`,
      performedById: userId,
    });

    return result;
  }

  async remove(id: string, userId: string): Promise<void> {
    const execution = await this.findOne(id);

    if ([ExecutionStatus.COMPLETED, ExecutionStatus.PROCESSING].includes(execution.status)) {
      throw new BadRequestException('Cannot delete a completed or processing execution');
    }

    await this.executionRepository.softRemove(execution);

    await this.auditLogService.create({
      action: AuditAction.DELETE,
      entityType: 'Execution',
      entityId: execution.id,
      description: `Deleted execution: ${execution.executionCode}`,
      performedById: userId,
    });
  }

  async restore(id: string, userId: string): Promise<Execution> {
    const execution = await this.executionRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!execution) {
      throw new NotFoundException(`Execution with ID "${id}" not found`);
    }

    execution.deletedAt = null;
    execution.updatedById = userId;

    const saved = await this.executionRepository.save(execution);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.RESTORE,
      entityType: 'Execution',
      entityId: result.id,
      description: `Restored execution: ${result.executionCode}`,
      performedById: userId,
    });

    return result;
  }

  async process(id: string, processorReference: string, userId: string): Promise<Execution> {
    const execution = await this.findOne(id);

    if (execution.status !== ExecutionStatus.PENDING) {
      throw new BadRequestException('Only pending executions can be processed');
    }

    execution.status = ExecutionStatus.PROCESSING;
    execution.processorReference = processorReference;
    execution.processedAt = new Date();
    execution.updatedById = userId;

    const saved = await this.executionRepository.save(execution);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Execution',
      entityId: result.id,
      description: `Started processing execution: ${result.executionCode}`,
      performedById: userId,
    });

    return result;
  }

  async complete(id: string, transactionReference: string, responseData: Record<string, any>, userId: string): Promise<Execution> {
    const execution = await this.findOne(id);

    if (execution.status !== ExecutionStatus.PROCESSING) {
      throw new BadRequestException('Only processing executions can be completed');
    }

    execution.status = ExecutionStatus.COMPLETED;
    execution.transactionReference = transactionReference;
    execution.responseData = responseData;
    execution.completedAt = new Date();
    execution.updatedById = userId;

    const saved = await this.executionRepository.save(execution);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Execution',
      entityId: result.id,
      description: `Completed execution: ${result.executionCode} (Ref: ${transactionReference})`,
      performedById: userId,
    });

    return result;
  }

  async fail(id: string, failureReason: string, userId: string): Promise<Execution> {
    const execution = await this.findOne(id);

    if (![ExecutionStatus.PENDING, ExecutionStatus.PROCESSING].includes(execution.status)) {
      throw new BadRequestException('Execution cannot be marked as failed in current status');
    }

    execution.status = ExecutionStatus.FAILED;
    execution.failureReason = failureReason;
    execution.updatedById = userId;

    const saved = await this.executionRepository.save(execution);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Execution',
      entityId: result.id,
      description: `Failed execution: ${result.executionCode} - ${failureReason}`,
      performedById: userId,
    });

    return result;
  }

  async rollback(id: string, rollbackReason: string, userId: string): Promise<Execution> {
    const execution = await this.findOne(id);

    if (execution.status !== ExecutionStatus.COMPLETED) {
      throw new BadRequestException('Only completed executions can be rolled back');
    }

    execution.status = ExecutionStatus.ROLLED_BACK;
    execution.rollbackReason = rollbackReason;
    execution.rolledBackAt = new Date();
    execution.rolledBackById = userId;
    execution.updatedById = userId;

    const saved = await this.executionRepository.save(execution);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Execution',
      entityId: result.id,
      description: `Rolled back execution: ${result.executionCode} - ${rollbackReason}`,
      performedById: userId,
    });

    return result;
  }

  async getExecutionSummary(): Promise<{
    totalExecutions: number;
    pending: number;
    completed: number;
    failed: number;
    totalAmount: number;
  }> {
    const totalExecutions = await this.executionRepository.count({
      where: { deletedAt: null },
    });

    const pending = await this.executionRepository.count({
      where: { status: ExecutionStatus.PENDING, deletedAt: null },
    });

    const completed = await this.executionRepository.count({
      where: { status: ExecutionStatus.COMPLETED, deletedAt: null },
    });

    const failed = await this.executionRepository.count({
      where: { status: ExecutionStatus.FAILED, deletedAt: null },
    });

    const result = await this.executionRepository
      .createQueryBuilder('execution')
      .select('COALESCE(SUM(execution.amount), 0)', 'totalAmount')
      .where('execution.deletedAt IS NULL')
      .getRawOne();

    return {
      totalExecutions,
      pending,
      completed,
      failed,
      totalAmount: parseFloat(result.totalAmount),
    };
  }
}
