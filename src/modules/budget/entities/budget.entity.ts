import { forwardRef } from '@nestjs/common';
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
import { Project } from '../projects/entities/project.entity';

export enum BudgetStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  EXHAUSTED = 'exhausted',
  CANCELLED = 'cancelled',
}

export enum BudgetType {
  CAPITAL = 'capital',
  OPERATIONAL = 'operational',
  PROJECT = 'project',
  ADMIN = 'admin',
  OTHER = 'other',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  budgetCode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: BudgetStatus, default: BudgetStatus.DRAFT })
  status: BudgetStatus;

  @Column({ type: 'enum', enum: BudgetType, default: BudgetType.OPERATIONAL })
  budgetType: BudgetType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spentAmount: number;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.budgets, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'uuid' })
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
