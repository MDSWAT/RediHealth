/**
 * Connection settings for the command-line database scripts, read the same way as the application
 * (src/lib/database.ts): DATABASE_URL / DB_* for the main (control) database and
 * DATABASE_URL_<CC> / DB_<CC>_* for a country database.
 */
import pg from "pg";

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number.parseInt(value, 10));

export function sslOptions(): pg.ClientConfig["ssl"] {
  if (process.env.DATABASE_SSL !== "true") return undefined;
  const ca = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");
  return {
    // Same rule as the application: verify the server unless the operator explicitly opts out.
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
    ...(ca ? { ca } : {}),
  };
}

export type TargetConfig = pg.ClientConfig & { host: string; database: string };

/** `target` is "main" or a country code such as "RO". */
export function postgresConfig(target: string): TargetConfig {
  const suffix = target === "main" ? "" : `_${target}`;
  const prefix = target === "main" ? "DB" : `DB_${target}`;
  const url = process.env[`DATABASE_URL${suffix}`];

  if (url && /^postgres(ql)?:\/\//.test(url)) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 5432),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
      ssl: sslOptions(),
      connectionTimeoutMillis: 15_000,
    };
  }

  const host = process.env[`${prefix}_HOST`];
  const user = process.env[`${prefix}_USER`];
  const database = process.env[`${prefix}_NAME`];
  if (!host || !user || !database) {
    throw new Error(
      `No PostgreSQL settings found for "${target}". Set DATABASE_URL${suffix} (postgres://...) or ${prefix}_HOST, ${prefix}_USER and ${prefix}_NAME.`,
    );
  }
  return {
    host,
    port: Number(process.env[`${prefix}_PORT`] || 5432),
    user,
    password: process.env[`${prefix}_PASSWORD`],
    database,
    ssl: sslOptions(),
    connectionTimeoutMillis: 15_000,
  };
}

export function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      // The file is optional.
    }
  }
}
