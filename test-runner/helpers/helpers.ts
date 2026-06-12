// helpers/helpers.ts
import { Page } from '@playwright/test';
import { PAGE_URL } from './config.js';

export const BASE_URL: string = PAGE_URL;

/**
 * Waits until the product grid is fully rendered.
 * Call this in every beforeEach after page.goto(BASE_URL).
 */
export async function waitForProducts(page: Page): Promise<void> {
  await page.locator('#product-grid').waitFor({ state: 'attached', timeout: 15_000 });
  await page.locator('[data-testid^="product-card-"]').first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForFunction(
    (): boolean => {
      const el = document.getElementById('count-shown');
      return !!el && parseInt(el.textContent ?? '0', 10) > 0;
    },
    { timeout: 15_000 }
  );
}
