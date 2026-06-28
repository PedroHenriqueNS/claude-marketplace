// Insert<Entity>Module — the per-OPERATION module (level 1 of the 3-level chain:
// operation -> group -> feature). Provides + exports just this one operation. NOT @Global.
// Lives at src/shared/repositories/<entity>-repository/insert-<entity>/insert-<entity>.module.ts.
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { <Entity>Entity } from "@/@core/entities/<entity>.entity";
import { Insert<Entity>Repository } from "./index.repository";

@Module({
  imports: [TypeOrmModule.forFeature([<Entity>Entity])],
  providers: [Insert<Entity>Repository],
  exports: [Insert<Entity>Repository],
})
export class Insert<Entity>Module {}
