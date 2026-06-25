// spec: specs/todo-flow.md
// Test Suite 5: Integration Tests - Combined Operations

import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to TodoMVC app before each test
    await page.goto('https://todomvc.com/examples/javascript-es6/dist/');
    // Wait for the page to be ready
    await page.waitForSelector('.new-todo');
  });

  test('Full workflow - Create, edit, complete, and delete', async ({ page }) => {
    // Pre-condition: Todo list is empty
    await expect(page.locator('.todo-list li')).toHaveCount(0);

    // 1. Create todo: "Buy milk"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Buy milk');
    await page.press('.new-todo', 'Enter');

    let todoItem = page.locator('.todo-list li').nth(0);
    await expect(todoItem.locator('label')).toHaveText('Buy milk');

    // 2. Edit it to: "Buy organic milk"
    await todoItem.dblclick();
    let editInput = todoItem.locator('input.edit');
    await editInput.fill('Buy organic milk');
    await editInput.press('Enter');
    await expect(todoItem.locator('label')).toHaveText('Buy organic milk');

    // 3. Create another todo: "Walk the dog"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Walk the dog');
    await page.press('.new-todo', 'Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(2);

    // 4. Mark "Buy organic milk" as complete
    todoItem = page.locator('.todo-list li').nth(0);
    const checkbox = todoItem.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // 5. Delete "Buy organic milk"
    await todoItem.hover();
    const deleteButton = todoItem.locator('button.destroy');
    await deleteButton.click();
    await page.waitForTimeout(100);

    // 6. Verify only "Walk the dog" remains
    const remainingItems = page.locator('.todo-list li');
    await expect(remainingItems).toHaveCount(1);
    await expect(remainingItems.nth(0).locator('label')).toHaveText('Walk the dog');
    await expect(remainingItems.nth(0).locator('input[type="checkbox"]')).not.toBeChecked();
  });

  test('Create todos with duplicate text', async ({ page }) => {
    // Pre-condition: Application is loaded

    // 1. Create first todo: "Call John"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Call John');
    await page.press('.new-todo', 'Enter');

    // 2. Create second todo: "Call John"
    await page.type('.new-todo', 'Call John');
    await page.press('.new-todo', 'Enter');

    // 3. Verify both todos appear in the list
    const todoItems = page.locator('.todo-list li');
    await expect(todoItems).toHaveCount(2);

    // Verify both have the same text
    await expect(todoItems.nth(0).locator('label')).toHaveText('Call John');
    await expect(todoItems.nth(1).locator('label')).toHaveText('Call John');

    // Verify each is a separate list item and can be independently completed
    const checkbox0 = todoItems.nth(0).locator('input[type="checkbox"]');
    const checkbox1 = todoItems.nth(1).locator('input[type="checkbox"]');

    await checkbox0.click();
    await expect(checkbox0).toBeChecked();
    await expect(checkbox1).not.toBeChecked();

    // Verify each can be independently deleted
    await todoItems.nth(0).hover();
    const deleteButton = todoItems.nth(0).locator('button.destroy');
    await deleteButton.click();
    await page.waitForTimeout(100);

    // One todo should remain
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').nth(0).locator('label')).toHaveText('Call John');
  });

  test('Rapid creation and deletion of todos', async ({ page }) => {
    // Pre-condition: Application is loaded

    // 1. Rapidly create 5 todos without delay
    const todos = ['Todo 1', 'Todo 2', 'Todo 3', 'Todo 4', 'Todo 5'];
    for (const todoText of todos) {
      await page.click('.new-todo');
      await page.type('.new-todo', todoText);
      await page.press('.new-todo', 'Enter');
    }

    // Verify all 5 are created
    let todoItems = page.locator('.todo-list li');
    await expect(todoItems).toHaveCount(5);

    // 2. Immediately delete 3 of them (Todo 2, Todo 3, Todo 4)
    for (let i = 0; i < 3; i++) {
      todoItems = page.locator('.todo-list li');
      await todoItems.nth(1).hover(); // Always delete the second item
      await todoItems.nth(1).locator('button.destroy').click();
      await page.waitForTimeout(50);
    }

    // 3. Create 2 more todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Todo A');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Todo B');
    await page.press('.new-todo', 'Enter');

    // 4. Verify final list state is correct
    // Should have: Todo 1, Todo 5, Todo A, Todo B (4 total)
    todoItems = page.locator('.todo-list li');
    await expect(todoItems).toHaveCount(4);

    // Verify specific items exist
    const labels = await todoItems.locator('label').allTextContents();
    expect(labels).toContain('Todo 1');
    expect(labels).toContain('Todo 5');
    expect(labels).toContain('Todo A');
    expect(labels).toContain('Todo B');

    // No data loss or corruption - can verify list is stable
    await page.waitForTimeout(100);
    await expect(page.locator('.todo-list li')).toHaveCount(4);
  });

  test('Edit and delete operations maintain list integrity', async ({ page }) => {
    // Pre-condition: Todos exist
    const initialTodos = ['Task 1', 'Task 2', 'Task 3'];
    
    for (const todo of initialTodos) {
      await page.click('.new-todo');
      await page.type('.new-todo', todo);
      await page.press('.new-todo', 'Enter');
    }

    let todoItems = page.locator('.todo-list li');

    // 1. Edit "Task 1" to "Task 1 - Updated"
    await todoItems.nth(0).dblclick();
    let editInput = todoItems.nth(0).locator('input.edit');
    await editInput.fill('Task 1 - Updated');
    await editInput.press('Enter');
    await page.waitForTimeout(100);

    // 2. Delete "Task 2"
    todoItems = page.locator('.todo-list li');
    await todoItems.nth(1).hover();
    await todoItems.nth(1).locator('button.destroy').click();
    await page.waitForTimeout(100);

    // 3. Edit "Task 3" to "Task 3 - Updated"
    todoItems = page.locator('.todo-list li');
    await todoItems.nth(1).dblclick();
    editInput = todoItems.nth(1).locator('input.edit');
    await editInput.fill('Task 3 - Updated');
    await editInput.press('Enter');
    await page.waitForTimeout(100);

    // 4. Verify final list shows only the expected todos
    todoItems = page.locator('.todo-list li');
    await expect(todoItems).toHaveCount(2);

    // Verify edits are preserved
    await expect(todoItems.nth(0).locator('label')).toHaveText('Task 1 - Updated');
    await expect(todoItems.nth(1).locator('label')).toHaveText('Task 3 - Updated');

    // Verify list contains only expected items with no orphaned or missing items
    const labels = await todoItems.locator('label').allTextContents();
    expect(labels.length).toBe(2);
    expect(labels).toContain('Task 1 - Updated');
    expect(labels).toContain('Task 3 - Updated');
  });
});
