import { DataSource } from 'typeorm';
import { CAMAS_ENTITIES } from '../src/camas/entities';
import { CamasHealthcareProvider } from '../src/camas/entities/healthcare-provider.entity';
import { CamasSector } from '../src/camas/entities/sector.entity';
import { CamasBed } from '../src/camas/entities/bed.entity';
import { CamasPatient } from '../src/camas/entities/patient.entity';
import { CamasAdmision } from '../src/camas/entities/admision.entity';
import { CamasDischarge } from '../src/camas/entities/discharge.entity';
import { CamasBedAdmission } from '../src/camas/entities/bed-admission.entity';

function testDataSource(synchronize: boolean, dropSchema = false): DataSource {
  return new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '3309'),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize,
    dropSchema,
    entities: CAMAS_ENTITIES,
  });
}

export interface SeededIds {
  admMartaId: string;
  admHectorId: string;
}

const days = (n: number) => new Date(Date.now() - n * 86400000);

/**
 * Reconstruye la BD de test con el esquema subset (desde las entidades espejo)
 * y datos conocidos:
 *  - Marta Gonzalez: internación ACTIVA en cama "UCO 2" (sector UCO), obra OSDE.
 *  - Hector Ramirez: internación con ALTA (dada de baja), obra PAMI.
 */
export async function seedCamasTestDb(): Promise<SeededIds> {
  const ds = testDataSource(true, true);
  await ds.initialize();
  try {
    const osde = await ds.getRepository(CamasHealthcareProvider).save({
      name: 'OSDE',
    } as CamasHealthcareProvider);
    const pami = await ds.getRepository(CamasHealthcareProvider).save({
      name: 'PAMI',
    } as CamasHealthcareProvider);

    const uco = await ds
      .getRepository(CamasSector)
      .save({ code: 'UCO', name: 'UCO' } as CamasSector);
    const uti = await ds
      .getRepository(CamasSector)
      .save({ code: 'UTI2', name: 'UTI 2' } as CamasSector);

    const bedUco = await ds
      .getRepository(CamasBed)
      .save({ code: 'UCO 2', location: uco } as CamasBed);
    const bedUti = await ds
      .getRepository(CamasBed)
      .save({ code: 'UTI2 2', location: uti } as CamasBed);

    const marta = await ds.getRepository(CamasPatient).save({
      document_type: 'dni',
      document_number: '28945110',
      fullname: 'Marta Gonzalez',
      birthdate: new Date('1958-04-12'),
      gender: 'F',
      hc_number: '1042318',
      healthcare_provider: osde,
    } as CamasPatient);
    const hector = await ds.getRepository(CamasPatient).save({
      document_type: 'dni',
      document_number: '12090443',
      fullname: 'Hector Ramirez',
      birthdate: new Date('1945-03-17'),
      gender: 'M',
      hc_number: '1009921',
      healthcare_provider: pami,
    } as CamasPatient);

    const admMarta = await ds.getRepository(CamasAdmision).save({
      patient: marta,
      entry_time: days(2),
      bed: bedUco,
      discharge: null,
    } as unknown as CamasAdmision);

    const dischargeHector = await ds.getRepository(CamasDischarge).save({
      departure_time: days(1),
    } as CamasDischarge);
    const admHector = await ds.getRepository(CamasAdmision).save({
      patient: hector,
      entry_time: days(5),
      bed: null,
      discharge: dischargeHector,
    } as unknown as CamasAdmision);

    await ds.getRepository(CamasBedAdmission).save({
      bed: bedUco,
      admision: admMarta,
      start_date: days(2),
      end_date: null,
    } as unknown as CamasBedAdmission);
    await ds.getRepository(CamasBedAdmission).save({
      bed: bedUti,
      admision: admHector,
      start_date: days(5),
      end_date: days(1),
    } as unknown as CamasBedAdmission);

    return { admMartaId: admMarta.id, admHectorId: admHector.id };
  } finally {
    await ds.destroy();
  }
}

/** Cuenta filas de tablas `sv_` para verificar que las lecturas no escriben. */
export async function countSvRows(): Promise<{
  patients: number;
  admisiones: number;
}> {
  const ds = testDataSource(false);
  await ds.initialize();
  try {
    const patients = await ds.getRepository(CamasPatient).count();
    const admisiones = await ds.getRepository(CamasAdmision).count();
    return { patients, admisiones };
  } finally {
    await ds.destroy();
  }
}
