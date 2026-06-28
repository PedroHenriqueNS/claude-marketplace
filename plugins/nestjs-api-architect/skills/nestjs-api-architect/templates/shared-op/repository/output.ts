// Insert<Entity>Output — extends BaseClass for typed `.of({...})` construction. NOT validated at
// runtime (it comes from trusted persistence code). Fields are the repository's RAW shape (Date,
// not string) — the domain service converts to the wire shape. No @ApiProperty required.
import { BaseClass } from "@/shared/base/base-class";

export class Insert<Entity>Output extends BaseClass {
  id!: string;
  createdAt!: Date;
}
