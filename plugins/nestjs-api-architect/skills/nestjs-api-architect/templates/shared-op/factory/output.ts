// Generate<Thing>Output — extends BaseClass for typed `.of({...})`. Not validated at runtime.
import { BaseClass } from "@/shared/base/base-class";

export class Generate<Thing>Output extends BaseClass {
  code!: string;
}
