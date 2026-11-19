import { healthArticleIndex, type HealthArticleIndexEntry } from "@/lib/data/health-article-index";
import type { Lang } from "@/lib/i18n/translations";

/**
 * The "Health topics" section of the guides page: every detailed article, grouped into a few broad
 * categories. Each category gathers several of the source's topic areas, so an article that belongs
 * to two areas can appear under two categories.
 */
export type HealthTopicCategory = {
  id: string;
  areaIds: readonly string[];
  titles: Record<Lang, string>;
};

export const HEALTH_TOPIC_CATEGORIES: readonly HealthTopicCategory[] = [
  {
    id: "heart-lungs",
    areaIds: ["heart-and-circulation", "airway-diseases", "lungs-and-airways"],
    titles: { ro: "Inimă, plămâni și respirație", en: "Heart, lungs and breathing", sq: "Zemra, mushkëritë dhe frymëmarrja", it: "Cuore, polmoni e respirazione", hr: "Srce, pluća i disanje", rom: "Ilo, buke thaj phurdipen", ru: "Сердце, лёгкие и дыхание" },
  },
  {
    id: "diabetes-hormones",
    areaIds: ["diabetes", "gland-and-hormone-disorders", "endocrine-hormone-system", "metabolic-disorders", "metabolism"],
    titles: { ro: "Diabet, hormoni și metabolism", en: "Diabetes, hormones and metabolism", sq: "Diabeti, hormonet dhe metabolizmi", it: "Diabete, ormoni e metabolismo", hr: "Dijabetes, hormoni i metabolizam", rom: "Diabeto, hormonura thaj metabolizmo", ru: "Диабет, гормоны и обмен веществ" },
  },
  {
    id: "mind-brain",
    areaIds: ["mental-health-brain-and-nerves", "brain-and-nerves", "addiction"],
    titles: { ro: "Minte, creier și dependențe", en: "Mind, brain and addiction", sq: "Mendja, truri dhe varësitë", it: "Mente, cervello e dipendenze", hr: "Um, mozak i ovisnosti", rom: "Godi, shero thaj ovisnostura", ru: "Психика, мозг и зависимости" },
  },
  {
    id: "women-pregnancy-children",
    areaIds: ["womens-health", "pregnancy-and-birth", "childrens-health", "growth-and-aging"],
    titles: { ro: "Femei, sarcină și copii", en: "Women, pregnancy and children", sq: "Gratë, shtatzënia dhe fëmijët", it: "Donne, gravidanza e bambini", hr: "Žene, trudnoća i djeca", rom: "Dzhuvlja, khabnipen thaj chavore", ru: "Женщины, беременность и дети" },
  },
  {
    id: "sexual-urinary",
    areaIds: ["mens-health", "sexual-health-and-contraception", "sex-organs", "urinary-disorders-and-kidney-problems", "kidneys-bladder-and-urinary-tract"],
    titles: { ro: "Bărbați, sănătate sexuală și rinichi", en: "Men, sexual health and kidneys", sq: "Burrat, shëndeti seksual dhe veshkat", it: "Uomini, salute sessuale e reni", hr: "Muškarci, spolno zdravlje i bubrezi", rom: "Mursha, seksualno sastipen thaj buvrecha", ru: "Мужчины, сексуальное здоровье и почки" },
  },
  {
    id: "infections-allergies",
    areaIds: ["infections-and-immune-system", "allergies", "blood-and-immune-system"],
    titles: { ro: "Infecții, alergii și imunitate", en: "Infections, allergies and immunity", sq: "Infeksionet, alergjitë dhe imuniteti", it: "Infezioni, allergie e immunità", hr: "Infekcije, alergije i imunitet", rom: "Infekcie, alergie thaj imuniteto", ru: "Инфекции, аллергии и иммунитет" },
  },
  {
    id: "cancer",
    areaIds: ["cancer"],
    titles: { ro: "Cancer", en: "Cancer", sq: "Kanceri", it: "Tumori", hr: "Rak", rom: "Kancero", ru: "Онкология" },
  },
  {
    id: "digestion-teeth",
    areaIds: ["digestive-system-disorders", "stomach-bowel-and-digestion", "teeth-and-gums", "mouth-and-teeth"],
    titles: { ro: "Stomac, digestie și dinți", en: "Stomach, digestion and teeth", sq: "Stomaku, tretja dhe dhëmbët", it: "Stomaco, digestione e denti", hr: "Želudac, probava i zubi", rom: "Por, xabesko pachavipen thaj danda", ru: "Желудок, пищеварение и зубы" },
  },
  {
    id: "bones-muscles",
    areaIds: ["muscle-and-joint-disorders", "bones-muscles-and-joints", "limbs"],
    titles: { ro: "Oase, mușchi și articulații", en: "Bones, muscles and joints", sq: "Kockat, muskujt dhe kyçet", it: "Ossa, muscoli e articolazioni", hr: "Kosti, mišići i zglobovi", rom: "Kokala, mushkura thaj zglobura", ru: "Кости, мышцы и суставы" },
  },
  {
    id: "skin-eyes-ears",
    areaIds: ["skin-and-hair", "skin-hair-and-nails", "eyes-nose-ears", "sensory-organs"],
    titles: { ro: "Piele, ochi și urechi", en: "Skin, eyes and ears", sq: "Lëkura, sytë dhe veshët", it: "Pelle, occhi e orecchie", hr: "Koža, oči i uši", rom: "Morkhi, jakha thaj kana", ru: "Кожа, глаза и уши" },
  },
  {
    id: "treatment-care",
    areaIds: [
      "drugs-and-vaccines", "diagnosis-and-tests", "non-drug-treatments", "surgery", "physical-therapy-and-daily-living-aids",
      "prevention", "screening", "nursing-care", "second-opinions-before-surgery", "making-an-informed-decision",
      "what-is-evidence-based-medicine", "studies-co", "our-methods-and-processes",
    ],
    titles: { ro: "Medicamente, analize și îngrijire", en: "Medicines, tests and care", sq: "Ilaçet, analizat dhe kujdesi", it: "Farmaci, esami e assistenza", hr: "Lijekovi, pretrage i skrb", rom: "Draba, analize thaj griza", ru: "Лекарства, анализы и уход" },
  },
];

/** The articles of one category, sorted by title in the visitor's language. */
export function articlesInCategory(category: HealthTopicCategory, lang: Lang): HealthArticleIndexEntry[] {
  return healthArticleIndex
    .filter((article) => article.areaIds.some((areaId) => category.areaIds.includes(areaId)))
    .sort((a, b) => (a.titles[lang] ?? a.titles.en).localeCompare(b.titles[lang] ?? b.titles.en, lang));
}
