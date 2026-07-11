import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CamasPatient } from './patient.entity';
import { CamasBed } from './bed.entity';
import { CamasDischarge } from './discharge.entity';
import { CamasBedAdmission } from './bed-admission.entity';

/**
 * Espejo de solo lectura de `sv_admision` (Gestor de Camas).
 * Una internación se considera finalizada si tiene un alta (`discharge`) asociada.
 */
@Entity('sv_admision')
export class CamasAdmision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CamasPatient, (p) => p.admisions)
  @JoinColumn({ name: 'id_patient' })
  patient: CamasPatient;

  @Column({ type: 'timestamp', nullable: true })
  entry_time: Date;

  @OneToOne(() => CamasBed, { nullable: true })
  @JoinColumn({ name: 'id_bed' })
  bed: CamasBed | null;

  @OneToOne(() => CamasDischarge, { nullable: true })
  @JoinColumn({ name: 'discharge_id' })
  discharge: CamasDischarge | null;

  @OneToMany(() => CamasBedAdmission, (b) => b.admision)
  bedAdmissions: CamasBedAdmission[];
}
