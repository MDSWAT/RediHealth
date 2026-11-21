/** Where Auth.js is mounted (app/api/auth/[...nextauth]) and which addresses under it it understands. */
export const AUTH_BASE_PATH = "/api/auth";

// Mirrors the action list of @auth/core (lib/utils/actions.js).
const ACTIONS = new Set(["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "webauthn-options"]);
const ACTIONS_WITH_PROVIDER = new Set(["signin", "callback", "webauthn-options"]);

/**
 * True when Auth.js can handle this path. Anything else (bots probing /api/auth/xyz, old links)
 * gets a plain 404 instead of an "UnknownAction" error in the server logs.
 */
export function isAuthActionPath(pathname: string): boolean {
  if (!pathname.startsWith(`${AUTH_BASE_PATH}/`)) return false;
  const parts = pathname.slice(AUTH_BASE_PATH.length).split("/").filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return false;
  const [action, provider] = parts;
  if (!ACTIONS.has(action)) return false;
  return provider === undefined || ACTIONS_WITH_PROVIDER.has(action);
}
