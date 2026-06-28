// <Entity>RepositoryModule — the GROUP module (level 2 of the chain: operation -> group ->
// feature). It imports + re-exports every per-operation module for this entity. Feature/use-case
// modules import THIS, never the operation modules directly, and never a top-level aggregator.
// NOT @Global. Lives at src/shared/repositories/<entity>-repository/<entity>-repository.module.ts.
//
// The same shape applies to gateway groups (<group>-gateway.module.ts) and factory groups.
import { Module } from "@nestjs/common";
import { Insert<Entity>Module } from "./insert-<entity>/insert-<entity>.module";
// import { Find<Entity>ByIdModule } from "./find-<entity>-by-id/find-<entity>-by-id.module";

@Module({
  imports: [Insert<Entity>Module /* , Find<Entity>ByIdModule */],
  exports: [Insert<Entity>Module /* , Find<Entity>ByIdModule */],
})
export class <Entity>RepositoryModule {}
