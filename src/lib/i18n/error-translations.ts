import type { Lang } from "@/lib/i18n/translations";

type ErrorCopy = {
  title: string;
  body: string;
  retry: string;
  home: string;
};

export const errorTranslations: Record<Lang, ErrorCopy> = {
  en: {
    title: "Something went wrong",
    body: "We could not load this page. Please try again. If the problem continues, come back in a few minutes.",
    retry: "Try again",
    home: "Back to home",
  },
  ro: {
    title: "Ceva nu a funcționat",
    body: "Nu am putut încărca această pagină. Te rugăm să încerci din nou. Dacă problema persistă, revino peste câteva minute.",
    retry: "Încearcă din nou",
    home: "Înapoi la pagina principală",
  },
  sq: {
    title: "Diçka shkoi keq",
    body: "Nuk mundëm ta ngarkonim këtë faqe. Të lutemi provo përsëri. Nëse problemi vazhdon, kthehu pas disa minutash.",
    retry: "Provo përsëri",
    home: "Kthehu në faqen kryesore",
  },
  it: {
    title: "Qualcosa è andato storto",
    body: "Non siamo riusciti a caricare questa pagina. Riprova. Se il problema continua, torna tra qualche minuto.",
    retry: "Riprova",
    home: "Torna alla home",
  },
};
