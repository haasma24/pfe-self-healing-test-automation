import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Page Structure & Initial Render', () => {

  test('promo bar should be visible and contain FREE SHIPPING text', async ({ page }) => {
    await expect(page.getByTestId('promo-banner')).toBeVisible();
    await expect(page.getByTestId('promo-banner')).toContainText('FREE SHIPPING');
  });

  test('navigation bar should be rendered on the page', async ({ page }) => {
    await expect(page.getByTestId('nav-home')).toBeVisible();
  });

  test('site logo should be visible and display brand name', async ({ page }) => {
    await expect(page.getByTestId('logo')).toBeVisible();
    await expect(page.getByTestId('logo')).toContainText('ARCANE');
  });

  test('Home nav link should be present in the nav', async ({ page }) => {
    await expect(page.getByTestId('nav-home')).toBeVisible();
  });

  test('Shop nav link should be present in the nav', async ({ page }) => {
    await expect(page.getByTestId('nav-shop')).toBeVisible();
  });

  test('search trigger button should be visible in the nav', async ({ page }) => {
    await expect(page.getByTestId('search-trigger')).toBeVisible();
  });

  test('wishlist nav button should be visible', async ({ page }) => {
    await expect(page.getByTestId('wishlist-nav-btn')).toBeVisible();
  });

  test('cart open button should be visible', async ({ page }) => {
    await expect(page.getByTestId('cart-open-btn')).toBeVisible();
  });

  test('cart badge should show 0 initially', async ({ page }) => {
    await expect(page.getByTestId('cart-item-count')).toHaveText('0');
  });

  test('should render 24 product cards initially', async ({ page }) => {
    await expect(page.getByTestId(/^product-card-/)).toHaveCount(24);
  });

  test('shown-count label should display 24', async ({ page }) => {
    await expect(page.getByTestId('count-shown')).toHaveText('24');
  });

  test('total-count label should display 24', async ({ page }) => {
    await expect(page.getByTestId('count-total')).toHaveText('24');
  });

  test('filter sidebar should be visible', async ({ page }) => {
    await expect(page.getByTestId('filter-sidebar')).toBeVisible();
  });

  test('category filter panel should be visible', async ({ page }) => {
    await expect(page.getByTestId('filter-panel-categories')).toBeVisible();
  });

  test('newsletter email input should be present', async ({ page }) => {
    await expect(page.getByTestId('newsletter-email')).toBeVisible();
  });

  test('footer should be visible at the bottom of the page', async ({ page }) => {
    await expect(page.getByTestId('footer')).toBeVisible();
  });

  test('promo countdown timer should tick every second', async ({ page }) => {
    const timer = page.getByTestId('promo-countdown');
    const before = await timer.textContent();
    await page.waitForTimeout(2100);
    const after = await timer.textContent();
    expect(before).not.toEqual(after);
  });

  test('hero section should be visible', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });

  test('product grid container should be rendered', async ({ page }) => {
    await expect(page.getByTestId('product-grid')).toBeVisible();
  });

  test('featured banner should be visible on page load', async ({ page }) => {
    await expect(page.getByTestId('featured-banner')).toBeVisible();
  });

  test('pagination widget should be present', async ({ page }) => {
    await expect(page.getByTestId('pagination')).toBeVisible();
  });

  test('sort-by select should default to Featured', async ({ page }) => {
    await expect(page.getByTestId('sort-select')).toHaveValue('featured');
  });

  test('grid-view toggle button should be active by default', async ({ page }) => {
    await expect(page.getByTestId('btn-grid-view')).toHaveClass(/active/);
  });

});
