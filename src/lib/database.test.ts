import { afterEach, describe, expect, it, vi } from "vitest";

type FakePool = { query: ReturnType<typeof vi.fn>; connect: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn> };
const Pool = vi.hoisted(() =>
  vi.fn(function (this: unknown): FakePool {
    return { query: vi.fn(), connect: vi.fn(), on: vi.fn() };
  }),
);
vi.mock("pg", () => ({ default: { Pool, types: { setTypeParser: vi.fn(), builtins: { INT8: 20 } } } }));

import {
  CountryNotConfiguredError,
  configuredCountries,
  getCountryDatabase,
  isCountryConfigured,
  inOfflineTransaction,
  isOfflineSyncTransaction,
  isUniqueViolation,
  toPostgresPlaceholders,
} from "@/lib/database";

const envKeys = [
  "DATABASE_URL",
  "DATABASE_URL_PRODUCTION",
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "DB_CONNECTION_LIMIT",
  "DEFAULT_COUNTRY",
  "DATABASE_URL_RO",
  "DATABASE_URL_AL",
  "DATABASE_URL_IT",
  "DATABASE_URL_MD",
  "DB_MD_HOST",
  "DB_MD_USER",
  "DB_MD_NAME",
];

afterEach(() => {
  vi.unstubAllEnvs();
  Pool.mockClear();
  delete (globalThis as { databasePools?: unknown }).databasePools;
});

function clearEnv() {
  for (const key of envKeys) vi.stubEnv(key, "");
}

function usePool(pool: FakePool) {
  Pool.mockImplementationOnce(function () {
    return pool;
  });
}

describe("country databases", () => {
  it("keeps the default pool small enough to share a session pooler across app processes", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "postgres://ro:pw@db-ro:5432/redihealth_ro");
    getCountryDatabase("RO");
    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({ max: 2 }));
  });

  it("allows an explicitly budgeted pool size", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "postgres://ro:pw@db-ro:5432/redihealth_ro");
    vi.stubEnv("DB_CONNECTION_LIMIT", "4");
    getCountryDatabase("RO");
    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({ max: 4 }));
  });

  it.each(["0", "-1", "1.5", "invalid"])("rejects an invalid pool limit (%s) before connecting", (limit) => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "postgres://ro:pw@db-ro:5432/redihealth_ro");
    vi.stubEnv("DB_CONNECTION_LIMIT", limit);
    expect(() => getCountryDatabase("RO")).toThrow("DB_CONNECTION_LIMIT must be a positive integer");
    expect(Pool).not.toHaveBeenCalled();
  });

  it("uses the same connection for offline mutations and releases it after commit or rollback", async () => {
    clearEnv();
    vi.stubEnv("DB_RO_HOST", "db-ro");
    vi.stubEnv("DB_RO_USER", "test");
    vi.stubEnv("DB_RO_NAME", "test");
    const connection = { query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }), release: vi.fn() };
    const pool = { query: vi.fn(), connect: vi.fn().mockResolvedValue(connection), on: vi.fn() };
    usePool(pool);
    await inOfflineTransaction("RO", async () => {
      expect(isOfflineSyncTransaction()).toBe(true);
      await getCountryDatabase("RO").query("SELECT 1");
    });
    const statements = () => connection.query.mock.calls.map(([sql]) => sql);
    expect(connection.query).toHaveBeenCalledWith("SELECT 1", []);
    expect(statements()[0]).toBe("BEGIN");
    expect(statements()).toContain("COMMIT");
    expect(pool.query).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledTimes(1);
    expect(isOfflineSyncTransaction()).toBe(false);
    await expect(inOfflineTransaction("RO", async () => { throw new Error("conflict"); })).rejects.toThrow("conflict");
    expect(statements()).toContain("ROLLBACK");
    expect(connection.release).toHaveBeenCalledTimes(2);
  });

  it("uses REPEATABLE READ READ ONLY for offline snapshot transactions (H3)", async () => {
    clearEnv();
    vi.stubEnv("DB_RO_HOST", "db-ro");
    vi.stubEnv("DB_RO_USER", "test");
    vi.stubEnv("DB_RO_NAME", "test");
    const connection = { query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }), release: vi.fn() };
    const pool = { query: vi.fn(), connect: vi.fn().mockResolvedValue(connection), on: vi.fn() };
    usePool(pool);

    await inOfflineTransaction("RO", async () => {
      await getCountryDatabase("RO").query("SELECT 1");
    }, { readOnly: true });

    const statements = connection.query.mock.calls.map(([sql]) => sql);
    expect(statements).toContain("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    expect(statements).not.toContain("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  it("has no databases when nothing is configured", () => {
    clearEnv();
    expect(configuredCountries()).toEqual([]);
    expect(() => getCountryDatabase("RO")).toThrow(CountryNotConfiguredError);
  });

  it("gives every country its own pool and credentials", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "postgres://ro_user:ro%40pass@db-ro:5432/redihealth_ro");
    vi.stubEnv("DATABASE_URL_IT", "postgresql://it_user:it_pass@db-it:5432/redihealth_it");

    getCountryDatabase("RO");
    getCountryDatabase("IT");
    getCountryDatabase("RO");

    expect(Pool).toHaveBeenCalledTimes(2);
    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({ host: "db-ro", user: "ro_user", password: "ro@pass", database: "redihealth_ro" }),
    );
    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({ host: "db-it", user: "it_user", database: "redihealth_it" }),
    );
    expect(configuredCountries()).toEqual(["RO", "IT"]);
  });

  it("ignores a leftover mysql:// URL instead of connecting to the wrong server", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "mysql://ro:pw@db-ro:3306/redihealth_ro");
    expect(isCountryConfigured("RO")).toBe(false);
  });

  it("supports discrete per-country settings", () => {
    clearEnv();
    vi.stubEnv("DB_MD_HOST", "db-md");
    vi.stubEnv("DB_MD_USER", "md_user");
    vi.stubEnv("DB_MD_NAME", "redihealth_md");

    expect(isCountryConfigured("MD")).toBe(true);
    getCountryDatabase("MD");
    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({ host: "db-md", port: 5432, database: "redihealth_md" }));
  });

  it("lets a single-database installation keep serving its default country only", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL", "postgres://root:root@localhost:5432/redihealth");
    vi.stubEnv("DEFAULT_COUNTRY", "IT");

    expect(configuredCountries()).toEqual(["IT"]);
    expect(isCountryConfigured("RO")).toBe(false);
    expect(() => getCountryDatabase("RO")).toThrow(CountryNotConfiguredError);
  });

  it("never falls back to another country's database", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "postgres://ro:pw@db-ro:5432/redihealth_ro");

    expect(() => getCountryDatabase("AL")).toThrow(CountryNotConfiguredError);
  });
});

describe("query translation", () => {
  it("numbers ? placeholders but leaves question marks in strings, identifiers and comments alone", () => {
    expect(toPostgresPlaceholders("SELECT * FROM t WHERE a = ? AND b = ?")).toBe("SELECT * FROM t WHERE a = $1 AND b = $2");
    expect(toPostgresPlaceholders("SELECT '?', 'it''s ?', \"col?\" FROM t WHERE x = ? -- why?\nAND y = ?")).toBe(
      "SELECT '?', 'it''s ?', \"col?\" FROM t WHERE x = $1 -- why?\nAND y = $2",
    );
  });

  it("reports inserted ids and affected rows, and sends booleans as 0/1", async () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "postgres://ro:pw@db-ro:5432/redihealth_ro");
    const pool = { query: vi.fn().mockResolvedValue({ rows: [{ id: 42 }], rowCount: 1 }), connect: vi.fn(), on: vi.fn() };
    usePool(pool);

    const [result] = await getCountryDatabase("RO").query<{ insertId: number; affectedRows: number }>(
      "INSERT INTO t (a, b) VALUES (?, ?) RETURNING id",
      [true, "x"],
    );
    expect(result.insertId).toBe(42);
    expect(result.affectedRows).toBe(1);
    expect(pool.query).toHaveBeenCalledWith("INSERT INTO t (a, b) VALUES ($1, $2) RETURNING id", [1, "x"]);
  });

  it("recognises unique-index violations", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });
});
