import { test as base, expect } from '@playwright/test';
import { Eyes, Target, BatchInfo } from '@applitools/eyes-playwright';
import { BASE_URL, waitForProducts } from './helpers.js';

const batch = new BatchInfo('Arcane Shop - Visual Comparison');

interface VisualFixture {
  check: (name: string, target?: any) => Promise<void>;
}

export const test = base.extend<{ visual: VisualFixture }>({
  visual: async ({ page }, use, testInfo) => {
    const eyes = new Eyes();
    eyes.setBatch(batch);
    eyes.setApiKey(process.env.APPLITOOLS_API_KEY || '');
    await eyes.open(page, 'Arcane Shop', testInfo.title);
    await use({
      check: async (name: string, target?: any) => {
        await eyes.check(name, target ?? Target.window());
      },
    });
    await eyes.close();
  },
});

export { expect, BASE_URL, waitForProducts };
