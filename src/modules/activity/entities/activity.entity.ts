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
  OneToMany,
} from 'typeorm';
import { Project } from '../project/entities/project.entity';

export enum ActivityStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  DEFERRED = 'deferred',
}

export enum ActivityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  activityCode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ActivityStatus, default: ActivityStatus.NOT_STARTED })
  status: ActivityStatus;

  @Column({ type: 'enum', enum: ActivityPriority, default: ActivityPriority.MEDIUM })
  priority: ActivityPriority;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => forwardRef(() => Project), (project) => project.activities, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'date' })
  plannedStartDate: Date;

  @Column({ type: 'date' })
  plannedEndDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assignedToId: string;

  @Column({ type: 'simple-array', nullable: true })
  milestoneIds: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'text', nullable: true })
  deliverables: string;

  @Column({ type: 'text', nullable: true })
  dependencies: string;

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
}
