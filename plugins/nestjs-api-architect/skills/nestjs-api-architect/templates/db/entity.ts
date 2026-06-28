// <Entity>Entity — TypeORM entity. Lives at src/@core/entities/<entity>.entity.ts.
//
// Migrations own ALL DDL. So: `synchronize: false` on @Entity, `createForeignKeyConstraints: false`
// on every relation, and NO `schema:` on the entity (a global DB_SCHEMA on the DataSource provides
// it, so per-environment schema swaps work). @Index and `default:` are declared for DOCUMENTATION
// only — they don't drive generation when synchronize is off. `onDelete:` must match the
// migration's ON DELETE clause for readability (it isn't enforced at runtime here).
//
// If `migration:generate` ever emits a migration that drops *_fkey constraints, partial unique
// indexes, or column DEFAULTs en masse, one of these flags is missing — fix it and regenerate.
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OwnerEntity } from "./owner.entity";

@Entity({ name: "<entity_plural>", synchronize: false })
export class <Entity>Entity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  ownerId!: string;

  @ManyToOne(() => OwnerEntity, { createForeignKeyConstraints: false, onDelete: "CASCADE" })
  owner!: OwnerEntity;

  @Column({ type: "text" })
  message!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
