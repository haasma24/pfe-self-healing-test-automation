import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Hero Section', () => {

  test('hero section should be visible', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });

  test('Shop Now button should scroll the shop layout into view', async ({ page }) => {
    await page.getByTestId('hero-section').getByRole('button', { name: 'Shop Now' }).click();
    await expect(page.getByTestId('shop-layout')).toBeInViewport();
  });

  test('New Arrivals button in hero should activate the New Arrivals tab', async ({ page }) => {
    await page.getByTestId('hero-section').getByRole('button', { name: 'New Arrivals' }).click();
    await expect(page.getByTestId('tab-new-arrivals')).toHaveClass(/active/);
  });

  test('View Lookbook button should display a coming-soon toast', async ({ page }) => {
    await page.getByTestId('hero-section').getByRole('button', { name: 'Lookbook' }).click();
    await expect(page.getByTestId('toast-notification')).toContainText('coming soon');
  });

  test('hero stats should show 40K+ customers', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toContainText('40K+');
  });

  test('hero stats should show 24 curated products', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toContainText('24');
  });

  test('hero stats should show 4.8★ average rating', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toContainText('4.8★');
  });

  test('hero stats should show Free returns label', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toContainText('Free');
  });

  test('hero heading should contain "Exceptional Minds"', async ({ page }) => {
    await expect(page.getByTestId('hero-title')).toContainText('Exceptional Minds');
  });

});

test.describe('Promo Bar', () => {

  test('promo bar should be visible and display FREE SHIPPING message', async ({ page }) => {
    await expect(page.getByTestId('promo-banner')).toBeVisible();
    await expect(page.getByTestId('promo-banner')).toContainText('FREE SHIPPING');
  });

  test('promo bar should display the TESTME coupon code', async ({ page }) => {
    await expect(page.getByTestId('promo-banner')).toContainText('TESTME');
  });

  test('clicking the X button should hide the promo bar', async ({ page }) => {
    await page.getByTestId('promo-banner').locator('.promo-close').click();
    await expect(page.getByTestId('promo-banner')).toBeHidden();
  });

  test('countdown timer should be visible inside the promo bar', async ({ page }) => {
    await expect(page.getByTestId('promo-countdown')).toBeVisible();
  });

  test('countdown timer text should change after one second', async ({ page }) => {
    const t1 = await page.getByTestId('promo-countdown').textContent();
    await page.waitForTimeout(1100);
    const t2 = await page.getByTestId('promo-countdown').textContent();
    expect(t1).not.toEqual(t2);
  });

});

test.describe('Featured Banner', () => {

  test('featured banner should be visible on page load', async ({ page }) => {
    await expect(page.getByTestId('featured-banner')).toBeVisible();
  });

  test('featured banner should mention the Flash Sale', async ({ page }) => {
    await expect(page.getByTestId('featured-banner')).toContainText('Flash Sale');
  });

  test('Dismiss button should remove the featured banner', async ({ page }) => {
    await page.getByTestId('featured-banner').getByRole('button', { name: 'Dismiss' }).click();
    await expect(page.getByTestId('featured-banner')).toBeHidden();
  });

  test('Shop Sale button should activate the On Sale tab', async ({ page }) => {
    await page.getByTestId('featured-banner').getByRole('button', { name: 'Shop Sale' }).click();
    await expect(page.getByTestId('tab-on-sale')).toHaveClass(/active/);
  });

  test('featured banner should reference the FLASH30 promo code', async ({ page }) => {
    await expect(page.getByTestId('featured-banner')).toContainText('FLASH30');
  });

});
