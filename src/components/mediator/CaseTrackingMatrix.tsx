"use client";

import { useState } from "react";
import { UserIcon, PinIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
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
    title: "Отслеженные дела",
    subtitle: "Люди, за которыми вы следите в полевых условиях.",
    searchPlaceholder: "Поиск по названию или деревне",
    all: (n: number) => `Все (${n})`,
    mothers: "Матери и младенцы",
    chronic: "Хроническое заболевание",
    noDocuments: "Нет удостоверения личности или CNAS",
    postOp: "После операции",
    urgency: { Scăzut: "Низкий", Moderat: "Умеренный", Urgent: "Срочно" },
    lastVisit: "Последний визит:",
    nextStep: "Следующий шаг:",
    notes: "Примечания:",
    openFile: "Посмотреть файл",
    empty: "Случаев не обнаружено.",
    seed: {
      "case-1": { age: "26 years", lastVisited: "3 days ago", nextAction: "УЗИ третьего триместра: 15 ноября.", notes: "Беременность нормальная, АД 115/75 мм рт.ст." },
      "case-2": { age: "71 years", lastVisited: "вчера", nextAction: "Ежедневная проверка уровня сахара в крови и назначение инсулина", notes: "Уровень сахара в крови сильно колеблется. Нужна помощь в лечении." },
      "case-3": { age: "58 years", lastVisited: "5 days ago", nextAction: "Подайте заявку на получение удостоверения личности в SPCLEP Tecuci", notes: "Без удостоверения личности уже 4 года. Документы гражданского состояния готовы." },
      "case-4": { age: "63 years", lastVisited: "4 days ago", nextAction: "Снятие швов и проверка раны: 12 ноября.", notes: "Операция по поводу паховой грыжи. Рана чистая, выделений нет." },
      "case-5": { age: "9 months", lastVisited: "2 weeks ago", nextAction: "Вакцина MMR у семейного врача: 20 ноября.", notes: "Набирает вес нормально. Вакцины актуальны." },
    } as CaseSeedText,
  },

  ro: {
    title: "Cazuri urmărite",
    subtitle: "Persoanele pe care le urmărești în teren.",
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
    openFile: "Vezi dosarul",
    empty: "Niciun caz găsit.",
    seed: {
      "case-1": { age: "26 ani", lastVisited: "acum 3 zile", nextAction: "Ecografie în trimestrul 3: 15 noiembrie", notes: "Sarcină normală, tensiune 115/75 mmHg." },
      "case-2": { age: "71 ani", lastVisited: "ieri", nextAction: "Glicemie măsurată zilnic și rețetă de insulină", notes: "Glicemia variază mult. Are nevoie de ajutor să ia tratamentul." },
      "case-3": { age: "58 ani", lastVisited: "acum 5 zile", nextAction: "Cerere de buletin la SPCLEP Tecuci", notes: "Fără buletin de 4 ani. Actele de stare civilă sunt strânse." },
      "case-4": { age: "63 ani", lastVisited: "acum 4 zile", nextAction: "Scoaterea firelor și verificarea plăgii: 12 noiembrie", notes: "Operat de hernie inghinală. Plagă curată, fără secreții." },
      "case-5": { age: "9 luni", lastVisited: "acum 2 săptămâni", nextAction: "Vaccin ROR la medicul de familie: 20 noiembrie", notes: "Crește normal în greutate. Vaccinurile sunt la zi." },
    } as CaseSeedText,
  },
  en: {
    title: "Tracked cases",
    subtitle: "People you follow up in the field.",
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
    openFile: "View file",
    empty: "No cases found.",
    seed: {
      "case-1": { age: "26 years", lastVisited: "3 days ago", nextAction: "Third-trimester ultrasound: 15 November", notes: "Normal pregnancy, blood pressure 115/75 mmHg." },
      "case-2": { age: "71 years", lastVisited: "yesterday", nextAction: "Daily blood sugar checks and insulin prescription", notes: "Blood sugar swings a lot. Needs help taking the treatment." },
      "case-3": { age: "58 years", lastVisited: "5 days ago", nextAction: "Apply for an ID card at SPCLEP Tecuci", notes: "No ID card for 4 years. Civil status papers are ready." },
      "case-4": { age: "63 years", lastVisited: "4 days ago", nextAction: "Stitch removal and wound check: 12 November", notes: "Inguinal hernia surgery. Wound clean, no discharge." },
      "case-5": { age: "9 months", lastVisited: "2 weeks ago", nextAction: "MMR vaccine at the family doctor: 20 November", notes: "Gaining weight normally. Vaccines up to date." },
    } as CaseSeedText,
  },
  sq: {
    title: "Rastet që ndjek",
    subtitle: "Njerëzit që ndjek në terren.",
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
    openFile: "Shiko dosjen",
    empty: "Nuk u gjet asnjë rast.",
    seed: {
      "case-1": { age: "26 vjeç", lastVisited: "3 ditë më parë", nextAction: "Ekografi në tremujorin e 3-të: 15 nëntor", notes: "Shtatzëni normale, tensioni 115/75 mmHg." },
      "case-2": { age: "71 vjeç", lastVisited: "dje", nextAction: "Matje e përditshme e sheqerit dhe recetë për insulinë", notes: "Sheqeri në gjak luhatet shumë. Ka nevojë për ndihmë me trajtimin." },
      "case-3": { age: "58 vjeç", lastVisited: "5 ditë më parë", nextAction: "Kërkesë për letërnjoftim te SPCLEP Tecuci", notes: "Pa letërnjoftim prej 4 vitesh. Dokumentet e gjendjes civile janë mbledhur." },
      "case-4": { age: "63 vjeç", lastVisited: "4 ditë më parë", nextAction: "Heqja e qepjeve dhe kontrolli i plagës: 12 nëntor", notes: "Operim për hernie inguinale. Plaga e pastër, pa sekrecione." },
      "case-5": { age: "9 muaj", lastVisited: "2 javë më parë", nextAction: "Vaksina MMR te mjeku i familjes: 20 nëntor", notes: "Shton peshë normalisht. Vaksinat janë në rregull." },
    } as CaseSeedText,
  },
  it: {
    title: "Casi seguiti",
    subtitle: "Le persone che segui sul campo.",
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
    openFile: "Apri la scheda",
    empty: "Nessun caso trovato.",
    seed: {
      "case-1": { age: "26 anni", lastVisited: "3 giorni fa", nextAction: "Ecografia del terzo trimestre: 15 novembre", notes: "Gravidanza regolare, pressione 115/75 mmHg." },
      "case-2": { age: "71 anni", lastVisited: "ieri", nextAction: "Glicemia ogni giorno e ricetta per l'insulina", notes: "Glicemia molto variabile. Ha bisogno di aiuto per prendere la terapia." },
      "case-3": { age: "58 anni", lastVisited: "5 giorni fa", nextAction: "Richiesta della carta d'identità allo SPCLEP di Tecuci", notes: "Senza carta d'identità da 4 anni. I documenti di stato civile sono pronti." },
      "case-4": { age: "63 anni", lastVisited: "4 giorni fa", nextAction: "Rimozione dei punti e controllo della ferita: 12 novembre", notes: "Operato di ernia inguinale. Ferita pulita, senza secrezioni." },
      "case-5": { age: "9 mesi", lastVisited: "2 settimane fa", nextAction: "Vaccino MPR dal medico di famiglia: 20 novembre", notes: "Cresce di peso regolarmente. Vaccinazioni in regola." },
    } as CaseSeedText,
  },
  hr: {
    title: "Praćeni slučajevi",
    subtitle: "Osobe koje pratite na terenu.",
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
    openFile: "Otvori karton pacijenta",
    empty: "Nije pronađen nijedan slučaj.",
    seed: {
      "case-1": { age: "26 god.", lastVisited: "prije 3 dana", nextAction: "Ultrazvuk u trećem tromjesečju: 15. studenoga", notes: "Uredna trudnoća, krvni tlak 115/75 mmHg." },
      "case-2": { age: "71 god.", lastVisited: "jučer", nextAction: "Svakodnevno mjerenje glukoze u krvi i recept za inzulin", notes: "Glukoza u krvi znatno oscilira. Treba pomoć pri uzimanju lijekova." },
      "case-3": { age: "58 god.", lastVisited: "prije 5 dana", nextAction: "Zahtjev za osobnu iskaznicu u matičnom uredu", notes: "Bez osobne iskaznice 4 godine. Dokumenti iz matice rođenih su prikupljeni." },
      "case-4": { age: "63 god.", lastVisited: "prije 4 dana", nextAction: "Skidanje šavova i kontrolni pregled rane: 12. studenoga", notes: "Operacija preponske kile. Rana čista, bez iscjetka." },
      "case-5": { age: "9 mjeseci", lastVisited: "prije 2 tjedna", nextAction: "Cijepljenje kod obiteljskog liječnika: 20. studenoga", notes: "Uredan prirast tjelesne mase. Cijepljenje redovito." },
    } as CaseSeedText,
  },
  rom: {
    title: "Dikhle kazurya",
    subtitle: "Manusha savenca phires pe tereno.",
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
    openFile: "Dikh o sastipnasko lil",
    empty: "Niyekh kazo na arakhadilo.",
    seed: {
      "case-1": { age: "26 borsha", lastVisited: "3 divesa palpale", nextAction: "Ekografiya and-o trito kotor: 15 noyembro", notes: "Normalno pharipe, phurdimos e ratesko 115/75 mmHg." },
      "case-2": { age: "71 borsha", lastVisited: "izdral (kal)", nextAction: "Sakodivesko meripe vash zaharo and-o rat thaj recepta vash insulina", notes: "O zaharo and-o rat paruvdyol but. Trebul zhutipen te lel e draba." },
      "case-3": { age: "58 borsha", lastVisited: "5 divesa palpale", nextAction: "Mangipe vash buletino ko ofiso Tecuci", notes: "Bi buletinesko 4 borsha. E lila si kidine." },
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

const DEFAULT_CASES: CommunityCase[] = [
  {
    id: "case-1",
    name: "Ana Măgureanu",
    age: "26 ani",
    village: "Toflea, Galați",
    category: "mame",
    urgency: "Moderat",
    lastVisited: "acum 3 zile",
    nextAction: "Control ecografic trimestrul 3: 15 noiembrie",
    notes: "Sarcină în evoluție normală, tensiune 115/75 mmHg.",
  },
  {
    id: "case-2",
    name: "Dumitru Căldăraru",
    age: "71 ani",
    village: "Toflea, Galați",
    category: "cronice",
    urgency: "Urgent",
    lastVisited: "acum 1 zi",
    nextAction: "Monitorizare glicemie zilnică și rețetă insulină",
    notes: "Glicemie oscilantă, necesită sprijin la administrarea tratamentului.",
  },
  {
    id: "case-3",
    name: "Florica Stănescu",
    age: "58 ani",
    village: "Ghidigeni, Galați",
    category: "fara_acte",
    urgency: "Urgent",
    lastVisited: "acum 5 zile",
    nextAction: "Depunere cerere eliberare CI la SPCLEP Tecuci",
    notes: "Fără buletin de 4 ani. S-au adunat actele de stare civilă.",
  },
  {
    id: "case-4",
    name: "Mihai Vasile",
    age: "63 ani",
    village: "Brăhășești, Galați",
    category: "post_operator",
    urgency: "Moderat",
    lastVisited: "acum 4 zile",
    nextAction: "Scoatere fire sutură și evaluare plagă: 12 noiembrie",
    notes: "Intervenție hernie inghinală. Plagă curată, fără secreții.",
  },
  {
    id: "case-5",
    name: "Elena Radu",
    age: "9 luni",
    village: "Toflea, Galați",
    category: "mame",
    urgency: "Scăzut",
    lastVisited: "acum 2 săptămâni",
    nextAction: "Vaccin ROR la cabinetul medicului de familie: 20 noiembrie",
    notes: "Dezvoltare ponderală conformă, schemă vaccinală la zi.",
  },
];

type CohortFilter = "all" | "mame" | "cronice" | "fara_acte" | "post_operator";

export function CaseTrackingMatrix() {
  const [filter, setFilter] = useState<CohortFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { lang } = useSafeLanguage();
  const copy = casesCopy[lang] ?? casesCopy.ro;

  // Demo seed text is shown in the active language; ids and enum values stay unchanged.
  const localizedCases = DEFAULT_CASES.map((c) => ({ ...c, ...(copy.seed[c.id] ?? {}) }));

  const filteredCases = localizedCases.filter((c) => {
    const matchesFilter = filter === "all" || c.category === filter;
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            {copy.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>

        {/* Quick Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            className="w-full min-h-[44px] rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
          />
        </div>
      </div>

      {/* Cohort Filter Tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`min-h-[44px] rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            filter === "all"
              ? "bg-sapphire text-white shadow-xs"
              : "border border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {copy.all(DEFAULT_CASES.length)}
        </button>

        <button
          type="button"
          onClick={() => setFilter("mame")}
          className={`min-h-[44px] rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            filter === "mame"
              ? "bg-sapphire text-white shadow-xs"
              : "border border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {copy.mothers}
        </button>

        <button
          type="button"
          onClick={() => setFilter("cronice")}
          className={`min-h-[44px] rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            filter === "cronice"
              ? "bg-sapphire text-white shadow-xs"
              : "border border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {copy.chronic}
        </button>

        <button
          type="button"
          onClick={() => setFilter("fara_acte")}
          className={`min-h-[44px] rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            filter === "fara_acte"
              ? "bg-sapphire text-white shadow-xs"
              : "border border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {copy.noDocuments}
        </button>

        <button
          type="button"
          onClick={() => setFilter("post_operator")}
          className={`min-h-[44px] rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            filter === "post_operator"
              ? "bg-sapphire text-white shadow-xs"
              : "border border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {copy.postOp}
        </button>
      </div>

      {/* Case list */}
      <div className="mt-5 space-y-3">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-border bg-background p-4 transition-colors duration-[var(--dur-fast)] hover:border-foreground/20"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sapphire">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {c.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({c.age})
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                        c.urgency === "Urgent"
                          ? "border-red-500/30 bg-red-500/10 text-red-600"
                          : c.urgency === "Moderat"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                          : "border-border bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {copy.urgency[c.urgency]}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <PinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{c.village} · {copy.lastVisit} {c.lastVisited}</span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-foreground">
                    {copy.nextStep} <strong className="text-sapphire dark:text-sapphire-border">{c.nextAction}</strong>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {copy.notes} {c.notes}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  type="button"
                  className="min-h-[44px] rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  {copy.openFile}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            {copy.empty}
          </div>
        )}
      </div>
    </div>
  );
}
