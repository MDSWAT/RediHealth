import type { Lang } from "@/lib/i18n/translations";

export const INFORMEDHEALTH_SOURCE = "https://www.informedhealth.org/topic-areas/";
export const INFORMEDHEALTH_LEGAL_NOTICE = "https://www.informedhealth.org/about-us/legal-notice/";
export const INFORMEDHEALTH_CHECKED_ON = "2026-11-10";
export const AREA_GROUPS = ["conditions", "services", "body", "treatments", "evidence"] as const;
export type AreaGroup = typeof AREA_GROUPS[number];

// Public topic labels and source links. Independently authored RediHealth summaries use separate local routes.
// Label order: English, Romanian, Albanian, Italian, Russian, Croatian, Romani.
const areas: [string, AreaGroup[], [string, string, string, string, string, string, string]][] = [
  ["allergies", ["conditions"], ["Allergies", "Alergii", "Alergjitë", "Allergie", "Аллергии", "Alergije", "Alergije"]],
  ["airway-diseases", ["conditions"], ["Airway diseases", "Boli respiratorii", "Sëmundjet e frymëmarrjes", "Malattie respiratorie", "Заболевания дыхательных путей", "Bolesti dišnih putova", "Nasvalipena e phurdimaske dromengo"]],
  ["eyes-nose-ears", ["conditions"], ["Eyes, nose, ears", "Ochi, nas și urechi", "Sytë, hunda dhe veshët", "Occhi, naso e orecchie", "Глаза, нос и уши", "Oči, nos i uši", "Jakha, nakh thaj kana"]],
  ["diabetes", ["conditions"], ["Diabetes", "Diabet", "Diabeti", "Diabete", "Диабет", "Dijabetes", "Dijabeto"]],
  ["gland-and-hormone-disorders", ["conditions"], ["Gland and hormone disorders", "Afecțiuni ale glandelor și hormonilor", "Çrregullimet e gjëndrave dhe hormoneve", "Disturbi delle ghiandole e degli ormoni", "Заболевания желёз и гормональные нарушения", "Poremećaji žlijezda i hormona", "Nasvalipena e zhljezdengo thaj e hormonengo"]],
  ["womens-health", ["conditions"], ["Women's health", "Sănătatea femeii", "Shëndeti i gruas", "Salute della donna", "Женское здоровье", "Zdravlje žena", "E zhuvljengo sastipen"]],
  ["urinary-disorders-and-kidney-problems", ["conditions"], ["Urinary disorders and kidney problems", "Afecțiuni urinare și probleme renale", "Çrregullimet urinare dhe problemet e veshkave", "Disturbi urinari e problemi renali", "Заболевания мочевыводящих путей и почек", "Poremećaji mokraćnog sustava i bubrega", "Nasvalipena e mutrimaske sistemosko thaj e bubregengo"]],
  ["skin-and-hair", ["conditions"], ["Skin and hair", "Piele și păr", "Lëkura dhe flokët", "Pelle e capelli", "Кожа и волосы", "Koža i kosa", "Morkhi thaj bal"]],
  ["heart-and-circulation", ["conditions", "body"], ["Heart and circulation", "Inimă și circulație", "Zemra dhe qarkullimi i gjakut", "Cuore e circolazione", "Сердце и кровообращение", "Srce i krvotok", "O ilo thaj o phirimos e ratesko"]],
  ["infections-and-immune-system", ["conditions"], ["Infections and immune system", "Infecții și sistemul imunitar", "Infeksionet dhe sistemi imunitar", "Infezioni e sistema immunitario", "Инфекции и иммунная система", "Infekcije i imunološki sustav", "Infekcije thaj o imunitarno sistemo"]],
  ["childrens-health", ["conditions"], ["Children's health", "Sănătatea copilului", "Shëndeti i fëmijëve", "Salute dei bambini", "Детское здоровье", "Zdravlje djece", "E chavorengo sastipen"]],
  ["cancer", ["conditions"], ["Cancer", "Cancer", "Kanceri", "Tumori", "Онкологические заболевания", "Rak i tumori", "Kancero"]],
  ["mens-health", ["conditions"], ["Men's health", "Sănătatea bărbatului", "Shëndeti i burrave", "Salute dell'uomo", "Мужское здоровье", "Zdravlje muškaraca", "E murshango sastipen"]],
  ["muscle-and-joint-disorders", ["conditions"], ["Muscle and joint disorders", "Afecțiuni ale mușchilor și articulațiilor", "Sëmundjet e muskujve dhe kyçeve", "Disturbi muscolari e articolari", "Заболевания мышц и суставов", "Bolesti mišića i zglobova", "Nasvalipena e muskulengo thaj e klichengo"]],
  ["mental-health-brain-and-nerves", ["conditions"], ["Mental health, brain and nerves", "Sănătate mintală, creier și nervi", "Shëndeti mendor, truri dhe nervat", "Salute mentale, cervello e nervi", "Психическое здоровье, мозг и нервы", "Mentalno zdravlje, mozak i živci", "Godjako sastipen, godi thaj nervura"]],
  ["pregnancy-and-birth", ["conditions"], ["Pregnancy and birth", "Sarcină și naștere", "Shtatzënia dhe lindja", "Gravidanza e parto", "Беременность и роды", "Trudnoća i porod", "Khabnipen thaj bijandimos"]],
  ["sexual-health-and-contraception", ["conditions"], ["Sexual health and contraception", "Sănătate sexuală și contracepție", "Shëndeti seksual dhe kontracepsioni", "Salute sessuale e contraccezione", "Сексуальное здоровье и контрацепция", "Seksualno zdravlje i kontracepcija", "Seksualno sastipen thaj kontracepcija"]],
  ["metabolic-disorders", ["conditions"], ["Metabolic disorders", "Tulburări metabolice", "Çrregullimet metabolike", "Disturbi metabolici", "Нарушения обмена веществ", "Poremećaji metabolizma", "Metabolikane nasvalipena"]],
  ["addiction", ["conditions"], ["Addiction", "Dependențe", "Varësitë", "Dipendenze", "Зависимости", "Ovisnosti", "Ovisnostura"]],
  ["digestive-system-disorders", ["conditions"], ["Digestive system disorders", "Afecțiuni digestive", "Sëmundjet e sistemit tretës", "Disturbi digestivi", "Заболевания пищеварительной системы", "Bolesti probavnog sustava", "Nasvalipena e xabnaske sistemosko"]],
  ["teeth-and-gums", ["conditions"], ["Teeth and gums", "Dinți și gingii", "Dhëmbët dhe mishrat e dhëmbëve", "Denti e gengive", "Зубы и дёсны", "Zubi i desni", "Danda thaj mase"]],
  ["nursing-care", ["services"], ["Nursing care", "Îngrijire medicală", "Kujdesi infermieror", "Assistenza infermieristica", "Сестринский уход", "Sestrinska i dugotrajna njega", "Sastipnasko arakhimos thaj griža"]],
  ["screening", ["services"], ["Screening", "Screening și depistare precoce", "Depistimi i hershëm", "Screening e diagnosi precoce", "Скрининг и раннее выявление заболеваний", "Probiri i rano otkrivanje bolesti", "Angluno dikhiben thaj arakhimos"]],
  ["second-opinions-before-surgery", ["services"], ["Second opinions before surgery", "A doua opinie înainte de operație", "Mendimi i dytë para operacionit", "Secondo parere prima di un intervento", "Второе мнение перед операцией", "Drugo mišljenje prije operacije", "Dujto gindo angla i operacija"]],
  ["blood-and-immune-system", ["body"], ["Blood and immune system", "Sânge și sistemul imunitar", "Gjaku dhe sistemi imunitar", "Sangue e sistema immunitario", "Кровь и иммунная система", "Krv i imunološki sustav", "O rat thaj o imunitarno sistemo"]],
  ["brain-and-nerves", ["body"], ["Brain and nerves", "Creier și nervi", "Truri dhe nervat", "Cervello e nervi", "Мозг и нервы", "Mozak i živci", "I godi thaj e nervura"]],
  ["sex-organs", ["body"], ["Sex organs", "Organe sexuale", "Organet seksuale", "Organi sessuali", "Половые органы", "Spolni organi", "Seksualne organura"]],
  ["limbs", ["body"], ["Limbs", "Membre", "Gjymtyrët", "Arti", "Конечности", "Udovi", "Vasta thaj punre"]],
  ["skin-hair-and-nails", ["body"], ["Skin, hair and nails", "Piele, păr și unghii", "Lëkura, flokët dhe thonjtë", "Pelle, capelli e unghie", "Кожа, волосы и ногти", "Koža, kosa i nokti", "Morkhi, bal thaj vundzija"]],
  ["endocrine-hormone-system", ["body"], ["Endocrine (hormone) system", "Sistemul endocrin (hormonal)", "Sistemi endokrin (hormonal)", "Sistema endocrino (ormonale)", "Эндокринная (гормональная) система", "Endokrini (hormonski) sustav", "Endokrino (hormonengo) sistemo"]],
  ["bones-muscles-and-joints", ["body"], ["Bones, muscles and joints", "Oase, mușchi și articulații", "Kockat, muskujt dhe kyçet", "Ossa, muscoli e articolazioni", "Кости, мышцы и суставы", "Kosti, mišići i zglobovi", "Kokala, muskulura thaj klichura"]],
  ["lungs-and-airways", ["body"], ["Lungs and airways", "Plămâni și căi respiratorii", "Mushkëritë dhe rrugët e frymëmarrjes", "Polmoni e vie respiratorie", "Лёгкие и дыхательные пути", "Pluća i dišni putovi", "Buke thaj phurdimaske droma"]],
  ["stomach-bowel-and-digestion", ["body"], ["Stomach, bowel and digestion", "Stomac, intestin și digestie", "Stomaku, zorrët dhe tretja", "Stomaco, intestino e digestione", "Желудок, кишечник и пищеварение", "Želudac, crijeva i probava", "Per, pora thaj xabnasko mistimos"]],
  ["mouth-and-teeth", ["body"], ["Mouth and teeth", "Gură și dinți", "Goja dhe dhëmbët", "Bocca e denti", "Рот и зубы", "Usta i zubi", "Muj thaj danda"]],
  ["kidneys-bladder-and-urinary-tract", ["body"], ["Kidneys, bladder and urinary tract", "Rinichi, vezică și tract urinar", "Veshkat, fshikëza dhe rrugët urinare", "Reni, vescica e vie urinarie", "Почки, мочевой пузырь и мочевыводящие пути", "Bubrezi, mjehur i mokraćni putovi", "Bubregura, beshika thaj mutrimaske droma"]],
  ["sensory-organs", ["body"], ["Sensory organs", "Organe de simț", "Organet shqisore", "Organi di senso", "Органы чувств", "Osjetilni organi", "Hatjarimaske organura"]],
  ["metabolism", ["body"], ["Metabolism", "Metabolism", "Metabolizmi", "Metabolismo", "Обмен веществ", "Metabolizam", "Metabolizmo"]],
  ["growth-and-aging", ["body"], ["Growth and aging", "Creștere și îmbătrânire", "Rritja dhe plakja", "Crescita e invecchiamento", "Рост и старение", "Rast i starenje", "Barjimos thaj phurimos"]],
  ["drugs-and-vaccines", ["treatments"], ["Drugs and vaccines", "Medicamente și vaccinuri", "Barnat dhe vaksinat", "Farmaci e vaccini", "Лекарства и вакцины", "Lijekovi i cjepiva", "Draba thaj vakcine"]],
  ["diagnosis-and-tests", ["treatments"], ["Diagnosis and tests", "Diagnostic și analize", "Diagnostikimi dhe analizat", "Diagnosi ed esami", "Диагностика и обследования", "Dijagnostika i pretrage", "Dijagnoza thaj dikhibena"]],
  ["non-drug-treatments", ["treatments"], ["Non-drug treatments", "Tratamente fără medicamente", "Trajtimet pa barna", "Trattamenti senza farmaci", "Немедикаментозное лечение", "Liječenje bez lijekova", "Sastjarimos bi drabengo"]],
  ["surgery", ["treatments"], ["Surgery", "Chirurgie", "Kirurgjia", "Chirurgia", "Хирургия", "Kirurgija", "Operacije thaj kirurgija"]],
  ["physical-therapy-and-daily-living-aids", ["treatments"], ["Physical therapy and daily living aids", "Fizioterapie și ajutoare pentru viața de zi cu zi", "Fizioterapia dhe mjetet ndihmëse për jetën e përditshme", "Fisioterapia e ausili per la vita quotidiana", "Физиотерапия и средства помощи в повседневной жизни", "Fizioterapija i pomagala za svakodnevni život", "Fizioterapija thaj azhutimata vash sako dives"]],
  ["prevention", ["treatments"], ["Prevention", "Prevenție", "Parandalimi", "Prevenzione", "Профилактика", "Prevencija", "Arakhimos"]],
  ["what-is-evidence-based-medicine", ["evidence"], ["What is evidence-based medicine?", "Ce este medicina bazată pe dovezi?", "Çfarë është mjekësia e bazuar në prova?", "Che cos'è la medicina basata sulle prove?", "Что такое доказательная медицина?", "Što je medicina utemeljena na dokazima?", "So si sastjarimos bazirimo pe dokaze?"]],
  ["studies-co", ["evidence"], ["Understanding medical studies", "Înțelegerea studiilor medicale", "Si të kuptojmë studimet mjekësore", "Capire gli studi medici", "Как понимать медицинские исследования", "Kako razumjeti medicinska istraživanja", "Sar te hatjaras e sastipnaske studije"]],
  ["making-an-informed-decision", ["evidence"], ["Making an informed decision", "Cum iei o decizie informată", "Si të marrim një vendim të informuar", "Prendere una decisione informata", "Как принять обоснованное решение", "Donošenje informirane odluke", "Sar te les jekh informirimo alosarimos"]],
  ["our-methods-and-processes", ["evidence"], ["How IQWiG develops its information", "Cum elaborează IQWiG informațiile medicale", "Si e përgatit IQWiG informacionin shëndetësor", "Come IQWiG prepara le informazioni sanitarie", "Как IQWiG готовит медицинскую информацию", "Kako IQWiG izrađuje zdravstvene informacije", "Sar o IQWiG lačharel peske sastipnaske informaciye"]],
];

/**
 * Articles about how health care works in Germany (insurance, German programmes and services).
 * They are not published on RediHealth, and the inventory script skips them if the source lists them again.
 * The German-only topic areas (Health care in Germany, IGeL, early benefit assessment) are left out of `areas` above.
 */
export const EXCLUDED_ARTICLE_IDS: ReadonlySet<string> = new Set([
  "abortion-in-germany",
  "disease-management-program-for-type-1-diabetes-in-germany",
  "drugs-assessed-by-iqwig",
  "evidence-based-medicine-in-germany",
  "health-care-in-germany",
  "health-insurance-in-germany",
  "how-can-i-find-support-groups-and-information-centers-in-germany",
  "mental-health-problems-where-can-you-find-help-in-germany",
  "prenatal-care-and-maternity-records-in-germany",
  "psychotherapy-providers-in-germany",
  "standard-check-ups-for-children-and-teenagers-in-germany",
  "the-breast-cancer-screening-program-in-germany",
  "the-german-healthcare-system",
  "what-are-digital-health-applications-digas",
  "what-are-disease-management-programs-dmps",
  "what-screening-tests-does-german-public-health-insurance-cover",
  "which-vaccinations-are-recommended-in-germany",
]);

export const informedHealthAreas = areas.map(([id, groups, [en, ro, sq, it, ru, hr, rom]]) => ({
  id, groups, url: `https://www.informedhealth.org/topic-areas/${id}.html`,
  titles: { en, ro, sq, it, ru, hr, rom } satisfies Record<Lang, string>,
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
