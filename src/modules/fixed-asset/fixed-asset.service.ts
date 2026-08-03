import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { FixedAsset } from './entities/fixed-asset.entity';
import { CreateFixedAssetDto } from './dto/create-fixed-asset.dto';
import { UpdateFixedAssetDto } from './dto/update-fixed-asset.dto';
import { QueryFixedAssetDto } from './dto/query-fixed-asset.dto';
import {
  FixedAssetResponseDto,
  PaginatedFixedAssetResponseDto,
} from './dto/fixed-asset-response.dto';

@Injectable()
export class FixedAssetService {
  constructor(
    @InjectRepository(FixedAsset)
    private readonly fixedAssetRepo: Repository<FixedAsset>,
  ) {}

  async create(
    dto: CreateFixedAssetDto,
    userId: string,
  ): Promise<FixedAssetResponseDto> {
    const existing = await this.fixedAssetRepo.findOne({
      where: { assetCode: dto.assetCode },
    });
    if (existing) {
      throw new ConflictException(
        `Asset code "${dto.assetCode}" already exists`,
      );
    }

    const entity = this.fixedAssetRepo.create({
      ...dto,
      currentValue: dto.currentValue ?? dto.purchaseCost ?? 0,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.fixedAssetRepo.save(entity);
    return FixedAssetResponseDto.fromEntity(saved);
  }

  async findAll(
    query: QueryFixedAssetDto,
  ): Promise<PaginatedFixedAssetResponseDto> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      assetCode,
      category,
      department,
      status,
      purchaseDateFrom,
      purchaseDateTo,
      location,
      assignedTo,
    } = query;

    const qb = this.fixedAssetRepo.createQueryBuilder('asset');

    if (search) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('asset.assetName LIKE :search', { search: `%${search}%` })
            .orWhere('asset.assetCode LIKE :search', { search: `%${search}%` })
            .orWhere('asset.category LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (assetCode) {
      qb.andWhere('asset.assetCode = :assetCode', { assetCode });
    }
    if (category) {
      qb.andWhere('asset.category = :category', { category });
    }
    if (department) {
      qb.andWhere('asset.department = :department', { department });
    }
    if (status) {
      qb.andWhere('asset.status = :status', { status });
    }
    if (purchaseDateFrom) {
      qb.andWhere('asset.purchaseDate >= :purchaseDateFrom', { purchaseDateFrom });
    }
    if (purchaseDateTo) {
      qb.andWhere('asset.purchaseDate <= :purchaseDateTo', { purchaseDateTo });
    }
    if (location) {
      qb.andWhere('asset.location = :location', { location });
    }
    if (assignedTo) {
      qb.andWhere('asset.assignedTo = :assignedTo', { assignedTo });
    }

    qb.orderBy(`asset.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return PaginatedFixedAssetResponseDto.create(entities, total, page, limit);
  }

  async findOne(id: string): Promise<FixedAssetResponseDto> {
    const entity = await this.fixedAssetRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Fixed asset with ID "${id}" not found`);
    }
    return FixedAssetResponseDto.fromEntity(entity);
  }

  async findByAssetCode(assetCode: string): Promise<FixedAssetResponseDto> {
    const entity = await this.fixedAssetRepo.findOne({ where: { assetCode } });
    if (!entity) {
      throw new NotFoundException(
        `Fixed asset with code "${assetCode}" not found`,
      );
    }
    return FixedAssetResponseDto.fromEntity(entity);
  }

  async update(
    id: string,
    dto: UpdateFixedAssetDto,
    userId: string,
  ): Promise<FixedAssetResponseDto> {
    const entity = await this.fixedAssetRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Fixed asset with ID "${id}" not found`);
    }

    if (dto.assetCode && dto.assetCode !== entity.assetCode) {
      const existing = await this.fixedAssetRepo.findOne({
        where: { assetCode: dto.assetCode },
      });
      if (existing) {
        throw new ConflictException(
          `Asset code "${dto.assetCode}" already exists`,
        );
      }
    }

    Object.assign(entity, dto, { updatedBy: userId });
    const saved = await this.fixedAssetRepo.save(entity);
    return FixedAssetResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.fixedAssetRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Fixed asset with ID "${id}" not found`);
    }
  }
}