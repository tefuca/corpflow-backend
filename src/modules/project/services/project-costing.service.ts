import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { TimeEntry } from '../../hr/entities/time-entry.entity';
import { ProjectExpense } from '../entities/project-expense.entity';
import { StockIssue } from '../../inventory/entities/stock-issue.entity';
import { AssetAllocation } from '../../fixed-assets/entities/asset-allocation.entity';
import { CommissionRecord } from '../../agent/entities/commission-record.entity';

@Injectable()
export class ProjectCostingService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(TimeEntry)
    private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(ProjectExpense)
    private expenseRepo: Repository<ProjectExpense>,
    @InjectRepository(StockIssue)
    private stockIssueRepo: Repository<StockIssue>,
    @InjectRepository(AssetAllocation)
    private assetAllocRepo: Repository<AssetAllocation>,
    @InjectRepository(CommissionRecord)
    private commissionRepo: Repository<CommissionRecord>,
  ) {}

  /**
   * FRS 6.3 / FN-008: Project cost allocation and profitability
   */
  async calculateProjectCosts(projectId: string) {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });

    // 1. Labor costs from time entries
    const timeEntries = await this.timeEntryRepo.find({
      where: { projectId, approved: true },
    });
    const laborCost = timeEntries.reduce((sum, te) => sum + Number(te.totalCost || te.hours * (te.hourlyRate || 0)), 0);

    // 2. Expenses
    const expenses = await this.expenseRepo.find({
      where: { projectId, approved: true },
    });
    const expenseCost = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 3. Stock/material costs
    const stockIssues = await this.stockIssueRepo.find({ where: { projectId } });
    const materialCost = stockIssues.reduce((sum, s) => sum + Number(s.cost), 0);

    // 4. Asset allocation costs
    const assetAllocs = await this.assetAllocRepo.find({
      where: { projectId, active: true },
    });
    const assetCost = assetAllocs.reduce((sum, a) => sum + Number(a.actualUsageHours) * 10, 0); // Simplified rate

    // 5. DAP commissions for project-specific agents
    const commissions = await this.commissionRepo.find({ where: { projectId } });
    const commissionCost = commissions.reduce((sum, c) => sum + Number(c.amount), 0);

    // 6. Logistics cost allocation (from PO freight/clearing)
    // Simplified - in real system, allocate based on weight/volume

    const totalCost = laborCost + expenseCost + materialCost + assetCost + commissionCost;

    // Update project
    project.actualCost = totalCost;
    project.profit = Number(project.revenue) - totalCost;
    await this.projectRepo.save(project);

    return {
      projectId,
      laborCost,
      expenseCost,
      materialCost,
      assetCost,
      commissionCost,
      totalCost,
      revenue: project.revenue,
      profit: project.profit,
      profitMargin: project.revenue > 0 ? (project.profit / project.revenue) * 100 : 0,
    };
  }

  /**
   * FRS 6.4 / R6: Reconciliation & Over-booking Alert
   */
  async checkResourceOverbooking(projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['assignments', 'assignments.user'],
    });

    const alerts = [];
    for (const assignment of project.assignments) {
      if (!assignment.active) continue;

      // Get all active assignments for this user across ALL projects
      const allAssignments = await this.projectRepo.manager.find('ProjectAssignment', {
        where: { userId: assignment.userId, active: true },
      });

      const totalAllocation = allAssignments.reduce((sum, a) => sum + Number(a.allocationPercentage), 0);

      if (totalAllocation > 100) {
        alerts.push({
          userId: assignment.userId,
          userName: assignment.user?.fullName,
          totalAllocation,
          overbookedBy: totalAllocation - 100,
        });
      }
    }

    return { projectId, alerts, hasOverbooking: alerts.length > 0 };
  }
}