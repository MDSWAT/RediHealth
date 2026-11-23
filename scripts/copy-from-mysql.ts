/**
 * One-time copy of the data from the old MySQL databases into the new PostgreSQL ones.
 *
 *   npm run db:copy-from-mysql              # main database: MYSQL_SOURCE_URL -> DATABASE_URL
 *   npm run db:copy-from-mysql -- RO IT     # countries: MYSQL_SOURCE_URL_RO -> DATABASE_URL_RO, ...
 *   npm run db:copy-from-mysql -- RO --replace   # empty the PostgreSQL tables first
 *
 * Before running it:
 *   1. stop writes to the MySQL database (maintenance mode), so nothing is lost in between;
 *   2. create the PostgreSQL schema with "npm run migrate" (and "npm run migrate -- RO ..." per country);
 *   3. set MYSQL_SOURCE_URL / MYSQL_SOURCE_URL_<CC> to mysql://user:password@host:3306/database.
 *
 * Each target is copied in a single PostgreSQL transaction: if any row fails, nothing is kept.
 * The MySQL database is only read. Afterwards row counts are compared table by table and the id
 * counters are moved past the copied ids. Finish with "npm run db:check".
 *
 * MySQL is read with time_zone +00:00, so TIMESTAMP columns arrive exact. DATETIME columns
 * (patients.access_token_expires_at) are read as UTC too, which is right when the MySQL server ran in UTC.
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import pg from "pg";
import { loadEnvFiles, postgresConfig } from "./lib/pg-connection";

loadEnvFiles();

// Parents before children, so foreign keys are satisfied as rows arrive.
const TABLE_ORDER = [
  "workers",
  "medical_help_requests",
  "patients",
  "mediator_cases",
  "meetings",
  "activity_logs",
  "patient_vitals_telemetry",
  "patient_care_recommendations",
  "mediator_requests",
  "offline_sync_receipts",
  "app_settings",
  "medical_institutes",
  "platform_feedback",
  // rate_limits is deliberately not copied: its counters expire within minutes.
];

const MAX_PARAMS = 30_000;
const MAX_ROWS_PER_BATCH = 200;
// Patient rows hold photos and documents inline; keep their batches small.
const SMALL_BATCH_TABLES = new Set(["patients", "meetings"]);

function sourceUrl(target: string) {
  const name = target === "main" ? "MYSQL_SOURCE_URL" : `MYSQL_SOURCE_URL_${target}`;
  const url = process.env[name];
  if (!url?.startsWith("mysql://")) {
    throw new Error(`Set ${name} to the old MySQL database (mysql://user:password@host:3306/database).`);
  }
  return url;
}

function mysqlOptions(url: string): mysql.ConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    timezone: "Z",
    dateStrings: ["DATE"],
    supportBigNumbers: true,
    bigNumberStrings: false,
    ssl: process.env.MYSQL_SOURCE_SSL === "true" ? { rejectUnauthorized: process.env.MYSQL_SOURCE_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
  };
}

type ColumnInfo = { name: string; type: string };

function convert(value: unknown, column: ColumnInfo, table: string, warnings: Set<string>): unknown {
  if (value === null || value === undefined) return null;
  if (column.type === "jsonb" || column.type === "json") {
    // mysql2 already parsed JSON columns; send them back as JSON text.
    if (typeof value === "string") {
      try {
        JSON.parse(value);
        return value;
      } catch {
        return JSON.stringify(value);
      }
    }
    return JSON.stringify(value);
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      warnings.add(`${table}.${column.name}: invalid MySQL dates (0000-00-00) were copied as empty.`);
      return null;
    }
    return value;
  }
  if (typeof value === "string" && value.includes("\u0000")) {
    warnings.add(`${table}.${column.name}: NUL characters were removed (PostgreSQL text cannot hold them).`);
    return value.replaceAll("\u0000", "");
  }
  if (Buffer.isBuffer(value)) return value.toString("utf-8");
  return value;
}

async function copyTarget(target: string, replace: boolean) {
  const config = postgresConfig(target);
  const source = await mysql.createConnection(mysqlOptions(sourceUrl(target)));
  const client = new pg.Client(config);
  await client.connect();
  const warnings = new Set<string>();
  console.log(`\n=== ${target === "main" ? "Main database" : `Country ${target}`}: MySQL ${source.config.database} -> PostgreSQL ${config.database} on ${config.host} ===`);

  try {
    await source.query("SET time_zone = '+00:00'");
    const { rows: migrated } = await client.query<{ present: boolean }>("SELECT to_regclass('public.schema_migrations') IS NOT NULL AS present");
    if (!migrated[0]?.present) {
      throw new Error(`The PostgreSQL database has no schema yet. Run "npm run migrate${target === "main" ? "" : ` -- ${target}`}" first.`);
    }

    const [sourceTableRows] = await source.query("SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE()");
    const sourceTables = new Set((sourceTableRows as { t: string }[]).map((row) => row.t));
    const { rows: targetColumnRows } = await client.query<{ t: string; c: string; ty: string }>(
      "SELECT table_name AS t, column_name AS c, data_type AS ty FROM information_schema.columns WHERE table_schema = current_schema()",
    );
    const targetColumns = new Map<string, ColumnInfo[]>();
    for (const row of targetColumnRows) {
      if (!targetColumns.has(row.t)) targetColumns.set(row.t, []);
      targetColumns.get(row.t)!.push({ name: row.c, type: row.ty });
    }

    const tables = TABLE_ORDER.filter((table) => sourceTables.has(table) && targetColumns.has(table));
    const skipped = TABLE_ORDER.filter((table) => sourceTables.has(table) && !targetColumns.has(table));
    if (skipped.length > 0) console.warn(`! Not in the PostgreSQL schema, not copied: ${skipped.join(", ")}`);

    await client.query("BEGIN");

    for (const table of tables) {
      const { rows: [{ n: existing }] } = await client.query<{ n: number }>(`SELECT COUNT(*) AS n FROM "${table}"`);
      if (existing > 0 && !replace) {
        throw new Error(`PostgreSQL table "${table}" already has ${existing} row(s). Re-run with --replace to empty it first.`);
      }
    }
    if (replace && tables.length > 0) {
      await client.query(`TRUNCATE ${tables.map((table) => `"${table}"`).join(", ")} RESTART IDENTITY CASCADE`);
    }

    for (const table of tables) {
      const [sourceColumnRows] = await source.query(
        "SELECT column_name AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?",
        [table],
      );
      const sourceColumns = new Set((sourceColumnRows as { c: string }[]).map((row) => row.c));
      const columns = targetColumns.get(table)!.filter((column) => sourceColumns.has(column.name));
      const dropped = [...sourceColumns].filter((name) => !columns.some((column) => column.name === name));
      if (dropped.length > 0) console.warn(`! ${table}: MySQL column(s) not in PostgreSQL, not copied: ${dropped.join(", ")}`);

      const hasId = columns.some((column) => column.name === "id");
      const orderBy = hasId ? "id" : columns.map((column) => `\`${column.name}\``).join(", ");
      const perBatch = Math.max(1, Math.min(SMALL_BATCH_TABLES.has(table) ? 25 : MAX_ROWS_PER_BATCH, Math.floor(MAX_PARAMS / columns.length)));
      const columnList = columns.map((column) => `"${column.name}"`).join(", ");
      const selectList = columns.map((column) => `\`${column.name}\``).join(", ");

      let copied = 0;
      for (let offset = 0; ; offset += perBatch) {
        const [batch] = await source.query(`SELECT ${selectList} FROM \`${table}\` ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [perBatch, offset]);
        const sourceRows = batch as Record<string, unknown>[];
        if (sourceRows.length === 0) break;

        const params: unknown[] = [];
        const tuples = sourceRows.map((row) => {
          const placeholders = columns.map((column) => {
            params.push(convert(row[column.name], column, table, warnings));
            return `$${params.length}`;
          });
          return `(${placeholders.join(", ")})`;
        });
        try {
          await client.query(`INSERT INTO "${table}" (${columnList}) OVERRIDING SYSTEM VALUE VALUES ${tuples.join(", ")}`, params);
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          throw new Error(`Copying ${table} failed near row ${offset + 1}: ${detail}`);
        }
        copied += sourceRows.length;
        if (sourceRows.length < perBatch) break;
      }

      const [[{ n: sourceCount }]] = (await source.query(`SELECT COUNT(*) AS n FROM \`${table}\``)) as unknown as [[{ n: number }]];
      const { rows: [{ n: targetCount }] } = await client.query<{ n: number }>(`SELECT COUNT(*) AS n FROM "${table}"`);
      if (Number(sourceCount) !== targetCount) {
        throw new Error(`${table}: MySQL has ${sourceCount} row(s) but ${targetCount} arrived. Was something still writing to MySQL?`);
      }

      if (hasId) {
        // Move the id counter past the copied ids so the next insert does not collide.
        await client.query(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM "${table}"), 0), 1), (SELECT COUNT(*) > 0 FROM "${table}"))`,
        );
      }
      console.log(`  ✓ ${table}: ${copied} row(s)`);
    }

    await client.query("COMMIT");
    for (const warning of warnings) console.warn(`! ${warning}`);
    console.log("  Copy committed.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
    await source.end();
  }
}

async function main() {
  if (!fs.existsSync(path.resolve(process.cwd(), "database/schema.sql"))) {
    throw new Error("Run this from the project folder.");
  }
  const args = process.argv.slice(2).map((value) => value.trim()).filter(Boolean);
  const replace = args.includes("--replace");
  const targets = args.filter((value) => value !== "--replace").map((value) => value.toUpperCase());
  for (const target of targets) {
    if (!/^[A-Z]{2}$/.test(target)) throw new Error(`"${target}" is not a country code such as RO or IT.`);
  }
  for (const target of targets.length > 0 ? targets : ["main"]) {
    await copyTarget(target, replace);
  }
  console.log('\nCopy complete. Run "npm run db:check" (and "npm run db:check -- RO ...") to verify.');
}

main().catch((error) => {
  console.error("Copy failed, nothing was kept in PostgreSQL:", error instanceof Error ? error.message : error);
  process.exit(1);
});
