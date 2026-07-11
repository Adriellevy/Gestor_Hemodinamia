import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { CamasPatient } from '../camas/entities/patient.entity';
import { CamasAdmision } from '../camas/entities/admision.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CamasPatient, CamasAdmision])],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService],
})
export class PacientesModule {}
