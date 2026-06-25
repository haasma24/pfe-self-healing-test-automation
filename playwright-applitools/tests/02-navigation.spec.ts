import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Navigation', () => {

  test('logo should appear visually correct in the nav', async ({ page, visual }) => {
    await visual.check('Site logo', Target.region(page.getByTestId('logo')));
  });

  test('nav bar appearance with active home link', async ({ page, visual }) => {
    await visual.check('Navigation bar with active Home', Target.region(page.getByTestId('nav-home').locator('..')));
  });

  test('clicking Shop nav link and checking visual state', async ({ page, visual }) => {
    await page.getByTestId('nav-shop').click();
    await visual.check('Shop tab active visual state', Target.region(page.getByTestId('nav-shop').locator('..')));
  });

  test('clicking nav About should show toast visually', async ({ page, visual }) => {
    await page.getByTestId('nav-about').click();
    await visual.check('About toast notification', Target.region(page.getByTestId('toast-notification')));
  });

  test('account button should show toast visually', async ({ page, visual }) => {
    await page.getByTestId('account-btn').click();
    await visual.check('Account toast notification', Target.region(page.getByTestId('toast-notification')));
  });

  test('checkout page visual state after navigation', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
    await page.getByTestId('cart-open-btn').click();
    await page.getByTestId('cart-footer').getByRole('button', { name: 'Proceed' }).click();
    await visual.check('Checkout page visual', Target.region(page.getByTestId('checkout-page')));
  });

  test('featured tab should appear active visually', async ({ page, visual }) => {
    await page.getByTestId('tab-featured').click();
    await visual.check('Featured tab active', Target.region(page.getByTestId('tab-featured')));
  });

  test('list view toggle visual state after click', async ({ page, visual }) => {
    await page.getByTestId('btn-list-view').click();
    await visual.check('List view toggle active', Target.region(page.getByTestId('btn-list-view')));
  });

});
