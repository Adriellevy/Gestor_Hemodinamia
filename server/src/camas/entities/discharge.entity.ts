import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Espejo de solo lectura de `sv_discharges` (Gestor de Camas).
 * La presencia de un alta con fecha de egreso marca la internación como finalizada.
 */
@Entity('sv_discharges')
export class CamasDischarge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: true })
  departure_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  institutional_discharge_date: Date;
}
