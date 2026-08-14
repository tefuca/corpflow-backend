import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('agent_status_history')
export class AgentStatusHistory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() agentId: string;
  @Column() status: string;
  @Column() changedAt: Date;
}
