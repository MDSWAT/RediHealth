/**
 * Creates or updates the PostgreSQL schema and records which migrations ran.
 *
 *   npm run migrate              # the main database (DATABASE_URL or DB_*)
 *   npm run migrate -- RO        # one country database (DATABASE_URL_RO or DB_RO_*)
 *   npm run migrate -- RO IT     # several country databases
 *   npm run migrate -- --baseline  # record every migration as applied WITHOUT running it
 *
 * On an empty database it applies the full schema first: control-schema.sql and schema.sql for the
 * main database (a single-database installation holds both), schema.sql alone for a country.
 * Files in database/migrations are changes made after that; each one runs in its own transaction,
 * so a failing migration leaves the database exactly as it was. A file whose name contains
 * ".control." applies to the main database only. Every run ends with lock-data-api.sql, which keeps
 * the tables away from Supabase's REST API.
 *
 * Settings are read from .env.local and then .env, whichever exist.
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadEnvFiles, postgresConfig } from "./lib/pg-connection";

loadEnvFiles();

const databaseDir = path.resolve(process.cwd(), "database");
const migrationsDir = path.join(databaseDir, "migrations");

function migrationFiles(target: string) {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .filter((file) => target === "main" || !file.includes(".control."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function inTransaction(client: pg.Client, run: () => Promise<void>) {
  await client.query("BEGIN");
  try {
    await run();
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function migrate(target: string, baseline: boolean) {
  const config = postgresConfig(target);
  console.log(`\n=== ${target === "main" ? "Main database" : `Country ${target}`}: ${config.database} on ${config.host} ===`);

  const client = new pg.Client(config);
  await client.connect();
  try {
    const { rows: existing } = await client.query<{ present: boolean }>(
      "SELECT to_regclass('public.schema_migrations') IS NOT NULL AS present",
    );
    const files = migrationFiles(target);

    if (!existing[0]?.present) {
      await inTransaction(client, async () => {
        const schemas = target === "main" ? ["control-schema.sql", "schema.sql"] : ["schema.sql"];
        for (const schema of schemas) {
          if (baseline) {
            console.log(`- ${schema}: not applied (--baseline)`);
            continue;
          }
          console.log(`Applying ${schema}...`);
          // Without parameters, pg sends the whole file as one multi-statement query.
          await client.query(fs.readFileSync(path.join(databaseDir, schema), "utf-8"));
          console.log(`  ✓ ${schema}`);
        }
        await client.query(
          `CREATE TABLE schema_migrations (
             name VARCHAR(255) NOT NULL PRIMARY KEY,
             applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
           )`,
        );
        // The schema files already describe the current state, so every existing migration is included.
        for (const file of files) {
          await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
          console.log(`- ${file}: included in the schema, recorded as applied`);
        }
      });
    } else {
      const { rows } = await client.query<{ name: string }>("SELECT name FROM schema_migrations");
      const applied = new Set(rows.map((row) => row.name));
      for (const file of files) {
        if (applied.has(file)) {
          console.log(`- ${file}: already applied`);
          continue;
        }
        await inTransaction(client, async () => {
          if (baseline) {
            console.log(`- ${file}: recorded as applied (not run)`);
          } else {
            console.log(`Applying ${file}...`);
            await client.query(fs.readFileSync(path.join(migrationsDir, file), "utf-8"));
            console.log(`  ✓ ${file}`);
          }
          await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        });
      }
    }

    // Every run, so tables added later are covered too (Supabase's REST API must never see them).
    await client.query(fs.readFileSync(path.join(databaseDir, "lock-data-api.sql"), "utf-8"));
    console.log("- lock-data-api.sql: tables closed to the Supabase Data API");
  } finally {
    await client.end();
  }
}

async function main() {
  const args = process.argv.slice(2).map((value) => value.trim()).filter(Boolean);
  const baseline = args.includes("--baseline");
  const targets = args.filter((value) => value !== "--baseline").map((value) => value.toUpperCase());
  for (const target of targets) {
    if (!/^[A-Z]{2}$/.test(target)) throw new Error(`"${target}" is not a country code such as RO or IT.`);
  }

  for (const target of targets.length > 0 ? targets : ["main"]) {
    await migrate(target, baseline);
  }
  console.log("\nMigration complete.");
}

main().catch((error) => {
  console.error("Migration error:", error);
  process.exit(1);
});
