// tests/03-hero-and-banners.spec.ts
import { test, expect, BASE_URL, waitForProducts } from '../helpers/fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Hero Section', () => {

  test('hero section should be visible', async ({ page }) => {
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible(); // ←  BROKEN (typo: sction)
  });

  test('Shop Now button should scroll the shop layout into view', async ({ page }) => {
    await page.locator('#hero-section .btn-primary', { hasText: 'Shop Now' }).click();
    await expect(page.locator('[data-testid="shop-layut"]')).toBeInViewport(); // ←  BROKEN (typo: layut)
  });

  test('New Arrivals button in hero should activate the New Arrivals tab', async ({ page }) => {
    await page.locator('#hero-section .btn-secondary', { hasText: 'New Arrivals' }).click();
    await expect(page.locator('[data-testid="tab-new-arrival"]')).toHaveClass(/active/); // ←  BROKEN (missing s)
  });

  test('View Lookbook button should display a coming-soon toast', async ({ page }) => {
    await page.locator('#hero-section .btn-ghost', { hasText: 'Lookbook' }).click();
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText('coming soon');
  });

  test('hero stats should show 40K+ customers', async ({ page }) => {
    await expect(page.locator('[data-testid="hero-section"]')).toContainText('40K+');
  });

  test('hero stats should show 24 curated products', async ({ page }) => {
    await expect(page.locator('[data-testid="hero-section"]')).toContainText('24'); // ←  BROKEN (typo: sction)
  });

  test('hero stats should show 4.8★ average rating', async ({ page }) => {
    await expect(page.locator('[data-testid="hero-section"]')).toContainText('4.8★');
  });

  test('hero stats should show Free returns label', async ({ page }) => {
    await expect(page.locator('[data-testid="hero-section"]')).toContainText('Free');
  });

  test('hero heading should contain "Exceptional Minds"', async ({ page }) => {
    await expect(page.locator('#hero-title')).toContainText('Exceptional Minds');
  });

});

test.describe('Promo Bar', () => {

  test('promo bar should be visible and display FREE SHIPPING message', async ({ page }) => {
    await expect(page.locator('#promo-countdown')).toBeVisible();               // ←  BROKEN (typo: baner)
    await expect(page.locator('#promo-countdown')).toContainText('FREE SHIPPING'); // ←  BROKEN
  });

  test('promo bar should display the TESTME coupon code', async ({ page }) => {
    await expect(page.locator('[data-testid="promo-banner"]')).toContainText('TESTME');
  });

  test('clicking the X button should hide the promo bar', async ({ page }) => {
    await page.locator('[data-testid="promo-banner"] .promo-close').click();
    await expect(page.locator('[data-testid="promo-banner"]')).toBeHidden();
  });

  test('countdown timer should be visible inside the promo bar', async ({ page }) => {
    await expect(page.locator('#promo-countdown')).toBeVisible();
  });

  test('countdown timer text should change after one second', async ({ page }) => {
    const t1 = await page.locator('#promo-countdown').textContent();
    await page.waitForTimeout(1100);
    const t2 = await page.locator('#promo-countdown').textContent();
    expect(t1).not.toEqual(t2);
  });

});

test.describe('Featured Banner', () => {

  test('featured banner should be visible on page load', async ({ page }) => {
    await expect(page.locator('[data-testid="featured-banner"]')).toBeVisible(); // ←  BROKEN (typo: featred)
  });

  test('featured banner should mention the Flash Sale', async ({ page }) => {
    await expect(page.locator('[data-testid="featured-banner"]')).toContainText('Flash Sale'); // ←  BROKEN
  });

  test('Dismiss button should remove the featured banner', async ({ page }) => {
    await page.locator('[data-testid="featured-banner"] .btn-secondary', { hasText: 'Dismiss' }).click(); // ←  BROKEN (transposed)
    await expect(page.locator('[data-testid="featured-banner"]')).toBeHidden();                               // ←  BROKEN (transposed)
  });

  test('Shop Sale button should activate the On Sale tab', async ({ page }) => {
    await page.locator('[data-testid="featured-banner"] .btn-primary', { hasText: 'Shop Sale' }).click(); // ←  BROKEN (transposed)
    await expect(page.locator('[data-testid="tab-on-sael"]')).toHaveClass(/active/); // ←  BROKEN (transposed)
  });

  test('featured banner should reference the FLASH30 promo code', async ({ page }) => {
    await expect(page.locator('[data-testid="featured-banner"]')).toContainText('FLASH30');
  });

});
