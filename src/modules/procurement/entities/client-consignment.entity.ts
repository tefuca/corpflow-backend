import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('client_consignments')
export class ClientConsignment { @PrimaryGeneratedColumn('uuid') id: string; @Column() clientId: string; }
