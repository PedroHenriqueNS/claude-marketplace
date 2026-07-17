---
name: test-memory-doctor
description: Diagnoses and fixes runaway node.exe/RAM usage during test runs in Jest (NestJS APIs), Vitest (React), and Playwright projects. Use this whenever the user mentions tests eating memory, node.exe RAM usage, OOM crashes during test runs, slow/hanging test suites, CI runners running out of memory, or asks to speed up or reduce memory in Jest/Vitest/Playwright. Also trigger if the user mentions "workerIdleMemoryLimit", "logHeapUsage", "maxWorkers", "app.close()" hanging tests, or jsdom/happy-dom leaks, even without using the word "memory" explicitly.
---

# Test Memory Doctor

Fixes high RAM usage in test runs across three frameworks that commonly coexist in a full-stack repo: **Jest** (NestJS APIs), **Vitest** (React), **Playwright** (E2E/browser). Each has a different root cause and a different fix — don't apply Jest fixes to Vitest or vice versa.

## Workflow

1. **Identify which framework(s) are affected.** Check the repo for `jest.config.*`, `vitest.config.*`, `playwright.config.*`. If the user didn't say which one is the problem, ask, or check all three if the repo has all three.

2. **Get a baseline measurement before changing anything.** This is the verification check per-framework fix will be judged against later:
   ```bash
   # Jest
   npx jest --logHeapUsage --runInBand > /tmp/jest-before.log 2>&1

   # Vitest
   npx vitest run --logHeapUsage > /tmp/vitest-before.log 2>&1
   ```
   Note the heap-used numbers per test file — a file whose heap keeps climbing relative to others is the leak source. For Playwright, note wall-clock time and peak RSS instead (`/usr/bin/time -v npx playwright test` on Linux, or Task Manager/Activity Monitor).

3. **Read the relevant reference file and apply its fixes:**
   - Jest + NestJS → `references/jest-nestjs.md`
   - Vitest + React → `references/vitest-react.md`
   - Playwright → `references/playwright.md`

4. **Re-run the same measurement command from step 2** and compare. Show the user the before/after heap numbers (or peak RSS for Playwright) as evidence — don't just assert it's fixed.

5. **If heap usage still climbs across files after applying the fixes**, the leak is almost certainly a specific test file, not a config problem. Bisect: run `--logHeapUsage` on half the suite at a time (or use `--testPathPattern` / `-t` to isolate files) until the offending file is found, then inspect it for missing teardown (unclosed DB connections, `app.close()`, timers, subscriptions, event listeners).

## Ground truth on why this happens

Jest and Vitest both parallelize by spawning multiple Node worker processes/threads, each loading a full copy of the app's module graph. RAM climbs (rather than plateauing) mainly because of things that don't get torn down between tests — not because parallelism itself is unbounded. See the reference files for the specific per-framework causes and fixes; don't guess generically, the fixes differ meaningfully between Jest and Vitest.

Playwright's memory cost is different in kind: it's real browser processes (Chromium/Firefox/WebKit), not Node module graphs, so the fix is capping `workers`/trace retention rather than anything about module isolation.
