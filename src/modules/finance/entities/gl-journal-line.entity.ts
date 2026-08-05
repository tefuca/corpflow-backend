import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { GlJournalEntry } from './gl-journal-entry.entity';
import { ChartOfAccount } from './chart-of-account.entity';
import { Project } from '../../project/entities/project.entity';

@Entity('gl_journal_lines')
export class GlJournalLine extends BaseEntity {
  @Column({ name: 'journal_id' })
  journalId: number;

  @ManyToOne(() => GlJournalEntry, (je) => je.lines)
  @JoinColumn({ name: 'journal_id' })
  journalEntry: GlJournalEntry;

  @Column({ name: 'account_id' })
  accountId: number;

  @ManyToOne(() => ChartOfAccount, (coa) => coa.journalLines)
  @JoinColumn({ name: 'account_id' })
  account: ChartOfAccount;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  credit: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'project_id', nullable: true })
  projectId: number | null;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @Column({ name: 'cost_center', length: 50, nullable: true })
  costCenter: string | null;
}
