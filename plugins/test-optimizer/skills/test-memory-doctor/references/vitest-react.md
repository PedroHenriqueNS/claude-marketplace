# Vitest + React memory fixes

## Root causes, in order of likelihood

1. **`isolate: true` (the default)** gives every test file its own module registry and, for component tests, its own jsdom/happy-dom instance. Necessary for correctness but expensive at scale.
2. **Missing DOM cleanup between tests.** If `@testing-library/react`'s `cleanup()` isn't running after each test, DOM nodes, event listeners, and timers from one test leak into the next within the same file/worker.
3. **`threads` pool with too much parallelism.** Vitest defaults to worker_threads; with no cap, it spins up one per core, each holding its own isolated module graph and (for component tests) DOM instance.
4. **Istanbul coverage provider** — same doubling effect as in Jest; the `v8` provider is lighter.

## Fixes

Ensure Testing Library cleanup runs automatically. If using the standard setup file convention, confirm this is present:

```ts
// vitest.setup.ts (referenced via test.setupFiles in vitest.config.ts)
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

Update `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',        // separate processes, often lower *peak* RAM than threads for heavy suites
    poolOptions: {
      forks: { maxForks: 4 },
      // if you stick with threads instead: threads: { maxThreads: 4 }
    },
    coverage: { provider: 'v8' },
    isolate: true,          // keep true unless you're certain no test leaks into another
  },
});
```

`pool: 'forks'` vs `'threads'`: forks isolate more strongly (separate OS processes, no shared memory) and tend to have a lower ceiling per-worker but slightly higher fixed cost each. Try both and compare against the `--logHeapUsage` baseline if unsure which is better for a specific repo.

## Verification command

```bash
npx vitest run --logHeapUsage
```

Same read as Jest: look for heap-used numbers that plateau across files rather than climbing steadily.
