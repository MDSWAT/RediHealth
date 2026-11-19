import type { CountryCode, InstituteCategory } from "@/lib/medical-institutes";

/** Who runs a place: the state (public health system) or a private company or practice. */
export type InstituteOwnership = "public" | "private";

export const INSTITUTE_OWNERSHIPS: readonly InstituteOwnership[] = ["public", "private"];

export function isInstituteOwnership(value: unknown): value is InstituteOwnership {
  return value === "public" || value === "private";
}

/**
 * The directory has no ownership field (OpenStreetMap rarely records one), so it is read from the
 * place's name, type and country. Names are a strong signal in every country we cover: state
 * hospitals and clinics carry their administrative form ("Spitalul Județean", "Ospedale", "Dom
 * zdravlja", "Qendra Shëndetësore"), and private ones carry a brand or a company form (MedLife,
 * "Casa di cura", "d.o.o.", "SRL").
 *
 * When the name says nothing, a type default applies only where one side is overwhelmingly true:
 * hospitals are public, pharmacies and dentists are private. Family doctors and clinics stay
 * unclassified (null) unless the name decides it: most family doctors are private practices paid
 * by the state insurance, so calling them either would mislead. Unclassified places are listed
 * only when no ownership filter is set.
 */
export function classifyInstituteOwnership(
  name: string,
  category: InstituteCategory,
  country: CountryCode,
): InstituteOwnership | null {
  const text = normalize(name);

  if (PRIVATE_ANY.some((re) => re.test(text))) return "private";
  if ((PRIVATE_BY_COUNTRY[country] ?? []).some((re) => re.test(text))) return "private";
  if (PUBLIC_ANY.some((re) => re.test(text))) return "public";

  switch (category) {
    case "hospital":
      // An English "Hospital" in a Romanian, Croatian or Albanian name is a private brand ("Monza
      // Metropolitan Hospital", "AIS Clinics & Hospital"); state hospitals use the local word. A bare
      // "Hospital" is the placeholder the import gives unnamed places, so it says nothing. Moldovan
      // names are left out: there the English word also appears on village hospitals.
      if (ENGLISH_BRAND_COUNTRIES.has(country) && text !== "hospital" && /\bhospital\b/.test(text)) {
        return "private";
      }
      return "public";
    case "pharmacy":
    case "dentist":
      return "private";
    default:
      return null;
  }
}

const ENGLISH_BRAND_COUNTRIES = new Set<CountryCode>(["RO", "HR", "AL"]);

/** Lower case, without diacritics, so "Orășenesc", "Orăşenesc" and "Orasenesc" match alike. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ıİ]/g, "i")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Company forms and private networks; checked first, so "Regina Maria Policlinica" is private. */
const PRIVATE_ANY: RegExp[] = [
  // Company forms: SRL (RO, MD, IT), S.p.A. (IT), d.o.o. (HR), sh.p.k. (AL), ÎCS (MD).
  /\bs\.?\s?r\.?\s?l\b/,
  /\bs\.?\s?p\.?\s?a\.?(?=\s|$)/,
  /\bd\.\s?o\.\s?o\b|\bdoo\b/,
  /\bsh\.?\s?p\.?\s?k\b/,
  /\bics\b/,
  // Private networks and brands across RO and MD (medical, labs, imaging).
  /\b(medlife|regina maria|sanador|medicover|synevo|synlab|bioclinica|affidea|ponderas|hiperdia|medsana|euroclinic|polisano|gral medical|provita|neolife|ais clinics|hello clinic|centrul medical unirea|puls medica|enayati|delta hospital|memorial hospital|monza)\b/,
  /\bprivate care\b|\bclinica privata\b|\bprivatna\b|\bprivat(e)?\b/,
  // Italy: private hospitals, medical centres and dental studios. A "studio medico" is left out:
  // it is usually a family doctor's surgery paid by the national health service.
  /\bcasa di cura\b|\bstudio (dentistico|odontoiatrico)\b|\bcentro medico\b|\bhumanitas\b|\bgruppo san donato\b/,
  // Albania: private hospital groups.
  /\b(spitali amerikan|spitali gjerman|hygeia|spitali salus)\b/,
];

const PRIVATE_BY_COUNTRY: Partial<Record<CountryCode, RegExp[]>> = {
  // In Croatia a "poliklinika" or "specijalistička ordinacija" is a private practice; the public
  // network is "dom zdravlja" and the hospitals.
  HR: [/\bpoliklinika\b/, /\bspecijalisticka ordinacija\b/],
};

/** Administrative names of state hospitals, clinics, emergency services and city pharmacies. */
const PUBLIC_ANY: RegExp[] = [
  // Romania and Moldova.
  /\bspital(ul)? (clinic|judetean|municipal|orasenesc|raional|de urgenta|universitar|de pneumoftiziologie|de psihiatrie|de boli|militar|cfr)\b/,
  /\bspitalul (nr\.?|de )/,
  /\bdispensar(ul)?\b/,
  /\bcentrul de sanatate\b/,
  /\bambulatori(ul|u)? (de specialitate|integrat|clinic)\b/,
  /\bambulanta\b|\bserviciul (judetean|de ambulanta)\b|\bsmurd\b/,
  /\bunitatea de primiri urgente\b|\bprimiri urgente\b|\bupu\b/,
  /\bpoliclinica (municipala|de copii|cu plata|orasului|judeteana)\b/,
  /\bsanatoriul\b|\bpreventoriul\b/,
  /\binstitutul (national|oncologic|clinic|regional|de )/,
  /\bimsp\b|\bcentrul medicilor de familie\b|\bcmf\b/,
  /\b(directia|centrul) de sanatate publica\b|\bdsp\b/,
  // Italy.
  /\bospedale\b|\bpresidio ospedaliero\b|\bazienda (ospedaliera|sanitaria|usl|ulss)\b/,
  /\b(asl|ausl|asst|asp|ulss|ats)\b/,
  /\bcasa (della salute|di comunita)\b|\bguardia medica\b|\bcontinuita assistenziale\b|\bconsultorio\b/,
  /\bfarmaci[ae] comunal[ei]\b/,
  /\bpoliclinico (universitario|umberto|di )/,
  // Croatia.
  /\b(opca|zupanijska|klinicka|specijalna) bolnica\b|\bklinicki bolnicki centar\b|\bkbc\b/,
  /\bdom zdravlja\b|\bzavod za (hitnu medicinu|javno zdravstvo)\b|\bhitna pomoc\b/,
  /\bgradska ljekarna\b|\bljekarne (grada|.*zupanije)\b/,
  // Albania.
  /\bspitali (rajonal|bashkiak|universitar|i qarkut|psikiatrik|ushtarak)\b|\bqsut\b/,
  /\bqendra shendetesore\b|\bpoliklinika e (specialiteteve|qytetit)\b/,
];
