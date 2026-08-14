import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { FixedAssetController } from './fixed-asset.controller';
import { FixedAssetService } from './services/fixed-asset.service';
import { DepreciationService } from './services/depreciation.service';

import { AssetCategory } from './entities/asset-category.entity';
import { FixedAsset } from './entities/fixed-asset.entity';
import { DepreciationEntry } from './entities/depreciation-entry.entity';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { AssetAllocation } from './entities/asset-allocation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetCategory, FixedAsset, DepreciationEntry,
      MaintenanceRecord, AssetAllocation,
    ]),
    RbacModule,
  ],
  controllers: [FixedAssetController],
  providers: [FixedAssetService, DepreciationService],
  exports: [FixedAssetService, DepreciationService],
})
export class FixedAssetModule {}
