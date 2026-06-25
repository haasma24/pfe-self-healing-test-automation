import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Navigation', () => {

  test('logo should be visible and contain brand name ARCANE', async ({ page }) => {
    await expect(page.getByTestId('logo')).toBeVisible();
    await expect(page.getByTestId('logo')).toContainText('ARCANE');
  });

  test('nav Home link should carry the active class initially', async ({ page }) => {
    await expect(page.getByTestId('nav-home')).toHaveClass(/active/);
  });

  test('clicking nav Shop link should mark it active', async ({ page }) => {
    await page.getByTestId('nav-shop').click();
    await expect(page.getByTestId('nav-shop')).toHaveClass(/active/);
  });

  test('clicking nav New Arrivals should activate the New Arrivals tab', async ({ page }) => {
    await page.getByTestId('nav-shop').click();
    await expect(page.getByTestId('tab-new-arrivals')).toHaveClass(/active/);
  });

  test('clicking nav Sale should activate the On Sale tab', async ({ page }) => {
    await page.getByTestId('nav-shop').click();
    await expect(page.getByTestId('tab-on-sale')).toHaveClass(/active/);
  });

  test('clicking nav About should show a "coming soon" toast', async ({ page }) => {
    await page.getByTestId('nav-about').click();
    await expect(page.getByTestId('toast-notification')).toContainText('coming soon');
  });

  test('account button should show a "coming soon" toast', async ({ page }) => {
    await page.getByTestId('account-btn').click();
    await expect(page.getByTestId('toast-notification')).toContainText('coming soon');
  });

  test('clicking the logo should navigate to home page', async ({ page }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('cart-open-btn').click();
    await page.getByTestId('cart-footer').getByRole('button', { name: 'Proceed' }).click();
    await page.getByTestId('checkout-logo').click();
    await expect(page.getByTestId('nav-home')).toBeVisible();
    await expect(page.getByTestId('checkout-page')).not.toHaveClass(/active/);
  });

  test('Back to Shop button in checkout should return to home view', async ({ page }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('cart-open-btn').click();
    await page.getByTestId('cart-footer').getByRole('button', { name: 'Proceed' }).click();
    await page.getByTestId('checkout-page').getByRole('button', { name: 'Back to Shop' }).click();
    await expect(page.getByTestId('checkout-page')).not.toHaveClass(/active/);
  });

  test('compare nav button should be visible', async ({ page }) => {
    await expect(page.getByTestId('compare-nav-btn')).toBeVisible();
  });

  test('All Products tab should be active by default', async ({ page }) => {
    await expect(page.getByTestId('tab-all')).toHaveClass(/active/);
  });

  test('clicking Bestsellers tab should set it active', async ({ page }) => {
    await page.getByTestId('tab-bestsellers').click();
    await expect(page.getByTestId('tab-bestsellers')).toHaveClass(/active/);
  });

  test('clicking Featured tab should set it active', async ({ page }) => {
    await page.getByTestId('tab-featured').click();
    await expect(page.getByTestId('tab-featured')).toHaveClass(/active/);
  });

  test('list-view toggle button should switch view', async ({ page }) => {
    await page.getByTestId('btn-list-view').click();
    await expect(page.getByTestId('btn-list-view')).toHaveClass(/active/);
  });

});
