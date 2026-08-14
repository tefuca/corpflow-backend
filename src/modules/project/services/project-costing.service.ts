// In src/modules/project/services/project-costing.service.ts
// If StockMovement and AssetAllocation don't exist yet, use these stubs:

// OPTION A: Comment out the imports and related code temporarily
// OPTION B: Create stub entities

// For now, here's a version that handles missing entities gracefully:

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Timesheet } from '../../timesheet/entities/timesheet.entity';

// Stub interfaces if entities don't exist yet
interface StockMovement {
  id: string;
  projectId: string;
  type: string;
  totalCost: number;
}

interface AssetAllocation {
  id: string;
  projectId: string;
  cost: number;
}

@Injectable()
export class ProjectCostingService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Timesheet)
    private timesheetRepo: Repository<Timesheet>,
  ) {}

  async getProjectCostBreakdown(projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // ── Labor Cost ──
    const timeEntries = await this.timesheetRepo.find({
      where: { projectId, approved: true },
    });
    const laborCost = timeEntries.reduce(
      (sum, te) =>
        sum + Number(te.totalCost || te.hours * (te.hourlyRate || 0)),
      0,
    );

    // TODO: Add material and asset costs when StockMovement & AssetAllocation modules exist
    const materialCost = 0;
    const assetCost = 0;

    const totalCost = laborCost + materialCost + assetCost;

    return {
      projectId,
      laborCost,
      materialCost,
      assetCost,
      totalCost,
      budget: project.budget,
      variance: project.budget - totalCost,
    };
  }
}
