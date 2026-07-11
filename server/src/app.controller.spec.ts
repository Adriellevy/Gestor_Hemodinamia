import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PacientesService } from './pacientes/pacientes.service';
import { InternacionesService } from './internaciones/internaciones.service';
import { PedidosService } from './pedidos/pedidos.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // Los servicios de dominio dependen de la BD; se mockean para este
        // unit test del controlador raíz.
        { provide: PacientesService, useValue: { reset: jest.fn() } },
        { provide: InternacionesService, useValue: { reset: jest.fn() } },
        { provide: PedidosService, useValue: { reset: jest.fn() } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('devuelve la página de estado con "Hello World!"', () => {
      expect(appController.getHello()).toContain('Hello World!');
    });
  });
});
