// src/modules/procurement/entities/vendor-invoice.entity.ts
@Column({ nullable: true })
poId: number;

@ManyToOne(() => PurchaseOrder, (po) => po.invoices)
@JoinColumn({ name: 'poId' })
purchaseOrder: PurchaseOrder;

@Column({ type: 'decimal', precision: 10, scale: 2 })
total: number;

@Column({ default: false })
matchedPo: boolean;

@Column({ default: false })
matchedGrn: boolean;

@Column({ default: false })
threeWayMatched: boolean;

@Column({ nullable: true })
matchedAt: Date;
