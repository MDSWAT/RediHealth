"use client";

import { useState } from "react";
import { PanelLink as Link, usePanelRuntime } from "@/components/panel/PanelRuntime";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

type CaseSeedText = Record<string, { age: string; lastVisited: string; nextAction: string; notes: string }>;

const casesCopy = {
  ru: {
    backToMediator: "Назад к полевой работе",
    title: "Отслеженные дела",
    subtitle: "Пациенты, которых вы сопровождаете в полевых условиях.",
    demoNotice: "Демонстрационные дела для предпросмотра.",
    searchPlaceholder: "Поиск по имени или населённому пункту",
    all: (n: number) => `Все (${n})`,
    mothers: "Матери и младенцы",
    chronic: "Хронические болезни",
    noDocuments: "Без документов или CNAS",
    postOp: "После операции",
    urgency: { Scăzut: "Низкий", Moderat: "Умеренный", Urgent: "Срочно" },
    lastVisit: "Последний визит:",
    nextStep: "Следующий шаг:",
    notes: "Заметки:",
    openFile: "Открыть детали",
    hideFile: "Скрыть детали",
    openPatients: "Открыть пациентов",
    emptyLiveTitle: "Пока нет отслеживаемых дел",
    emptyLiveBody: "Зарегистрируйте визит на дом в полевой панели или откройте список пациентов.",
    emptyFilter: "По этому фильтру дел не найдено.",
    seed: {
      "case-1": { age: "26 лет", lastVisited: "3 дня назад", nextAction: "УЗИ третьего триместра: 15 ноября", notes: "Беременность проходит нормально, АД 115/75 мм рт. ст." },
      "case-2": { age: "71 год", lastVisited: "вчера", nextAction: "Ежедневная проверка сахара и рецепт на инсулин", notes: "Уровень сахара сильно колеблется. Нужна помощь с приёмом лечения." },
      "case-3": { age: "58 лет", lastVisited: "5 дней назад", nextAction: "Подать заявление на удостоверение личности", notes: "Без удостоверения личности 4 года. Справки ЗАГС собраны." },
      "case-4": { age: "63 года", lastVisited: "4 дня назад", nextAction: "Снятие швов и осмотр раны: 12 ноября", notes: "Операция паховой грыжи. Рана чистая, выделений нет." },
      "case-5": { age: "9 месяцев", lastVisited: "2 недели назад", nextAction: "Прививка КПК у семейного врача: 20 ноября", notes: "Вес набирает нормально. Прививки по графику." },
    } as CaseSeedText,
  },
  ro: {
    backToMediator: "Înapoi la activitatea în teren",
    title: "Cazuri urmărite",
    subtitle: "Persoanele pe care le urmărești în teren.",
    demoNotice: "Cazuri demonstrative pentru previzualizare.",
    searchPlaceholder: "Caută după nume sau sat",
    all: (n: number) => `Toate (${n})`,
    mothers: "Mame și sugari",
    chronic: "Boli cronice",
    noDocuments: "Fără acte sau CNAS",
    postOp: "După operație",
    urgency: { Scăzut: "Scăzut", Moderat: "Moderat", Urgent: "Urgent" },
    lastVisit: "Ultima vizită:",
    nextStep: "Următorul pas:",
    notes: "Note:",
    openFile: "Vezi detalii",
    hideFile: "Ascunde detalii",
    openPatients: "Deschide pacienții",
    emptyLiveTitle: "Niciun caz comunitar urmărit încă",
    emptyLiveBody: "Înregistrează o vizită la domiciliu din pagina de teren sau deschide lista de pacienți.",
    emptyFilter: "Niciun caz găsit pentru filtrul ales.",
    seed: {
      "case-1": { age: "26 ani", lastVisited: "acum 3 zile", nextAction: "Ecografie în trimestrul 3: 15 noiembrie", notes: "Sarcină normală, tensiune 115/75 mmHg." },
      "case-2": { age: "71 ani", lastVisited: "ieri", nextAction: "Glicemie măsurată zilnic și rețetă de insulină", notes: "Glicemia variază mult. Are nevoie de ajutor să ia tratamentul." },
      "case-3": { age: "58 ani", lastVisited: "acum 5 zile", nextAction: "Cerere de buletin la evidența populației", notes: "Fără buletin de 4 ani. Actele de stare civilă sunt strânse." },
      "case-4": { age: "63 ani", lastVisited: "acum 4 zile", nextAction: "Scoaterea firelor și verificarea plăgii: 12 noiembrie", notes: "Operat de hernie inghinală. Plagă curată, fără secreții." },
      "case-5": { age: "9 luni", lastVisited: "acum 2 săptămâni", nextAction: "Vaccin ROR la medicul de familie: 20 noiembrie", notes: "Crește normal în greutate. Vaccinurile sunt la zi." },
    } as CaseSeedText,
  },
  en: {
    backToMediator: "Back to field workspace",
    title: "Tracked cases",
    subtitle: "People you follow up in the field.",
    demoNotice: "Sample cases for demo preview.",
    searchPlaceholder: "Search by name or village",
    all: (n: number) => `All (${n})`,
    mothers: "Mothers and babies",
    chronic: "Chronic illness",
    noDocuments: "No ID or CNAS",
    postOp: "After surgery",
    urgency: { Scăzut: "Low", Moderat: "Moderate", Urgent: "Urgent" },
    lastVisit: "Last visit:",
    nextStep: "Next step:",
    notes: "Notes:",
    openFile: "View details",
    hideFile: "Hide details",
    openPatients: "Open patients",
    emptyLiveTitle: "No tracked community cases yet",
    emptyLiveBody: "Register a home visit from the field workspace or open the patient directory.",
    emptyFilter: "No cases match this filter.",
    seed: {
      "case-1": { age: "26 years", lastVisited: "3 days ago", nextAction: "Third-trimester ultrasound: 15 November", notes: "Normal pregnancy, blood pressure 115/75 mmHg." },
      "case-2": { age: "71 years", lastVisited: "yesterday", nextAction: "Daily blood sugar checks and insulin prescription", notes: "Blood sugar swings a lot. Needs help taking the treatment." },
      "case-3": { age: "58 years", lastVisited: "5 days ago", nextAction: "Apply for an ID card at the local registry office", notes: "No ID card for 4 years. Civil status papers are ready." },
      "case-4": { age: "63 years", lastVisited: "4 days ago", nextAction: "Stitch removal and wound check: 12 November", notes: "Inguinal hernia surgery. Wound clean, no discharge." },
      "case-5": { age: "9 months", lastVisited: "2 weeks ago", nextAction: "MMR vaccine at the family doctor: 20 November", notes: "Gaining weight normally. Vaccines up to date." },
    } as CaseSeedText,
  },
  sq: {
    backToMediator: "Kthehu te puna në terren",
    title: "Rastet që ndjek",
    subtitle: "Njerëzit që ndjek në terren.",
    demoNotice: "Raste shembull për parashikimin demo.",
    searchPlaceholder: "Kërko sipas emrit ose fshatit",
    all: (n: number) => `Të gjitha (${n})`,
    mothers: "Nëna dhe foshnja",
    chronic: "Sëmundje kronike",
    noDocuments: "Pa dokumente ose CNAS",
    postOp: "Pas operacionit",
    urgency: { Scăzut: "I ulët", Moderat: "Mesatar", Urgent: "Urgjent" },
    lastVisit: "Vizita e fundit:",
    nextStep: "Hapi tjetër:",
    notes: "Shënime:",
    openFile: "Shiko detajet",
    hideFile: "Fshih detajet",
    openPatients: "Hap pacientët",
    emptyLiveTitle: "Ende nuk ka raste të ndjekura",
    emptyLiveBody: "Regjistro një vizitë në shtëpi nga puna në terren ose hap listën e pacientëve.",
    emptyFilter: "Nuk u gjet asnjë rast për këtë filtër.",
    seed: {
      "case-1": { age: "26 vjeç", lastVisited: "3 ditë më parë", nextAction: "Ekografi në tremujorin e 3-të: 15 nëntor", notes: "Shtatzëni normale, tensioni 115/75 mmHg." },
      "case-2": { age: "71 vjeç", lastVisited: "dje", nextAction: "Matje e përditshme e sheqerit dhe recetë për insulinë", notes: "Sheqeri në gjak luhatet shumë. Ka nevojë për ndihmë me trajtimin." },
      "case-3": { age: "58 vjeç", lastVisited: "5 ditë më parë", nextAction: "Kërkesë për letërnjoftim te gjendja civile", notes: "Pa letërnjoftim prej 4 vitesh. Dokumentet e gjendjes civile janë mbledhur." },
      "case-4": { age: "63 vjeç", lastVisited: "4 ditë më parë", nextAction: "Heqja e qepjeve dhe kontrolli i plagës: 12 nëntor", notes: "Operim për hernie inguinale. Plaga e pastër, pa sekrecione." },
      "case-5": { age: "9 muaj", lastVisited: "2 javë më parë", nextAction: "Vaksina MMR te mjeku i familjes: 20 nëntor", notes: "Shton peshë normalisht. Vaksinat janë në rregull." },
    } as CaseSeedText,
  },
  it: {
    backToMediator: "Torna al lavoro sul campo",
    title: "Casi seguiti",
    subtitle: "Le persone che segui sul campo.",
    demoNotice: "Casi di esempio per l'anteprima demo.",
    searchPlaceholder: "Cerca per nome o paese",
    all: (n: number) => `Tutti (${n})`,
    mothers: "Mamme e neonati",
    chronic: "Malattie croniche",
    noDocuments: "Senza documenti o CNAS",
    postOp: "Dopo l'operazione",
    urgency: { Scăzut: "Bassa", Moderat: "Moderata", Urgent: "Urgente" },
    lastVisit: "Ultima visita:",
    nextStep: "Prossimo passo:",
    notes: "Note:",
    openFile: "Vedi dettagli",
    hideFile: "Nascondi dettagli",
    openPatients: "Apri pazienti",
    emptyLiveTitle: "Nessun caso seguito al momento",
    emptyLiveBody: "Registra una visita a domicilio dalla schermata sul campo o apri l'elenco pazienti.",
    emptyFilter: "Nessun caso trovato per questo filtro.",
    seed: {
      "case-1": { age: "26 anni", lastVisited: "3 giorni fa", nextAction: "Ecografia del terzo trimestre: 15 novembre", notes: "Gravidanza regolare, pressione 115/75 mmHg." },
      "case-2": { age: "71 anni", lastVisited: "ieri", nextAction: "Glicemia ogni giorno e ricetta per l'insulina", notes: "Glicemia molto variabile. Ha bisogno di aiuto per prendere la terapia." },
      "case-3": { age: "58 anni", lastVisited: "5 giorni fa", nextAction: "Richiesta della carta d'identità all'anagrafe", notes: "Senza carta d'identità da 4 anni. I documenti di stato civile sono pronti." },
      "case-4": { age: "63 anni", lastVisited: "4 giorni fa", nextAction: "Rimozione dei punti e controllo della ferita: 12 novembre", notes: "Operato di ernia inguinale. Ferita pulita, senza secrezioni." },
      "case-5": { age: "9 mesi", lastVisited: "2 settimane fa", nextAction: "Vaccino MPR dal medico di famiglia: 20 novembre", notes: "Cresce di peso regolarmente. Vaccinazioni in regola." },
    } as CaseSeedText,
  },
  hr: {
    backToMediator: "Natrag na terenski rad",
    title: "Praćeni slučajevi",
    subtitle: "Osobe koje pratite na terenu.",
    demoNotice: "Ogledni slučajevi za demo prikaz.",
    searchPlaceholder: "Pretraži po imenu ili naselju",
    all: (n: number) => `Svi (${n})`,
    mothers: "Majke i dojenčad",
    chronic: "Kronične bolesti",
    noDocuments: "Bez dokumenata ili HZZO-a",
    postOp: "Nakon operacije",
    urgency: { Scăzut: "Nisko", Moderat: "Umjereno", Urgent: "Hitno" },
    lastVisit: "Zadnji posjet:",
    nextStep: "Sljedeći korak:",
    notes: "Bilješke:",
    openFile: "Prikaži detalje",
    hideFile: "Sakrij detalje",
    openPatients: "Otvori pacijente",
    emptyLiveTitle: "Još nema praćenih slučajeva",
    emptyLiveBody: "Upišite kućni posjet u terenskom radnom prostoru ili otvorite popis pacijenata.",
    emptyFilter: "Nema slučajeva za odabrani filtar.",
    seed: {
      "case-1": { age: "26 god.", lastVisited: "prije 3 dana", nextAction: "Ultrazvuk u trećem tromjesečju: 15. studenoga", notes: "Uredna trudnoća, krvni tlak 115/75 mmHg." },
      "case-2": { age: "71 god.", lastVisited: "jučer", nextAction: "Svakodnevno mjerenje glukoze u krvi i recept za inzulin", notes: "Glukoza u krvi znatno oscilira. Treba pomoć pri uzimanju lijekova." },
      "case-3": { age: "58 god.", lastVisited: "prije 5 dana", nextAction: "Zahtjev za osobnu iskaznicu u matičnom uredu", notes: "Bez osobne iskaznice 4 godine. Dokumenti iz matice rođenih su prikupljeni." },
      "case-4": { age: "63 god.", lastVisited: "prije 4 dana", nextAction: "Skidanje šavova i kontrolni pregled rane: 12. studenoga", notes: "Operacija preponske kile. Rana čista, bez iscjetka." },
      "case-5": { age: "9 mjeseci", lastVisited: "prije 2 tjedna", nextAction: "Cijepljenje kod obiteljskog liječnika: 20. studenoga", notes: "Uredan prirast tjelesne mase. Cijepljenje redovito." },
    } as CaseSeedText,
  },
  rom: {
    backToMediator: "Palpale ko terensko buchi",
    title: "Dikhle kazurya",
    subtitle: "Manusha savenca phires pe tereno.",
    demoNotice: "Demo kazurya vash dikhiben.",
    searchPlaceholder: "Rod palo anav vay gav",
    all: (n: number) => `Sa (${n})`,
    mothers: "Daya thaj tikne chhavore",
    chronic: "Kronikane nasvalimata",
    noDocuments: "Bi lilengo vay siguranciyako",
    postOp: "Pali operacia",
    urgency: { Scăzut: "Lokho", Moderat: "Mashkarutno", Urgent: "Sigo" },
    lastVisit: "Palutni vizita:",
    nextStep: "Aver phiripen:",
    notes: "Noturya:",
    openFile: "Dikh detalurya",
    hideFile: "Garav detalurya",
    openPatients: "Putar pacienturen",
    emptyLiveTitle: "Nane dikhle kazurya panda",
    emptyLiveBody: "Lekhav nevi vizita khere katar o terensko buchi vay putar e lista e pacienturengi.",
    emptyFilter: "Niyekh kazo na arakhadilo pala kadava filtro.",
    seed: {
      "case-1": { age: "26 borsha", lastVisited: "3 divesa palpale", nextAction: "Ekografiya and-o trito kotor: 15 noyembro", notes: "Normalno pharipe, phurdimos e ratesko 115/75 mmHg." },
      "case-2": { age: "71 borsha", lastVisited: "icheri", nextAction: "Sakodivesko meripe vash zaharo and-o rat thaj recepta vash insulina", notes: "O zaharo and-o rat paruvdyol but. Trebul zhutipen te lel e draba." },
      "case-3": { age: "58 borsha", lastVisited: "5 divesa palpale", nextAction: "Mangipe vash buletino ko ofiso", notes: "Bi buletinesko 4 borsha. E lila si kidine." },
      "case-4": { age: "63 borsha", lastVisited: "4 divesa palpale", nextAction: "Inklavipe e thavengo thaj kontrola e ranaki: 12 noyembro", notes: "Operacia vash hernie. E rana si uzhi, bi panyesko." },
      "case-5": { age: "9 chhona", lastVisited: "2 kurke palpale", nextAction: "Vakcina ROR ko familiyako doktori: 20 noyembro", notes: "Baryol mishto. E vakcine si ko dives." },
    } as CaseSeedText,
  },
};

export interface CommunityCase {
  id: string;
  name: string;
  age: number | string;
  village: string;
  category: "mame" | "cronice" | "fara_acte" | "post_operator";
  urgency: "Scăzut" | "Moderat" | "Urgent";
  lastVisited: string;
  nextAction: string;
  notes: string;
}

const DEMO_CASES: CommunityCase[] = [
  {
    id: "case-1",
    name: "Ana Demo",
    age: "26 ani",
    village: "Sector 1",
    category: "mame",
    urgency: "Moderat",
    lastVisited: "acum 3 zile",
    nextAction: "Control ecografic trimestrul 3: 15 noiembrie",
    notes: "Sarcină în evoluție normală, tensiune 115/75 mmHg.",
  },
  {
    id: "case-2",
    name: "Dumitru Demo",
    age: "71 ani",
    village: "Sector 1",
    category: "cronice",
    urgency: "Urgent",
    lastVisited: "acum 1 zi",
    nextAction: "Monitorizare glicemie zilnică și rețetă insulină",
    notes: "Glicemie oscilantă, necesită sprijin la administrarea tratamentului.",
  },
  {
    id: "case-3",
    name: "Florica Demo",
    age: "58 ani",
    village: "Sector 2",
    category: "fara_acte",
    urgency: "Urgent",
    lastVisited: "acum 5 zile",
    nextAction: "Depunere cerere eliberare CI la evidența populației",
    notes: "Fără buletin de 4 ani. S-au adunat actele de stare civilă.",
  },
  {
    id: "case-4",
    name: "Mihai Demo",
    age: "63 ani",
    village: "Sector 3",
    category: "post_operator",
    urgency: "Moderat",
    lastVisited: "acum 4 zile",
    nextAction: "Scoatere fire sutură și evaluare plagă: 12 noiembrie",
    notes: "Intervenție hernie inghinală. Plagă curată, fără secreții.",
  },
  {
    id: "case-5",
    name: "Elena Demo",
    age: "9 luni",
    village: "Sector 1",
    category: "mame",
    urgency: "Scăzut",
    lastVisited: "acum 2 săptămâni",
    nextAction: "Vaccin ROR la cabinetul medicului de familie: 20 noiembrie",
    notes: "Dezvoltare ponderală conformă, schemă vaccinală la zi.",
  },
];

type CohortFilter = "all" | "mame" | "cronice" | "fara_acte" | "post_operator";

export function CaseTrackingMatrix({ initialCases }: { initialCases?: CommunityCase[] }) {
  const [filter, setFilter] = useState<CohortFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { lang } = useSafeLanguage();
  const { demo } = usePanelRuntime();
  const copy = casesCopy[lang] ?? casesCopy.ro;

  const isDemoPreview = !initialCases && demo;
  const sourceCases = initialCases ?? (demo ? DEMO_CASES : []);
  const localizedCases = isDemoPreview
    ? sourceCases.map((c) => ({ ...c, ...(copy.seed[c.id] ?? {}) }))
    : sourceCases;

  const filteredCases = localizedCases.filter((c) => {
    const matchesFilter = filter === "all" || c.category === filter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.village.toLowerCase().includes(query) ||
      c.notes.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const cohorts: Array<{ key: CohortFilter; label: string; count?: number }> = [
    { key: "all", label: copy.all(localizedCases.length).replace(/\s*\(\d+\)\s*$/, ""), count: localizedCases.length },
    { key: "mame", label: copy.mothers },
    { key: "cronice", label: copy.chronic },
    { key: "fara_acte", label: copy.noDocuments },
    { key: "post_operator", label: copy.postOp },
  ];

  return (
    <div className="mx-auto max-w-[1240px]">
      <Link
        href={withLangPrefix("/panel/mediator", lang)}
        className="mb-2 inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium text-sapphire hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:text-[#bad7fa] dark:focus-visible:outline-[#bad7fa]"
      >
        <ChevronLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{copy.backToMediator}</span>
      </Link>

      {/* Open-canvas header */}
      <header className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem] sm:leading-[1.2]">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--panel-muted)]">
            {isDemoPreview ? `${copy.subtitle} ${copy.demoNotice}` : copy.subtitle}
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            className="min-h-11 w-full rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]"
          />
        </div>
      </header>

      {/* Horizontal underline cohort tabs matching staff panel folders */}
      <div
        role="tablist"
        aria-label={copy.title}
        className="flex flex-nowrap gap-6 overflow-x-auto border-b border-[var(--panel-line)]"
      >
        {cohorts.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(item.key)}
              className={`relative -mb-px inline-flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 py-3 text-sm tabular-nums transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa] ${
                active
                  ? "border-sapphire font-semibold text-sapphire dark:border-[#bad7fa] dark:text-[#bad7fa]"
                  : "border-transparent font-medium text-[var(--panel-muted)] hover:text-[var(--panel-ink)]"
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="font-normal tabular-nums text-[var(--panel-muted)]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Case list or honest empty state */}
      {localizedCases.length === 0 ? (
        <div className="py-8">
          <h2 className="text-base font-semibold text-[var(--panel-ink)]">
            {copy.emptyLiveTitle}
          </h2>
          <p className="mt-1.5 max-w-[54ch] text-sm leading-relaxed text-[var(--panel-muted)]">
            {copy.emptyLiveBody}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={withLangPrefix("/panel/patients", lang)}
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#28476f] active:bg-[#101a33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]"
            >
              {copy.openPatients}
            </Link>
          </div>
        </div>
      ) : filteredCases.length === 0 ? (
        <p className="py-12 text-sm text-[var(--panel-muted)]">{copy.emptyFilter}</p>
      ) : (
        <ul className="divide-y divide-[var(--panel-line)]">
          {filteredCases.map((c) => {
            const expanded = expandedId === c.id;
            const urgencyClass =
              c.urgency === "Urgent"
                ? "font-semibold text-[#b91c1c] dark:text-[#ffb4b4]"
                : c.urgency === "Moderat"
                  ? "font-semibold text-[#9a4d0b] dark:text-[#f5c58e]"
                  : "text-[var(--panel-muted)]";

            return (
              <li key={c.id} className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                      <h2 className="text-base font-semibold text-[var(--panel-ink)]">
                        {c.name}
                      </h2>
                      <span className="text-sm text-[var(--panel-muted)]">{c.age}</span>
                      <span className={`text-sm ${urgencyClass}`}>
                        {copy.urgency[c.urgency]}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[var(--panel-muted)]">
                      {c.village}, {copy.lastVisit} {c.lastVisited}
                    </p>
                    <p className="mt-1.5 text-sm text-[var(--panel-ink)]">
                      <span className="text-[var(--panel-muted)]">{copy.nextStep} </span>
                      <span className="font-semibold text-sapphire dark:text-[#bad7fa]">
                        {c.nextAction}
                      </span>
                    </p>
                    {expanded && (
                      <div className="mt-2.5 border-t border-[var(--panel-line)] pt-2.5">
                        <p className="max-w-[70ch] text-sm text-[var(--panel-muted)]">
                          <span className="font-medium text-[var(--panel-ink)]">{copy.notes} </span>
                          {c.notes}
                        </p>
                        <div className="mt-3">
                          <Link
                            href={withLangPrefix("/panel/patients", lang)}
                            className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-semibold text-sapphire underline-offset-4 hover:underline dark:text-[#bad7fa]"
                          >
                            {copy.openPatients}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setExpandedId(expanded ? null : c.id)}
                      className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3.5 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]"
                    >
                      {expanded ? copy.hideFile : copy.openFile}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
