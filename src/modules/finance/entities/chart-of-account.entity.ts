import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GlJournalLine } from './gl-journal-line.entity';

export enum GlAccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

@Entity('chart_of_accounts')
export class ChartOfAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  accountCode: string;

  @Column()
  accountName: string;

  @Column({
    type: 'enum',
    enum: GlAccountType,
  })
  accountType: GlAccountType;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  parentId: string | null;

  // ── Relations ──
  @OneToMany(() => GlJournalLine, (line) => line.account)
  lines: GlJournalLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
