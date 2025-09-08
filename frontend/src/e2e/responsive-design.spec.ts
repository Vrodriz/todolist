import { test, expect } from '@playwright/test';

test.describe('Responsive Design and Mobile Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Desktop Layout (1920x1080)', () => {
    test('should display full layout on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // All main components should be visible
      await expect(page.locator('aside')).toBeVisible(); // Sidebar
      await expect(page.locator('header')).toBeVisible(); // Header
      await expect(page.locator('main')).toBeVisible(); // Main content
      
      // Sidebar should have full width
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveClass(/w-64/);
      
      // Header should have all elements
      await expect(page.getByPlaceholder('Search tasks...')).toBeVisible();
      await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /filters/i })).toBeVisible();
    });

    test('should have proper spacing and layout on large screens', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Check main content has max width constraint
      const contentWrapper = page.locator('main div.mx-auto.max-w-5xl');
      await expect(contentWrapper).toBeVisible();
      
      // Check header layout
      const header = page.locator('header');
      const headerContent = header.locator('div.flex.items-center.justify-between');
      await expect(headerContent).toBeVisible();
    });
  });

  test.describe('Tablet Layout (768px)', () => {
    test('should adapt layout for tablet size', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Main components should still be visible
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Content should be responsive
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Check that content adapts to smaller width
      const contentWrapper = main.locator('div.mx-auto');
      await expect(contentWrapper).toBeVisible();
    });

    test('should maintain functionality on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Navigation should work
      await page.locator('aside').getByRole('button', { name: /today/i }).click();
      await expect(page.getByText('Today')).toBeVisible();
      
      // Search should work
      await page.getByPlaceholder('Search tasks...').fill('test');
      await expect(page.getByPlaceholder('Search tasks...')).toHaveValue('test');
      
      // Task creation should work
      await page.getByTestId('open-task-form').click();
      await expect(page.getByText('Create New Task')).toBeVisible();
    });
  });

  test.describe('Mobile Layout (375px)', () => {
    test('should handle mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Main layout should still be functional
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Check if sidebar behavior changes on mobile (implementation dependent)
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();
    });

    test('should have touch-friendly interface on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Buttons should be large enough for touch
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
        
        // Check minimum touch target size (at least 44px is recommended)
        const buttonBox = await firstButton.boundingBox();
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(32); // Reasonable minimum
        }
      }
    });

    test('should stack form elements on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Open task form
      await page.getByTestId('open-task-form').click();
      
      // Form should be visible and usable
      await expect(page.getByTestId('task-title-input')).toBeVisible();
      await expect(page.getByTestId('task-description-input')).toBeVisible();
      await expect(page.getByTestId('task-due-date-input')).toBeVisible();
      
      // Action buttons should be stacked or properly sized
      const createButton = page.getByTestId('create-task-button');
      const cancelButton = page.getByTestId('cancel-task-button');
      
      await expect(createButton).toBeVisible();
      await expect(cancelButton).toBeVisible();
    });

    test('should handle mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigation should work on mobile
      const sidebar = page.locator('aside');
      
      // Check if navigation items are accessible
      await sidebar.getByRole('button', { name: /today/i }).click();
      await expect(page.getByText('Today')).toBeVisible();
      
      await sidebar.getByRole('button', { name: /upcoming/i }).click();
      await expect(page.getByText('Upcoming')).toBeVisible();
    });

    test('should handle mobile search and filters', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Search should be accessible
      const searchInput = page.getByPlaceholder('Search tasks...');
      await expect(searchInput).toBeVisible();
      
      // Search input should be appropriately sized
      const searchBox = await searchInput.boundingBox();
      if (searchBox) {
        expect(searchBox.width).toBeGreaterThan(100); // Should have reasonable width
      }
      
      // Filter button should be accessible
      const filterButton = page.getByRole('button', { name: /filters/i });
      await expect(filterButton).toBeVisible();
      
      // Filter dropdown should work
      await filterButton.click();
      await expect(page.getByText('Filter by Status')).toBeVisible();
    });
  });

  test.describe('Small Mobile Layout (320px)', () => {
    test('should handle very small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      // Core functionality should still work
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Task creation should still be possible
      await page.getByTestId('open-task-form').click();
      await expect(page.getByText('Create New Task')).toBeVisible();
    });

    test('should handle text overflow and wrapping', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      // Create a task with long title
      await page.getByTestId('open-task-form').click();
      const longTitle = 'This is a very long task title that should wrap properly on small screens without breaking the layout';
      await page.getByTestId('task-title-input').fill(longTitle);
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
      
      // Task should be visible and text should wrap
      await expect(page.getByText(longTitle)).toBeVisible();
      
      // Check that the task card doesn't overflow
      const taskCard = page.locator('[data-testid*="task-item-"]').first();
      if (await taskCard.count() > 0) {
        const cardBox = await taskCard.boundingBox();
        if (cardBox) {
          expect(cardBox.width).toBeLessThanOrEqual(320); // Shouldn't exceed viewport width
        }
      }
    });
  });

  test.describe('Landscape and Portrait Orientations', () => {
    test('should handle landscape orientation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 }); // iPhone SE landscape
      
      // Layout should adapt to landscape
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Functionality should remain intact
      await page.getByTestId('open-task-form').click();
      await expect(page.getByText('Create New Task')).toBeVisible();
    });

    test('should handle portrait orientation on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad portrait
      
      // Should use available vertical space effectively
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Content should be well-spaced
      const main = page.locator('main');
      const mainBox = await main.boundingBox();
      if (mainBox) {
        expect(mainBox.height).toBeGreaterThan(500); // Should use vertical space
      }
    });
  });

  test.describe('Cross-Screen Size Consistency', () => {
    test('should maintain theme consistency across screen sizes', async ({ page }) => {
      // Test theme switching on different screen sizes
      const screenSizes = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 }    // Mobile
      ];
      
      for (const size of screenSizes) {
        await page.setViewportSize(size);
        
        // Switch to dark theme
        await page.getByRole('button', { name: /toggle theme/i }).click();
        await page.getByRole('menuitem', { name: /dark/i }).click();
        
        // Check theme is applied
        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveClass(/dark/);
        
        // Switch to light theme
        await page.getByRole('button', { name: /toggle theme/i }).click();
        await page.getByRole('menuitem', { name: /light/i }).click();
        
        // Check theme is applied
        await expect(htmlElement).toHaveClass(/light/);
      }
    });

    test('should maintain navigation consistency across screen sizes', async ({ page }) => {
      const screenSizes = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 }    // Mobile
      ];
      
      for (const size of screenSizes) {
        await page.setViewportSize(size);
        
        // Navigation should work consistently
        await page.locator('aside').getByRole('button', { name: /today/i }).click();
        await expect(page.getByText('Today')).toBeVisible();
        
        await page.locator('aside').getByRole('button', { name: /completed/i }).click();
        await expect(page.getByText('Completed')).toBeVisible();
        
        await page.locator('aside').getByRole('button', { name: /all tasks/i }).click();
        await expect(page.getByText('All Tasks')).toBeVisible();
      }
    });

    test('should handle zoom levels properly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Test different zoom levels (simulated by changing viewport)
      const zoomLevels = [
        { width: 1920, height: 1080 },  // 100%
        { width: 1536, height: 864 },   // 125% (80% viewport)
        { width: 1280, height: 720 },   // 150% (67% viewport)
      ];
      
      for (const zoomSize of zoomLevels) {
        await page.setViewportSize(zoomSize);
        
        // Core elements should remain visible and functional
        await expect(page.locator('aside')).toBeVisible();
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        
        // Interactive elements should remain accessible
        await expect(page.getByTestId('open-task-form')).toBeVisible();
        await expect(page.getByPlaceholder('Search tasks...')).toBeVisible();
      }
    });
  });

  test.describe('Content Overflow and Scrolling', () => {
    test('should handle content overflow properly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Create multiple tasks to test scrolling
      const taskTitles = [
        'First task for overflow testing',
        'Second task for overflow testing',
        'Third task for overflow testing',
        'Fourth task for overflow testing',
        'Fifth task for overflow testing'
      ];
      
      for (const title of taskTitles) {
        await page.getByTestId('open-task-form').click();
        await page.getByTestId('task-title-input').fill(title);
        await page.getByTestId('create-task-button').click();
        await page.waitForTimeout(500);
      }
      
      // Main content should be scrollable if needed
      const main = page.locator('main');
      await expect(main).toHaveClass(/overflow-auto/);
      
      // All tasks should be accessible (either visible or scrollable to)
      await expect(page.getByText('First task for overflow testing')).toBeVisible();
      await expect(page.getByText('Fifth task for overflow testing')).toBeVisible();
    });

    test('should handle long text content properly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Create task with very long description
      const longDescription = 'This is an extremely long task description that should wrap properly and not break the layout on small screens. It contains multiple sentences and should demonstrate how the application handles text overflow and wrapping in various components and screen sizes.';
      
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill('Task with long description');
      await page.getByTestId('task-description-input').fill(longDescription);
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
      
      // Description should be visible and wrapped
      await expect(page.getByText(longDescription)).toBeVisible();
      
      // Task card should not overflow horizontally
      const taskCard = page.locator('[data-testid*="task-item-"]').first();
      if (await taskCard.count() > 0) {
        const cardBox = await taskCard.boundingBox();
        if (cardBox) {
          expect(cardBox.width).toBeLessThanOrEqual(375);
        }
      }
    });
  });

  test.describe('Touch and Click Interactions', () => {
    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Create a task first
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill('Touch Test Task');
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
      
      // Test touch interactions
      const toggleButton = page.getByTestId(/toggle-task-/).first();
      
      // Tap to complete task
      await toggleButton.tap();
      await page.waitForTimeout(500);
      
      // Check task is marked as completed
      await expect(page.getByText('Touch Test Task')).toHaveClass(/line-through/);
      
      // Tap again to uncomplete
      await toggleButton.tap();
      await page.waitForTimeout(500);
      
      // Check task is uncompleted
      await expect(page.getByText('Touch Test Task')).not.toHaveClass(/line-through/);
    });

    test('should have appropriate touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that interactive elements meet minimum touch target size
      const interactiveElements = [
        page.getByTestId('open-task-form'),
        page.getByRole('button', { name: /toggle theme/i }),
        page.getByRole('button', { name: /filters/i }),
        page.locator('aside').getByRole('button', { name: /all tasks/i })
      ];
      
      for (const element of interactiveElements) {
        if (await element.count() > 0) {
          const box = await element.boundingBox();
          if (box) {
            // Minimum touch target should be at least 32px (though 44px is preferred)
            expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(32);
          }
        }
      }
    });
  });
});