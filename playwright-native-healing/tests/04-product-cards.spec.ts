import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Product Cards', () => {

  test('each card should display name, price, rating stars and action buttons', async ({ page }) => {
    const card = page.getByTestId('product-card-1');
    await expect(card.locator('.product-name')).toBeVisible();
    await expect(card.locator('.price-current')).toBeVisible();
    await expect(card.locator('.stars')).toBeVisible();
    await expect(card.locator('.rating-count')).toBeVisible();
    await expect(card.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
    await expect(card.getByTestId('btn-wishlist')).toBeVisible();
  });

  test('card 1 should show a SALE badge', async ({ page }) => {
    await expect(page.getByTestId('product-card-1').locator('.product-badge.sale')).toContainText('SALE');
  });

  test('sale card should show the original price struck through', async ({ page }) => {
    await expect(page.getByTestId('product-card-1').locator('.price-original')).toBeVisible();
  });

  test('sale card should show a discount percentage badge', async ({ page }) => {
    await expect(page.getByTestId('product-card-1').locator('.price-discount')).toContainText('OFF');
  });

  test('card 2 should display a NEW badge', async ({ page }) => {
    await expect(page.getByTestId('product-card-2').locator('.product-badge.new')).toContainText('NEW');
  });

  test('card 6 should display a HOT badge', async ({ page }) => {
    await expect(page.getByTestId('product-card-6').locator('.product-badge.hot')).toContainText('HOT');
  });

  test('card 3 should not show any badge', async ({ page }) => {
    await expect(page.getByTestId('product-card-3').locator('.product-badge')).toBeHidden();
  });

  test('low-stock product (card 3) should show the stock-low indicator', async ({ page }) => {
    await expect(page.getByTestId('product-card-3').locator('.stock-low')).toBeVisible();
  });

  test('well-stocked product (card 4) should show "In stock"', async ({ page }) => {
    await expect(page.getByTestId('product-card-4').locator('.stock-ok')).toContainText('In stock');
  });

  test('hovering a card should reveal the quick-action buttons overlay', async ({ page }) => {
    const card = page.getByTestId('product-card-1');
    await card.hover();
    await expect(card.getByTestId('product-quick-actions')).toBeVisible();
  });

  test('card 1 category label should read "Tech & Gadgets"', async ({ page }) => {
    await expect(page.getByTestId('product-card-1').locator('.product-category')).toContainText('Tech & Gadgets');
  });

  test('card 2 category label should read "Audio"', async ({ page }) => {
    await expect(page.getByTestId('product-card-2').locator('.product-category')).toContainText('Audio');
  });

  test('card 6 category label should read "Apparel"', async ({ page }) => {
    await expect(page.getByTestId('product-card-6').locator('.product-category')).toContainText('Apparel');
  });

  test('star rating on card 1 should contain the ★ character', async ({ page }) => {
    const text = await page.getByTestId('product-card-1').locator('.stars').textContent();
    expect(text).toContain('★');
  });

  test('review count on card 1 should be wrapped in parentheses', async ({ page }) => {
    await expect(page.getByTestId('product-card-1').locator('.rating-count')).toContainText('(');
  });

  test('clicking the product name should open the product modal', async ({ page }) => {
    await page.getByTestId('product-card-1').locator('.product-name').click();
    await expect(page.getByTestId('product-modal-overlay')).toHaveClass(/open/);
  });

  test('Add to Cart button on card 1 should increment the cart badge', async ({ page }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByTestId('cart-item-count')).not.toHaveText('0');
  });

  test('wishlist button on card 1 should add to wishlist', async ({ page }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await expect(page.getByTestId('wishlist-count')).toHaveText('1');
  });

  test('price-current element should show a dollar amount', async ({ page }) => {
    const priceText = await page.getByTestId('product-card-1').locator('.price-current').textContent();
    expect(priceText).toMatch(/\$[\d.]+/);
  });

  test('all 24 product cards should be present after initial load', async ({ page }) => {
    await expect(page.getByTestId(/^product-card-/)).toHaveCount(24);
  });

});
