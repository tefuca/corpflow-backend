import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MasterDataService } from './master-data.service';
import { MasterDataController } from './master-data.controller';

@Module({
	imports: [
	  AuthModule,
	], 
  providers: [MasterDataService],
  controllers: [MasterDataController],
})
export class MasterDataModule {}