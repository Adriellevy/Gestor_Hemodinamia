## Why

Hoy el backend de Gestor Hemodinamia sirve pacientes e internaciones desde datos en memoria (`server/src/data/seed.ts`), por lo que no refleja la realidad del hospital y se pierde al reiniciar. Los pacientes y las internaciones ya existen y se mantienen actualizados en la base de datos de Gestor de Camas (`db_bed_manager`, MySQL). Necesitamos que Hemodinamia lea esos datos reales para que los pedidos hemodinámicos se hagan sobre pacientes/internaciones vigentes.

## What Changes

- Agregar persistencia al server de Hemodinamia: dependencias de TypeORM + driver MySQL + `@nestjs/config`, y una conexión configurable por entorno (`.env`).
- Conectar a la base de Camas (`db_bed_manager`) en **solo lectura** con `synchronize: false` (Hemodinamia nunca altera el esquema ni escribe en tablas `sv_`).
- Definir entidades espejo de solo lectura para las tablas de Camas necesarias: `sv_patient`, `sv_admision` y las tablas relacionadas de ubicación (`sv_bed_admission`, `sv_bed`, `sv_sector`).
- Reemplazar la fuente de datos de los módulos `pacientes` e `internaciones`: dejan de leer el seed y consultan la base de Camas, exponiendo el **mismo contrato** de API en español (`Paciente`, `Internacion`) mediante una capa de mapeo (snake_case/inglés/UUID → camelCase/español).
- Los módulos `pedidos` y `usuarios` quedan fuera de alcance de esta conexión (siguen como están hoy); `pedidos` se persistirá en una fase posterior.

## Capabilities

### New Capabilities
- `camas-db-connection`: Conexión TypeORM de solo lectura del backend de Hemodinamia a la base de datos MySQL de Gestor de Camas, configurable por entorno y sin capacidad de modificar el esquema.
- `pacientes-desde-camas`: Lectura de pacientes reales desde `sv_patient` de Camas, mapeados al contrato `Paciente` que ya consume el cliente-web.
- `internaciones-desde-camas`: Lectura de internaciones activas desde `sv_admision` (con su ubicación/cama/sector), mapeadas al contrato `Internacion` que ya consume el cliente-web.

### Modified Capabilities
<!-- Sin specs previas en openspec/specs/; no hay capacidades existentes cuyos requisitos cambien. -->

## Impact

- **Dependencias nuevas** (`server/package.json`): `@nestjs/typeorm`, `typeorm`, `mysql2`, `@nestjs/config`, `dotenv`.
- **Configuración**: nuevo `server/src/environment.ts` + `server/.env` (host, puerto, usuario, password, `db_bed_manager`) y `.env.example`; `.gitignore` debe cubrir `.env`.
- **Código afectado**: `server/src/app.module.ts` (registrar `TypeOrmModule.forRoot` + `ConfigModule`), `server/src/pacientes/*` y `server/src/internaciones/*` (servicios pasan a repositorios + mappers), nuevas entidades espejo y DTOs de mapeo.
- **Contrato de API**: los shapes `Paciente`/`Internacion` se mantienen. **Corrección de alcance** (ver design Decisión 10): el `cliente-web` sí requiere cambios acotados, porque hoy crea internaciones localmente y el pedido las referencia. Se ajustan: forma del padrón (incluye `internacionId`/`pacienteId` de Camas), `AddStudyModal` y `handleAddStudy` (el pedido referencia el UUID de la admisión de Camas para pacientes del padrón; los pacientes manuales siguen en un store local).
- **Acoplamiento de esquema**: Hemodinamia queda acoplado al esquema `sv_` de Camas; cambios en esas tablas pueden requerir ajustar las entidades espejo.
- **Riesgo**: credenciales de una base compartida; `synchronize` debe permanecer en `false`. El seed en memoria queda como fallback/experimentos (`Test_new_versions`).
