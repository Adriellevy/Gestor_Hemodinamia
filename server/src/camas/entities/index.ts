import { CamasPatient } from './patient.entity';
import { CamasHealthcareProvider } from './healthcare-provider.entity';
import { CamasAdmision } from './admision.entity';
import { CamasBed } from './bed.entity';
import { CamasSector } from './sector.entity';
import { CamasBedAdmission } from './bed-admission.entity';
import { CamasDischarge } from './discharge.entity';

export {
  CamasPatient,
  CamasHealthcareProvider,
  CamasAdmision,
  CamasBed,
  CamasSector,
  CamasBedAdmission,
  CamasDischarge,
};

/** Entidades espejo de solo lectura de la base de Gestor de Camas. */
export const CAMAS_ENTITIES = [
  CamasPatient,
  CamasHealthcareProvider,
  CamasAdmision,
  CamasBed,
  CamasSector,
  CamasBedAdmission,
  CamasDischarge,
];
