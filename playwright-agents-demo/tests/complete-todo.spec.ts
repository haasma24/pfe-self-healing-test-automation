// spec: specs/todo-flow.md
// Test Suite 3: Complete Todo

import { test, expect } from '@playwright/test';

test.describe('Complete Todo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to TodoMVC app before each test
    await page.goto('https://todomvc.com/examples/javascript-es6/dist/');
    // Wait for the page to be ready
    await page.waitForSelector('.new-todo');
  });

  test('Mark a todo as complete using checkbox', async ({ page }) => {
    // Pre-condition: Create a todo "Buy milk"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Buy milk');
    await page.press('.new-todo', 'Enter');

    const todoItem = page.locator('.todo-list li').first();
    const checkbox = todoItem.locator('input[type="checkbox"]');

    // 1. Click the checkbox next to "Buy milk"
    await checkbox.click();

    // 2. Verify the todo is marked as complete
    await expect(checkbox).toBeChecked();

    // Verify todo text appears with strikethrough (has class "completed")
    await expect(todoItem).toHaveClass(/completed/);

    // Verify todo item has the completed state class
    await expect(todoItem).toHaveClass(/.*completed.*/);
  });

  test('Unmark a completed todo', async ({ page }) => {
    // Pre-condition: Create a todo and mark it complete
    await page.click('.new-todo');
    await page.type('.new-todo', 'Buy milk');
    await page.press('.new-todo', 'Enter');

    const todoItem = page.locator('.todo-list li').first();
    const checkbox = todoItem.locator('input[type="checkbox"]');

    // Mark it complete first
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(todoItem).toHaveClass(/completed/);

    // 1. Click the checkbox of the completed todo (uncheck it)
    await checkbox.click();

    // 2. Verify the todo is marked as incomplete
    await expect(checkbox).not.toBeChecked();

    // Verify strikethrough is removed
    await expect(todoItem).not.toHaveClass(/completed/);
  });

  test('Mark multiple todos as complete', async ({ page }) => {
    // Pre-condition: Create multiple uncompleted todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Task 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 2');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 3');
    await page.press('.new-todo', 'Enter');

    const todoItems = page.locator('.todo-list li');

    // 1. Check the checkbox for "Task 1"
    await todoItems.nth(0).locator('input[type="checkbox"]').click();
    
    // 2. Check the checkbox for "Task 2"
    await todoItems.nth(1).locator('input[type="checkbox"]').click();
    
    // 3. Check the checkbox for "Task 3"
    await todoItems.nth(2).locator('input[type="checkbox"]').click();

    // 4. Verify all three are marked as complete
    await expect(todoItems.nth(0).locator('input[type="checkbox"]')).toBeChecked();
    await expect(todoItems.nth(1).locator('input[type="checkbox"]')).toBeChecked();
    await expect(todoItems.nth(2).locator('input[type="checkbox"]')).toBeChecked();

    // Verify all have completed styling
    await expect(todoItems.nth(0)).toHaveClass(/completed/);
    await expect(todoItems.nth(1)).toHaveClass(/completed/);
    await expect(todoItems.nth(2)).toHaveClass(/completed/);

    // Verify each can be independently unchecked
    await todoItems.nth(1).locator('input[type="checkbox"]').click();
    await expect(todoItems.nth(1).locator('input[type="checkbox"]')).not.toBeChecked();
    await expect(todoItems.nth(1)).not.toHaveClass(/completed/);
  });

  test('Mark all todos as complete using toggle-all feature', async ({ page }) => {
    // Pre-condition: Create multiple uncompleted todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Task 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 2');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 3');
    await page.press('.new-todo', 'Enter');

    // Check if toggle-all element exists
    const toggleAll = page.locator('.toggle-all');
    if (await toggleAll.count() > 0) {
      // 1. Click the "Mark all" checkbox
      await toggleAll.click();

      // 2. Verify all todos are marked as complete
      const todoItems = page.locator('.todo-list li');
      await expect(todoItems.nth(0).locator('input[type="checkbox"]')).toBeChecked();
      await expect(todoItems.nth(1).locator('input[type="checkbox"]')).toBeChecked();
      await expect(todoItems.nth(2).locator('input[type="checkbox"]')).toBeChecked();

      // Verify all todos show with strikethrough
      await expect(todoItems.nth(0)).toHaveClass(/completed/);
      await expect(todoItems.nth(1)).toHaveClass(/completed/);
      await expect(todoItems.nth(2)).toHaveClass(/completed/);

      // Verify "Mark all" checkbox appears checked
      await expect(toggleAll).toBeChecked();
    }
  });

  test('Unmark all todos using toggle-all feature', async ({ page }) => {
    // Pre-condition: Create and mark all todos as complete
    await page.click('.new-todo');
    await page.type('.new-todo', 'Task 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 2');
    await page.press('.new-todo', 'Enter');

    const toggleAll = page.locator('.toggle-all');
    if (await toggleAll.count() > 0) {
      // Mark all complete first
      await toggleAll.click();
      await expect(toggleAll).toBeChecked();

      // 1. Click the "Mark all" checkbox again
      await toggleAll.click();

      // 2. Verify all todos are marked as incomplete
      const todoItems = page.locator('.todo-list li');
      await expect(todoItems.nth(0).locator('input[type="checkbox"]')).not.toBeChecked();
      await expect(todoItems.nth(1).locator('input[type="checkbox"]')).not.toBeChecked();

      // Verify no strikethrough on any todo
      await expect(todoItems.nth(0)).not.toHaveClass(/completed/);
      await expect(todoItems.nth(1)).not.toHaveClass(/completed/);

      // Verify "Mark all" checkbox appears unchecked
      await expect(toggleAll).not.toBeChecked();
    }
  });

  test('Toggle between complete and incomplete states', async ({ page }) => {
    // Pre-condition: Create a todo
    await page.click('.new-todo');
    await page.type('.new-todo', 'Toggle test');
    await page.press('.new-todo', 'Enter');

    const todoItem = page.locator('.todo-list li').first();
    const checkbox = todoItem.locator('input[type="checkbox"]');

    // 1. Check the checkbox
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(todoItem).toHaveClass(/completed/);

    // 2. Immediately uncheck it
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
    await expect(todoItem).not.toHaveClass(/completed/);

    // 3. Check it again
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(todoItem).toHaveClass(/completed/);

    // 4. Uncheck it again
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
    await expect(todoItem).not.toHaveClass(/completed/);

    // Verify UI remains responsive
    await expect(checkbox).toBeEnabled();
  });
});
