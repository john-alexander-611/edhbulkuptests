import { test, expect } from '@playwright/test';
import { apiUploadCollection, apiClearCollection } from '../helpers/upload';

test.describe('data - state', () => {
  test('collection state persists across multiple requests in the same session', async ({ request }) => {
    const upload = await apiUploadCollection(request, 'moxfield_sample.csv');
    expect(upload.status()).toBe(200);
    const uploadData = await upload.json();

    const search = await request.get('/api/search');
    expect(search.status()).toBe(200);
    const searchData = await search.json();

    // every owned card counted by upload should still be reflected once searches run
    expect(uploadData.owned_count).toBeGreaterThan(0);
    expect(searchData.total).toBeGreaterThan(0);
  });
});

test.describe('data - persistence', () => {
  test('a newer upload replaces the previously persisted collection', async ({ request }) => {
    const firstUpload = await apiUploadCollection(request, 'moxfield_sample.csv');
    const firstData = await firstUpload.json();

    const secondUpload = await apiUploadCollection(request, 'sample_collection.txt');
    const secondData = await secondUpload.json();

    expect(firstUpload.status()).toBe(200);
    expect(secondUpload.status()).toBe(200);
    // the second upload's collection is what should now be persisted for the session
    console.log('First upload data:', firstData);
    console.log('Second upload data:', secondData);
    expect(secondData.owned_count).not.toEqual(firstData.owned_count);
  });
});

test.describe('data - consistency', () => {
  test('identical search requests return consistent results', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');

    const first = await request.get('/api/search', { params: { name: 'The Gitrog, Ravenous Ride' } });
    const second = await request.get('/api/search', { params: { name: 'The Gitrog, Ravenous Ride' } });

    const firstData = await first.json();
    const secondData = await second.json();
    expect(secondData.total).toBe(firstData.total);
    expect(secondData.results[0].commander_name).toBe(firstData.results[0].commander_name);
  });
});

test.describe('data - cleanup', () => {
  test('clearing the collection removes it for subsequent requests', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const beforeClear = await request.get('/api/search');
    expect(beforeClear.status()).toBe(200);

    const clear = await apiClearCollection(request);
    expect(clear.status()).toBe(200);

    const afterClear = await request.get('/api/search');
    expect(afterClear.status()).toBe(400);
  });
});
