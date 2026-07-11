import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CamasBed } from './bed.entity';
import { CamasAdmision } from './admision.entity';

/**
 * Espejo de solo lectura de `sv_bed_admission` (Gestor de Camas).
 * La bed-admission activa (sin `end_date`) determina la cama/sector actual
 * de una internación.
 */
@Entity('sv_bed_admission')
export class CamasBedAdmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CamasBed, { nullable: false })
  @JoinColumn({ name: 'bed_id' })
  bed: CamasBed;

  @ManyToOne(() => CamasAdmision, (ad) => ad.bedAdmissions, { nullable: false })
  @JoinColumn({ name: 'admission_entity' })
  admision: CamasAdmision;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date?: Date;
}
