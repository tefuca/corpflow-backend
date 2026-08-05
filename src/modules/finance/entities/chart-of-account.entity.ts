import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { GlJournalLine } from './gl-journal-line.entity';

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountCategory {
  COGS = 'COGS',
  SGNA = 'SGNA',
  PROJECT_COST = 'PROJECT_COST',
  COMMISSION = 'COMMISSION',
  PAYROLL = 'PAYROLL',
  AP = 'AP',
  AR = 'AR',
  CASH = 'CASH',
  BANK = 'BANK',
  FIXED_ASSET = 'FIXED_ASSET',
  ACCUM_DEPRECIATION = 'ACCUM_DEPRECIATION',
}

@Entity('chart_of_accounts')
export class ChartOfAccount extends BaseEntity {
  @Column({ name: 'account_code', length: 50, unique: true })
  accountCode: string;

  @Column({ name: 'account_name', length: 200 })
  accountName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  accountType: AccountType;

  @Column({
    type: 'enum',
    enum: AccountCategory,
    nullable: true,
  })
  accountCategory: AccountCategory | null;

  @Column({ name: 'parent_account_id', nullable: true })
  parentAccountId: number | null;

  @ManyToOne(() => ChartOfAccount, { nullable: true })
  @JoinColumn({ name: 'parent_account_id' })
  parentAccount: ChartOfAccount | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isBankAccount: boolean;

  @Column({ name: 'bank_name', length: 100, nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @OneToMany(() => GlJournalLine, (line) => line.account)
  journalLines: GlJournalLine[];
}
