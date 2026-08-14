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

export enum ActivityStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum ActivityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  activityCode: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ type: 'date', nullable: true })
  plannedStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  plannedEndDate: Date | null;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.NOT_STARTED,
  })
  status: ActivityStatus;

  @Column({
    type: 'enum',
    enum: ActivityPriority,
    default: ActivityPriority.MEDIUM,
  })
  priority: ActivityPriority;

  @Column({ nullable: true })
  projectId: string | null;

  @ManyToOne(() => Project, (project) => project.activities, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @Column({ nullable: true })
  assignedToId: string | null;

  @Column({ nullable: true })
  createdById: string | null;

  @Column({ nullable: true })
  updatedById: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
