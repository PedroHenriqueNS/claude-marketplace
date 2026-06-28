// <UseCase>Service — one use case = one service. Lives at
// src/modules/<feature>/domain/<use-case>/index.service.ts.
//
// Implement perform(); the base class's execute() validates the input first. All wire-shape
// conversion (Date -> ISO string, field renames) happens HERE, never in the controller.
// Every downstream call wraps its argument in `<X>Input.of({...})` — never `{...} as never`.
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseService } from "@/shared/base/base-service";
import { Insert<Entity>Repository, Insert<Entity>Input } from "@/shared/repositories/<entity>-repository";
import { <UseCase>Input } from "./input";
import { <UseCase>Output } from "./output";

@Injectable()
export class <UseCase>Service extends BaseService<<UseCase>Input, <UseCase>Output> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly insert<Entity>: Insert<Entity>Repository,
  ) {
    super();
  }

  async perform(input: <UseCase>Input): Promise<<UseCase>Output> {
    // Multi-write work runs in one transaction; thread the manager through each op's input.
    const row = await this.dataSource.transaction(async (m) => {
      return this.insert<Entity>.execute(
        Insert<Entity>Input.of({ message: input.message, ownerId: input.viewerId, txEntityManager: m }),
      );
    });

    // Convert to the wire shape here, so the controller can return the output untouched.
    return <UseCase>Output.of({ id: row.id, createdAt: row.createdAt.toISOString() });
  }
}
