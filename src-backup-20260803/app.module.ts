import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Auth
import { User } from './modules/auth/entities/user.entity';
import { Role } from './modules/auth/entities/role.entity';
import { SystemFunction } from './modules/auth/entities/system-function.entity';
import { RolePermission } from './modules/auth/entities/role-permission.entity';

// Procurement
import { Vendor } from './modules/procurement/entities/vendor.entity';
import { Requisition } from './modules/procurement/entities/requisition.entity';
import { RequisitionItem } from './modules/procurement/entities/requisition-item.entity';
import { PurchaseOrder } from './modules/procurement/entities/purchase-order.entity';
import { PoItem } from './modules/procurement/entities/po-item.entity';
import { GoodsReceiptNote } from './modules/procurement/entities/goods-receipt-note.entity';
import { GrnItem } from './modules/procurement/entities/grn-item.entity';

// Inventory
import { StockItem } from './modules/inventory/entities/stock-item.entity';
import { StockMovement } from './modules/inventory/entities/stock-movement.entity';
import { StockIssue } from './modules/inventory/entities/stock-issue.entity';

// Fixed Assets
import { Asset } from './modules/fixed-assets/entities/asset.entity';
import { AssetAllocation } from './modules/fixed-assets/entities/asset-allocation.entity';
import { MaintenanceRecord } from './modules/fixed-assets/entities/maintenance-record.entity';
import { DepreciationEntry } from './modules/fixed-assets/entities/depreciation-entry.entity';

// HR
import { Employee } from './modules/hr/entities/employee.entity';
import { TimeEntry } from './modules/hr/entities/time-entry.entity';
import { LeaveRequest } from './modules/hr/entities/leave-request.entity';
import { PayrollRun } from './modules/hr/entities/payroll-run.entity';
import { PerformanceReview } from './modules/hr/entities/performance-review.entity';

// Project
import { Client } from './modules/project/entities/client.entity';
import { Project } from './modules/project/entities/project.entity';
import { Task } from './modules/project/entities/task.entity';
import { Milestone } from './modules/project/entities/milestone.entity';
import { ProjectAssignment } from './modules/project/entities/project-assignment.entity';
import { ProjectExpense } from './modules/project/entities/project-expense.entity';

// Agent
import { Dap } from './modules/agent/entities/dap.entity';
import { Agent } from './modules/agent/entities/agent.entity';
import { AgentStatusHistory } from './modules/agent/entities/agent-status-history.entity';
import { AgentDocument } from './modules/agent/entities/agent-document.entity';
import { CommissionRecord } from './modules/agent/entities/commission-record.entity';
import { KpiDefinition } from './modules/agent/entities/kpi-definition.entity';
import { KpiAchievement } from './modules/agent/entities/kpi-achievement.entity';

// Finance
import { GlAccount } from './modules/finance/entities/gl-account.entity';
import { JournalEntry } from './modules/finance/entities/journal-entry.entity';
import { JournalEntryLine } from './modules/finance/entities/journal-entry-line.entity';
import { VendorInvoice } from './modules/finance/entities/vendor-invoice.entity';
import { ClientInvoice } from './modules/finance/entities/client-invoice.entity';
import { Payment } from './modules/finance/entities/payment.entity';
import { Budget } from './modules/finance/entities/budget.entity';

// Services
import { CommissionEngineService } from './modules/agent/services/commission-engine.service';
import { UnifiedPaymentService } from './modules/finance/services/unified-payment.service';
import { ThreeWayMatchService } from './modules/procurement/services/three-way-match.service';
import { ClientKpiBillingService } from './modules/agent/services/client-kpi-billing.service';
import { ProjectCostingService } from './modules/project/services/project-costing.service';
import { DepreciationService } from './modules/fixed-assets/services/depreciation.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crms_db',
      entities: [
        User, Role, SystemFunction, RolePermission,
        Vendor, Requisition, RequisitionItem, PurchaseOrder, PoItem, GoodsReceiptNote, GrnItem,
        StockItem, StockMovement, StockIssue,
        Asset, AssetAllocation, MaintenanceRecord, DepreciationEntry,
        Employee, TimeEntry, LeaveRequest, PayrollRun, PerformanceReview,
        Client, Project, Task, Milestone, ProjectAssignment, ProjectExpense,
        Dap, Agent, AgentStatusHistory, AgentDocument, CommissionRecord, KpiDefinition, KpiAchievement,
        GlAccount, JournalEntry, JournalEntryLine, VendorInvoice, ClientInvoice, Payment, Budget,
      ],
      synchronize: true, // Set to false in production, use migrations
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([
      User, Role, SystemFunction, RolePermission,
      Vendor, Requisition, RequisitionItem, PurchaseOrder, PoItem, GoodsReceiptNote, GrnItem,
      StockItem, StockMovement, StockIssue,
      Asset, AssetAllocation, MaintenanceRecord, DepreciationEntry,
      Employee, TimeEntry, LeaveRequest, PayrollRun, PerformanceReview,
      Client, Project, Task, Milestone, ProjectAssignment, ProjectExpense,
      Dap, Agent, AgentStatusHistory, AgentDocument, CommissionRecord, KpiDefinition, KpiAchievement,
      GlAccount, JournalEntry, JournalEntryLine, VendorInvoice, ClientInvoice, Payment, Budget,
    ]),
  ],
  providers: [
    CommissionEngineService,
    UnifiedPaymentService,
    ThreeWayMatchService,
    ClientKpiBillingService,
    ProjectCostingService,
    DepreciationService,
  ],
})
export class AppModule {}