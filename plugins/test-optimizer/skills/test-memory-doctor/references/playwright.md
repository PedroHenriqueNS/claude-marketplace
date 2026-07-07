# Playwright memory fixes

Playwright's memory usage is a different category of problem from Jest/Vitest: the RAM is going into real browser processes (Chromium/Firefox/WebKit), not into Node's module graph. Node-side fixes (worker recycling, coverage providers, etc.) don't apply here.

## Root causes

1. **Too many parallel workers**, each launching its own full browser instance. This is the dominant cost by far.
2. **Trace/video retention for passing tests.** Keeping full traces or videos for every test (not just failures) multiplies disk and memory usage per worker.
3. **Browser contexts not closed between tests** if using manual `browser.newContext()` outside the standard fixture pattern.

## Fixes

Update `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? 2 : undefined, // cap parallel browser instances; undefined = Playwright's default (usually cores/2)
  use: {
    trace: 'retain-on-failure',  // don't keep traces for passing tests
    video: 'retain-on-failure',
  },
});
```

If tests manually manage `browser.newContext()`, make sure each is closed:

```ts
const context = await browser.newContext();
// ... test ...
await context.close();
```

Prefer the built-in `test`/`page` fixtures over manual context management where possible — Playwright closes fixture-managed contexts automatically.

## Verification

Playwright doesn't have a `--logHeapUsage` equivalent since the cost is external processes, not the Node heap. Measure peak RSS instead:

```bash
# Linux
/usr/bin/time -v npx playwright test

# macOS
/usr/bin/time -l npx playwright test
```

Or watch Activity Monitor / Task Manager for the number and size of browser subprocesses during a run. The main lever is `workers` — lowering it is the highest-leverage change.
