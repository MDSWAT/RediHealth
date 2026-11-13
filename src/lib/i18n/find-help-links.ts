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
    pharmacyFirst: "Спросите в аптеке",
    pharmacyFirstHint: "Фармацевт может проконсультировать вас бесплатно, без предварительной записи.",
    familyDoctor: "Семейный врач рядом",
    hospital: "Ближайшая больница",
    noDoctorNeeded: "Не нужен врач?",
    nearestPharmacy: "Ближайшая аптека",
    nearbyPlace: "Аптеки и врачи рядом",
  },

  ro: {
    nav: "Farmacii și clinici",
    navDescription: "Găsește un loc aproape de tine",
    heroOption: "Caut o farmacie sau un medic aproape",
    heroOptionHint: "Farmacii, cabinete și spitale pe hartă",
    pharmacyFirst: "Întreabă la farmacie",
    pharmacyFirstHint: "Farmacistul te poate sfătui gratuit, fără programare.",
    familyDoctor: "Medic de familie aproape",
    hospital: "Spital aproape",
    noDoctorNeeded: "Nu ai nevoie de medic?",
    nearestPharmacy: "Farmacie aproape",
    nearbyPlace: "Farmacii și medici aproape",
  },
  en: {
    nav: "Pharmacies and clinics",
    navDescription: "Find a place near you",
    heroOption: "I need a pharmacy or doctor nearby",
    heroOptionHint: "Pharmacies, practices and hospitals on a map",
    pharmacyFirst: "Ask a pharmacist first",
    pharmacyFirstHint: "A pharmacist can advise you for free, without an appointment.",
    familyDoctor: "Family doctor nearby",
    hospital: "Nearest hospital",
    noDoctorNeeded: "Don't need a doctor?",
    nearestPharmacy: "Nearest pharmacy",
    nearbyPlace: "Pharmacies and doctors",
  },
  sq: {
    nav: "Farmaci dhe klinika",
    navDescription: "Gjej një vend pranë teje",
    heroOption: "Kërkoj një farmaci ose mjek afër",
    heroOptionHint: "Farmaci, ambulanca dhe spitale në hartë",
    pharmacyFirst: "Pyet në farmaci",
    pharmacyFirstHint: "Farmacisti mund të të këshillojë falas, pa takim.",
    familyDoctor: "Mjek familjeje afër",
    hospital: "Spitali më afër",
    noDoctorNeeded: "Nuk ke nevojë për mjek?",
    nearestPharmacy: "Farmacia më afër",
    nearbyPlace: "Farmaci dhe mjekë afër",
  },
  it: {
    nav: "Farmacie e ambulatori",
    navDescription: "Trova un posto vicino a te",
    heroOption: "Cerco una farmacia o un medico vicino",
    heroOptionHint: "Farmacie, ambulatori e ospedali sulla mappa",
    pharmacyFirst: "Chiedi in farmacia",
    pharmacyFirstHint: "Il farmacista può consigliarti gratis, senza appuntamento.",
    familyDoctor: "Medico di base vicino",
    hospital: "Ospedale più vicino",
    noDoctorNeeded: "Non ti serve un medico?",
    nearestPharmacy: "Farmacia più vicina",
    nearbyPlace: "Farmacie e medici vicini",
  },
  hr: {
    nav: "Ljekarne i klinike",
    navDescription: "Pronađi mjesto u blizini",
    heroOption: "Trebam ljekarnu ili liječnika u blizini",
    heroOptionHint: "Ljekarne, ordinacije i bolnice na karti",
    pharmacyFirst: "Pitaj u ljekarni",
    pharmacyFirstHint: "Ljekarnik te može besplatno savjetovati, bez naručivanja.",
    familyDoctor: "Obiteljski liječnik blizu",
    hospital: "Najbliža bolnica",
    noDoctorNeeded: "Ne trebaš liječnika?",
    nearestPharmacy: "Najbliža ljekarna",
    nearbyPlace: "Ljekarne i liječnici blizu",
  },
  rom: {
    nav: "Farmaciye thaj klinike",
    navDescription: "Arakh jekh than pashe tuke",
    heroOption: "Rodav jekh farmaciya vaj doktori pashe",
    heroOptionHint: "Farmaciye, kabinetya thaj spitale pe mapa",
    pharmacyFirst: "Puch andi farmaciya",
    pharmacyFirstHint: "O farmacisto shay del tut sfato bi lovengo, bi programariyako.",
    familyDoctor: "Familiyako doktori pashe",
    hospital: "Spitalo maj pashe",
    noDoctorNeeded: "Na trebul tuke doktori?",
    nearestPharmacy: "Farmaciya maj pashe",
    nearbyPlace: "Farmaciye thaj doktora",
  },
};

export function findHelpLinks(lang: Lang): FindHelpLinkCopy {
  return FIND_HELP_LINKS[lang] ?? FIND_HELP_LINKS.ro;
}

/** Path to the map, optionally opened on one kind of place. Prefix it with the language as usual. */
export function findHelpHref(category?: InstituteCategory): string {
  return category ? `/find-help?category=${category}` : "/find-help";
}
