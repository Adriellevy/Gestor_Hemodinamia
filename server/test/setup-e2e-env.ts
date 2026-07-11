// Apunta el e2e a la base de datos de test (contenedor MySQL dedicado).
// Se ejecuta antes de importar AppModule/environment.ts.
process.env.DATABASE_TYPE = process.env.DATABASE_TYPE || 'mysql';
process.env.DATABASE_HOST = process.env.DATABASE_HOST || '127.0.0.1';
process.env.DATABASE_PORT = process.env.DATABASE_PORT || '3309';
process.env.DATABASE_USER = process.env.DATABASE_USER || 'root';
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || 'test';
process.env.DATABASE_NAME = process.env.DATABASE_NAME || 'db_bed_manager';
