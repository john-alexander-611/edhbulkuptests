import { test, expect } from '@playwright/test';
import { apiUploadCollection } from '../helpers/upload';

test.describe('negative - missing fields', () => {
  test('upload with no file field returns 422', async ({ request }) => {
    const response = await request.post('/api/collection/upload');
    expect(response.status()).toBe(422);
  });
});

test.describe('negative - invalid types', () => {
  test('search with non-numeric limit returns 422', async ({ request }) => {
    const response = await request.get('/api/search', { params: { limit: 'abc' } });
    expect(response.status()).toBe(422);
  });

  test('search with non-numeric offset returns 422', async ({ request }) => {
    const response = await request.get('/api/search', { params: { offset: 'abc' } });
    expect(response.status()).toBe(422);
  });

  test('search with non-boolean exclude_face returns 422', async ({ request }) => {
    const response = await request.get('/api/search', { params: { exclude_face: 'notabool' } });
    expect(response.status()).toBe(422);
  });
});

test.describe('negative - malformed request body', () => {
  test('upload with raw JSON body instead of multipart returns 422', async ({ request }) => {
    const response = await request.post('/api/collection/upload', {
      headers: { 'Content-Type': 'application/json' },
      data: '{ this is not valid json',
    });
    expect(response.status()).toBe(422);
  });
});

test.describe('negative - unauthorized / missing prerequisite state', () => {
  test('commander analysis without upload returns 400', async ({ request }) => {
    const response = await request.get(
      `/api/commanders/${encodeURIComponent('The Gitrog, Ravenous Ride')}`
    );
    // deck exists in cache, but no collection has been uploaded in this fresh context
    expect(response.status()).toBe(400);
  });

  test('commander analysis for unknown commander returns 404', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get(
      `/api/commanders/${encodeURIComponent('Not A Real Commander Name 12345')}`
    );
    expect(response.status()).toBe(404);
  });
});

test.describe('negative - boundary values', () => {
  test('search with limit below minimum (0) returns 422', async ({ request }) => {
    const response = await request.get('/api/search', { params: { limit: '0' } });
    expect(response.status()).toBe(422);
  });

  test('search with limit above maximum (51) returns 422', async ({ request }) => {
    const response = await request.get('/api/search', { params: { limit: '51' } });
    expect(response.status()).toBe(422);
  });

  test('search with limit at minimum boundary (1) is accepted', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get('/api/search', { params: { limit: '1' } });
    expect(response.status()).toBe(200);
  });

  test('search with limit at maximum boundary (50) is accepted', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get('/api/search', { params: { limit: '50' } });
    expect(response.status()).toBe(200);
  });

  test('search with negative offset returns 422', async ({ request }) => {
    const response = await request.get('/api/search', { params: { offset: '-1' } });
    expect(response.status()).toBe(422);
  });

  test('search with offset at minimum boundary (0) is accepted', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get('/api/search', { params: { offset: '0' } });
    expect(response.status()).toBe(200);
  });
});
