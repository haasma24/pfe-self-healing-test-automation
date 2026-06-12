// tests/06-cart.spec.ts
// ~25% of locators intentionally broken (←  BROKEN) to validate the ML healer pipeline
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Cart', () => {

  test('clicking the cart icon should open the cart panel', async ({ page }) => {
    await page.locator('[data-testid="cart-open-btn"]').click();
    await expect(page.locator('[data-testid="cart-pnel"]')).toHaveClass(/open/); // ←  BROKEN (typo: pnel)
  });

  test('clicking Close should hide the cart panel', async ({ page }) => {
    await page.locator('[data-testid="cart-open-btn"]').click();
    await page.locator('.cart-footr .btn-ghost', { hasText: 'Clear Cart' }).click();  // ←  BROKEN (missing e)
    await expect(page.locator('#cart-item-list')).toContainText('Your cart is empty'); // ←  BROKEN (singular)
  });

  test('Clear Cart button should remove all items at once', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] button', { hasText: 'Add to Cart' }).click();
    await page.locator('[data-testid="product-card-2"] button', { hasText: 'Add to Cart' }).click();
    await page.locator('[data-testid="cart-open-btn"]').click();
    await page.locator('.cart-footr .btn-primary', { hasText: 'Proceed' }).click();   // ←  BROKEN (missing e)
    await expect(page.locator('[data-testid="checkout-pag"]')).toHaveClass(/active/); // ←  BROKEN (missing e)
  });

  test('cart badge should reflect the correct item count after multiple adds', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] button', { hasText: 'Add to Cart' }).click();
    await page.locator('[data-testid="product-card-2"] button', { hasText: 'Add to Cart' }).click();
    await page.locator('[data-testid="product-card-3"] button', { hasText: 'Add to Cart' }).click();
    await expect(page.locator('[data-testid="cart-item-count"]')).toHaveText('3');
  });

});
