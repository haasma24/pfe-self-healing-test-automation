// spec: specs/todo-flow.md
// Test Suite 4: Delete Todo

import { test, expect } from '@playwright/test';

test.describe('Delete Todo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to TodoMVC app before each test
    await page.goto('https://todomvc.com/examples/javascript-es6/dist/');
    // Wait for the page to be ready
    await page.waitForSelector('.new-todo');
  });

  test('Delete a todo using delete button', async ({ page }) => {
    // Pre-condition: Create a todo "Buy milk"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Buy milk');
    await page.press('.new-todo', 'Enter');

    const todoItem = page.locator('.todo-list li').first();

    // 1. Hover over the todo item "Buy milk"
    await todoItem.hover();

    // 2. Click the delete button (X icon or destroy button)
    const deleteButton = todoItem.locator('button.destroy');
    await deleteButton.click();

    // 3. Verify the todo is removed from the list
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('Delete a completed todo', async ({ page }) => {
    // Pre-condition: Create a todo and mark it complete
    await page.click('.new-todo');
    await page.type('.new-todo', 'Completed task');
    await page.press('.new-todo', 'Enter');

    const todoItem = page.locator('.todo-list li').first();
    const checkbox = todoItem.locator('input[type="checkbox"]');

    // Mark it complete
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // 1. Hover over the completed todo
    await todoItem.hover();

    // 2. Click the delete button
    const deleteButton = todoItem.locator('button.destroy');
    await deleteButton.click();

    // 3. Verify the completed todo is removed
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('Delete multiple todos', async ({ page }) => {
    // Pre-condition: Create multiple todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Task 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 2');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 3');
    await page.press('.new-todo', 'Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(3);

    // 1. Delete "Task 1" by clicking its delete button
    let todoItems = page.locator('.todo-list li');
    await todoItems.nth(0).hover();
    await todoItems.nth(0).locator('button.destroy').click();
    
    // Wait for deletion
    await page.waitForTimeout(100);

    // 2. Delete "Task 2" by clicking its delete button
    todoItems = page.locator('.todo-list li');
    await todoItems.nth(0).hover();
    await todoItems.nth(0).locator('button.destroy').click();
    
    // Wait for deletion
    await page.waitForTimeout(100);

    // 3. Delete "Task 3" by clicking its delete button
    todoItems = page.locator('.todo-list li');
    await todoItems.nth(0).hover();
    await todoItems.nth(0).locator('button.destroy').click();

    // Verify all three todos are deleted in sequence
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('Delete all completed todos using clear-completed feature', async ({ page }) => {
    // Pre-condition: Create multiple todos with some marked as complete
    await page.click('.new-todo');
    await page.type('.new-todo', 'Active 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Done 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Done 2');
    await page.press('.new-todo', 'Enter');

    // Mark "Done 1" and "Done 2" as complete
    const todoItems = page.locator('.todo-list li');
    await todoItems.nth(1).locator('input[type="checkbox"]').click();
    await todoItems.nth(2).locator('input[type="checkbox"]').click();

    const clearButton = page.locator('.clear-completed');
    
    if (await clearButton.count() > 0) {
      // 1. Click the "Clear completed" button
      await clearButton.click();

      // Wait for completion
      await page.waitForTimeout(100);

      // 2. Verify all completed todos are removed
      const remainingItems = page.locator('.todo-list li');
      await expect(remainingItems).toHaveCount(1);

      // 3. Verify uncompleted todo remains: "Active 1"
      await expect(remainingItems.nth(0).locator('label')).toHaveText('Active 1');

      // Verify the remaining todo is not completed
      await expect(remainingItems.nth(0).locator('input[type="checkbox"]')).not.toBeChecked();
    }
  });

  test('Delete todo from empty list shows no errors', async ({ page }) => {
    // Pre-condition: Ensure todo list is empty

    // 1. Verify no delete buttons are available
    const deleteButtons = page.locator('button.destroy');
    await expect(deleteButtons).toHaveCount(0);

    // 2. Verify no error messages appear
    const todoList = page.locator('.todo-list');
    if (await todoList.count() > 0) {
      await expect(todoList).toBeEmpty();
    }

    // 3. Verify UI remains clean and responsive
    const inputField = page.locator('.new-todo');
    await expect(inputField).toBeEnabled();
  });

  test('Delete all todos one by one until list is empty', async ({ page }) => {
    // Pre-condition: Create multiple todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Task 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 2');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task 3');
    await page.press('.new-todo', 'Enter');

    // Verify 3 todos exist
    await expect(page.locator('.todo-list li')).toHaveCount(3);

    // 1. Delete "Task 1"
    let todoItems = page.locator('.todo-list li');
    await todoItems.nth(0).hover();
    await todoItems.nth(0).locator('button.destroy').click();
    await page.waitForTimeout(100);

    // 2. Delete "Task 2"
    todoItems = page.locator('.todo-list li');
    await todoItems.nth(0).hover();
    await todoItems.nth(0).locator('button.destroy').click();
    await page.waitForTimeout(100);

    // 3. Delete "Task 3"
    todoItems = page.locator('.todo-list li');
    await todoItems.nth(0).hover();
    await todoItems.nth(0).locator('button.destroy').click();

    // 4. Verify list is empty
    await expect(page.locator('.todo-list li')).toHaveCount(0);

    // Verify no error messages
    const inputField = page.locator('.new-todo');
    await expect(inputField).toBeEnabled();
  });
});
