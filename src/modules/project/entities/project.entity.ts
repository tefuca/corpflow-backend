import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Activity } from '../activity/entities/activity.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Budget } from '../budget/entities/budget.entity';
import { Asset } from '../asset/entities/asset.entity';
import { forwardRef } from '@nestjs/common';

export enum ProjectStatus {
  DRAFT = 'draft',
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  projectCode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @Column({ type: 'enum', enum: ProjectPriority, default: ProjectPriority.MEDIUM })
  priority: ProjectPriority;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBudget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clientName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  projectManagerId: string;

  @Column({ type: 'simple-array', nullable: true })
  teamMemberIds: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  cluster: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'text', nullable: true })
  deliverables: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'text', nullable: true })
  risks: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentUrl: string;

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

 @OneToMany(() => forwardRef(() => Asset), (asset) => asset.project)
assets: Asset[];

@OneToMany(() => forwardRef(() => Budget), (budget) => budget.project)
budgets: Budget[];

@OneToMany(() => forwardRef(() => Activity), (activity) => activity.project)
activities: Activity[];

@OneToMany(() => forwardRef(() => Payment), (payment) => payment.project)
payments: Payment[];
}
