import type { Lang } from "@/lib/i18n/translations";

/**
 * Copy for the "Learn and test yourself" hub: its title, lead and the names of its four tabs.
 * It lives in a plain module so Server Components can link to a tab by its own name.
 */
export const HEALTH_HUB_EXPLORER_COPY: Record<
  Lang,
  {
    exploreAria: string;
    onThisPage: string;
    guides: string;
    articles: string;
    topics: string;
    myths: string;
    dictionary: string;
    title: string;
    subtitle: string;
  }
> = {
  ro: {
    exploreAria: "Secțiunile paginii Învață și testează-te",
    onThisPage: "Alege o secțiune",
    guides: "Ghiduri și instrumente",
    articles: "Articole",
    topics: "Toate temele",
    myths: "Adevărat sau fals",
    dictionary: "Dicționar medical",
    title: "Învață și testează-te",
    subtitle:
      "Ghiduri clare cu exerciții interactive pentru tensiune, glicemie, sare, respirație și controale, plus întrebări adevărat sau fals și dicționar medical.",
  },
  en: {
    exploreAria: "Learn and test yourself sections",
    onThisPage: "Choose a section",
    guides: "Guides and tools",
    articles: "Articles",
    topics: "All topics",
    myths: "True or false",
    dictionary: "Medical dictionary",
    title: "Learn and test yourself",
    subtitle:
      "Plain guides with interactive checks for blood pressure, blood sugar, salt, breathing, and screening, plus true or false questions and a medical dictionary.",
  },
  sq: {
    exploreAria: "Seksionet Mëso dhe testo veten",
    onThisPage: "Zgjidh një seksion",
    guides: "Udhëzues dhe mjete",
    articles: "Artikuj",
    topics: "Të gjitha temat",
    myths: "E vërtetë apo e rreme",
    dictionary: "Fjalori mjekësor",
    title: "Mëso dhe testo veten",
    subtitle:
      "Udhëzues të qartë me kontrolle praktike për tensionin, gliceminë, kripën, frymëmarrjen dhe analizat, plus pyetje e vërtetë apo e rreme dhe fjalor mjekësor.",
  },
  it: {
    exploreAria: "Sezioni Impara e mettiti alla prova",
    onThisPage: "Scegli una sezione",
    guides: "Guide e strumenti",
    articles: "Articoli",
    topics: "Tutti i temi",
    myths: "Vero o falso",
    dictionary: "Dizionario medico",
    title: "Impara e mettiti alla prova",
    subtitle:
      "Guide chiare con strumenti pratici per pressione, glicemia, sale, respirazione e controlli, più domande vero o falso e dizionario medico.",
  },
  hr: {
    exploreAria: "Odjeljci Uči i testiraj se",
    onThisPage: "Odaberi odjeljak",
    guides: "Vodiči i alati",
    articles: "Članci",
    topics: "Sve teme",
    myths: "Točno ili netočno",
    dictionary: "Medicinski rječnik",
    title: "Uči i testiraj se",
    subtitle:
      "Jasni vodiči s praktičnim provjerama za tlak, šećer, sol, disanje i preglede, te pitanja točno ili netočno i medicinski rječnik.",
  },
  rom: {
    exploreAria: "Sekciye Sikljov thaj proba tu",
    onThisPage: "Alosar jekh sekciya",
    guides: "Droma thaj instrumentura",
    articles: "Artikolura",
    topics: "Sa e teme",
    myths: "Čačes vaj na",
    dictionary: "Doktorengo lavustik",
    title: "Sikljov thaj proba tu",
    subtitle:
      "Lokhe droma praktikane dikhimasa vaš o presia, guglimo, lon, phurdipen thaj kontrole, plus čačes vaj na pučimata thaj doktorengo lavustik.",
  },
  ru: {
    exploreAria: "Разделы Учись и проверяй себя",
    onThisPage: "Выберите раздел",
    guides: "Памятки и тесты",
    articles: "Статьи",
    topics: "Все темы",
    myths: "Правда или ложь",
    dictionary: "Медицинский словарь",
    title: "Учись и проверяй себя",
    subtitle:
      "Понятные памятки с практическими проверками давления, сахара, соли, дыхания и обследований, а также вопросы правда или ложь и медицинский словарь.",
  },
};
