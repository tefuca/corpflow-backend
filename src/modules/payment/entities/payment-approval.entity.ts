import { Entity, Column } from 'typeorm';

export enum ApprovalLevel {
  OPERATIONS = 'Operations',
  FINANCE = 'Finance',
}

export enum ApprovalAction {
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Entity('payment_approvals')
export class PaymentApproval {
  @Column({ primary: true, generated: 'increment' })
  id: number;

  @Column({ name: 'schedule_id', type: 'int' })
  scheduleId: number;

  @Column({ name: 'approver_id', type: 'int' })
  approverId: number;

  @Column({ name: 'approval_level', type: 'enum', enum: ApprovalLevel })
  approvalLevel: ApprovalLevel;

  @Column({ name: 'action', type: 'enum', enum: ApprovalAction })
  action: ApprovalAction;

  @Column({ name: 'comments', type: 'text', nullable: true })
  comments: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
