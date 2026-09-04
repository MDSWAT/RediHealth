import mysql, {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

export type { ResultSetHeader, RowDataPacket };

type GlobalWithDatabase = typeof globalThis & {
  databasePool?: Pool;
};

const globalWithDatabase = globalThis as GlobalWithDatabase;

function resolveDatabaseConnectionString() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const url =
      process.env.DATABASE_URL_PRODUCTION ||
      process.env.DATABASE_URL;

    return url?.startsWith("mysql://") ? url : undefined;
  }

  const url =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_PRODUCTION;

  return url?.startsWith("mysql://") ? url : undefined;
}

export function hasDatabaseConnectionConfig() {
  return Boolean(
    resolveDatabaseConnectionString() ||
      (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME),
  );
}

function createDatabasePool() {
  const connectionString = resolveDatabaseConnectionString();
  const useSsl = process.env.DATABASE_SSL === "true";

  const baseConfig = {
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    connectTimeout: 5_000,
    enableKeepAlive: true,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  };

  if (connectionString) {
    const url = new URL(connectionString);
    const database = url.pathname.replace(/^\//, "");
    if (!database) {
      throw new Error("MySQL connection URL must include a database name.");
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

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error(
      "Configure MySQL using DATABASE_URL (mysql://...) or DB_HOST, DB_USER, and DB_NAME.",
    );
  }

  return mysql.createPool({
    ...baseConfig,
    host,
    port: Number(process.env.DB_PORT || 3306),
    user,
    password: process.env.DB_PASSWORD,
    database,
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

export function getDatabase() {
  if (!globalWithDatabase.databasePool) {
    globalWithDatabase.databasePool = createDatabasePool();
  }
  const pool = globalWithDatabase.databasePool;

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

