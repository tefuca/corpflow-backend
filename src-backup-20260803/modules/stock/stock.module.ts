import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module'; // <-- FIXED PATH
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { StockItem } from './entities/stock-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockItem]),
    RbacModule,
  ],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}