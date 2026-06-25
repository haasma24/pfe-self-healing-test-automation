import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Wishlist', () => {

  test('clicking the wishlist nav button should open the wishlist panel', async ({ page }) => {
    await page.getByTestId('wishlist-nav-btn').click();
    await expect(page.getByTestId('wishlist-panel')).toHaveClass(/open/);
  });

  test('Close button should hide the wishlist panel', async ({ page }) => {
    await page.getByTestId('wishlist-nav-btn').click();
    await page.getByTestId('wishlist-panel').getByRole('button', { name: 'Close' }).click();
    await expect(page.getByTestId('wishlist-panel')).not.toHaveClass(/open/);
  });

  test('empty wishlist should show an empty-state message', async ({ page }) => {
    await page.getByTestId('wishlist-nav-btn').click();
    await expect(page.getByTestId('wishlist-items-list')).toContainText('Your wishlist is empty');
  });

  test('adding a product should show it inside the wishlist panel', async ({ page }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await page.getByTestId('wishlist-nav-btn').click();
    await expect(page.getByTestId('wishlist-item-list')).toContainText('Apex Pro Mechanical Keyboard');
  });

  test('wishlist badge count should update to 1 when an item is added', async ({ page }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await expect(page.getByTestId('wishlist-count')).toHaveText('1');
  });

  test('adding a duplicate product should show "Already in wishlist" toast', async ({ page }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await expect(page.getByTestId('toast-notification').last()).toContainText('Already in wishlist');
  });

  test('× button should remove the item from the wishlist', async ({ page }) => {
    await page.getByTestId('product-card-2').getByTestId('btn-wishlist').click();
    await page.getByTestId('wishlist-nav-btn').click();
    await page.getByTestId('wishlist-item-list').locator('.cart-item-remove').first().click();
    await expect(page.getByTestId('wishlist-item-list')).toContainText('Your wishlist is empty');
  });

  test('"Move to Cart" should add item to cart and remove it from wishlist', async ({ page }) => {
    await page.getByTestId('product-card-2').getByTestId('btn-wishlist').click();
    await page.getByTestId('wishlist-nav-btn').click();
    await page.getByTestId('wishlist-item-list').locator('.btn-cart').first().click();
    await expect(page.getByTestId('cart-item-count')).not.toHaveText('0');
    await expect(page.getByTestId('wishlist-item-list')).toContainText('Your wishlist is empty');
  });

  test('"Move All to Cart" should transfer all wishlist items and open the cart panel', async ({ page }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await page.getByTestId('product-card-2').getByTestId('btn-wishlist').click();
    await page.getByTestId('wishlist-nav-btn').click();
    await page.getByTestId('wishlist-panel').getByTestId('cart-footer').getByRole('button', { name: /move/i }).click();
    await expect(page.getByTestId('cart-item-count')).toHaveText('2');
    await expect(page.getByTestId('cart-panel')).toHaveClass(/open/);
  });

  test('wishlist badge should show 0 initially (badge hidden)', async ({ page }) => {
    await expect(page.getByTestId('wishlist-count')).toBeHidden();
  });

  test('wishlist badge should become visible after adding an item', async ({ page }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await expect(page.getByTestId('wishlist-count')).toBeVisible();
  });

  test('adding three products should set wishlist badge to 3', async ({ page }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await page.getByTestId('product-card-2').getByTestId('btn-wishlist').click();
    await page.getByTestId('product-card-3').getByTestId('btn-wishlist').click();
    await expect(page.getByTestId('wishlist-count')).toHaveText('3');
  });

});
