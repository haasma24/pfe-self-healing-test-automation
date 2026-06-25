import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Page Structure & Initial Render', () => {

  test('full page initial render should match visual baseline', async ({ page, visual }) => {
    await visual.check('Full page initial load', Target.window().fully());
  });

  test('promo bar region should be visually correct', async ({ page, visual }) => {
    await visual.check('Promo bar', Target.region(page.getByTestId('promo-banner')));
  });

  test('navigation bar region should be visually correct', async ({ page, visual }) => {
    await visual.check('Navigation bar', Target.region(page.getByTestId('nav-home').locator('..')));
  });

  test('hero section region should be visually correct', async ({ page, visual }) => {
    await visual.check('Hero section', Target.region(page.getByTestId('hero-section')));
  });

  test('product grid should display 24 cards visually', async ({ page, visual }) => {
    await visual.check('Product grid', Target.region(page.getByTestId('product-grid')));
  });

  test('filter sidebar region should be visually correct', async ({ page, visual }) => {
    await visual.check('Filter sidebar', Target.region(page.getByTestId('filter-sidebar')));
  });

  test('footer region should be visually correct', async ({ page, visual }) => {
    await visual.check('Footer', Target.region(page.getByTestId('footer')));
  });

  test('promo countdown timer visual appearance', async ({ page, visual }) => {
    await visual.check('Countdown timer', Target.region(page.getByTestId('promo-countdown')));
  });

});
