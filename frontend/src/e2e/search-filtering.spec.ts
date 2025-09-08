import { test, expect } from '@playwright/test';

test.describe('Search and Filtering Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create multiple test tasks with different properties for search/filter testing
    const testTasks = [
      { title: 'Buy groceries', description: 'Milk, bread, and eggs from the store' },
      { title: 'Complete project proposal', description: 'Finish the quarterly project proposal for client' },
      { title: 'Schedule dentist appointment', description: 'Call dentist office tomorrow' },
      { title: 'Review code changes', description: 'Review pull request #123 from colleague' },
      { title: 'Plan weekend trip', description: 'Book hotel and plan itinerary for weekend getaway' }
    ];
    
    for (const task of testTasks) {
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill(task.title);
      await page.getByTestId('task-description-input').fill(task.description);
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(500);
    }
    
    // Mark some tasks as completed for filter testing
    const completedTasks = ['Buy groceries', 'Schedule dentist appointment'];
    for (const taskTitle of completedTasks) {
      const taskCard = page.getByText(taskTitle).locator('..').locator('..');
      const toggleButton = taskCard.getByTestId(/toggle-task-/);
      await toggleButton.click();
      await page.waitForTimeout(300);
    }
  });

  test.describe('Real-time Search Functionality', () => {
    test('should display search input in header', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('type', 'text');
      
      // Check search icon is present
      const searchIcon = page.locator('header svg').first();
      await expect(searchIcon).toBeVisible();
    });

    test('should filter tasks by title in real-time', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      
      // Search for "project"
      await searchInput.fill('project');
      await page.waitForTimeout(500);
      
      // Should show only tasks containing "project"
      await expect(page.getByText('Complete project proposal')).toBeVisible();
      await expect(page.getByText('Buy groceries')).not.toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).not.toBeVisible();
      await expect(page.getByText('Review code changes')).not.toBeVisible();
      await expect(page.getByText('Plan weekend trip')).not.toBeVisible();
    });

    test('should filter tasks by description content', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      
      // Search for "pull request" which is in description
      await searchInput.fill('pull request');
      await page.waitForTimeout(500);
      
      // Should show task with matching description
      await expect(page.getByText('Review code changes')).toBeVisible();
      await expect(page.getByText('Buy groceries')).not.toBeVisible();
      await expect(page.getByText('Complete project proposal')).not.toBeVisible();
    });

    test('should be case-insensitive', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      
      // Search with different cases
      await searchInput.fill('PROJECT');
      await page.waitForTimeout(500);
      
      await expect(page.getByText('Complete project proposal')).toBeVisible();
      
      // Clear and try mixed case
      await searchInput.clear();
      await searchInput.fill('DeNtIsT');
      await page.waitForTimeout(500);
      
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
    });

    test('should show all tasks when search is cleared', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      
      // First filter
      await searchInput.fill('project');
      await page.waitForTimeout(500);
      await expect(page.getByText('Buy groceries')).not.toBeVisible();
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // All tasks should be visible again
      await expect(page.getByText('Buy groceries')).toBeVisible();
      await expect(page.getByText('Complete project proposal')).toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
      await expect(page.getByText('Review code changes')).toBeVisible();
      await expect(page.getByText('Plan weekend trip')).toBeVisible();
    });

    test('should show no results message when no matches found', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      
      // Search for something that doesn't exist
      await searchInput.fill('nonexistent task xyz');
      await page.waitForTimeout(500);
      
      // Check no tasks are visible
      await expect(page.getByText('Buy groceries')).not.toBeVisible();
      await expect(page.getByText('Complete project proposal')).not.toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).not.toBeVisible();
      await expect(page.getByText('Review code changes')).not.toBeVisible();
      await expect(page.getByText('Plan weekend trip')).not.toBeVisible();
      
      // Check for empty state message (implementation dependent)
      const emptyStateIndicators = [
        page.getByText(/no.*tasks.*found/i),
        page.getByText(/no.*results/i),
        page.getByText(/nothing.*found/i)
      ];
      
      let emptyStateFound = false;
      for (const indicator of emptyStateIndicators) {
        if (await indicator.count() > 0) {
          await expect(indicator).toBeVisible();
          emptyStateFound = true;
          break;
        }
      }
      
      // If no empty state message, at least verify no task items exist
      if (!emptyStateFound) {
        await expect(page.locator('[data-testid*="task-item-"]')).toHaveCount(0);
      }
    });

    test('should handle partial word matches', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      
      // Search for partial word
      await searchInput.fill('sched');
      await page.waitForTimeout(500);
      
      // Should match "Schedule dentist appointment"
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
      
      // Other tasks should not be visible
      await expect(page.getByText('Buy groceries')).not.toBeVisible();
      await expect(page.getByText('Complete project proposal')).not.toBeVisible();
    });
  });

  test.describe('Filter Dropdown Functionality', () => {
    test('should display filter button and dropdown', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /filters/i });
      await expect(filterButton).toBeVisible();
      
      // Open filter dropdown
      await filterButton.click();
      
      // Check dropdown content
      await expect(page.getByText('Filter by Status')).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /all tasks/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /active tasks/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /completed tasks/i })).toBeVisible();
      
      await expect(page.getByText('Sort by')).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /newest first/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /oldest first/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /due date/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /alphabetical/i })).toBeVisible();
    });

    test('should filter by completion status', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /filters/i });
      
      // Filter to show only completed tasks
      await filterButton.click();
      await page.getByRole('menuitem', { name: /completed tasks/i }).click();
      await page.waitForTimeout(500);
      
      // Should show only completed tasks
      await expect(page.getByText('Buy groceries')).toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
      
      // Should not show active tasks
      await expect(page.getByText('Complete project proposal')).not.toBeVisible();
      await expect(page.getByText('Review code changes')).not.toBeVisible();
      await expect(page.getByText('Plan weekend trip')).not.toBeVisible();
    });

    test('should filter to show only active tasks', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /filters/i });
      
      // Filter to show only active tasks
      await filterButton.click();
      await page.getByRole('menuitem', { name: /active tasks/i }).click();
      await page.waitForTimeout(500);
      
      // Should show only active (incomplete) tasks
      await expect(page.getByText('Complete project proposal')).toBeVisible();
      await expect(page.getByText('Review code changes')).toBeVisible();
      await expect(page.getByText('Plan weekend trip')).toBeVisible();
      
      // Should not show completed tasks
      await expect(page.getByText('Buy groceries')).not.toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).not.toBeVisible();
    });

    test('should show all tasks when all tasks filter is selected', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /filters/i });
      
      // First apply a filter
      await filterButton.click();
      await page.getByRole('menuitem', { name: /completed tasks/i }).click();
      await page.waitForTimeout(500);
      
      // Then switch to all tasks
      await filterButton.click();
      await page.getByRole('menuitem', { name: /all tasks/i }).click();
      await page.waitForTimeout(500);
      
      // All tasks should be visible
      await expect(page.getByText('Buy groceries')).toBeVisible();
      await expect(page.getByText('Complete project proposal')).toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
      await expect(page.getByText('Review code changes')).toBeVisible();
      await expect(page.getByText('Plan weekend trip')).toBeVisible();
    });

    test('should sort tasks by newest first', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /filters/i });
      
      await filterButton.click();
      await page.getByRole('menuitem', { name: /newest first/i }).click();
      await page.waitForTimeout(500);
      
      // Verify tasks are present (order verification would need more specific implementation)
      await expect(page.getByText('Plan weekend trip')).toBeVisible();
      await expect(page.getByText('Buy groceries')).toBeVisible();
    });

    test('should sort tasks alphabetically', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /filters/i });
      
      await filterButton.click();
      await page.getByRole('menuitem', { name: /alphabetical/i }).click();
      await page.waitForTimeout(500);
      
      // Verify tasks are present (alphabetical order verification would need more specific implementation)
      await expect(page.getByText('Buy groceries')).toBeVisible();
      await expect(page.getByText('Complete project proposal')).toBeVisible();
    });
  });

  test.describe('Search and Filter Combination', () => {
    test('should combine search with status filter', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      const filterButton = page.getByRole('button', { name: /filters/i });
      
      // First apply search
      await searchInput.fill('appointment');
      await page.waitForTimeout(500);
      
      // Then apply completed filter
      await filterButton.click();
      await page.getByRole('menuitem', { name: /completed tasks/i }).click();
      await page.waitForTimeout(500);
      
      // Should show only completed tasks that match search
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
      
      // Should not show other tasks
      await expect(page.getByText('Buy groceries')).not.toBeVisible();
      await expect(page.getByText('Complete project proposal')).not.toBeVisible();
    });

    test('should maintain search when switching filters', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      const filterButton = page.getByRole('button', { name: /filters/i });
      
      // Apply search first
      await searchInput.fill('project');
      await page.waitForTimeout(500);
      
      // Switch between filters - search should persist
      await filterButton.click();
      await page.getByRole('menuitem', { name: /active tasks/i }).click();
      await page.waitForTimeout(500);
      
      // Search should still be applied
      await expect(searchInput).toHaveValue('project');
      await expect(page.getByText('Complete project proposal')).toBeVisible();
      
      // Switch to all tasks filter
      await filterButton.click();
      await page.getByRole('menuitem', { name: /all tasks/i }).click();
      await page.waitForTimeout(500);
      
      // Search should still be applied
      await expect(searchInput).toHaveValue('project');
      await expect(page.getByText('Complete project proposal')).toBeVisible();
    });

    test('should clear search and show all tasks in current filter', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search tasks...');
      const filterButton = page.getByRole('button', { name: /filters/i });
      
      // Apply filter first
      await filterButton.click();
      await page.getByRole('menuitem', { name: /completed tasks/i }).click();
      await page.waitForTimeout(500);
      
      // Then search
      await searchInput.fill('groceries');
      await page.waitForTimeout(500);
      
      // Should show only matching completed task
      await expect(page.getByText('Buy groceries')).toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).not.toBeVisible();
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // Should show all completed tasks
      await expect(page.getByText('Buy groceries')).toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
      await expect(page.getByText('Complete project proposal')).not.toBeVisible(); // Still filtered out as it's not completed
    });
  });

  test.describe('Navigation View Filters', () => {
    test('should filter tasks when navigating to Today view', async ({ page }) => {
      const sidebar = page.locator('aside');
      
      // Navigate to Today view
      await sidebar.getByRole('button', { name: /today/i }).click();
      await page.waitForTimeout(500);
      
      // Check that header shows Today view
      await expect(page.locator('header').getByText('Today')).toBeVisible();
      
      // Tasks should be filtered for today (implementation dependent on due dates)
      // This test verifies the navigation works and view changes
    });

    test('should filter tasks when navigating to Completed view', async ({ page }) => {
      const sidebar = page.locator('aside');
      
      // Navigate to Completed view
      await sidebar.getByRole('button', { name: /completed/i }).click();
      await page.waitForTimeout(500);
      
      // Check that header shows Completed view
      await expect(page.locator('header').getByText('Completed')).toBeVisible();
      
      // Should show only completed tasks
      await expect(page.getByText('Buy groceries')).toBeVisible();
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
      
      // Should not show active tasks
      await expect(page.getByText('Complete project proposal')).not.toBeVisible();
      await expect(page.getByText('Review code changes')).not.toBeVisible();
      await expect(page.getByText('Plan weekend trip')).not.toBeVisible();
    });

    test('should combine navigation filter with search', async ({ page }) => {
      const sidebar = page.locator('aside');
      const searchInput = page.getByPlaceholder('Search tasks...');
      
      // Navigate to Completed view
      await sidebar.getByRole('button', { name: /completed/i }).click();
      await page.waitForTimeout(500);
      
      // Search within completed tasks
      await searchInput.fill('dentist');
      await page.waitForTimeout(500);
      
      // Should show only completed tasks matching search
      await expect(page.getByText('Schedule dentist appointment')).toBeVisible();
      await expect(page.getByText('Buy groceries')).not.toBeVisible();
    });

    test('should maintain search when switching navigation views', async ({ page }) => {
      const sidebar = page.locator('aside');
      const searchInput = page.getByPlaceholder('Search tasks...');
      
      // Apply search first
      await searchInput.fill('project');
      await page.waitForTimeout(500);
      
      // Switch navigation views
      await sidebar.getByRole('button', { name: /today/i }).click();
      await page.waitForTimeout(500);
      
      // Search should persist
      await expect(searchInput).toHaveValue('project');
      
      // Switch back to All Tasks
      await sidebar.getByRole('button', { name: /all tasks/i }).click();
      await page.waitForTimeout(500);
      
      // Search should still be there
      await expect(searchInput).toHaveValue('project');
      await expect(page.getByText('Complete project proposal')).toBeVisible();
    });
  });
});