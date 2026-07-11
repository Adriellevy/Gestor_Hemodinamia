import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Paciente, PadronEntry } from '../data/types';
import { CamasPatient } from '../camas/entities/patient.entity';
import { CamasAdmision } from '../camas/entities/admision.entity';
import { toPaciente, toPadronEntry } from '../camas/camas.mappers';

@Injectable()
export class PacientesService {
  private readonly logger = new Logger(PacientesService.name);

  /** Store local en memoria para pacientes cargados manualmente (fuera de Camas). */
  private locales: Paciente[] = [];

  constructor(
    @InjectRepository(CamasPatient)
    private readonly pacientesRepo: Repository<CamasPatient>,
    @InjectRepository(CamasAdmision)
    private readonly admisionesRepo: Repository<CamasAdmision>,
  ) {}

  /** Pacientes reales de Camas (solo lectura) unidos a los cargados manualmente. */
  async findAll(): Promise<Paciente[]> {
    try {
      const rows = await this.pacientesRepo.find({
        relations: { healthcare_provider: true },
      });
      return [...rows.map(toPaciente), ...this.locales];
    } catch (err) {
      this.logger.error(
        `No se pudo leer pacientes de Camas, devolviendo solo store local: ${err}`,
      );
      return [...this.locales];
    }
  }

  /** Padrón (censo actual con ubicación) derivado de las admisiones activas de Camas. */
  async getPadron(): Promise<PadronEntry[]> {
    try {
      const activas = await this.admisionesRepo.find({
        where: { discharge: IsNull() as any },
        relations: {
          patient: { healthcare_provider: true },
          bedAdmissions: { bed: { location: true } },
        },
      });
      return activas.map(toPadronEntry);
    } catch (err) {
      this.logger.error(`No se pudo derivar el padrón de Camas: ${err}`);
      return [];
    }
  }

  /** Alta manual: se guarda solo en el store local, nunca se escribe en Camas. */
  create(paciente: Paciente): Paciente {
    this.locales.push(paciente);
    return paciente;
  }

  reset(): void {
    this.locales = [];
  }
}
