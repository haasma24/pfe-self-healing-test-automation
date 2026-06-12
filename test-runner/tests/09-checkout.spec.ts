// tests/09-checkout.spec.ts
// ~25% of locators intentionally broken (←  BROKEN) to validate the ML healer pipeline
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';

/** Helper: add card-1 to cart and navigate to checkout */
async function goToCheckout(page: any) {
  await page.locator('[data-testid="product-card-1"] button', { hasText: 'Add to Cart' }).click();
  await page.locator('[data-testid="cart-open-btn"]').click();
  await page.locator('.cart-footr .btn-primary', { hasText: 'Proceed to Checkout' }).click(); // ←  BROKEN (missing e)
  await expect(page.locator('[data-testid="checkout-pag"]')).toHaveClass(/active/);             // ←  BROKEN (missing e)
}

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Checkout — Page Entry', () => {

  test('checkout page should become active after Proceed to Checkout', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-pag"]')).toHaveClass(/active/); // ←  BROKEN (typo: pag)
  });

  test('checkout page should display the order summary section', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('#co-subtotl')).toBeVisible(); // ←  BROKEN (typo: subtotl)
  });

  test('order summary should list the added product', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-page"]')).toContainText('Apex Pro');
  });

  test('checkout email field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-emal"]')).toBeVisible(); // ←  BROKEN (typo: emal)
  });

  test('checkout first name field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-firstname"]')).toBeVisible();
  });

  test('checkout last name field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-lastname"]')).toBeVisible();
  });

  test('checkout address field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-address"]')).toBeVisible();
  });

  test('checkout city field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-city"]')).toBeVisible();
  });

  test('checkout ZIP field should be present', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-zip"]')).toBeVisible();
  });

  test('Continue to Shipping button should be visible on step 1', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-contnue-btn"]')).toBeVisible(); // ←  BROKEN (missing i)
  });

});

test.describe('Checkout — Step Navigation', () => {

  test('step 1 should be active when checkout opens', async ({ page }) => {
    await goToCheckout(page);
    await expect(page.locator('#step-info')).toHaveClass(/active/);
  });

  test('continuing to step 2 should reveal shipping options', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-continue-btn"]').click();
    await expect(page.locator('#shipping-optins')).toBeVisible(); // ←  BROKEN (typo: optins)
  });

  test('step 2 should show three shipping options', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-continue-btn"]').click();
    await expect(page.locator('.shipping-option')).toHaveCount(3);
  });

  test('continuing from step 2 should show the payment method selector', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-continue-btn"]').click();
    await page.locator('[data-testid="checkout-continue-shipping-btn"]').click();
    await expect(page.locator('#card-payment-fields')).toBeVisible();
  });

  test('card payment fields should be visible by default on step 3', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-continue-btn"]').click();
    await page.locator('[data-testid="checkout-continue-shipping-btn"]').click();
    await expect(page.locator('[data-testid="checkout-card-nmbr"]')).toBeVisible(); // ←  BROKEN (typo: nmbr)
  });

  test('card expiry field should be present on step 3', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-continue-btn"]').click();
    await page.locator('[data-testid="checkout-continue-shipping-btn"]').click();
    await expect(page.locator('[data-testid="checkout-expiry"]')).toBeVisible();
  });

  test('CVV field should be present on step 3', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-continue-btn"]').click();
    await page.locator('[data-testid="checkout-continue-shipping-btn"]').click();
    await expect(page.locator('[data-testid="checkout-cvv"]')).toBeVisible();
  });

});

test.describe('Checkout — Coupon & Order', () => {

  test('applying a valid coupon code FLASH30 should show discount', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#co-cupn').fill('FLASH30'); // ←  BROKEN (typo: cupn)
    await page.locator('button', { hasText: 'Apply' }).first().click();
    await expect(page.locator('#co-discount-rw')).toBeVisible(); // ←  BROKEN (missing o)
  });

  test('applying invalid coupon at checkout should show an error toast', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#co-cupn').fill('WRONGCODE');           // ←  BROKEN (missing o)
    await page.locator('button', { hasText: 'Apply' }).first().click();
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText('Invalid');
  });

  test('placing an order without an email should show a validation toast', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-continue-btn"]').click();
    await page.locator('[data-testid="checkout-continue-shipping-btn"]').click();
    await page.locator('button', { hasText: 'Place Order' }).click();
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText('email');
  });

  test('placing a valid order should show the confirmation page', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-emal"]').fill('test@arcane.com'); // ←  BROKEN (missing i)
    await page.locator('[data-testid="checkout-contnue-btn"]').click();          // ←  BROKEN (missing i)
    await page.locator('[data-testid="checkout-continue-shipping-btn"]').click();
    await page.locator('button', { hasText: 'Place Order' }).click();
    await expect(page.locator('#confirmation-page')).toHaveClass(/active/);
  });

  test('confirmation page should display an order number', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-emal"]').fill('test@arcane.com'); // ←  BROKEN (missing i)
    await page.locator('[data-testid="checkout-contnue-btn"]').click();          // ←  BROKEN (missing i)
    await page.locator('[data-testid="checkout-continue-shipping-btn"]').click();
    await page.locator('button', { hasText: 'Place Order' }).click();
    await expect(page.locator('#confirmation-order-num')).toContainText('ARC-');
  });

  test('cart should be cleared after a successful order', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('[data-testid="checkout-emal"]').fill('test@arcane.com'); // ←  BROKEN (missing i)
    await page.locator('[data-testid="checkout-contnue-btn"]').click();          // ←  BROKEN (missing i)
    await page.locator('[data-testid="checkout-continue-shipping-btn"]').click();
    await page.locator('button', { hasText: 'Place Order' }).click();
    await expect(page.locator('[data-testid="cart-item-cnt"]')).toHaveText('0'); // ←  BROKEN (missing ou)
  });

});
