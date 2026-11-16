/**
 * Applies the SQL files in database/migrations and records which ones ran.
 *
 *   npm run migrate              # the main database (DATABASE_URL or DB_*), every migration
 *   npm run migrate -- RO        # one country database (DATABASE_URL_RO or DB_RO_*)
 *   npm run migrate -- RO IT     # several country databases
 *
 * Country databases skip the migrations that belong to the control database only.
 * Settings are read from .env.local and then .env, whichever exist.
 */
import fs from "node:fs";
import path from "node:path";
import mysql, { type Connection, type ConnectionOptions } from "mysql2/promise";

for (const file of [".env.local", ".env"]) {
  if (fs.existsSync(file)) process.loadEnvFile(file);
}

// Rate limits/settings, the institute directory and platform feedback live in the control database.
const CONTROL_ONLY = new Set(["007", "009", "016"]);

// Statements that fail this way were already applied by an earlier run or by schema.sql.
const ALREADY_APPLIED_ERRNOS = new Set([
  1050, // table already exists
  1054, // unknown column (an earlier run already dropped it)
  1060, // duplicate column name
  1061, // duplicate key name
  1091, // cannot drop: column or key does not exist
]);

function sslOptions(): ConnectionOptions["ssl"] {
  if (process.env.DATABASE_SSL !== "true") return undefined;
  const ca = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");
  return {
    // Same rule as the application: verify the server unless the operator explicitly opts out.
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
    ...(ca ? { ca } : {}),
  };
}

function connectionOptions(target: string): ConnectionOptions {
  const suffix = target === "main" ? "" : `_${target}`;
  const prefix = target === "main" ? "DB" : `DB_${target}`;
  const url = process.env[`DATABASE_URL${suffix}`];

  if (url?.startsWith("mysql://")) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
      ssl: sslOptions(),
    };
  }

  const host = process.env[`${prefix}_HOST`];
  const user = process.env[`${prefix}_USER`];
  const database = process.env[`${prefix}_NAME`];
  if (!host || !user || !database) {
    throw new Error(
      `No database settings found for "${target}". Set DATABASE_URL${suffix} or ${prefix}_HOST, ${prefix}_USER and ${prefix}_NAME.`,
    );
  }
  return {
    host,
    port: Number(process.env[`${prefix}_PORT`] || 3306),
    user,
    password: process.env[`${prefix}_PASSWORD`],
    database,
    ssl: sslOptions(),
  };
}

/** Splits a SQL file into statements, ignoring `--` comments and semicolons inside quotes. */
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let quote: string | null = null;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    if (quote) {
      current += char;
      if (char === "\\" && quote !== "`") {
        current += sql[i + 1] ?? "";
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
    } else if (char === "'" || char === '"' || char === "`") {
      quote = char;
      current += char;
    } else if (char === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i += 1;
      current += "\n";
    } else if (char === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

async function migrate(target: string, files: string[], migrationsDir: string): Promise<number> {
  const options = connectionOptions(target);
  console.log(`\n=== ${target === "main" ? "Main database" : `Country ${target}`}: ${options.database} on ${options.host} ===`);

  // One connection for the whole run: migrations use session variables and prepared statements.
  const connection: Connection = await mysql.createConnection(options);
  let skippedStatements = 0;
  try {
    await connection.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         name VARCHAR(255) NOT NULL PRIMARY KEY,
         applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`,
    );
    const [appliedRows] = await connection.query("SELECT name FROM schema_migrations");
    const applied = new Set((appliedRows as { name: string }[]).map((row) => row.name));

    for (const file of files) {
      if (target !== "main" && CONTROL_ONLY.has(file.slice(0, 3))) {
        console.log(`- ${file}: control database only, skipped`);
        continue;
      }
      if (applied.has(file)) {
        console.log(`- ${file}: already applied`);
        continue;
      }

      const statements = splitStatements(fs.readFileSync(path.join(migrationsDir, file), "utf-8"));
      console.log(`Applying ${file} (${statements.length} statement${statements.length === 1 ? "" : "s"})...`);
      for (const statement of statements) {
        try {
          await connection.query(statement);
        } catch (error) {
          const { errno, message } = error as { errno?: number; message?: string };
          if (errno === undefined || !ALREADY_APPLIED_ERRNOS.has(errno)) throw error;
          skippedStatements += 1;
          console.warn(`  ! Skipped (looks already applied): ${String(message).split("\n")[0]}`);
        }
      }
      await connection.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
      console.log(`  ✓ ${file}`);
    }
  } finally {
    await connection.end();
  }
  return skippedStatements;
}

async function main() {
  const migrationsDir = path.resolve(process.cwd(), "database/migrations");
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const targets = process.argv.slice(2).map((value) => value.trim().toUpperCase()).filter(Boolean);
  for (const target of targets) {
    if (!/^[A-Z]{2}$/.test(target)) throw new Error(`"${target}" is not a country code such as RO or IT.`);
  }

  let skipped = 0;
  for (const target of targets.length > 0 ? targets : ["main"]) {
    skipped += await migrate(target, files, migrationsDir);
  }

  console.log("\nMigration complete.");
  if (skipped > 0) {
    console.warn(
      `${skipped} statement${skipped === 1 ? " was" : "s were"} skipped as already applied. Read the warnings above and confirm each one is expected.`,
    );
  }
}

main().catch((error) => {
  console.error("Migration error:", error);
  process.exit(1);
});
