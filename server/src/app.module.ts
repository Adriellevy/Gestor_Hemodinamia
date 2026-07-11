import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { InternacionesModule } from './internaciones/internaciones.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { AuthModule } from './auth/auth.module';
import { environment } from './environment';
import { CAMAS_ENTITIES } from './camas/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [() => ({ ...environment })],
      isGlobal: true,
    }),
    // Conexión de SOLO LECTURA a la base de Gestor de Camas (db_bed_manager).
    // synchronize queda forzado a false de forma dura: Hemodinamia nunca altera
    // el esquema de Camas. Solo se cargan las entidades espejo necesarias.
    TypeOrmModule.forRoot({
      type: environment.db.type as 'mysql',
      host: environment.db.host,
      port: parseInt(environment.db.port),
      username: environment.db.user,
      password: environment.db.password,
      database: environment.db.database,
      synchronize: false,
      entities: CAMAS_ENTITIES,
    }),
    AuthModule,
    UsuariosModule,
    PacientesModule,
    InternacionesModule,
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
