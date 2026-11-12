import type { Lang } from "./translations";
import type { HealthContentLang } from "./health-content-language";

type SummaryPageCopy = {
  back: string; overview: string; questions: string; sourceHeading: string; sourceText: string;
  sourceLink: string; authorship: string; related: string; read: string;
};

const translatedCopy: Record<HealthContentLang, SummaryPageCopy> = {
  en: {
    back: "All health topics", overview: "Understanding this topic", questions: "Questions to discuss with your healthcare team",
    sourceHeading: "Source and further reading", sourceText: "Explore the original topic area and its articles on InformedHealth.org, published by IQWiG in Germany. The linked material is in English; information about services in Germany may not apply elsewhere.",
    sourceLink: "Read the source on InformedHealth.org", authorship: "This is an independently written RediHealth educational overview, not a reproduction or translation of an IQWiG article. It has not been reviewed or endorsed by IQWiG.",
    related: "More summaries in this topic group", read: "Read the summary",
  },
  ro: {
    back: "Toate subiectele de sănătate", overview: "Înțelege acest subiect", questions: "Întrebări pentru echipa medicală",
    sourceHeading: "Sursa și lecturi suplimentare", sourceText: "Explorează domeniul original și articolele sale pe InformedHealth.org, publicat de IQWiG din Germania. Materialele din link sunt în engleză; informațiile despre serviciile din Germania pot să nu se aplice în alte țări.",
    sourceLink: "Citește sursa pe InformedHealth.org", authorship: "Acesta este un rezumat educațional scris independent de RediHealth, nu o reproducere sau traducere a unui articol IQWiG. Nu a fost verificat sau aprobat de IQWiG.",
    related: "Alte rezumate din acest grup de subiecte", read: "Citește rezumatul",
  },
  sq: {
    back: "Të gjitha temat shëndetësore", overview: "Kupto këtë temë", questions: "Pyetje për ekipin tënd shëndetësor",
    sourceHeading: "Burimi dhe lexime të mëtejshme", sourceText: "Eksploro temën origjinale dhe artikujt e saj në InformedHealth.org, botuar nga IQWiG në Gjermani. Materiali i lidhur është në anglisht; informacionet për shërbimet në Gjermani mund të mos vlejnë në vende të tjera.",
    sourceLink: "Lexo burimin në InformedHealth.org", authorship: "Kjo është një përmbledhje edukative e shkruar në mënyrë të pavarur nga RediHealth, jo një riprodhim ose përkthim i një artikulli të IQWiG. Nuk është shqyrtuar ose miratuar nga IQWiG.",
    related: "Përmbledhje të tjera në këtë grup temash", read: "Lexo përmbledhjen",
  },
  it: {
    back: "Tutti gli argomenti sulla salute", overview: "Comprendere questo argomento", questions: "Domande da discutere con il team sanitario",
    sourceHeading: "Fonte e approfondimenti", sourceText: "Esplora l'argomento originale e i suoi articoli su InformedHealth.org, pubblicato da IQWiG in Germania. Il materiale collegato è in inglese; le informazioni sui servizi in Germania potrebbero non valere in altri paesi.",
    sourceLink: "Leggi la fonte su InformedHealth.org", authorship: "Questa panoramica educativa è stata scritta autonomamente da RediHealth. Non è una riproduzione o traduzione di un articolo IQWiG e non è stata revisionata o approvata da IQWiG.",
    related: "Altre sintesi in questo gruppo di argomenti", read: "Leggi la sintesi",
  },
  ru: {
    back: "Все темы о здоровье", overview: "Об этой теме", questions: "Вопросы для обсуждения с медицинской командой",
    sourceHeading: "Источник и дополнительная информация", sourceText: "Откройте исходную тему и её статьи на InformedHealth.org, публикуемом IQWiG в Германии. Материалы по ссылке — на английском; сведения об услугах в Германии могут не относиться к другим странам.",
    sourceLink: "Прочитать источник на InformedHealth.org", authorship: "Этот образовательный обзор самостоятельно написан RediHealth. Это не копия и не перевод статьи IQWiG. Он не проверен и не одобрен IQWiG.",
    related: "Другие обзоры в этой группе тем", read: "Прочитать обзор",
  },
};

// New site languages use clearly identified English library content until translated.
export const healthSummaryCopy: Record<Lang, SummaryPageCopy> = {...translatedCopy, hr: translatedCopy.en, rom: translatedCopy.en};
