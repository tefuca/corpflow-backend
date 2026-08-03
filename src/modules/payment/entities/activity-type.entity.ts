import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { PaymentRequest } from './payment-request.entity';

@Entity('activity_types')
export class ActivityType extends BaseEntity {
  @Column({ name: 'name', length: 50, unique: true })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({ name: 'eligibility_status', length: 50, nullable: true })
  eligibilityStatus: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => PaymentRequest, (pr) => pr.activityType)
  paymentRequests: PaymentRequest[];
}
