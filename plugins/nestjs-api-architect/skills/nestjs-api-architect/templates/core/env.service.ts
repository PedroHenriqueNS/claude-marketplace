// EnvService — the ONLY way the app reads configuration. Never touch `process.env` anywhere else;
// routing every read through here keeps env access typed, testable, and greppable.
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env.schema";

@Injectable()
export class EnvService {
  // `{ infer: true }` makes the return type follow `Env` per key.
  constructor(private readonly config: ConfigService<Env, true>) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get isProduction(): boolean {
    return this.get("NODE_ENV") === "production";
  }
}
