// src/modules/fixed-asset/entities/depreciation-entry.entity.ts
@Column()
assetId: number;

@Column({ type: 'date' })
periodStart: Date;
