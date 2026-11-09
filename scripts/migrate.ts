import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

async function runMigrations() {
  const url = process.env.DATABASE_URL;
  const pool = url
    ? mysql.createPool(url)
    : mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      });

  try {
    const migrationsDir = path.resolve(process.cwd(), "database/migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Migrations directory not found: ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    console.log(`Found ${files.length} migration files in ${migrationsDir}\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const rawSql = fs.readFileSync(filePath, "utf-8");
      const cleanedSql = rawSql.replace(/--.*$/gm, "");
      const statements = cleanedSql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      console.log(`Executing ${file} (${statements.length} statement${statements.length === 1 ? "" : "s"})...`);

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          // If already migrated, column dropped, or duplicate index/column, skip gracefully
          if (
            msg.includes("Duplicate column") ||
            msg.includes("already exists") ||
            msg.includes("Duplicate key") ||
            msg.includes("Unknown column") ||
            msg.includes("check that column/key exists")
          ) {
            console.log(`  · Skipped existing/previously applied: ${msg.split("\n")[0]}`);
          } else {
            throw err;
          }
        }
      }
      console.log(`  ✓ ${file} applied successfully.\n`);
    }

    const [tables] = await pool.query("SHOW TABLES;");
    const tableNames = (tables as Record<string, string>[]).map((r) => Object.values(r)[0]);
    console.log("Migration complete. Tables currently in database:");
    for (const name of tableNames) {
      console.log(`  - ${name}`);
    }
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
