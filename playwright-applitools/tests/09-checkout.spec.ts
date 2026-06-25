import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

async function goToCheckout(page: any) {
  await page.getByTestId('product-card-1').getByRole('button', { name: 'Add to Cart' }).click();
  await page.getByTestId('cart-open-btn').click();
  await page.getByTestId('cart-footer').getByRole('button', { name: 'Proceed' }).click();
  await expect(page.getByTestId('checkout-page')).toHaveClass(/active/);
}

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Checkout — Page Entry', () => {

  test('checkout page visual state after proceed', async ({ page, visual }) => {
    await goToCheckout(page);
    await visual.check('Checkout page full', Target.region(page.getByTestId('checkout-page')));
  });

  test('order summary visual section', async ({ page, visual }) => {
    await goToCheckout(page);
    await visual.check('Order summary', Target.region(page.getByTestId('co-subtotal').locator('..')));
  });

  test('checkout form fields visual state', async ({ page, visual }) => {
    await goToCheckout(page);
    await visual.check('Checkout form fields', Target.region(page.locator('#step-info')));
  });

  test('continue to checkout button visual', async ({ page, visual }) => {
    await goToCheckout(page);
    await visual.check('Continue to shipping button', Target.region(page.getByTestId('checkout-continue-btn').locator('..')));
  });

});

test.describe('Checkout — Step Navigation', () => {

  test('step 2 shipping options visual state', async ({ page, visual }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await visual.check('Shipping options step 2', Target.region(page.getByTestId('shipping-options')));
  });

  test('step 3 payment fields visual state', async ({ page, visual }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await visual.check('Payment fields step 3', Target.region(page.locator('#card-payment-fields')));
  });

});

test.describe('Checkout — Coupon & Order', () => {

  test('coupon applied discount visual', async ({ page, visual }) => {
    await goToCheckout(page);
    await page.getByTestId('co-coupon').fill('FLASH30');
    await page.getByRole('button', { name: 'Apply' }).first().click();
    await visual.check('Discount row after coupon', Target.region(page.getByTestId('co-discount-row').locator('..')));
  });

  test('invalid coupon error toast visual', async ({ page, visual }) => {
    await goToCheckout(page);
    await page.getByTestId('co-coupon').fill('WRONGCODE');
    await page.getByRole('button', { name: 'Apply' }).first().click();
    await visual.check('Invalid coupon toast', Target.region(page.getByTestId('toast-notification')));
  });

  test('order confirmation visual after successful purchase', async ({ page, visual }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-email').fill('test@arcane.com');
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await visual.check('Order confirmation page', Target.region(page.locator('#confirmation-page')));
  });

  test('empty cart visual after successful order', async ({ page, visual }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-email').fill('test@arcane.com');
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await visual.check('Cart badge at 0 after order', Target.region(page.getByTestId('cart-item-count').locator('..')));
  });

});
