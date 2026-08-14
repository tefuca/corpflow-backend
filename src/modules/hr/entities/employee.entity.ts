import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('employees')
export class Employee { @PrimaryGeneratedColumn('uuid') id: string; @Column() fullName: string; }
