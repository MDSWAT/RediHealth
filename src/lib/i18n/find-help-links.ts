import type { Lang } from "@/lib/i18n/translations";
import type { InstituteCategory } from "@/lib/medical-institutes";

/**
 * Wording for every link into /find-help (pharmacies, clinics, family doctors, hospitals).
 * Many people go to a pharmacy before a doctor, so these links sit next to the doctor options.
 */
export type FindHelpLinkCopy = {
  nav: string;
  navDescription: string;
  heroOption: string;
  heroOptionHint: string;
  pharmacyFirst: string;
  pharmacyFirstHint: string;
  familyDoctor: string;
  hospital: string;
  noDoctorNeeded: string;
  nearestPharmacy: string;
  nearbyPlace: string;
};

export const FIND_HELP_LINKS: Record<Lang, FindHelpLinkCopy> = {
  ru: {
    nav: "Аптеки и клиники",
    navDescription: "Найдите место рядом с вами",
    heroOption: "Мне нужна аптека или врач поблизости",
    heroOptionHint: "Аптеки, кабинеты и больницы на карте",
    pharmacyFirst: "Сначала спросите у фармацевта",
    pharmacyFirstHint: "Фармацевт может проконсультировать вас бесплатно, без предварительной записи.",
    familyDoctor: "Найдите семейного врача поблизости",
    hospital: "Найти ближайшую больницу",
    noDoctorNeeded: "Не нужен врач?",
    nearestPharmacy: "Найдите ближайшую аптеку",
    nearbyPlace: "Найдите аптеку или врача поблизости",
  },

  ro: {
    nav: "Farmacii și clinici",
    navDescription: "Găsește un loc aproape de tine",
    heroOption: "Caut o farmacie sau un medic aproape",
    heroOptionHint: "Farmacii, cabinete și spitale pe hartă",
    pharmacyFirst: "Întreabă întâi la farmacie",
    pharmacyFirstHint: "Farmacistul te poate sfătui gratuit, fără programare.",
    familyDoctor: "Găsește un medic de familie aproape",
    hospital: "Găsește cel mai apropiat spital",
    noDoctorNeeded: "Nu ai nevoie de medic?",
    nearestPharmacy: "Găsește cea mai apropiată farmacie",
    nearbyPlace: "Găsește o farmacie sau un medic aproape",
  },
  en: {
    nav: "Pharmacies and clinics",
    navDescription: "Find a place near you",
    heroOption: "I need a pharmacy or doctor nearby",
    heroOptionHint: "Pharmacies, practices and hospitals on a map",
    pharmacyFirst: "Ask a pharmacist first",
    pharmacyFirstHint: "A pharmacist can advise you for free, without an appointment.",
    familyDoctor: "Find a family doctor nearby",
    hospital: "Find the nearest hospital",
    noDoctorNeeded: "Don't need a doctor?",
    nearestPharmacy: "Find the nearest pharmacy",
    nearbyPlace: "Find a pharmacy or doctor nearby",
  },
  sq: {
    nav: "Farmaci dhe klinika",
    navDescription: "Gjej një vend pranë teje",
    heroOption: "Kërkoj një farmaci ose mjek afër",
    heroOptionHint: "Farmaci, ambulanca dhe spitale në hartë",
    pharmacyFirst: "Pyet së pari në farmaci",
    pharmacyFirstHint: "Farmacisti mund të të këshillojë falas, pa takim.",
    familyDoctor: "Gjej një mjek familjeje afër",
    hospital: "Gjej spitalin më të afërt",
    noDoctorNeeded: "Nuk ke nevojë për mjek?",
    nearestPharmacy: "Gjej farmacinë më të afërt",
    nearbyPlace: "Gjej një farmaci ose mjek afër",
  },
  it: {
    nav: "Farmacie e ambulatori",
    navDescription: "Trova un posto vicino a te",
    heroOption: "Cerco una farmacia o un medico vicino",
    heroOptionHint: "Farmacie, ambulatori e ospedali sulla mappa",
    pharmacyFirst: "Chiedi prima in farmacia",
    pharmacyFirstHint: "Il farmacista può consigliarti gratis, senza appuntamento.",
    familyDoctor: "Trova un medico di base vicino",
    hospital: "Trova l'ospedale più vicino",
    noDoctorNeeded: "Non ti serve un medico?",
    nearestPharmacy: "Trova la farmacia più vicina",
    nearbyPlace: "Trova una farmacia o un medico vicino",
  },
  hr: {
    nav: "Ljekarne i klinike",
    navDescription: "Pronađi mjesto u blizini",
    heroOption: "Trebam ljekarnu ili liječnika u blizini",
    heroOptionHint: "Ljekarne, ordinacije i bolnice na karti",
    pharmacyFirst: "Prvo pitaj u ljekarni",
    pharmacyFirstHint: "Ljekarnik te može besplatno savjetovati, bez naručivanja.",
    familyDoctor: "Pronađi obiteljskog liječnika u blizini",
    hospital: "Pronađi najbližu bolnicu",
    noDoctorNeeded: "Ne trebaš liječnika?",
    nearestPharmacy: "Pronađi najbližu ljekarnu",
    nearbyPlace: "Pronađi ljekarnu ili liječnika u blizini",
  },
  rom: {
    nav: "Farmaciye thaj klinike",
    navDescription: "Arakh jekh than pashe tuke",
    heroOption: "Rodav jekh farmaciya vaj doktori pashe",
    heroOptionHint: "Farmaciye, kabinetya thaj spitale pe mapa",
    pharmacyFirst: "Puch angla kodo andi farmaciya",
    pharmacyFirstHint: "O farmacisto shay del tut sfato bi lovengo, bi programariyako.",
    familyDoctor: "Arakh jekh familiyako doktori pashe",
    hospital: "Arakh o maj pashe spitalo",
    noDoctorNeeded: "Na trebul tuke doktori?",
    nearestPharmacy: "Arakh i maj pashe farmaciya",
    nearbyPlace: "Arakh jekh farmaciya vaj doktori pashe",
  },
};

export function findHelpLinks(lang: Lang): FindHelpLinkCopy {
  return FIND_HELP_LINKS[lang] ?? FIND_HELP_LINKS.ro;
}

/** Path to the map, optionally opened on one kind of place. Prefix it with the language as usual. */
export function findHelpHref(category?: InstituteCategory): string {
  return category ? `/find-help?category=${category}` : "/find-help";
}
