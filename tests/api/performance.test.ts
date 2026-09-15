import { test, expect } from '@playwright/test';
import { apiUploadCollection } from '../helpers/upload';

// This suite targets a live shared deployment (edhbulkup-api.onrender.com).
// Thresholds are intentionally generous to avoid flakiness from cold starts / network variance,
// and concurrency is kept low to avoid putting undue load on shared infrastructure.

test.describe('performance - latency', () => {
  test('health check responds within an acceptable time budget', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/health');
    const elapsed = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(elapsed).toBeLessThan(5000);
  });
});

test.describe('performance - concurrency', () => {
  test('multiple concurrent search requests all succeed', async ({ request }) => {
    await apiUploadCollection(request, 'moxfield_sample.csv');

    const requests = Array.from({ length: 5 }, () => request.get('/api/search'));
    const responses = await Promise.all(requests);

    for (const response of responses) {
      expect(response.status()).toBe(200);
    }
  });
});

test.describe('performance - throughput', () => {
  test('a small burst of sequential requests completes within a reasonable window', async ({ request }) => {
    const requestCount = 5;
    const start = Date.now();

    for (let i = 0; i < requestCount; i++) {
      const response = await request.get('/health');
      expect(response.status()).toBe(200);
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(15000);
  });
});
