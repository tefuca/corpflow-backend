import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { ProcurementController } from './procurement.controller';
import { ProcurementService } from './procurement.service';
import { ThreeWayMatchService } from './services/three-way-match.service';

import { Vendor } from './entities/vendor.entity';
import { PurchaseRequisition } from './entities/purchase-requisition.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { GoodsReceiptNote } from './entities/goods-receipt-note.entity';
import { GrnItem } from './entities/grn-item.entity';
import { VendorInvoice } from './entities/vendor-invoice.entity';
import { ThreeWayMatch } from './entities/three-way-match.entity';
import { StockItem } from './entities/stock-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { ClientConsignment } from './entities/client-consignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor, PurchaseRequisition, PurchaseOrder, PurchaseOrderItem,
      GoodsReceiptNote, GrnItem, VendorInvoice, ThreeWayMatch,
      StockItem, StockMovement, ClientConsignment,
    ]),
    RbacModule,
  ],
  controllers: [ProcurementController],
  providers: [ProcurementService, ThreeWayMatchService],
  exports: [ProcurementService, ThreeWayMatchService],
})
export class ProcurementModule {}
