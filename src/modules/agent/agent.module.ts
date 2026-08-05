import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { Agent } from './entities/agent.entity';
import { Dap } from './entities/dap.entity';
import { AgentStatusHistory } from './entities/agent-status-history.entity';
import { CommissionRecord } from './entities/commission-record.entity';
import { CommissionRate } from './entities/commission-rate.entity';
import { KpiDefinition } from './entities/kpi-definition.entity';
import { KpiAchievement } from './entities/kpi-achievement.entity';
import { ClientBillingRecord } from './entities/client-billing-record.entity';
import { AgentDocument } from './entities/agent-document.entity';
import { TrainingModule } from './entities/training-module.entity';
import { AgentTraining } from './entities/agent-training.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agent, Dap, AgentStatusHistory, CommissionRecord,
      CommissionRate, KpiDefinition, KpiAchievement,
      ClientBillingRecord, AgentDocument, TrainingModule, AgentTraining,
    ]),
    RbacModule,
  ],
  controllers: [AgentController],
  CommissionController],
  providers: [AgentService,
  CommissionEngineService, 
 ClientKpiBillingService,
  exports: [AgentService],
})
export class AgentModule {}
