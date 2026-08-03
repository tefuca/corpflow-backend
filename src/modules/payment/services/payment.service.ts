import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { PaymentSchedule, ScheduleStatus, ScheduleType } from '../entities/payment-schedule.entity';
import { PaymentRequest, PaymentRequestStatus, PaymentCategory } from '../entities/payment-request.entity';
import { ScheduleItem, ItemStatus } from '../entities/schedule-item.entity';
import { PaymentConfirmation } from '../entities/payment-confirmation.entity';
import { PaymentApproval, ApprovalLevel, ApprovalAction } from '../entities/payment-approval.entity';
import { Dap, DapStatus } from '../entities/dap.entity';
import { Agent, AgentStatus } from '../entities/agent.entity';
import { ActivityType } from '../entities/activity-type.entity';
import { BulkUpload, UploadStatus } from '../entities/bulk-upload.entity';
import { CreateDapPaymentDto } from '../dto/create-dap-payment.dto';
import { CreateNonDapPaymentDto } from '../dto/create-non-dap-payment.dto';
import { PaymentExecutionDto } from '../dto/payment-execution.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentSchedule)
    private scheduleRepo: Repository<PaymentSchedule>,
    @InjectRepository(PaymentRequest)
    private requestRepo: Repository<PaymentRequest>,
    @InjectRepository(ScheduleItem)
    private itemRepo: Repository<ScheduleItem>,
    @InjectRepository(PaymentConfirmation)
    private confirmationRepo: Repository<PaymentConfirmation>,
    @InjectRepository(PaymentApproval)
    private approvalRepo: Repository<PaymentApproval>,
    @InjectRepository(Dap)
    private dapRepo: Repository<Dap>,
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
    @InjectRepository(ActivityType)
    private activityRepo: Repository<ActivityType>,
    @InjectRepository(BulkUpload)
    private bulkUploadRepo: Repository<BulkUpload>,
    private dataSource: DataSource,
  ) {}

  // ==================== DAP PAYMENT REQUEST ====================
  async createDapPayment(dto: CreateDapPaymentDto, userId: number): Promise<PaymentSchedule> {
    return this.dataSource.transaction(async (manager) => {
      const dap = await manager.findOne(Dap, { where: { id: dto.dapId } });
      if (!dap) throw new NotFoundException('DAP not found');

      const activity = await manager.findOne(ActivityType, { where: { id: dto.activityTypeId } });
      if (!activity) throw new NotFoundException('Activity type not found');

      const agentIds = dto.selectedAgents.map(a => a.agentId);
      const agents = await manager.findBy(Agent, { id: In(agentIds) });
      if (agents.length !== agentIds.length) throw new BadRequestException('Some agents not found');

      let totalAmount = 0;
      const agentAmounts = dto.selectedAgents.map(sa => {
        const agent = agents.find(a => a.id === sa.agentId);
        let amount = 0;
        switch (dto.rateType) {
          case 'Fixed Amount': amount = dto.rateValue; break;
          case 'Percentage': amount = (dto.baseAmount * dto.rateValue) / 100; break;
          case 'Unit Price': amount = dto.rateValue * (sa.quantity || dto.quantity || 1); break;
        }
        totalAmount += amount;
        return { agent, amount };
      });

      if (totalAmount <= 0) throw new BadRequestException('Total amount must be greater than 0');

      const scheduleCode = `SCH-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const scheduleType = this.parseScheduleType(dto.scheduleType);
      const schedule = manager.create(PaymentSchedule, {
        scheduleCode,
        schedulePeriod: `${dto.periodFrom} to ${dto.periodTo}`,
        scheduleType,
        totalAmount,
        dapCount: 1,
        requestCount: dto.selectedAgents.length,
        status: ScheduleStatus.DRAFT,
        createdBy: userId,
      });
      const savedSchedule = await manager.save(schedule);

      for (const { agent, amount } of agentAmounts) {
        const requestCode = `PRQ-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const request = manager.create(PaymentRequest, {
          requestCode,
          agentId: agent.id,
          dapId: dap.id,
          activityTypeId: activity.id,
          commissionAmount: amount,
          requestedBy: userId,
          requestDate: new Date(),
          periodFrom: new Date(dto.periodFrom),
          periodTo: new Date(dto.periodTo),
          scheduleType: dto.scheduleType,
          status: PaymentRequestStatus.DRAFT,
          remarks: `DAP: ${dap.name} | Activity: ${activity.name} | Agent: ${agent.fullName} (${agent.agentId})`,
          paymentCategory: PaymentCategory.DAP,
          createdBy: userId,
        });
        const savedRequest = await manager.save(request);

        const item = manager.create(ScheduleItem, {
          scheduleId: savedSchedule.id,
          paymentRequestId: savedRequest.id,
          dapId: dap.id,
          paymentDescription: `Agent: ${agent.fullName} (${agent.agentId}) | TIN: ${agent.tin || 'N/A'} | Phone: ${agent.phone || 'N/A'}`,
          rateType: dto.rateType,
          rateValue: dto.rateValue,
          quantity: 1,
          baseAmount: dto.baseAmount || 0,
          itemAmount: amount,
          status: ItemStatus.PENDING,
        });
        await manager.save(item);
      }

      return savedSchedule;
    });
  }

  private parseScheduleType(type: string): ScheduleType {
    const map: Record<string, ScheduleType> = {
      'Weekly': ScheduleType.WEEKLY,
      'Bi-Weekly': ScheduleType.BI_WEEKLY,
      'Monthly': ScheduleType.MONTHLY,
      'Quarterly': ScheduleType.QUARTERLY,
      'Bi-Annual': ScheduleType.BI_ANNUAL,
      'Annual': ScheduleType.ANNUAL,
      'One-time': ScheduleType.ONE_TIME,
    };
    return map[type] || ScheduleType.MONTHLY;
  }

  // ==================== NON-DAP PAYMENT REQUEST ====================
  async createNonDapPayment(dto: CreateNonDapPaymentDto, userId: number): Promise<PaymentSchedule> {
    return this.dataSource.transaction(async (manager) => {
      let totalAmount = 0;
      for (const payee of dto.payees) {
        if (!payee.name) continue;
        let amount = 0;
        const payeeRate = payee.rateValue || dto.rateValue;
        const payeeQty = payee.quantity || 1;
        switch (dto.rateType) {
          case 'Fixed Amount': amount = payeeRate; break;
          case 'Percentage': amount = (dto.baseAmount * payeeRate) / 100; break;
          case 'Unit Price': amount = payeeRate * payeeQty; break;
        }
        totalAmount += amount;
      }

      if (totalAmount === 0 && dto.rateValue) {
        switch (dto.rateType) {
          case 'Fixed Amount': totalAmount = dto.rateValue; break;
          case 'Percentage': totalAmount = (dto.baseAmount * dto.rateValue) / 100; break;
          case 'Unit Price': totalAmount = dto.rateValue * (dto.quantity || 1); break;
        }
      }

      const requestCode = `REQ-ND-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const request = manager.create(PaymentRequest, {
        requestCode,
        agentId: null,
        dapId: null,
        activityTypeId: null,
        commissionAmount: 0,
        requestedBy: userId,
        requestDate: new Date(),
        status: PaymentRequestStatus.DRAFT,
        remarks: `Payee: Non-DAP Payment Request - ${dto.schedulePeriod}`,
        paymentCategory: PaymentCategory.NON_DAP,
        createdBy: userId,
      });
      const savedRequest = await manager.save(request);

      const scheduleCode = `ND-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const scheduleType = this.parseScheduleType(dto.scheduleType);
      const schedule = manager.create(PaymentSchedule, {
        scheduleCode,
        schedulePeriod: dto.schedulePeriod,
        scheduleType,
        totalAmount,
        dapCount: 0,
        requestCount: dto.payees.length,
        status: ScheduleStatus.PENDING_APPROVAL,
        createdBy: userId,
      });
      const savedSchedule = await manager.save(schedule);

      for (const payee of dto.payees) {
        if (!payee.name) continue;
        let payeeTotal = 0;
        const payeeRate = payee.rateValue || dto.rateValue;
        const payeeQty = payee.quantity || 1;
        switch (dto.rateType) {
          case 'Fixed Amount': payeeTotal = payeeRate; break;
          case 'Percentage': payeeTotal = (dto.baseAmount * payeeRate) / 100; break;
          case 'Unit Price': payeeTotal = payeeRate * payeeQty; break;
        }
        const location = [payee.region, payee.city, payee.woreda, payee.kebele].filter(Boolean).join(', ');
        const desc = `Payee: ${payee.name} | Type: ${payee.type || 'Other'} | Location: ${location} | Reason: ${payee.paymentReason || dto.paymentReason} | ${payeeQty} ${payee.type || 'unit'} @ ETB ${payeeRate}`;

        const item = manager.create(ScheduleItem, {
          scheduleId: savedSchedule.id,
          paymentRequestId: savedRequest.id,
          dapId: null,
          paymentDescription: desc,
          rateType: dto.rateType,
          rateValue: payeeRate,
          quantity: payeeQty,
          baseAmount: dto.baseAmount || 0,
          itemAmount: payeeTotal,
          status: ItemStatus.PENDING,
        });
        await manager.save(item);
      }

      return savedSchedule;
    });
  }

  // ==================== APPROVALS ====================
  async submitForApproval(scheduleId: number): Promise<PaymentSchedule> {
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.status !== ScheduleStatus.DRAFT) throw new BadRequestException('Only draft schedules can be submitted');
    schedule.status = ScheduleStatus.PENDING_APPROVAL;
    return this.scheduleRepo.save(schedule);
  }

  async approveSchedule(scheduleId: number, userId: number, comments?: string): Promise<PaymentSchedule> {
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.status !== ScheduleStatus.PENDING_APPROVAL) throw new BadRequestException('Schedule is not pending approval');

    schedule.status = ScheduleStatus.APPROVED;
    schedule.approvedBy = userId;
    schedule.approvedAt = new Date();
    await this.itemRepo.update({ scheduleId }, { status: ItemStatus.APPROVED });

    const approval = this.approvalRepo.create({
      scheduleId, approverId: userId, approvalLevel: ApprovalLevel.FINANCE,
      action: ApprovalAction.APPROVED, comments,
    });
    await this.approvalRepo.save(approval);
    return this.scheduleRepo.save(schedule);
  }

  async rejectSchedule(scheduleId: number, userId: number, reason: string): Promise<PaymentSchedule> {
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.status !== ScheduleStatus.PENDING_APPROVAL) throw new BadRequestException('Schedule is not pending approval');

    schedule.status = ScheduleStatus.REJECTED;
    schedule.rejectionReason = reason;
    await this.itemRepo.update({ scheduleId }, { status: ItemStatus.REJECTED });

    const approval = this.approvalRepo.create({
      scheduleId, approverId: userId, approvalLevel: ApprovalLevel.FINANCE,
      action: ApprovalAction.REJECTED, comments: reason,
    });
    await this.approvalRepo.save(approval);
    return this.scheduleRepo.save(schedule);
  }

  // ==================== EXECUTION ====================
  async executePayment(dto: PaymentExecutionDto, userId: number, file?: Express.Multer.File): Promise<PaymentConfirmation> {
    const schedule = await this.scheduleRepo.findOne({ where: { id: dto.scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.status !== ScheduleStatus.APPROVED) throw new BadRequestException('Only approved schedules can be executed');

    let bankAdvicePath: string | null = null;
    if (file) bankAdvicePath = `uploads/bank-advice/${Date.now()}_${file.originalname}`;

    const confirmation = this.confirmationRepo.create({
      scheduleId: dto.scheduleId, confirmedBy: userId,
      paymentDate: new Date(dto.paymentDate), paymentMethod: dto.paymentMethod,
      transactionReference: dto.transactionReference, bankAdviceFile: bankAdvicePath, notes: dto.notes,
    });
    const saved = await this.confirmationRepo.save(confirmation);

    schedule.status = ScheduleStatus.PAID;
    await this.scheduleRepo.save(schedule);

    await this.requestRepo
      .createQueryBuilder()
      .update(PaymentRequest)
      .set({ status: PaymentRequestStatus.PAID })
      .where('id IN (SELECT payment_request_id FROM schedule_items WHERE schedule_id = :scheduleId)', { scheduleId: dto.scheduleId })
      .execute();

    return saved;
  }

  // ==================== QUERIES ====================
  async getSchedules(filters?: { status?: string; type?: string; page?: number; limit?: number }): Promise<{ data: PaymentSchedule[]; total: number }> {
    const query = this.scheduleRepo.createQueryBuilder('ps')
      .leftJoinAndSelect('ps.scheduleItems', 'si')
      .leftJoinAndSelect('si.paymentRequest', 'pr')
      .leftJoinAndSelect('si.dap', 'd')
      .orderBy('ps.createdAt', 'DESC');
    if (filters?.status) query.andWhere('ps.status = :status', { status: filters.status });
    const total = await query.getCount();
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const data = await query.skip((page - 1) * limit).take(limit).getMany();
    return { data, total };
  }

  async getPendingApprovals(): Promise<PaymentSchedule[]> {
    return this.scheduleRepo.find({
      where: { status: ScheduleStatus.PENDING_APPROVAL },
      relations: ['scheduleItems', 'scheduleItems.paymentRequest', 'scheduleItems.dap'],
      order: { createdAt: 'DESC' },
    });
  }

  async getScheduleDetails(id: number): Promise<PaymentSchedule> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['scheduleItems', 'scheduleItems.paymentRequest', 'scheduleItems.dap', 'scheduleItems.paymentRequest.agent', 'scheduleItems.paymentRequest.activityType'],
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async getDashboardStats(): Promise<any> {
    const monthlyPayments = await this.scheduleRepo
      .createQueryBuilder('ps')
      .select('COALESCE(SUM(ps.totalAmount), 0)', 'total')
      .where('ps.status = :status', { status: ScheduleStatus.PAID })
      .andWhere('EXTRACT(MONTH FROM ps.createdAt) = EXTRACT(MONTH FROM CURRENT_DATE)')
      .andWhere('EXTRACT(YEAR FROM ps.createdAt) = EXTRACT(YEAR FROM CURRENT_DATE)')
      .getRawOne();

    const pendingApprovals = await this.scheduleRepo.count({ where: { status: ScheduleStatus.PENDING_APPROVAL } });
    const activeAgents = await this.agentRepo.count({ where: { status: AgentStatus.ACTIVE } });
    const activeDaps = await this.dapRepo.count({ where: { status: DapStatus.ACTIVE } });

    return {
      monthlyPayments: parseFloat(monthlyPayments?.total || 0),
      pendingApprovals,
      activeAgents,
      activeDaps,
    };
  }

  // ==================== MASTER DATA ====================
  async getAllDaps(): Promise<Dap[]> {
    return this.dapRepo.find({ where: { status: DapStatus.ACTIVE }, order: { name: 'ASC' } });
  }

  async getAllAgents(): Promise<Agent[]> {
    return this.agentRepo.find({ where: { status: AgentStatus.ACTIVE }, order: { fullName: 'ASC' } });
  }

  async getAgentsByDap(dapId: number): Promise<Agent[]> {
    return this.agentRepo.find({ where: { dapId, status: AgentStatus.ACTIVE }, order: { fullName: 'ASC' } });
  }

  async getActivityTypes(): Promise<ActivityType[]> {
    return this.activityRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  // ==================== BULK UPLOAD ====================
  async createBulkUpload(data: Partial<BulkUpload>): Promise<BulkUpload> {
    const upload = this.bulkUploadRepo.create(data);
    return this.bulkUploadRepo.save(upload);
  }

  async getBulkUploads(): Promise<BulkUpload[]> {
    return this.bulkUploadRepo.find({ order: { createdAt: 'DESC' } });
  }

  async processBulkUpload(id: number, userId: number): Promise<BulkUpload> {
    const upload = await this.bulkUploadRepo.findOne({ where: { id } });
    if (!upload) throw new NotFoundException('Upload not found');
    upload.status = UploadStatus.PROCESSING;
    upload.processedBy = userId;
    upload.processedAt = new Date();
    return this.bulkUploadRepo.save(upload);
  }
}