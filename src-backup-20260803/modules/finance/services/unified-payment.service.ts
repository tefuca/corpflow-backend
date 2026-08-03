import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';
import { GlAccount } from '../entities/gl-account.entity';
import { PaymentFlowType, PaymentStatus, GlAccountType } from '../../common/enums';
import { CommissionRecord } from '../../agent/entities/commission-record.entity';
import { VendorInvoice } from '../entities/vendor-invoice.entity';
import { ClientInvoice } from '../entities/client-invoice.entity';
import { PayrollRun } from '../../hr/entities/payroll-run.entity';

@Injectable()
export class UnifiedPaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(JournalEntry)
    private journalRepo: Repository<JournalEntry>,
    @InjectRepository(GlAccount)
    private glRepo: Repository<GlAccount>,
    private dataSource: DataSource,
  ) {}

  /**
   * FRS 8.4: Unified Payment Process Workflow
   * Handles all 4 flows: Vendor AP, DAP Commission, Client AR, Milestone Billing, Payroll
   */
  async createPaymentTrigger(data: {
    flowType: PaymentFlowType;
    referenceType: string;
    referenceId: string;
    amount: number;
    payeeName: string;
    payeeAccount?: string;
    payeeBank?: string;
    projectId?: string;
    costCenter?: string;
    scheduledDate?: Date;
  }): Promise<Payment> {
    const paymentNumber = await this.generatePaymentNumber();
    
    const payment = this.paymentRepo.create({
      ...data,
      paymentNumber,
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepo.save(payment);
  }

  /**
   * FRS 8.4: Document Verification step
   */
  async verifyPayment(paymentId: string, verifiedBy: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');

    // Flow-specific verification
    switch (payment.flowType) {
      case PaymentFlowType.VENDOR_AP:
        await this.verifyVendorPayment(payment);
        break;
      case PaymentFlowType.DAP_COMMISSION:
        await this.verifyDapCommission(payment);
        break;
      case PaymentFlowType.CLIENT_AR:
        // AR is inbound - skip verification for receipts
        break;
      case PaymentFlowType.PAYROLL:
        await this.verifyPayroll(payment);
        break;
    }

    payment.status = PaymentStatus.VERIFICATION;
    payment.verifiedBy = verifiedBy;
    payment.verifiedAt = new Date();
    return this.paymentRepo.save(payment);
  }

  /**
   * FRS 8.4: Payment Approval
   */
  async approvePayment(paymentId: string, approvedBy: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status !== PaymentStatus.VERIFICATION) {
      throw new BadRequestException('Payment must be verified before approval');
    }

    payment.status = PaymentStatus.APPROVED;
    payment.approvedBy = approvedBy;
    payment.approvedAt = new Date();
    return this.paymentRepo.save(payment);
  }

  /**
   * FRS 8.4: Payment Execution + Accounting Update
   */
  async executePayment(paymentId: string, executedBy: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException('Payment must be approved before execution');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      payment.status = PaymentStatus.EXECUTED;
      payment.executedBy = executedBy;
      payment.executedAt = new Date();
      payment.paymentDate = new Date();
      await queryRunner.manager.save(payment);

      // Create GL Journal Entry
      const journalEntry = await this.createGlEntry(payment, queryRunner);
      payment.journalEntryId = journalEntry.id;

      // Update reference document status
      await this.updateReferenceStatus(payment, queryRunner);

      await queryRunner.commitTransaction();
      return this.paymentRepo.save(payment);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async createGlEntry(payment: Payment, queryRunner: any): Promise<JournalEntry> {
    const entryNumber = `JE-${Date.now()}`;
    const entry = queryRunner.manager.create(JournalEntry, {
      entryNumber,
      entryDate: new Date(),
      description: `${payment.flowType} - ${payment.paymentNumber}`,
      referenceType: 'payment',
      referenceId: payment.id,
      postedBy: payment.executedBy,
      postedAt: new Date(),
      posted: true,
      totalDebit: payment.amount,
      totalCredit: payment.amount,
    });
    
    const savedEntry = await queryRunner.manager.save(entry);

    // Determine GL accounts based on flow type
    const lines = await this.buildJournalLines(payment, savedEntry.id);
    for (const line of lines) {
      await queryRunner.manager.save(JournalEntryLine, line);
      
      // Update GL balance
      const glAccount = await queryRunner.manager.findOne(GlAccount, {
        where: { id: line.glAccountId },
      });
      if (glAccount) {
        glAccount.balance = Number(glAccount.balance) + Number(line.debit) - Number(line.credit);
        await queryRunner.manager.save(glAccount);
      }
    }

    return savedEntry;
  }

  private async buildJournalLines(payment: Payment, journalEntryId: string) {
    const lines = [];
    
    switch (payment.flowType) {
      case PaymentFlowType.VENDOR_AP:
        // Debit: Inventory/COGS/Project Cost | Credit: Bank
        lines.push(
          { journalEntryId, glAccountId: await this.getGlId('5000-COGS'), debit: payment.amount, credit: 0, projectId: payment.projectId, costCenter: payment.costCenter },
          { journalEntryId, glAccountId: await this.getGlId('1000-BANK'), debit: 0, credit: payment.amount },
        );
        break;
        
      case PaymentFlowType.DAP_COMMISSION:
        // Debit: Commission Expense (COGS if project, SG&A if ops) | Credit: Bank
        const commExpenseAccount = payment.projectId ? '5000-COGS' : '6000-SG&A';
        lines.push(
          { journalEntryId, glAccountId: await this.getGlId(commExpenseAccount), debit: payment.amount, credit: 0, projectId: payment.projectId },
          { journalEntryId, glAccountId: await this.getGlId('1000-BANK'), debit: 0, credit: payment.amount },
        );
        break;
        
      case PaymentFlowType.PAYROLL:
        // Debit: Salary Expense | Credit: Bank
        lines.push(
          { journalEntryId, glAccountId: await this.getGlId('6100-SALARY'), debit: payment.amount, credit: 0 },
          { journalEntryId, glAccountId: await this.getGlId('1000-BANK'), debit: 0, credit: payment.amount },
        );
        break;
        
      case PaymentFlowType.CLIENT_AR:
        // Debit: Bank | Credit: Revenue
        lines.push(
          { journalEntryId, glAccountId: await this.getGlId('1000-BANK'), debit: payment.amount, credit: 0 },
          { journalEntryId, glAccountId: await this.getGlId('4000-REVENUE'), debit: 0, credit: payment.amount, projectId: payment.projectId },
        );
        break;
    }
    
    return lines;
  }

  private async getGlId(accountCode: string): Promise<string> {
    const gl = await this.glRepo.findOne({ where: { accountCode } });
    return gl?.id || '';
  }

  private async verifyVendorPayment(payment: Payment) {
    const invoice = await this.dataSource.getRepository(VendorInvoice).findOne({
      where: { id: payment.referenceId },
    });
    if (!invoice?.threeWayMatched) {
      throw new BadRequestException('Vendor invoice must be 3-way matched before payment');
    }
  }

  private async verifyDapCommission(payment: Payment) {
    const commission = await this.dataSource.getRepository(CommissionRecord).findOne({
      where: { id: payment.referenceId },
    });
    if (!commission || commission.status !== 'approved') {
      throw new BadRequestException('Commission must be approved before payment');
    }
  }

  private async verifyPayroll(payment: Payment) {
    const payroll = await this.dataSource.getRepository(PayrollRun).findOne({
      where: { id: payment.referenceId },
    });
    if (!payroll || !payroll.processed) {
      throw new BadRequestException('Payroll must be processed before payment');
    }
  }

  private async updateReferenceStatus(payment: Payment, queryRunner: any) {
    if (payment.flowType === PaymentFlowType.VENDOR_AP) {
      await queryRunner.manager.update(VendorInvoice, 
        { id: payment.referenceId }, 
        { paymentStatus: 'paid', status: 'paid' }
      );
    } else if (payment.flowType === PaymentFlowType.DAP_COMMISSION) {
      await queryRunner.manager.update(CommissionRecord,
        { id: payment.referenceId },
        { status: 'paid', paidAt: new Date(), paymentReference: payment.paymentNumber }
      );
    } else if (payment.flowType === PaymentFlowType.CLIENT_AR) {
      const invoice = await queryRunner.manager.findOne(ClientInvoice, {
        where: { id: payment.referenceId },
      });
      if (invoice) {
        const newPaid = Number(invoice.paidAmount) + Number(payment.amount);
        const status = newPaid >= Number(invoice.total) ? 'paid' : 'partially_paid';
        await queryRunner.manager.update(ClientInvoice,
          { id: payment.referenceId },
          { paidAmount: newPaid, paymentStatus: status, status: status === 'paid' ? 'paid' : invoice.status }
        );
      }
    }
  }

  private async generatePaymentNumber(): Promise<string> {
    const date = new Date();
    const prefix = 'PAY';
    const timestamp = date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}