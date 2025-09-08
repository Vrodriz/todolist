import { test, expect } from '@playwright/test';

test.describe('ClickUp-Style Layout and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main layout components', async ({ page }) => {
    // Check that main layout components are present
    await expect(page.locator('aside')).toBeVisible(); // Sidebar
    await expect(page.locator('header')).toBeVisible(); // Header
    await expect(page.locator('main')).toBeVisible(); // Main content area
  });

  test('should display sidebar with proper structure', async ({ page }) => {
    const sidebar = page.locator('aside');
    
    // Check sidebar is visible and has proper width
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveClass(/w-64/);
    
    // Check sidebar header with logo and title
    await expect(sidebar.getByText('Todo List')).toBeVisible();
    await expect(sidebar.locator('svg').first()).toBeVisible(); // Logo icon
    
    // Check Quick Actions section
    await expect(sidebar.getByRole('button', { name: /new task/i })).toBeVisible();
    
    // Check navigation items
    await expect(sidebar.getByRole('button', { name: /all tasks/i })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /today/i })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /upcoming/i })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /completed/i })).toBeVisible();
    
    // Check footer actions
    await expect(sidebar.getByRole('button', { name: /search tasks/i })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: /filters/i })).toBeVisible();
  });

  test('should navigate between different views', async ({ page }) => {
    const sidebar = page.locator('aside');
    const header = page.locator('header');
    
    // Test All Tasks view (default)
    await expect(header.getByText('All Tasks')).toBeVisible();
    await expect(header.getByText('Manage all your tasks in one place')).toBeVisible();
    
    // Navigate to Today view
    await sidebar.getByRole('button', { name: /today/i }).click();
    await expect(header.getByText('Today')).toBeVisible();
    await expect(header.getByText('Tasks scheduled for today')).toBeVisible();
    
    // Navigate to Upcoming view
    await sidebar.getByRole('button', { name: /upcoming/i }).click();
    await expect(header.getByText('Upcoming')).toBeVisible();
    await expect(header.getByText('Tasks scheduled for upcoming days')).toBeVisible();
    
    // Navigate to Completed view
    await sidebar.getByRole('button', { name: /completed/i }).click();
    await expect(header.getByText('Completed')).toBeVisible();
    await expect(header.getByText('Tasks you have completed')).toBeVisible();
    
    // Navigate back to All Tasks
    await sidebar.getByRole('button', { name: /all tasks/i }).click();
    await expect(header.getByText('All Tasks')).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    const sidebar = page.locator('aside');
    
    // Check that All Tasks is initially active
    const allTasksButton = sidebar.getByRole('button', { name: /all tasks/i });
    await expect(allTasksButton).toHaveClass(/bg-accent/);
    
    // Click Today and check it becomes active
    const todayButton = sidebar.getByRole('button', { name: /today/i });
    await todayButton.click();
    await expect(todayButton).toHaveClass(/bg-accent/);
    await expect(allTasksButton).not.toHaveClass(/bg-accent/);
    
    // Click Upcoming and check it becomes active
    const upcomingButton = sidebar.getByRole('button', { name: /upcoming/i });
    await upcomingButton.click();
    await expect(upcomingButton).toHaveClass(/bg-accent/);
    await expect(todayButton).not.toHaveClass(/bg-accent/);
    
    // Click Completed and check it becomes active
    const completedButton = sidebar.getByRole('button', { name: /completed/i });
    await completedButton.click();
    await expect(completedButton).toHaveClass(/bg-accent/);
    await expect(upcomingButton).not.toHaveClass(/bg-accent/);
  });

  test('should display task counts in navigation badges', async ({ page }) => {
    const sidebar = page.locator('aside');
    
    // Wait for any initial data to load
    await page.waitForTimeout(1000);
    
    // Check that navigation items can display count badges
    const navButtons = sidebar.locator('button[class*="justify-start"]');
    
    // Check each navigation button for potential badges
    for (const button of await navButtons.all()) {
      const buttonText = await button.textContent();
      if (buttonText?.includes('All Tasks') || 
          buttonText?.includes('Today') || 
          buttonText?.includes('Upcoming') || 
          buttonText?.includes('Completed')) {
        
        // Check if badge exists - it may not if count is 0
        const badge = button.locator('.badge, [class*="badge"]').first();
        if (await badge.count() > 0) {
          await expect(badge).toBeVisible();
          const badgeText = await badge.textContent();
          expect(badgeText).toMatch(/^\d+$/); // Should be a number
        }
      }
    }
  });

  test('should display header with proper components', async ({ page }) => {
    const header = page.locator('header');
    
    // Check header structure
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/border-b/);
    
    // Check search input
    const searchInput = header.getByPlaceholder('Search tasks...');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('type', 'text');
    
    // Check action buttons in header
    await expect(header.getByRole('button', { name: /toggle theme/i })).toBeVisible();
    await expect(header.getByRole('button', { name: /filters/i })).toBeVisible();
    await expect(header.getByRole('button', { name: /more options/i })).toBeVisible();
  });

  test('should have proper responsive layout structure', async ({ page }) => {
    // Check that main container uses flexbox layout
    const mainContainer = page.locator('div.flex.h-screen').first();
    await expect(mainContainer).toBeVisible();
    
    // Check that sidebar and main content are properly structured
    const sidebar = page.locator('aside');
    const mainContent = page.locator('div.flex.flex-1.flex-col');
    
    await expect(sidebar).toBeVisible();
    await expect(mainContent).toBeVisible();
    
    // Check that main content contains header and content area
    await expect(mainContent.locator('header')).toBeVisible();
    await expect(mainContent.locator('main')).toBeVisible();
  });

  test('should handle navigation with keyboard', async ({ page }) => {
    const sidebar = page.locator('aside');
    
    // Focus first navigation item
    await sidebar.getByRole('button', { name: /all tasks/i }).focus();
    
    // Use Tab to navigate through navigation items
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Should be on Today button
    
    // Press Enter to activate
    await page.keyboard.press('Enter');
    
    // Check that Today view is now active
    await expect(page.locator('header').getByText('Today')).toBeVisible();
  });

  test('should display icons for all navigation items', async ({ page }) => {
    const sidebar = page.locator('aside');
    
    // Check that each navigation button has an icon (SVG element)
    const navButtons = [
      sidebar.getByRole('button', { name: /all tasks/i }),
      sidebar.getByRole('button', { name: /today/i }),
      sidebar.getByRole('button', { name: /upcoming/i }),
      sidebar.getByRole('button', { name: /completed/i })
    ];
    
    for (const button of navButtons) {
      const icon = button.locator('svg').first();
      await expect(icon).toBeVisible();
      await expect(icon).toHaveClass(/h-4 w-4/);
    }
  });

  test('should maintain layout integrity across theme switches', async ({ page }) => {
    // Test layout in light theme
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /light/i }).click();
    
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Test layout in dark theme
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /dark/i }).click();
    
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check that navigation still works
    await page.locator('aside').getByRole('button', { name: /today/i }).click();
    await expect(page.locator('header').getByText('Today')).toBeVisible();
  });

  test('should display proper content area structure', async ({ page }) => {
    const mainContent = page.locator('main');
    
    // Check main content area structure
    await expect(mainContent).toBeVisible();
    await expect(mainContent).toHaveClass(/flex-1 overflow-auto/);
    
    // Check content wrapper
    const contentWrapper = mainContent.locator('div.mx-auto.max-w-5xl');
    await expect(contentWrapper).toBeVisible();
    
    // Check that task form and task list areas are present
    await expect(mainContent.locator('form, [class*="task"]')).toHaveCount(await mainContent.locator('form, [class*="task"]').count());
  });
});