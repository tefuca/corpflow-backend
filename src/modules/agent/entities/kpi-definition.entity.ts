// src/modules/agent/entities/kpi-definition.entity.ts
@Column({ type: 'enum', enum: KpiType })
kpiType: KpiType;

@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
fixedAmount: number;

@Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
percentageRate: number;

@Column({ nullable: true })
projectId: number;
