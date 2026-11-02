import { cookies } from "next/headers";
import { configuredCountries, defaultCountry, getCountryDatabase, type RowDataPacket } from "@/lib/database";
import { parseCountry, type CountryCode } from "@/lib/countries";

/** Remembers which country a staff member last worked in. Only a preference: access is re-checked on every request. */
export const STAFF_COUNTRY_COOKIE = "redihealth-staff-country";

export type UserWorkerContext = {
  /** Country whose database every query of this request must use. */
  country: CountryCode;
  workerId: string | null;
  workerName: string | null;
  role: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  /** True when the worker lookup itself failed (e.g. database error), as opposed to the user simply not being a worker. */
  lookupFailed: boolean;
};

export type WorkerMembership = {
  country: CountryCode;
  workerId: string;
  workerName: string;
  role: string;
};

// Roles that may open the panel. Plain "Healthcare Worker" accounts exist but cannot sign in.
const PANEL_ROLES = ["administrator", "admin", "super admin", "superadmin", "doctor", "mediator"];

export function hasPanelRole(membership: Pick<WorkerMembership, "role">) {
  return PANEL_ROLES.includes(membership.role.trim().toLowerCase());
}

type DBWorkerAuthRow = RowDataPacket & {
  id: number | string;
  full_name: string;
  role: string;
};

type LookupResult =
  | { status: "found"; membership: WorkerMembership }
  | { status: "missing" }
  | { status: "failed" };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function roleFlags(role: string) {
  const roleLower = role.trim().toLowerCase();
  const isSuperAdmin = roleLower === "super admin" || roleLower === "superadmin";
  const isAdmin = roleLower === "administrator" || roleLower === "admin";
  return { isAdmin: isAdmin || isSuperAdmin, isSuperAdmin };
}

async function lookupWorker(country: CountryCode, email: string): Promise<LookupResult> {
  try {
    const [rows] = await getCountryDatabase(country).query<DBWorkerAuthRow[]>(
      `SELECT id, full_name, COALESCE(role, 'Healthcare Worker') AS role
       FROM workers
       WHERE LOWER(email) = ? AND COALESCE(status, 'active') = 'active'
       LIMIT 1`,
      [email],
    );
    const row = rows[0];
    if (!row) return { status: "missing" };
    return {
      status: "found",
      membership: { country, workerId: String(row.id), workerName: row.full_name, role: row.role },
    };
  } catch (error) {
    console.error(`Worker lookup failed for ${country}`, error);
    return { status: "failed" };
  }
}

/** Every country in which this email is an active staff member. Each country keeps its own worker record. */
export async function getWorkerMemberships(
  email: string | null | undefined,
): Promise<{ memberships: WorkerMembership[]; lookupFailed: boolean }> {
  if (!email) return { memberships: [], lookupFailed: false };

  const normalized = normalizeEmail(email);
  const results = await Promise.all(configuredCountries().map((country) => lookupWorker(country, normalized)));

  return {
    memberships: results.flatMap((result) => (result.status === "found" ? [result.membership] : [])),
    lookupFailed: results.some((result) => result.status === "failed"),
  };
}

async function preferredCountry(): Promise<CountryCode | null> {
  try {
    return parseCountry((await cookies()).get(STAFF_COUNTRY_COOKIE)?.value);
  } catch {
    // Not inside a request (scripts, tests).
    return null;
  }
}

function contextFor(membership: WorkerMembership): UserWorkerContext {
  return {
    country: membership.country,
    workerId: membership.workerId,
    workerName: membership.workerName,
    role: membership.role,
    ...roleFlags(membership.role),
    lookupFailed: false,
  };
}

function unauthorizedContext(country: CountryCode, lookupFailed: boolean): UserWorkerContext {
  return {
    country,
    workerId: null,
    workerName: null,
    role: "Unauthorized",
    isAdmin: false,
    isSuperAdmin: false,
    lookupFailed,
  };
}

/**
 * Resolves who is acting and in which country. The country comes from the staff member's own
 * preference when they work there, otherwise the first country they belong to.
 */
export async function getUserWorkerContext(
  userEmail: string | null | undefined,
): Promise<UserWorkerContext> {
  const fallbackCountry = defaultCountry();
  if (!userEmail) return unauthorizedContext(fallbackCountry, false);

  const email = normalizeEmail(userEmail);
  const preferred = await preferredCountry();

  if (preferred && configuredCountries().includes(preferred)) {
    const result = await lookupWorker(preferred, email);
    if (result.status === "found") return contextFor(result.membership);
  }

  const { memberships, lookupFailed } = await getWorkerMemberships(email);
  if (memberships.length > 0) return contextFor(memberships.find(hasPanelRole) ?? memberships[0]);

  return unauthorizedContext(preferred ?? fallbackCountry, lookupFailed);
}
