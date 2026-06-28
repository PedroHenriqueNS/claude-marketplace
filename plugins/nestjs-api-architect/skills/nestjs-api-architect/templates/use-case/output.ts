// <UseCase>Output — the use case's result AND the API's wire contract. Lives at
// src/modules/<feature>/domain/<use-case>/output.ts.
//
// Declare fields in WIRE shape (string, not Date) — the service converts inside perform().
// Every field carries @ApiProperty so it shows up in the OpenAPI doc and client SDKs.
// class-validator decorators are tolerated here but NOT required: outputs are not validated.
import { ApiProperty } from "@nestjs/swagger";
import { BaseClass } from "@/shared/base/base-class";

export class <UseCase>Output extends BaseClass {
  @ApiProperty({ description: "The created resource id.", example: "0f8c..." })
  id!: string;

  @ApiProperty({ description: "ISO-8601 timestamp.", example: "2026-06-28T12:00:00.000Z" })
  createdAt!: string; // wire shape — the service did `.toISOString()` before returning
}
