import { test, expect } from '@playwright/test';
import { BASE_URL, waitForProducts } from '../helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await waitForProducts(page);
});

test.describe('Product Modal', () => {

  test('clicking a product name should open the modal overlay', async ({ page }) => {
    await page.getByTestId('product-card-1').locator('.product-name').click();
    await expect(page.getByTestId('product-modal-overlay')).toHaveClass(/open/);
  });

  test('modal should display the correct product name for card 1', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await expect(page.getByTestId('modal-title')).toHaveText('Apex Pro Mechanical Keyboard');
  });

  test('modal should display the correct category for card 1', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await expect(page.getByTestId('modal-category')).toHaveText('Tech & Gadgets');
  });

  test('modal should display the current sale price for card 1', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await expect(page.getByTestId('modal-price')).toContainText('$149.99');
  });

  test('modal should display the original price when product is on sale', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await expect(page.getByTestId('modal-price')).toContainText('$199.99');
  });

  test('Description tab content should be visible by default', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await expect(page.getByTestId('modal-desc')).toContainText('mechanical keyboard');
  });

  test('clicking Specs tab should reveal the specs table', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByRole('button', { name: 'Specs' }).click();
    await expect(page.getByTestId('modal-specs-table')).toContainText('Cherry MX Brown');
  });

  test('clicking Reviews tab should reveal reviewer names', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByRole('button', { name: 'Reviews' }).click();
    await expect(page.getByTestId('modal-reviews-list')).toContainText('Alex M.');
  });

  test('modal quantity should start at 1', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await expect(page.getByTestId('modal-qty-value')).toHaveText('1');
  });

  test('clicking + should increase modal quantity to 2', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByTestId('modal-qty-plus').click();
    await expect(page.getByTestId('modal-qty-value')).toHaveText('2');
  });

  test('clicking − when quantity is 1 should not drop below 1', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByTestId('modal-qty-minus').click();
    await expect(page.getByTestId('modal-qty-value')).toHaveText('1');
  });

  test('apparel product should show the size picker', async ({ page }) => {
    await page.getByTestId('product-card-6').click();
    await expect(page.getByTestId('modal-size-picker')).toBeVisible();
  });

  test('non-apparel product should hide the size picker', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await expect(page.getByTestId('modal-size-picker')).toBeHidden();
  });

  test('clicking the X close button should close the modal', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('product-modal-overlay')).not.toHaveClass(/open/);
  });

  test('pressing Escape should close the modal', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('product-modal-overlay')).not.toHaveClass(/open/);
  });

  test('Add to Wishlist from modal should increment the wishlist badge', async ({ page }) => {
    await page.getByTestId('product-card-2').click();
    await page.getByTestId('product-modal').getByRole('button', { name: 'Add to Wishlist' }).click();
    await expect(page.getByTestId('wishlist-count')).toHaveText('1');
  });

  test('recently-viewed section should be hidden before any modal is opened', async ({ page }) => {
    await expect(page.getByTestId('recently-viewed-section')).toBeHidden();
  });

  test('opening and closing a modal should add the product to recently viewed', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('rv-grid')).toContainText('Apex Pro Mechanical Keyboard');
  });

  test('recently viewed grid should cap at 6 items', async ({ page }) => {
    for (let i = 1; i <= 7; i++) {
      await page.getByTestId(`product-card-${i}`).click();
      await page.getByTestId('modal-close').click();
    }
    await expect(page.getByTestId('rv-grid').locator('.rv-card')).toHaveCount(6);
  });

  test('modal Add to Cart button should update the cart badge', async ({ page }) => {
    await page.getByTestId('product-card-1').click();
    await page.getByTestId('product-modal').getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByTestId('cart-item-count')).not.toHaveText('0');
  });

});
