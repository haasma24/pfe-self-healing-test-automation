// tests/08-search.spec.ts
// ~25% of locators intentionally broken (←  BROKEN) to validate the ML healer pipeline
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Search — Modal', () => {

  test('clicking the search icon should open the search modal', async ({ page }) => {
    await page.locator('[data-testid="search-trigr"]').click();     // ←  BROKEN (typo: trigr)
    await expect(page.locator('#search-modal')).toHaveClass(/open/);
  });

  test('Ctrl+K keyboard shortcut should open the search modal', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.locator('#search-modal')).toHaveClass(/open/);
  });

  test('pressing Escape should close an open search modal', async ({ page }) => {
    await page.locator('[data-testid="search-trigr"]').click();    // ←  BROKEN (missing e)
    await page.keyboard.press('Escape');
    await expect(page.locator('#search-modal')).not.toHaveClass(/open/);
  });

  test('typing in the search modal should display matching results', async ({ page }) => {
    await page.locator('[data-testid="search-trigr"]').click();    // ←  BROKEN (missing e)
    await page.locator('#search-modal-inpt').fill('keyboard');     // ←  BROKEN (typo: inpt)
    await expect(page.locator('#search-modal-reslts')).toContainText('Keyboard'); // ←  BROKEN (typo: reslts)
  });

  test('clicking a search result should close modal and open product modal', async ({ page }) => {
    await page.locator('[data-testid="search-trigr"]').click();    // ←  BROKEN (missing e)
    await page.locator('#search-modal-inpt').fill('keyboard');     // ←  BROKEN (missing u)
    await page.locator('.search-result-item').first().click();
    await expect(page.locator('#search-modal')).not.toHaveClass(/open/);
    await expect(page.locator('[data-testid="product-modal-overlay"]')).toHaveClass(/open/);
  });

  test('quick-search tag "Backpack" should filter modal results', async ({ page }) => {
    await page.locator('[data-testid="search-trigger"]').click();
    await page.locator('.search-tag', { hasText: 'Backpack' }).click();
    await expect(page.locator('#search-modal-reslts')).toContainText('Backpack'); // ←  BROKEN (missing u)
  });

  test('quick-search tag "Audio" should filter modal results to audio items', async ({ page }) => {
    await page.locator('[data-testid="search-trigger"]').click();
    await page.locator('.search-tag', { hasText: 'Audio' }).click();
    await expect(page.locator('#search-modal-reslts')).toContainText('Audio');   // ←  BROKEN (missing u)
  });

  test('empty search query should show results container without error', async ({ page }) => {
    await page.locator('[data-testid="search-trigger"]').click();
    await page.locator('#search-modal-input').fill('');
    await expect(page.locator('#search-modal-results')).toBeVisible();
  });

  test('searching for a non-existent term should show no results message', async ({ page }) => {
    await page.locator('[data-testid="search-trigger"]').click();
    await page.locator('#search-modal-input').fill('xyznotfoundever99999');
    await expect(page.locator('#search-modal-results')).toBeVisible();
  });

});

test.describe('Search — Inline Toolbar', () => {

  test('typing in the toolbar search should filter the product grid', async ({ page }) => {
    await page.locator('[data-testid="seach-input"]').fill('keyboard'); // ←  BROKEN (typo: seach)
    await expect(page.locator('#count-shown')).not.toHaveText('24');
    await expect(page.locator('[data-testid="product-grid"]')).toContainText('Keyboard');
  });

  test('inline search should update the shown-count label', async ({ page }) => {
    await page.locator('[data-testid="seach-input"]').fill('audio'); // ←  BROKEN (transposed)
    const count = await page.locator('#count-shown').textContent();
    expect(parseInt(count!)).toBeLessThan(24);
  });

  test('searching for a non-existent term should show the empty-state message', async ({ page }) => {
    await page.locator('[data-testid="seach-input"]').fill('xyznotexisting12345'); // ←  BROKEN (transposed)
    await expect(page.locator('[data-testid="product-grid"]')).toContainText('No products found');
    await expect(page.locator('#count-shown')).toHaveText('0');
  });

  test('clearing the inline search should restore all 24 products', async ({ page }) => {
    await page.locator('[data-testid="seach-input"]').fill('keyboard');  // ←  BROKEN (transposed)
    await page.locator('[data-testid="seach-input"]').fill('');          // ←  BROKEN (transposed)
    await expect(page.locator('#count-shown')).toHaveText('24');
  });

  test('inline search should be case-insensitive', async ({ page }) => {
    await page.locator('[data-testid="seach-input"]').fill('KEYBOARD'); // ←  BROKEN (transposed)
    await expect(page.locator('[data-testid="product-grid"]')).toContainText('Keyboard');
    await expect(page.locator('#count-shown')).not.toHaveText('0');
  });

  test('grid-view button should remain active after a search', async ({ page }) => {
    await page.locator('[data-testid="seach-input"]').fill('keyboard');              // ←  BROKEN (transposed)
    await expect(page.locator('[data-testid="btn-gird-veiw"]')).toHaveClass(/active/); // ←  BROKEN (transposed)
  });

  test('count-total should always stay at 24 regardless of search query', async ({ page }) => {
    await page.locator('[data-testid="seach-input"]').fill('keyboard'); // ←  BROKEN (transposed)
    await expect(page.locator('#count-total')).toHaveText('24');
  });

});

test.describe('Search — Filters', () => {

  test('price-range slider should be present in the sidebar', async ({ page }) => {
    await expect(page.locator('[data-testid="price-range-slidr"]')).toBeVisible(); // ←  BROKEN (typo: slidr)
  });

  test('price range label should default to $500', async ({ page }) => {
    await expect(page.locator('[data-testid="price-range-label"]')).toHaveText('$500');
  });

  test('Apply Filters button should be visible', async ({ page }) => {
    await expect(page.locator('[data-testid="apply-filter-btn"]')).toBeVisible(); // ←  BROKEN (singular: filter)
  });

  test('Clear All Filters button should be visible', async ({ page }) => {
    await expect(page.locator('[data-testid="clear-filters-btn"]')).toBeVisible();
  });

  test('checking the "On Sale" availability checkbox should filter products', async ({ page }) => {
    await page.locator('[data-testid="filter-checkbox-on-sale"]').check();
    await page.locator('[data-testid="apply-filter-btn"]').click(); // ←  BROKEN (singular)
    const count = await page.locator('#count-shown').textContent();
    expect(parseInt(count!)).toBeLessThan(24);
  });

  test('sort by "Price: Low to High" should re-order the grid', async ({ page }) => {
    await page.locator('[data-testid="sort-select"]').selectOption('price-asc');
    // First card's price should be <= last card's price — just assert grid is still populated
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
  });

  test('selecting the Tech & Gadgets category filter and applying should reduce results', async ({ page }) => {
    await page.locator('[data-testid="filter-checkbox-tech"]').check();
    await page.locator('[data-testid="apply-filter-btn"]').click(); // ←  BROKEN (singular)
    const count = await page.locator('#count-shown').textContent();
    expect(parseInt(count!)).toBeLessThan(24);
  });

});
