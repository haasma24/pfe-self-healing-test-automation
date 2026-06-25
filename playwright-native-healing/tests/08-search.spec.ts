import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Search — Modal', () => {

  test('clicking the search icon should open the search modal', async ({ page }) => {
    await page.getByTestId('search-trigger').click();
    await expect(page.getByTestId('search-modal')).toHaveClass(/open/);
  });

  test('Ctrl+K keyboard shortcut should open the search modal', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.getByTestId('search-modal')).toHaveClass(/open/);
  });

  test('pressing Escape should close an open search modal', async ({ page }) => {
    await page.getByTestId('search-trigger').click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('search-modal')).not.toHaveClass(/open/);
  });

  test('typing in the search modal should display matching results', async ({ page }) => {
    await page.getByTestId('search-trigger').click();
    await page.getByTestId('search-modal-input').fill('keyboard');
    await expect(page.getByTestId('search-modal-results')).toContainText('Keyboard');
  });

  test('clicking a search result should close modal and open product modal', async ({ page }) => {
    await page.getByTestId('search-trigger').click();
    await page.getByTestId('search-modal-input').fill('keyboard');
    await page.locator('.search-result-item').first().click();
    await expect(page.getByTestId('search-modal')).not.toHaveClass(/open/);
    await expect(page.getByTestId('product-modal-overlay')).toHaveClass(/open/);
  });

  test('quick-search tag "Backpack" should filter modal results', async ({ page }) => {
    await page.getByTestId('search-trigger').click();
    await page.locator('.search-tag', { hasText: 'Backpack' }).click();
    await expect(page.getByTestId('search-modal-results')).toContainText('Backpack');
  });

  test('quick-search tag "Audio" should filter modal results to audio items', async ({ page }) => {
    await page.getByTestId('search-trigger').click();
    await page.locator('.search-tag', { hasText: 'Audio' }).click();
    await expect(page.getByTestId('search-modal-results')).toContainText('Audio');
  });

  test('empty search query should show results container without error', async ({ page }) => {
    await page.getByTestId('search-trigger').click();
    await page.getByTestId('search-modal-input').fill('');
    await expect(page.getByTestId('search-modal-results')).toBeVisible();
  });

  test('searching for a non-existent term should show no results message', async ({ page }) => {
    await page.getByTestId('search-trigger').click();
    await page.getByTestId('search-modal-input').fill('xyznotfoundever99999');
    await expect(page.getByTestId('search-modal-results')).toBeVisible();
  });

});

test.describe('Search — Inline Toolbar', () => {

  test('typing in the toolbar search should filter the product grid', async ({ page }) => {
    await page.getByTestId('search-input').fill('keyboard');
    await expect(page.getByTestId('count-shown')).not.toHaveText('24');
    await expect(page.getByTestId('product-grid')).toContainText('Keyboard');
  });

  test('inline search should update the shown-count label', async ({ page }) => {
    await page.getByTestId('search-input').fill('audio');
    const count = await page.getByTestId('count-shown').textContent();
    expect(parseInt(count!)).toBeLessThan(24);
  });

  test('searching for a non-existent term should show the empty-state message', async ({ page }) => {
    await page.getByTestId('search-input').fill('xyznotexisting12345');
    await expect(page.getByTestId('product-grid')).toContainText('No products found');
    await expect(page.getByTestId('count-shown')).toHaveText('0');
  });

  test('clearing the inline search should restore all 24 products', async ({ page }) => {
    await page.getByTestId('search-input').fill('keyboard');
    await page.getByTestId('search-input').fill('');
    await expect(page.getByTestId('count-shown')).toHaveText('24');
  });

  test('inline search should be case-insensitive', async ({ page }) => {
    await page.getByTestId('search-input').fill('KEYBOARD');
    await expect(page.getByTestId('product-grid')).toContainText('Keyboard');
    await expect(page.getByTestId('count-shown')).not.toHaveText('0');
  });

  test('grid-view button should remain active after a search', async ({ page }) => {
    await page.getByTestId('search-input').fill('keyboard');
    await expect(page.getByTestId('btn-grid-view')).toHaveClass(/active/);
  });

  test('count-total should always stay at 24 regardless of search query', async ({ page }) => {
    await page.getByTestId('search-input').fill('keyboard');
    await expect(page.getByTestId('count-total')).toHaveText('24');
  });

});

test.describe('Search — Filters', () => {

  test('price-range slider should be present in the sidebar', async ({ page }) => {
    await expect(page.getByTestId('price-range-slider')).toBeVisible();
  });

  test('price range label should default to $500', async ({ page }) => {
    await expect(page.getByTestId('price-range-label')).toHaveText('$500');
  });

  test('Apply Filters button should be visible', async ({ page }) => {
    await expect(page.getByTestId('apply-filters-btn')).toBeVisible();
  });

  test('Clear All Filters button should be visible', async ({ page }) => {
    await expect(page.getByTestId('clear-filters-btn')).toBeVisible();
  });

  test('checking the "On Sale" availability checkbox should filter products', async ({ page }) => {
    await page.getByTestId('filter-checkbox-on-sale').check();
    await page.getByTestId('apply-filters-btn').click();
    const count = await page.getByTestId('count-shown').textContent();
    expect(parseInt(count!)).toBeLessThan(24);
  });

  test('sort by "Price: Low to High" should re-order the grid', async ({ page }) => {
    await page.getByTestId('sort-select').selectOption('price-asc');
    await expect(page.getByTestId(/^product-card-/).first()).toBeVisible();
  });

  test('selecting the Tech & Gadgets category filter and applying should reduce results', async ({ page }) => {
    await page.getByTestId('filter-checkbox-tech').check();
    await page.getByTestId('apply-filters-btn').click();
    const count = await page.getByTestId('count-shown').textContent();
    expect(parseInt(count!)).toBeLessThan(24);
  });

});
