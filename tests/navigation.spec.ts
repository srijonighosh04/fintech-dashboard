import { test, expect } from '@playwright/test';

test.describe('AstraBank Page Redirections and Layouts E2E Checks', () => {
  test('should redirect unauthorized overview visits to login page', async ({ page }) => {
    // Unauthenticated user should not bypass guards
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should load login container with form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check titles
    await expect(page.locator('h1')).toContainText(/Log in/i);
    
    // Check input elements are present
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
