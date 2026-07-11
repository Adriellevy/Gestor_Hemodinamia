import 'dotenv/config';

/**
 * Configuración de entorno del backend de Gestor Hemodinamia.
 *
 * La sección `db` apunta a la base de datos de Gestor de Camas (`db_bed_manager`)
 * y se usa EXCLUSIVAMENTE en modo lectura. `synchronize` queda forzado a `false`
 * de forma dura en app.module.ts para no alterar el esquema de Camas.
 */
export const environment = {
  db: {
    type: process.env.DATABASE_TYPE || 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || '3306',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || 'db_bed_manager',
  },
  production: process.env.PRODUCTION ? process.env.PRODUCTION === 'true' : false,
  port: process.env.PORT || 3000,
};
