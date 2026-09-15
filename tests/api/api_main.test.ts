import { test, expect } from '@playwright/test';
import { apiUploadCollection } from '../helpers/upload';

test.describe('collection upload', () => {
  test('upload with valid file returns 200', async ({ request }) => {
    const response = await apiUploadCollection(request, 'moxfield_sample.csv');
    expect(response.status()).toBe(200);
  });

  test('upload with invalid file returns 400', async ({ request }) => {
    const response = await apiUploadCollection(request, 'invalid_file.txt');
    expect(response.status()).toBe(400);
  });

  test('upload with empty file returns 400', async ({ request }) => { 
    const response = await apiUploadCollection(request, 'empty.txt');
    expect(response.status()).toBe(400);
  });
});

test.describe('search', () => {
  test('search without upload returns 400', async ({ request }) => {
    const response = await request.get('/api/search');
    expect(response.status()).toBe(400);
  });

  test('search with valid upload returns 200', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get('/api/search');
    expect(response.status()).toBe(200);
  });

  test('search specific commander returns only that commander', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get('/api/search', {
    params: {
      name: 'The Gitrog, Ravenous Ride',
    }});
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.results[0].commander_name).toBe('The Gitrog, Ravenous Ride');
  });

  test('test face commander filter false', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get('/api/search', {
    params: {
      exclude_face: 'false',
    }});
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.results[0].commander_name).toBe("Temmet, Naktamun's Will");
  });

  test('test face commander filter true', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get('/api/search', {
    params: {
      exclude_face: 'true',
    }});
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.results[0].commander_name).not.toBe("Temmet, Naktamun's Will");
  });

  test('test exclude partners false only owned false', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');
    const response = await request.get('/api/search', {
    params: {
      exclude_face: 'true',
      exclude_partners: 'false',
      only_owned: 'false',
    }});
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.results[1].commander_name).toBe("Alena, Kessig Trapper // Kydele, Chosen of Kruphix");
  });
});