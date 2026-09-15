import { expect, Page } from '@playwright/test';
import fs from 'fs';

export async function uploadCollection(page: Page, filename: string) {
  await page.getByTestId('collection-file-input').setInputFiles(`assets/${filename}`);
  await page.getByTestId('upload-collection-button').click();
  await page.waitForSelector('[data-testid="collection-file-name"]');
}

export async function openCommanderPage(page: Page, commanderName: string) {
  await page.goto('/');
  await page.getByTestId('exclude-partners-checkbox').uncheck();
  await page.getByTestId('only-owned-checkbox').uncheck();
  await page.getByTestId('sample-collection-button').click();

  // wait for confirmation the collection actually finished loading before searching
  // (this hits the same cold-starting backend, so allow extra time on CI)
  await expect(page.getByTestId('collection-hint-message')).toBeVisible({ timeout: 45_000 });

  const searchBar = page.getByTestId('commander-search-input');
  await searchBar.fill(commanderName);
  await page.getByTestId('search-commanders-button').click();

  // The search hits a live backend that can cold-start on CI, so give the result
  // time to actually appear before attempting to click it.
  const resultItems = page.locator(`[data-testid="commander-result-${commanderName}"]`);
  await expect(resultItems).toBeVisible({ timeout: 45_000 });
  await resultItems.click();
}

export async function apiUploadCollection(request: any, filename: string) {
  const response = await request.post('/api/collection/upload', {
    multipart: {
      file: {
        name: filename,
        mimeType: 'text/csv',
        buffer: fs.readFileSync(`assets/${filename}`),
      },
    },
  });
  return response;
}

export async function apiClearCollection(request: any) {
  const response = await request.post('/api/collection/clear');
  return response;
}