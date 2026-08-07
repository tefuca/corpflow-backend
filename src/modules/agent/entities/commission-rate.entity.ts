// src/modules/agent/entities/commission-rate.entity.ts
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
enrollmentBonus: number;

@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
trainingBonus: number;

@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
activationCommission: number;

@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
transactionRate: number;
