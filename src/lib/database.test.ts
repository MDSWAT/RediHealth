import { afterEach, describe, expect, it, vi } from "vitest";

const createPool = vi.hoisted(() => vi.fn(() => ({ query: vi.fn(), getConnection: vi.fn() })));
vi.mock("mysql2/promise", () => ({ default: { createPool } }));

import {
  CountryNotConfiguredError,
  configuredCountries,
  getCountryDatabase,
  isCountryConfigured,
} from "@/lib/database";

const envKeys = [
  "DATABASE_URL",
  "DATABASE_URL_PRODUCTION",
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
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
  createPool.mockClear();
  delete (globalThis as { databasePools?: unknown }).databasePools;
});

function clearEnv() {
  for (const key of envKeys) vi.stubEnv(key, "");
}

describe("country databases", () => {
  it("has no databases when nothing is configured", () => {
    clearEnv();
    expect(configuredCountries()).toEqual([]);
    expect(() => getCountryDatabase("RO")).toThrow(CountryNotConfiguredError);
  });

  it("gives every country its own pool and credentials", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "mysql://ro_user:ro%40pass@db-ro:3306/redihealth_ro");
    vi.stubEnv("DATABASE_URL_IT", "mysql://it_user:it_pass@db-it:3306/redihealth_it");

    getCountryDatabase("RO");
    getCountryDatabase("IT");
    getCountryDatabase("RO");

    expect(createPool).toHaveBeenCalledTimes(2);
    expect(createPool).toHaveBeenCalledWith(
      expect.objectContaining({ host: "db-ro", user: "ro_user", password: "ro@pass", database: "redihealth_ro" }),
    );
    expect(createPool).toHaveBeenCalledWith(
      expect.objectContaining({ host: "db-it", user: "it_user", database: "redihealth_it" }),
    );
    expect(configuredCountries()).toEqual(["RO", "IT"]);
  });

  it("supports discrete per-country settings", () => {
    clearEnv();
    vi.stubEnv("DB_MD_HOST", "db-md");
    vi.stubEnv("DB_MD_USER", "md_user");
    vi.stubEnv("DB_MD_NAME", "redihealth_md");

    expect(isCountryConfigured("MD")).toBe(true);
    getCountryDatabase("MD");
    expect(createPool).toHaveBeenCalledWith(expect.objectContaining({ host: "db-md", database: "redihealth_md" }));
  });

  it("lets a single-database installation keep serving its default country only", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL", "mysql://root:root@localhost:3306/redihealth");
    vi.stubEnv("DEFAULT_COUNTRY", "IT");

    expect(configuredCountries()).toEqual(["IT"]);
    expect(isCountryConfigured("RO")).toBe(false);
    expect(() => getCountryDatabase("RO")).toThrow(CountryNotConfiguredError);
  });

  it("never falls back to another country's database", () => {
    clearEnv();
    vi.stubEnv("DATABASE_URL_RO", "mysql://ro:pw@db-ro:3306/redihealth_ro");

    expect(() => getCountryDatabase("AL")).toThrow(CountryNotConfiguredError);
  });
});
