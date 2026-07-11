import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CamasPatient } from './patient.entity';

/**
 * Espejo de solo lectura de `sv_healthcare_provider` (Gestor de Camas).
 * Solo se mapean las columnas que Hemodinamia consume (nombre de la obra social).
 */
@Entity('sv_healthcare_provider')
export class CamasHealthcareProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => CamasPatient, (p) => p.healthcare_provider)
  patients: CamasPatient[];
}
