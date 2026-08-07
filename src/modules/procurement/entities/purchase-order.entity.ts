// src/modules/procurement/entities/purchase-order.entity.ts
@Column({ unique: true })
poNumber: string;

@Column({ type: 'decimal', precision: 10, scale: 2 })
total: number;

@OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder)
items: PurchaseOrderItem[];

@OneToMany(() => Grn, (grn) => grn.purchaseOrder)
grns: Grn[];

@OneToMany(() => VendorInvoice, (inv) => inv.purchaseOrder)
invoices: VendorInvoice[];
