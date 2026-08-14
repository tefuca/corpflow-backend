import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { GlJournalEntry } from './gl-journal-entry.entity';
import { ChartOfAccount } from './chart-of-account.entity';

@Entity('gl_journal_lines')
export class GlJournalLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  journalEntryId: string;

  @ManyToOne(() => GlJournalEntry, (entry) => entry.lines)
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: GlJournalEntry;

  @Column()
  accountId: string;

  @ManyToOne(() => ChartOfAccount, (account) => account.lines)
  @JoinColumn({ name: 'account_id' })
  account: ChartOfAccount;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ nullable: true })
  projectId: string | null;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
