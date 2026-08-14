import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClientInvoice } from './client-invoice.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ nullable: true })
  taxId: string | null;

  @Column({ nullable: true })
  industry: string | null;

  @Column({ default: true })
  isActive: boolean;

  // ── Relations ──
  @OneToMany(() => ClientInvoice, (invoice) => invoice.clientId)
  invoices: ClientInvoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
