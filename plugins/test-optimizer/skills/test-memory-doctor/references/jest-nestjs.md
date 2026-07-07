# Jest + NestJS memory fixes

## Root causes, in order of likelihood

1. **Unclosed `TestingModule`.** If a spec does `Test.createTestingModule(...).compile()` and never calls `app.close()`, the entire DI container, every provider instance, and any open DB/HTTP connections stay alive for the life of the worker process. This is the #1 cause in NestJS test suites.
2. **`ts-jest` transform overhead.** Compiles TypeScript per-worker on every run; memory and CPU heavy compared to alternatives.
3. **Istanbul coverage instrumentation** (Jest's default coverage provider) roughly doubles memory during coverage runs.
4. **Workers never recycled**, so any per-file leak accumulates for the worker's entire lifetime instead of being released.

## Fixes

Always add teardown to every spec file that creates a testing module:

```ts
afterEach(async () => {
  await app.close(); // closes DB connections, DI container, HTTP listeners
});
```

If `app` is created once per file in `beforeAll`, close it in `afterAll` instead — the point is that every `compile()` has a matching `close()`.

Update `jest.config.js`:

```js
module.exports = {
  maxWorkers: '50%',              // don't claim every core — leaves headroom, still parallel
  workerIdleMemoryLimit: '512MB', // Jest 29+: kills and respawns a worker once it exceeds this
  coverageProvider: 'v8',         // lighter than the default 'babel'/istanbul path
};
```

Swap `ts-jest` for `@swc/jest` if not already using it — meaningfully lower memory/CPU per file:

```js
// jest.config.js
module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};
```

## Verification command

```bash
npx jest --logHeapUsage --runInBand
```

Compare heap-used per file before/after. A well-behaved suite should show heap usage that plateaus, not one that grows monotonically test-file by test-file.
