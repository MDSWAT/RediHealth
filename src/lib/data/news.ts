import { NEWS_TRANSLATIONS_HR } from "./news-translations-hr";
import { NEWS_TRANSLATIONS_ROM } from "./news-translations-rom";
import {
  NEWS_TRANSLATIONS_EXTRA_EN,
  NEWS_TRANSLATIONS_EXTRA_IT,
  NEWS_TRANSLATIONS_EXTRA_SQ,
} from "./news-translations-extra";

export type NewsCategory =
  | "Alerte locale"
  | "Caravane medicale"
  | "Campanii de vaccinare"
  | "Sfaturi de sezon";

export type NewsCountry = "ro" | "md" | "it" | "hr" | "al";

/** The county value of an item about the whole of Italy (same value the county map uses for "all of Italy"). */
export const ITALY_WIDE = "Italia";

/** The county value of an item about the whole of Republic of Moldova. */
export const MOLDOVA_WIDE = "Moldova";

/** The county value of an item about the whole of Croatia. */
export const CROATIA_WIDE = "Hrvatska";

/** The county value of an item about the whole of Albania. */
export const ALBANIA_WIDE = "Shqipëria";

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory;
  categoryLabel?: string;
  county: string; // Specific county/region or country-wide sentinel ("Toate județele", ITALY_WIDE, MOLDOVA_WIDE, CROATIA_WIDE)
  /** Which country the item is about; Romanian when omitted. Never shown in the other country's views. */
  country?: NewsCountry;
  /** The language the text is written in, when it is fixed (an Italy-only item is in Italian in every locale). */
  language?: "ro" | "en" | "sq" | "it" | "hr" | "rom" | "ru";
  date: string;
  readTimeMinutes: number;
  summary: string;
  content: string[];
  verifiedDoctor: {
    name: string;
    specialty: string;
    verifiedDate: string;
  };
  tags: string[];
  audioNarrationDuration: string;
  epidemicSeverity?: "high" | "moderate";
  preventiveSteps?: string[];
  caravanDetails?: {
    village: string;
    landmark: string;
    hours: string;
    freeServices: string[];
  };
};

export const NEWS_ARTICLES: NewsArticle[] = [];

export const NEWS_CATEGORIES: NewsCategory[] = [
  "Alerte locale",
  "Caravane medicale",
  "Campanii de vaccinare",
  "Sfaturi de sezon",
];

export const NEWS_CATEGORY_LABELS: Record<string, Record<NewsCategory, string>> = {
  ru: {
    "Alerte locale": "Локальные оповещения",
    "Caravane medicale": "Мобильные клиники",
    "Campanii de vaccinare": "Прививки",
    "Sfaturi de sezon": "Сезонный совет",
  },

  ro: {
    "Alerte locale": "Alerte locale",
    "Caravane medicale": "Caravane medicale",
    "Campanii de vaccinare": "Campanii de vaccinare",
    "Sfaturi de sezon": "Sfaturi de sezon",
  },
  en: {
    "Alerte locale": "Local alerts",
    "Caravane medicale": "Mobile clinics",
    "Campanii de vaccinare": "Vaccinations",
    "Sfaturi de sezon": "Seasonal advice",
  },
  sq: {
    "Alerte locale": "Alarme lokale",
    "Caravane medicale": "Karvanë mjekësorë",
    "Campanii de vaccinare": "Vaksinime",
    "Sfaturi de sezon": "Këshilla për stinën",
  },
  it: {
    "Alerte locale": "Avvisi locali",
    "Caravane medicale": "Ambulatori mobili",
    "Campanii de vaccinare": "Vaccinazioni",
    "Sfaturi de sezon": "Consigli di stagione",
  },
  hr: {
    "Alerte locale": "Lokalna upozorenja",
    "Caravane medicale": "Mobilne ambulante",
    "Campanii de vaccinare": "Cijepljenje",
    "Sfaturi de sezon": "Sezonski savjeti",
  },
  rom: {
    "Alerte locale": "Lokalne alerte",
    "Caravane medicale": "Mobilne klinike",
    "Campanii de vaccinare": "Vakcinaciya",
    "Sfaturi de sezon": "Sezonoske svatura",
  },
};

export const LOCALIZED_COUNTY_ALL: Record<string, string> = {
  ru: "Все округа",

  ro: "Toate județele",
  en: "All counties",
  sq: "Të gjitha qarqet",
  it: "Tutte le province",
  hr: "Sve županije",
  rom: "Savore judetya",
};

/** The country an item is about (Romanian when not set). */
export function articleCountry(article: Pick<NewsArticle, "country">): NewsCountry {
  return article.country ?? "ro";
}

/** True for an item about a whole country: Romania, Moldova, Italy, Croatia, or Albania. */
export function isCountryWide(article: Pick<NewsArticle, "county" | "country">): boolean {
  const c = articleCountry(article);
  if (c === "it") return article.county === ITALY_WIDE;
  if (c === "md") return article.county === MOLDOVA_WIDE;
  if (c === "hr") return article.county === CROATIA_WIDE;
  if (c === "al") return article.county === ALBANIA_WIDE;
  return isNationalCounty(article.county);
}

export function isNationalCounty(county: string): boolean {
  return (
    county === "Toate județele" ||
    county === "All counties" ||
    county === "Të gjitha qarqet" ||
    county === "Tutte le province" ||
    county === "Sve županije" ||
    county === "Savore judetya"
  );
}

export type LocalizedArticleFields = {
  title: string;
  summary: string;
  content: string[];
  preventiveSteps?: string[];
  caravanLandmark?: string;
  caravanVillage?: string;
  freeServices?: string[];
  doctorSpecialty?: string;
  doctorVerifiedDate?: string;
  tags?: string[];
};

export const LOCALIZED_NEWS_DATA: Record<string, Record<string, LocalizedArticleFields>> = {
  ru: {
    "alert-rujeola-iasi": {
      title: "В Яссском уезде больше детей заболело корью",
      summary: "Управление здравоохранения Ясс сообщает о заболевании корью у непривитых детей. Вакцину MMR можно получить у вашего семейного врача бесплатно.",
      content: [
        "За последние две недели в клиниках и больницах Яссского уезда выросло количество детей, заболевших корью. Большинство ходят в детский сад или школу.",
        "Корь – это вирус, который очень легко распространяется. Это может привести к пневмонии или отеку головного мозга (энцефалиту). Вакцина MMR (корь, эпидемический паротит, краснуха) защищает надежно и надежно на всю жизнь.",
        "Посмотрите буклет о вакцинации вашего ребенка. Позвоните своему семейному врачу или медицинскому посреднику, чтобы записаться на прием.",
      ],
      preventiveSteps: [
        "Спросите своего семейного врача, каких прививок не хватает вашему ребенку.",
        "Если у вашего ребенка жар и красная сыпь, держите его подальше от людных мест.",
        "Позвоните врачу или посреднику, прежде чем отвезти его в клинику.",
      ],
      doctorSpecialty: "Старший эпидемиолог, Управление общественного здравоохранения Яссы",
      doctorVerifiedDate: "4 ноября 2026 г.",
      tags: ["Вакцинация MMR", "Педиатрия", "Общественное здравоохранение", "Профилактика"],
    },
    "caravana-galati-barcea": {
      title: "Мобильная клиника приходит в Барчу и Ивести",
      summary: "Бесплатные осмотры, анализы крови на сахар и ЭКГ в поселке. Вам не нужна медицинская карта или страховка.",
      content: [
        "Врачи и медицинские посредники привезут мобильную клинику в села Барча и Ивешти. Вас проверят бесплатно.",
        "Все бесплатно. Вы можете приехать даже без страховки и семейного врача. Возьмите с собой удостоверение личности или свидетельство о рождении ребенка.",
      ],
      caravanLandmark: "Двор ратуши, рядом со школой",
      caravanVillage: "Коммуна Барсеа",
      freeServices: [
        "Артериальное давление",
        "Тест на сахар в крови",
        "ECG",
        "Осмотр для детей",
      ],
      doctorSpecialty: "Семейный врач, координатор мобильной клиники",
      doctorVerifiedDate: "5 ноября 2026 г.",
      tags: ["Мобильная клиника", "Бесплатные тесты", "Сообщество", "Доступ к здравоохранению"],
    },
    "campanie-antigripala-nationala": {
      title: "Прививки от гриппа теперь делают в каждом округе",
      summary: "Если вы страдаете длительным заболеванием, беременны или старше 65 лет, вакцина против гриппа покрывается на 100%.",
      content: [
        "Грипп может быть серьезным, если у вас диабет, высокое кровяное давление или заболевание легких или сердца.",
        "Ваш семейный врач выдаст вам рецепт, покрываемый на 100%. Вы получите укол в кабинете врача или в одобренной аптеке.",
        "Если у вас нет семейного врача, медицинский посредник поможет вам зарегистрироваться у ближайшего к вам врача.",
      ],
      preventiveSteps: [
        "Попросите своего семейного врача выдать покрываемый рецепт.",
        "Часто мойте руки водой с мылом в течение 20 секунд.",
        "Открывайте окна минимум 3 раза в день.",
      ],
      doctorSpecialty: "Специалист по инфекционным заболеваниям, Институт Матея Балша",
      doctorVerifiedDate: "28 октября 2026 г.",
      tags: ["Грипп", "Субсидируемая вакцина", "Хроническое заболевание", "Пожилые люди"],
    },
    "sfat-sezon-raceli-copii": {
      title: "Простуда или грипп у детей: как определить",
      summary: "Внезапно возникшая высокая температура с болью в мышцах обычно означает грипп, а не простуду.",
      content: [
        "Простуда развивается медленно: заложен нос, чихание, небольшое недомогание. Лихорадка низкая или ее нет.",
        "Грипп возникает внезапно, в течение нескольких часов: высокая температура (выше 38,5°С), головная боль, ломота в мышцах и сильная усталость.",
        "Дайте ребенку много пить: теплый чай, воду, овощной суп. Не давайте антибиотики без рецепта. Антибиотики не убивают вирусы.",
      ],
      preventiveSteps: [
        "Чаще давайте ребенку теплые напитки",
        "Если ваш ребенок учащенно дышит, срочно отведите его к врачу.",
        "Давайте лекарство от жара только так, как сказал вам врач.",
      ],
      doctorSpecialty: "педиатр",
      doctorVerifiedDate: "2 ноября 2026 г.",
      tags: ["Педиатрия", "Руководство для родителей", "Соответствующее лечение", "Никаких антибиотиков"],
    },
    "alerta-hepatita-cluj": {
      title: "Деревни в Клуже: вскипятите колодезную воду",
      summary: "После наводнений кипятите воду из колодцев, которые не проверили органы здравоохранения.",
      content: [
        "Управление общественного здравоохранения Клужа просит жителей деревень пить и готовить только кипяченую охлажденную воду, если она поступает из мелкого колодца.",
        "Гепатит А передается через грязную воду или пищу, а также через немытые руки. Тщательное мытье рук останавливает распространение инфекции.",
      ],
      preventiveSteps: [
        "Прежде чем пить воду из колодца, прокипятите ее не менее 10 минут.",
        "Мойте фрукты и овощи только в безопасной воде.",
        "Мойте руки перед едой и после посещения туалета",
      ],
      doctorSpecialty: "Специалист по гигиене, Управление общественного здравоохранения Клужа",
      doctorVerifiedDate: "30 октября 2026 г.",
      tags: ["Гигиена", "Безопасная вода", "Гепатит А", "Профилактика"],
    },
    "caravana-stomatologica-bucuresti-ilfov": {
      title: "Бесплатный стоматолог для детей в Бухаресте и Илфове",
      summary: "Бесплатные стоматологические осмотры, советы по чистке и чистке зубов для детей и взрослых без страховки.",
      content: [
        "В район приезжает стоматологическая клиника на колесах. Зубы проверяют и чистят бесплатно.",
        "Дети учатся правильно чистить зубы и получают фторидный гель. Если болит зуб, ему проводят небольшое лечение на месте.",
        "Это бесплатно. Вам не нужна страховка или медицинская карта. Родители должны иметь при себе удостоверение личности.",
      ],
      caravanLandmark: "Автостоянка общественной поликлиники, главный переулок",
      caravanVillage: "Сектор 5 и гмина Жилава",
      freeServices: [
        "Стоматологический осмотр",
        "Очистка зубного камня",
        "Фтор для детей",
        "Зубная щетка и зубная паста",
      ],
      doctorSpecialty: "Детский стоматолог, волонтеры здоровья",
      doctorVerifiedDate: "6 ноября 2026 г.",
      tags: ["Стоматология", "Педиатрия", "Бесплатная профилактика", "Сообщество"],
    },
    "campanie-vaccinare-hpv-national": {
      title: "Вакцина против ВПЧ бесплатна для девочек и мальчиков по всей стране.",
      summary: "Дети в возрасте 11–18 лет могут получить вакцину против ВПЧ бесплатно. Спросите своего семейного врача.",
      content: [
        "Вакцина против ВПЧ предотвращает более 90% случаев рака шейки матки и других изменений, которые могут перерасти в рак.",
        "Это бесплатно для девочек и мальчиков до 18 лет. Вы можете обратиться за этим к своему семейному врачу.",
        "Если клиника находится далеко, медицинский посредник поможет вам попросить ее и забронировать визит.",
      ],
      preventiveSteps: [
        "Попросите вашего семейного врача сделать вам вакцину.",
        "Забронируйте обе дозы в те даты, которые вам назначит врач.",
        "Поговорите со своим ребенком о том, от чего его защищает вакцина.",
      ],
      doctorSpecialty: "Старший акушер-гинеколог и врач общественного здравоохранения",
      doctorVerifiedDate: "5 ноября 2026 г.",
      tags: ["Вакцинация против ВПЧ", "Подростки", "Профилактика рака", "Руководство для родителей"],
    },
    "sfat-calitate-aer-respirator-bucuresti": {
      title: "Дни смога в Бухаресте: как защитить легкие",
      summary: "Советы для людей, страдающих астмой, хроническим бронхитом или сердечно-сосудистыми заболеваниями, в дни смога и тумана.",
      content: [
        "Холодными осенними и зимними утрами в больших городах грязный воздух остается низко, близко к земле.",
        "Если у вас заболевание легких или есть маленькие дети, избегайте тяжелых физических упражнений на открытом воздухе с 07:00 до 09:30 утра.",
        "Дома не курите и не жгите мусор в печи. Следите за тем, чтобы воздух не был слишком сухим и не слишком влажным.",
      ],
      preventiveSteps: [
        "Избегайте тяжелых физических упражнений на свежем воздухе рано утром.",
        "Всегда держите прописанный вам ингалятор при себе.",
        "Позвоните своему врачу или медиатору, если кашель не проходит.",
      ],
      doctorSpecialty: "Старший пульмонолог, Институт Мариуса Насты",
      doctorVerifiedDate: "7 ноября 2026 г.",
      tags: ["Пульмонология", "Городское загрязнение", "Астма", "Практические советы"],
    },
  },

  en: {
    "alert-rujeola-iasi": {
      title: "More children with measles in Iași county",
      summary: "Iași public health office reports measles in unvaccinated children. The MMR vaccine is free at your family doctor.",
      content: [
        "In the last 2 weeks, clinics and hospitals in Iași county have seen more children with measles. Most go to nursery or school.",
        "Measles is a virus that spreads very easily. It can lead to pneumonia or swelling of the brain (encephalitis). The MMR vaccine (measles, mumps, rubella) protects safely and well, for life.",
        "Look at your child's vaccination booklet. Call your family doctor or health mediator to book a visit.",
      ],
      preventiveSteps: [
        "Ask your family doctor which vaccines your child is missing",
        "If your child has a fever and a red rash, keep them away from crowded places",
        "Call the doctor or mediator before you take them to the clinic",
      ],
      doctorSpecialty: "Senior epidemiologist, Iași Public Health Directorate",
      doctorVerifiedDate: "4 November 2026",
      tags: ["MMR vaccination", "Pediatrics", "Public health", "Prevention"],
    },
    "caravana-galati-barcea": {
      title: "Mobile clinic comes to Barcea and Ivești",
      summary: "Free check-ups, blood sugar tests and ECG in the village. You do not need a health card or insurance.",
      content: [
        "Doctors and health mediators bring the mobile clinic to the villages of Barcea and Ivești. They check you for free.",
        "Everything is free. You can come even without insurance or a family doctor. Bring your ID card or your child's birth certificate.",
      ],
      caravanLandmark: "Yard of the village hall, next to the school",
      caravanVillage: "Barcea commune",
      freeServices: [
        "Blood pressure",
        "Blood sugar test",
        "ECG",
        "Check-up for children",
      ],
      doctorSpecialty: "Family doctor, mobile clinic coordinator",
      doctorVerifiedDate: "5 November 2026",
      tags: ["Mobile clinic", "Free tests", "Community", "Healthcare access"],
    },
    "campanie-antigripala-nationala": {
      title: "Flu jabs are now given in every county",
      summary: "If you have a long-term illness, are pregnant or are over 65, the flu vaccine is 100% covered.",
      content: [
        "Flu can be serious if you have diabetes, high blood pressure, or lung or heart disease.",
        "Your family doctor gives you the 100% covered prescription. You get the jab at the doctor's office or at an approved pharmacy.",
        "If you have no family doctor, the health mediator helps you register with a doctor near you.",
      ],
      preventiveSteps: [
        "Ask your family doctor for the covered prescription",
        "Wash your hands often with soap and water, for 20 seconds",
        "Open the windows at least 3 times a day",
      ],
      doctorSpecialty: "Infectious disease specialist, Matei Balș Institute",
      doctorVerifiedDate: "28 October 2026",
      tags: ["Influenza", "Subsidized vaccine", "Chronic illness", "Seniors"],
    },
    "sfat-sezon-raceli-copii": {
      title: "Cold or flu in children: how to tell",
      summary: "A high fever that comes on suddenly, with aching muscles, usually means flu, not a cold.",
      content: [
        "A cold comes on slowly: a blocked nose, sneezing, feeling a bit unwell. Fever is low or there is none.",
        "Flu comes on suddenly, within hours: high fever (above 38.5°C), headache, aching muscles and great tiredness.",
        "Give your child plenty to drink: warm tea, water, vegetable soup. Do not give antibiotics without a prescription. Antibiotics do not kill viruses.",
      ],
      preventiveSteps: [
        "Give your child warm drinks often",
        "If your child breathes fast, take them to a doctor urgently",
        "Give fever medicine only as the doctor told you",
      ],
      doctorSpecialty: "Paediatrician",
      doctorVerifiedDate: "2 November 2026",
      tags: ["Pediatrics", "Parent guide", "Appropriate treatment", "No antibiotics"],
    },
    "alerta-hepatita-cluj": {
      title: "Villages in Cluj: boil your well water",
      summary: "After the floods, boil water from wells that the health office has not tested.",
      content: [
        "The Cluj public health office asks people in villages to drink and cook only with boiled, cooled water if it comes from a shallow well.",
        "Hepatitis A spreads through dirty water or food and unwashed hands. Washing your hands well stops it spreading.",
      ],
      preventiveSteps: [
        "Boil well water for at least 10 minutes before you drink it",
        "Wash fruit and vegetables only in safe water",
        "Wash your hands before eating and after using the toilet",
      ],
      doctorSpecialty: "Hygiene specialist, Cluj Public Health Directorate",
      doctorVerifiedDate: "30 October 2026",
      tags: ["Hygiene", "Safe water", "Hepatitis A", "Prevention"],
    },
    "caravana-stomatologica-bucuresti-ilfov": {
      title: "Free dentist for children in Bucharest and Ilfov",
      summary: "Free dental check-ups, cleaning and tooth-brushing advice for children and adults without insurance.",
      content: [
        "A dental surgery on wheels comes to the neighbourhood. Teeth are checked and cleaned for free.",
        "Children learn how to brush properly and get a fluoride gel. If a tooth hurts, they get a small treatment on the spot.",
        "It is free. You do not need insurance or a health card. Parents should bring their ID card.",
      ],
      caravanLandmark: "Car park of the community clinic, main lane",
      caravanVillage: "Sector 5 and Jilava commune",
      freeServices: [
        "Dental check-up",
        "Tartar cleaning",
        "Fluoride for children",
        "Toothbrush and toothpaste",
      ],
      doctorSpecialty: "Pediatric dentist, Health Volunteers",
      doctorVerifiedDate: "6 November 2026",
      tags: ["Dentistry", "Pediatrics", "Free prevention", "Community"],
    },
    "campanie-vaccinare-hpv-national": {
      title: "The HPV vaccine is free for girls and boys across the country",
      summary: "Children aged 11–18 can get the HPV vaccine for free. Ask your family doctor.",
      content: [
        "The HPV vaccine prevents more than 90% of cervical cancers and other changes that can turn into cancer.",
        "It is free for girls and boys up to age 18. You ask for it at your family doctor.",
        "If the clinic is far away, the health mediator helps you ask for it and book the visit.",
      ],
      preventiveSteps: [
        "Ask your family doctor for the vaccine",
        "Book both doses, on the dates the doctor gives you",
        "Talk with your child about what the vaccine protects them from",
      ],
      doctorSpecialty: "Senior obstetrician-gynecologist and public health physician",
      doctorVerifiedDate: "5 November 2026",
      tags: ["HPV vaccination", "Adolescents", "Cancer prevention", "Parent guide"],
    },
    "sfat-calitate-aer-respirator-bucuresti": {
      title: "Smog days in Bucharest: how to protect your lungs",
      summary: "Advice for people with asthma, chronic bronchitis or heart disease, on days with smog and fog.",
      content: [
        "On cold autumn and winter mornings, dirty air stays low, close to the ground, in big cities.",
        "If you have a lung condition or young children, avoid hard exercise outdoors between 07:00 and 09:30 in the morning.",
        "At home, do not smoke and do not burn rubbish in the stove. Keep the air neither too dry nor too damp.",
      ],
      preventiveSteps: [
        "Avoid hard exercise outdoors early in the morning",
        "Always keep your prescribed inhaler with you",
        "Call your doctor or mediator if a cough does not go away",
      ],
      doctorSpecialty: "Senior pulmonologist, Marius Nasta Institute",
      doctorVerifiedDate: "7 November 2026",
      tags: ["Pulmonology", "Urban pollution", "Asthma", "Practical tips"],
    },
    ...NEWS_TRANSLATIONS_EXTRA_EN,
  },
  sq: {
    "alert-rujeola-iasi": {
      title: "Më shumë fëmijë me fruth në qarkun Iași",
      summary: "Shëndeti publik në Iași njofton raste fruthi te fëmijë të pavaksinuar. Vaksina MMR është falas te mjeku i familjes.",
      content: [
        "Në 2 javët e fundit, klinikat dhe spitalet në qarkun Iași kanë parë më shumë fëmijë me fruth. Shumica shkojnë në kopsht ose në shkollë.",
        "Fruthi është një virus që ngjitet shumë lehtë. Mund të sjellë pneumoni ose ënjtje të trurit (encefalit). Vaksina MMR (fruth, shyta, rubeolë) mbron në mënyrë të sigurt dhe të mirë, për gjithë jetën.",
        "Shiko librezën e vaksinave të fëmijës. Telefono mjekun e familjes ose mediatorin shëndetësor që të caktosh një vizitë.",
      ],
      preventiveSteps: [
        "Pyet mjekun e familjes cilat vaksina i mungojnë fëmijës",
        "Nëse fëmija ka temperaturë dhe puçrra të kuqe, mbaje larg vendeve me shumë njerëz",
        "Telefono mjekun ose mediatorin para se ta çosh në klinikë",
      ],
      doctorSpecialty: "Epidemiologe kryesore, Drejtoria e Shëndetit Publik Iași",
      doctorVerifiedDate: "4 nëntor 2026",
      tags: ["Vaksinimi MMR", "Pediatri", "Shëndet publik", "Parandalim"],
    },
    "caravana-galati-barcea": {
      title: "Karvani mjekësor vjen në Barcea dhe Ivești",
      summary: "Vizita falas, test i sheqerit në gjak dhe EKG në fshat. Nuk të duhet kartë shëndetësore apo sigurim.",
      content: [
        "Mjekë dhe mediatorë shëndetësorë vijnë me karvanin në fshatrat Barcea dhe Ivești. Të vizitojnë falas.",
        "Gjithçka është falas. Mund të vish edhe pa sigurim apo pa mjek familjeje. Merr me vete letërnjoftimin ose certifikatën e lindjes së fëmijës.",
      ],
      caravanLandmark: "Në oborrin e shtëpisë së kulturës, pranë shkollës",
      caravanVillage: "Komuna Barcea",
      freeServices: [
        "Tensioni",
        "Sheqeri në gjak",
        "EKG",
        "Vizitë për fëmijë",
      ],
      doctorSpecialty: "Mjek familjeje, koordinator i karvanit",
      doctorVerifiedDate: "5 nëntor 2026",
      tags: ["Karvan mjekësor", "Analiza falas", "Komunitet", "Akses mjekësor"],
    },
    "campanie-antigripala-nationala": {
      title: "Vaksina e gripit bëhet tani në çdo qark",
      summary: "Nëse ke një sëmundje kronike, je shtatzënë ose ke mbi 65 vjeç, vaksina e gripit paguhet 100%.",
      content: [
        "Gripi mund të jetë i rëndë nëse ke diabet, tension të lartë ose sëmundje të mushkërive a të zemrës.",
        "Mjeku i familjes të jep recetën e paguar 100%. Vaksinohesh te mjeku ose në një farmaci të autorizuar.",
        "Nëse nuk ke mjek familjeje, mediatori shëndetësor të ndihmon të regjistrohesh te një mjek afër teje.",
      ],
      preventiveSteps: [
        "Kërkoji mjekut të familjes recetën e paguar",
        "Laji duart shpesh me ujë dhe sapun, 20 sekonda",
        "Hap dritaret të paktën 3 herë në ditë",
      ],
      doctorSpecialty: "Specialiste e sëmundjeve infektive, Instituti Matei Balș",
      doctorVerifiedDate: "28 tetor 2026",
      tags: ["Grip", "Vaksinim i rimbursuar", "Sëmundje kronike", "Të moshuar"],
    },
    "sfat-sezon-raceli-copii": {
      title: "Ftohje apo grip te fëmijët: si t'i dallosh",
      summary: "Temperatura e lartë që vjen papritur dhe dhimbjet e muskujve zakonisht tregojnë grip, jo ftohje.",
      content: [
        "Ftohja vjen ngadalë: hunda zihet, fëmija teshtin dhe është pak i lodhur. Temperatura është e ulët ose nuk ka fare.",
        "Gripi vjen papritur, brenda pak orësh: temperaturë e lartë (mbi 38,5°C), dhimbje koke, dhimbje muskujsh dhe lodhje e madhe.",
        "Jepi fëmijës shumë për të pirë: çaj të ngrohtë, ujë, supë perimesh. Mos i jep antibiotikë pa recetë. Antibiotikët nuk vrasin viruset.",
      ],
      preventiveSteps: [
        "Jepi fëmijës shpesh pije të ngrohta",
        "Nëse merr frymë shpejt, çoje urgjent te mjeku",
        "Jepi ilaç për temperaturën vetëm si të ka thënë mjeku",
      ],
      doctorSpecialty: "Mjek pediatër",
      doctorVerifiedDate: "2 nëntor 2026",
      tags: ["Pediatri", "Udhëzues prindëror", "Trajtim i duhur", "Pa antibiotikë"],
    },
    "alerta-hepatita-cluj": {
      title: "Fshatrat e Cluj: zieje ujin e pusit",
      summary: "Pas përmbytjeve, zieje ujin e puseve që nuk i ka kontrolluar shëndeti publik.",
      content: [
        "Shëndeti publik në Cluj u kërkon banorëve të fshatrave të pinë dhe të gatuajnë vetëm me ujë të zier dhe të ftohur, nëse uji vjen nga një pus i cekët.",
        "Hepatiti A merret nga uji ose ushqimi i ndotur dhe nga duart e palara. Kur i lan mirë duart, sëmundja nuk përhapet.",
      ],
      preventiveSteps: [
        "Zieje ujin e pusit të paktën 10 minuta para se ta pish",
        "Laji frutat dhe perimet vetëm me ujë të sigurt",
        "Laji duart para se të hash dhe pas tualetit",
      ],
      doctorSpecialty: "Mjeke higjeniste, Drejtoria e Shëndetit Publik Cluj",
      doctorVerifiedDate: "30 tetor 2026",
      tags: ["Higjienë", "Ujë i pijshëm", "Hepatiti A", "Parandalim"],
    },
    "caravana-stomatologica-bucuresti-ilfov": {
      title: "Dentist falas për fëmijë në Bukuresht dhe Ilfov",
      summary: "Kontroll i dhëmbëve, pastrim dhe këshilla për larjen e dhëmbëve, falas, për fëmijë dhe të rritur pa sigurim.",
      content: [
        "Një klinikë dentare me rrota vjen në lagje. Dhëmbët kontrollohen dhe pastrohen falas.",
        "Fëmijët mësojnë si t'i lajnë mirë dhëmbët dhe marrin një xhel me fluor. Nëse u dhemb një dhëmb, marrin një trajtim të vogël aty për aty.",
        "Është falas. Nuk të duhet sigurim apo kartë shëndetësore. Prindërit të vijnë me letërnjoftim.",
      ],
      caravanLandmark: "Parkingu i qendrës shëndetësore të komunitetit, rruga kryesore",
      caravanVillage: "Sektori 5 dhe Komuna Jilava",
      freeServices: [
        "Kontroll i dhëmbëve",
        "Pastrim i gurëzave",
        "Fluor për fëmijë",
        "Furçë dhe pastë dhëmbësh",
      ],
      doctorSpecialty: "Dentist pediatrik, Vullnetarët për Shëndetin",
      doctorVerifiedDate: "6 nëntor 2026",
      tags: ["Stomatologji", "Pediatri", "Parandalim falas", "Komunitet"],
    },
    "campanie-vaccinare-hpv-national": {
      title: "Vaksina HPV është falas për vajza dhe djem në gjithë vendin",
      summary: "Fëmijët 11–18 vjeç mund ta bëjnë falas vaksinën HPV. Kërkoje te mjeku i familjes.",
      content: [
        "Vaksina HPV parandalon më shumë se 90% të kancereve të qafës së mitrës dhe ndryshime të tjera që mund të bëhen kancer.",
        "Është falas për vajzat dhe djemtë deri në 18 vjeç. E kërkon te mjeku i familjes.",
        "Nëse klinika është larg, mediatori shëndetësor të ndihmon ta kërkosh dhe të caktosh vizitën.",
      ],
      preventiveSteps: [
        "Kërkoja vaksinën mjekut të familjes",
        "Cakto të dyja dozat, në datat që të jep mjeku",
        "Fol me fëmijën se nga çfarë e mbron vaksina",
      ],
      doctorSpecialty: "Mjeke kryesore obstetër-gjinekologe dhe shëndet publik",
      doctorVerifiedDate: "5 nëntor 2026",
      tags: ["Vaksinimi HPV", "Adoleshentë", "Parandalimi i kancerit", "Udhëzues prindëror"],
    },
    "sfat-calitate-aer-respirator-bucuresti": {
      title: "Ditë me smog në Bukuresht: si t'i mbrosh mushkëritë",
      summary: "Këshilla për ata që kanë astmë, bronkit kronik ose sëmundje zemre, në ditët me smog dhe mjegull.",
      content: [
        "Në mëngjeset e ftohta të vjeshtës dhe dimrit, ajri i ndotur qëndron poshtë, afër tokës, në qytetet e mëdha.",
        "Nëse ke sëmundje të mushkërive ose fëmijë të vegjël, mos bëj lodhje të madhe jashtë nga ora 07:00 deri në 09:30 të mëngjesit.",
        "Në shtëpi mos pi duhan dhe mos digj plehra në sobë. Mbaje ajrin as shumë të thatë, as shumë të lagësht.",
      ],
      preventiveSteps: [
        "Mos bëj lodhje të madhe jashtë herët në mëngjes",
        "Mbaje gjithmonë me vete inhalatorin nga mjeku",
        "Telefono mjekun ose mediatorin nëse kolla nuk të kalon",
      ],
      doctorSpecialty: "Pneumolog kryesor, Instituti Marius Nasta",
      doctorVerifiedDate: "7 nëntor 2026",
      tags: ["Pneumologji", "Ndotje urbane", "Astmë", "Këshilla praktike"],
    },
    ...NEWS_TRANSLATIONS_EXTRA_SQ,
  },
  it: {
    "alert-rujeola-iasi": {
      title: "Più bambini con il morbillo nella provincia di Iași",
      summary: "La sanità pubblica di Iași segnala casi di morbillo in bambini non vaccinati. Il vaccino MPR è gratis dal medico di famiglia.",
      content: [
        "Nelle ultime 2 settimane, ambulatori e ospedali della provincia di Iași hanno visto più bambini con il morbillo. Quasi tutti vanno all'asilo o a scuola.",
        "Il morbillo è un virus che si prende molto facilmente. Può portare alla polmonite o a un'infiammazione del cervello (encefalite). Il vaccino MPR (morbillo, parotite, rosolia) protegge in modo sicuro ed efficace, per tutta la vita.",
        "Guarda il libretto delle vaccinazioni di tuo figlio. Chiama il medico di famiglia o il mediatore sanitario per prendere un appuntamento.",
      ],
      preventiveSteps: [
        "Chiedi al medico di famiglia quali vaccini mancano a tuo figlio",
        "Se tuo figlio ha febbre e macchie rosse sulla pelle, tienilo lontano dai posti affollati",
        "Chiama il medico o il mediatore prima di portarlo in ambulatorio",
      ],
      doctorSpecialty: "Medico epidemiologo primario, Direzione di Sanità Pubblica Iași",
      doctorVerifiedDate: "4 novembre 2026",
      tags: ["Vaccinazione MPR", "Pediatria", "Sanità pubblica", "Prevenzione"],
    },
    "caravana-galati-barcea": {
      title: "L'ambulatorio mobile arriva a Barcea e Ivești",
      summary: "Visite gratis, test dello zucchero nel sangue ed ECG in paese. Non servono tessera sanitaria o assicurazione.",
      content: [
        "Medici e mediatori sanitari portano l'ambulatorio mobile nei paesi di Barcea e Ivești. Ti visitano gratis.",
        "È tutto gratis. Puoi venire anche senza assicurazione o medico di famiglia. Porta la carta d'identità o il certificato di nascita del bambino.",
      ],
      caravanLandmark: "Nel cortile del centro culturale, vicino alla scuola",
      caravanVillage: "Comune di Barcea",
      freeServices: [
        "Pressione",
        "Zucchero nel sangue",
        "ECG",
        "Visita per bambini",
      ],
      doctorSpecialty: "Medico di famiglia, coordinatore dell'ambulatorio mobile",
      doctorVerifiedDate: "5 novembre 2026",
      tags: ["Carovana medica", "Esami gratuiti", "Comunità", "Accesso alle cure"],
    },
    "campanie-antigripala-nationala": {
      title: "Il vaccino antinfluenzale si fa ora in tutte le province",
      summary: "Se hai una malattia cronica, sei incinta o hai più di 65 anni, il vaccino antinfluenzale è rimborsato al 100%.",
      content: [
        "L'influenza può essere grave se hai diabete, pressione alta o malattie dei polmoni o del cuore.",
        "Il medico di famiglia ti fa la ricetta rimborsata al 100%. Ti vaccini in ambulatorio o in una farmacia autorizzata.",
        "Se non hai un medico di famiglia, il mediatore sanitario ti aiuta a iscriverti da un medico della zona.",
      ],
      preventiveSteps: [
        "Chiedi la ricetta rimborsata al medico di famiglia",
        "Lavati spesso le mani con acqua e sapone, per 20 secondi",
        "Apri le finestre almeno 3 volte al giorno",
      ],
      doctorSpecialty: "Specialista in malattie infettive, Istituto Matei Balș",
      doctorVerifiedDate: "28 ottobre 2026",
      tags: ["Influenza", "Vaccino rimborsato", "Malattie croniche", "Anziani"],
    },
    "sfat-sezon-raceli-copii": {
      title: "Raffreddore o influenza nei bambini: come capirlo",
      summary: "La febbre alta che arriva all'improvviso, con dolori ai muscoli, di solito è influenza, non raffreddore.",
      content: [
        "Il raffreddore arriva piano: naso chiuso, starnuti, un po' di malessere. La febbre è bassa o non c'è.",
        "L'influenza arriva all'improvviso, in poche ore: febbre alta (sopra 38,5°C), mal di testa, dolori ai muscoli e grande stanchezza.",
        "Fai bere molto il bambino: tè tiepido, acqua, brodo di verdure. Non dargli antibiotici senza ricetta. Gli antibiotici non uccidono i virus.",
      ],
      preventiveSteps: [
        "Dai spesso al bambino bevande tiepide",
        "Se respira veloce, portalo subito dal medico",
        "Dagli medicine per la febbre solo come ti ha detto il medico",
      ],
      doctorSpecialty: "Pediatra",
      doctorVerifiedDate: "2 novembre 2026",
      tags: ["Pediatria", "Guida per genitori", "Terapia corretta", "Senza antibiotici"],
    },
    "alerta-hepatita-cluj": {
      title: "Paesi intorno a Cluj: fai bollire l'acqua del pozzo",
      summary: "Dopo le alluvioni, fai bollire l'acqua dei pozzi non controllati dalla sanità pubblica.",
      content: [
        "La sanità pubblica di Cluj chiede a chi vive nei paesi di bere e cucinare solo con acqua bollita e raffreddata, se viene da un pozzo poco profondo.",
        "L'epatite A si prende da acqua o cibo sporchi e da mani non lavate. Se ti lavi bene le mani, la malattia non si diffonde.",
      ],
      preventiveSteps: [
        "Fai bollire l'acqua del pozzo almeno 10 minuti prima di berla",
        "Lava frutta e verdura solo con acqua sicura",
        "Lavati le mani prima di mangiare e dopo il bagno",
      ],
      doctorSpecialty: "Medico igienista, Direzione di Sanità Pubblica Cluj",
      doctorVerifiedDate: "30 ottobre 2026",
      tags: ["Igiene", "Acqua potabile", "Epatite A", "Prevenzione"],
    },
    "caravana-stomatologica-bucuresti-ilfov": {
      title: "Dentista gratis per bambini a Bucarest e Ilfov",
      summary: "Controllo dei denti, pulizia e consigli per lavarli bene, gratis, per bambini e adulti senza assicurazione.",
      content: [
        "Uno studio dentistico su ruote arriva nel quartiere. I denti si controllano e si puliscono gratis.",
        "I bambini imparano a lavarsi bene i denti e ricevono un gel al fluoro. Se hanno mal di denti, ricevono una piccola cura sul posto.",
        "È gratis. Non servono assicurazione o tessera sanitaria. I genitori portano un documento d'identità.",
      ],
      caravanLandmark: "Parcheggio del consultorio comunitario, viale principale",
      caravanVillage: "Settore 5 e Comune di Jilava",
      freeServices: [
        "Controllo dei denti",
        "Pulizia del tartaro",
        "Fluoro per bambini",
        "Spazzolino e dentifricio",
      ],
      doctorSpecialty: "Dentista pediatrico, Volontari per la Salute",
      doctorVerifiedDate: "6 novembre 2026",
      tags: ["Odontoiatria", "Pediatria", "Prevenzione gratuita", "Comunità"],
    },
    "campanie-vaccinare-hpv-national": {
      title: "Il vaccino HPV è gratis per ragazze e ragazzi in tutto il paese",
      summary: "I ragazzi dagli 11 ai 18 anni possono fare gratis il vaccino HPV. Chiedilo al medico di famiglia.",
      content: [
        "Il vaccino HPV previene oltre il 90% dei tumori del collo dell'utero e altre lesioni che possono diventare tumori.",
        "È gratis per ragazze e ragazzi fino a 18 anni. Lo chiedi al medico di famiglia.",
        "Se l'ambulatorio è lontano, il mediatore sanitario ti aiuta a fare la richiesta e a prenotare.",
      ],
      preventiveSteps: [
        "Chiedi il vaccino al medico di famiglia",
        "Prenota tutte e due le dosi, nelle date che ti dà il medico",
        "Parla con tuo figlio di cosa lo protegge il vaccino",
      ],
      doctorSpecialty: "Medico primario in ostetricia-ginecologia e salute pubblica",
      doctorVerifiedDate: "5 novembre 2026",
      tags: ["Vaccinazione HPV", "Adolescenti", "Prevenzione tumori", "Guida per genitori"],
    },
    "sfat-calitate-aer-respirator-bucuresti": {
      title: "Giorni di smog a Bucarest: come proteggere i polmoni",
      summary: "Consigli per chi ha asma, bronchite cronica o malattie di cuore, nei giorni di smog e nebbia.",
      content: [
        "Nelle mattine fredde d'autunno e d'inverno, l'aria sporca resta in basso, vicino a terra, nelle grandi città.",
        "Se hai una malattia dei polmoni o bambini piccoli, evita sforzi forti all'aperto tra le 07:00 e le 09:30 del mattino.",
        "In casa non fumare e non bruciare rifiuti nella stufa. Tieni l'aria né troppo secca né troppo umida.",
      ],
      preventiveSteps: [
        "Evita sforzi forti all'aperto la mattina presto",
        "Tieni sempre con te l'inalatore che ti ha dato il medico",
        "Chiama il medico o il mediatore se la tosse non passa",
      ],
      doctorSpecialty: "Pneumologo primario, Istituto Marius Nasta",
      doctorVerifiedDate: "7 novembre 2026",
      tags: ["Pneumologia", "Inquinamento urbano", "Asma", "Consigli pratici"],
    },
    ...NEWS_TRANSLATIONS_EXTRA_IT,
  },
  hr: NEWS_TRANSLATIONS_HR,
  rom: NEWS_TRANSLATIONS_ROM,
};

export function getLocalizedArticle(article: NewsArticle, lang: string = "ro"): NewsArticle {
  const isNational = isNationalCounty(article.county);
  const localizedCounty = isNational
    ? (LOCALIZED_COUNTY_ALL[lang] ?? "All counties")
    : article.county;

  const categoryLabel = NEWS_CATEGORY_LABELS[lang]?.[article.category] ?? article.category;

  if (lang === "ro") {
    return {
      ...article,
      categoryLabel,
      county: localizedCounty,
    };
  }

  const loc = LOCALIZED_NEWS_DATA[lang]?.[article.id];
  if (!loc) {
    return {
      ...article,
      categoryLabel,
      county: localizedCounty,
    };
  }

  return {
    ...article,
    categoryLabel,
    title: loc.title ?? article.title,
    summary: loc.summary ?? article.summary,
    content: loc.content ?? article.content,
    county: localizedCounty,
    tags: loc.tags ?? article.tags,
    preventiveSteps: loc.preventiveSteps ?? article.preventiveSteps,
    verifiedDoctor: {
      ...article.verifiedDoctor,
      specialty: loc.doctorSpecialty ?? article.verifiedDoctor.specialty,
      verifiedDate: loc.doctorVerifiedDate ?? article.verifiedDoctor.verifiedDate,
    },
    caravanDetails: article.caravanDetails
      ? {
          ...article.caravanDetails,
          village: loc.caravanVillage ?? article.caravanDetails.village,
          landmark: loc.caravanLandmark ?? article.caravanDetails.landmark,
          freeServices: loc.freeServices ?? article.caravanDetails.freeServices,
        }
      : undefined,
  };
}
