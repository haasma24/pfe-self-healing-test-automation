import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

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

  test('checkout page should become active after Proceed to Checkout', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-page')).toHaveClass(/active/);
  });

  test('checkout page should display the order summary section', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('co-subtotal')).toBeVisible();
  });

  test('order summary should list the added product', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-page')).toContainText('Apex Pro');
  });

  test('checkout email field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-email')).toBeVisible();
  });

  test('checkout first name field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-firstname')).toBeVisible();
  });

  test('checkout last name field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-lastname')).toBeVisible();
  });

  test('checkout address field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-address')).toBeVisible();
  });

  test('checkout city field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-city')).toBeVisible();
  });

  test('checkout ZIP field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-zip')).toBeVisible();
  });

  test('Continue to Shipping button should be visible on step 1', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.getByTestId('checkout-continue-btn')).toBeVisible();
  });

});

test.describe('Checkout — Step Navigation', () => {

  test('step 1 should be active when checkout opens', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('#step-info')).toHaveClass(/active/);
  });

  test('continuing to step 2 should reveal shipping options', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await expect(page.getByTestId('shipping-options')).toBeVisible();
  });

  test('step 2 should show three shipping options', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await expect(page.locator('.shipping-option')).toHaveCount(3);
  });

  test('continuing from step 2 should show the payment method selector', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await expect(page.locator('#card-payment-fields')).toBeVisible();
  });

  test('card payment fields should be visible by default on step 3', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await expect(page.getByTestId('checkout-card-number')).toBeVisible();
  });

  test('card expiry field should be present on step 3', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await expect(page.getByTestId('checkout-expiry')).toBeVisible();
  });

  test('CVV field should be present on step 3', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await expect(page.getByTestId('checkout-cvv')).toBeVisible();
  });

});

test.describe('Checkout — Coupon & Order', () => {

  test('applying a valid coupon code FLASH30 should show discount', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('co-coupon').fill('FLASH30');
    await page.getByRole('button', { name: 'Apply' }).first().click();
    await expect(page.getByTestId('co-discount-row')).toBeVisible();
  });

  test('applying invalid coupon at checkout should show an error toast', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('co-coupon').fill('WRONGCODE');
    await page.getByRole('button', { name: 'Apply' }).first().click();
    await expect(page.getByTestId('toast-notification')).toContainText('Invalid');
  });

  test('placing an order without an email should show a validation toast', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page.getByTestId('toast-notification')).toContainText('email');
  });

  test('placing a valid order should show the confirmation page', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-email').fill('test@arcane.com');
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page.locator('#confirmation-page')).toHaveClass(/active/);
  });

  test('confirmation page should display an order number', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-email').fill('test@arcane.com');
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page.locator('#confirmation-order-num')).toContainText('ARC-');
  });

  test('cart should be cleared after a successful order', async ({ page }) => {
    await goToCheckout(page);
    await page.getByTestId('checkout-email').fill('test@arcane.com');
    await page.getByTestId('checkout-continue-btn').click();
    await page.getByTestId('checkout-continue-shipping-btn').click();
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page.getByTestId('cart-item-count')).toHaveText('0');
  });

});
