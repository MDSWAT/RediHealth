import { createPool, type Pool } from "mysql2/promise";

type GlobalWithDatabase = typeof globalThis & {
  databasePool?: Pool;
};

const globalWithDatabase = globalThis as GlobalWithDatabase;

function createDatabasePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const useSsl =
    process.env.DATABASE_SSL === "true" ||
    connectionString.includes("ssl=") ||
    connectionString.includes("sslmode=");

  return createPool({
    uri: connectionString,
    connectTimeout: 5_000,
    ssl: useSsl ? {} : undefined,
  });
}

export function getDatabase() {
  if (!globalWithDatabase.databasePool) {
    globalWithDatabase.databasePool = createDatabasePool();
  }

  return globalWithDatabase.databasePool;
}
