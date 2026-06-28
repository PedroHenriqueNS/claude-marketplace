// <UseCase>Input — the use case's boundary value object. Lives at
// src/modules/<feature>/domain/<use-case>/input.ts. Built only via `.of({...})`.
//
// @ApiProperty / @ApiPropertyOptional go on REQUEST-BODY fields (they ARE the Swagger schema).
// Auth/path/query-injected fields and the TX handle are documented EXCEPTIONS — see the comments.
import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, IsOptional, MinLength } from "class-validator";
import { EntityManager } from "typeorm";
import { BaseClass } from "@/shared/base/base-class";

export class <UseCase>Input extends BaseClass {
  // Body field → documented in Swagger.
  @ApiProperty({ description: "What the caller sends.", example: "hello" })
  @IsString()
  @MinLength(1)
  message!: string;

  // Injected from @CurrentUser() on the controller — never on the wire; no @ApiProperty.
  @IsUUID()
  viewerId!: string;

  // TX handle — never on the wire; no @ApiPropertyOptional. Present only inside a transaction.
  @IsOptional()
  txEntityManager?: EntityManager;
}
