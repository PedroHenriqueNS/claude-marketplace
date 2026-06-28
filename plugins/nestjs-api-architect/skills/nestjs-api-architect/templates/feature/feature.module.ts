// <Feature>Module — one bounded context. Lives at src/modules/<feature>/<feature>.module.ts.
// Registers the controller and imports each per-use-case module directly. No use-case aggregator.
import { Module } from "@nestjs/common";
import { <Feature>Controller } from "./application/<feature>.controller";
import { <UseCase>Module } from "./domain/<use-case>/<use-case>.module";

@Module({
  imports: [<UseCase>Module],
  controllers: [<Feature>Controller],
})
export class <Feature>Module {}
