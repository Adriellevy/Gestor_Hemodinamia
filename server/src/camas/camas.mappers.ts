import { Paciente, Internacion, PadronEntry } from '../data/types';
import { CamasPatient } from './entities/patient.entity';
import { CamasAdmision } from './entities/admision.entity';
import { CamasBedAdmission } from './entities/bed-admission.entity';

/**
 * Separa `fullname` en `apellido` y `nombre`.
 *
 * Convención verificada contra el código de Gestor de Camas: `fullname` se
 * construye como "Nombre Apellido" (`${first_name} ${last_name}`). Por lo tanto
 * la ÚLTIMA palabra es el apellido y el resto el nombre. Heurística lossy en
 * apellidos compuestos ("De la Cruz"); centralizada aquí para poder ajustarla.
 */
export function splitFullname(fullname: string): {
  apellido: string;
  nombre: string;
} {
  const parts = (fullname ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { apellido: '', nombre: '' };
  if (parts.length === 1) return { apellido: parts[0], nombre: '' };
  const apellido = parts[parts.length - 1];
  const nombre = parts.slice(0, -1).join(' ');
  return { apellido, nombre };
}

function toIso(date: Date | null | undefined): string {
  return date ? new Date(date).toISOString() : '';
}

function toEpoch(date: Date | null | undefined): number | null {
  return date ? new Date(date).getTime() : null;
}

/** `sv_patient` → `Paciente` (contrato en español que consume el cliente-web). */
export function toPaciente(p: CamasPatient): Paciente {
  const { apellido, nombre } = splitFullname(p.fullname);
  return {
    id: p.id,
    hc: p.hc_number ?? '',
    documento: {
      tipo: (p.document_type ?? '').toUpperCase(),
      numero: p.document_number ?? '',
    },
    apellido,
    nombre,
    fechaNacimiento: toIso(p.birthdate),
    sexo: p.gender ?? '',
    obraSocial: p.healthcare_provider?.name ?? undefined,
  };
}

/** Devuelve la bed-admission activa (sin `end_date`) de una internación, si existe. */
function activeBedAdmission(
  a: CamasAdmision,
): CamasBedAdmission | undefined {
  const beds = a.bedAdmissions ?? [];
  return beds.find((b) => !b.end_date);
}

/**
 * Admisión activa de Camas → entrada de padrón (censo actual con ubicación).
 * Incluye `internacionId` (UUID de la admisión) y `pacienteId` para que el
 * front pueda referenciar la admisión de Camas al crear un pedido.
 */
export function toPadronEntry(a: CamasAdmision): PadronEntry {
  const active = activeBedAdmission(a);
  const sectorName = active?.bed?.location?.name ?? '';
  const p = a.patient;
  const { apellido, nombre } = splitFullname(p?.fullname ?? '');
  return {
    internacionId: a.id,
    pacienteId: p?.id ?? '',
    hc: p?.hc_number ?? '',
    apellido,
    nombre,
    dni: p?.document_number ?? '',
    fechaNacimiento: toIso(p?.birthdate),
    sexo: p?.gender ?? '',
    servicio: sectorName,
    sector: sectorName,
    cama: active?.bed?.code ?? '',
    obraSocial: p?.healthcare_provider?.name ?? undefined,
  };
}

/**
 * `sv_admision` (+ ubicación) → `Internacion`.
 * La ubicación se resuelve desde la bed-admission activa; si no hay, degrada a
 * valores vacíos sin romper. El estado deriva de la presencia de un alta.
 */
export function toInternacion(a: CamasAdmision): Internacion {
  const active = activeBedAdmission(a);
  const sectorName = active?.bed?.location?.name ?? '';
  const cama = active?.bed?.code ?? '';
  const fechaAlta =
    toEpoch(a.discharge?.departure_time) ??
    toEpoch(a.discharge?.institutional_discharge_date);
  const finalizada = a.discharge != null;

  return {
    id: a.id,
    pacienteId: a.patient?.id ?? '',
    servicioId: sectorName,
    ubicacion: {
      sector: sectorName,
      habitacion: '—',
      cama,
    },
    fechaIngreso: toEpoch(a.entry_time) ?? 0,
    fechaAlta,
    estado: finalizada ? 'finalizada' : 'activa',
  };
}
