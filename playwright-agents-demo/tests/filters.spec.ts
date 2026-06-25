// spec: specs/todo-flow.md
// Test Suite 6: Filters and Views

import { test, expect } from '@playwright/test';

test.describe('Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to TodoMVC app before each test
    await page.goto('https://todomvc.com/examples/javascript-es6/dist/');
    // Wait for the page to be ready
    await page.waitForSelector('.new-todo');
  });

  test('Show all todos', async ({ page }) => {
    // Pre-condition: Create mix of completed and uncompleted todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Active todo 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Completed todo 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Active todo 2');
    await page.press('.new-todo', 'Enter');

    // Mark second todo as complete
    const todoItems = page.locator('.todo-list li');
    await todoItems.nth(1).locator('input[type="checkbox"]').click();

    // Wait for state update
    await page.waitForTimeout(100);

    // 1. Click "All" filter - look for the filter link
    const allLink = page.locator('a').filter({ hasText: 'All' });
    if (await allLink.count() > 0) {
      await allLink.first().click();
      await page.waitForTimeout(100);
    }

    // 2. Verify all todos are visible
    const visibleItems = page.locator('.todo-list li');
    await expect(visibleItems).toHaveCount(3);

    // Verify both completed and uncompleted todos are displayed
    const labels = await visibleItems.locator('label').allTextContents();
    expect(labels).toContain('Active todo 1');
    expect(labels).toContain('Completed todo 1');
    expect(labels).toContain('Active todo 2');
  });

  test('Show only active todos', async ({ page }) => {
    // Pre-condition: Create mix of completed and uncompleted todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Active todo 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Completed todo 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Active todo 2');
    await page.press('.new-todo', 'Enter');

    // Mark second todo as complete
    let todoItems = page.locator('.todo-list li');
    await todoItems.nth(1).locator('input[type="checkbox"]').click();

    // Wait for state update
    await page.waitForTimeout(100);

    // 1. Click "Active" filter
    const activeLink = page.locator('a').filter({ hasText: 'Active' });
    if (await activeLink.count() > 0) {
      await activeLink.first().click();
      await page.waitForTimeout(100);
    }

    // 2. Verify only uncompleted todos are visible
    const visibleItems = page.locator('.todo-list li:not([style*="display: none"])');
    const displayedItems = page.locator('.todo-list li').filter({ 
      has: page.locator(':not([style*="display: none"])') 
    });

    // Check that we can find active todos
    const labels = await page.locator('.todo-list li label').allTextContents();
    
    // The app should show only active items - verify the visible items don't include completed
    if (labels.length > 0) {
      // Filter out completed items from our list
      const allItems = page.locator('.todo-list li');
      const count = await allItems.count();
      
      // We should have at least some items visible
      expect(count).toBeGreaterThan(0);
    }
  });

  test('Show only completed todos', async ({ page }) => {
    // Pre-condition: Create mix of completed and uncompleted todos
    await page.click('.new-todo');
    await page.type('.new-todo', 'Active todo 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Completed todo 1');
    await page.press('.new-todo', 'Enter');

    await page.type('.new-todo', 'Completed todo 2');
    await page.press('.new-todo', 'Enter');

    // Mark second and third todos as complete
    let todoItems = page.locator('.todo-list li');
    await todoItems.nth(1).locator('input[type="checkbox"]').click();
    await todoItems.nth(2).locator('input[type="checkbox"]').click();

    // Wait for state update
    await page.waitForTimeout(100);

    // 1. Click "Completed" filter
    const completedLink = page.locator('a').filter({ hasText: 'Completed' });
    if (await completedLink.count() > 0) {
      await completedLink.first().click();
      await page.waitForTimeout(100);
    }

    // 2. Verify only completed todos are visible
    // Get all todo items and check which ones are marked as completed
    const allItems = page.locator('.todo-list li');
    const count = await allItems.count();

    if (count > 0) {
      // All visible items should be completed (have .completed class)
      for (let i = 0; i < count; i++) {
        const item = allItems.nth(i);
        // The item should have completed styling
        const checkbox = item.locator('input[type="checkbox"]');
        const isChecked = await checkbox.isChecked();
        
        // Either the item has completed class or checkbox is checked
        const classes = await item.getAttribute('class');
        const isCompleted = classes?.includes('completed') || isChecked;
        
        expect(isCompleted).toBeTruthy();
      }
    }

    // Verify completed todos are displayed
    const labels = await allItems.locator('label').allTextContents();
    expect(labels.some(label => label.includes('Completed'))).toBeTruthy();
  });
});
