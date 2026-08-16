import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { StockService } from '../services/stock.service';
import { CreateStockItemDto } from '../dto/create-stock-item.dto';
import { UpdateStockItemDto } from '../dto/update-stock-item.dto';
import { StockResponseDto } from '../dto/stock-response.dto';

@ApiTags('Stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock items' })
  @ApiResponse({ status: 200, description: 'List of stock items', type: [StockResponseDto] })
  @RequirePermissions('STOCK', 'view')
  async findAll() {
    return this.stockService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock item by ID' })
  @ApiResponse({ status: 200, description: 'Stock item found', type: StockResponseDto })
  @ApiResponse({ status: 404, description: 'Stock item not found' })
  @RequirePermissions('STOCK', 'view')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new stock item' })
  @ApiResponse({ status: 201, description: 'Stock item created', type: StockResponseDto })
  @RequirePermissions('STOCK', 'add')
  async create(@Body() dto: CreateStockItemDto, @Request() req) {
    return this.stockService.create(dto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stock item' })
  @ApiResponse({ status: 200, description: 'Stock item updated', type: StockResponseDto })
  @ApiResponse({ status: 404, description: 'Stock item not found' })
  @RequirePermissions('STOCK', 'edit')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockItemDto,
    @Request() req,
  ) {
    return this.stockService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete stock item (soft delete)' })
  @ApiResponse({ status: 200, description: 'Stock item deleted' })
  @ApiResponse({ status: 404, description: 'Stock item not found' })
  @RequirePermissions('STOCK', 'delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.stockService.remove(id);
    return { success: true, message: 'Stock item deleted successfully' };
  }
}
