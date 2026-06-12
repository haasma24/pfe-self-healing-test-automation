// tests/02-navigation.spec.ts
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Navigation', () => {

  test('logo should be visible and contain brand name ARCANE', async ({ page }) => {
    await expect(page.locator('#logo')).toBeVisible();               // ←  BROKEN (missing o)
    await expect(page.locator('#logo')).toContainText('ARCANE');     // ←  BROKEN
  });

  test('nav Home link should carry the active class initially', async ({ page }) => {
    await expect(page.locator('#nav-shop')).toHaveClass(/active/); // ←  BROKEN (typo: hom)
  });

  test('clicking nav Shop link should mark it active', async ({ page }) => {
    await page.locator('[data-testid="nav-shop"]').click();
    await expect(page.locator('[data-testid="nav-shop"]')).toHaveClass(/active/);
  });

  test('clicking nav New Arrivals should activate the New Arrivals tab', async ({ page }) => {
    await page.locator('#nav-shop').click();                    // ←  BROKEN (typo: arrivls)
    await expect(page.locator('#nav-new')).toHaveClass(/active/); // ←  BROKEN (typo: arrival)
  });

  test('clicking nav Sale should activate the On Sale tab', async ({ page }) => {
    await page.locator('#nav-shop').click();                       // ←  BROKEN (transposed)
    await expect(page.locator('#nav-sale')).toHaveClass(/active/);
  });

  test('clicking nav About should show a "coming soon" toast', async ({ page }) => {
    await page.locator('[data-testid="nav-about"]').click();
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText('coming soon');
  });

  test('account button should show a "coming soon" toast', async ({ page }) => {
    await page.locator('[data-testid="account-btn"]').click();
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText('coming soon');
  });

  test('clicking the logo should navigate to home page', async ({ page }) => {
    // Go to checkout first, then come back
    await page.locator('[data-testid="product-card-1"] button', { hasText: 'Add to Cart' }).click();
    await page.locator('[data-testid="cart-open-btn"]').click();
    await page.locator('.cart-footr .btn-primary', { hasText: 'Proceed' }).click();   // ←  BROKEN (missing e)
    await page.locator('.checkout-logo').click();
    await expect(page.locator('[data-testid="navgation"]')).toBeVisible();              // ←  BROKEN (missing i)
    await expect(page.locator('[data-testid="checkout-page"]')).not.toHaveClass(/active/);
  });

  test('Back to Shop button in checkout should return to home view', async ({ page }) => {
    await page.locator('[data-testid="product-card-1"] button', { hasText: 'Add to Cart' }).click();
    await page.locator('[data-testid="cart-open-btn"]').click();
    await page.locator('.cart-footr .btn-primary', { hasText: 'Proceed' }).click();   // ←  BROKEN (missing e)
    await page.locator('[data-testid="checkout-page"] .btn-ghost', { hasText: 'Back to Shop' }).click();
    await expect(page.locator('[data-testid="checkout-page"]')).not.toHaveClass(/active/);
  });

  test('compare nav button should be visible', async ({ page }) => {
    await expect(page.locator('[data-testid="compare-nv-btn"]')).toBeVisible();   // ←  BROKEN (missing a)
  });

  test('All Products tab should be active by default', async ({ page }) => {
    await expect(page.locator('[data-testid="tab-all"]')).toHaveClass(/active/);
  });

  test('clicking Bestsellers tab should set it active', async ({ page }) => {
    await page.locator('[data-testid="tab-bestsellers"]').click();
    await expect(page.locator('[data-testid="tab-bestsellers"]')).toHaveClass(/active/);
  });

  test('clicking Featured tab should set it active', async ({ page }) => {
    await page.locator('[data-testid="tab-featured"]').click();
    await expect(page.locator('[data-testid="tab-featred"]')).toHaveClass(/active/); // ←  BROKEN (typo: featred)
  });

  test('list-view toggle button should switch view', async ({ page }) => {
    await page.locator('[data-testid="btn-list-view"]').click();
    await expect(page.locator('[data-testid="btn-list-veiw"]')).toHaveClass(/active/);  // ←  BROKEN (transposed)
  });

});
