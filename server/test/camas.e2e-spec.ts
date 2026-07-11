import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { seedCamasTestDb, countSvRows, SeededIds } from './camas-fixture';

describe('Conexión a la base de Camas (e2e)', () => {
  let app: INestApplication;
  let ids: SeededIds;

  beforeAll(async () => {
    ids = await seedCamasTestDb();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /pacientes devuelve pacientes de Camas con el contrato mapeado', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/pacientes')
      .expect(200);

    const marta = body.find((p: any) => p.hc === '1042318');
    expect(marta).toBeDefined();
    expect(marta).toMatchObject({
      apellido: 'Gonzalez',
      nombre: 'Marta',
      sexo: 'F',
      documento: { tipo: 'DNI', numero: '28945110' },
      obraSocial: 'OSDE',
    });
    expect(body.find((p: any) => p.hc === '1009921')).toBeDefined();
  });

  it('GET /pacientes/padron deriva el censo activo con internacionId y ubicación', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/pacientes/padron')
      .expect(200);

    const marta = body.find((e: any) => e.hc === '1042318');
    expect(marta).toMatchObject({
      internacionId: ids.admMartaId,
      sector: 'UCO',
      cama: 'UCO 2',
      obraSocial: 'OSDE',
    });
    expect(marta.pacienteId).toBeTruthy();
    // Hector está de alta: no aparece en el padrón activo.
    expect(body.find((e: any) => e.hc === '1009921')).toBeUndefined();
  });

  it('GET /internaciones lista activas y NO históricas sin referenciar', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/internaciones')
      .expect(200);

    const activa = body.find((i: any) => i.id === ids.admMartaId);
    expect(activa).toMatchObject({
      estado: 'activa',
      fechaAlta: null,
      ubicacion: { sector: 'UCO', habitacion: '—', cama: 'UCO 2' },
    });
    expect(body.find((i: any) => i.id === ids.admHectorId)).toBeUndefined();
  });

  it('trazabilidad: una internación con alta referenciada por un pedido se incluye (finalizada)', async () => {
    // Crear un pedido terminado que referencia la admisión dada de alta (UUID de Camas).
    await request(app.getHttpServer())
      .post('/pedidos')
      .send({
        internacionId: ids.admHectorId,
        servicioSolicitanteId: 'UTI 2',
        modalidad: 'ccg',
        descripcion: 'Estudio de control',
        tipoTraslado: 'camilla',
        conContraste: false,
        prioridad: 'normal',
        estado: 'realizado',
        motivo: 'control',
        fechaSolicitud: Date.now(),
      })
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .get('/internaciones')
      .expect(200);

    const historica = body.find((i: any) => i.id === ids.admHectorId);
    expect(historica).toBeDefined();
    expect(historica.estado).toBe('finalizada');
    expect(historica.fechaAlta).not.toBeNull();
  });

  it('read-only: las lecturas no modifican las tablas sv_', async () => {
    await request(app.getHttpServer()).get('/pacientes').expect(200);
    await request(app.getHttpServer()).get('/internaciones').expect(200);
    const counts = await countSvRows();
    expect(counts.patients).toBe(2);
    expect(counts.admisiones).toBe(2);
  });
});
