# edhbulkuptests
playwright tests for www.edhbulkup.com

## Test files

### UI (`tests/ui`, runs against `https://www.edhbulkup.com/`)

- **[ui_check.test.ts](tests/ui/ui_check.test.ts)** — Baseline sanity checks for the home page: page title, initial disabled/enabled state of the upload and sample-collection buttons, and the initial "0 results" count.
- **[main_page.test.ts](tests/ui/main_page.test.ts)** — Collection upload flows on the home page: uploading each sample file (Moxfield CSV, Archidekt CSV, plaintext) shows the correct file name and produces commander results, plus the error message shown when uploading an empty file.
- **[commander_page.test.ts](tests/ui/commander_page.test.ts)** — Commander detail page behavior after selecting a commander from search results, including decklist rendering and verifying decklist card-count totals for both single and partner commanders.

### API (`tests/api`, runs against `https://edhbulkup-api.onrender.com`)

- **[api_main.test.ts](tests/api/api_main.test.ts)** — Core happy-path/negative coverage for `/api/search` and `/api/collection/upload`: missing-collection 400s, valid/invalid/empty file uploads, name-based search, and filter behavior (`exclude_face`, `exclude_partners`, `only_owned`).
- **[negative.test.ts](tests/api/negative.test.ts)** — Negative-path coverage: missing required fields, invalid parameter types, malformed request bodies, requests missing prerequisite state (e.g. commander analysis without an uploaded collection), and boundary values for `limit`/`offset`.
- **[reliability.test.ts](tests/api/reliability.test.ts)** — Reliability coverage: client-side timeout handling, idempotency of retried/duplicate requests (repeated uploads, repeated clears, concurrent uploads), and graceful failure when a dependency (uploaded collection or cached deck) is missing.
- **[data.test.ts](tests/api/data.test.ts)** — Data-integrity coverage: collection state persisting across requests in a session, a new upload replacing a previously persisted collection, consistent results across repeated identical searches, and cleanup via `/api/collection/clear`.
- **[performance.test.ts](tests/api/performance.test.ts)** — Lightweight performance checks against the live deployment: single-request latency budget, a small batch of concurrent search requests, and throughput of a short burst of sequential requests. Thresholds are intentionally generous to avoid flakiness from cold starts on shared infrastructure.

### Helpers

- **[upload.ts](tests/helpers/upload.ts)** — Shared helpers used by both UI and API tests: `uploadCollection`/`openCommanderPage` drive the browser UI, while `apiUploadCollection`/`apiClearCollection` call the API directly via Playwright's `request` fixture.

