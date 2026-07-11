import { defineConfig, devices } from '@playwright/test';

/**
 * E2E de Gestor Hemodinamia. Orquesta el backend (contra la BD de test MySQL en
 * el puerto 3309) y el cliente Vite apuntado a ese backend local.
 * Requisitos previos: contenedor `hemo_testdb` levantado y sembrado
 * (ver server/test/camas-fixture.ts).
 */
export default defineConfig({
  testDir: './playwright-tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm --prefix ../server run start',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        DATABASE_TYPE: 'mysql',
        DATABASE_HOST: '127.0.0.1',
        DATABASE_PORT: '3309',
        DATABASE_USER: 'root',
        DATABASE_PASSWORD: 'test',
        DATABASE_NAME: 'db_bed_manager',
      },
    },
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
      env: { VITE_API_URL: 'http://localhost:3000' },
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
