// <UseCase>Module — wires one use case. Lives at
// src/modules/<feature>/domain/<use-case>/<use-case>.module.ts.
// Imports the GROUP module(s) it needs; provides + exports the service. The feature module
// imports this per-use-case module directly (no top-level use-case aggregator).
import { Module } from "@nestjs/common";
import { <Entity>RepositoryModule } from "@/shared/repositories/<entity>-repository";
import { <UseCase>Service } from "./index.service";

@Module({
  imports: [<Entity>RepositoryModule],
  providers: [<UseCase>Service],
  exports: [<UseCase>Service],
})
export class <UseCase>Module {}
