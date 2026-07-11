## 1. Infraestructura de persistencia y configuración

- [x] 1.1 Agregar dependencias en `server/package.json`: `@nestjs/typeorm`, `typeorm`, `mysql2`, `@nestjs/config`, `dotenv` e instalar
- [x] 1.2 Crear `server/src/environment.ts` que lea `DATABASE_TYPE/HOST/PORT/USER/PASSWORD/NAME` de `process.env` con defaults de desarrollo
- [x] 1.3 Crear `server/.env.example` documentando las variables de conexión a `db_bed_manager` (sin secretos); en esta fase se usan las credenciales existentes de Camas (usuario read-only dedicado = endurecimiento posterior)
- [x] 1.4 Asegurar que `server/.gitignore` ignora `.env` (y no `.env.example`) — cubierto por el `.gitignore` de la raíz del repo (`.env`, `.env.test`, etc.)

## 2. Conexión TypeORM a la base de Camas

- [x] 2.1 Registrar `ConfigModule.forRoot({ isGlobal: true })` en `server/src/app.module.ts`
- [x] 2.2 Registrar `TypeOrmModule.forRoot` en `app.module.ts` con `type: mysql`, credenciales desde `environment.ts`, `synchronize: false` forzado y `entities` explícitas (sin glob amplio)
- [x] 2.3 Verificar que el arranque no ejecuta DDL contra tablas `sv_` y que la app levanta aunque la base tarde en responder (logueo controlado) — la suite e2e arranca la app con `synchronize:false` contra la BD de test sin alterar el esquema

## 3. Entidades espejo de solo lectura

- [x] 3.1 Crear entidad espejo `sv_patient` con las columnas consumidas (`id` uuid, `document_type` enum, `document_number`, `fullname`, `birthdate`, `gender`, `hc_number`) y la relación a `sv_healthcare_provider`
- [x] 3.2 Crear entidad espejo `sv_admision` (`id`, relación a patient, `entry_time`, alta/`discharge`, referencias necesarias)
- [x] 3.3 Crear entidades espejo de ubicación: `sv_bed_admission` (con `start_date`/`end_date`), `sv_bed` y `sv_sector`, con las relaciones mínimas para resolver cama/sector
- [x] 3.4 Crear entidad espejo `sv_healthcare_provider` (para mapear `obraSocial`)
- [x] 3.5 Confirmar que las entidades coinciden con el esquema real de `Gestor_Camas/server/src/**/*.entity.ts`

## 4. Mapeo al contrato español

- [x] 4.1 Implementar mapper `sv_patient` → `Paciente` (`document_type/number`→`documento`, `hc_number`→`hc`, `birthdate`→`fechaNacimiento`, `gender`→`sexo`, `obraSocial` desde `sv_healthcare_provider`)
- [x] 4.2 Implementar split de `fullname`→`apellido`/`nombre` con la convención "Nombre Apellido" (última palabra = apellido, resto = nombre; tolerante a vacío/una sola palabra), centralizado y ajustable
- [x] 4.3 Implementar mapper `sv_admision` (+ ubicación) → `Internacion` (`entry_time`→`fechaIngreso`, alta→`fechaAlta|null`, `pacienteId`, `estado` activa/finalizada, `ubicacion{sector,habitacion,cama}` desde la bed-admission activa)
- [x] 4.4 Manejar el caso sin bed-admission activa degradando la ubicación a valores vacíos sin error

## 5. Migración de servicios a repositorios (backend, modelo híbrido)

- [x] 5.1 `PacientesService.findAll`: unión de `sv_patient` (mapeado) + store local de pacientes manuales; `create` escribe solo al store local
- [x] 5.2 `PacientesService.getPadron`: derivar el padrón de las admisiones activas de Camas (join paciente + cama + sector + obra social), incluyendo `internacionId` (UUID) y `pacienteId`
- [x] 5.3 `InternacionesService.findAll`: unión de admisiones de Camas (activas ∪ referenciadas por pedidos) + store local; `create` escribe solo al store local
- [x] 5.4 Implementar el criterio activas ∪ referenciadas por pedidos (sin cargar el histórico completo)
- [x] 5.5 Registrar `TypeOrmModule.forFeature([...])` en los módulos `pacientes` e `internaciones`; fallback controlado si la BD falla
- [x] 5.6 Confirmar que los módulos `pedidos` y `usuarios` no se ven afectados (siguen con seed)

## 5b. Cambios en el cliente-web (Opción 1)

- [x] 5b.1 Extender la forma del padrón consumida en el front (`types`/`services`) con `internacionId` y `pacienteId`
- [x] 5b.2 `AddStudyModal`: propagar `internacionId`/`pacienteId` en `resolved` cuando el paciente proviene del padrón
- [x] 5b.3 `App.tsx handleAddStudy`: para pacientes del padrón, usar el `internacionId` (UUID de Camas) directamente y no llamar a `createInternacion`; conservar el flujo local solo para carga manual

## 6. Base de datos de test

- [x] 6.1 Aprovisionar una instancia de `db_bed_manager` de test (separada de la real) — contenedor `hemo_testdb` (MySQL 8.0.33, puerto 3309)
- [x] 6.2 Poblarla con datos conocidos — `test/camas-fixture.ts` construye el esquema subset desde las entidades espejo (`synchronize:true`) e inserta datos fijos (Marta Gonzalez, Hector Ramirez). Nota: se optó por un fixture directo en vez del seeder de Camas (no está cableado para correr al boot); más controlado y autocontenido
- [x] 6.3 Garantizar en el fixture: ≥1 paciente con obra social, ≥1 internación activa con cama/sector, y ≥1 internación **dada de alta** referenciada por un pedido terminado (para trazabilidad)
- [x] 6.4 Alinear el seed de pedidos de Hemo usado en tests para que sus `internacionId` coincidan con ids de admisión reales de la BD de test — el test crea el pedido terminado con el UUID de la admisión de alta

## 7. Tests de backend (Jest + supertest)

- [x] 7.1 Configurar el e2e de Nest (`test/jest-e2e.json`) para apuntar a la BD de test vía variables de entorno — `setupFiles: setup-e2e-env.ts`
- [x] 7.2 Test: `GET /pacientes` devuelve el shape `Paciente` esperado y mapea `documento`, `hc`, `fechaNacimiento`, `sexo`, `obraSocial` correctamente
- [x] 7.3 Test: split de `fullname` "Nombre Apellido" → `apellido`/`nombre` (incluye caso de una sola palabra) — `camas.mappers.spec.ts` (8/8 verde, cubre además el mapeo de `Paciente`/`Internacion`/padrón sin BD)
- [x] 7.4 Test: `GET /internaciones` devuelve `Internacion` con `ubicacion` resuelta desde la bed-admission activa, y `fechaAlta` null/valor según estado
- [x] 7.5 Test: alcance activas∪referenciadas — una internación con alta referenciada por un pedido es resoluble; el histórico no referenciado no se carga
- [x] 7.6 Test read-only: tras ejercitar los endpoints, el conteo/contenido de las tablas `sv_` no cambia (sin escrituras ni DDL)

## 8. Tests E2E (Playwright)

- [x] 8.1 Instalar y configurar Playwright en Hemodinamia siguiendo el patrón de Camas (`playwright.config.ts` con webServers para server+cliente, carpeta `playwright-tests/`, `baseURL` del `cliente-web`). Requirió hacer `API_URL` configurable por `VITE_API_URL`
- [x] 8.2 E2E: al crear un pedido, el padrón (derivado de Camas) encuentra a Marta Gonzalez y muestra su ubicación real "UCO 2" — `camas-integracion.spec.ts` (1/1 verde)
- [x] 8.3 Trazabilidad de internación con alta referenciada por pedido — verificada de forma concluyente en el e2e de backend (`camas.e2e-spec.ts`, misma ruta de hidratación). No se agregó test de UI por el filtrado por servicio del tablero (fragilidad); el backend cubre la lógica
- [ ] 8.4 E2E dashboard por obra social — `obraSocial` verificada en el mapper (unit) y en `GET /pacientes` (e2e backend, OSDE/PAMI); el test de UI del dashboard queda como follow-up de bajo valor marginal

## 9. Verificación final

- [x] 9.1 Verificar que el `cliente-web` funciona contra el backend conectado — Playwright levanta el stack (server sobre BD de test + cliente) y el login + padrón funcionan
- [ ] 9.2 Sin `.env`/base caída el server no crashea (PARCIAL): los servicios tienen fallback try/catch a nivel de query (devuelven store local). Limitación conocida: con la BD totalmente caída al arranque, `TypeOrmModule` aún falla tras los reintentos (boot resiliente = follow-up, ver design Riesgos)
- [x] 9.3 Correr las suites en verde contra la BD de test — backend 6/6 e2e + 8/8 unit, Playwright 1/1
