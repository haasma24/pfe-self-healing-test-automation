import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Hero Section', () => {

  test('hero section visual appearance', async ({ page, visual }) => {
    await visual.check('Hero section full', Target.region(page.getByTestId('hero-section')));
  });

  test('shop layout should scroll into view visually', async ({ page, visual }) => {
    await page.getByTestId('hero-section').getByRole('button', { name: 'Shop Now' }).click();
    await visual.check('Shop layout after scroll', Target.region(page.getByTestId('shop-layout')));
  });

  test('new arrivals tab visual state after hero button click', async ({ page, visual }) => {
    await page.getByTestId('hero-section').getByRole('button', { name: 'New Arrivals' }).click();
    await visual.check('New Arrivals tab active', Target.region(page.getByTestId('tab-new-arrivals')));
  });

  test('lookbook button triggers toast visual', async ({ page, visual }) => {
    await page.getByTestId('hero-section').getByRole('button', { name: 'Lookbook' }).click();
    await visual.check('Lookbook toast', Target.region(page.getByTestId('toast-notification')));
  });

  test('hero stats section visual appearance', async ({ page, visual }) => {
    await visual.check('Hero stats group', Target.region(page.getByTestId('hero-section').locator('.hero-stats')));
  });

});

test.describe('Promo Bar', () => {

  test('promo bar visual appearance with coupon code', async ({ page, visual }) => {
    await visual.check('Promo bar with coupon', Target.region(page.getByTestId('promo-banner')));
  });

  test('promo bar hidden state after close click', async ({ page, visual }) => {
    await page.getByTestId('promo-banner').locator('.promo-close').click();
    await visual.check('Promo bar hidden state', Target.region(page.getByTestId('promo-banner')));
  });

});

test.describe('Featured Banner', () => {

  test('featured banner visual appearance', async ({ page, visual }) => {
    await visual.check('Featured banner', Target.region(page.getByTestId('featured-banner')));
  });

  test('dismissed featured banner visual state', async ({ page, visual }) => {
    await page.getByTestId('featured-banner').getByRole('button', { name: 'Dismiss' }).click();
    await visual.check('Featured banner dismissed', Target.region(page.getByTestId('featured-banner')));
  });

  test('on sale tab after shop sale button click', async ({ page, visual }) => {
    await page.getByTestId('featured-banner').getByRole('button', { name: 'Shop Sale' }).click();
    await visual.check('On Sale tab active', Target.region(page.getByTestId('tab-on-sale')));
  });

});
