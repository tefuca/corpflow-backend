#!/bin/bash
set -e

echo "=== Fix 1: app.module.ts ==="
sed -i '/import { InventoryModule }/d' src/app.module.ts
sed -i '/import { FixedAssetsModule }/d' src/app.module.ts
sed -i '/import { DocumentModule }/d' src/app.module.ts
sed -i 's/InventoryModule/StockModule/g' src/app.module.ts
sed -i 's/FixedAssetsModule/FixedAssetModule/g' src/app.module.ts
sed -i '/DocumentModule/d' src/app.module.ts

echo "=== Fix 2: Auth import paths in all controllers ==="
for f in src/modules/*/controllers/*.ts; do
  sed -i 's|from '\''\.\./auth/|from '\''\.\./\.\./auth/|g' "$f"
done
for f in src/modules/*/controllers/*.ts; do
  sed -i 's|from '\''\.\./\.\./auth/|from '\''\.\./\.\./\.\./auth/|g' "$f"
done

echo "=== Fix 3: Project controller ==="
cat > src/modules/project/project.controller.ts << 'EOFPC'
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ProjectsService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus, ProjectPriority } from './entities/project.entity';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectsService) {}

  @Post()
  @RequirePermissions(['PROJECT_MANAGEMENT', 'add'])
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectService.create(createProjectDto, userId);
  }

  @Get()
  @RequirePermissions(['PROJECT_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'List all projects' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  @ApiQuery({ name: 'priority', required: false, enum: ProjectPriority })
  @ApiQuery({ name: 'cluster', required: false, type: String })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: ProjectStatus,
    @Query('priority') priority?: ProjectPriority,
    @Query('cluster') cluster?: string,
  ) {
    return this.projectService.findAll(page, limit, search, status, priority, cluster);
  }

  @Get(':id')
  @RequirePermissions(['PROJECT_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(['PROJECT_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @RequirePermissions(['PROJECT_MANAGEMENT', 'delete'])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectService.remove(id, userId);
  }
}
EOFPC

echo "=== Fix 4: Create missing entity stubs ==="

# Agent entities
mkdir -p src/modules/agent/entities
cat > src/modules/agent/entities/agent.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/agent/entities/dap.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('daps')
export class Dap {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) code: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/agent/entities/agent-status-history.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('agent_status_history')
export class AgentStatusHistory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() agentId: string;
  @Column() status: string;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/agent/entities/commission-record.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('commission_records')
export class CommissionRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() agentId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/agent/entities/commission-rate.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('commission_rates')
export class CommissionRate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() agentId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) rate: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/agent/entities/kpi-definition.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('kpi_definitions')
export class KpiDefinition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) type: string;
  @Column({ nullable: true }) targetValue: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/agent/entities/kpi-achievement.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('kpi_achievements')
export class KpiAchievement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() agentId: string;
  @Column() kpiId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) actualValue: number;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/agent/entities/client-billing-record.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Client } from '../../finance/entities/client.entity';
@Entity('client_billing_records')
export class ClientBillingRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() clientId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @CreateDateColumn() createdAt: Date;
  @ManyToOne(() => Client, (client) => client.billingRecords, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;
}
EOFENT

cat > src/modules/agent/entities/agent-document.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('agent_documents')
export class AgentDocument {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() agentId: string;
  @Column() documentType: string;
  @Column() filePath: string;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/agent/entities/training-module.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('training_modules')
export class TrainingModule {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ nullable: true }) description: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/agent/entities/agent-training.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('agent_trainings')
export class AgentTraining {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() agentId: string;
  @Column() moduleId: string;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

# Finance entities
mkdir -p src/modules/finance/entities
cat > src/modules/finance/entities/payment.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('finance_payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/finance/entities/journal-entry.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) reference: string;
  @Column({ nullable: true }) description: string;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/finance/entities/journal-entry-line.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('journal_entry_lines')
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() journalEntryId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) debit: number;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) credit: number;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/finance/entities/gl-account.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('gl_accounts')
export class GlAccount {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() code: string;
  @Column() name: string;
  @Column({ nullable: true }) type: string;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/finance/entities/vendor-invoice.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('vendor_invoices')
export class VendorInvoice {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() vendorId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/finance/entities/client-invoice.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('client_invoices')
export class ClientInvoice {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() clientId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/finance/entities/client.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ClientBillingRecord } from '../../agent/entities/client-billing-record.entity';
@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) email: string;
  @OneToMany(() => ClientBillingRecord, (cbr) => cbr.client)
  billingRecords: ClientBillingRecord[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

# HR entities
mkdir -p src/modules/hr/entities
cat > src/modules/hr/entities/department.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) code: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/hr/entities/job-position.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('job_positions')
export class JobPosition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ nullable: true }) departmentId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/hr/entities/employee.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) departmentId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/hr/entities/timesheet.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('timesheets')
export class Timesheet {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() employeeId: string;
  @Column({ nullable: true }) date: Date;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) hours: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/hr/entities/leave-type.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) maxDays: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/hr/entities/leave-request.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() employeeId: string;
  @Column({ nullable: true }) startDate: Date;
  @Column({ nullable: true }) endDate: Date;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/hr/entities/payroll-run.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('payroll_runs')
export class PayrollRun {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) period: string;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/hr/entities/payroll-detail.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('payroll_details')
export class PayrollDetail {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() payrollRunId: string;
  @Column() employeeId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/hr/entities/performance-review.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('performance_reviews')
export class PerformanceReview {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() employeeId: string;
  @Column({ nullable: true }) reviewDate: Date;
  @Column({ nullable: true }) rating: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

# Fixed Asset entities
mkdir -p src/modules/fixed-asset/entities
cat > src/modules/fixed-asset/entities/asset-category.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('asset_categories')
export class AssetCategory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) code: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/fixed-asset/entities/depreciation-entry.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('depreciation_entries')
export class DepreciationEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() assetId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @Column({ nullable: true }) period: string;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/fixed-asset/entities/maintenance-record.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('maintenance_records')
export class MaintenanceRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() assetId: string;
  @Column({ nullable: true }) description: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) cost: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/fixed-asset/entities/asset-allocation.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('asset_allocations')
export class AssetAllocation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() assetId: string;
  @Column() projectId: string;
  @Column({ nullable: true }) allocationPercentage: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

# Procurement entities
mkdir -p src/modules/procurement/entities
cat > src/modules/procurement/entities/vendor.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) email: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/purchase-requisition.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('purchase_requisitions')
export class PurchaseRequisition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) requestorId: string;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/purchase-order.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() vendorId: string;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/purchase-order-item.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() purchaseOrderId: string;
  @Column({ nullable: true }) itemName: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) quantity: number;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/goods-receipt-note.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('goods_receipt_notes')
export class GoodsReceiptNote {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() purchaseOrderId: string;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/grn-item.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('grn_items')
export class GrnItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() grnId: string;
  @Column({ nullable: true }) itemName: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) quantity: number;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/vendor-invoice.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('procurement_vendor_invoices')
export class VendorInvoice {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() vendorId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/three-way-match.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('three_way_matches')
export class ThreeWayMatch {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() poId: string;
  @Column() grnId: string;
  @Column() invoiceId: string;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/stock-item.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('stock_items')
export class StockItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) sku: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) quantity: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/stock-movement.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() stockItemId: string;
  @Column({ nullable: true }) type: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) quantity: number;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/client-consignment.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('client_consignments')
export class ClientConsignment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() clientId: string;
  @Column({ nullable: true }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/procurement/entities/po-item.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('po_items')
export class PoItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() purchaseOrderId: string;
  @Column({ nullable: true }) itemName: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) quantity: number;
  @CreateDateColumn() createdAt: Date;
}
EOFENT

# Project entities
mkdir -p src/modules/project/entities
cat > src/modules/project/entities/milestone.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() projectId: string;
  @Column() title: string;
  @Column({ nullable: true }) dueDate: Date;
  @Column({ nullable: true }) status: string;
  @ManyToOne(() => Project, (project) => project.milestones, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/project/entities/task.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() projectId: string;
  @Column() title: string;
  @Column({ nullable: true }) status: string;
  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/project/entities/resource-allocation.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
@Entity('resource_allocations')
export class ResourceAllocation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() projectId: string;
  @Column() userId: string;
  @Column({ nullable: true }) allocationPercentage: number;
  @Column({ default: true }) active: boolean;
  @ManyToOne(() => Project, (project) => project.assignments, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/project/entities/time-entry.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
@Entity('time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() projectId: string;
  @Column() userId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) hours: number;
  @ManyToOne(() => Project, (project) => project.timeEntries, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/project/entities/project-expense.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
@Entity('project_expenses')
export class ProjectExpense {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() projectId: string;
  @Column() description: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) amount: number;
  @ManyToOne(() => Project, (project) => project.expenses, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

cat > src/modules/project/entities/project-budget.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
@Entity('project_budgets')
export class ProjectBudget {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() projectId: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) allocated: number;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) spent: number;
  @ManyToOne(() => Project, (project) => project.budgets, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

# Stock entity
mkdir -p src/modules/stock/entities
cat > src/modules/stock/entities/stock-issue.entity.ts << 'EOFENT'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('stock_issues')
export class StockIssue {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() projectId: string;
  @Column({ nullable: true }) itemName: string;
  @Column('decimal', { precision: 18, scale: 2, nullable: true }) quantity: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
EOFENT

echo "=== Fix 5: Add missing properties to existing entities ==="

# Add properties to project.entity.ts
sed -i '/export class Project {/a\  @Column("decimal", { precision: 18, scale: 2, nullable: true })\n  actualCost: number;\n\n  @Column("decimal", { precision: 18, scale: 2, nullable: true })\n  profit: number;\n\n  @Column("decimal", { precision: 18, scale: 2, nullable: true })\n  revenue: number;\n\n  @OneToMany(() => Asset, (asset) => asset.project)\n  assets: Asset[];\n\n  @OneToMany(() => Budget, (budget) => budget.project)\n  budgets: Budget[];\n\n  @OneToMany(() => Activity, (activity) => activity.project)\n  activities: Activity[];\n\n  @OneToMany(() => Payment, (payment) => payment.project)\n  payments: Payment[];\n\n  @OneToMany(() => Milestone, (milestone) => milestone.project)\n  milestones: Milestone[];\n\n  @OneToMany(() => Task, (task) => task.project)\n  tasks: Task[];\n\n  @OneToMany(() => ResourceAllocation, (ra) => ra.project)\n  assignments: ResourceAllocation[];\n\n  @OneToMany(() => TimeEntry, (te) => te.project)\n  timeEntries: TimeEntry[];\n\n  @OneToMany(() => ProjectExpense, (pe) => pe.project)\n  expenses: ProjectExpense[];\n\n  @OneToMany(() => ProjectBudget, (pb) => pb.project)\n  projectBudgets: ProjectBudget[];' src/modules/project/entities/project.entity.ts

# Add project property to asset.entity.ts
sed -i '/export class Asset {/a\  @ManyToOne(() => Project, (project) => project.assets, { nullable: true })\n  project: Project;' src/modules/asset/entities/asset.entity.ts

# Add project property to budget.entity.ts
sed -i '/export class Budget {/a\  @ManyToOne(() => Project, (project) => project.budgets, { nullable: true })\n  project: Project;' src/modules/budget/entities/budget.entity.ts

# Add project property to activity.entity.ts
sed -i '/export class Activity {/a\  @ManyToOne(() => Project, (project) => project.activities, { nullable: true })\n  project: Project;' src/modules/activity/entities/activity.entity.ts

# Add project and execution properties to payment.entity.ts
sed -i '/export class Payment {/a\  @ManyToOne(() => Project, (project) => project.payments, { nullable: true })\n  project: Project;\n\n  @OneToMany(() => Execution, (execution) => execution.payment)\n  executions: Execution[];' src/modules/payment/entities/payment.entity.ts

# Add payment property to execution.entity.ts
sed -i '/export class Execution {/a\  @ManyToOne(() => Payment, (payment) => payment.executions, { nullable: true })\n  payment: Payment;' src/modules/execution/entities/execution.entity.ts

echo "=== Fix 6: Create missing DTOs ==="
mkdir -p src/modules/agent/dto
cat > src/modules/agent/dto/dap.dto.ts << 'EOFDTO'
export class CreateDapDto {
  name: string;
  code?: string;
}
export class UpdateDapDto {
  name?: string;
  code?: string;
}
EOFDTO

cat > src/modules/agent/dto/create-training-module.dto.ts << 'EOFDTO'
export class CreateTrainingModuleDto {
  title: string;
  description?: string;
}
EOFDTO

cat > src/modules/agent/dto/update-training-module.dto.ts << 'EOFDTO'
export class UpdateTrainingModuleDto {
  title?: string;
  description?: string;
}
EOFDTO

echo "=== Fix 7: Create missing services/controllers ==="
mkdir -p src/modules/finance
mkdir -p src/modules/procurement

cat > src/modules/finance/finance.controller.ts << 'EOFCNT'
import { Controller } from '@nestjs/common';
@Controller('finance')
export class FinanceController {}
EOFCNT

cat > src/modules/finance/finance.service.ts << 'EOFSRV'
import { Injectable } from '@nestjs/common';
@Injectable()
export class FinanceService {}
EOFSRV

cat > src/modules/procurement/procurement.controller.ts << 'EOFCNT'
import { Controller } from '@nestjs/common';
@Controller('procurement')
export class ProcurementController {}
EOFCNT

cat > src/modules/procurement/procurement.service.ts << 'EOFSRV'
import { Injectable } from '@nestjs/common';
@Injectable()
export class ProcurementService {}
EOFSRV

echo "=== Fix 8: Create common enums ==="
mkdir -p src/common/enums
cat > src/common/enums/index.ts << 'EOFENUM'
export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
}

export enum KpiType {
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
  QUALITY = 'QUALITY',
}

export enum PaymentFlowType {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum GlAccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DECLINING_BALANCE = 'DECLINING_BALANCE',
}
EOFENUM

echo "=== Fix 9: Fix seed.ts ==="
if [ -f "seed.ts" ]; then
  sed -i 's|from '\''\./src/modules/rbac/services/seed\.service'\''|from '\''\./modules/rbac/services/seed.service'\''|g' seed.ts
  sed -i 's|from '\''\./src/app\.module'\''|from '\''\./app.module'\''|g' seed.ts
fi
if [ -f "src/seed.ts" ]; then
  sed -i 's|from '\''\./src/modules/rbac/services/seed\.service'\''|from '\''\./modules/rbac/services/seed.service'\''|g' src/seed.ts
  sed -i 's|from '\''\./src/app\.module'\''|from '\''\./app.module'\''|g' src/seed.ts
fi

echo "=== Fix 10: Add methods to TrainingModuleService ==="
cat > src/modules/agent/services/training-module.service.ts << 'EOFSRV'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingModule } from '../entities/training-module.entity';
import { AgentTraining } from '../entities/agent-training.entity';

@Injectable()
export class TrainingModuleService {
  constructor(
    @InjectRepository(TrainingModule)
    private readonly moduleRepo: Repository<TrainingModule>,
    @InjectRepository(AgentTraining)
    private readonly agentTrainingRepo: Repository<AgentTraining>,
  ) {}

  async create(dto: any) {
    const mod = this.moduleRepo.create(dto);
    return this.moduleRepo.save(mod);
  }

  async findAll() {
    return this.moduleRepo.find();
  }

  async findOne(id: string) {
    return this.moduleRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: any) {
    await this.moduleRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.moduleRepo.delete(id);
  }
}
EOFSRV

echo "=== Fix 11: Fix commission-rate and kpi-definition controllers ==="
# These use number IDs but services likely expect strings - change ParseIntPipe to ParseUUIDPipe
sed -i 's/ParseIntPipe/ParseUUIDPipe/g' src/modules/agent/controllers/commission-rate.controller.ts
sed -i 's/ParseIntPipe/ParseUUIDPipe/g' src/modules/agent/controllers/kpi-definition.controller.ts
sed -i 's/id: number/id: string/g' src/modules/agent/controllers/commission-rate.controller.ts
sed -i 's/id: number/id: string/g' src/modules/agent/controllers/kpi-definition.controller.ts

echo "=== Done! Run: npx tsc --noEmit ==="
