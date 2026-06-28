# Per-operation shared layers (repositories, gateways, factories)

> **DDD lens:** repositories are the persistence abstraction; gateways are the anti-corruption layer
> wrapping an external system so its quirks never leak into the domain; factories are pure domain
> services.

Every shared-layer **operation** is its own directory with a single `execute(input)` method — the same
shape as a use case. One repository operation = one folder; one gateway call = one folder. They compose
through a three-level module chain: each operation has a module, a group module re-exports the
operations for one entity / external system, and a feature module imports the group module directly.

```
src/shared/{repositories,gateways,factories}/<group>-<role>/
├── <operation>/
│   ├── index.<role>.ts          # the @Injectable() class — one execute(input) method
│   ├── input.ts                 # <Op>Input extends BaseClass (class-validator)
│   ├── output.ts                # <Op>Output extends BaseClass (NO class-validator needed)
│   ├── <operation>.module.ts    # provides + exports the class
│   └── index.ts                 # barrel
└── <group>-<role>.module.ts     # group module re-exporting the per-operation modules
```

Three hard constraints make this layer predictable:

- **No `@Global`** on any operation or group module. A bounded context that uses an operation imports
  its group module explicitly, so the dependency is visible at the wiring site.
- **No top-level aggregator** that bundles every group. Aggregators hide which contexts really depend
  on which infrastructure and create import cycles as the app grows.
- The operation class is the **only** code that touches the underlying library — the TypeORM repository
  for a repo op, the HTTP client for a gateway op. Constructor-inject it; nothing above this layer sees
  `Repository<T>` or `axios`.

```typescript
// WRONG — a use case reaching straight into TypeORM (no persistence abstraction, untestable)
@Injectable()
export class FollowUserService extends BaseService<FollowUserInput, FollowUserOutput> {
  constructor(@InjectRepository(FollowEntity) private readonly repo: Repository<FollowEntity>) { super(); }
}

// RIGHT — the use case depends on a per-operation repository; only the repo op knows TypeORM
@Injectable()
export class InsertFollowRepository {
  constructor(@InjectRepository(FollowEntity) private readonly repo: Repository<FollowEntity>) {}
  async execute(input: InsertFollowInput): Promise<InsertFollowOutput> {
    const manager = input.txEntityManager ?? this.repo.manager;
    await manager.insert(FollowEntity, { followerId: input.followerId, followeeId: input.followeeId });
    return InsertFollowOutput.of({});
  }
}
```

Why per-operation rather than a fat `UserRepository` with twenty methods: each operation is named for
exactly what it does, owns its own validated `Input`, and is wired only where it's used. A god-repository
forces every consumer to depend on the whole surface and turns into a merge-conflict magnet. Splitting by
operation also makes transactions clean — an operation accepts an optional `txEntityManager` on its input
and runs against that manager when present (see `services-and-transactions`).

**Supersedes `arch-use-repository-pattern`** (generic nestjs-best-practices): we keep the repository
abstraction it recommends, but as per-operation classes with a 3-level module chain and no `@Global`,
not one repository class per entity.
