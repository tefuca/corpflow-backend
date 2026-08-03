import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod, PaymentCategory } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuditLogService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    const existing = await this.paymentRepository.findOne({
      where: { paymentCode: createPaymentDto.paymentCode },
    });

    if (existing) {
      throw new ConflictException(
        `Payment with code "${createPaymentDto.paymentCode}" already exists`,
      );
    }

    const localAmount = createPaymentDto.amount * (createPaymentDto.exchangeRate || 1);

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      localAmount,
      createdById: userId,
      updatedById: userId,
    });

    const saved = await this.paymentRepository.save(payment);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.CREATE,
      entityType: 'Payment',
      entityId: result.id,
      description: `Created payment: ${result.paymentCode} - ${result.description}`,
      performedById: userId,
    });

    return result;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: PaymentStatus,
    category?: PaymentCategory,
    projectId?: string,
    payeeId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: Payment[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (projectId) where.projectId = projectId;
    if (payeeId) where.payeeId = payeeId;
    if (search) {
      where.description = Like(`%${search}%`);
    }
    if (startDate && endDate) {
      where.paymentDate = Between(startDate, endDate);
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ['project', 'executions'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['project', 'executions'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }

    return payment;
  }

  async findByCode(paymentCode: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentCode },
      relations: ['project', 'executions'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment with code "${paymentCode}" not found`,
      );
    }

    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    if ([PaymentStatus.COMPLETED, PaymentStatus.CANCELLED].includes(payment.status)) {
      throw new BadRequestException('Cannot update a completed or cancelled payment');
    }

    Object.assign(payment, updatePaymentDto, { updatedById: userId });

    if (updatePaymentDto.amount || updatePaymentDto.exchangeRate) {
      payment.localAmount = Number(payment.amount) * Number(payment.exchangeRate || 1);
    }

    const saved = await this.paymentRepository.save(payment);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Payment',
      entityId: result.id,
      description: `Updated payment: ${result.paymentCode}`,
      performedById: userId,
    });

    return result;
  }

  async remove(id: string, userId: string): Promise<void> {
    const payment = await this.findOne(id);

    if ([PaymentStatus.COMPLETED, PaymentStatus.PROCESSING].includes(payment.status)) {
      throw new BadRequestException('Cannot delete a completed or processing payment');
    }

    await this.paymentRepository.softRemove(payment);

    await this.auditLogService.create({
      action: AuditAction.DELETE,
      entityType: 'Payment',
      entityId: payment.id,
      description: `Deleted payment: ${payment.paymentCode}`,
      performedById: userId,
    });
  }

  async restore(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }

    payment.deletedAt = null;
    payment.updatedById = userId;

    const saved = await this.paymentRepository.save(payment);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.RESTORE,
      entityType: 'Payment',
      entityId: result.id,
      description: `Restored payment: ${result.paymentCode}`,
      performedById: userId,
    });

    return result;
  }

  async approve(
    id: string,
    approvalNotes: string,
    userId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Payment is not pending approval');
    }

    payment.status = PaymentStatus.APPROVED;
    payment.approvedById = userId;
    payment.approvedAt = new Date();
    payment.approvalNotes = approvalNotes;
    payment.updatedById = userId;

    const saved = await this.paymentRepository.save(payment);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.APPROVE,
      entityType: 'Payment',
      entityId: result.id,
      description: `Approved payment: ${result.paymentCode}`,
      performedById: userId,
    });

    return result;
  }

  async reject(
    id: string,
    rejectionReason: string,
    userId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    if (![PaymentStatus.PENDING_APPROVAL, PaymentStatus.DRAFT].includes(payment.status)) {
      throw new BadRequestException('Payment cannot be rejected in current status');
    }

    payment.status = PaymentStatus.REJECTED;
    payment.approvalNotes = rejectionReason;
    payment.updatedById = userId;

    const saved = await this.paymentRepository.save(payment);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.REJECT,
      entityType: 'Payment',
      entityId: result.id,
      description: `Rejected payment: ${result.paymentCode} - ${rejectionReason}`,
      performedById: userId,
    });

    return result;
  }

  async submitForApproval(id: string, userId: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.DRAFT) {
      throw new BadRequestException('Only draft payments can be submitted for approval');
    }

    payment.status = PaymentStatus.PENDING_APPROVAL;
    payment.updatedById = userId;

    const saved = await this.paymentRepository.save(payment);
    const result = Array.isArray(saved) ? saved[0] : saved;

    await this.auditLogService.create({
      action: AuditAction.UPDATE,
      entityType: 'Payment',
      entityId: result.id,
      description: `Submitted payment for approval: ${result.paymentCode}`,
      performedById: userId,
    });

    return result;
  }

  async getPaymentSummary(): Promise<{
    totalPayments: number;
    totalAmount: number;
    pendingApproval: number;
    completed: number;
  }> {
    const totalPayments = await this.paymentRepository.count({
      where: { deletedAt: null },
    });

    const pendingApproval = await this.paymentRepository.count({
      where: { status: PaymentStatus.PENDING_APPROVAL, deletedAt: null },
    });

    const completed = await this.paymentRepository.count({
      where: { status: PaymentStatus.COMPLETED, deletedAt: null },
    });

    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.localAmount), 0)', 'totalAmount')
      .where('payment.deletedAt IS NULL')
      .getRawOne();

    return {
      totalPayments,
      totalAmount: parseFloat(result.totalAmount),
      pendingApproval,
      completed,
    };
  }
}