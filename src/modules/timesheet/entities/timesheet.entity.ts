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

export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('timesheets')
export class Timesheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @Column({ type: 'date' })
  workDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  hours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: TimesheetStatus,
    default: TimesheetStatus.DRAFT,
  })
  status: TimesheetStatus;

  @Column({ default: false })
  approved: boolean;

  @Column({ nullable: true })
  approvedBy: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  approvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
