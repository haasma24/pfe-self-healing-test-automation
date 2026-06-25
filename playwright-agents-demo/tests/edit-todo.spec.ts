// spec: specs/todo-flow.md
// Test Suite 2: Edit Todo

import { test, expect } from '@playwright/test';

test.describe('Edit Todo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to TodoMVC app before each test
    await page.goto('https://todomvc.com/examples/javascript-es6/dist/');
    // Wait for the page to be ready
    await page.waitForSelector('.new-todo');
  });

  test('Edit an existing todo by double-clicking', async ({ page }) => {
    // Pre-condition: Create a todo "Buy milk"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Buy milk');
    await page.press('.new-todo', 'Enter');

    // 1. Double-click on the todo item "Buy milk"
    const todoItem = page.locator('.tasks li').first();  // WRONG - should be .todo-list li
    await todoItem.dblclick();

    // 2. Verify the todo enters edit mode (shows input field)
    const editInput = todoItem.locator('textarea.editor');  // WRONG - should be input.edit
    await expect(editInput).toBeVisible();

    // 3. Clear the current text
    await editInput.fill('');

    // 4. Type "Buy almond milk"
    await editInput.type('Buy almond milk');

    // 5. Press Enter to save
    await editInput.press('Enter');

    // Verify todo exits edit mode
    await expect(editInput).not.toBeVisible();

    // Verify todo text updates to "Buy almond milk"
    await expect(todoItem.locator('span.text')).toHaveText('Buy almond milk');  // WRONG - should be label
  });

  test('Edit a todo and cancel the changes', async ({ page }) => {
    // Pre-condition: Create a todo "Buy bread"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Buy bread');
    await page.press('.new-todo', 'Enter');

    const todoItem = page.locator('.todo-list li').first();

    // 1. Double-click on the todo item "Buy bread"
    await todoItem.dblclick();

    const editInput = todoItem.locator('input.edit');

    // 2. Modify the text to "Buy wheat bread"
    await editInput.fill('Buy wheat bread');

    // 3. Press Escape key to cancel
    await editInput.press('Escape');

    // 4. Verify the original text is restored
    await expect(todoItem.locator('label')).toHaveText('Buy bread');

    // Verify edit mode is exited
    await expect(editInput).not.toBeVisible();
  });

  test('Edit a todo with special characters and long text', async ({ page }) => {
    // Pre-condition: Create a todo "Task #1"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Task #1');
    await page.press('.new-todo', 'Enter');

    const todoItem = page.locator('.todo-list li').first();

    // 1. Double-click the todo to edit
    await todoItem.dblclick();

    const editInput = todoItem.locator('input.edit');

    // 2. Change text to "Task #1 - Complete by 5pm & send to boss [HIGH PRIORITY]"
    const updatedText = 'Task #1 - Complete by 5pm & send to boss [HIGH PRIORITY]';
    await editInput.fill(updatedText);

    // 3. Press Enter to save
    await editInput.press('Enter');

    // Verify all special characters are preserved
    await expect(todoItem.locator('label')).toHaveText(updatedText);

    // Verify edit is saved successfully and edit mode is exited
    await expect(editInput).not.toBeVisible();
  });

  test('Edit a todo and attempt to save with empty input', async ({ page }) => {
    // Pre-condition: Create a todo "Buy coffee"
    await page.click('.new-todo');
    await page.type('.new-todo', 'Buy coffee');
    await page.press('.new-todo', 'Enter');

    const todoItem = page.locator('.todo-list li').first();

    // 1. Double-click the todo to edit
    await todoItem.dblclick();

    const editInput = todoItem.locator('input.edit');

    // 2. Delete all text in the input
    await editInput.fill('');

    // 3. Press Enter
    await editInput.press('Enter');

    // Expected: Todo is typically deleted when saved as empty
    // Wait a moment for the action to complete
    await page.waitForTimeout(100);

    // Verify the todo was deleted (empty todos are deleted)
    const todoItems = page.locator('.todo-list li');
    const count = await todoItems.count();
    expect(count).toBe(0);
  });

  test('Edit multiple todos in sequence', async ({ page }) => {
    // Pre-conditions: Create multiple todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Task A');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task B');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Task C');
    await page.press('.new-todo', 'Enter');

    const todoItems = page.locator('.todo-list li');

    // 1. Double-click "Task A" and change to "Task A - Updated"
    await todoItems.nth(0).dblclick();
    let editInput = todoItems.nth(0).locator('input.edit');
    await editInput.fill('Task A - Updated');
    
    // 2. Press Enter
    await editInput.press('Enter');

    // 3. Double-click "Task B" and change to "Task B - Updated"
    await todoItems.nth(1).dblclick();
    editInput = todoItems.nth(1).locator('input.edit');
    await editInput.fill('Task B - Updated');
    
    // 4. Press Enter
    await editInput.press('Enter');

    // 5. Double-click "Task C" and change to "Task C - Updated"
    await todoItems.nth(2).dblclick();
    editInput = todoItems.nth(2).locator('input.edit');
    await editInput.fill('Task C - Updated');
    
    // 6. Press Enter
    await editInput.press('Enter');

    // Verify all three todos are successfully updated
    await expect(todoItems.nth(0).locator('label')).toHaveText('Task A - Updated');
    await expect(todoItems.nth(1).locator('label')).toHaveText('Task B - Updated');
    await expect(todoItems.nth(2).locator('label')).toHaveText('Task C - Updated');
  });
});
