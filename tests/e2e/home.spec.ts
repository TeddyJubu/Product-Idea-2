import { test, expect } from '@playwright/test';

test('Home renders and can open Demo Mode', async ({ page }) => {
  // Go to home page
  await page.goto('/');

  // Expect welcome header and Try Demo Mode button
  await expect(page.getByRole('heading', { name: /welcome to idea ice/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /try demo mode/i })).toBeVisible();

  // Click Try Demo Mode (wrapped with Link → Button)
  await page.getByRole('button', { name: /try demo mode/i }).click();

  // Should navigate to /demo and show demo workspace header
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading', { name: /demo workspace/i })).toBeVisible();

  // Verify table shows ideas and known title exists
  await expect(page.getByText(/Ideas \(4\)/)).toBeVisible();
  await expect(page.getByText(/Mobile App Dark Mode/i)).toBeVisible();
});

