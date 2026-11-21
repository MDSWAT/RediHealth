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
import pg from "pg";
import { loadEnvFiles, postgresConfig } from "./lib/pg-connection";

loadEnvFiles();

type Finding = { level: "problem" | "warning" | "ok"; text: string };

/** Table name -> column names, read from the CREATE TABLE statements of a schema file. */
function expectedTables(file: string): Map<string, string[]> {
  const sql = fs.readFileSync(path.resolve(process.cwd(), "database", file), "utf-8").replace(/--.*$/gm, "");
  const tables = new Map<string, string[]>();
  for (const match of sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\n\);/g)) {
    const columns = match[2]
      .split("\n")
      .map((line) => line.trim().match(/^(\w+)\s/)?.[1] ?? "")
      .filter((name) => name && !["UNIQUE", "CONSTRAINT", "PRIMARY", "FOREIGN", "CHECK"].includes(name.toUpperCase()));
    tables.set(match[1], columns);
  }
  return tables;
}

async function rows<T = Record<string, unknown>>(client: pg.Client, sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await client.query(sql, params);
  return result.rows as T[];
}

async function count(client: pg.Client, sql: string, params: unknown[] = []): Promise<number> {
  const result = await rows<{ n: number }>(client, sql, params);
  return Number(result[0]?.n ?? 0);
}

async function check(target: string): Promise<Finding[]> {
  const config = postgresConfig(target);
  const findings: Finding[] = [];
  const add = (level: Finding["level"], text: string) => findings.push({ level, text });
  console.log(`\n=== ${target === "main" ? "Main database" : `Country ${target}`}: ${config.database} on ${config.host} ===`);

  const localHost = ["127.0.0.1", "localhost", "::1"].includes(String(config.host));
  if (!config.ssl && !localHost) {
    add("problem", "The connection to this remote database is not encrypted (DATABASE_SSL is not true). Patient data travels over the internet in clear text.");
  }

  const client = new pg.Client(config);
  await client.connect();
  try {
    await client.query("BEGIN READ ONLY");

    const [{ version }] = await rows<{ version: string }>(client, "SELECT current_setting('server_version') AS version");
    add("ok", `PostgreSQL ${version}.`);

    const existing = new Map<string, Map<string, { nullable: boolean; type: string }>>();
    for (const row of await rows<{ t: string; c: string; n: string; ty: string }>(
      client,
      `SELECT table_name AS t, column_name AS c, is_nullable AS n, data_type AS ty
       FROM information_schema.columns WHERE table_schema = current_schema()`,
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

    if (existing.has("patients")) {
      const [fn] = await rows<{ present: boolean }>(client, "SELECT to_regprocedure('jsonb_has_id(jsonb, text)') IS NOT NULL AS present");
      if (!fn?.present) add("problem", 'The function "jsonb_has_id" is missing, so staff cannot see the patients assigned to them. Apply database/schema.sql.');
    }

    if (existing.has("schema_migrations")) {
      const applied = await rows<{ name: string }>(client, "SELECT name FROM schema_migrations ORDER BY name");
      const dir = path.resolve(process.cwd(), "database/migrations");
      const files = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter((file) => file.endsWith(".sql") && (target === "main" || !file.includes(".control.")))
        : [];
      const pending = files.filter((file) => !applied.some((row) => row.name === file));
      add(pending.length > 0 ? "warning" : "ok", pending.length > 0 ? `Migrations not recorded as applied: ${pending.join(", ")}.` : "Every migration is recorded as applied.");
    } else {
      add("warning", 'No "schema_migrations" table yet: "npm run migrate" has not been run on this database.');
    }

    const patients = existing.get("patients");
    if (patients) {
      const indexes = await rows<{ def: string }>(
        client,
        "SELECT indexdef AS def FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'patients'",
      );
      const uniqueOn = (fragment: string) => indexes.some((index) => /UNIQUE/i.test(index.def) && index.def.includes(fragment));
      if (patients.has("access_token_hash") && !uniqueOn("access_token_hash")) {
        add("warning", "patients.access_token_hash has no unique index, so portal link lookups scan the whole table.");
      }
      const email = patients.get("email");
      if (email && !email.nullable) {
        add("warning", "patients.email is required. Mediator intake, which collects no email, cannot save patients.");
      }

      add("ok", `${await count(client, "SELECT COUNT(*) AS n FROM patients")} patient record(s).`);

      let encryptedValues = 0;
      for (const column of ["medical_history", "photos", "profile_photo", "intake"]) {
        if (!patients.has(column)) continue;
        const plain = await rows<{ id: number }>(
          client,
          `SELECT id FROM patients WHERE "${column}" IS NOT NULL AND "${column}" <> '' AND "${column}" NOT LIKE 'enc:v1:%' ORDER BY id LIMIT 20`,
        );
        if (plain.length > 0) {
          add("problem", `${plain.length} patient record(s) have "${column}" stored unencrypted (patient id ${plain.map((row) => row.id).join(", ")}).`);
        }
        encryptedValues += await count(client, `SELECT COUNT(*) AS n FROM patients WHERE "${column}" LIKE 'enc:v1:%'`);
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
          client,
          "SELECT COUNT(*) AS n FROM patients p LEFT JOIN workers w ON w.id = p.assigned_worker_id WHERE p.assigned_worker_id IS NOT NULL AND w.id IS NULL",
        );
        if (orphans > 0) add("problem", `${orphans} patient record(s) are assigned to a staff member that no longer exists.`);
      }

      const duplicates = await rows<{ ids: string }>(
        client,
        "SELECT string_agg(id::text, ', ' ORDER BY id) AS ids FROM patients WHERE email IS NOT NULL AND email <> '' GROUP BY LOWER(email) HAVING COUNT(*) > 1 LIMIT 20",
      );
      if (duplicates.length > 0) {
        add("problem", `${duplicates.length} email address(es) are used by more than one patient (patient ids: ${duplicates.map((row) => `[${row.ids}]`).join(" ")}).`);
      }
      if (!uniqueOn("email")) {
        add("warning", "patients.email has no unique index, so the database does not stop two patients sharing an email.");
      }
      const noEmail = await count(client, "SELECT COUNT(*) AS n FROM patients WHERE email IS NULL OR email = ''");
      if (noEmail > 0) add("warning", `${noEmail} patient record(s) have no email, so they cannot receive a portal link.`);

      if (patients.has("access_token_expires_at") && patients.has("access_token_hash")) {
        const noExpiry = await count(client, "SELECT COUNT(*) AS n FROM patients WHERE access_token_hash IS NOT NULL AND access_token_expires_at IS NULL");
        if (noExpiry > 0) add("warning", `${noExpiry} portal link(s) never expire.`);
      }

      // Largest rows: photos and documents are stored inside the patient row.
      const [size] = await rows<{ biggest: string | null; total: string | null }>(
        client,
        `SELECT MAX(COALESCE(octet_length(photos), 0) + COALESCE(octet_length(intake), 0) + COALESCE(octet_length(profile_photo), 0) + COALESCE(octet_length(followups), 0)) AS biggest,
                SUM(COALESCE(octet_length(photos), 0) + COALESCE(octet_length(intake), 0) + COALESCE(octet_length(profile_photo), 0) + COALESCE(octet_length(followups), 0)) AS total
         FROM patients`,
      );
      const megabytes = (bytes: string | number | null) => `${(Number(bytes ?? 0) / 1_048_576).toFixed(1)} MB`;
      add(Number(size?.biggest ?? 0) > 20 * 1_048_576 ? "warning" : "ok", `Files stored inside patient rows: ${megabytes(size?.total ?? 0)} in total, largest record ${megabytes(size?.biggest ?? 0)}.`);
    }

    if (existing.has("workers")) {
      const admins = await count(
        client,
        "SELECT COUNT(*) AS n FROM workers WHERE COALESCE(status, 'active') = 'active' AND LOWER(TRIM(role)) IN ('super admin', 'superadmin')",
      );
      if (admins === 0) add("problem", "There is no active super admin account, so nobody can open Settings, the audit log or the institute directory.");
      else add("ok", `${admins} active super admin account(s).`);

      const unusable = await count(
        client,
        "SELECT COUNT(*) AS n FROM workers WHERE COALESCE(status, 'active') = 'active' AND LOWER(TRIM(role)) NOT IN ('administrator', 'admin', 'super admin', 'superadmin', 'doctor', 'mediator')",
      );
      if (unusable > 0) add("warning", `${unusable} active staff account(s) have a role that cannot sign in to the panel.`);

      const mixedCase = await count(client, "SELECT COUNT(*) AS n FROM workers WHERE email <> LOWER(TRIM(email))");
      if (mixedCase > 0) add("warning", `${mixedCase} staff email(s) contain capitals or spaces.`);
    }

    if (existing.has("meetings") && patients) {
      const orphanMeetings = await rows<{ id: number }>(
        client,
        "SELECT m.id FROM meetings m LEFT JOIN patients p ON p.id = m.patient_id WHERE m.patient_id IS NOT NULL AND p.id IS NULL ORDER BY m.id LIMIT 50",
      );
      if (orphanMeetings.length > 0) {
        add("warning", `${orphanMeetings.length} meeting(s) point to a patient that was deleted (meeting id ${orphanMeetings.map((row) => row.id).join(", ")}).`);
      }
    }

    // A copied table whose id counter is behind its data fails on the next insert.
    for (const table of expected.keys()) {
      if (!existing.get(table)?.has("id")) continue;
      const [state] = await rows<{ max_id: number | null; next_id: number | null }>(
        client,
        `SELECT (SELECT MAX(id) FROM "${table}") AS max_id,
                (SELECT last_value FROM pg_sequences WHERE schemaname = current_schema() AND sequencename = split_part(pg_get_serial_sequence('"${table}"', 'id'), '.', 2)) AS next_id`,
      );
      if (state?.max_id && (state.next_id ?? 0) < state.max_id) {
        add("problem", `The id counter of "${table}" (${state.next_id ?? "unused"}) is behind its highest id (${state.max_id}): the next insert will fail. Run "npm run db:copy-from-mysql" again or reset the sequence.`);
      }
    }

    if (existing.has("rate_limits")) {
      const stale = await count(client, "SELECT COUNT(*) AS n FROM rate_limits WHERE reset_at < $1", [Date.now() - 86_400_000]);
      if (stale > 10_000) add("warning", `${stale} expired rate-limit rows are waiting to be cleaned up.`);
    }
  } finally {
    await client.query("ROLLBACK").catch(() => undefined);
    await client.end();
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
