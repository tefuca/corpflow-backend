import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ClientBillingRecord } from '../../agent/entities/client-billing-record.entity';
import { ClientInvoice } from './client-invoice.entity';

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('clients')
export class Client extends BaseEntity {
  @Column({ name: 'client_code', length: 50, unique: true })
  clientCode: string;

  @Column({ name: 'company_name', length: 100 })
  companyName: string;

  @Column({ name: 'contact_person', length: 100, nullable: true })
  contactPerson: string | null;

  @Column({ length: 20, nullable: true })
  phone: string | null;

  @Column({ length: 100, nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ length: 50, nullable: true })
  tin: string | null;

  @Column({ name: 'vat_number', length: 50, nullable: true })
  vatNumber: string | null;

  @Column({ name: 'payment_terms', length: 100, nullable: true })
  paymentTerms: string | null;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 18, scale: 2, default: 0 })
  creditLimit: number;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.ACTIVE,
  })
  status: ClientStatus;

  @Column({ name: 'portal_access', type: 'boolean', default: false })
  portalAccess: boolean;

  @Column({ name: 'portal_user_id', nullable: true })
  portalUserId: number | null;

  @OneToMany(() => ClientBillingRecord, (cbr) => cbr.client)
  billingRecords: ClientBillingRecord[];

  @OneToMany(() => ClientInvoice, (ci) => ci.client)
  invoices: ClientInvoice[];
}
