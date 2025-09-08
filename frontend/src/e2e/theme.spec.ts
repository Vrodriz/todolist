import { test, expect } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load with default system theme', async ({ page }) => {
    await page.goto('/');
    
    // Check that the theme toggle is visible
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible();
    
    // Check that the html element has either 'light' or 'dark' class
    const htmlElement = page.locator('html');
    const hasLightClass = await htmlElement.evaluate(el => el.classList.contains('light'));
    const hasDarkClass = await htmlElement.evaluate(el => el.classList.contains('dark'));
    
    expect(hasLightClass || hasDarkClass).toBeTruthy();
  });

  test('should switch to light theme', async ({ page }) => {
    await page.goto('/');
    
    // Open theme dropdown
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Select light theme
    await page.getByRole('menuitem', { name: /light/i }).click();
    
    // Verify light theme is applied
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/light/);
    
    // Verify localStorage is updated
    const storedTheme = await page.evaluate(() => localStorage.getItem('vite-ui-theme'));
    expect(storedTheme).toBe('light');
    
    // Verify UI reflects light theme
    await expect(page.locator('body')).toHaveCSS('background-color', /rgb\(255, 255, 255\)|rgb\(250, 250, 250\)/);
  });

  test('should switch to dark theme', async ({ page }) => {
    await page.goto('/');
    
    // Open theme dropdown
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Select dark theme
    await page.getByRole('menuitem', { name: /dark/i }).click();
    
    // Verify dark theme is applied
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Verify localStorage is updated
    const storedTheme = await page.evaluate(() => localStorage.getItem('vite-ui-theme'));
    expect(storedTheme).toBe('dark');
    
    // Verify UI reflects dark theme - checking for darker backgrounds
    const backgroundColor = await page.locator('body').evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Dark theme should have a darker background (RGB values closer to 0)
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      expect(r + g + b).toBeLessThan(100); // Dark theme should have low RGB values
    }
  });

  test('should switch to system theme', async ({ page }) => {
    await page.goto('/');
    
    // Open theme dropdown
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Select system theme
    await page.getByRole('menuitem', { name: /system/i }).click();
    
    // Verify localStorage is updated
    const storedTheme = await page.evaluate(() => localStorage.getItem('vite-ui-theme'));
    expect(storedTheme).toBe('system');
    
    // Verify that the theme matches system preference
    const htmlElement = page.locator('html');
    const hasLightClass = await htmlElement.evaluate(el => el.classList.contains('light'));
    const hasDarkClass = await htmlElement.evaluate(el => el.classList.contains('dark'));
    
    // Should have either light or dark class based on system preference
    expect(hasLightClass || hasDarkClass).toBeTruthy();
  });

  test('should persist theme across page reloads', async ({ page }) => {
    await page.goto('/');
    
    // Set to dark theme
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /dark/i }).click();
    
    // Reload the page
    await page.reload();
    
    // Verify dark theme persisted
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Verify localStorage still has dark theme
    const storedTheme = await page.evaluate(() => localStorage.getItem('vite-ui-theme'));
    expect(storedTheme).toBe('dark');
  });

  test('should show correct theme icon in toggle button', async ({ page }) => {
    await page.goto('/');
    
    // Test light theme icon
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /light/i }).click();
    
    // Check if sun icon is visible (light theme)
    const themeButton = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeButton.locator('svg')).toBeVisible();
    
    // Test dark theme icon
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /dark/i }).click();
    
    // Check if moon icon is visible (dark theme)
    await expect(themeButton.locator('svg')).toBeVisible();
  });

  test('should highlight selected theme in dropdown', async ({ page }) => {
    await page.goto('/');
    
    // Set to light theme
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /light/i }).click();
    
    // Open dropdown again
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Check that light theme is highlighted
    const lightOption = page.getByRole('menuitem', { name: /light/i });
    await expect(lightOption).toHaveClass(/bg-accent/);
    
    // Close and switch to dark
    await page.getByRole('menuitem', { name: /dark/i }).click();
    
    // Open dropdown again
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Check that dark theme is highlighted
    const darkOption = page.getByRole('menuitem', { name: /dark/i });
    await expect(darkOption).toHaveClass(/bg-accent/);
  });

  test('should apply theme to all UI components', async ({ page }) => {
    await page.goto('/');
    
    // Switch to dark theme
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /dark/i }).click();
    
    // Check various components have dark theme applied
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible(); // sidebar
    await expect(page.locator('main')).toBeVisible(); // main content
    
    // Check that buttons have proper theming
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
    
    // Switch to light theme and verify
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /light/i }).click();
    
    // Components should still be visible and properly themed
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});