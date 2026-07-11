import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternacionesController } from './internaciones.controller';
import { InternacionesService } from './internaciones.service';
import { CamasAdmision } from '../camas/entities/admision.entity';
import { PedidosModule } from '../pedidos/pedidos.module';

@Module({
  imports: [TypeOrmModule.forFeature([CamasAdmision]), PedidosModule],
  controllers: [InternacionesController],
  providers: [InternacionesService],
  exports: [InternacionesService],
})
export class InternacionesModule {}
