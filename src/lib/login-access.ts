import { configuredCountries } from "@/lib/database";
import { getWorkerMemberships, hasPanelRole } from "@/lib/worker-auth";


export type LoginAccessResultReason =
  | "authorized"
  | "unauthorized"
  | "invalid-email"
  | "database-unavailable";

export type LoginAccessResult = {
  allowed: boolean;
  reason: LoginAccessResultReason;
};

export async function checkLoginAccess(
  email: string | null | undefined,
): Promise<LoginAccessResult> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return { allowed: false, reason: "invalid-email" };
  }

  if (configuredCountries().length === 0) {
    return { allowed: false, reason: "database-unavailable" };
  }

  const { memberships, lookupFailed } = await getWorkerMemberships(normalizedEmail);
  if (memberships.some(hasPanelRole)) {
    return { allowed: true, reason: "authorized" };
  }

  // A failing country database could be the one holding this account, so do not report "unauthorized".
  return { allowed: false, reason: lookupFailed ? "database-unavailable" : "unauthorized" };
}

export async function hasLoginAccess(
  email: string | null | undefined,
): Promise<boolean> {
  const result = await checkLoginAccess(email);
  return result.allowed;
}
