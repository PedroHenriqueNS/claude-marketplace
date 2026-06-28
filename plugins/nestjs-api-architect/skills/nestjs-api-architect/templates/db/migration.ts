// <Timestamp>-<Name> migration. Lives at src/@core/db/migrations/<timestamp>-<name>.ts.
//
// Raw, schema-qualified SQL. up() is idempotent (IF NOT EXISTS) and down() is its exact inverse,
// so a revert + re-apply round-trips cleanly. Named constraints/indexes so they survive
// `migration:generate` (entities carry synchronize:false + createForeignKeyConstraints:false).
// The schema name comes from the env-driven DataSource — reference it via a parameter, never hardcode.
import { MigrationInterface, QueryRunner } from "typeorm";

export class Create<Entity>1700000000000 implements MigrationInterface {
  name = "Create<Entity>1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = queryRunner.connection.options.schema ?? "public";
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."<entity_plural>" (
        "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id"   uuid NOT NULL,
        "message"    text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "<entity_plural>_owner_id_fkey"
          FOREIGN KEY ("owner_id") REFERENCES "${schema}"."owners"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "<entity_plural>_owner_id_idx"
        ON "${schema}"."<entity_plural>" ("owner_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = queryRunner.connection.options.schema ?? "public";
    await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."<entity_plural>_owner_id_idx";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."<entity_plural>";`);
  }
}
