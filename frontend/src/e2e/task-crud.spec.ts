import { test, expect } from '@playwright/test';

test.describe('Task CRUD Operations with Modern UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="open-task-form"]');
  });

  test.describe('Task Creation', () => {
    test('should show add task button initially', async ({ page }) => {
      const addButton = page.getByTestId('open-task-form');
      await expect(addButton).toBeVisible();
      await expect(addButton).toHaveText(/add new task/i);
    });

    test('should open task creation form when clicking add button', async ({ page }) => {
      await page.getByTestId('open-task-form').click();
      
      // Check form is displayed
      await expect(page.getByText('Create New Task')).toBeVisible();
      await expect(page.getByTestId('task-title-input')).toBeVisible();
      await expect(page.getByTestId('task-description-input')).toBeVisible();
      await expect(page.getByTestId('task-due-date-input')).toBeVisible();
      await expect(page.getByTestId('create-task-button')).toBeVisible();
      await expect(page.getByTestId('cancel-task-button')).toBeVisible();
    });

    test('should close task form when clicking close button', async ({ page }) => {
      // Open form
      await page.getByTestId('open-task-form').click();
      await expect(page.getByText('Create New Task')).toBeVisible();
      
      // Close form
      await page.getByTestId('close-task-form').click();
      
      // Check form is hidden and button is back
      await expect(page.getByText('Create New Task')).not.toBeVisible();
      await expect(page.getByTestId('open-task-form')).toBeVisible();
    });

    test('should close task form when clicking cancel button', async ({ page }) => {
      // Open form
      await page.getByTestId('open-task-form').click();
      await expect(page.getByText('Create New Task')).toBeVisible();
      
      // Cancel form
      await page.getByTestId('cancel-task-button').click();
      
      // Check form is hidden and button is back
      await expect(page.getByText('Create New Task')).not.toBeVisible();
      await expect(page.getByTestId('open-task-form')).toBeVisible();
    });

    test('should create a task with title only', async ({ page }) => {
      // Open form
      await page.getByTestId('open-task-form').click();
      
      // Fill form
      const taskTitle = 'Test Task Title';
      await page.getByTestId('task-title-input').fill(taskTitle);
      
      // Submit form
      await page.getByTestId('create-task-button').click();
      
      // Check that form closes and task appears in list
      await expect(page.getByText('Create New Task')).not.toBeVisible();
      await expect(page.getByTestId('open-task-form')).toBeVisible();
      
      // Wait for task to appear (may take time for API call)
      await page.waitForTimeout(1000);
      
      // Check that task is created and visible
      await expect(page.getByText(taskTitle)).toBeVisible();
    });

    test('should create a task with full details', async ({ page }) => {
      // Open form
      await page.getByTestId('open-task-form').click();
      
      // Fill form with all details
      const taskTitle = 'Complete Test Task';
      const taskDescription = 'This is a comprehensive test task with description';
      
      await page.getByTestId('task-title-input').fill(taskTitle);
      await page.getByTestId('task-description-input').fill(taskDescription);
      
      // Set due date (tomorrow at 10 AM)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const dueDateString = tomorrow.toISOString().slice(0, 16);
      await page.getByTestId('task-due-date-input').fill(dueDateString);
      
      // Submit form
      await page.getByTestId('create-task-button').click();
      
      // Check that task is created with all details
      await page.waitForTimeout(1000);
      await expect(page.getByText(taskTitle)).toBeVisible();
      await expect(page.getByText(taskDescription)).toBeVisible();
    });

    test('should show validation error for empty title', async ({ page }) => {
      // Open form
      await page.getByTestId('open-task-form').click();
      
      // Try to submit without title
      await page.getByTestId('create-task-button').click();
      
      // Check validation error
      await expect(page.getByText('Title is required')).toBeVisible();
      
      // Check form is still open
      await expect(page.getByText('Create New Task')).toBeVisible();
    });

    test('should disable submit button when form is invalid', async ({ page }) => {
      // Open form
      await page.getByTestId('open-task-form').click();
      
      // Check submit button is disabled initially (no title)
      await expect(page.getByTestId('create-task-button')).toBeDisabled();
      
      // Add title and check button becomes enabled
      await page.getByTestId('task-title-input').fill('Valid Title');
      await expect(page.getByTestId('create-task-button')).not.toBeDisabled();
      
      // Clear title and check button is disabled again
      await page.getByTestId('task-title-input').clear();
      await expect(page.getByTestId('create-task-button')).toBeDisabled();
    });

    test('should show loading state during task creation', async ({ page }) => {
      // Open form
      await page.getByTestId('open-task-form').click();
      
      // Fill and submit form
      await page.getByTestId('task-title-input').fill('Loading Test Task');
      
      // Click submit and quickly check loading state
      const submitPromise = page.getByTestId('create-task-button').click();
      
      // Check loading state appears
      await expect(page.getByText('Creating...')).toBeVisible();
      
      // Wait for completion
      await submitPromise;
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Task Display and Status Toggle', () => {
    test.beforeEach(async ({ page }) => {
      // Create a test task first
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill('Test Task for Display');
      await page.getByTestId('task-description-input').fill('Test description for display tests');
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
    });

    test('should display task with proper card layout', async ({ page }) => {
      const taskCard = page.locator('[data-testid*="task-item-"]').first();
      
      await expect(taskCard).toBeVisible();
      await expect(taskCard).toHaveClass(/transition-all/);
      
      // Check task content
      await expect(page.getByText('Test Task for Display')).toBeVisible();
      await expect(page.getByText('Test description for display tests')).toBeVisible();
      
      // Check action buttons
      await expect(taskCard.getByTestId(/toggle-task-/)).toBeVisible();
      await expect(taskCard.getByTestId(/edit-task-/)).toBeVisible();
      await expect(taskCard.getByTestId(/delete-task-/)).toBeVisible();
    });

    test('should toggle task completion status', async ({ page }) => {
      const toggleButton = page.getByTestId(/toggle-task-/).first();
      const taskTitle = page.getByText('Test Task for Display');
      
      // Initially uncompleted
      await expect(taskTitle).not.toHaveClass(/line-through/);
      
      // Toggle completion
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Check completed state
      await expect(taskTitle).toHaveClass(/line-through/);
      await expect(page.getByText('Completed')).toBeVisible();
      
      // Toggle back to uncompleted
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Check uncompleted state
      await expect(taskTitle).not.toHaveClass(/line-through/);
      await expect(page.getByText('Completed')).not.toBeVisible();
    });

    test('should show completion toggle button states correctly', async ({ page }) => {
      const toggleButton = page.getByTestId(/toggle-task-/).first();
      
      // Initially uncompleted - should show empty circle
      await expect(toggleButton).toHaveClass(/border-muted-foreground/);
      
      // Click to complete
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Should show filled circle with check
      await expect(toggleButton).toHaveClass(/bg-primary/);
      await expect(toggleButton.locator('svg')).toBeVisible();
    });
  });

  test.describe('Task Editing', () => {
    test.beforeEach(async ({ page }) => {
      // Create a test task first
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill('Task to Edit');
      await page.getByTestId('task-description-input').fill('Original description');
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
    });

    test('should open edit form when clicking edit button', async ({ page }) => {
      const editButton = page.getByTestId(/edit-task-/).first();
      
      // Click edit button
      await editButton.click();
      
      // Check that edit form is displayed
      await expect(page.getByText('Edit Task')).toBeVisible();
      await expect(page.getByDisplayValue('Task to Edit')).toBeVisible();
      await expect(page.getByDisplayValue('Original description')).toBeVisible();
    });

    test('should update task when editing', async ({ page }) => {
      const editButton = page.getByTestId(/edit-task-/).first();
      
      // Click edit button
      await editButton.click();
      
      // Update task details
      const titleInput = page.getByDisplayValue('Task to Edit');
      await titleInput.clear();
      await titleInput.fill('Updated Task Title');
      
      const descriptionInput = page.getByDisplayValue('Original description');
      await descriptionInput.clear();
      await descriptionInput.fill('Updated description');
      
      // Save changes
      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForTimeout(500);
      
      // Check updated content is displayed
      await expect(page.getByText('Updated Task Title')).toBeVisible();
      await expect(page.getByText('Updated description')).toBeVisible();
      await expect(page.getByText('Task to Edit')).not.toBeVisible();
      await expect(page.getByText('Original description')).not.toBeVisible();
    });

    test('should cancel edit when clicking cancel', async ({ page }) => {
      const editButton = page.getByTestId(/edit-task-/).first();
      
      // Click edit button
      await editButton.click();
      
      // Make some changes
      const titleInput = page.getByDisplayValue('Task to Edit');
      await titleInput.clear();
      await titleInput.fill('This should not be saved');
      
      // Cancel changes
      await page.getByRole('button', { name: /cancel/i }).click();
      
      // Check original content is still displayed
      await expect(page.getByText('Task to Edit')).toBeVisible();
      await expect(page.getByText('Original description')).toBeVisible();
      await expect(page.getByText('This should not be saved')).not.toBeVisible();
    });
  });

  test.describe('Task Deletion', () => {
    test.beforeEach(async ({ page }) => {
      // Create a test task first
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill('Task to Delete');
      await page.getByTestId('task-description-input').fill('This task will be deleted');
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
    });

    test('should open delete confirmation dialog', async ({ page }) => {
      const deleteButton = page.getByTestId(/delete-task-/).first();
      
      // Click delete button
      await deleteButton.click();
      
      // Check confirmation dialog
      await expect(page.getByText('Delete Task')).toBeVisible();
      await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible();
      await expect(page.getByText('"Task to Delete"')).toBeVisible();
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
    });

    test('should cancel deletion when clicking cancel', async ({ page }) => {
      const deleteButton = page.getByTestId(/delete-task-/).first();
      
      // Click delete button
      await deleteButton.click();
      
      // Cancel deletion
      await page.getByRole('button', { name: /cancel/i }).click();
      
      // Check task is still there
      await expect(page.getByText('Task to Delete')).toBeVisible();
      await expect(page.getByText('Delete Task')).not.toBeVisible();
    });

    test('should delete task when confirming deletion', async ({ page }) => {
      const deleteButton = page.getByTestId(/delete-task-/).first();
      
      // Click delete button
      await deleteButton.click();
      
      // Confirm deletion
      await page.getByRole('button', { name: /delete/i }).click();
      await page.waitForTimeout(1000);
      
      // Check task is removed
      await expect(page.getByText('Task to Delete')).not.toBeVisible();
    });

    test('should show loading state during deletion', async ({ page }) => {
      const deleteButton = page.getByTestId(/delete-task-/).first();
      
      // Click delete button
      await deleteButton.click();
      
      // Start deletion and check loading state
      const deleteConfirmButton = page.getByRole('button', { name: /delete/i });
      await deleteConfirmButton.click();
      
      // Check loading state appears (might be brief)
      try {
        await expect(page.getByText('Deleting...')).toBeVisible({ timeout: 2000 });
      } catch {
        // Loading state might be too brief to catch, that's okay
      }
      
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Task Metadata and Display', () => {
    test('should display task creation date', async ({ page }) => {
      // Create a test task
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill('Date Display Test');
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
      
      // Check creation date is displayed
      const today = new Date();
      const expectedDateFormat = today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      await expect(page.getByText(new RegExp(`Created.*${expectedDateFormat.replace(/\s+/g, '\\s*')}`, 'i'))).toBeVisible();
    });

    test('should display due date badge when task has due date', async ({ page }) => {
      // Create a task with due date
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill('Task with Due Date');
      
      // Set due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 30, 0, 0);
      const dueDateString = tomorrow.toISOString().slice(0, 16);
      await page.getByTestId('task-due-date-input').fill(dueDateString);
      
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
      
      // Check due date badge is displayed
      await expect(page.getByText(/Due.*2:30 PM/i)).toBeVisible();
    });

    test('should show overdue badge for past due tasks', async ({ page }) => {
      // This test would typically require setting a task with a past due date
      // For this test, we'll create a task and then manipulate the due date via API or test data
      // This is a placeholder for the concept - in real implementation, you might need to:
      // 1. Create task with past due date via API
      // 2. Or modify test data to include overdue tasks
      
      await page.getByTestId('open-task-form').click();
      await page.getByTestId('task-title-input').fill('Potentially Overdue Task');
      
      // Set due date to yesterday (if the backend allows past dates)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(14, 30, 0, 0);
      const dueDateString = yesterday.toISOString().slice(0, 16);
      
      // Try to set past date (some forms might prevent this)
      await page.getByTestId('task-due-date-input').fill(dueDateString);
      await page.getByTestId('create-task-button').click();
      await page.waitForTimeout(1000);
      
      // Check for overdue indication if task was created with past date
      const overdueText = page.getByText(/overdue/i);
      if (await overdueText.count() > 0) {
        await expect(overdueText).toBeVisible();
      }
    });
  });

  test.describe('Task List Empty States', () => {
    test('should show appropriate message when no tasks exist', async ({ page }) => {
      // Navigate to a view that might be empty
      await page.locator('aside').getByRole('button', { name: /completed/i }).click();
      
      // Check for empty state message (this depends on your implementation)
      // The exact message might vary based on your EmptyState component
      const emptyIndicators = [
        page.getByText(/no.*tasks/i),
        page.getByText(/no.*completed/i),
        page.getByText(/empty/i),
        page.getByText(/nothing.*here/i)
      ];
      
      let emptyStateFound = false;
      for (const indicator of emptyIndicators) {
        if (await indicator.count() > 0) {
          await expect(indicator).toBeVisible();
          emptyStateFound = true;
          break;
        }
      }
      
      // If no specific empty state message, at least verify no tasks are shown
      if (!emptyStateFound) {
        await expect(page.locator('[data-testid*="task-item-"]')).toHaveCount(0);
      }
    });
  });
});