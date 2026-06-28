// Generate<Thing>Factory — ONE pure domain operation that produces a value object (no I/O, no DB,
// no network). Factories hold focused domain logic that would clutter a service: code generation,
// hashing, token minting, score computation. Lives at
// src/shared/factories/<group>-factory/generate-<thing>/index.factory.ts.
import { Injectable } from "@nestjs/common";
import { randomInt } from "crypto";
import { Generate<Thing>Input } from "./input";
import { Generate<Thing>Output } from "./output";

@Injectable()
export class Generate<Thing>Factory {
  async execute(input: Generate<Thing>Input): Promise<Generate<Thing>Output> {
    // Example: a uniform N-digit numeric code, leading zeros preserved.
    const code = randomInt(0, 10 ** input.length).toString().padStart(input.length, "0");
    return Generate<Thing>Output.of({ code });
  }
}
