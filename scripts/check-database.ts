/**
 * Read-only health check of the databases. Compares each database with database/schema.sql and
 * database/control-schema.sql and looks for data that the application cannot handle correctly.
 * It runs inside a read-only transaction and never changes anything.
 *
 *   npm run db:check             # the main database (DATABASE_URL or DB_*)
 *   npm run db:check -- RO IT    # country databases (DATABASE_URL_RO or DB_RO_*)
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import type { Connection, ConnectionOptions } from "mysql2/promise";

for (const file of [".env.local", ".env"]) {
  if (fs.existsSync(file)) process.loadEnvFile(file);
}

type Finding = { level: "problem" | "warning" | "ok"; text: string };

function sslOptions(): ConnectionOptions["ssl"] {
  if (process.env.DATABASE_SSL !== "true") return undefined;
  const ca = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");
  return { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false", ...(ca ? { ca } : {}) };
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
      connectTimeout: 15_000,
    };
  }
  const host = process.env[`${prefix}_HOST`];
  const user = process.env[`${prefix}_USER`];
  const database = process.env[`${prefix}_NAME`];
  if (!host || !user || !database) {
    throw new Error(`No database settings found for "${target}".`);
  }
  return {
    host,
    port: Number(process.env[`${prefix}_PORT`] || 3306),
    user,
    password: process.env[`${prefix}_PASSWORD`],
    database,
    ssl: sslOptions(),
    connectTimeout: 15_000,
  };
}

/** Table name -> column names, read from the CREATE TABLE statements of a schema file. */
function expectedTables(file: string): Map<string, string[]> {
  const sql = fs.readFileSync(path.resolve(process.cwd(), "database", file), "utf-8").replace(/--.*$/gm, "");
  const tables = new Map<string, string[]>();
  for (const match of sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\n\)/g)) {
    const columns = match[2]
      .split("\n")
      .map((line) => line.trim().match(/^(\w+)\s/)?.[1] ?? "")
      .filter((name) => name && !["INDEX", "UNIQUE", "CONSTRAINT", "PRIMARY", "FOREIGN", "KEY", "ON", "REFERENCES"].includes(name.toUpperCase()));
    tables.set(match[1], columns);
  }
  return tables;
}

async function rows<T = Record<string, unknown>>(connection: Connection, sql: string, params: unknown[] = []): Promise<T[]> {
  const [result] = await connection.query(sql, params);
  return result as T[];
}

async function count(connection: Connection, sql: string): Promise<number> {
  const result = await rows<{ n: number }>(connection, sql);
  return Number(result[0]?.n ?? 0);
}

async function check(target: string): Promise<Finding[]> {
  const options = connectionOptions(target);
  const findings: Finding[] = [];
  const add = (level: Finding["level"], text: string) => findings.push({ level, text });
  console.log(`\n=== ${target === "main" ? "Main database" : `Country ${target}`}: ${options.database} on ${options.host} ===`);

  const localHost = ["127.0.0.1", "localhost", "::1"].includes(String(options.host));
  if (!options.ssl && !localHost) {
    add("problem", "The connection to this remote database is not encrypted (DATABASE_SSL is not true). Patient data travels over the internet in clear text.");
  }

  const connection = await mysql.createConnection(options);
  try {
    await connection.query("START TRANSACTION READ ONLY");

    const [{ version }] = await rows<{ version: string }>(connection, "SELECT VERSION() AS version");
    add("ok", `Server version ${version}.`);

    const existing = new Map<string, Map<string, { nullable: boolean; type: string }>>();
    for (const row of await rows<{ t: string; c: string; n: string; ty: string }>(
      connection,
      `SELECT table_name AS t, column_name AS c, is_nullable AS n, column_type AS ty
       FROM information_schema.columns WHERE table_schema = DATABASE()`,
    )) {
      if (!existing.has(row.t)) existing.set(row.t, new Map());
      existing.get(row.t)!.set(row.c, { nullable: row.n === "YES", type: row.ty });
    }

    // A single-database installation holds both sets of tables; a country database only schema.sql.
    const expected = expectedTables("schema.sql");
    if (target === "main") {
      for (const [table, columns] of expectedTables("control-schema.sql")) expected.set(table, columns);
    }

    for (const [table, columns] of expected) {
      const actual = existing.get(table);
      if (!actual) {
        add("problem", `Table "${table}" is missing.`);
        continue;
      }
      const missing = columns.filter((column) => !actual.has(column));
      if (missing.length > 0) add("problem", `Table "${table}" is missing column(s): ${missing.join(", ")}.`);
      const extra = [...actual.keys()].filter((column) => !columns.includes(column));
      if (extra.length > 0) add("warning", `Table "${table}" has column(s) the application does not use: ${extra.join(", ")}.`);
    }
    const unknownTables = [...existing.keys()].filter((table) => !expected.has(table) && table !== "schema_migrations");
    if (unknownTables.length > 0) add("warning", `Tables the application does not use: ${unknownTables.join(", ")}.`);

    if (existing.has("schema_migrations")) {
      const applied = await rows<{ name: string }>(connection, "SELECT name FROM schema_migrations ORDER BY name");
      const files = fs.readdirSync(path.resolve(process.cwd(), "database/migrations")).filter((file) => file.endsWith(".sql"));
      const pending = files.filter((file) => !applied.some((row) => row.name === file));
      add(pending.length > 0 ? "warning" : "ok", pending.length > 0 ? `Migrations not recorded as applied: ${pending.join(", ")}.` : "Every migration is recorded as applied.");
    } else {
      add("warning", 'No "schema_migrations" table yet: "npm run migrate" has not been run with the new tracking.');
    }

    const patients = existing.get("patients");
    if (patients) {
      if (patients.has("access_token")) {
        add("problem", 'patients still has the old plaintext "access_token" column. Migration 005 hashes and removes it.');
      }
      const indexes = await rows<{ name: string; col: string; non_unique: number }>(
        connection,
        `SELECT index_name AS name, column_name AS col, non_unique
         FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'patients'`,
      );
      if (patients.has("access_token_hash") && !indexes.some((index) => index.col === "access_token_hash" && Number(index.non_unique) === 0)) {
        add("warning", "patients.access_token_hash has no unique index, so portal link lookups scan the whole table.");
      }
      const email = patients.get("email");
      if (email && !email.nullable) {
        add("warning", "patients.email is required. Mediator intake, which collects no email, cannot save patients.");
      }

      add("ok", `${await count(connection, "SELECT COUNT(*) AS n FROM patients")} patient record(s).`);

      let encryptedValues = 0;
      for (const column of ["medical_history", "photos", "profile_photo", "intake"]) {
        if (!patients.has(column)) continue;
        const plain = await rows<{ id: number }>(
          connection,
          `SELECT id FROM patients WHERE \`${column}\` IS NOT NULL AND \`${column}\` <> '' AND \`${column}\` NOT LIKE 'enc:v1:%' ORDER BY id LIMIT 20`,
        );
        if (plain.length > 0) {
          add("problem", `${plain.length} patient record(s) have "${column}" stored unencrypted (patient id ${plain.map((row) => row.id).join(", ")}).`);
        }
        encryptedValues += await count(connection, `SELECT COUNT(*) AS n FROM patients WHERE \`${column}\` LIKE 'enc:v1:%'`);
      }
      // Encrypted values prove that some environment (for example the live site) already has a key.
      add(
        encryptedValues > 0 ? "warning" : "ok",
        encryptedValues > 0
          ? `${encryptedValues} value(s) are already encrypted. A key exists somewhere (for example in Vercel): use that same key here, never a new one, or these values become unreadable.`
          : "No value is encrypted yet, so no encryption key has been used with this database.",
      );

      if (existing.has("workers")) {
        const orphans = await count(
          connection,
          "SELECT COUNT(*) AS n FROM patients p LEFT JOIN workers w ON w.id = p.assigned_worker_id WHERE p.assigned_worker_id IS NOT NULL AND w.id IS NULL",
        );
        if (orphans > 0) add("problem", `${orphans} patient record(s) are assigned to a staff member that no longer exists.`);
      }

      const duplicates = await rows<{ ids: string }>(
        connection,
        "SELECT GROUP_CONCAT(id ORDER BY id SEPARATOR ', ') AS ids FROM patients WHERE email IS NOT NULL AND email <> '' GROUP BY LOWER(email) HAVING COUNT(*) > 1 LIMIT 20",
      );
      if (duplicates.length > 0) {
        add("problem", `${duplicates.length} email address(es) are used by more than one patient (patient ids: ${duplicates.map((row) => `[${row.ids}]`).join(" ")}).`);
      }
      if (!indexes.some((index) => index.col === "email" && Number(index.non_unique) === 0)) {
        add("warning", "patients.email has no unique index, so the database does not stop two patients sharing an email.");
      }
      const noEmail = await count(connection, "SELECT COUNT(*) AS n FROM patients WHERE email IS NULL OR email = ''");
      if (noEmail > 0) add("warning", `${noEmail} patient record(s) have no email, so they cannot receive a portal link.`);

      if (patients.has("access_token_expires_at") && patients.has("access_token_hash")) {
        const noExpiry = await count(connection, "SELECT COUNT(*) AS n FROM patients WHERE access_token_hash IS NOT NULL AND access_token_expires_at IS NULL");
        if (noExpiry > 0) add("warning", `${noExpiry} portal link(s) never expire.`);
      }

      // Largest rows: photos and documents are stored inside the patient row.
      const [size] = await rows<{ biggest: number | null; total: number | null }>(
        connection,
        `SELECT MAX(COALESCE(LENGTH(photos), 0) + COALESCE(LENGTH(intake), 0) + COALESCE(LENGTH(profile_photo), 0) + COALESCE(LENGTH(followups), 0)) AS biggest,
                SUM(COALESCE(LENGTH(photos), 0) + COALESCE(LENGTH(intake), 0) + COALESCE(LENGTH(profile_photo), 0) + COALESCE(LENGTH(followups), 0)) AS total
         FROM patients`,
      );
      const megabytes = (bytes: number | null) => `${(Number(bytes ?? 0) / 1_048_576).toFixed(1)} MB`;
      add(Number(size?.biggest ?? 0) > 20 * 1_048_576 ? "warning" : "ok", `Files stored inside patient rows: ${megabytes(size?.total ?? 0)} in total, largest record ${megabytes(size?.biggest ?? 0)}.`);
    }

    if (existing.has("workers")) {
      const admins = await count(
        connection,
        "SELECT COUNT(*) AS n FROM workers WHERE COALESCE(status, 'active') = 'active' AND LOWER(TRIM(role)) IN ('super admin', 'superadmin')",
      );
      if (admins === 0) add("problem", "There is no active super admin account, so nobody can open Settings, the audit log or the institute directory.");
      else add("ok", `${admins} active super admin account(s).`);

      const unusable = await count(
        connection,
        "SELECT COUNT(*) AS n FROM workers WHERE COALESCE(status, 'active') = 'active' AND LOWER(TRIM(role)) NOT IN ('administrator', 'admin', 'super admin', 'superadmin', 'doctor', 'mediator')",
      );
      if (unusable > 0) add("warning", `${unusable} active staff account(s) have a role that cannot sign in to the panel.`);

      const mixedCase = await count(connection, "SELECT COUNT(*) AS n FROM workers WHERE email <> LOWER(TRIM(email))");
      if (mixedCase > 0) add("warning", `${mixedCase} staff email(s) contain capitals or spaces.`);
    }

    if (existing.has("meetings") && patients) {
      const orphanMeetings = await rows<{ id: number }>(
        connection,
        "SELECT m.id FROM meetings m LEFT JOIN patients p ON p.id = m.patient_id WHERE m.patient_id IS NOT NULL AND p.id IS NULL ORDER BY m.id LIMIT 50",
      );
      if (orphanMeetings.length > 0) {
        add("warning", `${orphanMeetings.length} meeting(s) point to a patient that was deleted (meeting id ${orphanMeetings.map((row) => row.id).join(", ")}).`);
      }
    }

    if (existing.has("rate_limits")) {
      const stale = await count(connection, `SELECT COUNT(*) AS n FROM rate_limits WHERE reset_at < ${Date.now() - 86_400_000}`);
      if (stale > 10_000) add("warning", `${stale} expired rate-limit rows are waiting to be cleaned up.`);
    }
  } finally {
    await connection.query("ROLLBACK").catch(() => undefined);
    await connection.end();
  }

  const country = target === "main" ? (process.env.DEFAULT_COUNTRY || "RO").toUpperCase() : target;
  if (!process.env[`DATA_ENCRYPTION_KEY_${country}`]) {
    add("problem", `DATA_ENCRYPTION_KEY_${country} is not set in this environment: medical history and photos are saved unencrypted.`);
  }
  return findings;
}

async function main() {
  const targets = process.argv.slice(2).map((value) => value.trim().toUpperCase()).filter(Boolean);
  let problems = 0;
  for (const target of targets.length > 0 ? targets : ["main"]) {
    const findings = await check(target);
    for (const level of ["problem", "warning", "ok"] as const) {
      for (const finding of findings.filter((item) => item.level === level)) {
        console.log(`${level === "problem" ? "PROBLEM" : level === "warning" ? "WARNING" : "OK     "}  ${finding.text}`);
      }
    }
    problems += findings.filter((item) => item.level === "problem").length;
  }
  console.log(problems > 0 ? `\n${problems} problem(s) found. Nothing was changed.` : "\nNo problems found. Nothing was changed.");
  process.exitCode = problems > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error("Database check failed:", error instanceof Error ? error.message : error);
  process.exit(2);
});
