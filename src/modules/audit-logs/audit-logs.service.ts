import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  action: AuditAction;
  entityType: string;
  entityId: string;
  description: string;
  performedById: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(logData: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      ...logData,
      user: logData.performedById,
      action: logData.action,
      type: logData.entityType,
      details: logData.description,
    });
    return this.auditLogRepository.save(log);
  }

  async findAll(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}