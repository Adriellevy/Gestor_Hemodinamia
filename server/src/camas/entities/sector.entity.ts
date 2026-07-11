import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Espejo de solo lectura de `sv_sector` (Gestor de Camas).
 * Se usa para resolver el sector/servicio de una internación.
 */
@Entity('sv_sector')
export class CamasSector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  name: string;
}
