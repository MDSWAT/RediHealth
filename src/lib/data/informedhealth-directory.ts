import type { Lang } from "@/lib/i18n/translations";

export const INFORMEDHEALTH_SOURCE = "https://www.informedhealth.org/topic-areas/";
export const INFORMEDHEALTH_LEGAL_NOTICE = "https://www.informedhealth.org/about-us/legal-notice/";
export const INFORMEDHEALTH_CHECKED_ON = "2026-11-10";
export const AREA_GROUPS = ["conditions", "services", "body", "treatments", "evidence"] as const;
export type AreaGroup = typeof AREA_GROUPS[number];

// Public topic labels and source links. Independently authored RediHealth summaries use separate local routes.
// Label order: English, Romanian, Albanian, Italian, Russian.
const areas: [string, AreaGroup[], [string, string, string, string, string]][] = [
  ["allergies", ["conditions"], ["Allergies", "Alergii", "Alergjitë", "Allergie", "Аллергии"]],
  ["airway-diseases", ["conditions"], ["Airway diseases", "Boli respiratorii", "Sëmundjet e frymëmarrjes", "Malattie respiratorie", "Заболевания дыхательных путей"]],
  ["eyes-nose-ears", ["conditions"], ["Eyes, nose, ears", "Ochi, nas și urechi", "Sytë, hunda dhe veshët", "Occhi, naso e orecchie", "Глаза, нос и уши"]],
  ["diabetes", ["conditions"], ["Diabetes", "Diabet", "Diabeti", "Diabete", "Диабет"]],
  ["gland-and-hormone-disorders", ["conditions"], ["Gland and hormone disorders", "Afecțiuni ale glandelor și hormonilor", "Çrregullimet e gjëndrave dhe hormoneve", "Disturbi delle ghiandole e degli ormoni", "Заболевания желёз и гормональные нарушения"]],
  ["womens-health", ["conditions"], ["Women's health", "Sănătatea femeii", "Shëndeti i gruas", "Salute della donna", "Женское здоровье"]],
  ["urinary-disorders-and-kidney-problems", ["conditions"], ["Urinary disorders and kidney problems", "Afecțiuni urinare și probleme renale", "Çrregullimet urinare dhe problemet e veshkave", "Disturbi urinari e problemi renali", "Заболевания мочевыводящих путей и почек"]],
  ["skin-and-hair", ["conditions"], ["Skin and hair", "Piele și păr", "Lëkura dhe flokët", "Pelle e capelli", "Кожа и волосы"]],
  ["heart-and-circulation", ["conditions", "body"], ["Heart and circulation", "Inimă și circulație", "Zemra dhe qarkullimi i gjakut", "Cuore e circolazione", "Сердце и кровообращение"]],
  ["infections-and-immune-system", ["conditions"], ["Infections and immune system", "Infecții și sistemul imunitar", "Infeksionet dhe sistemi imunitar", "Infezioni e sistema immunitario", "Инфекции и иммунная система"]],
  ["childrens-health", ["conditions"], ["Children's health", "Sănătatea copilului", "Shëndeti i fëmijëve", "Salute dei bambini", "Детское здоровье"]],
  ["cancer", ["conditions"], ["Cancer", "Cancer", "Kanceri", "Tumori", "Онкологические заболевания"]],
  ["mens-health", ["conditions"], ["Men's health", "Sănătatea bărbatului", "Shëndeti i burrave", "Salute dell'uomo", "Мужское здоровье"]],
  ["muscle-and-joint-disorders", ["conditions"], ["Muscle and joint disorders", "Afecțiuni ale mușchilor și articulațiilor", "Sëmundjet e muskujve dhe kyçeve", "Disturbi muscolari e articolari", "Заболевания мышц и суставов"]],
  ["mental-health-brain-and-nerves", ["conditions"], ["Mental health, brain and nerves", "Sănătate mintală, creier și nervi", "Shëndeti mendor, truri dhe nervat", "Salute mentale, cervello e nervi", "Психическое здоровье, мозг и нервы"]],
  ["pregnancy-and-birth", ["conditions"], ["Pregnancy and birth", "Sarcină și naștere", "Shtatzënia dhe lindja", "Gravidanza e parto", "Беременность и роды"]],
  ["sexual-health-and-contraception", ["conditions"], ["Sexual health and contraception", "Sănătate sexuală și contracepție", "Shëndeti seksual dhe kontracepsioni", "Salute sessuale e contraccezione", "Сексуальное здоровье и контрацепция"]],
  ["metabolic-disorders", ["conditions"], ["Metabolic disorders", "Tulburări metabolice", "Çrregullimet metabolike", "Disturbi metabolici", "Нарушения обмена веществ"]],
  ["addiction", ["conditions"], ["Addiction", "Dependențe", "Varësitë", "Dipendenze", "Зависимости"]],
  ["digestive-system-disorders", ["conditions"], ["Digestive system disorders", "Afecțiuni digestive", "Sëmundjet e sistemit tretës", "Disturbi digestivi", "Заболевания пищеварительной системы"]],
  ["teeth-and-gums", ["conditions"], ["Teeth and gums", "Dinți și gingii", "Dhëmbët dhe mishrat e dhëmbëve", "Denti e gengive", "Зубы и дёсны"]],
  ["early-benefit-assessment-of-medications", ["services"], ["Early benefit assessment of medications", "Evaluarea timpurie a beneficiilor medicamentelor", "Vlerësimi i hershëm i përfitimeve të barnave", "Valutazione precoce dei benefici dei farmaci", "Ранняя оценка пользы лекарств"]],
  ["health-care-in-germany", ["services"], ["Health care in Germany", "Servicii medicale în Germania", "Kujdesi shëndetësor në Gjermani", "Assistenza sanitaria in Germania", "Медицинская помощь в Германии"]],
  ["individual-health-care-services-igel", ["services"], ["Individual health care services (IGeL)", "Servicii medicale plătite individual în Germania (IGeL)", "Shërbimet shëndetësore me pagesë individuale në Gjermani (IGeL)", "Prestazioni sanitarie individuali a pagamento in Germania (IGeL)", "Индивидуальные платные медицинские услуги в Германии (IGeL)"]],
  ["nursing-care", ["services"], ["Nursing care", "Îngrijire medicală", "Kujdesi infermieror", "Assistenza infermieristica", "Сестринский уход"]],
  ["screening", ["services"], ["Screening", "Screening și depistare precoce", "Depistimi i hershëm", "Screening e diagnosi precoce", "Скрининг и раннее выявление заболеваний"]],
  ["second-opinions-before-surgery", ["services"], ["Second opinions before surgery", "A doua opinie înainte de operație", "Mendimi i dytë para operacionit", "Secondo parere prima di un intervento", "Второе мнение перед операцией"]],
  ["blood-and-immune-system", ["body"], ["Blood and immune system", "Sânge și sistemul imunitar", "Gjaku dhe sistemi imunitar", "Sangue e sistema immunitario", "Кровь и иммунная система"]],
  ["brain-and-nerves", ["body"], ["Brain and nerves", "Creier și nervi", "Truri dhe nervat", "Cervello e nervi", "Мозг и нервы"]],
  ["sex-organs", ["body"], ["Sex organs", "Organe sexuale", "Organet seksuale", "Organi sessuali", "Половые органы"]],
  ["limbs", ["body"], ["Limbs", "Membre", "Gjymtyrët", "Arti", "Конечности"]],
  ["skin-hair-and-nails", ["body"], ["Skin, hair and nails", "Piele, păr și unghii", "Lëkura, flokët dhe thonjtë", "Pelle, capelli e unghie", "Кожа, волосы и ногти"]],
  ["endocrine-hormone-system", ["body"], ["Endocrine (hormone) system", "Sistemul endocrin (hormonal)", "Sistemi endokrin (hormonal)", "Sistema endocrino (ormonale)", "Эндокринная (гормональная) система"]],
  ["bones-muscles-and-joints", ["body"], ["Bones, muscles and joints", "Oase, mușchi și articulații", "Kockat, muskujt dhe kyçet", "Ossa, muscoli e articolazioni", "Кости, мышцы и суставы"]],
  ["lungs-and-airways", ["body"], ["Lungs and airways", "Plămâni și căi respiratorii", "Mushkëritë dhe rrugët e frymëmarrjes", "Polmoni e vie respiratorie", "Лёгкие и дыхательные пути"]],
  ["stomach-bowel-and-digestion", ["body"], ["Stomach, bowel and digestion", "Stomac, intestin și digestie", "Stomaku, zorrët dhe tretja", "Stomaco, intestino e digestione", "Желудок, кишечник и пищеварение"]],
  ["mouth-and-teeth", ["body"], ["Mouth and teeth", "Gură și dinți", "Goja dhe dhëmbët", "Bocca e denti", "Рот и зубы"]],
  ["kidneys-bladder-and-urinary-tract", ["body"], ["Kidneys, bladder and urinary tract", "Rinichi, vezică și tract urinar", "Veshkat, fshikëza dhe rrugët urinare", "Reni, vescica e vie urinarie", "Почки, мочевой пузырь и мочевыводящие пути"]],
  ["sensory-organs", ["body"], ["Sensory organs", "Organe de simț", "Organet shqisore", "Organi di senso", "Органы чувств"]],
  ["metabolism", ["body"], ["Metabolism", "Metabolism", "Metabolizmi", "Metabolismo", "Обмен веществ"]],
  ["growth-and-aging", ["body"], ["Growth and aging", "Creștere și îmbătrânire", "Rritja dhe plakja", "Crescita e invecchiamento", "Рост и старение"]],
  ["drugs-and-vaccines", ["treatments"], ["Drugs and vaccines", "Medicamente și vaccinuri", "Barnat dhe vaksinat", "Farmaci e vaccini", "Лекарства и вакцины"]],
  ["diagnosis-and-tests", ["treatments"], ["Diagnosis and tests", "Diagnostic și analize", "Diagnostikimi dhe analizat", "Diagnosi ed esami", "Диагностика и обследования"]],
  ["non-drug-treatments", ["treatments"], ["Non-drug treatments", "Tratamente fără medicamente", "Trajtimet pa barna", "Trattamenti senza farmaci", "Немедикаментозное лечение"]],
  ["surgery", ["treatments"], ["Surgery", "Chirurgie", "Kirurgjia", "Chirurgia", "Хирургия"]],
  ["physical-therapy-and-daily-living-aids", ["treatments"], ["Physical therapy and daily living aids", "Fizioterapie și ajutoare pentru viața de zi cu zi", "Fizioterapia dhe mjetet ndihmëse për jetën e përditshme", "Fisioterapia e ausili per la vita quotidiana", "Физиотерапия и средства помощи в повседневной жизни"]],
  ["prevention", ["treatments"], ["Prevention", "Prevenție", "Parandalimi", "Prevenzione", "Профилактика"]],
  ["what-is-evidence-based-medicine", ["evidence"], ["What is evidence-based medicine?", "Ce este medicina bazată pe dovezi?", "Çfarë është mjekësia e bazuar në prova?", "Che cos'è la medicina basata sulle prove?", "Что такое доказательная медицина?"]],
  ["studies-co", ["evidence"], ["Understanding medical studies", "Înțelegerea studiilor medicale", "Si të kuptojmë studimet mjekësore", "Capire gli studi medici", "Как понимать медицинские исследования"]],
  ["making-an-informed-decision", ["evidence"], ["Making an informed decision", "Cum iei o decizie informată", "Si të marrim një vendim të informuar", "Prendere una decisione informata", "Как принять обоснованное решение"]],
  ["our-methods-and-processes", ["evidence"], ["How IQWiG develops its information", "Cum elaborează IQWiG informațiile medicale", "Si e përgatit IQWiG informacionin shëndetësor", "Come IQWiG prepara le informazioni sanitarie", "Как IQWiG готовит медицинскую информацию"]],
];

export const informedHealthAreas = areas.map(([id, groups, [en, ro, sq, it, ru]]) => ({
  id, groups, url: `https://www.informedhealth.org/topic-areas/${id}.html`,
  titles: { en, ro, sq, it, ru, hr: en, rom: en } satisfies Record<Lang, string>,
}));

export function healthSummaryPath(id: string): string {
  return `/health-information/topics/${encodeURIComponent(id)}`;
}

export function informedHealthSourceUrl(id: string): string | undefined {
  const area = informedHealthAreas.find(item => item.id === id);
  if (!area) return undefined;
  // The topic-index entry returns 404; this verified IQWiG article covers the same subject.
  return id === "second-opinions-before-surgery"
    ? "https://www.informedhealth.org/before-surgery-getting-information-and-making-a-decision.html"
    : area.url;
}

export function findInformedHealthAreas(lang: Lang, query: string, group: AreaGroup | "all" = "all") {
  const fold = (value: string) => value.toLocaleLowerCase(lang).normalize("NFD").replace(/\p{M}/gu, "");
  const term = fold(query.trim());
  return informedHealthAreas.filter(area => (group === "all" || area.groups.includes(group))
    && (!term || fold(`${area.titles[lang]} ${area.titles.en}`).includes(term)));
}
