// Generate<Thing>Module — the per-operation factory module. Provides + exports the factory.
// NOT @Global. A <group>-factory.module.ts group module re-exports it.
// Lives at src/shared/factories/<group>-factory/generate-<thing>/generate-<thing>.module.ts.
import { Module } from "@nestjs/common";
import { Generate<Thing>Factory } from "./index.factory";

@Module({
  providers: [Generate<Thing>Factory],
  exports: [Generate<Thing>Factory],
})
export class Generate<Thing>Module {}
