// Insert<Entity>Repository — ONE persistence operation. Lives at
// src/shared/repositories/<entity>-repository/insert-<entity>/index.repository.ts.
//
// One @Injectable class, one execute(). It is the ONLY code that touches the TypeORM repository
// for this operation. It runs against the input's txEntityManager when present (so callers can
// enlist it in a transaction), otherwise against its injected repository. It does NOT re-validate
// its input — the domain service that built the input already validated it.
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { <Entity>Entity } from "@/@core/entities/<entity>.entity";
import { Insert<Entity>Input } from "./input";
import { Insert<Entity>Output } from "./output";

@Injectable()
export class Insert<Entity>Repository {
  constructor(
    @InjectRepository(<Entity>Entity)
    private readonly repo: Repository<<Entity>Entity>,
  ) {}

  async execute(input: Insert<Entity>Input): Promise<Insert<Entity>Output> {
    const manager = input.txEntityManager ?? this.repo.manager;
    const row = manager.create(<Entity>Entity, { ownerId: input.ownerId, message: input.message });
    const saved = await manager.save(row);
    return Insert<Entity>Output.of({ id: saved.id, createdAt: saved.createdAt });
  }
}
