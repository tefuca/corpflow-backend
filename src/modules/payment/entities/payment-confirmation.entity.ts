import { Entity, Column } from 'typeorm';

export enum PaymentMethod {
  BANK_TRANSFER = 'Bank Transfer',
  CASH = 'Cash',
  CHECK = 'Check',
  MOBILE_MONEY = 'Mobile Money',
}

@Entity('payment_confirmations')
export class PaymentConfirmation {
  @Column({ primary: true, generated: 'increment' })
  id: number;

  @Column({ name: 'schedule_id', type: 'int' })
  scheduleId: number;

  @Column({ name: 'confirmed_by', type: 'int' })
  confirmedBy: number;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate: Date | null;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  paymentMethod: PaymentMethod;

  @Column({ name: 'transaction_reference', length: 100, nullable: true })
  transactionReference: string | null;

  @Column({ name: 'bank_advice_file', length: 255, nullable: true })
  bankAdviceFile: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
