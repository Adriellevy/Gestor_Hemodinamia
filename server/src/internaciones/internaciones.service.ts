import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Internacion } from '../data/types';
import { CamasAdmision } from '../camas/entities/admision.entity';
import { toInternacion } from '../camas/camas.mappers';
import { PedidosService } from '../pedidos/pedidos.service';

@Injectable()
export class InternacionesService {
  private readonly logger = new Logger(InternacionesService.name);

  /** Store local en memoria para internaciones de pacientes manuales. */
  private locales: Internacion[] = [];

  constructor(
    @InjectRepository(CamasAdmision)
    private readonly admisionesRepo: Repository<CamasAdmision>,
    private readonly pedidosService: PedidosService,
  ) {}

  /**
   * Internaciones de Camas (activas ∪ referenciadas por pedidos, para trazabilidad
   * de terminados) unidas al store local. No se carga el histórico completo.
   */
  async findAll(): Promise<Internacion[]> {
    const relations = {
      patient: true,
      discharge: true,
      bedAdmissions: { bed: { location: true } },
    };
    try {
      // Activas: sin alta asociada.
      const activas = await this.admisionesRepo.find({
        where: { discharge: IsNull() as any },
        relations,
      });

      // Históricas referenciadas por pedidos (ids de admisión de Camas = UUID).
      const idsReferenciados = this.pedidosService
        .findAllRaw()
        .map((p) => p.internacionId)
        .filter((id) => isUuid(id));
      const activasIds = new Set(activas.map((a) => a.id));
      const faltantes = idsReferenciados.filter((id) => !activasIds.has(id));

      let referenciadas: CamasAdmision[] = [];
      if (faltantes.length > 0) {
        referenciadas = await this.admisionesRepo.find({
          where: { id: In(faltantes), discharge: Not(IsNull()) as any },
          relations,
        });
      }

      return [
        ...activas.map(toInternacion),
        ...referenciadas.map(toInternacion),
        ...this.locales,
      ];
    } catch (err) {
      this.logger.error(
        `No se pudo leer internaciones de Camas, devolviendo solo store local: ${err}`,
      );
      return [...this.locales];
    }
  }

  /** Alta manual: se guarda solo en el store local, nunca se escribe en Camas. */
  create(internacion: Internacion): Internacion {
    this.locales.push(internacion);
    return internacion;
  }

  reset(): void {
    this.locales = [];
  }
}

/** UUID v4/genérico: distingue ids de Camas de los ids locales (`i_...`). */
function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id ?? '',
  );
}
