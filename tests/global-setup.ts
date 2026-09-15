import { request } from '@playwright/test';

// The UI and API projects both hit a live, shared Render.com deployment which
// spins down after inactivity. On CI the instance is almost always cold, causing
// the first real requests (sample collection load, commander search, etc.) to
// take far longer than the default action/expect timeouts. Warming both hosts up
// here, before any test runs, avoids that cold-start penalty being attributed to
// the first tests that happen to run.
async function warmUp(baseURL: string, path: string) {
  const context = await request.newContext({ baseURL });
  try {
    // Render free-tier cold starts can take upwards of a minute; retry until it responds.
    await context.get(path, { timeout: 90_000 });
  } catch {
    // If warm-up fails, let the actual tests surface the failure with their own timeouts.
  } finally {
    await context.dispose();
  }
}

export default async function globalSetup() {
  await Promise.all([
    warmUp('https://www.edhbulkup.com/', '/'),
    warmUp('https://edhbulkup-api.onrender.com', '/health'),
  ]);
}
