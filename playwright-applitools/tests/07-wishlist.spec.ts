import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Wishlist', () => {

  test('wishlist panel open visual state (empty)', async ({ page, visual }) => {
    await page.getByTestId('wishlist-nav-btn').click();
    await visual.check('Empty wishlist panel', Target.region(page.getByTestId('wishlist-panel')));
  });

  test('wishlist with one item visual state', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await page.getByTestId('wishlist-nav-btn').click();
    await visual.check('Wishlist with 1 item', Target.region(page.getByTestId('wishlist-item-list')));
  });

  test('wishlist badge visual state after adding item', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await visual.check('Wishlist badge showing 1', Target.region(page.getByTestId('wishlist-count').locator('..')));
  });

  test('remove item from wishlist visual state', async ({ page, visual }) => {
    await page.getByTestId('product-card-2').getByTestId('btn-wishlist').click();
    await page.getByTestId('wishlist-nav-btn').click();
    await page.getByTestId('wishlist-item-list').locator('.cart-item-remove').first().click();
    await visual.check('Wishlist after item removal', Target.region(page.getByTestId('wishlist-item-list')));
  });

  test('move to cart visual transition', async ({ page, visual }) => {
    await page.getByTestId('product-card-2').getByTestId('btn-wishlist').click();
    await page.getByTestId('wishlist-nav-btn').click();
    await page.getByTestId('wishlist-item-list').locator('.btn-cart').first().click();
    await visual.check('Cart after move from wishlist', Target.region(page.getByTestId('cart-panel')));
  });

  test('wishlist multiple items visual', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByTestId('btn-wishlist').click();
    await page.getByTestId('product-card-2').getByTestId('btn-wishlist').click();
    await page.getByTestId('product-card-3').getByTestId('btn-wishlist').click();
    await page.getByTestId('wishlist-nav-btn').click();
    await visual.check('Wishlist with 3 items', Target.region(page.getByTestId('wishlist-panel')));
  });

});
