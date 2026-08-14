import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../payment/entities/payment.entity';
import { RbacModule } from '../rbac/rbac.module';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { UnifiedPaymentService } from './services/unified-payment.service';

import { Client } from './entities/client.entity';
import { ChartOfAccount } from './entities/chart-of-account.entity';
import { GlJournalEntry } from './entities/gl-journal-entry.entity';
import { GlJournalLine } from './entities/gl-journal-line.entity';
import { ClientInvoice } from './entities/client-invoice.entity';
import { ClientInvoiceLine } from './entities/client-invoice-line.entity';
import { ClientPayment } from './entities/client-payment.entity';
import { AccountsPayable } from './entities/accounts-payable.entity';
import { PaymentVoucher } from './entities/payment-voucher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
	  Payment,
      Client, ChartOfAccount, GlJournalEntry, GlJournalLine,
      ClientInvoice, ClientInvoiceLine, ClientPayment,
      AccountsPayable, PaymentVoucher,
    ]),
    RbacModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService, UnifiedPaymentService],
  exports: [FinanceService, UnifiedPaymentService],
})
export class FinanceModule {}
