import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Dap } from './dap.entity';
import { PaymentRequest } from './payment-request.entity';

export enum AgentStatus {
  COMPLETED = 'COMPLETED',
  UNCOMPLETED = 'UNCOMPLETED',
  REGISTERED = 'Registered',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  TERMINATED = 'Terminated',
}

@Entity('agents')
export class Agent extends BaseEntity {
  @Column({ name: 'agent_id', length: 50, unique: true })
  agentId: string;

  @Column({ name: 'import_date', type: 'date', nullable: true })
  importDate: Date | null;

  @Column({ name: 'dap_name', length: 100, nullable: true })
  dapName: string | null;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'sex', type: 'enum', enum: ['M', 'F'], nullable: true })
  sex: 'M' | 'F' | null;

  @Column({ name: 'age', type: 'int', nullable: true })
  age: number | null;

  @Column({ name: 'region', length: 50 })
  region: string;

  @Column({ name: 'subcity', length: 50, nullable: true })
  subcity: string | null;

  @Column({ name: 'woreda', length: 50, nullable: true })
  woreda: string | null;

  @Column({ name: 'kebele', length: 50, nullable: true })
  kebele: string | null;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'gender', length: 20, nullable: true })
  gender: string | null;

  @Column({ name: 'category', length: 50, nullable: true })
  category: string | null;

  @Column({ name: 'renewed_status', length: 50, nullable: true })
  renewedStatus: string | null;

  @Column({ name: 'license_number', length: 50, nullable: true })
  licenseNumber: string | null;

  @Column({ name: 'tin', length: 50, nullable: true })
  tin: string | null;

  @Column({ name: 'id_type', length: 50, nullable: true })
  idType: string | null;

  @Column({ name: 'id_number', length: 50, nullable: true })
  idNumber: string | null;

  @Column({ name: 'contract_agent', length: 50, nullable: true })
  contractAgent: string | null;

  @Column({ name: 'contract_merchant', length: 50, nullable: true })
  contractMerchant: string | null;

  @Column({ name: 'acct_opening_form', length: 50, nullable: true })
  acctOpeningForm: string | null;

  @Column({ name: 'borsa_point_mou', length: 50, nullable: true })
  borsaPointMou: string | null;

  @Column({ name: 'account_number', length: 50, nullable: true })
  accountNumber: string | null;

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.REGISTERED,
  })
  status: AgentStatus;

  @Column({ name: 'reference', length: 100, nullable: true })
  reference: string | null;

  @Column({ name: 'cbe_sys', length: 100, nullable: true })
  cbeSys: string | null;

  @Column({ name: 'registration_date', type: 'date', nullable: true })
  registrationDate: Date | null;

  @Column({ name: 'level_movement_date', type: 'date', nullable: true })
  levelMovementDate: Date | null;

  @Column({ name: 'level', length: 50, nullable: true })
  level: string | null;

  @Column({ name: 'import_batch', length: 50, nullable: true })
  importBatch: string | null;

  @ManyToOne(() => Dap, (dap) => dap.paymentRequests, { nullable: true })
  @JoinColumn({ name: 'dap_id' })
  dap: Dap | null;

  @Column({ name: 'dap_id', nullable: true })
  dapId: number | null;

  @OneToMany(() => PaymentRequest, (pr) => pr.agent)
  paymentRequests: PaymentRequest[];
}
