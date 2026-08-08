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

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  transactionVolumeTotal: number;

  @Column({ nullable: true })
  customerCount: number;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  dapId: string;

  @ManyToOne(() => forwardRef(() => Dap), (dap) => dap.agents, { nullable: true })
  @JoinColumn({ name: 'dapId' })
  dap: Dap;

  @Column({ nullable: true })
  enrolledAt: Date;

  @Column({ nullable: true })
  trainingCompletedAt: Date;

  @Column({ nullable: true })
  activatedAt: Date;

  @Column({ nullable: true })
  lastTransactionAt: Date;

  @Column({ nullable: true })
  dormantSince: Date;

  @Column({ nullable: true })
  terminatedAt: Date;

  @Column({ nullable: true })
  terminationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
