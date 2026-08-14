import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentController } from './controllers/agent.controller';
import { DapController } from './controllers/dap.controller';
import { CommissionRateController } from './controllers/commission-rate.controller';
import { KpiDefinitionController } from './controllers/kpi-definition.controller';
import { TrainingModuleController } from './controllers/training-module.controller';
import { AgentService } from './services/agent.service';
import { DapService } from './services/dap.service';
import { CommissionEngineService } from './services/commission-engine.service';
import { ClientBillingService } from './services/client-billing.service';
import { CommissionRateService } from './services/commission-rate.service';
import { KpiDefinitionService } from './services/kpi-definition.service';
import { TrainingModuleService } from './services/training-module.service';

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
  ],
  controllers: [
    AgentController,
    DapController,
    CommissionRateController,
    KpiDefinitionController,
    TrainingModuleController,
  ],
  providers: [
    AgentService,
    DapService,
    CommissionEngineService,
    ClientBillingService,
    CommissionRateService,
    KpiDefinitionService,
    TrainingModuleService,
  ],
  exports: [
    AgentService,
    CommissionEngineService,
    ClientBillingService,
  ],
})
export class AgentModule {}
