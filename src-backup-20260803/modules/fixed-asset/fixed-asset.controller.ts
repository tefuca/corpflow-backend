import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { FixedAssetService } from './fixed-asset.service';
import { CreateFixedAssetDto } from './dto/create-fixed-asset.dto';
import { UpdateFixedAssetDto } from './dto/update-fixed-asset.dto';
import { QueryFixedAssetDto } from './dto/query-fixed-asset.dto';

@ApiTags('FixedAsset')
@Controller('fixed-assets')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class FixedAssetController {
  constructor(private readonly fixedAssetService: FixedAssetService) {}

  @Get()
  @RequirePermissions(['FIXED_ASSET_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get all fixed assets' })
  async findAll(@Query() query: QueryFixedAssetDto) {
    return this.fixedAssetService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(['FIXED_ASSET_MANAGEMENT', 'view'])
  @ApiOperation({ summary: 'Get fixed asset by ID' })
  async findOne(@Param('id') id: string) {
    return this.fixedAssetService.findOne(id);
  }

  @Post()
  @RequirePermissions(['FIXED_ASSET_MANAGEMENT', 'add'])
  @ApiOperation({ summary: 'Create fixed asset' })
  async create(
    @Body() dto: CreateFixedAssetDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.fixedAssetService.create(dto, userId);
  }

  @Put(':id')
  @RequirePermissions(['FIXED_ASSET_MANAGEMENT', 'edit'])
  @ApiOperation({ summary: 'Update fixed asset' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFixedAssetDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.fixedAssetService.update(id, dto, userId);
  }

  @Delete(':id')
  @RequirePermissions(['FIXED_ASSET_MANAGEMENT', 'delete'])
  @ApiOperation({ summary: 'Delete fixed asset' })
  async remove(@Param('id') id: string) {
    await this.fixedAssetService.remove(id);
    return { message: 'Fixed asset deleted' };
  }
}