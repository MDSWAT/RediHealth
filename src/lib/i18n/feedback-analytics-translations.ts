import type { Lang } from "@/lib/i18n/translations";

export type FeedbackAnalyticsCopy = {
  satisfactionHeading: string;
  satisfactionSubtitle: string;
  tierPositive: string;
  tierNeutral: string;
  tierNeedsAttention: string;
  tierEmpty: string;
  keywordCloudHeading: string;
  keywordCloudSubtitle: string;
  keywordCloudEmpty: string;
  keywordActiveFilter: (term: string, count: number) => string;
  keywordClear: string;
  keywordMentionsAria: (term: string, count: number, selected: boolean) => string;
  trendsHeading: string;
  trendsDailyLabel: string;
  trendsWeeklyLabel: string;
  trendsResponsesLabel: string;
  trendsAvgRatingLabel: string;
  trendsEmpty: string;
  trendsBucketSummary: (label: string, count: number, avg: string) => string;
  breakdownsHeading: string;
  byPageHeading: string;
  byLanguageHeading: string;
  responsesCountShort: (count: number) => string;
  filteredCountSummary: (shown: number, total: number) => string;
  noBreakdownData: string;
};

export const feedbackAnalyticsCopy: Record<Lang, FeedbackAnalyticsCopy> = {
  ro: {
    satisfactionHeading: "Niveluri de satisfacție",
    satisfactionSubtitle: "Distribuția răspunsurilor după media celor cinci criterii.",
    tierPositive: "Pozitiv (4.0–5.0)",
    tierNeutral: "Neutru (3.0–3.9)",
    tierNeedsAttention: "Necesită atenție (sub 3.0)",
    tierEmpty: "Nu există răspunsuri evaluate în selecția curentă.",
    keywordCloudHeading: "Teme frecvente în comentariile deschise",
    keywordCloudSubtitle: "Selectează un cuvânt cheie pentru a filtra răspunsurile de mai jos.",
    keywordCloudEmpty: "Nu există încă cuvinte cheie recurente în comentariile deschise.",
    keywordActiveFilter: (term, count) => `Filtrat după „${term}” (${count})`,
    keywordClear: "Șterge filtrul după cuvânt",
    keywordMentionsAria: (term, count, selected) =>
      selected
        ? `${term}, ${count} mențiuni, filtru activ. Apasă pentru a elimina filtrul.`
        : `${term}, ${count} mențiuni. Apasă pentru a filtra răspunsurile.`,
    trendsHeading: "Răspunsuri și scor mediu în timp",
    trendsDailyLabel: "Vedere zilnică",
    trendsWeeklyLabel: "Vedere săptămânală",
    trendsResponsesLabel: "Răspunsuri",
    trendsAvgRatingLabel: "Scor mediu",
    trendsEmpty: "Nu există încă suficiente răspunsuri pentru evoluția în timp.",
    trendsBucketSummary: (label, count, avg) => `${label}: ${count} răspunsuri, medie ${avg} / 5`,
    breakdownsHeading: "Evaluări după pagină și limbă",
    byPageHeading: "Pagini principale",
    byLanguageHeading: "După limbă",
    responsesCountShort: (count) => (count === 1 ? "1 răspuns" : `${count} răspunsuri`),
    filteredCountSummary: (shown, total) => `Se afișează ${shown} din ${total}`,
    noBreakdownData: "Nu există date pentru filtrul curent.",
  },
  en: {
    satisfactionHeading: "Satisfaction tiers",
    satisfactionSubtitle: "Share of responses grouped by five-question average score.",
    tierPositive: "Positive (4.0–5.0)",
    tierNeutral: "Neutral (3.0–3.9)",
    tierNeedsAttention: "Needs attention (under 3.0)",
    tierEmpty: "No scored responses in the current view.",
    keywordCloudHeading: "Recurring themes in open comments",
    keywordCloudSubtitle: "Select a keyword to filter matching responses below.",
    keywordCloudEmpty: "No recurring keywords found in open comments yet.",
    keywordActiveFilter: (term, count) => `Filtered by "${term}" (${count})`,
    keywordClear: "Clear keyword filter",
    keywordMentionsAria: (term, count, selected) =>
      selected
        ? `${term}, ${count} matching comments, active filter. Press to clear filter.`
        : `${term}, ${count} matching comments. Press to filter responses.`,
    trendsHeading: "Responses and average rating over time",
    trendsDailyLabel: "Daily view",
    trendsWeeklyLabel: "Weekly view",
    trendsResponsesLabel: "Responses",
    trendsAvgRatingLabel: "Average rating",
    trendsEmpty: "Not enough responses to display a timeline yet.",
    trendsBucketSummary: (label, count, avg) =>
      `${label}: ${count === 1 ? "1 response" : `${count} responses`}, average ${avg} / 5`,
    breakdownsHeading: "Ratings by page and language",
    byPageHeading: "Top pages",
    byLanguageHeading: "By language",
    responsesCountShort: (count) => (count === 1 ? "1 response" : `${count} responses`),
    filteredCountSummary: (shown, total) => `Showing ${shown} of ${total}`,
    noBreakdownData: "No data for the current filter.",
  },
  sq: {
    satisfactionHeading: "Nivelet e kënaqësisë",
    satisfactionSubtitle: "Përqindja e përgjigjeve sipas mesatares së pesë pyetjeve.",
    tierPositive: "Pozitive (4.0–5.0)",
    tierNeutral: "Neutrale (3.0–3.9)",
    tierNeedsAttention: "Kërkon vëmendje (nën 3.0)",
    tierEmpty: "Nuk ka përgjigje me vlerësim në pamjen aktuale.",
    keywordCloudHeading: "Tema të shpeshta në komentet e hapura",
    keywordCloudSubtitle: "Zgjidh një fjalë kyçe për të filtruar përgjigjet më poshtë.",
    keywordCloudEmpty: "Ende nuk ka fjalë kyçe të përsëritura në komentet e hapura.",
    keywordActiveFilter: (term, count) => `Filtruar sipas „${term}” (${count})`,
    keywordClear: "Hiq filtrin e fjalës kyçe",
    keywordMentionsAria: (term, count, selected) =>
      selected
        ? `${term}, ${count} përmendje, filtër aktiv. Shtyp për ta hequr.`
        : `${term}, ${count} përmendje. Shtyp për të filtruar përgjigjet.`,
    trendsHeading: "Përgjigjet dhe nota mesatare ndër kohë",
    trendsDailyLabel: "Pamje ditore",
    trendsWeeklyLabel: "Pamje javore",
    trendsResponsesLabel: "Përgjigje",
    trendsAvgRatingLabel: "Nota mesatare",
    trendsEmpty: "Ende nuk ka mjaftueshëm përgjigje për grafikun në kohë.",
    trendsBucketSummary: (label, count, avg) => `${label}: ${count} përgjigje, mesatarja ${avg} / 5`,
    breakdownsHeading: "Vlerësimet sipas faqes dhe gjuhës",
    byPageHeading: "Faqet kryesore",
    byLanguageHeading: "Sipas gjuhës",
    responsesCountShort: (count) => (count === 1 ? "1 përgjigje" : `${count} përgjigje`),
    filteredCountSummary: (shown, total) => `Po shfaqen ${shown} nga ${total}`,
    noBreakdownData: "Nuk ka të dhëna për filtrin aktual.",
  },
  it: {
    satisfactionHeading: "Livelli di soddisfazione",
    satisfactionSubtitle: "Quota di risposte raggruppata per media delle cinque domande.",
    tierPositive: "Positivo (4.0–5.0)",
    tierNeutral: "Neutro (3.0–3.9)",
    tierNeedsAttention: "Richiede attenzione (sotto 3.0)",
    tierEmpty: "Nessuna risposta valutata nella vista attuale.",
    keywordCloudHeading: "Temi ricorrenti nei commenti aperti",
    keywordCloudSubtitle: "Seleziona una parola chiave per filtrare le risposte qui sotto.",
    keywordCloudEmpty: "Non ci sono ancora parole chiave ricorrenti nei commenti aperti.",
    keywordActiveFilter: (term, count) => `Filtrato per "${term}" (${count})`,
    keywordClear: "Rimuovi filtro parola chiave",
    keywordMentionsAria: (term, count, selected) =>
      selected
        ? `${term}, ${count} occorrenze, filtro attivo. Premi per rimuovere il filtro.`
        : `${term}, ${count} occorrenze. Premi per filtrare le risposte.`,
    trendsHeading: "Risposte e valutazione media nel tempo",
    trendsDailyLabel: "Vista giornaliera",
    trendsWeeklyLabel: "Vista settimanale",
    trendsResponsesLabel: "Risposte",
    trendsAvgRatingLabel: "Valutazione media",
    trendsEmpty: "Non ci sono ancora abbastanza risposte per mostrare il grafico.",
    trendsBucketSummary: (label, count, avg) => `${label}: ${count} risposte, media ${avg} / 5`,
    breakdownsHeading: "Valutazioni per pagina e lingua",
    byPageHeading: "Pagine principali",
    byLanguageHeading: "Per lingua",
    responsesCountShort: (count) => (count === 1 ? "1 risposta" : `${count} risposte`),
    filteredCountSummary: (shown, total) => `Mostrate ${shown} su ${total}`,
    noBreakdownData: "Nessun dato per il filtro attuale.",
  },
  hr: {
    satisfactionHeading: "Razine zadovoljstva",
    satisfactionSubtitle: "Udio odgovora prema prosječnoj ocjeni svih pet pitanja.",
    tierPositive: "Pozitivno (4.0–5.0)",
    tierNeutral: "Neutralno (3.0–3.9)",
    tierNeedsAttention: "Traži pažnju (ispod 3.0)",
    tierEmpty: "Nema ocijenjenih odgovora u trenutnom prikazu.",
    keywordCloudHeading: "Česte teme u otvorenim komentarima",
    keywordCloudSubtitle: "Odaberi ključnu riječ za filtriranje odgovora ispod.",
    keywordCloudEmpty: "Još nema ponavljajućih ključnih riječi u otvorenim komentarima.",
    keywordActiveFilter: (term, count) => `Filtrirano prema „${term}” (${count})`,
    keywordClear: "Ukloni filtar ključne riječi",
    keywordMentionsAria: (term, count, selected) =>
      selected
        ? `${term}, ${count} spominjanja, aktivan filtar. Pritisni za uklanjanje.`
        : `${term}, ${count} spominjanja. Pritisni za filtriranje odgovora.`,
    trendsHeading: "Odgovori i prosječna ocjena kroz vrijeme",
    trendsDailyLabel: "Dnevni prikaz",
    trendsWeeklyLabel: "Tjedni prikaz",
    trendsResponsesLabel: "Odgovori",
    trendsAvgRatingLabel: "Prosječna ocjena",
    trendsEmpty: "Još nema dovoljno odgovora za vremenski prikaz.",
    trendsBucketSummary: (label, count, avg) => `${label}: ${count} odgovora, prosjek ${avg} / 5`,
    breakdownsHeading: "Ocjene po stranici i jeziku",
    byPageHeading: "Najčešće stranice",
    byLanguageHeading: "Po jeziku",
    responsesCountShort: (count) => (count === 1 ? "1 odgovor" : `${count} odgovora`),
    filteredCountSummary: (shown, total) => `Prikazano ${shown} od ${total}`,
    noBreakdownData: "Nema podataka za trenutni filtar.",
  },
  rom: {
    satisfactionHeading: "Nivelura vash zadovolipe",
    satisfactionSubtitle: "Sar si le palpale phenimata pala mashkarutni nota e pandzh phuchimatengi.",
    tierPositive: "Pozitivno (4.0–5.0)",
    tierNeutral: "Mashkarutno (3.0–3.9)",
    tierNeedsAttention: "Trubul grizha (telal 3.0)",
    tierEmpty: "Naj palpale phenimata notejenca ande akava dikhipe.",
    keywordCloudHeading: "Tema so aven butivar ande komentara",
    keywordCloudSubtitle: "Alosar ekh lav te filtres le palpale phenimata tele.",
    keywordCloudEmpty: "Inke naj lava so aven butivar ande komentara.",
    keywordActiveFilter: (term, count) => `Filtruime pala „${term}” (${count})`,
    keywordClear: "Khos o filtro e lavesko",
    keywordMentionsAria: (term, count, selected) =>
      selected
        ? `${term}, ${count} drom, filtro aktivno. Chiv te khoses o filtro.`
        : `${term}, ${count} drom. Chiv te filtres le palpale phenimata.`,
    trendsHeading: "Palpale phenimata thaj mashkarutni nota pe vrama",
    trendsDailyLabel: "Divesko dikhipe",
    trendsWeeklyLabel: "Kurkesko dikhipe",
    trendsResponsesLabel: "Palpale phenimata",
    trendsAvgRatingLabel: "Mashkarutni nota",
    trendsEmpty: "Inke naj dosta palpale phenimata vash grafiko pe vrama.",
    trendsBucketSummary: (label, count, avg) => `${label}: ${count} palpale phenimata, nota ${avg} / 5`,
    breakdownsHeading: "Note pala rig thaj chib",
    byPageHeading: "Maj labarde riga",
    byLanguageHeading: "Pala chib",
    responsesCountShort: (count) => (count === 1 ? "1 palpale phenipe" : `${count} palpale phenimata`),
    filteredCountSummary: (shown, total) => `Sikavde ${shown} andar ${total}`,
    noBreakdownData: "Naj data vash akava filtro.",
  },
  ru: {
    satisfactionHeading: "Уровни удовлетворённости",
    satisfactionSubtitle: "Доля ответов по средней оценке пяти критериев.",
    tierPositive: "Положительные (4.0–5.0)",
    tierNeutral: "Нейтральные (3.0–3.9)",
    tierNeedsAttention: "Требуют внимания (ниже 3.0)",
    tierEmpty: "В текущем выборе нет оценённых ответов.",
    keywordCloudHeading: "Частые темы в текстовых комментариях",
    keywordCloudSubtitle: "Выберите ключевое слово, чтобы отфильтровать ответы ниже.",
    keywordCloudEmpty: "В текстовых комментариях пока нет повторяющихся ключевых слов.",
    keywordActiveFilter: (term, count) => `Фильтр по слову «${term}» (${count})`,
    keywordClear: "Сбросить фильтр по слову",
    keywordMentionsAria: (term, count, selected) =>
      selected
        ? `${term}, ${count} совпадений, активный фильтр. Нажмите, чтобы сбросить.`
        : `${term}, ${count} совпадений. Нажмите, чтобы отфильтровать ответы.`,
    trendsHeading: "Ответы и средняя оценка по времени",
    trendsDailyLabel: "По дням",
    trendsWeeklyLabel: "По неделям",
    trendsResponsesLabel: "Ответы",
    trendsAvgRatingLabel: "Средняя оценка",
    trendsEmpty: "Пока недостаточно ответов для отображения динамики.",
    trendsBucketSummary: (label, count, avg) => `${label}: ${count} ответов, средняя ${avg} / 5`,
    breakdownsHeading: "Оценки по страницам и языкам",
    byPageHeading: "Популярные страницы",
    byLanguageHeading: "По языкам",
    responsesCountShort: (count) => (count === 1 ? "1 ответ" : `${count} ответов`),
    filteredCountSummary: (shown, total) => `Показано ${shown} из ${total}`,
    noBreakdownData: "Нет данных для выбранного фильтра.",
  },
};
