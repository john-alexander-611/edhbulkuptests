import { test, expect } from '@playwright/test';

test.describe('home page initial state', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title to contain "EDH Bulk Up"
    await expect(page).toHaveTitle(/EDH Bulk Up/);
  });


  test('upload collection disabled', async ({page}) => {
    await page.goto('/');

    // Expect the upload collection button to be disabled initially
    await expect(page.getByTestId('upload-collection-button')).toBeDisabled();

  });

  test('try sample collection enabled', async ({page}) => {
    await page.goto('/');

    // Expect the try sample collection button to be enabled initially
    await expect(page.getByTestId('sample-collection-button')).toBeEnabled();

  });

  test('0 results loaded', async ({page}) => {
    await page.goto('/');

    // Expect the results count to be 0 initially
    await expect(page.getByTestId('results-count')).toHaveText('0 results');

  });
});
