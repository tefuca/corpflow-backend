import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('grn_items')
export class GrnItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  grnId: string;

  @ManyToOne(() => 'Grn' as any, (g: any) => g.items)
  grn: any;
}