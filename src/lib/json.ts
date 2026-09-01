/**
 * Helpers for MySQL columns that store JSON as text. Depending on the driver and
 * column type, a value may arrive already parsed (JSON column) or as a raw string
 * (TEXT/LONGTEXT column), so both cases are handled.
 */
export function parseJsonColumn<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return null;
    }
  }
  return null;
}

export function stringifyJsonColumn(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
