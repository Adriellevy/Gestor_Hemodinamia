# internaciones-desde-camas Specification

## Purpose
TBD - created by archiving change conectar-db-camas. Update Purpose after archive.
## Requirements
### Requirement: Lectura de internaciones desde la base de Camas

El endpoint de internaciones de Hemodinamia SHALL obtener las internaciones desde la tabla `sv_admision` de Gestor de Camas (con su ubicación asociada) en lugar de los datos en memoria, y SHALL devolverlas con el mismo contrato `Internacion` que consume el cliente-web.

#### Scenario: Listado de internaciones desde la base real
- **WHEN** el cliente-web solicita el listado de internaciones
- **THEN** el backend consulta `sv_admision` en la base de Camas
- **AND** responde con objetos `Internacion` (`id`, `pacienteId`, `servicioId`, `ubicacion`, `fechaIngreso`, `fechaAlta`, `estado`) sin cambios en la forma de la respuesta

#### Scenario: Resolución de la ubicación desde tablas relacionadas
- **WHEN** se construye la `ubicacion` de una internación
- **THEN** el backend resuelve la cama/sector a partir de la `sv_bed_admission` activa (sin `end_date`) y sus relaciones `sv_bed` y `sv_sector`
- **AND** completa `ubicacion.sector`, `ubicacion.habitacion` y `ubicacion.cama`
- **AND** si no existe una bed-admission activa, degrada a valores vacíos sin producir error

#### Scenario: Mapeo de fechas y estado
- **WHEN** se transforma un registro de `sv_admision` a `Internacion`
- **THEN** `entry_time` se mapea a `fechaIngreso` y la fecha de alta a `fechaAlta` (o `null` si sigue internado)
- **AND** el `pacienteId` referencia al paciente de `sv_patient` asociado
- **AND** el `estado` refleja si la internación está activa o finalizada

### Requirement: Trazabilidad de internaciones históricas

El backend SHALL exponer, además de las internaciones activas, las internaciones históricas (con alta) que sean referenciadas por pedidos existentes, de modo que los pedidos terminados de pacientes ya egresados sigan resolviendo su paciente y su ubicación. El sistema NO MUST requerir cargar el histórico completo de internaciones del hospital.

#### Scenario: Pedido terminado de paciente egresado conserva su contexto
- **WHEN** existe un pedido cuyo `internacionId` corresponde a una internación ya finalizada (paciente dado de alta en Camas)
- **THEN** el backend puede resolver esa internación histórica y su paciente asociado
- **AND** el pedido terminado muestra el paciente y la ubicación reales en lugar de valores vacíos ("—")

#### Scenario: Alcance acotado de la lectura
- **WHEN** el backend obtiene internaciones desde la base de Camas
- **THEN** el conjunto leído se limita a las internaciones activas más las referenciadas por pedidos existentes
- **AND** no se carga indiscriminadamente el histórico completo de `sv_admision`

#### Scenario: No hay escritura sobre internaciones de Camas
- **WHEN** se ejecuta cualquier operación del módulo de internaciones contra la base de Camas
- **THEN** solo se realizan lecturas
- **AND** el sistema no crea ni modifica registros en `sv_admision` ni en sus tablas relacionadas

