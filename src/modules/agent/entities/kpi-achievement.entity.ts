// src/modules/agent/entities/kpi-achievement.entity.ts
@Column()
agentId: number;

@Column()
kpiDefinitionId: number;

@Column({ type: 'date' })
measuredDate: Date;

@Column({ default: false })
billed: boolean;

@Column({ nullable: true })
invoiceId: number;
