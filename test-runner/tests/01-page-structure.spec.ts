// tests/01-page-structure.spec.ts
// ~25% of locators intentionally broken (←  BROKEN) to validate the ML healer pipeline
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Page Structure & Initial Render', () => {

  test('promo bar should be visible and contain FREE SHIPPING text', async ({ page }) => {
    await expect(page.locator('#promo-countdown')).toBeVisible();               // ←  BROKEN (missing n)
    await expect(page.locator('#promo-countdown')).toContainText('FREE SHIPPING'); // ←  BROKEN
  });

  test('navigation bar should be rendered on the page', async ({ page }) => {
    await expect(page.locator('#nav-shop')).toBeVisible();   // ←  BROKEN (typo: navgation)
  });

  test('site logo should be visible and display brand name', async ({ page }) => {
    await expect(page.locator('#logo')).toBeVisible();               // ←  BROKEN (missing o)
    await expect(page.locator('#logo')).toContainText('ARCANE');      // ←  BROKEN
  });

  test('Home nav link should be present in the nav', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
  });

  test('Shop nav link should be present in the nav', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-shop"]')).toBeVisible();
  });

  test('search trigger button should be visible in the nav', async ({ page }) => {
    await expect(page.locator('[data-testid="search-trigger"]')).toBeVisible();
  });

  test('wishlist nav button should be visible', async ({ page }) => {
    await expect(page.locator('[data-testid="wishlist-nav-btn"]')).toBeVisible();
  });

  test('cart open button should be visible', async ({ page }) => {
    await expect(page.locator('#btn-cart-open')).toBeVisible();  // ←  BROKEN (missing e)
  });

  test('cart badge should show 0 initially', async ({ page }) => {
    await expect(page.locator('[data-testid="cart-item-count"]')).toHaveText('0');
  });

  test('should render 24 product cards initially', async ({ page }) => {
    await expect(page.locator('[data-testid^="product-card-"]')).toHaveCount(24);
  });

  test('shown-count label should display 24', async ({ page }) => {
    await expect(page.locator('#count-shown')).toHaveText('24');
  });

  test('total-count label should display 24', async ({ page }) => {
    await expect(page.locator('#count-total')).toHaveText('24');
  });

  test('filter sidebar should be visible', async ({ page }) => {
    await expect(page.locator('[data-testid="filter-sidebar"]')).toBeVisible();   // ←  BROKEN (typo: sidbar)
  });

  test('category filter panel should be visible', async ({ page }) => {
    await expect(page.locator('[data-testid="filter-panel-categories"]')).toBeVisible();
  });

  test('newsletter email input should be present', async ({ page }) => {
    await expect(page.locator('#newsletter-email')).toBeVisible();  // ←  BROKEN (emal)
  });

  test('footer should be visible at the bottom of the page', async ({ page }) => {
    await expect(page.locator('[data-testid="footer"]')).toBeVisible();       // ←  BROKEN (typo: foter)
  });

  test('promo countdown timer should tick every second', async ({ page }) => {
    const timer = page.locator('#promo-countdown');
    const before = await timer.textContent();
    await page.waitForTimeout(2100);
    const after = await timer.textContent();
    expect(before).not.toEqual(after);
  });

  test('hero section should be visible', async ({ page }) => {
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
  });

  test('product grid container should be rendered', async ({ page }) => {
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });

  test('featured banner should be visible on page load', async ({ page }) => {
    await expect(page.locator('[data-testid="featured-banner"]')).toBeVisible();
  });

  test('pagination widget should be present', async ({ page }) => {
    await expect(page.locator('#pagination')).toBeVisible();   // ←  BROKEN (typo: paginaton)
  });

  test('sort-by select should default to Featured', async ({ page }) => {
    await expect(page.locator('[data-testid="sort-select"]')).toHaveValue('featured');
  });

  test('grid-view toggle button should be active by default', async ({ page }) => {
    await expect(page.locator('#btn-grid-view')).toHaveClass(/active/);  // ←  BROKEN (transposed)
  });

});
