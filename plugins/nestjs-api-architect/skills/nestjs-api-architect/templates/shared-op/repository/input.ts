// Insert<Entity>Input — extends BaseClass; built via `.of({...})`. class-validator decorators
// validate the fields. No @ApiProperty here — repository inputs are never on the wire.
import { IsOptional, IsString, IsUUID } from "class-validator";
import { EntityManager } from "typeorm";
import { BaseClass } from "@/shared/base/base-class";

export class Insert<Entity>Input extends BaseClass {
  @IsUUID()
  ownerId!: string;

  @IsString()
  message!: string;

  // Optional transaction handle — present when the caller enlists this op in a DataSource.transaction.
  @IsOptional()
  txEntityManager?: EntityManager;
}
