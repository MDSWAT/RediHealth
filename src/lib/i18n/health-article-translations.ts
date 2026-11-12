import type { Lang } from "./translations";
import type { HealthContentLang } from "./health-content-language";

type ArticleCopy = {
  title: string; intro: string; search: string; category: string; all: string; read: string; examples: string;
  exampleNote: string; contents: string; questions: string; back: string; inCategory: string; sources: string;
  authorship: string; review: string; sourceLanguage: string; related: string; empty: string; clear: string;
  showMore: string; showLess: string; count: (n: number) => string; coverage: (ready: number, total: number) => string;
};
const translatedCopy: Record<HealthContentLang, ArticleCopy> = {
  en: {
    title: "Detailed health articles", intro: "Explore individual conditions, tests, treatments and health questions, with everyday examples and questions for your healthcare team.",
    search: "Search articles", category: "Topic area", all: "All topic areas", read: "Read the article", examples: "Practical examples", exampleNote: "These hypothetical situations illustrate decisions and questions. They do not predict a diagnosis or treatment result.",
    contents: "On this page", questions: "Questions to ask your healthcare team", back: "All health articles", inCategory: "Articles in this topic area", sources: "Sources and further reading",
    authorship: "Original RediHealth educational article. The examples are hypothetical. This is not a reproduction of an IQWiG article or an endorsement by IQWiG.",
    review: "Editorial draft: independent clinical and language review is pending. This information cannot diagnose symptoms or replace individual medical advice.",
    sourceLanguage: "The source material is in English. Information about German healthcare services may not apply in other countries.", related: "More articles in this topic area", empty: "No available articles match your search. More topics are being prepared.", clear: "Clear search and filters", showMore: "Show more articles", showLess: "Show fewer articles", count: n => `${n} ${n === 1 ? "article" : "articles"}`, coverage: (ready, total) => `${ready} of ${total} indexed topics are available as detailed articles. The rest are being prepared.`,
  },
  ro: {
    title: "Articole detaliate despre sănătate", intro: "Explorează afecțiuni, analize, tratamente și întrebări despre sănătate, cu exemple din viața de zi cu zi și întrebări pentru echipa medicală.",
    search: "Caută articole", category: "Domeniu", all: "Toate domeniile", read: "Citește articolul", examples: "Exemple practice", exampleNote: "Aceste situații ipotetice ilustrează decizii și întrebări. Nu prezic un diagnostic sau rezultatul unui tratament.",
    contents: "În acest articol", questions: "Întrebări pentru echipa medicală", back: "Toate articolele de sănătate", inCategory: "Articole din acest domeniu", sources: "Surse și lecturi suplimentare",
    authorship: "Articol educațional original RediHealth. Exemplele sunt ipotetice. Nu este o reproducere a unui articol IQWiG și nu este aprobat de IQWiG.",
    review: "Versiune editorială preliminară: verificarea clinică și lingvistică independentă este în așteptare. Informațiile nu pot stabili un diagnostic și nu înlocuiesc sfatul medical individual.",
    sourceLanguage: "Materialele sursă sunt în engleză. Informațiile despre serviciile medicale din Germania pot să nu se aplice în alte țări.", related: "Alte articole din acest domeniu", empty: "Niciun articol disponibil nu corespunde căutării. Alte subiecte sunt în pregătire.", clear: "Șterge căutarea și filtrele", showMore: "Arată mai multe articole", showLess: "Arată mai puține articole", count: n => `${n} ${n === 1 ? "articol" : "articole"}`, coverage: (ready, total) => `${ready} din cele ${total} de subiecte indexate au articole detaliate disponibile. Restul sunt în pregătire.`,
  },
  sq: {
    title: "Artikuj të hollësishëm për shëndetin", intro: "Eksploro sëmundje, analiza, trajtime dhe pyetje shëndetësore, me shembuj të përditshëm dhe pyetje për ekipin shëndetësor.",
    search: "Kërko artikuj", category: "Fusha", all: "Të gjitha fushat", read: "Lexo artikullin", examples: "Shembuj praktikë", exampleNote: "Këto situata hipotetike ilustrojnë vendime dhe pyetje. Nuk parashikojnë diagnozë ose rezultat trajtimi.",
    contents: "Në këtë faqe", questions: "Pyetje për ekipin shëndetësor", back: "Të gjithë artikujt shëndetësorë", inCategory: "Artikuj në këtë fushë", sources: "Burimet dhe lexime të mëtejshme",
    authorship: "Artikull edukativ origjinal i RediHealth. Shembujt janë hipotetikë. Nuk është riprodhim i një artikulli të IQWiG dhe nuk është miratuar nga IQWiG.",
    review: "Draft editorial: shqyrtimi i pavarur klinik dhe gjuhësor është ende në pritje. Ky informacion nuk vendos diagnozë dhe nuk zëvendëson këshillën mjekësore individuale.",
    sourceLanguage: "Materialet burimore janë në anglisht. Informacioni për shërbimet shëndetësore gjermane mund të mos vlejë në vende të tjera.", related: "Artikuj të tjerë në këtë fushë", empty: "Asnjë artikull i disponueshëm nuk përputhet me kërkimin. Tema të tjera po përgatiten.", clear: "Pastro kërkimin dhe filtrat", showMore: "Shfaq më shumë artikuj", showLess: "Shfaq më pak artikuj", count: n => `${n} ${n === 1 ? "artikull" : "artikuj"}`, coverage: (ready, total) => `${ready} nga ${total} temat e indeksuara kanë artikuj të hollësishëm. Të tjerat po përgatiten.`,
  },
  it: {
    title: "Articoli approfonditi sulla salute", intro: "Esplora patologie, esami, trattamenti e domande sulla salute, con esempi quotidiani e domande per il team sanitario.",
    search: "Cerca articoli", category: "Argomento", all: "Tutti gli argomenti", read: "Leggi l'articolo", examples: "Esempi pratici", exampleNote: "Queste situazioni ipotetiche illustrano decisioni e domande. Non prevedono una diagnosi o il risultato di un trattamento.",
    contents: "In questa pagina", questions: "Domande da porre al team sanitario", back: "Tutti gli articoli sulla salute", inCategory: "Articoli su questo argomento", sources: "Fonti e approfondimenti",
    authorship: "Articolo educativo originale di RediHealth. Gli esempi sono ipotetici. Non è una riproduzione di un articolo IQWiG e non è approvato da IQWiG.",
    review: "Bozza editoriale: la revisione clinica e linguistica indipendente è ancora da effettuare. Queste informazioni non formulano diagnosi e non sostituiscono il consiglio medico individuale.",
    sourceLanguage: "Le fonti sono in inglese. Le informazioni sui servizi sanitari tedeschi potrebbero non essere applicabili in altri paesi.", related: "Altri articoli su questo argomento", empty: "Nessun articolo disponibile corrisponde alla ricerca. Altri argomenti sono in preparazione.", clear: "Cancella ricerca e filtri", showMore: "Mostra altri articoli", showLess: "Mostra meno articoli", count: n => `${n} ${n === 1 ? "articolo" : "articoli"}`, coverage: (ready, total) => `${ready} dei ${total} argomenti indicizzati hanno un articolo approfondito disponibile. Gli altri sono in preparazione.`,
  },
  ru: {
    title: "Подробные статьи о здоровье", intro: "Читайте об отдельных заболеваниях, обследованиях, лечении и вопросах здоровья с бытовыми примерами и вопросами для медицинских специалистов.",
    search: "Поиск статей", category: "Раздел", all: "Все разделы", read: "Читать статью", examples: "Практические примеры", exampleNote: "Эти условные ситуации иллюстрируют решения и вопросы. Они не предсказывают диагноз или результат лечения.",
    contents: "На этой странице", questions: "Вопросы медицинскому специалисту", back: "Все статьи о здоровье", inCategory: "Статьи в этом разделе", sources: "Источники и дополнительная информация",
    authorship: "Оригинальная образовательная статья RediHealth. Примеры вымышлены. Это не воспроизведение статьи IQWiG; IQWiG не одобрял этот материал.",
    review: "Редакционный черновик: независимая клиническая и языковая проверка ещё не проведена. Информация не позволяет поставить диагноз и не заменяет индивидуальную медицинскую консультацию.",
    sourceLanguage: "Источники опубликованы на английском языке. Информация о медицинских услугах Германии может быть неприменима в других странах.", related: "Другие статьи в этом разделе", empty: "Доступных статей по вашему запросу не найдено. Другие темы готовятся к публикации.", clear: "Очистить поиск и фильтры", showMore: "Показать больше статей", showLess: "Показать меньше статей", count: n => `Статей: ${n}`, coverage: (ready, total) => `Доступны подробные статьи по ${ready} из ${total} тем каталога. Остальные готовятся к публикации.`,
  },
};

const croatianCopy: ArticleCopy = {
 title: "Detaljni zdravstveni članci", intro: "Pročitajte o pojedinim stanjima, pretragama i liječenju, uz svakodnevne primjere i pitanja za zdravstveni tim.",
 search: "Pretraži članke", category: "Tematsko područje", all: "Sva područja", read: "Pročitaj članak", examples: "Praktični primjeri", exampleNote: "Ovi izmišljeni primjeri prikazuju odluke i pitanja. Ne predviđaju dijagnozu ni ishod liječenja.",
 contents: "Na ovoj stranici", questions: "Pitanja za zdravstveni tim", back: "Svi zdravstveni članci", inCategory: "Članci u ovom području", sources: "Izvori i dodatno čitanje",
 authorship: "Izvorni obrazovni članak RediHealtha. Primjeri su izmišljeni. Ovo nije preslika članka IQWiG-a ni njihova preporuka.", review: "Urednički nacrt: neovisna klinička i jezična provjera još nisu dovršene. Ove informacije ne postavljaju dijagnozu niti zamjenjuju osobni medicinski savjet.",
 sourceLanguage: "Izvorne poveznice vode na izvore na engleskom jeziku.", related: "Povezani članci", empty: "Nema članaka za ovu pretragu.", clear: "Očisti pretragu", showMore: "Prikaži više", showLess: "Prikaži manje",
 count: n => n + " članaka", coverage: (ready, total) => ready + " od " + total + " tema dostupno je na ovom jeziku. Ostale teme još se pripremaju."
};
const romaniCopy: ArticleCopy = {
 title: "Detaljime sastipnaske artikolura", intro: "Drabar vash nasvalimata, testura thaj sastjarimos, sa e diveseske primerenca thaj pushimatença vash cho sastipnasko tim.",
 search: "Rod artikolura", category: "Temako than", all: "Sa e teme", read: "Drabar o artikolo", examples: "Praktikane primerura", exampleNote: "Akala primerura si inventime vash te sikaven deciziye thaj pushimata. Na phenen i diagnoza vaj o rezultato e sastjarimasko.",
 contents: "Pe kadi patrin", questions: "Pushimata vash cho sastipnasko tim", back: "Sa e sastipnaske artikolura", inCategory: "Artikolura pe kadi tema", sources: "Surse thaj aver drabarimos",
 authorship: "Originalno RediHealth artikolo vash sikljovimos. E primerura si inventime. Akava naj kopiya e IQWiG artikoloski thaj naj IQWiG rekomendacia.", review: "Redakciyako drafto: o biphanglo klinikano thaj chibako kontrolo naj agorisardo. Akala informaciye na den diagnoza thaj na len o than e personalno doktorikane sfatosko.",
 sourceLanguage: "E originalne linkura phutren surse pe anglikani chib.", related: "Pashutne artikolura", empty: "Naj artikolura vash akava rodimos.", clear: "Uzharel o rodimos", showMore: "Sikav maj but", showLess: "Sikav maj xanci",
 count: n => n + " artikolura", coverage: (ready, total) => ready + " katar " + total + " teme si gata pe kadi chib. E aver teme inke keren pes."
};
export const healthArticleCopy: Record<Lang, ArticleCopy> = {...translatedCopy, hr: croatianCopy, rom: romaniCopy};
