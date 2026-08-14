import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';

export enum BudgetStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXHAUSTED = 'exhausted',
}

export enum BudgetType {
  CAPITAL = 'capital',
  OPERATIONAL = 'operational',
  PROJECT = 'project',
  MARKETING = 'marketing',
  RESEARCH = 'research',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  budgetCode: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  allocatedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spentAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({
    type: 'enum',
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT,
  })
  status: BudgetStatus;

  @Column({
    type: 'enum',
    enum: BudgetType,
    default: BudgetType.OPERATIONAL,
  })
  type: BudgetType;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ nullable: true })
  projectId: string | null;

  @ManyToOne(() => Project, (project) => project.budgets, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @Column({ nullable: true })
  createdById: string | null;

  @Column({ nullable: true })
  updatedById: string | null;

  @Column({ nullable: true })
  approvedById: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
