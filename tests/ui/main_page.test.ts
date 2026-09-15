import { test, expect } from '@playwright/test';
import { uploadCollection } from '../helpers/upload';

const testFiles = [
  'moxfield_sample.csv', 'archidekt_sample.csv',
  'sample_collection.txt',
];

test.describe('collection upload', () => {
  for (const file of testFiles) {
    test(`upload ${file}`, async ({ page }) => {
      await page.goto('/');
      await uploadCollection(page, file);

      // Expect the collection file name to be displayed correctly
      await expect(page.getByTestId('collection-file-name')).toHaveText(`Current File: ${file}`);
    });
  }

  for (const file of testFiles) {
    test(`results load with file: ${file}`, async ({ page }) => {
      await page.goto('/');

      // Ensure the "only owned" checkbox is unchecked before uploading the file, because some files have no commanders in them
      await page.getByTestId('only-owned-checkbox').uncheck();
      await uploadCollection(page, file);

      const resultItems = page.locator('a[data-testid^="commander-result-"]');
      // Expect at least one commander result to be displayed
      await expect(resultItems).not.toHaveCount(0);
    });
  }

  test('upload empty file', async ({ page }) => {
    await page.goto('/');

    await uploadCollection(page, 'empty.txt');
    // Expect an error message indicating the file is empty
    await expect(page.getByTestId('collection-hint-message')).toHaveText(`'empty.txt' is empty. Upload a non-empty CSV or TXT file.`);
  });
});

test('test search bar', async ({ page }) => {
  await page.goto('/');

  await uploadCollection(page, 'moxfield_sample.csv');

  const searchBar = page.getByTestId('commander-search-input');
  await searchBar.fill('The Gitrog, Ravenous Ride');
  await page.getByTestId('search-commanders-button').click();

  const searchResults = page.locator('[data-testid="commander-result-The Gitrog, Ravenous Ride"]');
  // Expect exactly one search result to be displayed
  await expect(searchResults).toHaveCount(1);
});

test('test sample button', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('sample-collection-button').click();

  const resultItems = page.locator('[data-testid="commander-result-Honest Rutstein"]');
  // Expect the expected commander result to be displayed
  await expect(resultItems).toHaveCount(1);
});

test('exact color identity W', async ({ page }) => {
  await page.goto('/');
  // Ensure the "exact color identity" filter is set to W
  await page.getByTestId('color-group-identity-W').check();
  await uploadCollection(page, 'moxfield_sample.csv');

  const resultItems = page.locator('[data-testid="commander-result-Zetalpa, Primal Dawn"]');
  // Expect the expected commander result with exact color identity W to be displayed
  await expect(resultItems).toHaveCount(1);
});


test('exact color identity C', async ({ page }) => {
  await page.goto('/');
  
  await page.getByTestId('color-group-identity-W').check();
  // when you click 'C', it should unselect all other color identity filters
  await page.getByTestId('color-group-identity-C').check();
  await uploadCollection(page, 'moxfield_sample.csv');

  const resultItems = page.locator('[data-testid="commander-result-Kozilek, Butcher of Truth"]');
  // Expect the expected commander result with exact color identity C to be displayed
  await expect(resultItems).toHaveCount(1);
});

test('exact color identity UB', async ({ page }) => {
  await page.goto('/');
  
  await page.getByTestId('color-group-identity-U').check();
  await page.getByTestId('color-group-identity-B').check();
  await uploadCollection(page, 'moxfield_sample.csv');

  const resultItems = page.locator('[data-testid="commander-result-Sephiroth, Planet\'s Heir"]');
  // Expect the expected commander result with exact color identity UB to be displayed
  await expect(resultItems).toHaveCount(1);
});

test('exact color identity RG', async ({ page }) => {
  await page.goto('/');
  
  await page.getByTestId('color-group-identity-R').check();
  await page.getByTestId('color-group-identity-G').check();
  await uploadCollection(page, 'moxfield_sample.csv');

  const resultItems = page.locator('[data-testid="commander-result-Roxanne, Starfall Savant"]');
  // Expect the expected commander result with exact color identity RG to be displayed
  await expect(resultItems).toHaveCount(1);
});

test('contains color W', async ({ page }) => {
  await page.goto('/');
  
  await page.getByTestId('color-group-contains-W').check();
  await uploadCollection(page, 'moxfield_sample.csv');

  const resultItems = page.locator('[data-testid="commander-result-Varina, Lich Queen"]');
  // Expect the expected commander result that contains color W to be displayed
  await expect(resultItems).toHaveCount(1);
});

test('contains color W not U', async ({ page }) => {
  await page.goto('/');
  
  await page.getByTestId('color-group-contains-W').check();
  await page.getByTestId('color-group-contains-U').check();
  await uploadCollection(page, 'moxfield_sample.csv');

  const resultItems = page.locator('[data-testid="commander-result-Varina, Lich Queen"]');
  // Varina should not be displayed because it contains color U
  await expect(resultItems).toHaveCount(0);
});

test('include face commanders', async ({ page }) => {
  await page.goto('/');
  
  await page.getByTestId('exclude-face-checkbox').uncheck();
  await uploadCollection(page, 'moxfield_sample.csv');

  const resultItems = page.locator('[data-testid="commander-result-Dina, Essence Brewer"]');
  // Dina should be displayed because face commanders are included
  await expect(resultItems).toHaveCount(1);
});

test('include partner commanders and unowned commanders', async ({ page }) => {
  await page.goto('/');
  
  await page.getByTestId('exclude-partners-checkbox').uncheck();
  await page.getByTestId('only-owned-checkbox').uncheck();
  await uploadCollection(page, 'moxfield_sample.csv');

  const resultItems = page.locator('[data-testid="commander-result-Alena, Kessig Trapper // Kydele, Chosen of Kruphix"]');
  // Alena and Kydele should be displayed because partner and unowned commanders are included
  await expect(resultItems).toHaveCount(1);
});
