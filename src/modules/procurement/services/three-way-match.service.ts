import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { GoodsReceiptNote } from '../entities/goods-receipt-note.entity';
import { VendorInvoice } from '../../finance/entities/vendor-invoice.entity';
import { GrnItem } from '../entities/grn-item.entity';
import { PoItem } from '../entities/po-item.entity';

@Injectable()
export class ThreeWayMatchService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(GoodsReceiptNote)
    private grnRepo: Repository<GoodsReceiptNote>,
    @InjectRepository(VendorInvoice)
    private invoiceRepo: Repository<VendorInvoice>,
  ) {}

  /**
   * FRS 3.2 / PR-005: 3-Way Match (PO/GRN/Invoice)
   */
  async performThreeWayMatch(invoiceId: string): Promise<{
    matched: boolean;
    poMatch: boolean;
    grnMatch: boolean;
    discrepancies: string[];
  }> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['purchaseOrder', 'purchaseOrder.items', 'purchaseOrder.grns', 'purchaseOrder.grns.items'],
    });

    if (!invoice) throw new BadRequestException('Invoice not found');
    if (!invoice.poId) throw new BadRequestException('Invoice not linked to PO');

    const po = invoice.purchaseOrder;
    const grns = po.grns || [];
    const discrepancies: string[] = [];

    // 1. PO Match: Check invoice total vs PO total
    const poMatch = Math.abs(Number(invoice.total) - Number(po.total)) < 0.01;
    if (!poMatch) {
      discrepancies.push(`Invoice total (${invoice.total}) does not match PO total (${po.total})`);
    }

    // 2. GRN Match: Check quantities received vs invoiced
    let grnMatch = true;
    const totalReceived = grns.reduce((sum, grn) => 
      sum + grn.items.reduce((s, item) => s + Number(item.quantityAccepted), 0), 0
    );
    const totalOrdered = po.items.reduce((sum, item) => sum + Number(item.quantity), 0);

    if (Math.abs(totalReceived - totalOrdered) > 0.01) {
      grnMatch = false;
      discrepancies.push(`Received quantity (${totalReceived}) does not match ordered (${totalOrdered})`);
    }

    // 3. Update invoice match status
    invoice.matchedPo = poMatch;
    invoice.matchedGrn = grnMatch;
    invoice.threeWayMatched = poMatch && grnMatch;
    if (invoice.threeWayMatched) {
      invoice.matchedAt = new Date();
    }
    await this.invoiceRepo.save(invoice);

    return {
      matched: invoice.threeWayMatched,
      poMatch,
      grnMatch,
      discrepancies,
    };
  }

  async getMatchReport(poId: string) {
    const po = await this.poRepo.findOne({
      where: { id: poId },
      relations: ['items', 'grns', 'grns.items', 'vendor'],
    });

    const invoices = await this.invoiceRepo.find({ where: { poId } });

    return {
      po: {
        number: po.poNumber,
        total: po.total,
        items: po.items.map(i => ({
          description: i.description,
          ordered: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
      grns: po.grns.map(g => ({
        number: g.grnNumber,
        receivedAt: g.receivedAt,
        items: g.items.map(i => ({
          description: i.description,
          received: i.quantityReceived,
          accepted: i.quantityAccepted,
          rejected: i.quantityRejected,
        })),
      })),
      invoices: invoices.map(i => ({
        number: i.invoiceNumber,
        total: i.total,
        matched: i.threeWayMatched,
      })),
    };
  }
}