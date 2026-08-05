import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum DocumentEntityType {
  AGENT = 'AGENT',
  DAP = 'DAP',
  PROJECT = 'PROJECT',
  PROCUREMENT = 'PROCUREMENT',
  ASSET = 'ASSET',
  EMPLOYEE = 'EMPLOYEE',
  PAYMENT = 'PAYMENT',
  INVOICE = 'INVOICE',
}

@Entity('documents')
export class Document extends BaseEntity {
  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: number;

  @Column({ name: 'document_name', length: 200 })
  documentName: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number | null;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'is_latest', type: 'boolean', default: true })
  isLatest: boolean;

  @Column({ name: 'previous_version_id', nullable: true })
  previousVersionId: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
