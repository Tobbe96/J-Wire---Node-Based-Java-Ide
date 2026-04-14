import { test, expect } from '@playwright/test';

test.describe('DevFlow App', () => {
  test('loads the application', async ({ page }) => {
    await page.goto('/');
    // The app should render with the main canvas area
    await expect(page.locator('main[aria-label="Flow canvas"]')).toBeVisible();
  });

  test('has the correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DevFlow/);
  });

  test('shows project sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside[aria-label="Project sidebar"]')).toBeVisible();
  });

  test('shows code preview panel', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside[aria-label="Code preview and terminal"]')).toBeVisible();
  });

  test('can toggle theme', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.locator('button[aria-label*="mode"]');
    await expect(themeToggle).toBeVisible();
    // Get initial state
    const initialLabel = await themeToggle.getAttribute('aria-label');
    // Click to toggle
    await themeToggle.click();
    // Label should change
    const newLabel = await themeToggle.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });

  test('can open documentation modal', async ({ page }) => {
    await page.goto('/');
    const docsButton = page.locator('button[aria-label="Open documentation"]');
    await expect(docsButton).toBeVisible();
    await docsButton.click();
    // Modal should appear
    await expect(page.locator('[role="dialog"][aria-label="Documentation"]')).toBeVisible();
  });

  test('can close documentation modal with Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Open documentation"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('displays React Flow canvas', async ({ page }) => {
    await page.goto('/');
    // React Flow renders a div with class "react-flow"
    await expect(page.locator('.react-flow')).toBeVisible();
  });
});
