import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Search — Modal', () => {

  test('search modal open visual state', async ({ page, visual }) => {
    await page.getByTestId('search-trigger').click();
    await visual.check('Search modal open', Target.region(page.getByTestId('search-modal')));
  });

  test('search modal with results visual', async ({ page, visual }) => {
    await page.getByTestId('search-trigger').click();
    await page.getByTestId('search-modal-input').fill('keyboard');
    await visual.check('Search results for keyboard', Target.region(page.getByTestId('search-modal-results')));
  });

  test('search result click visual transition to product modal', async ({ page, visual }) => {
    await page.getByTestId('search-trigger').click();
    await page.getByTestId('search-modal-input').fill('keyboard');
    await page.locator('.search-result-item').first().click();
    await visual.check('Product modal after search result click', Target.region(page.getByTestId('product-modal-overlay')));
  });

});

test.describe('Search — Inline Toolbar', () => {

  test('inline search filtering visual state', async ({ page, visual }) => {
    await page.getByTestId('search-input').fill('keyboard');
    await visual.check('Inline search filtered grid', Target.region(page.getByTestId('product-grid')));
  });

  test('empty inline search restored to 24 products visual', async ({ page, visual }) => {
    await page.getByTestId('search-input').fill('keyboard');
    await page.getByTestId('search-input').fill('');
    await visual.check('Grid restored after clear search', Target.region(page.getByTestId('product-grid')));
  });

  test('no results visual state', async ({ page, visual }) => {
    await page.getByTestId('search-input').fill('xyznotexisting12345');
    await visual.check('No products found visual', Target.region(page.getByTestId('product-grid')));
  });

  test('case insensitive search visual result', async ({ page, visual }) => {
    await page.getByTestId('search-input').fill('KEYBOARD');
    await visual.check('Case insensitive search result', Target.region(page.getByTestId('product-grid')));
  });

});

test.describe('Search — Filters', () => {

  test('price range slider visual state', async ({ page, visual }) => {
    await visual.check('Price range slider', Target.region(page.getByTestId('price-range-slider')));
  });

  test('on sale filter applied visual state', async ({ page, visual }) => {
    await page.getByTestId('filter-checkbox-on-sale').check();
    await page.getByTestId('apply-filters-btn').click();
    await visual.check('Products after on-sale filter', Target.region(page.getByTestId('product-grid')));
  });

  test('tech category filter applied visual state', async ({ page, visual }) => {
    await page.getByTestId('filter-checkbox-tech').check();
    await page.getByTestId('apply-filters-btn').click();
    await visual.check('Products after tech filter', Target.region(page.getByTestId('product-grid')));
  });

  test('sort by price ascending visual result', async ({ page, visual }) => {
    await page.getByTestId('sort-select').selectOption('price-asc');
    await visual.check('Grid sorted by price asc', Target.region(page.getByTestId('product-grid')));
  });

});
