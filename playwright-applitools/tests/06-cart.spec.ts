import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Cart', () => {

  test('cart panel open visual state (empty)', async ({ page, visual }) => {
    await page.getByTestId('cart-open-btn').click();
    await visual.check('Empty cart panel', Target.region(page.getByTestId('cart-panel')));
  });

  test('cart with items visual state', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('product-card-2').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('cart-open-btn').click();
    await visual.check('Cart with 2 items', Target.region(page.getByTestId('cart-panel')));
  });

  test('cart badge visual state after adding items', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('product-card-2').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('product-card-3').getByRole('button', { name: 'Add to Cart' }).click();
    await visual.check('Cart badge showing 3 items', Target.region(page.getByTestId('cart-item-count').locator('..')));
  });

  test('clear cart visual state', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('cart-open-btn').click();
    await page.getByTestId('cart-footer').getByRole('button', { name: 'Clear Cart' }).click();
    await visual.check('Cart after clear', Target.region(page.getByTestId('cart-panel')));
  });

  test('proceed to checkout visual transition', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('cart-open-btn').click();
    await page.getByTestId('cart-footer').getByRole('button', { name: 'Proceed' }).click();
    await visual.check('Checkout page after proceed', Target.region(page.getByTestId('checkout-page')));
  });

});
