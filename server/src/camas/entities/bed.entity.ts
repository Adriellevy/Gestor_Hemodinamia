import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CamasSector } from './sector.entity';

/**
 * Espejo de solo lectura de `sv_bed` (Gestor de Camas).
 * `code` es la identificación de la cama; `location` apunta al sector.
 */
@Entity('sv_bed')
export class CamasBed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @ManyToOne(() => CamasSector, { nullable: true })
  @JoinColumn({ name: 'sector_id' })
  location: CamasSector | null;
}
