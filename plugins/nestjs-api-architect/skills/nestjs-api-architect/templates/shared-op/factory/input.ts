// Generate<Thing>Input — extends BaseClass; built via `.of({...})`. No @ApiProperty — internal.
import { IsInt, Max, Min } from "class-validator";
import { BaseClass } from "@/shared/base/base-class";

export class Generate<Thing>Input extends BaseClass {
  @IsInt()
  @Min(4)
  @Max(10)
  length!: number;
}
