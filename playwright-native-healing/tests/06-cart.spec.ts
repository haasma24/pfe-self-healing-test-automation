import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Cart', () => {

  test('clicking the cart icon should open the cart panel', async ({ page }) => {
    await page.getByTestId('cart-open-btn').click();
    await expect(page.getByTestId('cart-panel')).toHaveClass(/open/);
  });

  test('clicking Clear Cart should hide the cart panel', async ({ page }) => {
    await page.getByTestId('cart-open-btn').click();
    await page.getByTestId('cart-footer').getByRole('button', { name: 'Clear Cart' }).click();
    await expect(page.getByTestId('cart-item-list')).toContainText('Your cart is empty');
  });

  test('Clear Cart button should remove all items at once', async ({ page }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('product-card-2').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('cart-open-btn').click();
    await page.getByTestId('cart-footer').getByRole('button', { name: 'Proceed' }).click();
    await expect(page.getByTestId('checkout-page')).toHaveClass(/active/);
  });

  test('cart badge should reflect the correct item count after multiple adds', async ({ page }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('product-card-2').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('product-card-3').getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByTestId('cart-item-count')).toHaveText('3');
  });

});
