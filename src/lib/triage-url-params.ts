import { PathwayId } from "./triage-state";

export interface TriageUrlParams {
  entry?: string;
  campaign?: string;
  pathway?: PathwayId;
  lang?: string;
}

const validPathways: PathwayId[] = ["learn", "risk", "symptoms", "prescription", "navigation"];

/**
 * Parses query parameters from a URL search string or ReadonlyURLSearchParams (Change 49).
 * E.g., ?entry=qr&campaign=caravan_cluj_nov26&pathway=risk&lang=ro
 */
export function parseTriageUrlParams(searchParams: URLSearchParams | { get: (key: string) => string | null }): TriageUrlParams {
  const entry = searchParams.get("entry") || undefined;
  const campaign = searchParams.get("campaign") || undefined;
  const rawPathway = searchParams.get("pathway");
  const lang = searchParams.get("lang") || undefined;

  let pathway: PathwayId | undefined;
  if (rawPathway && validPathways.includes(rawPathway as PathwayId)) {
    pathway = rawPathway as PathwayId;
  }

  return {
    entry,
    campaign,
    pathway,
    lang,
  };
}
