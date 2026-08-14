import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsPayable } from '../../finance/entities/accounts-payable.entity';

@Injectable()
export class ThreeWayMatchService {
  constructor(
    @InjectRepository(AccountsPayable)
    private invoiceRepo: Repository<AccountsPayable>,
  ) {}

  async performMatch(invoiceId: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
    });
    if (!invoice) throw new BadRequestException('Invoice not found');

    if (!invoice.poId) throw new BadRequestException('Invoice not linked to PO');

    // Fetch PO (stub - replace with actual PO service/repo when available)
    const po = { total: 0 } as any; // TODO: fetch from PurchaseOrder repo

    const discrepancies: string[] = [];

    const poMatch = Math.abs(Number(invoice.total) - Number(po.total)) < 0.01;
    if (!poMatch) {
      discrepancies.push(`Invoice total (${invoice.total}) does not match PO total (${po.total})`);
    }

    // GRN check (stub)
    const grnMatch = true; // TODO: implement GRN matching

    invoice.matchedPo = poMatch;
    invoice.matchedGrn = grnMatch;
    invoice.threeWayMatched = poMatch && grnMatch;
    if (invoice.threeWayMatched) {
      invoice.matchedAt = new Date();
    }

    await this.invoiceRepo.save(invoice);

    return {
      invoiceId,
      matched: invoice.threeWayMatched,
      discrepancies,
    };
  }

  async getPendingInvoices(poId?: string) {
    const where: any = { threeWayMatched: false };
    if (poId) where.poId = poId;

    const invoices = await this.invoiceRepo.find({ where });

    return invoices.map((i) => ({
      id: i.id,
      number: i.invoiceNumber,
      total: i.total,
      matched: i.threeWayMatched,
    }));
  }
}
