import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { PaymentRequest } from '../../payment/entities/payment-request.entity';

export enum DapStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
}

@Entity('daps')
export class Dap extends BaseEntity {
  @Column({ name: 'dap_id', length: 50, unique: true })
  dapId: string;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'region', length: 50 })
  region: string;

  @Column({ name: 'subcity', length: 50, nullable: true })
  subcity: string | null;

  @Column({ name: 'woreda', length: 50, nullable: true })
  woreda: string | null;

  @Column({ name: 'kebele', length: 50, nullable: true })
  kebele: string | null;

  @Column({ name: 'contact_person', length: 100, nullable: true })
  contactPerson: string | null;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'email', length: 100, nullable: true })
  email: string | null;

  @Column({ name: 'bank_name', length: 100, nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account', length: 50, nullable: true })
  bankAccount: string | null;

  @Column({ name: 'tin', length: 50, nullable: true })
  tin: string | null;

  @Column({ name: 'id_picture', length: 255, nullable: true })
  idPicture: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: DapStatus,
    default: DapStatus.ACTIVE,
  })
  status: DapStatus;

  @Column({ name: 'gender', length: 20, nullable: true })
  gender: string | null;

  @OneToMany(() => PaymentRequest, (pr) => pr.dap)
  paymentRequests: PaymentRequest[];
}
