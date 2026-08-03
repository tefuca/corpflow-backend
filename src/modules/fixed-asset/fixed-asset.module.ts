import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { FixedAssetController } from './fixed-asset.controller';
import { FixedAssetService } from './fixed-asset.service';
import { FixedAsset } from './entities/fixed-asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FixedAsset]),
    RbacModule,
  ],
  controllers: [FixedAssetController],
  providers: [FixedAssetService],
})
export class FixedAssetModule {}