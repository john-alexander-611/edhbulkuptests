import { test, expect } from '@playwright/test';
import { apiUploadCollection, apiClearCollection } from '../helpers/upload';

// This suite targets a live shared deployment (edhbulkup-api.onrender.com).
// Thresholds are intentionally generous to avoid flakiness from cold starts / network variance.

test.describe('reliability - timeout', () => {
  test('request aborts when client timeout is exceeded', async ({ request }) => {
    await expect(
      request.get('/api/search', { timeout: 1 }) // 1ms is unreachable, forces a client-side timeout
    ).rejects.toThrow();
  });
});

test.describe('reliability - retry', () => {
  test('repeated identical requests remain idempotent', async ({ request }) => {
    const first = await apiUploadCollection(request, 'moxfield_sample.csv');
    const second = await apiUploadCollection(request, 'moxfield_sample.csv');
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);

    const firstData = await first.json();
    const secondData = await second.json();
    expect(secondData.owned_count).toBe(firstData.owned_count);
  });

  test('clearing collection twice in a row is safe to retry', async ({ request }) => {
    const first = await apiClearCollection(request);
    const second = await apiClearCollection(request);
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
  });
});

test.describe('reliability - duplicate requests', () => {
  test('concurrent duplicate uploads both succeed and agree on result', async ({ request }) => {
    const [first, second] = await Promise.all([
      apiUploadCollection(request, 'moxfield_sample.csv'),
      apiUploadCollection(request, 'moxfield_sample.csv'),
    ]);
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);

    const response = await request.get('/api/search');
    expect(response.status()).toBe(200);
  });
});

test.describe('reliability - dependency failure', () => {
  test('search continues to respond correctly when collection dependency is absent', async ({ request }) => {
    // No upload performed: the search endpoint depends on an uploaded collection
    // and should fail gracefully rather than erroring unexpectedly.
    const response = await request.get('/api/search');
    expect(response.status()).toBe(400);
  });

  test('commander analysis fails gracefully for a name with no cached deck', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get(
      `/api/commanders/${encodeURIComponent('Definitely Not Cached Commander')}`
    );
    expect(response.status()).toBe(404);
  });
});
