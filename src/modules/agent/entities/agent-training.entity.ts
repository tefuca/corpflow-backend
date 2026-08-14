import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TrainingModule } from './training-module.entity';
import { Agent } from './agent.entity';

export enum TrainingStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Entity('agent_trainings')
export class AgentTraining {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent | null;

  @Column()
  trainingModuleId: string;

  @ManyToOne(() => TrainingModule)
  @JoinColumn({ name: 'training_module_id' })
  trainingModule: TrainingModule;

  @Column({
    type: 'enum',
    enum: TrainingStatus,
    default: TrainingStatus.PENDING,
  })
  status: TrainingStatus;

  @Column({ nullable: true })
  assignedBy: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  assignedAt: Date | null;

  @Column({ type: 'date', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
