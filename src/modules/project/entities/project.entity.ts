import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Activity } from '../../activity/entities/activity.entity';
import { Budget } from '../../budget/entities/budget.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Milestone } from './milestone.entity';
import { Task } from './task.entity';
import { ResourceAllocation } from './resource-allocation.entity';

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
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

  @Column({ unique: true })
  projectCode: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority: ProjectPriority;

  @Column({ nullable: true })
  cluster: string | null;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBudget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date | null;

  @Column({ nullable: true })
  clientId: string | null;

  @Column({ nullable: true })
  managerId: string | null;

  @Column({ nullable: true })
  createdById: string | null;

  @Column({ nullable: true })
  updatedById: string | null;

  // ── Relations ──
  @OneToMany(() => Activity, (activity) => activity.project)
  activities: Activity[];

  @OneToMany(() => Budget, (budget) => budget.project)
  budgets: Budget[];

  @OneToMany(() => Payment, (payment) => payment.project)
  payments: Payment[];

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones: Milestone[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @OneToMany(() => ResourceAllocation, (ra) => ra.project)
  resourceAllocations: ResourceAllocation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
