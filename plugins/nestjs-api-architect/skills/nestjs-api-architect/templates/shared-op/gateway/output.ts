// Send<Thing>Output — extends BaseClass for typed `.of({...})`. Not validated at runtime. Carries
// only what the domain needs back, translated out of the external system's response shape.
import { BaseClass } from "@/shared/base/base-class";

export class Send<Thing>Output extends BaseClass {
  externalId!: string;
}
