import { test, expect } from '@playwright/test';

/**
 * Verifica, a través de la UI, que los datos de pacientes/internaciones provienen
 * de la base de Gestor de Camas: el padrón (derivado de admisiones activas de
 * Camas) encuentra a un paciente real y muestra su ubicación (cama/sector).
 */
test.describe('Integración con la base de Camas (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login: seleccionar un perfil médico (u1 = Dra. Acosta) y entrar.
    await page.getByRole('combobox').selectOption('u1');
    await page.getByRole('button', { name: /Entrar al sistema/i }).click();
  });

  test('el padrón muestra un paciente real de Camas con su ubicación', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Nuevo estudio/i }).click();

    // Marta Gonzalez está internada en Camas (HC 1042318, cama UCO 2).
    await page.getByPlaceholder(/Ingresá la HC/i).fill('1042318');

    await expect(
      page.getByText(/Paciente encontrado en el padrón/i),
    ).toBeVisible();
    await expect(page.getByText(/Gonzalez, Marta/i)).toBeVisible();
    await expect(page.getByText('UCO 2')).toBeVisible();
  });
});
