import mysql, {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { SUPPORTED_COUNTRIES, isSupportedCountry, type CountryCode } from "@/lib/countries";
import { AsyncLocalStorage } from "node:async_hooks";

export type { ResultSetHeader, RowDataPacket };

/**
 * Two kinds of database:
 *  - the control database holds nothing personal: rate-limit counters, settings and the public
 *    medical-institute directory;
 *  - one database per country holds that country's patients, requests, staff and audit log, and is
 *    reached with its own credentials (DATABASE_URL_<CC> or DB_<CC>_*).
 *
 * Code that touches personal data must go through `getCountryDatabase(country)`; there is
 * deliberately no default, so a missing country is a compile error rather than a data leak.
 */

type GlobalWithDatabase = typeof globalThis & {
  databasePools?: Map<string, Pool>;
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

function mysqlUrl(value: string | undefined) {
  return value?.startsWith("mysql://") ? value : undefined;
}

function isComplete(settings: ConnectionSettings) {
  return Boolean(settings.connectionString || (settings.host && settings.user && settings.database));
}

function controlSettings(): ConnectionSettings {
  const isProduction = process.env.NODE_ENV === "production";
  const connectionString = isProduction
    ? mysqlUrl(process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL)
    : mysqlUrl(process.env.DATABASE_URL || process.env.DATABASE_URL_PRODUCTION);

  return {
    connectionString,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

function countrySettings(country: CountryCode): ConnectionSettings {
  return {
    connectionString: mysqlUrl(process.env[`DATABASE_URL_${country}`]),
    host: process.env[`DB_${country}_HOST`],
    port: Number(process.env[`DB_${country}_PORT`] || 3306),
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
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    connectTimeout: 10_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 30_000,
    ssl: resolveSslConfig(),
  };

  if (settings.connectionString) {
    const url = new URL(settings.connectionString);
    const database = url.pathname.replace(/^\//, "");
    if (!database) {
      throw new Error(`MySQL connection URL for ${label} must include a database name.`);
    }

    return mysql.createPool({
      ...baseConfig,
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
    });
  }

  if (!settings.host || !settings.user || !settings.database) {
    throw new Error(`Configure MySQL for ${label} using a mysql:// URL or the host, user and database settings.`);
  }

  return mysql.createPool({
    ...baseConfig,
    host: settings.host,
    port: settings.port,
    user: settings.user,
    password: settings.password,
    database: settings.database,
  });
}

type MysqlQueryable = Pool | PoolConnection;

function makeQueryable(client: MysqlQueryable) {
  return {
    async query<T extends RowDataPacket[] | ResultSetHeader>(
      sql: string,
      params: unknown[] = [],
    ): Promise<[T, undefined]> {
      const [rows] = await client.query(sql, params);
      return [rows as T, undefined];
    },
  };
}

function wrapPool(pool: Pool) {
  return {
    ...makeQueryable(pool),
    async getConnection() {
      const client = await pool.getConnection();
      return {
        ...makeQueryable(client),
        async beginTransaction() {
          await client.beginTransaction();
        },
        async commit() {
          await client.commit();
        },
        async rollback() {
          await client.rollback();
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
    await connection.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await connection.beginTransaction();
    started = true;
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
