# pacientes-desde-camas Specification

## Purpose
TBD - created by archiving change conectar-db-camas. Update Purpose after archive.
## Requirements
### Requirement: Lectura de pacientes desde la base de Camas

El endpoint de pacientes de Hemodinamia SHALL obtener los pacientes desde la tabla `sv_patient` de Gestor de Camas en lugar de los datos en memoria, y SHALL devolverlos con el mismo contrato `Paciente` que consume el cliente-web.

#### Scenario: Listado de pacientes desde la base real
- **WHEN** el cliente-web solicita el listado de pacientes
- **THEN** el backend consulta `sv_patient` en la base de Camas
- **AND** responde con objetos `Paciente` (`id`, `hc`, `documento`, `apellido`, `nombre`, `fechaNacimiento`, `sexo`, `obraSocial?`) sin cambios en la forma de la respuesta

#### Scenario: Mapeo de esquema Camas a contrato español
- **WHEN** se transforma un registro de `sv_patient` a `Paciente`
- **THEN** `document_type` y `document_number` se mapean a `documento.tipo` y `documento.numero`
- **AND** `hc_number` se mapea a `hc`
- **AND** `birthdate` se mapea a `fechaNacimiento` y `gender` a `sexo`
- **AND** `fullname` se separa en `apellido` y `nombre` según la convención "Nombre Apellido" (última palabra = apellido, resto = nombre)
- **AND** `obraSocial` se resuelve desde la relación `healthcare_provider` (`sv_healthcare_provider`), o queda ausente si el paciente no tiene una asociada

#### Scenario: No hay escritura sobre pacientes de Camas
- **WHEN** se ejecuta cualquier operación del módulo de pacientes contra la base de Camas
- **THEN** solo se realizan lecturas
- **AND** el sistema no crea ni modifica registros en `sv_patient`

