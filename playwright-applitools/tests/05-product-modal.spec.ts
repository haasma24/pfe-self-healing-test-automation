import { test, expect, BASE_URL, waitForProducts } from '../fixtures.js';
import { Target } from '@applitools/eyes-playwright';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Product Modal', () => {

  test('product modal open visual state', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').locator('.product-name').click();
    await visual.check('Product modal overlay open', Target.region(page.getByTestId('product-modal-overlay')));
  });

  test('product modal details section visual', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').click();
    await visual.check('Modal product details', Target.region(page.getByTestId('product-modal')));
  });

  test('modal description tab visual default state', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').click();
    await visual.check('Modal description tab', Target.region(page.getByTestId('modal-desc')));
  });

  test('modal specs tab visual state', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByRole('button', { name: 'Specs' }).click();
    await visual.check('Modal specs tab content', Target.region(page.getByTestId('modal-specs-table')));
  });

  test('modal reviews tab visual state', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByRole('button', { name: 'Reviews' }).click();
    await visual.check('Modal reviews tab content', Target.region(page.getByTestId('modal-reviews-list')));
  });

  test('modal quantity controls visual', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByTestId('modal-qty-plus').click();
    await visual.check('Modal quantity at 2', Target.region(page.getByTestId('modal-qty-value').locator('..')));
  });

  test('apparel product modal with size picker', async ({ page, visual }) => {
    await page.getByTestId('product-card-6').click();
    await visual.check('Apparel modal size picker', Target.region(page.getByTestId('modal-size-picker')));
  });

  test('modal closed state after close button', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByTestId('modal-close').click();
    await visual.check('Modal closed, product grid visible', Target.region(page.getByTestId('product-grid')));
  });

  test('recently viewed section visual after closing modal', async ({ page, visual }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByTestId('modal-close').click();
    await visual.check('Recently viewed section', Target.region(page.getByTestId('rv-grid')));
  });

});
