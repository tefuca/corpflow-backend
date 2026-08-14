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
import { Dap } from './dap.entity';

export enum AgentStatus {
  PROSPECT = 'A-100',
  ENROLLED = 'A-200',
  TRAINED = 'A-300',
  ACTIVATED = 'A-400',
  TRANSACTIONAL_ACTIVE = 'A-500',
  DORMANT = 'A-600',
  TERMINATED = 'A-700',
}

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  agentCode: string;

  @Column()
  name: string;

  @Column({ default: 'A-100' })
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  transactionVolumeTotal: number;

  @Column({ type: 'int', nullable: true })
  customerCount: number;

  @Column({ type: 'uuid', nullable: true })
  clientId: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'uuid', nullable: true, name: 'dap_id' })
  dapId: string;

  @ManyToOne(() => Dap, (dap) => dap.agents, { nullable: true })
  @JoinColumn({ name: 'dap_id' })
  dap: Dap;

  @Column({ type: 'timestamp', nullable: true })
  enrolledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  trainingCompletedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dormantSince: Date;

  @Column({ type: 'timestamp', nullable: true })
  terminatedAt: Date;

  @Column({ type: 'text', nullable: true })
  terminationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
