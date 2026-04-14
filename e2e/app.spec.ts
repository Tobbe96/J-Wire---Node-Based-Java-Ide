import { test, expect } from '@playwright/test';

test.describe('JWire App', () => {
  test('loads the application', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // The app should render with the main canvas area
    await expect(page.locator('main[aria-label="Flow canvas"]')).toBeAttached();
  });

  test('has the correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/JWire/);
  });

  test('shows project sidebar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('aside[aria-label="Project sidebar"]')).toBeAttached();
  });

  test('shows code preview panel', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('aside[aria-label="Code preview and terminal"]')).toBeAttached();
  });

  test('can toggle theme', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const themeToggle = page.locator('button[aria-label*="mode"]');
    await expect(themeToggle).toBeAttached();
    // Get initial state
    const initialLabel = await themeToggle.getAttribute('aria-label');
    // Use dispatchEvent — the button may be outside viewport in headless CI
    await themeToggle.dispatchEvent('click');
    await page.waitForTimeout(500);
    // Label should change
    const newLabel = await themeToggle.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });

  test('can open documentation modal', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const docsButton = page.locator('button[aria-label="Open documentation"]');
    await expect(docsButton).toBeAttached();
    await docsButton.click({ force: true });
    // Modal should appear
    await expect(page.locator('[role="dialog"][aria-label="Documentation"]')).toBeVisible();
  });

  test('can close documentation modal with Escape', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const docsButton = page.locator('button[aria-label="Open documentation"]');
    await expect(docsButton).toBeAttached();
    await docsButton.click({ force: true });
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('displays React Flow canvas', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // React Flow renders a div with class "react-flow"
    await expect(page.locator('.react-flow')).toBeAttached();
  });
});
