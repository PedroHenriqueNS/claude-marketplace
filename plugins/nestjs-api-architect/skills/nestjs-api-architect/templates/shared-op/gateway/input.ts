// Send<Thing>Input — extends BaseClass; built via `.of({...})`. The domain's words, not the
// external system's. No @ApiProperty — gateway inputs are internal.
import { IsString } from "class-validator";
import { BaseClass } from "@/shared/base/base-class";

export class Send<Thing>Input extends BaseClass {
  @IsString()
  to!: string;

  @IsString()
  body!: string;
}
