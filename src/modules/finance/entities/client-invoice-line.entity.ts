import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ClientInvoice } from './client-invoice.entity';

@Entity('client_invoice_lines')
export class ClientInvoiceLine extends BaseEntity {
  @Column({ name: 'invoice_id' })
  invoiceId: number;

  @ManyToOne(() => ClientInvoice, (ci) => ci.lines)
  @JoinColumn({ name: 'invoice_id' })
  invoice: ClientInvoice;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'agent_id', nullable: true })
  agentId: number | null;

  @Column({ name: 'kpi_achievement_id', nullable: true })
  kpiAchievementId: number | null;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  lineTotal: number;
}
