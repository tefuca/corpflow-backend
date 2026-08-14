import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('agent_documents')
export class AgentDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @Column()
  documentType: string;

  @Column()
  title: string;

  @Column()
  fileUrl: string;

  @Column()
  uploadedBy: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;
}
