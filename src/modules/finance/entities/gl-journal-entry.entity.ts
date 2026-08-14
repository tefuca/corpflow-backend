import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { GlJournalLine } from './gl-journal-line.entity';

export enum JournalStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

export enum JournalSource {
  MANUAL = 'MANUAL',
  PROCUREMENT = 'PROCUREMENT',
  PAYROLL = 'PAYROLL',
  COMMISSION = 'COMMISSION',
  PROJECT = 'PROJECT',
  DEPRECIATION = 'DEPRECIATION',
  CLIENT_BILLING = 'CLIENT_BILLING',
  PAYMENT = 'PAYMENT',
}

@Entity('gl_journal_entries')
export class GlJournalEntry extends BaseEntity {
  @Column({ name: 'journal_number', length: 50, unique: true })
  journalNumber: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'reference_type', length: 50, nullable: true })
  referenceType: string | null;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: number | null;

  @Column({
    type: 'enum',
    enum: JournalSource,
    default: JournalSource.MANUAL,
  })
  source: JournalSource;

  @Column({
    type: 'enum',
    enum: JournalStatus,
    default: JournalStatus.DRAFT,
  })
  status: JournalStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalCredit: number;

  @Column({ name: 'posted_by', nullable: true })
  postedBy: number | null;

  @Column({ name: 'posted_at', type: 'timestamp', nullable: true })
  postedAt: Date | null;

  @OneToMany(() => GlJournalLine, (line) => line.journalEntry)
  lines: GlJournalLine[];
}
