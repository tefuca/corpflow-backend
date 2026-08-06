import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Budget, BudgetStatus, BudgetType } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuditLogService } from '../audit-log/audit-logs.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createBudgetDto: CreateBudgetDto,
    userId: string,
  ): Promise<Budget> {
    const existing = await this.budgetRepository.findOne({
      where: { budgetCode: createBudgetDto.budgetCode },
    });

    if (existing) {
      throw new ConflictException(
        `Budget with code "${createBudgetDto.budgetCode}" already exists`,
      );
    }

    const budget = this.budgetRepository.create({
      ...createBudgetDto,
      spentAmount: 0,
      createdById: userId,
      updatedById: userId,
    });

    const saved = await this.budgetRepository.save(budget);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.CREATE,
      entityType: 'Budget',
      entityId: result.id,
      description: `Created budget: ${result.name} (${result.budgetCode})`,
      performedById: userId,
    });

    return result;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: BudgetStatus,
    budgetType?: BudgetType,
    projectId?: string,
  ): Promise<{ data: Budget[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (status) where.status = status;
    if (budgetType) where.budgetType = budgetType;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.budgetRepository.findAndCount({
      where,
      relations: ['project'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }

    return budget;
  }

  async findByCode(budgetCode: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { budgetCode },
      relations: ['project'],
    });

    if (!budget) {
      throw new NotFoundException(
        `Budget with code "${budgetCode}" not found`,
      );
    }

    return budget;
  }

  async update(
    id: string,
    updateBudgetDto: UpdateBudgetDto,
    userId: string,
  ): Promise<Budget> {
    const budget = await this.findOne(id);

    if ([BudgetStatus.CANCELLED, BudgetStatus.EXHAUSTED].includes(budget.status)) {
      throw new BadRequestException('Cannot update a cancelled or exhausted budget');
    }

    Object.assign(budget, updateBudgetDto, { updatedById: userId });

    const saved = await this.budgetRepository.save(budget);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Budget',
      entityId: result.id,
      description: `Updated budget: ${result.name}`,
      performedById: userId,
    });

    return result;
  }

  async remove(id: string, userId: string): Promise<void> {
    const budget = await this.findOne(id);

    await this.budgetRepository.softRemove(budget);

    await this.auditLogService.create({
      action: AuditAction.DELETE,
      entityType: 'Budget',
      entityId: budget.id,
      description: `Deleted budget: ${budget.name} (${budget.budgetCode})`,
      performedById: userId,
    });
  }

  async restore(id: string, userId: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID "${id}" not found`);
    }

    budget.deletedAt = null;
    budget.updatedById = userId;

    const saved = await this.budgetRepository.save(budget);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.RESTORE,
      entityType: 'Budget',
      entityId: result.id,
      description: `Restored budget: ${result.name}`,
      performedById: userId,
    });

    return result;
  }

  async approve(
    id: string,
    approvalNotes: string,
    userId: string,
  ): Promise<Budget> {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Budget is not pending approval');
    }

    budget.status = BudgetStatus.APPROVED;
    budget.approvedById = userId;
    budget.approvedAt = new Date();
    budget.approvalNotes = approvalNotes;
    budget.updatedById = userId;

    const saved = await this.budgetRepository.save(budget);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.APPROVE,
      entityType: 'Budget',
      entityId: result.id,
      description: `Approved budget: ${result.budgetCode}`,
      performedById: userId,
    });

    return result;
  }

  async reject(
    id: string,
    rejectionReason: string,
    userId: string,
  ): Promise<Budget> {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Budget cannot be rejected in current status');
    }

    budget.status = BudgetStatus.REJECTED;
    budget.rejectionReason = rejectionReason;
    budget.updatedById = userId;

    const saved = await this.budgetRepository.save(budget);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.REJECT,
      entityType: 'Budget',
      entityId: result.id,
      description: `Rejected budget: ${result.budgetCode} - ${rejectionReason}`,
      performedById: userId,
    });

    return result;
  }

  async getBudgetSummary(): Promise<{
    totalBudgets: number;
    totalAmount: number;
    totalSpent: number;
    pendingApproval: number;
  }> {
    const totalBudgets = await this.budgetRepository.count({
      where: { deletedAt: null },
    });

    const pendingApproval = await this.budgetRepository.count({
      where: { status: BudgetStatus.PENDING_APPROVAL, deletedAt: null },
    });

    const result = await this.budgetRepository
      .createQueryBuilder('budget')
      .select('COALESCE(SUM(budget.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(budget.spentAmount), 0)', 'totalSpent')
      .where('budget.deletedAt IS NULL')
      .getRawOne();

    return {
      totalBudgets,
      totalAmount: parseFloat(result.totalAmount),
      totalSpent: parseFloat(result.totalSpent),
      pendingApproval,
    };
  }
}
