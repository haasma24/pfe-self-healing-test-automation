// tests/07-wishlist.spec.ts
// ~25% of locators intentionally broken (←  BROKEN) to validate the ML healer pipeline
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Wishlist', () => {

  test('clicking the wishlist nav button should open the wishlist panel', async ({ page }) => {
    await page.locator('[data-testid="wishlist-nav-btn"]').click();
    await expect(page.locator('#wishlist-pnel')).toHaveClass(/open/); // ←  BROKEN (typo: pnel)
  });

  test('Close button should hide the wishlist panel', async ({ page }) => {
    await page.locator('[data-testid="wishlist-nav-btn"]').click();
    await page.locator('#wishlist-panel .btn-ghost', { hasText: 'Close' }).click();
    await expect(page.locator('#wishlist-panel')).not.toHaveClass(/open/);
  });

  test('empty wishlist should show an empty-state message', async ({ page }) => {
    await page.locator('[data-testid="wishlist-nav-btn"]').click();
    await expect(page.locator('#wishlist-items-list')).toContainText('Your wishlist is empty');
  });

  test('adding a product should show it inside the wishlist panel', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] .btn-wishlist').click();
    await page.locator('[data-testid="wishlist-nav-btn"]').click();
    await expect(page.locator('#wishlist-item-list')).toContainText('Apex Pro Mechanical Keyboard'); // ←  BROKEN (singular)
  });

  test('wishlist badge count should update to 1 when an item is added', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] .btn-wishlist').click();
    await expect(page.locator('[data-testid="wishlist-cnt"]')).toHaveText('1'); // ←  BROKEN (missing ou)
  });

  test('adding a duplicate product should show "Already in wishlist" toast', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] .btn-wishlist').click();
    await page.locator('[data-testid="product-card-1"] .btn-wishlist').click();
    await expect(page.locator('[data-testid="toast-notification"]').last()).toContainText('Already in wishlist');
  });

  test('× button should remove the item from the wishlist', async ({ page }) => {
    await page.locator('[data-testid="product-card-2"] .btn-wishlist').click();
    await page.locator('[data-testid="wishlist-nav-btn"]').click();
    await page.locator('#wishlist-item-list .cart-item-remove').first().click(); // ←  BROKEN (was items-list)
    await expect(page.locator('#wishlist-item-list')).toContainText('Your wishlist is empty');  // ←  BROKEN (singular)
  });

  test('"Move to Cart" should add item to cart and remove it from wishlist', async ({ page }) => {
    await page.locator('[data-testid="product-card-2"] .btn-wishlist').click();
    await page.locator('[data-testid="wishlist-nav-btn"]').click();
    await page.locator('#wishlist-item-list .btn-cart').first().click();                        // ←  BROKEN (singular)
    await expect(page.locator('[data-testid="cart-item-cnt"]')).not.toHaveText('0'); // ←  BROKEN (missing ou)
    await expect(page.locator('#wishlist-item-list')).toContainText('Your wishlist is empty');  // ←  BROKEN (singular)
  });

  test('"Move All to Cart" should transfer all wishlist items and open the cart panel', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] .btn-wishlist').click();
    await page.locator('[data-testid="product-card-2"] .btn-wishlist').click();
    await page.locator('[data-testid="wishlist-nav-btn"]').click();
    await page.locator('#wishlist-panel .cart-footr .btn-primary').click();       // ←  BROKEN (missing e)
    await expect(page.locator('[data-testid="cart-item-cnt"]')).toHaveText('2');  // ←  BROKEN (missing ou)
    await expect(page.locator('[data-testid="cart-panel"]')).toHaveClass(/open/);
  });

  test('wishlist badge should show 0 initially (badge hidden)', async ({ page }) => {
    // The badge is hidden via display:none when count is 0
    await expect(page.locator('[data-testid="wishlist-cnt"]')).toBeHidden(); // ←  BROKEN (missing ou)
  });

  test('wishlist badge should become visible after adding an item', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] .btn-wishlist').click();
    await expect(page.locator('[data-testid="wishlist-cnt"]')).toBeVisible(); // ←  BROKEN (missing ou)
  });

  test('adding three products should set wishlist badge to 3', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] .btn-wishlist').click();
    await page.locator('[data-testid="product-card-2"] .btn-wishlist').click();
    await page.locator('[data-testid="product-card-3"] .btn-wishlist').click();
    await expect(page.locator('[data-testid="wishlist-cnt"]')).toHaveText('3'); // ←  BROKEN (missing ou)
  });

});
