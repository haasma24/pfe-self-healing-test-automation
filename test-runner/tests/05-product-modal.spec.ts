// tests/05-product-modal.spec.ts
// ~25% of locators intentionally broken (←  BROKEN) to validate the ML healer pipeline
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Product Modal', () => {

  test('clicking a product name should open the modal overlay', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] .product-name').click();
    await expect(page.locator('[data-testid="product-modal-overlay"]')).toHaveClass(/open/); // ←  BROKEN (typo: ovrlay)
  });

  test('modal should display the correct product name for card 1', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await expect(page.locator('#modal-title')).toHaveText('Apex Pro Mechanical Keyboard'); // ←  BROKEN (typo: titl)
  });

  test('modal should display the correct category for card 1', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await expect(page.locator('#modal-category')).toHaveText('Tech & Gadgets'); // ←  BROKEN (missing e)
  });

  test('modal should display the current sale price for card 1', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await expect(page.locator('#modal-price')).toContainText('$149.99');
  });

  test('modal should display the original price when product is on sale', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await expect(page.locator('#modal-price')).toContainText('$199.99');
  });

  test('Description tab content should be visible by default', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await expect(page.locator('#modal-desc')).toContainText('mechanical keyboard');
  });

  test('clicking Specs tab should reveal the specs table', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await page.locator('.modal-tab-btns', { hasText: 'Specs' }).click(); // ←  BROKEN (typo: btns)
    await expect(page.locator('#modal-specs-table')).toContainText('Cherry MX Brown');
  });

  test('clicking Reviews tab should reveal reviewer names', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await page.locator('.modal-tab-btns', { hasText: 'Reviews' }).click(); // ←  BROKEN (abbrev)
    await expect(page.locator('#modal-reviews-list')).toContainText('Alex M.');
  });

  test('modal quantity should start at 1', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await expect(page.locator('#modal-qty-val')).toHaveText('1');     // ←  BROKEN (missing y)
  });

  test('clicking + should increase modal quantity to 2', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await page.locator('.modal-qty-btn', { hasText: '+' }).click();
    await expect(page.locator('#modal-qty-val')).toHaveText('2');     // ←  BROKEN (missing y)
  });

  test('clicking − when quantity is 1 should not drop below 1', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await page.locator('.modal-qty-btn', { hasText: '−' }).click();
    await expect(page.locator('#modal-qty-val')).toHaveText('1');     // ←  BROKEN (missing y)
  });

  test('apparel product should show the size picker', async ({ page }) => {
    await page.locator('[data-testid="product-card-6"]').click();
    await expect(page.locator('#modal-size-picker')).toBeVisible();
  });

  test('non-apparel product should hide the size picker', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await expect(page.locator('#modal-size-picker')).toBeHidden();
  });

  test('clicking the X close button should close the modal', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await page.locator('.modal-clse').click();                                       // ←  BROKEN (typo: clse)
    await expect(page.locator('[data-testid="product-modal-overlay"]')).not.toHaveClass(/open/);
  });

  test('pressing Escape should close the modal', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="product-modal-overlay"]')).not.toHaveClass(/open/);
  });

  test('Add to Wishlist from modal should increment the wishlist badge', async ({ page }) => {
    await page.locator('[data-testid="product-card-2"]').click();
    await page.locator('#product-modal .btn-secondary', { hasText: 'Add to Wishlist' }).click();
    await expect(page.locator('[data-testid="wishlist-cnt"]')).toHaveText('1'); // ←  BROKEN (missing ou)
  });

  test('recently-viewed section should be hidden before any modal is opened', async ({ page }) => {
    await expect(page.locator('#recently-vied-section')).toBeHidden(); // ←  BROKEN (typo: vied)
  });

  test('opening and closing a modal should add the product to recently viewed', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await page.locator('.modal-clse').click();                                          // ←  BROKEN (typo: clse)
    await expect(page.locator('#rv-grid')).toContainText('Apex Pro Mechanical Keyboard');
  });

  test('recently viewed grid should cap at 6 items', async ({ page }) => {
    for (let i = 1; i <= 7; i++) {
      await page.locator(`[data-testid="product-card-${i}"]`).click();
      await page.locator('.modal-clse').click();                                          // ←  BROKEN (typo: clse)
    }
    await expect(page.locator('#rv-grid .rv-card')).toHaveCount(6);
  });

  test('modal Add to Cart button should update the cart badge', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"]').click();
    await page.locator('#product-modal .btn-primary', { hasText: 'Add to Cart' }).click();
    await expect(page.locator('[data-testid="cart-item-cnt"]')).not.toHaveText('0'); // ←  BROKEN (missing ou)
  });

});
