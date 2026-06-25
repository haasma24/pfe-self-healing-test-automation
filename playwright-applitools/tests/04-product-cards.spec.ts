import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Product Cards', () => {

  test('product card 1 visual appearance with sale badge', async ({ page, visual }) => {
    await visual.check('Product card 1 sale', Target.region(page.getByTestId('product-card-1')));
  });

  test('product card 2 visual with NEW badge', async ({ page, visual }) => {
    await visual.check('Product card 2 new', Target.region(page.getByTestId('product-card-2')));
  });

  test('product card 6 visual with HOT badge', async ({ page, visual }) => {
    await visual.check('Product card 6 hot', Target.region(page.getByTestId('product-card-6')));
  });

  test('product card 3 low stock visual indicator', async ({ page, visual }) => {
    await visual.check('Product card 3 low stock', Target.region(page.getByTestId('product-card-3')));
  });

  test('product card 4 in stock visual state', async ({ page, visual }) => {
    await visual.check('Product card 4 in stock', Target.region(page.getByTestId('product-card-4')));
  });

  test('hover overlay on product card should appear visually', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').hover();
    await visual.check('Card 1 hover state', Target.region(page.getByTestId('product-card-1')));
  });

  test('product card filter by name should show details', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').locator('.product-name').click();
    await visual.check('Product modal after name click', Target.region(page.getByTestId('product-modal-overlay')));
  });

  test('add to cart should update badge visually', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await visual.check('Cart badge after add', Target.region(page.getByTestId('cart-item-count').locator('..')));
  });

  test('product grid overview with 24 cards', async ({ page, visual }) => {
    await visual.check('Full product grid', Target.region(page.getByTestId('product-grid')));
  });

});
