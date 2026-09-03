import { Pool, type PoolClient, type QueryResultRow } from "pg";

type GlobalWithDatabase = typeof globalThis & {
  databasePool?: Pool;
};

const globalWithDatabase = globalThis as GlobalWithDatabase;

function createDatabasePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const isLocalhost =
    connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

  const useSsl =
    process.env.DATABASE_SSL === "true" ||
    (process.env.DATABASE_SSL !== "false" &&
      (connectionString.includes("supabase") ||
        (process.env.NODE_ENV === "production" && !isLocalhost)));

  return new Pool({
    connectionString,
    connectionTimeoutMillis: 5_000,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
}

/** Row shape returned by SELECT queries; kept generic like `pg`'s own row type. */
export type RowDataPacket = QueryResultRow;

/** Mirrors mysql2's ResultSetHeader so INSERT/UPDATE/DELETE call sites need no changes. */
export type ResultSetHeader = {
  affectedRows: number;
  insertId: number | string;
};

/** Converts mysql-style `?` positional placeholders into Postgres `$1, $2, ...`. */
function toPostgresParams(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

type PgQueryable = Pool | PoolClient;

/** Wraps a pg pool/client with a `query<T>()` signature matching mysql2's `[rows]` tuple result. */
function makeQueryable(client: PgQueryable) {
  return {
    async query<T extends RowDataPacket[] | ResultSetHeader>(
      sql: string,
      params: unknown[] = [],
    ): Promise<[T, undefined]> {
      const result = await client.query(toPostgresParams(sql), params);
      if (result.command === "SELECT") {
        return [result.rows as unknown as T, undefined];
      }

      const header: ResultSetHeader = {
        affectedRows: result.rowCount ?? 0,
        insertId: result.rows[0]?.id ?? 0,
      };
      return [header as unknown as T, undefined];
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

