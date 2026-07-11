import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CamasHealthcareProvider } from './healthcare-provider.entity';
import { CamasAdmision } from './admision.entity';

/**
 * Espejo de solo lectura de `sv_patient` (Gestor de Camas).
 * `document_type` en Camas es un enum ('dni' | 'passport'); se mapea como string.
 */
@Entity('sv_patient')
export class CamasPatient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  document_type: string;

  @Column()
  document_number: string;

  @Column()
  fullname: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column()
  gender: string;

  @Column({ nullable: true })
  hc_number: string;

  @ManyToOne(() => CamasHealthcareProvider, (h) => h.patients, {
    nullable: true,
  })
  @JoinColumn({ name: 'healthcare_provider_id' })
  healthcare_provider: CamasHealthcareProvider | null;

  @OneToMany(() => CamasAdmision, (a) => a.patient)
  admisions: CamasAdmision[];
}
