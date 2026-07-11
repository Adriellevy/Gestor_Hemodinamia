## ADDED Requirements

### Requirement: Conexión de solo lectura a la base de Gestor de Camas

El backend de Hemodinamia SHALL establecer una conexión TypeORM a la base de datos MySQL de Gestor de Camas (`db_bed_manager`) configurada por variables de entorno, y NO MUST modificar el esquema de esa base.

#### Scenario: Conexión configurada por entorno
- **WHEN** el server arranca con las variables `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD` y `DATABASE_NAME` definidas
- **THEN** el server establece una conexión TypeORM tipo `mysql` a esa base usando dichos valores
- **AND** no hay credenciales de base de datos hardcodeadas en el código versionado

#### Scenario: Synchronize deshabilitado siempre
- **WHEN** el server inicializa la conexión a la base de Camas
- **THEN** TypeORM se configura con `synchronize: false`
- **AND** el server no ejecuta ninguna sentencia DDL (create/alter/drop) contra tablas `sv_`

#### Scenario: Solo entidades espejo necesarias
- **WHEN** se registra la conexión TypeORM
- **THEN** solo se cargan las entidades espejo de las tablas que Hemodinamia consume (`sv_patient`, `sv_admision`, `sv_bed_admission`, `sv_bed`, `sv_sector`)
- **AND** dichas entidades se usan exclusivamente para operaciones de lectura

#### Scenario: Secreto de conexión fuera del repositorio
- **WHEN** se revisa el repositorio
- **THEN** el archivo `.env` con credenciales reales está ignorado por git
- **AND** existe un `.env.example` versionado sin valores sensibles que documenta las variables requeridas
