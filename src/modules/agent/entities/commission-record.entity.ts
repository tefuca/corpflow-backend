// src/modules/agent/entities/commission-record.entity.ts
@Column({ unique: true })
commissionNumber: string;

@Column()
dapId: number;

@Column()
commissionType: string;

@Column({ nullable: true })
holdReason: string;

@Column({ nullable: true })
approvedBy: string;

@Column({ nullable: true })
approvedAt: Date;

@Column({ nullable: true })
paidAt: Date;
