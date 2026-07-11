## Context

El backend de Hemodinamia (NestJS 11) sirve pacientes e internaciones desde arrays en memoria (`server/src/data/seed.ts`), sin persistencia ni configuración de entorno. Gestor de Camas ya mantiene esos datos en una base MySQL (`db_bed_manager`) con TypeORM, tablas prefijadas `sv_` y esquema en inglés/snake_case con PK UUID (ver `Gestor_Camas/server/src/**/*.entity.ts`). El objetivo es que Hemodinamia lea pacientes e internaciones reales desde esa base **sin escribir en ella** y **sin cambiar el contrato** que consume `cliente-web` (shapes en español: `Paciente`, `Internacion`).

Restricciones:
- Solo lectura sobre tablas `sv_`; `synchronize` prohibido en `true`.
- El front no debe modificarse: los endpoints deben devolver los mismos DTOs actuales.
- Base compartida con Camas: credenciales por entorno, nunca hardcodeadas ni commiteadas.

## Goals / Non-Goals

**Goals:**
- Establecer una conexión TypeORM de solo lectura a `db_bed_manager` configurable por `.env`.
- Leer `sv_patient` y `sv_admision` (+ ubicación: `sv_bed_admission`, `sv_bed`, `sv_sector`) mediante entidades espejo.
- Mapear el esquema de Camas a los DTOs `Paciente` / `Internacion` ya existentes, preservando el contrato de API.
- Mantener el arranque del server resiliente y la configuración segura (secretos fuera del repo).

**Non-Goals:**
- Escribir/crear/modificar datos en tablas `sv_` de Camas.
- Persistir `pedidos` o `usuarios` (fase posterior; siguen en memoria).
- Cambiar `cliente-web`.
- Migrar datos o alterar el esquema de Camas.
- Autenticación entre servicios o exponer nuevos endpoints.

## Decisions

**1. Conexión directa a MySQL (no vía API de Camas).**
Decidido en el diagnóstico con el usuario: TypeORM apuntando a `db_bed_manager`. Alternativa descartada: consumir la API REST de Camas (más desacoplado pero depende de endpoints inexistentes y añade latencia/acoplamiento operativo). La conexión directa es la que pide la tarea y es más simple para lectura.

**2. `TypeOrmModule.forRoot` único con `synchronize: false` y `entities` explícitas.**
Se registra una sola conexión (default). `synchronize: false` es innegociable para no tocar el esquema de Camas. Se listan solo las entidades espejo necesarias, no un glob amplio, para evitar que TypeORM intente gestionar tablas de más. Alternativa (conexión con nombre/segunda datasource) se pospone hasta que Hemodinamia tenga tablas propias (`pedidos`).

**3. Entidades espejo de solo lectura.**
Se replican únicamente las columnas que Hemodinamia consume, con `@Entity('sv_patient')` etc. y los tipos de Camas (enum `document_type`, `uuid`, `timestamp`). Los repositorios se usan solo para `find`; no se exponen `save`/`delete`. Alternativa: consultas SQL crudas — descartada por perder tipado y mapeo de relaciones.

**4. Capa de mapeo (mappers) Camas → DTO español.**
Los servicios `pacientes`/`internaciones` dejan de leer el seed y consultan repositorios; un mapper convierte `fullname`→(`nombre`/`apellido`), `document_type/number`→`documento{tipo,numero}`, `hc_number`→`hc`, y normaliza la ubicación (sector/cama desde `sv_bed`/`sv_sector` vía la bed-admission activa) al objeto plano `ubicacion{sector,habitacion,cama}`. Así el contrato de API queda intacto. `apellido/nombre` se derivan de `fullname` con una convención documentada (split configurable) ya que Camas no separa los campos.

**5. Configuración por entorno con `@nestjs/config` + `environment.ts`.**
Se replica el patrón de Camas: `environment.ts` lee `process.env` con defaults de dev; `.env` real ignorado por git; `.env.example` versionado. `ConfigModule.forRoot({ isGlobal: true })`. En esta fase la conexión usa las **credenciales existentes de Gestor de Camas** (no hay usuario read-only todavía). Por lo tanto la protección contra escrituras recae íntegramente en el código: `synchronize:false` y repositorios usados solo para lectura. Un **usuario de BD de solo lectura dedicado** (permisos SELECT) queda como endurecimiento posterior — hay que crearlo — y solo cambiaría las credenciales del `.env`, sin tocar el código.

**6. Alcance de la lectura de internaciones: activas + históricas referenciadas.**
El pedido no guarda snapshot del paciente: solo `internacionId`, y el front resuelve identidad + ubicación por join `pedido → internación → paciente` (`cliente-web/src/utils/helpers.ts`). Por eso Hemodinamia necesita **tanto las internaciones activas** (uso operativo: padrón/búsqueda por HC al crear pedidos y tablero) **como las históricas (con alta)** referenciadas por pedidos existentes (trazabilidad: los pedidos terminados de pacientes ya egresados deben seguir resolviendo su paciente/ubicación; sin la histórica se mostraría "—"). Criterio de acotación: **no** se lee el histórico completo del hospital, sino internaciones activas ∪ las referenciadas por `pedido.internacionId`. Alternativa descartada: leer solo activas (rompe trazabilidad) o todo el histórico (volumen innecesario).

**7. Mapeo de obra social desde `sv_healthcare_provider`.**
`obraSocial` se consume en el dashboard (`DashboardView` agrupa/filtra por obra social), así que el mapper de `Paciente` resuelve `obraSocial` desde la relación `sv_patient.healthcare_provider` (`sv_healthcare_provider`). Si es nula, se degrada a "Sin Obra Social" (comportamiento ya presente en el front).

**8. Convención de split de `fullname`: "Nombre Apellido" (verificada).**
Camas guarda `fullname` sin separar; el front espera `apellido` y `nombre`. Se verificó contra el código de Camas que el formato real es **"Nombre Apellido"** (FirstName LastName): el ingest de pacientes arma `fullname = \`${first_name} ${last_name}\`` (`external-services.service.ts`) y los mockups siguen el mismo orden ("Juan Perez"). Por lo tanto el split toma la **última palabra como `apellido`** y el resto como `nombre` (tolerante a valores vacíos o de una sola palabra). Es una heurística lossy en apellidos compuestos ("De la Cruz"); se centraliza en el mapper para poder ajustarla. Nota: Camas tiene `first_name`/`last_name` separados en el ingest pero solo persiste `fullname` en `sv_patient`, así que el split heurístico es la única opción desde la BD.

**9. Estrategia de tests en dos capas sobre una BD de test dedicada.**
La cobertura se reparte según lo que cada herramienta puede verificar honestamente:
- **Backend (Jest + supertest)** — ya configurado en el server (`test/jest-e2e.json`): cubre lo que la UI no alcanza — shape exacto de `GET /pacientes` y `GET /internaciones` (contrato preservado), mapeo (`fullname` split, `documento`, `obraSocial`, ubicación), alcance activas∪referenciadas, y comportamiento **read-only** (ninguna operación escribe ni ejecuta DDL sobre `sv_`).
- **E2E (Playwright)** — nuevo en Hemodinamia, siguiendo el patrón de Camas (`playwright.config.ts` + `playwright-tests/`, `baseURL` del `cliente-web`): cubre los outcomes observables — la lista de pacientes/internaciones carga, la trazabilidad de un pedido terminado de paciente egresado muestra su paciente/ubicación, y `obraSocial` aparece en el dashboard.

**Datos de test: BD de test dedicada con datos conocidos.** Se aprovisiona una instancia de `db_bed_manager` de prueba (separada de la real) poblada con datos fijos reutilizando el **seeder/mockups del propio Gestor de Camas** (levantar el server de Camas con `SYNCHRONIZE=true` + seeder contra un MySQL limpio). Así los tests pueden **afirmar valores concretos** (p. ej. paciente "Juan Perez", una internación activa y una con alta). Para la trazabilidad, el fixture incluye una internación **dada de alta** referenciada por un pedido terminado (el `internacionId` del seed de pedidos de Hemo debe coincidir con el id de esa admisión en la BD de test). Alternativa descartada: asserts tolerantes contra la BD real (no permite afirmar valores concretos ni garantizar el caso egresado).

**10. Pedidos referencian la admisión de Camas + store local híbrido (revisión de alcance).**
Durante la implementación se detectó que el supuesto "el cliente-web no requiere modificaciones" era incorrecto: al crear un pedido, el front escribe pacientes/internaciones con ids generados localmente (`createPaciente`/`createInternacion`) y el pedido referencia ese id local (`App.tsx handleAddStudy` → `helpers.ts hidratar`). Para que la trazabilidad funcione contra Camas se adopta la **Opción 1**:
- El **padrón** (`GET /pacientes/padron`) se deriva de las **admisiones activas de Camas** (join paciente + cama + sector + obra social) e incluye el `internacionId` (UUID de la admisión) y el `pacienteId`.
- Al crear un pedido desde el padrón, el front usa directamente ese **UUID de admisión de Camas** como `pedido.internacionId` (deja de generar ids ni llamar a `createInternacion`).
- **Pacientes manuales** (fuera del padrón, no existen en Camas): se conservan en un **store local en memoria** de Hemodinamia vía los `POST` existentes (que nunca escriben en Camas). El pedido referencia el id local.
- `GET /pacientes` y `GET /internaciones` devuelven la **unión** de los datos de Camas (pacientes; admisiones activas ∪ referenciadas por pedidos) y el store local, de modo que `hidratar()` resuelve tanto pacientes reales como manuales.

Esto mantiene toda la funcionalidad actual (incluida la carga manual) y ancla la trazabilidad de pacientes reales al UUID de Camas. Cambios de front acotados a: forma del padrón, `AddStudyModal` (propagar `internacionId`/`pacienteId`) y `handleAddStudy` (usar el UUID en vez de crear internación para pacientes del padrón).

## Risks / Trade-offs

- **Acoplamiento al esquema `sv_` de Camas** → Mitigación: entidades espejo mínimas y aisladas en un módulo dedicado; documentar la dependencia en el spec y el config.yaml.
- **Fixture de test acopla ids Hemo↔Camas** → Mitigación: el seed de pedidos de Hemo usado en tests referencia ids de admisión conocidos de la BD de test; documentar el contrato del fixture y aislarlo del seed de producción.
- **Coexistencia de ids Camas (UUID) y locales en `pedido.internacionId`** → Mitigación: los reads mergean ambas fuentes; los ids no colisionan (UUID vs prefijo local `p_`/`i_`); documentado como modelo híbrido.
- **BD de test debe reflejar el esquema `sv_` vigente** → Mitigación: generarla desde el seeder de Camas (misma fuente del esquema), no a mano.
- **`synchronize: true` accidental modificaría/borraría tablas de Camas** → Mitigación: forzar `false` de forma dura en el server de Hemodinamia (no depender solo de la env var) y cubrirlo en tasks/verificación.
- **`fullname` no separa nombre/apellido** → Mitigación: convención de split explícita y tolerante; el front ya tolera ambos campos como strings.
- **Credenciales de base compartida** → Mitigación: `.env` fuera del repo, `.env.example` sin secretos, usuario de BD idealmente de solo lectura.
- **Ubicación normalizada en varias tablas** → Mitigación: resolver la ubicación desde la `sv_bed_admission` activa (sin `end_date`) con joins; si no hay cama activa, degradar a valores vacíos sin romper.
- **Indisponibilidad de la base al arrancar** → Mitigación: no bloquear el resto del server; loguear y permitir fallback controlado.

## Migration Plan

1. Añadir dependencias e infraestructura de config (`environment.ts`, `.env.example`, `.gitignore`).
2. Registrar `TypeOrmModule.forRoot` + `ConfigModule` en `app.module.ts` con `synchronize:false`.
3. Crear entidades espejo y DTOs/mappers.
4. Migrar servicios `pacientes` e `internaciones` de seed → repositorios (endpoints sin cambios).
5. Aprovisionar la BD de test (`db_bed_manager` de prueba) con el seeder de Camas y datos conocidos.
6. Agregar tests de backend (Jest+supertest) y E2E (Playwright) contra esa BD de test.
7. Validar que los endpoints devuelven el mismo shape y que la trazabilidad funciona.
Rollback: los servicios pueden volver al seed en memoria (se conserva `data/seed.ts`); revertir el commit restaura el comportamiento anterior sin efectos sobre Camas (fue solo lectura).

## Resolved Decisions

Preguntas abiertas resueltas con el usuario y validadas contra el código del `cliente-web`:

- **Acceso a la BD**: se usan las **credenciales existentes de Gestor de Camas** en esta fase; un usuario read-only dedicado requiere crearse y queda como endurecimiento posterior. Ver Decisión 5.
- **Split de `fullname`**: convención **"Nombre Apellido"** (última palabra = apellido, resto = nombre), verificada contra el código de Camas y centralizada en el mapper. Ver Decisión 8.
- **Internaciones históricas**: **sí se necesitan**, por trazabilidad. El pedido solo referencia `internacionId` y resuelve el paciente por join (`cliente-web/src/utils/helpers.ts`), así que los pedidos terminados de pacientes egresados requieren su internación histórica para no mostrar "—". Alcance acotado a: activas ∪ referenciadas por pedidos. Ver Decisión 6.
- **`obraSocial`**: se mapea desde `sv_healthcare_provider` (la consume el dashboard). Ver Decisión 7.

## Open Questions

- Host/credenciales concretas de la instancia de `db_bed_manager` a las que apuntará el `.env` de Hemodinamia (usando el usuario actual de Camas).
- (Endurecimiento futuro) Crear el usuario de BD de solo lectura dedicado y migrar el `.env` a esas credenciales.
- Dónde corre la BD de test (docker-compose local reutilizando el de Camas vs. servicio de CI) y cómo se dispara el seeder de Camas dentro del pipeline de tests de Hemodinamia.
