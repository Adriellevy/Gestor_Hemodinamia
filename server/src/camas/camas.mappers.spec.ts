import {
  splitFullname,
  toPaciente,
  toInternacion,
  toPadronEntry,
} from './camas.mappers';
import { CamasPatient } from './entities/patient.entity';
import { CamasAdmision } from './entities/admision.entity';

describe('splitFullname (convención "Nombre Apellido")', () => {
  it('separa la última palabra como apellido y el resto como nombre', () => {
    expect(splitFullname('Juan Perez')).toEqual({
      apellido: 'Perez',
      nombre: 'Juan',
    });
    expect(splitFullname('Ana Beatriz Diaz')).toEqual({
      apellido: 'Diaz',
      nombre: 'Ana Beatriz',
    });
  });

  it('tolera una sola palabra o vacío', () => {
    expect(splitFullname('Cher')).toEqual({ apellido: 'Cher', nombre: '' });
    expect(splitFullname('')).toEqual({ apellido: '', nombre: '' });
    expect(splitFullname('   ')).toEqual({ apellido: '', nombre: '' });
  });
});

describe('toPaciente', () => {
  it('mapea el esquema de Camas al contrato Paciente', () => {
    const p = {
      id: 'uuid-1',
      document_type: 'dni',
      document_number: '28945110',
      fullname: 'Maria Lopez',
      birthdate: new Date('1958-04-12T00:00:00.000Z'),
      gender: 'F',
      hc_number: '1042318',
      healthcare_provider: { id: 'h1', name: 'OSDE' } as any,
    } as CamasPatient;

    expect(toPaciente(p)).toEqual({
      id: 'uuid-1',
      hc: '1042318',
      documento: { tipo: 'DNI', numero: '28945110' },
      apellido: 'Lopez',
      nombre: 'Maria',
      fechaNacimiento: '1958-04-12T00:00:00.000Z',
      sexo: 'F',
      obraSocial: 'OSDE',
    });
  });

  it('deja obraSocial indefinida si no hay healthcare_provider', () => {
    const p = {
      id: 'uuid-2',
      document_type: 'passport',
      document_number: 'X1',
      fullname: 'Sin Obra',
      birthdate: null,
      gender: 'M',
      hc_number: null,
      healthcare_provider: null,
    } as unknown as CamasPatient;

    const r = toPaciente(p);
    expect(r.obraSocial).toBeUndefined();
    expect(r.hc).toBe('');
    expect(r.fechaNacimiento).toBe('');
    expect(r.documento.tipo).toBe('PASSPORT');
  });
});

describe('toInternacion', () => {
  const base = {
    id: 'adm-1',
    patient: { id: 'pac-1' } as any,
    entry_time: new Date('2026-07-01T10:00:00.000Z'),
    discharge: null,
  };

  it('resuelve la ubicación desde la bed-admission activa y estado "activa"', () => {
    const a = {
      ...base,
      bedAdmissions: [
        {
          end_date: new Date('2026-06-01T00:00:00.000Z'),
          bed: { code: 'VIEJA', location: { name: 'Piso 1' } },
        },
        {
          end_date: null,
          bed: { code: 'UCO 2', location: { name: 'UCO' } },
        },
      ],
    } as unknown as CamasAdmision;

    expect(toInternacion(a)).toEqual({
      id: 'adm-1',
      pacienteId: 'pac-1',
      servicioId: 'UCO',
      ubicacion: { sector: 'UCO', habitacion: '—', cama: 'UCO 2' },
      fechaIngreso: new Date('2026-07-01T10:00:00.000Z').getTime(),
      fechaAlta: null,
      estado: 'activa',
    });
  });

  it('degrada la ubicación sin error cuando no hay bed-admission activa', () => {
    const a = {
      ...base,
      bedAdmissions: [],
    } as unknown as CamasAdmision;

    const r = toInternacion(a);
    expect(r.ubicacion).toEqual({ sector: '', habitacion: '—', cama: '' });
    expect(r.estado).toBe('activa');
  });

  it('marca "finalizada" y fechaAlta cuando hay alta', () => {
    const a = {
      ...base,
      discharge: {
        departure_time: new Date('2026-07-03T12:00:00.000Z'),
        institutional_discharge_date: null,
      },
      bedAdmissions: [],
    } as unknown as CamasAdmision;

    const r = toInternacion(a);
    expect(r.estado).toBe('finalizada');
    expect(r.fechaAlta).toBe(new Date('2026-07-03T12:00:00.000Z').getTime());
  });
});

describe('toPadronEntry', () => {
  it('incluye internacionId (UUID de admisión) y pacienteId', () => {
    const a = {
      id: 'adm-9',
      patient: {
        id: 'pac-9',
        fullname: 'Carlos Gomez',
        document_number: '25443668',
        hc_number: '1029013',
        birthdate: new Date('1964-12-19T00:00:00.000Z'),
        gender: 'M',
        healthcare_provider: { name: 'PAMI' },
      },
      bedAdmissions: [
        { end_date: null, bed: { code: 'UTI2 2', location: { name: 'UTI 2' } } },
      ],
    } as unknown as CamasAdmision;

    expect(toPadronEntry(a)).toEqual({
      internacionId: 'adm-9',
      pacienteId: 'pac-9',
      hc: '1029013',
      apellido: 'Gomez',
      nombre: 'Carlos',
      dni: '25443668',
      fechaNacimiento: '1964-12-19T00:00:00.000Z',
      sexo: 'M',
      servicio: 'UTI 2',
      sector: 'UTI 2',
      cama: 'UTI2 2',
      obraSocial: 'PAMI',
    });
  });
});
