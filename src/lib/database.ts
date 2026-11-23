import pg from "pg";
import { SUPPORTED_COUNTRIES, isSupportedCountry, type CountryCode } from "@/lib/countries";
import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Two kinds of database (PostgreSQL):
 *  - the control database holds nothing personal: rate-limit counters, settings and the public
 *    medical-institute directory;
 *  - one database per country holds that country's patients, requests, staff and audit log, and is
 *    reached with its own credentials (DATABASE_URL_<CC> or DB_<CC>_*).
 *
 * Code that touches personal data must go through `getCountryDatabase(country)`; there is
 * deliberately no default, so a missing country is a compile error rather than a data leak.
 */

/** One result row. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowDataPacket = Record<string, any>;

/** What a write reports. `insertId` is the `id` returned by `INSERT ... RETURNING id`, else 0. */
export type ResultSetHeader = {
  affectedRows: number;
  insertId: number;
};

// BIGINT ids and COUNT(*) fit comfortably in a JS number; return them as numbers, not strings.
// NUMERIC stays a string so decimals (coordinates, glucose) keep their exact value.
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number.parseInt(value, 10));

type GlobalWithDatabase = typeof globalThis & {
  databasePools?: Map<string, pg.Pool>;
};

const globalWithDatabase = globalThis as GlobalWithDatabase;

type ConnectionSettings = {
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
};

export class CountryNotConfiguredError extends Error {
  constructor(readonly country: CountryCode) {
    super(`No database is configured for ${country}.`);
    this.name = "CountryNotConfiguredError";
  }
}

/** A unique index rejected the write (PostgreSQL error 23505). */
export function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "23505";
}

function postgresUrl(value: string | undefined) {
  return value && /^postgres(ql)?:\/\//.test(value) ? value : undefined;
}

function isComplete(settings: ConnectionSettings) {
  return Boolean(settings.connectionString || (settings.host && settings.user && settings.database));
}

function controlSettings(): ConnectionSettings {
  const isProduction = process.env.NODE_ENV === "production";
  const connectionString = isProduction
    ? postgresUrl(process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL)
    : postgresUrl(process.env.DATABASE_URL || process.env.DATABASE_URL_PRODUCTION);

  return {
    connectionString,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

function countrySettings(country: CountryCode): ConnectionSettings {
  return {
    connectionString: postgresUrl(process.env[`DATABASE_URL_${country}`]),
    host: process.env[`DB_${country}_HOST`],
    port: Number(process.env[`DB_${country}_PORT`] || 5432),
    user: process.env[`DB_${country}_USER`],
    password: process.env[`DB_${country}_PASSWORD`],
    database: process.env[`DB_${country}_NAME`],
  };
}

/** The country whose data lives in the control database of installations that predate per-country databases. */
export function defaultCountry(): CountryCode {
  const configured = process.env.DEFAULT_COUNTRY?.trim().toUpperCase();
  return isSupportedCountry(configured) ? configured : "RO";
}

function resolveCountrySettings(country: CountryCode): ConnectionSettings | null {
  const own = countrySettings(country);
  if (isComplete(own)) return own;

  // Single-database installations keep working: the default country uses the original connection.
  if (country === defaultCountry()) {
    const legacy = controlSettings();
    if (isComplete(legacy)) return legacy;
  }
  return null;
}

export function hasControlDatabase() {
  return isComplete(controlSettings());
}

export function isCountryConfigured(country: CountryCode) {
  return resolveCountrySettings(country) !== null;
}

export function configuredCountries(): CountryCode[] {
  return SUPPORTED_COUNTRIES.filter(isCountryConfigured);
}

function resolveSslConfig() {
  if (process.env.DATABASE_SSL !== "true") return undefined;

  const ca = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");
  return {
    // Verify the server certificate unless an operator explicitly opts out (e.g. a self-signed dev server).
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
    ...(ca ? { ca } : {}),
  };
}

function createPool(settings: ConnectionSettings, label: string) {
  const baseConfig = {
    max: Number(process.env.DB_CONNECTION_LIMIT || 10),
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 30_000,
    ssl: resolveSslConfig(),
  };

  let pool: pg.Pool;
  if (settings.connectionString) {
    const url = new URL(settings.connectionString);
    const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
    if (!database) {
      throw new Error(`PostgreSQL connection URL for ${label} must include a database name.`);
    }

    // Parsed by hand so DATABASE_SSL keeps deciding TLS, not an sslmode left in the URL.
    pool = new pg.Pool({
      ...baseConfig,
      host: url.hostname,
      port: Number(url.port || 5432),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
    });
  } else {
    if (!settings.host || !settings.user || !settings.database) {
      throw new Error(`Configure PostgreSQL for ${label} using a postgres:// URL or the host, user and database settings.`);
    }

    pool = new pg.Pool({
      ...baseConfig,
      host: settings.host,
      port: settings.port,
      user: settings.user,
      password: settings.password,
      database: settings.database,
    });
  }

  // An idle client losing its connection must not crash the server; the pool replaces it.
  pool.on?.("error", (error) => {
    console.error(`[database] idle connection error (${label}):`, error.message);
  });
  return pool;
}

/**
 * The application writes `?` placeholders; PostgreSQL wants `$1, $2, ...`. Question marks inside
 * quoted strings, quoted identifiers and comments are left alone.
 */
export function toPostgresPlaceholders(sql: string): string {
  let out = "";
  let index = 0;
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    if (quote) {
      out += char;
      if (char === quote) {
        if (sql[i + 1] === quote) {
          out += sql[i + 1];
          i += 1;
        } else {
          quote = null;
        }
      }
    } else if (char === "'" || char === '"') {
      quote = char;
      out += char;
    } else if (char === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? sql.length : end;
      out += sql.slice(i, stop);
      i = stop - 1;
    } else if (char === "?") {
      index += 1;
      out += `$${index}`;
    } else {
      out += char;
    }
  }
  return out;
}

/** Booleans are stored as SMALLINT 0/1 (as they were in MySQL), so send them that way. */
function toPostgresParams(params: unknown[]) {
  return params.map((value) => (typeof value === "boolean" ? (value ? 1 : 0) : value));
}

type PgQueryable = pg.Pool | pg.PoolClient;

/**
 * Same calling convention as before the move to PostgreSQL: `const [rows] = await db.query(sql, params)`.
 * The rows array also carries `affectedRows` and `insertId`, so a write can be read either way.
 */
function makeQueryable(client: PgQueryable) {
  return {
    async query<T extends RowDataPacket[] | ResultSetHeader>(
      sql: string,
      params: unknown[] = [],
    ): Promise<[T, undefined]> {
      const result = await client.query(toPostgresPlaceholders(sql), toPostgresParams(params));
      const rows = (result?.rows ?? []) as RowDataPacket[] & Partial<ResultSetHeader>;
      const firstId = rows[0]?.id;
      Object.defineProperties(rows, {
        affectedRows: { value: result?.rowCount ?? 0, enumerable: false },
        insertId: { value: typeof firstId === "number" ? firstId : Number(firstId) || 0, enumerable: false },
      });
      return [rows as unknown as T, undefined];
    },
  };
}

function wrapPool(pool: pg.Pool) {
  return {
    ...makeQueryable(pool),
    async getConnection() {
      const client = await pool.connect();
      return {
        ...makeQueryable(client),
        async beginTransaction() {
          await client.query("BEGIN");
        },
        async commit() {
          await client.query("COMMIT");
        },
        async rollback() {
          await client.query("ROLLBACK");
        },
        release() {
          client.release();
        },
      };
    },
  };
}

export type Database = ReturnType<typeof wrapPool>;
const transactionScope = new AsyncLocalStorage<{ country: CountryCode; database: Database; offline: boolean }>();

export function isOfflineSyncTransaction() {
  return transactionScope.getStore()?.offline === true;
}

/** Reuse the normal validated mutation handlers inside one idempotent sync transaction. */
export async function inOfflineTransaction<T>(country: CountryCode, run: () => Promise<T>): Promise<T> {
  const db = getCountryDatabase(country);
  const connection = await db.getConnection();
  let started = false;
  try {
    await connection.beginTransaction();
    started = true;
    // Rows the handlers change are locked with SELECT ... FOR UPDATE. READ COMMITTED matches how
    // MySQL treated those locking reads, without PostgreSQL's REPEATABLE READ aborting the whole
    // sync with a serialization error when a colleague edited the same patient a moment earlier.
    await connection.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
    const scoped: Database = {
      query: connection.query,
      getConnection: async () => { throw new Error("Nested offline transactions are not supported."); },
    };
    const result = await transactionScope.run({ country, database: scoped, offline: true }, run);
    await connection.commit();
    return result;
  } catch (error) {
    if (started) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function poolFor(key: string, settings: ConnectionSettings, label: string) {
  const pools = (globalWithDatabase.databasePools ??= new Map());
  let pool = pools.get(key);
  if (!pool) {
    pool = createPool(settings, label);
    pools.set(key, pool);
  }
  return pool;
}

/** Non-personal shared data only: rate limits, settings and the institute directory. */
export function getControlDatabase(): Database {
  const settings = controlSettings();
  if (!isComplete(settings)) {
    throw new Error("Configure the control database using DATABASE_URL or DB_HOST, DB_USER and DB_NAME.");
  }
  return wrapPool(poolFor("control", settings, "the control database"));
}

/**
 * The database holding one country's personal data. Pools are cached per country and never share
 * credentials, so a query for one country cannot reach another country's tables.
 */
export function getCountryDatabase(country: CountryCode): Database {
  const scoped = transactionScope.getStore();
  if (scoped?.country === country) return scoped.database;
  const settings = resolveCountrySettings(country);
  if (!settings) {
    throw new CountryNotConfiguredError(country);
  }

  // The legacy fallback reuses the control connection, so give it the same pool.
  const isLegacy = !isComplete(countrySettings(country));
  return wrapPool(poolFor(isLegacy ? "control" : country, settings, country));
}
