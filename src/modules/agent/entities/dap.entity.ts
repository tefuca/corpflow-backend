import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Agent } from './agent.entity';

@Entity('daps')
export class Dap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  dapCode: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  commissionRateEnrollment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  commissionRateTraining: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  commissionRateActivation: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  commissionRateTransaction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCommissionEarned: number;

  @Column({ default: 0 })
  activeAgentCount: number;

  @OneToMany(() => Agent, (agent) => agent.dap)
  agents: Agent[];
}
