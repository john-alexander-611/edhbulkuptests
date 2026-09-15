import { test, expect } from '@playwright/test';
import { openCommanderPage } from '../helpers/upload';

test.describe('commander page', () => {
test('commander page loads', async ({ page }) => {
    await openCommanderPage(page, 'The Gitrog, Ravenous Ride');
    // Expect the commander page to load by checking for the presence of the commander's name
    await expect(page.getByTestId('commander-name')).toHaveText('The Gitrog, Ravenous Ride');


});

test('non partner decklist totals 99 cards', async ({ page }) => {
  await openCommanderPage(page, 'The Gitrog, Ravenous Ride');

  // wait for at least one group title to actually render first
  await expect(page.locator('[data-testid^="decklist-group-title-"]').first()).toBeVisible();

  // grab all of the titles in the decklist 
  const groupTitles = page.locator('[data-testid^="decklist-group-title-"]');
  const groupCount = await groupTitles.count();

  let total = 0;
  for (let i = 0; i < groupCount; i++) {
    // get the text content of the current group title
    const titleText = await groupTitles.nth(i).textContent();
    // in the current title grab the number in parentheses and covert it to integer
    const count = parseInt(titleText?.match(/\((\d+)\)/)?.[1] ?? '0', 10);
    total += count;
  }

  console.log('Total cards counted:', total);
  expect(total).toBe(99);
});

test('partner decklist totals 98 cards', async ({ page }) => {
  await openCommanderPage(page, 'Alena, Kessig Trapper // Kydele, Chosen of Kruphix');

  // wait for at least one group title to actually render first
  await expect(page.locator('[data-testid^="decklist-group-title-"]').first()).toBeVisible();

  // grab all of the titles in the decklist 
  const groupTitles = page.locator('[data-testid^="decklist-group-title-"]');
  const groupCount = await groupTitles.count();

  let total = 0;
  for (let i = 0; i < groupCount; i++) {
    // get the text content of the current group title
    const titleText = await groupTitles.nth(i).textContent();
    // in the current title grab the number in parentheses and covert it to integer
    const count = parseInt(titleText?.match(/\((\d+)\)/)?.[1] ?? '0', 10);
    total += count;
  }

  console.log('Total cards counted:', total);
  expect(total).toBe(98);
});

test('missing cards list loads', async ({ page }) => {
  await openCommanderPage(page, 'The Gitrog, Ravenous Ride');

  const cards = page.locator('[data-testid^="missing-card-item-"]');
  await expect(cards).not.toHaveCount(0);
});

test('budget filter reduces suggestion counts per category', async ({ page }) => {
    // this test could fail if the replacement suggestions are all under $1, but it is unlikely
  await openCommanderPage(page, 'The Gitrog, Ravenous Ride');

  // Discover which category groups are actually present
  const groupTitles = page.locator('[data-testid^="replacement-group-title-"]');
  await expect(groupTitles.first()).toBeVisible();

  const groupCount = await groupTitles.count();
  const categories: string[] = [];

  for (let i = 0; i < groupCount; i++) {
    const testId = await groupTitles.nth(i).getAttribute('data-testid');
    const category = testId?.replace('replacement-group-title-', '');
    if (category) categories.push(category);
  }

  // Expand "More suggestions" and capture baseline counts in one pass
  const baselineCounts: Record<string, number> = {};
  for (const category of categories) {
    const moreButton = page.getByTestId(`more-suggestions-button-${category}`);
    if (await moreButton.isVisible()) {
      await moreButton.click();
    }

    const list = page.locator(`[data-testid="replacement-suggestions-list-${category}"] li`);
    baselineCounts[category] = await list.count();
  }

  // Apply the $1 budget filter
  await page.getByTestId('budget-radio-one').check();

  // For each category, wait for the count to actually decrease, then log it
  for (const category of categories) {
    const list = page.locator(`[data-testid="replacement-suggestions-list-${category}"] li`);

    await expect.poll(async () => await list.count(), {
      message: `waiting for ${category} suggestion count to decrease after budget filter`,
    }).toBeLessThan(baselineCounts[category]);

    const filteredCount = await list.count();
    console.log(`${category}: ${baselineCounts[category]} -> ${filteredCount}`);
  }
});

test('buy all on TCGplayer link points to a valid TCGplayer affiliate URL', async ({ page }) => {
  await openCommanderPage(page, 'The Gitrog, Ravenous Ride');

  const buyButton = page.getByTestId('buy-all-tcgplayer-button');

  await expect(buyButton).toHaveAttribute('href', /tcgplayer\.com/);
  await expect(buyButton).toHaveAttribute('target', '_blank');
});
});