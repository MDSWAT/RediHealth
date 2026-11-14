import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export type BodyPartId = "head" | "chest" | "stomach" | "pelvis" | "back" | "arm" | "leg";
export type PartId = BodyPartId;

export type SeverityId = "mild" | "moderate" | "severe";
export type Severity = SeverityId;

export type DurationId = "today" | "days" | "weeks" | "chronic";
export type Duration = DurationId;

export type UrgencyLevel = "low" | "medium" | "high";
export type Urgency = UrgencyLevel;

export interface SymptomChoice {
  id: string;
  label: string;
  title: string;
  description: string;
  isRedFlag: boolean;
  selfCareTip: string;
  guidance: string;
}

export interface Viewer3DStrings {
  ariaLabel: string;
  loading: string;
  subModelInfo: string;
  front: string;
  back: string;
  perspective: string;
  rotate360: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  tip: string;
  searchPlaceholder?: string;
  selected3DStructure?: string;
  activeAreaPrefix?: string;
  leftSide?: string;
  rightSide?: string;
  selectRegionPrefix?: string;
  rotateTooltip?: string;
  layerHybrid?: string;
  layerMuscular?: string;
  layerOrgans?: string;
  layerSurface?: string;
  legendSkeletalMuscles?: string;
  legendTendonsJoints?: string;
  legendInternalOrgans?: string;
  legendSelectedStructure?: string;
}

export interface EmergencyStrings {
  badge: string;
  title: string;
  description: string;
  whyEmergencyPrefix: string;
  call112Now: string;
  continueReview: string;
}

export interface HealthCheckWizardUI {
  eyebrow: string;
  heading: string;
  subtitle: string;
  resetButton: string;
  backButton: string;
  nextButton: string;
  finishButton: string;
  stepIndicator: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  step1Question: string;
  step1Prompt: string;
  step2Question: string;
  step2Prompt: string;
  urgentBadge: string;
  step3Question: string;
  step3Prompt: string;
  severityHeading: string;
  durationHeading: string;
  step4Question: string;
  step4Prompt: string;
  summaryHeading: string;
  areaLabel: string;
  symptomLabel: string;
  intensityLabel: string;
  durationLabel: string;
  recommendationHeading: string;
  safeSelfCareHeading: string;
  copySummary: string;
  copied: string;
  sendWhatsApp: string;
  showDoctor: string;
  requestMediatorHelp: string;
  scheduleDoctor: string;
  readEducationalTopic: string;
  disclaimer: string;
  structure3DLabel?: string;
  sensationLabel?: string;
  triggersLabel?: string;
  specialtyLabel?: string;
  warningNoticeRedFlag?: string;
  warningNoticeSafe?: string;
  viewer3D: Viewer3DStrings;
  emergency: EmergencyStrings;
}

export interface HealthCheckWizardLocaleData {
  ui: HealthCheckWizardUI;
  bodyParts: Record<BodyPartId, { title: string; subtitle: string }>;
  symptomsByRegion: Record<BodyPartId, SymptomChoice[]>;
  symptoms: Record<BodyPartId, SymptomChoice[]>;
  severity: Record<SeverityId, { title: string; description: string }>;
  duration: Record<DurationId, { label: string; hint: string }>;
  urgency: Record<UrgencyLevel, { title: string; intro: string }>;
}

export type HealthCheckTranslations = HealthCheckWizardLocaleData;
export type HealthCheckDictionary = HealthCheckWizardLocaleData;

const rawTranslations = {
  ru: {
    "ui": {
      "eyebrow": "Проверка здоровья",
      "heading": "Проверьте свои симптомы",
      "subtitle": "Покажите на теле, где болит, и ответьте на несколько коротких вопросов. Тогда посмотрим, что делать дальше.",
      "resetButton": "Начать сначала",
      "backButton": "Назад",
      "nextButton": "Продолжить",
      "finishButton": "Посмотреть результат",
      "stepIndicator": "Шаг {current} из {total}",
      "step1Title": "Область тела",
      "step2Title": "Симптом",
      "step3Title": "Насколько сильно",
      "step4Title": "Результат",
      "step1Question": "Где вы чувствуете боль или дискомфорт?",
      "step1Prompt": "Коснитесь области тела или выберите ее из списка.",
      "step2Question": "Что из этого ближе всего к тому, что вы чувствуете?",
      "step2Prompt": "Выберите симптом, который беспокоит вас больше всего.",
      "urgentBadge": "Тревожный признак",
      "step3Question": "Насколько сильно и как давно?",
      "step3Prompt": "Выберите по одному варианту в каждой группе.",
      "severityHeading": "Насколько сильно?",
      "durationHeading": "Как давно это у вас?",
      "step4Question": "Что вы можете сделать сейчас",
      "step4Prompt": "Судя по вашим ответам. Это не диагноз.",
      "summaryHeading": "Краткое изложение ваших ответов",
      "areaLabel": "Область тела",
      "symptomLabel": "Симптом",
      "intensityLabel": "Насколько сильно",
      "durationLabel": "Как давно",
      "recommendationHeading": "Что делать дальше",
      "safeSelfCareHeading": "Что можно делать дома",
      "copySummary": "Копировать сводку",
      "copied": "Скопировано",
      "sendWhatsApp": "Поделиться в WhatsApp",
      "showDoctor": "Покажи врачу",
      "requestMediatorHelp": "Поговорите с посредником",
      "scheduleDoctor": "Запись к врачу онлайн",
      "readEducationalTopic": "Прочитать руководство",
      "disclaimer": "Это не диагноз. Если вы чувствуете себя хуже или боль очень сильная, позвоните 112.",
      "viewer3D": {
        "ariaLabel": "3D-модель тела. Поверните её и нажмите там, где болит.",
        "loading": "Загрузка 3D-модели ({progress}%)",
        "subModelInfo": "3D-модель тела",
        "front": "Спереди",
        "back": "Назад",
        "perspective": "Угол",
        "rotate360": "360°",
        "zoomIn": "Увеличить масштаб",
        "zoomOut": "Уменьшить масштаб",
        "resetView": "Сбросить вид",
        "tip": "Перетащите влево или вправо, чтобы повернуть тело. Постучите там, где болит.",
        "searchPlaceholder": "Найдите орган или мышцу (например, сердце, бицепс)",
        "selected3DStructure": "Вы выбрали:",
        "activeAreaPrefix": "Область тела:",
        "leftSide": "Слева",
        "rightSide": "Справа",
        "selectRegionPrefix": "Выберите",
        "rotateTooltip": "Поворот корпуса на 180°",
        "layerHybrid": "Мышцы и органы",
        "layerMuscular": "Мышцы и сухожилия",
        "layerOrgans": "Внутренние органы",
        "layerSurface": "Кожа",
        "legendSkeletalMuscles": "Мышцы",
        "legendTendonsJoints": "Сухожилия и суставы",
        "legendInternalOrgans": "Внутренние органы",
        "legendSelectedStructure": "Выбранная структура"
      },
      "emergency": {
        "badge": "Скорая медицинская помощь 112",
        "title": "Это может быть чрезвычайная ситуация: позвоните 112 прямо сейчас.",
        "description": "Не ждите. Если вы не можете позвонить, немедленно обратитесь в отделение неотложной помощи. Не садитесь за руль.",
        "whyEmergencyPrefix": "Вы выбрали:",
        "call112Now": "Позвоните 112 сейчас",
        "continueReview": "Я понимаю"
      },
      "structure3DLabel": "3D-структура",
      "sensationLabel": "ощущение",
      "triggersLabel": "Что делает это хуже",
      "specialtyLabel": "Специалист, которого стоит увидеть",
      "warningNoticeRedFlag": "Об этом сообщили знаки аварийной сигнализации.",
      "warningNoticeSafe": "Никаких предупредительных знаков аварийной ситуации не поступало."
    },
    "bodyParts": {
"pelvis": {"title":"Таз и нижняя часть живота","subtitle":"Менструальная боль, яичники, жжение при мочеиспускании, пах или интимная область"},

      "head": {
        "title": "Голова и шея",
        "subtitle": "Головные боли, ригидность шеи, головокружение или нечеткость зрения."
      },
      "chest": {
        "title": "Грудная клетка и дыхание",
        "subtitle": "Давление в груди, затрудненное дыхание или учащенное сердцебиение"
      },
      "stomach": {
        "title": "Желудок и брюшная полость",
        "subtitle": "Изжога, судороги, тошнота, вздутие живота или боль в животе"
      },
      "back": {
        "title": "Спина и позвоночник",
        "subtitle": "Боль в пояснице, напряжение мышц или боль между лопатками."
      },
      "arm": {
        "title": "Руки и руки",
        "subtitle": "Онемение, боль в плечах или локтях или опухшие суставы."
      },
      "leg": {
        "title": "Ноги и ступни",
        "subtitle": "Боль в колене, опухшая лодыжка или проблемы с ходьбой."
      }
    },
    "symptomsByRegion": {
  "head": [
    {
      "id": "head_migraine",
      "label": "Пульсирующая боль на одной стороне головы с тошнотой или чувствительностью к свету.",
      "isRedFlag": false,
      "selfCareTip": "Отдохните в тихой темной комнате. Выпейте немного воды и приложите прохладную ткань ко лбу.",
      "guidance": "Это похоже на мигрень. Если оно продолжает возвращаться, спросите своего семейного врача о лечении, которое его предотвратит.",
      "title": "Мигрень или пульсирующая боль",
      "description": "Пульсирующая боль, обычно с одной стороны головы. Свет или шум могут вас беспокоить, или вы можете почувствовать тошноту."
    },
    {
      "id": "head_tension",
      "label": "Давление, напоминающее тугую повязку вокруг головы, после стресса или усталости.",
      "isRedFlag": false,
      "selfCareTip": "Отдохните от экранов и осторожно потрите шею. Подышите свежим воздухом.",
      "guidance": "Часто это происходит из-за стресса, недостаточного сна или длительного пребывания за столом.",
      "title": "Стрессовая головная боль",
      "description": "Давление, напоминающее тугую повязку на лбу или висках. Часто после стресса, долгого времени перед экраном или напряжения в шее."
    },
    {
      "id": "head_dehydration",
      "label": "Тупая, постоянная боль после жаркого дня или после употребления слишком малого количества воды.",
      "isRedFlag": false,
      "selfCareTip": "Медленно выпейте 1–2 больших стакана воды или теплого чая. Избегайте напитков с кофеином или сахаром.",
      "guidance": "Оно часто проходит, если пить воду и держаться подальше от жары.",
      "title": "Головная боль от жары или жажды",
      "description": "Тупая боль во всей голове, усиливающаяся при движении. Часто после солнца, жары или недостаточного питья воды."
    },
    {
      "id": "head_fever",
      "label": "Головная боль с лихорадкой, ознобом или заложенностью носа",
      "isRedFlag": false,
      "selfCareTip": "Ложитесь в постель, проверяйте температуру и пейте много жидкости.",
      "guidance": "Это может быть простуда или вирус. Если температура поднимается выше 38,5°С или держится более 3 дней, обратитесь к врачу.",
      "title": "Головная боль с лихорадкой",
      "description": "У вас болит голова, температура, озноб, боли в теле или заложен нос."
    },
    {
      "id": "head_sudden_severe",
      "label": "Внезапная, очень сильная головная боль или головная боль с спутанностью сознания или слабостью.",
      "isRedFlag": true,
      "selfCareTip": "Сядьте в безопасном месте и позвоните 112 прямо сейчас.",
      "guidance": "Очень сильная головная боль, начавшаяся внезапно, требует неотложной помощи. Вам нужен врач сейчас.",
      "title": "Внезапная очень сильная головная боль.",
      "description": "Самая сильная головная боль в вашей жизни, достигающая полной силы за считанные секунды. Это может сопровождаться ригидностью шеи, помутнением зрения или спутанностью сознания."
    },
    {
      "id": "head_neck_stiff",
      "label": "Боль или скованность в шее при повороте головы",
      "isRedFlag": false,
      "selfCareTip": "Приложите тёплую ткань к задней поверхности шеи, расслабьте плечи и медленно поворачивайте голову без усилий. Избегайте слишком высоких подушек.",
      "guidance": "Это часто связано с напряжением мышц, неудобным положением во сне или долгой работой за экраном. Обратитесь к врачу, если онемение или покалывание распространяется на руку.",
      "title": "Боль или скованность в шее",
      "description": "Шея или затылок болят и плохо поворачиваются, особенно при наклоне головы; боль иногда отдаёт в плечо."
    },
    {
      "id": "head_throat_swallow",
      "label": "Боль при глотании, осиплость или болезненные лимфоузлы на шее",
      "isRedFlag": false,
      "selfCareTip": "Часто пейте тёплый чай или воду, дайте голосу отдохнуть, избегайте дыма и очень горячих или ледяных напитков.",
      "guidance": "Боль в горле чаще вызвана вирусом. Обратитесь к врачу при высокой температуре, белом налёте на миндалинах или затруднённом глотании слюны.",
      "title": "Боль в горле или при глотании",
      "description": "Горло щиплет или болит при глотании, голос становится хриплым, под челюстью могут появиться болезненные уплотнения."
    },
    {
      "id": "head_jaw_ear",
      "label": "Боль в ухе, челюстном суставе при жевании или давление в области щёк и носа",
      "isRedFlag": false,
      "selfCareTip": "Ешьте мягкую пищу, не вводите ватные палочки в ухо; можно приложить тёплую ткань снаружи к щеке.",
      "guidance": "Боль в ухе, перенапряжение челюстного сустава или заложенность пазух стоит обсудить с семейным врачом или стоматологом.",
      "title": "Боль в ухе, челюсти или пазухах",
      "description": "Ухо заложено или пульсирует, челюсть болит при жевании или широком открывании рта, либо ощущается давление в щеках и лбу."
    },
    {
      "id": "head_neck_red_flag",
      "label": "Скованность шеи с высокой температурой, светобоязнью, пятнами на коже или спутанностью сознания",
      "isRedFlag": true,
      "selfCareTip": "Лягте в спокойном месте и немедленно позвоните 112.",
      "guidance": "Сильная скованность шеи с высокой температурой или спутанностью сознания может указывать на серьёзную инфекцию и требует немедленной помощи в больнице.",
      "title": "Скованность шеи с высокой температурой или спутанностью сознания",
      "description": "Из-за скованности трудно наклонить подбородок к груди; одновременно есть высокая температура, рвота, сонливость или боль в глазах от яркого света."
    }
  ],
  "chest": [
    {
      "id": "chest_reflux",
      "label": "Жжение в груди или кислый привкус после еды или при наклоне",
      "isRedFlag": false,
      "selfCareTip": "Не ложитесь сразу после еды. Откажитесь на время от острой или кислой пищи и кофе.",
      "guidance": "Изжога обычно возникает из-за желудочной кислоты. Если это не пройдет, ваш семейный врач может назначить вам лечение.",
      "title": "Изжога",
      "description": "Жжение, поднимающееся от желудка к горлу. Хуже, когда вы наклоняетесь или после тяжелой или кислой еды."
    },
    {
      "id": "chest_exertion",
      "label": "Стеснение или давление в груди во время усилий или при подъеме по лестнице.",
      "isRedFlag": false,
      "selfCareTip": "Прекратите то, что вы делаете, сядьте и медленно дышите.",
      "guidance": "Давление в груди во время нагрузки должно быть проверено врачом, даже если оно быстро проходит после остановки.",
      "title": "Стеснение в груди при активности",
      "description": "Сжимание в середине груди при быстрой ходьбе, подъеме по лестнице или приложении усилий."
    },
    {
      "id": "chest_stitch",
      "label": "Острая боль с одной стороны грудной клетки, усиливающаяся при глубоком вдохе или кашле.",
      "isRedFlag": false,
      "selfCareTip": "Дышите спокойно в течение нескольких минут. Положите что-нибудь теплое на больное место.",
      "guidance": "Обычно это напряженная мышца, которая проходит сама по себе. Если дыхание станет затрудненным, позвоните 112.",
      "title": "Резкая боль при дыхании",
      "description": "Острая боль в одном месте грудной клетки, усиливающаяся при глубоком вдохе, кашле или повороте."
    },
    {
      "id": "chest_breast_pain",
      "label": "Болезненность, наполненность или краснота груди, боль при кормлении",
      "isRedFlag": false,
      "selfCareTip": "Носите мягкий поддерживающий бюстгальтер без тесных косточек; используйте теплую или прохладную ткань по комфорту.",
      "guidance": "Болезненность обеих желез часто связана с циклом. Если одна грудь красная и горячая и появилась температура, обратитесь к врачу сегодня.",
      "title": "Болезненность молочной железы",
      "description": "Грудь набухла или чувствительна перед менструацией либо одна железа болезненна и плотна при кормлении."
    },
    {
      "id": "chest_breast_lump",
      "label": "Новый узел, плотный участок, втяжение кожи груди или припухлость подмышки",
      "isRedFlag": false,
      "selfCareTip": "Не надавливайте и не растирайте участок. Запишите, когда впервые заметили его, для врача.",
      "guidance": "Большинство узлов доброкачественны, особенно у молодых женщин, но любой новый узел или изменение кожи либо соска требует осмотра.",
      "title": "Новый узел в груди или подмышке",
      "description": "Новый узел или утолщение в груди либо подмышке, втяжение кожи или необычное выделение из соска."
    },
    {
      "id": "chest_warning",
      "label": "Сильная боль в груди, распространяющаяся на левую руку, шею или челюсть, с одышкой.",
      "isRedFlag": true,
      "selfCareTip": "Позвоните 112 сейчас. Сядьте и ослабьте тесную одежду.",
      "guidance": "Эта боль в груди может быть сердечным приступом. Каждая минута имеет значение.",
      "title": "Сильная боль в груди, которая распространяется",
      "description": "Сильное давление в груди, которое распространяется на левую руку, шею, челюсть или спину. Это может сопровождаться холодным потом или одышкой."
    }
  ],
  "stomach": [
    {
      "id": "stomach_upper_reflux",
      "label": "Жжение или ощущение тяжести в верхней части желудка.",
      "isRedFlag": false,
      "selfCareTip": "Ешьте простую, легкую пищу. Пейте нехолодную воду и избегайте обильной и жирной еды.",
      "guidance": "Раздражение желудка является обычным явлением. Если это беспокоит вас каждый день, запишитесь на прием к врачу.",
      "title": "Жжение в верхней части желудка",
      "description": "Жжение или кислота под ребрами. Вы быстро чувствуете насыщение или ощущаете что-то кислое после еды."
    },
    {
      "id": "stomach_cramping_mild",
      "label": "Спазмы в животе со вздутием живота или более или менее частым посещением туалета.",
      "isRedFlag": false,
      "selfCareTip": "Выпейте мятный или ромашковый чай, положите что-нибудь теплое на живот и отдохните.",
      "guidance": "Короткие судороги обычно возникают из-за пищеварения или из-за того, что вы съели.",
      "title": "Спазмы и вздутие живота",
      "description": "Ваш живот время от времени сжимается, вы чувствуете себя раздутым, у вас есть газы или вы чаще или реже ходите в туалет."
    },
    {
      "id": "stomach_lower_sharp",
      "label": "Острая боль в одном месте, внизу справа живота.",
      "isRedFlag": true,
      "selfCareTip": "Пока вас не осмотрит врач, не принимайте сильные обезболивающие и не прикладывайте ничего горячего к животу.",
      "guidance": "Боль, которая сохраняется в нижней правой части живота, требует немедленного обращения к врачу. Это может быть аппендицит.",
      "title": "Боль внизу живота справа",
      "description": "Боль в нижней правой части живота, которая становится все сильнее и сильнее, когда вы кашляете, ходите или нажимаете на нее."
    },
    {
      "id": "stomach_severe_widespread",
      "label": "Сильная, постоянная боль в животе с повторяющейся рвотой, твердым животом или лихорадкой.",
      "isRedFlag": true,
      "selfCareTip": "Не ешьте и не пейте много. Немедленно обратитесь в отделение неотложной помощи или позвоните по номеру 112.",
      "guidance": "Очень сильная боль с твердым животом может потребовать экстренной операции.",
      "title": "Очень сильная боль в животе",
      "description": "Весь живот сильно болит и твердый, вас продолжает рвать или вы чувствуете близость к обмороку."
    }
  ],
  "pelvis": [
    {
      "id": "pelvis_period_cramps",
      "label": "Менструальные спазмы или циклическая боль внизу таза",
      "isRedFlag": false,
      "selfCareTip": "Приложите теплую грелку к низу живота, пейте теплые напитки и отдыхайте на боку с согнутыми коленями.",
      "guidance": "Легкие спазмы распространены, но мешающая работе, сну или учебе боль требует оценки гинеколога, в том числе на эндометриоз или миому.",
      "title": "Менструальные спазмы или ежемесячная боль",
      "description": "Спазмы или тупая боль внизу живота и спины перед менструацией или во время нее."
    },
    {
      "id": "pelvis_one_sided",
      "label": "Боль с одной стороны внизу таза, в области яичника или паха",
      "isRedFlag": false,
      "selfCareTip": "Отдохните от тяжестей и интенсивных нагрузок; при резкой боли избегайте горячих компрессов.",
      "guidance": "Причиной могут быть киста яичника, овуляция или растяжение паховых мышц; стоит обратиться к врачу.",
      "title": "Односторонняя боль в тазу или паху",
      "description": "Резкий укол или постоянная боль с одной стороны низа живота либо паха, иногда сильнее при движении."
    },
    {
      "id": "pelvis_urinary_burning",
      "label": "Жжение при мочеиспускании, мутная моча или очень частые позывы",
      "isRedFlag": false,
      "selfCareTip": "Пейте достаточно простой воды в течение дня, не задерживайте мочеиспускание. Избегайте кофе и газировки.",
      "guidance": "Это часто указывает на инфекцию мочевых путей. Семейный врач может проверить мочу и назначить лечение. При температуре или боли в спине обратитесь сегодня.",
      "title": "Жжение при мочеиспускании или частые позывы",
      "description": "Жжение, давление над лобковой костью или ощущение неполного опорожнения."
    },
    {
      "id": "pelvis_pressure_floor",
      "label": "Тяжесть, тянущее давление или болезненность тазового дна и интимной области",
      "isRedFlag": false,
      "selfCareTip": "Не поднимайте тяжести и не натуживайтесь в туалете. Носите дышащее хлопковое белье.",
      "guidance": "Тяжесть или болезненность распространены после родов, в менопаузе и при легких инфекциях; подходящая помощь может облегчить состояние.",
      "title": "Давление тазового дна или интимная болезненность",
      "description": "Тяжесть внизу таза, боль при сидении или раздражение интимной области."
    },
    {
      "id": "pelvis_pregnancy_bleeding",
      "label": "Внезапная сильная тазовая боль, обильное вагинальное кровотечение или боль при возможной беременности",
      "isRedFlag": true,
      "selfCareTip": "Безопасно лягте, не принимайте самостоятельно обезболивающие; звоните 112 или немедленно обращайтесь за экстренной помощью.",
      "guidance": "Сильная тазовая боль с обильной кровью, головокружением или возможной беременностью требует немедленной больничной помощи.",
      "title": "Сильная тазовая боль, кровотечение или беременность",
      "description": "Внезапная сильная боль внизу таза с кровью, головокружением, температурой либо резкая боль при подтвержденной или возможной беременности."
    }
  ],
  "back": [
    {
      "id": "back_strain_lift",
      "label": "Резкая боль в пояснице, которая началась сразу после поднятия чего-то тяжелого.",
      "isRedFlag": false,
      "selfCareTip": "Не сгибайтесь и не поднимайте тяжелые предметы. Отдыхайте, но также совершайте короткие прогулки. Используйте теплый компресс.",
      "guidance": "Это очень распространенное явление. Легкие движения помогают больше, чем пребывание в постели.",
      "title": "Боль в спине после подъема",
      "description": "Мышцы поясницы блокируются сразу после поднятия чего-то тяжелого или внезапного скручивания."
    },
    {
      "id": "back_chronic",
      "label": "Тупая боль в пояснице в течение нескольких недель.",
      "isRedFlag": false,
      "selfCareTip": "Делайте легкую растяжку спины. Отрегулируйте высоту стула и не сидите долго на месте.",
      "guidance": "Длительные боли в спине уменьшаются с помощью упражнений, показанных физиотерапевтом, и укрепления мышц живота.",
      "title": "Боль в спине, которая не пройдет",
      "description": "Тупая боль в пояснице в течение нескольких недель, усиливающаяся после длительного сидения или стояния."
    },
    {
      "id": "back_stiffness",
      "label": "Скованность в спине утром или после длительного сидения.",
      "isRedFlag": false,
      "selfCareTip": "Утром осторожно покачайте плечами и медленно согнитесь несколько раз, прежде чем начать день.",
      "guidance": "Часто это происходит из-за напряжения мышц или длительного нахождения в одном положении.",
      "title": "С утра спина напряжена",
      "description": "Ваша спина напряжена, когда вы просыпаетесь, и вам трудно сгибаться. Становится лучше после того, как вы немного подвигаетесь."
    },
    {
      "id": "back_severe_difficulty",
      "label": "Сильная боль в спине с онемением обеих ног, слабостью или потерей контроля над мочевым пузырем.",
      "isRedFlag": true,
      "selfCareTip": "Ложись и позвони 112 сейчас же.",
      "guidance": "Нервы в спине могут быть сильно пережаты. Вам срочно нужна больница.",
      "title": "Боль в спине и немеют ноги",
      "description": "Сильная боль в спине с онемением или слабостью в обеих ногах или новые проблемы с контролем мочи или стула."
    },
    {
      "id": "back_upper_blades",
      "label": "Боль, напряжение или жжение в верхней части спины или между лопатками",
      "isRedFlag": false,
      "selfCareTip": "Регулярно вставайте, мягко отводите плечи назад и прикладывайте тёплый компресс к верхней части спины.",
      "guidance": "Такая боль часто возникает после наклона над телефоном или столом либо ношения тяжёлой сумки на одном плече.",
      "title": "Боль в верхней части спины или между лопатками",
      "description": "Напряжение или ноющая боль высоко в спине и между лопатками, особенно после сидения или работы руками."
    },
    {
      "id": "back_flank_kidney",
      "label": "Односторонняя боль в спине или боку под рёбрами с температурой, тошнотой или жжением при мочеиспускании",
      "isRedFlag": false,
      "selfCareTip": "Пейте воду небольшими порциями и избегайте сильных противовоспалительных обезболивающих до осмотра врача.",
      "guidance": "Глубокая односторонняя боль под рёбрами, особенно с температурой или изменениями мочи, может быть связана с почками. Обратитесь к врачу сегодня.",
      "title": "Боль с одной стороны в боку или области почки",
      "description": "Глубокая боль с одной стороны спины под рёбрами, мало зависящая от позы; иногда с температурой или жжением при мочеиспускании."
    }
  ],
  "arm": [
    {
      "id": "arm_shoulder_elbow",
      "label": "Боль в плече при подъёме руки или в локте при захвате и переноске предметов",
      "isRedFlag": false,
      "selfCareTip": "Временно избегайте повторных подъёмов рук над головой и несколько ночей не спите на больном плече.",
      "guidance": "Часто это связано с раздражением сухожилия плеча или локтя. Обратитесь к врачу, если не можете поднять руку или боль длится больше недели.",
      "title": "Боль в плече или локте при движении",
      "description": "Плечо болит при подъёме руки или одевании; локоть болит при захвате или повороте предметов."
    },
    {
      "id": "arm_sprain",
      "label": "Боль в плече, локте или запястье после падения, поворота или удара",
      "isRedFlag": false,
      "selfCareTip": "Приложите к больному месту лед, завернутый в полотенце. Оставьте руку и держите ее поддержанной.",
      "guidance": "Легкие удары и растяжения обычно проходят через несколько дней, если дать суставу отдых.",
      "title": "Боль в запястьях или суставах после падения",
      "description": "Запястье, локоть или плечо болят и опухают после удара или падения на руки."
    },
    {
      "id": "arm_numbness",
      "label": "Легкое онемение или покалывание в пальцах после набора текста или использования телефона.",
      "isRedFlag": false,
      "selfCareTip": "Часто делайте 5-минутные перерывы. Встряхните руки и осторожно поверните запястья.",
      "guidance": "Это может быть защемление нерва на запястье. Сообщите своему врачу, если оно не пройдет.",
      "title": "Покалывание пальцев",
      "description": "Онемение или покалывание в большом, указательном и среднем пальцах, часто ночью или при наборе текста."
    },
    {
      "id": "arm_ache",
      "label": "Болят, устают мышцы рук после тяжелой физической работы или занятий спортом.",
      "isRedFlag": false,
      "selfCareTip": "Примите теплый душ, аккуратно разотрите мышцы и отдохните сутки.",
      "guidance": "Это нормально после необычных усилий. Проходит само собой через 2-3 дня.",
      "title": "Болят мышцы рук",
      "description": "Мышцы рук болят после необычных усилий, занятий спортом или переноски тяжелых вещей."
    },
    {
      "id": "arm_sudden_swelling",
      "label": "Внезапная слабость в одной руке, невозможность поднять ее или быстрый сильный отек.",
      "isRedFlag": true,
      "selfCareTip": "Не давите на руку. Позвоните 112 сейчас.",
      "guidance": "Внезапная слабость в руке может быть признаком инсульта или серьезной травмы.",
      "title": "Внезапная слабость в одной руке.",
      "description": "Внезапно вы не можете поднять или удержать одну руку. Это может сопровождаться опущенным лицом или невнятной речью."
    }
  ],
  "leg": [
    {
      "id": "leg_sprain",
      "label": "Опухшая или болезненная лодыжка после ошибки",
      "isRedFlag": false,
      "selfCareTip": "Положите ногу на подушку и положите на нее холодную ткань на 15 минут. Не налегайте на это всем своим весом.",
      "guidance": "Оставьте лодыжку на несколько дней. Если отек продолжает расти или вы не можете на него встать, сделайте рентген.",
      "title": "Вывихнутая лодыжка",
      "description": "Ваша лодыжка болит и опухает после того, как вы ее перевернули. Трудно стоять на ногах."
    },
    {
      "id": "leg_cramp",
      "label": "Болезненный мышечный спазм или внезапное напряжение в икрах ночью.",
      "isRedFlag": false,
      "selfCareTip": "Выпрямите ногу и осторожно потяните пальцы ног на себя. Потрите теленка и выпейте немного воды.",
      "guidance": "Судороги часто возникают после усталости, сильного потоотделения или недостаточного питья воды.",
      "title": "Судороги икроножных мышц",
      "description": "Икроножная мышца внезапно и болезненно напрягается, часто ночью или когда вы недостаточно выпили."
    },
    {
      "id": "leg_knee_ache",
      "label": "Боль в колене, идущая вниз по лестнице или после долгой ходьбы",
      "isRedFlag": false,
      "selfCareTip": "Не сидите на корточках и не носите тяжелые вещи. Носите удобную обувь на мягкой подошве.",
      "guidance": "Колени со временем изнашиваются. Помогают упражнения, укрепляющие мышцы ног.",
      "title": "Боль в колене при подъеме по лестнице",
      "description": "Колено болит, когда вы спускаетесь по лестнице, приседаете или после долгого сидения с согнутыми коленями."
    },
    {
      "id": "leg_sudden_swelling",
      "label": "Одна нога внезапно опухла, стала горячей, красной и болезненной, или вы не можете на нее встать.",
      "isRedFlag": true,
      "selfCareTip": "Оставайтесь сидеть и не трите ногу. Срочно обратитесь к врачу или в отделение неотложной помощи.",
      "guidance": "Внезапная опухоль на одной ноге может быть тромбом. Это требует быстрого лечения.",
      "title": "Внезапная опухоль на одной ноге",
      "description": "Только одна икра внезапно опухла, она теплая, красная и болезненная."
    },
    {
      "id": "leg_heel_foot",
      "label": "Боль в пятке, ахилловом сухожилии или своде стопы при наступании",
      "isRedFlag": false,
      "selfCareTip": "Носите поддерживающую обувь с мягкой подошвой и не ходите босиком по твёрдому полу.",
      "guidance": "Боль в подошве и пятке часто возникает после долгого стояния или ношения обуви с тонкой подошвой. При диабете и любой ране на стопе обратитесь к врачу без промедления.",
      "title": "Боль в пятке или подошве",
      "description": "Резкая болезненность под пяткой или вдоль свода при первых утренних шагах либо напряжение чуть выше пятки."
    },
    {
      "id": "leg_hip_thigh",
      "label": "Боль в тазобедренном суставе или бедре при ходьбе, подъёме по лестнице или вставании",
      "isRedFlag": false,
      "selfCareTip": "Избегайте широких шагов и тяжёлых нагрузок; при сне на боку положите подушку между коленями.",
      "guidance": "Боль может быть связана с растяжением мышцы или тазобедренным суставом. Обратитесь к врачу при хромоте или боли дольше недели.",
      "title": "Боль в тазобедренном суставе или бедре при ходьбе",
      "description": "Ноющая боль сбоку тазобедренного сустава, в паховой складке или мышцах бедра при ходьбе, подъёме по лестнице или лежании на этом боку."
    }
  ]
},
    "severity": {
      "mild": {
        "title": "Мягкий",
        "description": "Вы замечаете это, но можете заниматься своими обычными делами."
      },
      "moderate": {
        "title": "Умеренный",
        "description": "Это мешает работать, двигаться или спать."
      },
      "severe": {
        "title": "Тяжелый",
        "description": "Вряд ли вы сможете что-либо сделать."
      }
    },
    "duration": {
      "today": {
        "label": "Сегодня или вчера",
        "hint": "Менее 24 часов"
      },
      "days": {
        "label": "2–7 дней",
        "hint": "От 2 до 7 дней"
      },
      "weeks": {
        "label": "1–2 недели",
        "hint": "От 1 до 2 недель"
      },
      "chronic": {
        "label": "Более 2 недель",
        "hint": "Не уйдет или продолжает возвращаться"
      }
    },
    "urgency": {
      "low": {
        "title": "Вероятно, вы сможете позаботиться об этом дома",
        "intro": "Отдыхайте, пейте воду и наблюдайте за своим самочувствием в течение нескольких дней. Если ситуация ухудшится или появятся новые признаки, позвоните своему врачу или 112."
      },
      "medium": {
        "title": "Посетите своего семейного врача в ближайшие несколько дней",
        "intro": "Это стоит показать врачу. Если тем временем станет хуже, позвоните 112."
      },
      "high": {
        "title": "Посетите врача сегодня",
        "intro": "Не откладывайте это. Позвоните своему врачу или сходите в клинику сегодня. Если станет хуже, звоните 112."
      }
    }
  },

  "ro": {
    "ui": {
      "eyebrow": "Verificare de sănătate",
      "heading": "Verifică simptomele",
      "subtitle": "Arată pe corp unde te doare și răspunde la câteva întrebări scurte. Apoi afli ce poți face.",
      "resetButton": "De la capăt",
      "backButton": "Înapoi",
      "nextButton": "Continuă",
      "finishButton": "Vezi rezultatul",
      "stepIndicator": "Pasul {current} din {total}",
      "step1Title": "Zona",
      "step2Title": "Simptomul",
      "step3Title": "Cât de tare",
      "step4Title": "Rezultatul",
      "step1Question": "Unde simți durere sau disconfort?",
      "step1Prompt": "Atinge zona pe corp sau alege din listă.",
      "step2Question": "Care seamănă cel mai mult cu ce simți?",
      "step2Prompt": "Alege simptomul cel mai puternic.",
      "urgentBadge": "Semn de urgență",
      "step3Question": "Cât de tare este și de când o ai?",
      "step3Prompt": "Alege câte o variantă din fiecare grup.",
      "severityHeading": "Cât de tare este?",
      "durationHeading": "De când ai simptomul?",
      "step4Question": "Ce poți face acum",
      "step4Prompt": "Pe baza răspunsurilor tale. Nu este un diagnostic.",
      "summaryHeading": "Rezumatul răspunsurilor",
      "areaLabel": "Zona",
      "symptomLabel": "Simptomul",
      "intensityLabel": "Cât de tare",
      "durationLabel": "De când",
      "recommendationHeading": "Ce să faci mai departe",
      "safeSelfCareHeading": "Ce poți face acasă",
      "copySummary": "Copiază rezumatul",
      "copied": "Copiat",
      "sendWhatsApp": "Trimite pe WhatsApp",
      "showDoctor": "Arată medicului",
      "requestMediatorHelp": "Vorbește cu un mediator",
      "scheduleDoctor": "Programează-te online",
      "readEducationalTopic": "Citește ghidul",
      "disclaimer": "Acesta nu este un diagnostic. Dacă te simți mai rău sau te doare foarte tare, sună la 112.",
      "viewer3D": {
        "ariaLabel": "Corp 3D. Rotește-l și atinge locul care te doare.",
        "loading": "Se încarcă modelul 3D ({progress}%)",
        "subModelInfo": "Corpul 3D",
        "front": "Față",
        "back": "Spate",
        "perspective": "Unghi",
        "rotate360": "360°",
        "zoomIn": "Apropie",
        "zoomOut": "Depărtează",
        "resetView": "Resetează unghiul",
        "tip": "Trage stânga sau dreapta ca să rotești corpul. Atinge zona care te doare.",
        "searchPlaceholder": "Caută un organ sau un mușchi (ex. inimă, biceps)",
        "selected3DStructure": "Ai ales:",
        "activeAreaPrefix": "Zona:",
        "leftSide": "Stânga",
        "rightSide": "Dreapta",
        "selectRegionPrefix": "Alege",
        "rotateTooltip": "Rotește corpul la 180°",
        "layerHybrid": "Mușchi și organe",
        "layerMuscular": "Mușchi și tendoane",
        "layerOrgans": "Organe interne",
        "layerSurface": "Pielea",
        "legendSkeletalMuscles": "Mușchi",
        "legendTendonsJoints": "Tendoane și articulații",
        "legendInternalOrgans": "Organe interne",
        "legendSelectedStructure": "Structură selectată"
      },
      "emergency": {
        "badge": "Urgență medicală 112",
        "title": "Poate fi o urgență: sună acum la 112",
        "description": "Nu aștepta. Dacă nu poți suna, mergi repede la Urgențe. Nu conduce singur.",
        "whyEmergencyPrefix": "Ai ales:",
        "call112Now": "Sună la 112",
        "continueReview": "Am înțeles"
      },
      "structure3DLabel": "Structură 3D",
      "sensationLabel": "Senzație",
      "triggersLabel": "Ce agravează",
      "specialtyLabel": "Medic specialist",
      "warningNoticeRedFlag": "Au apărut semne de urgență.",
      "warningNoticeSafe": "Nu au apărut semne de urgență."
    },
    "bodyParts": {
      "head": {
        "title": "Cap și gât",
        "subtitle": "Dureri de cap, maxilar, ureche, ceafă înțepenită sau amețeli"
      },
      "chest": {
        "title": "Piept și respirație",
        "subtitle": "Apăsare în piept, sâni, coaste, respirație grea sau inimă rapidă"
      },
      "stomach": {
        "title": "Stomac și burtă",
        "subtitle": "Arsuri, crampe digestive, greață, balonare sau dureri de burtă"
      },
      "pelvis": {
        "title": "Pelvis și partea de jos a burții",
        "subtitle": "Dureri menstruale, ovare, usturime la urinare, vintre sau zona intimă"
      },
      "back": {
        "title": "Spate și șale",
        "subtitle": "Durere jos pe spate, noadă, mușchi blocați sau durere între omoplați"
      },
      "arm": {
        "title": "Brațe și mâini",
        "subtitle": "Amorțeli, dureri de umăr, cot, încheieturi sau degete"
      },
      "leg": {
        "title": "Picioare și tălpi",
        "subtitle": "Dureri de șold, genunchi, gleznă, călcâi sau talpă"
      }
    },
    "symptomsByRegion": {
      "head": [
        {
          "id": "head_migraine",
          "label": "Durere care bate pe o parte a capului, cu greață sau deranj la lumină",
          "isRedFlag": false,
          "selfCareTip": "Odihnește-te într-o cameră întunecată și liniștită. Bea apă și pune o compresă rece pe frunte.",
          "guidance": "Seamănă cu o migrenă. Dacă revine des, întreabă medicul de familie despre un tratament care o previne.",
          "title": "Migrenă sau durere care bate",
          "description": "Durere care pulsează, de obicei pe o parte a capului. Te pot deranja lumina, zgomotul sau poți avea greață."
        },
        {
          "id": "head_tension",
          "label": "Apăsare ca o bandă strânsă în jurul capului, după stres sau oboseală",
          "isRedFlag": false,
          "selfCareTip": "Ia o pauză de la ecrane și masează ușor gâtul. Ieși puțin la aer.",
          "guidance": "Apare des din cauza stresului, a somnului puțin sau a statului mult la birou.",
          "title": "Durere de cap de la stres",
          "description": "Apăsare ca o bandă strânsă pe frunte sau tâmple. Apare des după stres, mult ecran sau gât încordat."
        },
        {
          "id": "head_dehydration",
          "label": "Durere surdă, continuă, după o zi caldă sau după ce ai băut puțină apă",
          "isRedFlag": false,
          "selfCareTip": "Bea încet 1–2 pahare mari de apă sau ceai călduț. Evită băuturile cu cofeină sau zahăr.",
          "guidance": "De multe ori trece dacă bei apă și stai la umbră.",
          "title": "Durere de cap de la căldură sau sete",
          "description": "Durere surdă în tot capul, mai rea când miști capul. Apare după soare, căldură sau când ai băut prea puțină apă."
        },
        {
          "id": "head_fever",
          "label": "Durere de cap cu febră, frisoane sau nas înfundat",
          "isRedFlag": false,
          "selfCareTip": "Stai în pat, măsoară-ți temperatura și bea multe lichide.",
          "guidance": "Poate fi o răceală sau o viroză. Dacă febra trece de 38,5 °C sau ține mai mult de 3 zile, mergi la medic.",
          "title": "Durere de cap cu febră",
          "description": "Te doare capul și ai temperatură, frisoane, dureri de corp sau nasul înfundat."
        },
        {
          "id": "head_sudden_severe",
          "label": "Durere de cap bruscă și foarte puternică, sau cu confuzie ori slăbiciune",
          "isRedFlag": true,
          "selfCareTip": "Așază-te undeva în siguranță și sună imediat la 112.",
          "guidance": "O durere de cap foarte puternică, apărută brusc, este o urgență. Ai nevoie de un medic imediat.",
          "title": "Durere de cap bruscă și foarte puternică",
          "description": "Cea mai puternică durere de cap din viața ta, apărută în câteva secunde. Poate veni cu ceafă țeapănă, vedere încețoșată sau confuzie."
        },
        {
          "id": "head_neck_stiff",
          "label": "Durere de gât, ceafă înțepenită sau durere când întorci capul",
          "isRedFlag": false,
          "selfCareTip": "Pune ceva cald pe ceafă, coboară umerii și întoarce capul încet, fără să forțezi. Evită pernele foarte înalte.",
          "guidance": "De obicei vine de la mușchii gâtului încordați sau o poziție incomodă în somn ori la ecran. Dacă coboară amorțeală pe braț, mergi la medic.",
          "title": "Durere de gât sau ceafă înțepenită",
          "description": "Gâtul sau ceafa te doare și se mișcă greu când întorci capul sau privești în jos, uneori cu tensiune spre umăr."
        },
        {
          "id": "head_throat_swallow",
          "label": "Durere în gât la înghițit, răgușeală sau ganglioni umflați pe gât",
          "isRedFlag": false,
          "selfCareTip": "Bea ceai călduț sau apă în înghițituri mici și evită fumul ori băuturile foarte reci sau fierbinți.",
          "guidance": "Cele mai multe dureri în gât sunt virale. Dacă ai febră mare, pete albe în gât sau înghiți tot mai greu, mergi la medic.",
          "title": "Durere în gât sau la înghițit",
          "description": "Te ustură sau te doare gâtul când înghiți, ai vocea răgușită sau simți mici umflături sensibile sub maxilar."
        },
        {
          "id": "head_jaw_ear",
          "label": "Durere de ureche, maxilar sau apăsare în jurul obrajilor și sinusurilor",
          "isRedFlag": false,
          "selfCareTip": "Mănâncă alimente moi, nu băga bețișoare în ureche și pune o compresă călduță pe exteriorul obrazului.",
          "guidance": "Durerea de ureche, articulația maxilarului sau sinusurile inflamate merită verificate de medicul de familie sau stomatolog.",
          "title": "Durere de ureche, maxilar sau sinusuri",
          "description": "Simți durere sau înfundare într-o ureche, durere la mestecat în articulația maxilarului sau presiune pe frunte și obraji."
        },
        {
          "id": "head_neck_red_flag",
          "label": "Ceafă țeapănă cu febră mare, deranj puternic la lumină, pete pe piele sau confuzie",
          "isRedFlag": true,
          "selfCareTip": "Stai culcat într-un loc liniștit și sună imediat la 112.",
          "guidance": "Ceafa foarte țeapănă împreună cu febră mare sau confuzie poate fi o infecție gravă și cere spital imediat.",
          "title": "Ceafă țeapănă cu febră mare sau confuzie",
          "description": "Nu poți apropia bărbia de piept din cauza durerii, ai febră mare, somnolență, vărsături sau te deranjează puternic lumina."
        }
      ],
      "chest": [
        {
          "id": "chest_reflux",
          "label": "Arsură în capul pieptului sau gust acru după masă ori când te apleci",
          "isRedFlag": false,
          "selfCareTip": "Nu te întinde imediat după masă. Renunță o vreme la mâncarea picantă și la cafea.",
          "guidance": "Arsurile vin de obicei de la acidul din stomac. Dacă nu trec, medicul de familie îți poate da un tratament.",
          "title": "Arsuri în capul pieptului",
          "description": "Arsură care urcă din stomac spre gât. E mai rea când te apleci sau după mese grele ori acide."
        },
        {
          "id": "chest_exertion",
          "label": "Strânsoare sau apăsare în piept la efort sau la urcatul scărilor",
          "isRedFlag": false,
          "selfCareTip": "Oprește efortul, așază-te și respiră liniștit.",
          "guidance": "O apăsare în piept la efort trebuie verificată de un medic, chiar dacă trece repede când te oprești.",
          "title": "Apăsare în piept la efort",
          "description": "Strânsoare în mijlocul pieptului care apare când mergi repede, urci scări sau faci efort."
        },
        {
          "id": "chest_stitch",
          "label": "Înțepătură pe o parte a pieptului, mai rea când respiri adânc sau tușești",
          "isRedFlag": false,
          "selfCareTip": "Respiră încet, fără să tragi aer prea adânc, câteva minute. Pune ceva călduț pe locul care doare.",
          "guidance": "De obicei e un mușchi întins și trece singur. Dacă îți e greu să respiri, sună la 112.",
          "title": "Înțepătură când respiri",
          "description": "Durere ascuțită într-un punct din piept, mai rea când tragi aer adânc, tușești sau te răsucești."
        },
        {
          "id": "chest_breast_pain",
          "label": "Sensibilitate, tensiune, roșeață la sân sau durere în timpul alăptării",
          "isRedFlag": false,
          "selfCareTip": "Poartă o bustieră comodă, fără sârmă strânsă, și pune o compresă călduță sau rece după cum îți face bine.",
          "guidance": "Sensibilitatea la amândoi sânii ține des de ciclul menstrual. Dacă un sân devine roșu, fierbinte și faci febră, mergi azi la medic.",
          "title": "Sensibilitate sau durere la sân",
          "description": "Sânii sunt umflați, sensibili înainte de menstruație, sau un sân doare și e întărit în timpul alăptării."
        },
        {
          "id": "chest_breast_lump",
          "label": "Nodul nou, zonă întărită, adâncitură a pielii la sân sau umflătură la subraț",
          "isRedFlag": false,
          "selfCareTip": "Nu apăsa și nu masa tare locul. Notează când l-ai observat ca să îi spui medicului.",
          "guidance": "Majoritatea nodulilor la sân sunt necanceroși, dar orice nodul nou sau schimbare a pielii ori mamelonului trebuie verificată de medic.",
          "title": "Nodul nou la sân sau la subraț",
          "description": "Simți o umflătură sau o zonă mai tare la sân ori subraț, o adâncitură pe piele sau o secreție neobișnuită."
        },
        {
          "id": "chest_warning",
          "label": "Durere puternică în piept care se întinde spre brațul stâng, gât sau maxilar, cu lipsă de aer",
          "isRedFlag": true,
          "selfCareTip": "Sună imediat la 112. Așază-te și desfă hainele strâmte.",
          "guidance": "Această durere în piept poate fi un infarct. Fiecare minut contează.",
          "title": "Durere puternică în piept care se întinde",
          "description": "Apăsare grea în piept care merge spre brațul stâng, gât, maxilar sau spate. Poate veni cu transpirație rece sau sufocare."
        }
      ],
      "stomach": [
        {
          "id": "stomach_upper_reflux",
          "label": "Arsură sau greutate în partea de sus a stomacului",
          "isRedFlag": false,
          "selfCareTip": "Mănâncă simplu, mâncare fiartă. Bea apă care nu e rece și evită mesele mari.",
          "guidance": "Stomacul e iritat, lucru des întâlnit. Dacă te deranjează în fiecare zi, fă o programare la medic.",
          "title": "Arsuri sus, în stomac",
          "description": "Arsură sau aciditate sub coaste. Te saturi repede sau îți vine acru în gură după masă."
        },
        {
          "id": "stomach_cramping_mild",
          "label": "Crampe în toată burta, cu balonare sau scaun mai des ori mai rar",
          "isRedFlag": false,
          "selfCareTip": "Bea ceai de mentă sau mușețel și pune ceva călduț pe burtă. Evită lactatele câteva zile.",
          "guidance": "Crampele de scurtă durată țin de obicei de digestie sau de ce ai mâncat.",
          "title": "Crampe și balonare",
          "description": "Burta te strânge din când în când, e umflată, ai gaze sau mergi mai des ori mai rar la toaletă."
        },
        {
          "id": "stomach_lower_sharp",
          "label": "Durere ascuțită într-un punct, în dreapta jos a burții",
          "isRedFlag": true,
          "selfCareTip": "Până te vede un medic, nu lua calmante puternice și nu pune nimic fierbinte pe burtă.",
          "guidance": "O durere care stă în dreapta jos a burții trebuie văzută repede de un medic. Poate fi apendicită.",
          "title": "Durere în dreapta jos",
          "description": "Durere în partea dreaptă de jos a burții, care se înrăutățește și e mai rea când tușești, mergi sau apeși pe burtă."
        },
        {
          "id": "stomach_severe_widespread",
          "label": "Durere de burtă foarte puternică și continuă, cu vărsături repetate, burtă tare sau febră",
          "isRedFlag": true,
          "selfCareTip": "Nu mânca și nu bea mult. Mergi imediat la Urgențe sau sună la 112.",
          "guidance": "O durere foarte puternică, cu burta tare, poate cere o operație de urgență.",
          "title": "Durere foarte puternică în toată burta",
          "description": "Burta te doare tare și e tare ca lemnul, vomiți întruna sau te simți gata să leșini."
        }
      ],
      "pelvis": [
        {
          "id": "pelvis_period_cramps",
          "label": "Crampe menstruale sau durere surdă jos în bazin în preajma menstruației",
          "isRedFlag": false,
          "selfCareTip": "Pune o sticlă cu apă caldă jos pe burtă, bea lichide calde și odihnește-te pe o parte cu genunchii ușor îndoiți.",
          "guidance": "Crampele ușoare la menstruație sunt frecvente, dar dacă durerea te oprește din activitățile zilnice, un control ginecologic poate depista endometrioza sau fibroamele.",
          "title": "Crampe menstruale sau durere ciclică",
          "description": "Strânsoare sau durere surdă jos în burtă și șale, înainte sau în timpul menstruației."
        },
        {
          "id": "pelvis_one_sided",
          "label": "Durere pe o singură parte jos în pelvis, în zona ovarului sau în vintre",
          "isRedFlag": false,
          "selfCareTip": "Evită efortul fizic intens și nu pune comprese fierbinți dacă durerea e ascuțită.",
          "guidance": "Durerea pe o parte a pelvisului poate veni de la un chist ovarian, ovulație sau o întindere inghinală și merită evaluată de medic.",
          "title": "Durere pe o parte în pelvis sau vintre",
          "description": "Înțepătură sau apăsare într-o parte de jos a burții ori în pliul inghinal, uneori mai tare la mișcare."
        },
        {
          "id": "pelvis_urinary_burning",
          "label": "Usturime la urinare, urină tulbure sau nevoia de a merge foarte des la toaletă",
          "isRedFlag": false,
          "selfCareTip": "Bea apă des în înghițituri mici și nu amâna mersul la toaletă. Evită cafeaua și băuturile acide.",
          "guidance": "Seamănă cu o infecție urinară. Medicul de familie îți poate recomanda sumarul de urină și tratamentul potrivit. Dacă apare febră sau durere de șale, mergi azi la medic.",
          "title": "Usturime la urinare sau mers des la baie",
          "description": "Te ustură când urinezi, simți apăsare deasupra osului pubian sau simți că vezica nu s-a golit."
        },
        {
          "id": "pelvis_pressure_floor",
          "label": "Greutate, apăsare sau disconfort în planșeul pelvin ori zona intimă",
          "isRedFlag": false,
          "selfCareTip": "Evită ridicarea greutăților și constipația. Îmbracă lenjerie lejeră din bumbac.",
          "guidance": "Senzația de greutate pelvină sau iritație intimă apare des după naștere, la menopauză sau în infecții locale și se tratează ușor după un consult.",
          "title": "Apăsare pelvină sau disconfort intim",
          "description": "Senzație de greutate jos în bazin, sensibilitate la stat pe scaun sau iritație în zona intimă."
        },
        {
          "id": "pelvis_pregnancy_bleeding",
          "label": "Durere pelvină bruscă și foarte puternică, sângerare abundentă sau durere când ai putea fi însărcinată",
          "isRedFlag": true,
          "selfCareTip": "Întinde-te, nu lua medicamente pe cont propriu și sună imediat la 112 sau mergi la Urgențe.",
          "guidance": "Durerea pelvină severă cu sângerare, amețeală sau o posibilă sarcină poate fi o urgență ginecologică și cere consult imediat.",
          "title": "Durere pelvină severă, sângerare mare sau sarcină",
          "description": "Durere bruscă jos în burtă cu sângerare vaginală puternică, amețeală, febră sau dacă știi ori bănuiești că ești însărcinată."
        }
      ],
      "back": [
        {
          "id": "back_strain_lift",
          "label": "Durere ascuțită în șale, apărută brusc după ridicarea unei greutăți",
          "isRedFlag": false,
          "selfCareTip": "Nu te apleca și nu ridica greutăți. Odihnește-te, dar fă și plimbări scurte. Pune o compresă caldă.",
          "guidance": "Se întâmplă des. Mișcarea ușoară ajută mai mult decât statul în pat.",
          "title": "Durere de spate după ce ai ridicat ceva",
          "description": "Mușchii de jos ai spatelui s-au blocat imediat după ce ai ridicat ceva greu sau te-ai răsucit brusc."
        },
        {
          "id": "back_chronic",
          "label": "Durere surdă jos pe spate, de câteva săptămâni",
          "isRedFlag": false,
          "selfCareTip": "Fă exerciții ușoare de întindere pentru spate. Potrivește înălțimea scaunului și nu sta mult nemișcat.",
          "guidance": "Durerea de spate veche se îmbunătățește cu exerciții arătate de un kinetoterapeut și cu mușchi de burtă mai puternici.",
          "title": "Durere de spate care nu trece",
          "description": "Durere surdă jos pe spate, de câteva săptămâni, mai rea când stai mult pe scaun sau în picioare."
        },
        {
          "id": "back_stiffness",
          "label": "Spate înțepenit dimineața sau după mult stat pe scaun",
          "isRedFlag": false,
          "selfCareTip": "Dimineața, rotește ușor umerii și apleacă-te încet de câteva ori înainte să începi ziua.",
          "guidance": "Apare des când mușchii sunt încordați sau după ce ai stat mult în aceeași poziție.",
          "title": "Spate înțepenit dimineața",
          "description": "Dimineața spatele e țeapăn și te apleci greu. Se îmbunătățește după ce te miști puțin."
        },
        {
          "id": "back_severe_difficulty",
          "label": "Durere puternică de spate cu amorțeli în ambele picioare, slăbiciune sau pierderea controlului urinei",
          "isRedFlag": true,
          "selfCareTip": "Stai culcat și sună imediat la 112.",
          "guidance": "Nervii din spate pot fi apăsați grav. Ai nevoie de spital, de urgență.",
          "title": "Durere de spate cu amorțeli în picioare",
          "description": "Durere puternică de spate cu amorțeli sau slăbiciune în ambele picioare, ori probleme noi cu urina sau scaunul."
        },
        {
          "id": "back_upper_blades",
          "label": "Durere sau arsură sus pe spate, între omoplați sau spre umeri",
          "isRedFlag": false,
          "selfCareTip": "Ridică-te des de pe scaun, trage ușor omoplații înapoi și pune o compresă caldă sus pe spate.",
          "guidance": "Apare des de la stat aplecat deasupra telefonului, mesei de lucru sau de la cărat sacoșe grele pe un umăr.",
          "title": "Durere sus pe spate sau între omoplați",
          "description": "Tensiune sau junghi în partea de sus a spatelui și între omoplați, mai ales după stat pe scaun sau efort cu brațele."
        },
        {
          "id": "back_flank_kidney",
          "label": "Durere într-o parte a mijlocului sub coaste, cu febră, greață sau usturime la urinare",
          "isRedFlag": false,
          "selfCareTip": "Bea apă în înghițituri mici și nu lua antiinflamatoare puternice înainte să te vadă medicul.",
          "guidance": "Durerea într-o parte a mijlocului, mai ales cu febră sau modificări la urinare, poate ține de rinichi și trebuie văzută azi de un medic.",
          "title": "Durere într-o parte a mijlocului sau zona rinichilor",
          "description": "Durere adâncă pe o parte a spatelui sub coaste, care nu se schimbă când te miști și poate veni cu febră sau usturime la urinat."
        }
      ],
      "arm": [
        {
          "id": "arm_shoulder_elbow",
          "label": "Durere de umăr când ridici brațul sau durere la cot când strângi ori ridici ceva",
          "isRedFlag": false,
          "selfCareTip": "Evită mișcările repetate deasupra capului și nu dormi pe umărul dureros câteva nopți.",
          "guidance": "De obicei e un tendon iritat la umăr sau cot. Dacă nu poți ridica brațul sau ține mai mult de o săptămână, mergi la medic.",
          "title": "Durere de umăr sau cot la mișcare",
          "description": "Umărul te doare când ridici mâna ori te îmbraci, sau cotul doare când apuci ori răsucești obiecte."
        },
        {
          "id": "arm_sprain",
          "label": "Durere la umăr, cot sau încheietură după o căzătură sau o mișcare bruscă",
          "isRedFlag": false,
          "selfCareTip": "Pune gheață învelită într-un prosop pe locul care doare. Ține brațul sprijinit.",
          "guidance": "Loviturile și întinderile ușoare trec de obicei în câteva zile dacă ții încheietura în repaus.",
          "title": "Durere la încheietură după o căzătură",
          "description": "Încheietura, cotul sau umărul te doare și e umflat după o lovitură sau după ce ai căzut în palme."
        },
        {
          "id": "arm_numbness",
          "label": "Amorțeli ușoare sau furnicături în degete după mult timp la tastatură sau pe telefon",
          "isRedFlag": false,
          "selfCareTip": "Fă des pauze de 5 minute. Scutură mâinile și rotește ușor încheieturile.",
          "guidance": "Poate fi un nerv apăsat la încheietură. Spune-i medicului dacă nu trece.",
          "title": "Furnicături în degete",
          "description": "Amorțeală sau furnicături în palmă, în degetul mare, arătător și mijlociu, mai ales noaptea sau când scrii la tastatură."
        },
        {
          "id": "arm_ache",
          "label": "Mușchii brațului dor și sunt obosiți după un efort fizic mare",
          "isRedFlag": false,
          "selfCareTip": "Fă un duș călduț, masează ușor mușchii și odihnește-te o zi.",
          "guidance": "E normal după un efort neobișnuit. Trece singur în 2–3 zile.",
          "title": "Febră musculară în braț",
          "description": "Mușchii brațului te dor după un efort neobișnuit, sport sau cărat greutăți."
        },
        {
          "id": "arm_sudden_swelling",
          "label": "Braț slăbit brusc, care nu se mai mișcă deloc sau se umflă mult și repede",
          "isRedFlag": true,
          "selfCareTip": "Nu forța brațul. Sună imediat la 112.",
          "guidance": "Un braț slăbit brusc poate fi semn de accident vascular (AVC) sau de fractură gravă.",
          "title": "Slăbiciune bruscă într-un braț",
          "description": "Dintr-odată nu poți ridica sau ține mâna. Poate veni cu fața strâmbă pe o parte sau vorbire încurcată."
        }
      ],
      "leg": [
        {
          "id": "leg_sprain",
          "label": "Gleznă umflată sau dureroasă după ce ai călcat strâmb",
          "isRedFlag": false,
          "selfCareTip": "Ține piciorul ridicat pe o pernă și pune comprese reci 15 minute. Nu te sprijini cu toată greutatea pe el.",
          "guidance": "Ține glezna în repaus câteva zile. Dacă se umflă tot mai tare sau nu poți călca, mergi la o radiografie.",
          "title": "Gleznă sucită",
          "description": "Glezna te doare și e umflată după ce ai călcat strâmb. Calci greu pe ea."
        },
        {
          "id": "leg_cramp",
          "label": "Cârcel dureros în gambă, noaptea sau după efort",
          "isRedFlag": false,
          "selfCareTip": "Întinde piciorul și trage ușor degetele spre tine. Masează pulpa și bea un pahar cu apă.",
          "guidance": "Cârceii apar des după oboseală, transpirație multă sau când bei prea puțină apă.",
          "title": "Cârcel în gambă",
          "description": "Mușchiul gambei se strânge brusc și dureros, des noaptea sau când ai băut prea puțină apă."
        },
        {
          "id": "leg_knee_ache",
          "label": "Durere de genunchi la coborâtul scărilor sau după mers mult",
          "isRedFlag": false,
          "selfCareTip": "Nu sta pe vine și nu căra greutăți. Poartă pantofi comozi, cu talpă moale.",
          "guidance": "Genunchiul se uzează în timp. Exercițiile care întăresc mușchii piciorului îl ajută.",
          "title": "Durere de genunchi la scări",
          "description": "Genunchiul te doare când cobori scări, te ghemuiești sau după ce ai stat mult cu genunchii îndoiți."
        },
        {
          "id": "leg_sudden_swelling",
          "label": "Un singur picior umflat brusc, cald, roșu și foarte dureros, sau nu poți călca pe el",
          "isRedFlag": true,
          "selfCareTip": "Stai liniștit și nu masa gamba. Mergi repede la un medic sau la Urgențe.",
          "guidance": "O gambă umflată brusc poate fi un cheag de sânge (tromboză). Trebuie tratată de urgență.",
          "title": "Gambă umflată brusc, doar pe un picior",
          "description": "O singură gambă s-a umflat brusc, e caldă, roșie și dureroasă."
        },
        {
          "id": "leg_heel_foot",
          "label": "Durere în călcâi, tendonul lui Ahile sau talpă când pui piciorul jos",
          "isRedFlag": false,
          "selfCareTip": "Poartă încălțăminte comodă cu talpă moale și evită mersul desculț pe podea tare.",
          "guidance": "Apare des după mult stat în picioare sau încălțăminte subțire. Dacă ai diabet și apare o rană pe talpă, mergi repede la medic.",
          "title": "Durere în călcâi sau în talpă",
          "description": "Simți înțepătură sub călcâi ori în arcada tălpii la primii pași dimineața, sau tensiune deasupra călcâiului."
        },
        {
          "id": "leg_hip_thigh",
          "label": "Durere în șold sau coapsă la mers, pe scări ori când te ridici de pe scaun",
          "isRedFlag": false,
          "selfCareTip": "Evită pașii mari sau căratul greutăților și pune o pernă între genunchi când dormi pe o parte.",
          "guidance": "Durerea de șold sau coapsă poate veni dintr-un mușchi întins ori din articulație. Dacă șchiopătezi sau ține peste o săptămână, mergi la medic.",
          "title": "Durere de șold sau coapsă la mers",
          "description": "Te doare șoldul pe lateral, zona inghinală sau mușchii coapsei când mergi, urci scări sau stai culcat pe acea parte."
        }
      ]
    },
    "severity": {
      "mild": {
        "title": "Ușor",
        "description": "Se simte, dar îți faci treburile obișnuite."
      },
      "moderate": {
        "title": "Mediu",
        "description": "Te încurcă la muncă, la mers sau la somn."
      },
      "severe": {
        "title": "Puternic",
        "description": "Nu poți face aproape nimic."
      }
    },
    "duration": {
      "today": {
        "label": "Azi sau ieri",
        "hint": "Sub 24 de ore"
      },
      "days": {
        "label": "De 2–7 zile",
        "hint": "2 până la 7 zile"
      },
      "weeks": {
        "label": "De 1–2 săptămâni",
        "hint": "1 până la 2 săptămâni"
      },
      "chronic": {
        "label": "De peste 2 săptămâni",
        "hint": "Nu trece sau tot revine"
      }
    },
    "urgency": {
      "low": {
        "title": "Poți avea grijă de tine acasă",
        "intro": "Odihnește-te, bea apă și urmărește cum te simți câteva zile. Dacă se înrăutățește sau apar semne noi, sună medicul de familie sau 112."
      },
      "medium": {
        "title": "Mergi la medicul de familie în câteva zile",
        "intro": "Ce simți merită văzut de un medic. Dacă se înrăutățește între timp, sună la 112."
      },
      "high": {
        "title": "Vezi un medic azi",
        "intro": "Nu amâna. Sună medicul de familie sau mergi azi la o clinică. Dacă se înrăutățește, sună la 112."
      }
    }
  },
  "en": {
    "ui": {
      "eyebrow": "Health check",
      "heading": "Check your symptoms",
      "subtitle": "Show on the body where it hurts and answer a few short questions. Then see what to do next.",
      "resetButton": "Start over",
      "backButton": "Back",
      "nextButton": "Continue",
      "finishButton": "See result",
      "stepIndicator": "Step {current} of {total}",
      "step1Title": "Area",
      "step2Title": "Symptom",
      "step3Title": "How bad",
      "step4Title": "Result",
      "step1Question": "Where do you feel pain or discomfort?",
      "step1Prompt": "Tap the area on the body or pick it from the list.",
      "step2Question": "Which of these is closest to what you feel?",
      "step2Prompt": "Pick the symptom that bothers you most.",
      "urgentBadge": "Emergency sign",
      "step3Question": "How bad is it, and for how long?",
      "step3Prompt": "Pick one option in each group.",
      "severityHeading": "How bad is it?",
      "durationHeading": "How long have you had it?",
      "step4Question": "What you can do now",
      "step4Prompt": "Based on your answers. This is not a diagnosis.",
      "summaryHeading": "Summary of your answers",
      "areaLabel": "Body area",
      "symptomLabel": "Symptom",
      "intensityLabel": "How bad",
      "durationLabel": "How long",
      "recommendationHeading": "What to do next",
      "safeSelfCareHeading": "What you can do at home",
      "copySummary": "Copy summary",
      "copied": "Copied",
      "sendWhatsApp": "Share on WhatsApp",
      "showDoctor": "Show the doctor",
      "requestMediatorHelp": "Talk to a mediator",
      "scheduleDoctor": "Book a doctor online",
      "readEducationalTopic": "Read the guide",
      "disclaimer": "This is not a diagnosis. If you feel worse or the pain is very bad, call 112.",
      "viewer3D": {
        "ariaLabel": "3D body. Turn it and tap where it hurts.",
        "loading": "Loading the 3D model ({progress}%)",
        "subModelInfo": "3D body",
        "front": "Front",
        "back": "Back",
        "perspective": "Angle",
        "rotate360": "360°",
        "zoomIn": "Zoom in",
        "zoomOut": "Zoom out",
        "resetView": "Reset view",
        "tip": "Drag left or right to turn the body. Tap where it hurts.",
        "searchPlaceholder": "Search for an organ or muscle (e.g. heart, biceps)",
        "selected3DStructure": "You chose:",
        "activeAreaPrefix": "Area:",
        "leftSide": "Left",
        "rightSide": "Right",
        "selectRegionPrefix": "Choose",
        "rotateTooltip": "Turn the body 180°",
        "layerHybrid": "Muscles and organs",
        "layerMuscular": "Muscles and tendons",
        "layerOrgans": "Internal organs",
        "layerSurface": "Skin",
        "legendSkeletalMuscles": "Muscles",
        "legendTendonsJoints": "Tendons and joints",
        "legendInternalOrgans": "Internal organs",
        "legendSelectedStructure": "Selected structure"
      },
      "emergency": {
        "badge": "Medical emergency 112",
        "title": "This may be an emergency: call 112 now",
        "description": "Don't wait. If you can't call, go to the emergency department quickly. Don't drive yourself.",
        "whyEmergencyPrefix": "You chose:",
        "call112Now": "Call 112 now",
        "continueReview": "I understand"
      },
      "structure3DLabel": "3D structure",
      "sensationLabel": "Sensation",
      "triggersLabel": "What makes it worse",
      "specialtyLabel": "Specialist to see",
      "warningNoticeRedFlag": "Emergency warning signs reported.",
      "warningNoticeSafe": "No emergency warning signs reported."
    },
    "bodyParts": {
      "head": {
        "title": "Head and neck",
        "subtitle": "Headaches, jaw or ear pain, stiff neck or dizziness"
      },
      "chest": {
        "title": "Chest and breathing",
        "subtitle": "Chest pressure, breasts, ribs, hard breathing or a racing heart"
      },
      "stomach": {
        "title": "Stomach and abdomen",
        "subtitle": "Heartburn, digestive cramps, nausea, bloating or belly pain"
      },
      "pelvis": {
        "title": "Pelvis and lower belly",
        "subtitle": "Period pain, ovaries, burning when peeing, groin or intimate area"
      },
      "back": {
        "title": "Back and spine",
        "subtitle": "Lower back pain, tailbone, tense muscles or pain between the shoulder blades"
      },
      "arm": {
        "title": "Arms and hands",
        "subtitle": "Numbness, shoulder, elbow, wrist or finger joint pain"
      },
      "leg": {
        "title": "Legs and feet",
        "subtitle": "Hip, knee, ankle, heel or foot arch pain"
      }
    },
    "symptomsByRegion": {
      "head": [
        {
          "id": "head_migraine",
          "label": "Throbbing pain on one side of the head, with nausea or sensitivity to light",
          "isRedFlag": false,
          "selfCareTip": "Rest in a quiet, dark room. Drink some water and put a cool cloth on your forehead.",
          "guidance": "This looks like a migraine. If it keeps coming back, ask your family doctor about treatment that prevents it.",
          "title": "Migraine or throbbing pain",
          "description": "Pulsing pain, usually on one side of the head. Light or noise may bother you, or you may feel sick."
        },
        {
          "id": "head_tension",
          "label": "Pressure like a tight band around the head, after stress or tiredness",
          "isRedFlag": false,
          "selfCareTip": "Take a break from screens and gently rub your neck. Get some fresh air.",
          "guidance": "It often comes from stress, too little sleep or long hours at a desk.",
          "title": "Stress headache",
          "description": "Pressure like a tight band across the forehead or temples. Often after stress, long screen time or a tense neck."
        },
        {
          "id": "head_dehydration",
          "label": "Dull, constant ache after a hot day or after drinking too little water",
          "isRedFlag": false,
          "selfCareTip": "Slowly drink 1 to 2 large glasses of water or warm tea. Avoid drinks with caffeine or sugar.",
          "guidance": "It often goes away if you drink water and stay out of the heat.",
          "title": "Headache from heat or thirst",
          "description": "Dull ache all over the head, worse when you move it. Often after sun, heat or not drinking enough water."
        },
        {
          "id": "head_fever",
          "label": "Headache with fever, chills or a blocked nose",
          "isRedFlag": false,
          "selfCareTip": "Rest in bed, check your temperature and drink plenty of fluids.",
          "guidance": "It may be a cold or a virus. If the fever goes above 38.5 °C or lasts more than 3 days, see a doctor.",
          "title": "Headache with fever",
          "description": "Your head hurts and you have a temperature, chills, body aches or a blocked nose."
        },
        {
          "id": "head_sudden_severe",
          "label": "Sudden, very severe headache, or headache with confusion or weakness",
          "isRedFlag": true,
          "selfCareTip": "Sit down somewhere safe and call 112 now.",
          "guidance": "A very bad headache that starts suddenly is an emergency. You need a doctor now.",
          "title": "Sudden, very bad headache",
          "description": "The worst headache of your life, reaching full strength within seconds. It may come with a stiff neck, blurred vision or confusion."
        },
        {
          "id": "head_neck_stiff",
          "label": "Neck pain, stiff neck or soreness when turning your head",
          "isRedFlag": false,
          "selfCareTip": "Place a warm cloth on the back of your neck, relax your shoulders and turn your head slowly without forcing it. Avoid very high pillows.",
          "guidance": "This usually comes from tense neck muscles, an awkward sleeping position or long screen hours. See a doctor if numbness or tingling spreads down your arm.",
          "title": "Neck pain or stiff neck",
          "description": "Your neck or the back of your neck aches and feels stiff when turning your head or looking down, sometimes spreading towards the shoulder."
        },
        {
          "id": "head_throat_swallow",
          "label": "Sore throat when swallowing, hoarse voice or tender glands on the neck",
          "isRedFlag": false,
          "selfCareTip": "Sip warm tea or plain water often, rest your voice and avoid smoke or very hot or icy drinks.",
          "guidance": "Most sore throats come from a virus. See a doctor if you get a high fever, white patches on the tonsils or trouble swallowing saliva.",
          "title": "Sore throat or pain when swallowing",
          "description": "Your throat stings or hurts when you swallow, your voice feels rough, or small tender lumps appear under the jaw."
        },
        {
          "id": "head_jaw_ear",
          "label": "Earache, jaw joint pain when chewing or pressure around the cheeks and nose",
          "isRedFlag": false,
          "selfCareTip": "Eat soft foods, never put cotton buds inside the ear, and place a warm cloth against the outside of the cheek.",
          "guidance": "Ear pain, jaw joint strain or blocked sinuses are worth having checked by a family doctor or dentist.",
          "title": "Ear, jaw or sinus pain",
          "description": "One ear feels blocked or throbbing, your jaw hurts when chewing or opening wide, or you feel heavy pressure over the cheeks and forehead."
        },
        {
          "id": "head_neck_red_flag",
          "label": "Stiff neck with high fever, strong sensitivity to light, skin spots or confusion",
          "isRedFlag": true,
          "selfCareTip": "Lie down somewhere quiet and call 112 right away.",
          "guidance": "A very stiff neck with high fever or confusion can be a serious infection and needs hospital care immediately.",
          "title": "Stiff neck with high fever or confusion",
          "description": "You cannot bend your chin towards your chest because of neck stiffness, together with high fever, vomiting, drowsiness or bright light hurting your eyes."
        }
      ],
      "chest": [
        {
          "id": "chest_reflux",
          "label": "Burning in the chest or a sour taste after meals or when bending over",
          "isRedFlag": false,
          "selfCareTip": "Don't lie down right after eating. Cut out spicy or acidic food and coffee for a while.",
          "guidance": "Heartburn usually comes from stomach acid. If it doesn't go away, your family doctor can give you treatment.",
          "title": "Heartburn",
          "description": "Burning that rises from the stomach towards the throat. Worse when you bend over or after heavy or acidic meals."
        },
        {
          "id": "chest_exertion",
          "label": "Chest tightness or pressure during effort or when climbing stairs",
          "isRedFlag": false,
          "selfCareTip": "Stop what you are doing, sit down and breathe slowly.",
          "guidance": "Chest pressure during effort should be checked by a doctor, even if it goes away quickly when you stop.",
          "title": "Chest tightness when active",
          "description": "Squeezing in the middle of the chest when you walk fast, climb stairs or make an effort."
        },
        {
          "id": "chest_stitch",
          "label": "Sharp pain on one side of the chest, worse with a deep breath or a cough",
          "isRedFlag": false,
          "selfCareTip": "Breathe gently for a few minutes. Put something warm on the sore spot.",
          "guidance": "It is usually a strained muscle and goes away by itself. If breathing becomes hard, call 112.",
          "title": "Sharp pain when breathing",
          "description": "Sharp pain in one spot of the chest, worse when you breathe in deeply, cough or twist."
        },
        {
          "id": "chest_breast_pain",
          "label": "Breast tenderness, fullness, skin redness or pain while breastfeeding",
          "isRedFlag": false,
          "selfCareTip": "Wear a soft, supportive bra without tight underwire, and use a warm or cool cloth depending on what feels soothing.",
          "guidance": "Tenderness in both breasts often follows your monthly cycle. If one breast becomes red, hot and you develop a fever, see a doctor today.",
          "title": "Breast tenderness or soreness",
          "description": "Your breasts feel swollen or tender before a period, or one breast feels sore and firm while breastfeeding."
        },
        {
          "id": "chest_breast_lump",
          "label": "New lump, firm spot, skin dimpling on the breast or swelling in the underarm",
          "isRedFlag": false,
          "selfCareTip": "Avoid pressing or rubbing the spot hard. Note when you first noticed it so you can tell your doctor.",
          "guidance": "Most breast lumps are benign, especially in younger women, but any new lump or skin or nipple change should be checked by a doctor.",
          "title": "New lump in the breast or underarm",
          "description": "You feel a new lump or thicker spot in the breast or armpit, a dimple in the skin, or unusual nipple discharge."
        },
        {
          "id": "chest_warning",
          "label": "Heavy chest pain spreading to the left arm, neck or jaw, with shortness of breath",
          "isRedFlag": true,
          "selfCareTip": "Call 112 now. Sit down and loosen tight clothes.",
          "guidance": "This chest pain can be a heart attack. Every minute counts.",
          "title": "Severe chest pain that spreads",
          "description": "Heavy pressure in the chest that spreads to the left arm, neck, jaw or back. It may come with cold sweat or breathlessness."
        }
      ],
      "stomach": [
        {
          "id": "stomach_upper_reflux",
          "label": "Burning or a heavy feeling in the upper stomach",
          "isRedFlag": false,
          "selfCareTip": "Eat plain, light food. Drink water that is not cold, and avoid big or greasy meals.",
          "guidance": "An irritated stomach is common. If it bothers you every day, book a doctor's visit.",
          "title": "Burning in the upper stomach",
          "description": "Burning or acid under the ribs. You feel full quickly or taste something sour after eating."
        },
        {
          "id": "stomach_cramping_mild",
          "label": "Cramps across the belly, with bloating or going to the toilet more or less often",
          "isRedFlag": false,
          "selfCareTip": "Drink mint or chamomile tea, put something warm on your belly and rest.",
          "guidance": "Short cramps usually come from digestion or something you ate.",
          "title": "Cramps and bloating",
          "description": "Your belly tightens now and then, feels swollen, you have gas or go to the toilet more or less often."
        },
        {
          "id": "stomach_lower_sharp",
          "label": "Sharp pain in one spot, in the lower right belly",
          "isRedFlag": true,
          "selfCareTip": "Until a doctor sees you, don't take strong painkillers or put anything hot on your belly.",
          "guidance": "Pain that stays in the lower right belly needs a doctor quickly. It may be appendicitis.",
          "title": "Pain in the lower right belly",
          "description": "Pain in the lower right part of the belly that keeps getting worse, and hurts more when you cough, walk or press on it."
        },
        {
          "id": "stomach_severe_widespread",
          "label": "Severe, constant belly pain with repeated vomiting, a hard belly or fever",
          "isRedFlag": true,
          "selfCareTip": "Don't eat and don't drink much. Go to the emergency department now or call 112.",
          "guidance": "Very bad pain with a hard belly may need emergency surgery.",
          "title": "Very bad pain across the belly",
          "description": "Your whole belly hurts badly and feels hard, you keep vomiting or feel close to fainting."
        }
      ],
      "pelvis": [
        {
          "id": "pelvis_period_cramps",
          "label": "Period cramps or cyclical ache low in the pelvis around menstruation",
          "isRedFlag": false,
          "selfCareTip": "Place a warm water bottle low on your belly, sip warm drinks and rest on your side with your knees bent.",
          "guidance": "Mild period cramps are common, but if pain keeps you from work, sleep or school, a gynaecological check can look for endometriosis or fibroids.",
          "title": "Period cramps or monthly pelvic ache",
          "description": "Cramping or dull ache low in the belly and lower back just before or during your period."
        },
        {
          "id": "pelvis_one_sided",
          "label": "Pain on one side of the lower pelvis, ovary area or groin",
          "isRedFlag": false,
          "selfCareTip": "Rest from heavy lifting or intense exercise, and avoid hot packs if the pain is sharp.",
          "guidance": "One-sided pelvic pain can come from an ovarian cyst, ovulation or a groin strain, and is worth having checked by a doctor.",
          "title": "One-sided pelvic or groin pain",
          "description": "Sharp twinge or steady ache on one side of the lower belly or groin crease, sometimes worse when moving."
        },
        {
          "id": "pelvis_urinary_burning",
          "label": "Burning when passing urine, cloudy urine or needing the toilet very often",
          "isRedFlag": false,
          "selfCareTip": "Drink plenty of plain water throughout the day and don't hold urine in. Skip coffee and fizzy drinks.",
          "guidance": "This often points to a urinary tract infection. A family doctor can test your urine and prescribe treatment. Seek care today if fever or back pain starts.",
          "title": "Burning when peeing or frequent urge",
          "description": "Stinging when you pass urine, pressure just above the pubic bone, or feeling like your bladder is still full."
        },
        {
          "id": "pelvis_pressure_floor",
          "label": "Heaviness, dragging pressure or soreness in the pelvic floor or intimate area",
          "isRedFlag": false,
          "selfCareTip": "Avoid lifting heavy loads and straining on the toilet. Wear breathable cotton underwear.",
          "guidance": "Pelvic heaviness or local soreness is common after childbirth, around menopause or with mild infections, and responds well to proper care.",
          "title": "Pelvic floor pressure or intimate soreness",
          "description": "A heavy feeling low in the pelvis, soreness when sitting, or irritation in the intimate area."
        },
        {
          "id": "pelvis_pregnancy_bleeding",
          "label": "Sudden severe pelvic pain, heavy vaginal bleeding, or pelvic pain when you could be pregnant",
          "isRedFlag": true,
          "selfCareTip": "Lie down safely, do not take painkillers on your own, and call 112 or go to emergency care now.",
          "guidance": "Severe pelvic pain with heavy bleeding, dizziness or possible pregnancy can be a gynaecological emergency and needs immediate hospital care.",
          "title": "Severe pelvic pain, heavy bleeding or pregnancy",
          "description": "Sudden strong pain low in the pelvis with heavy bleeding, dizziness, fever, or any sharp pelvic pain when you are or might be pregnant."
        }
      ],
      "back": [
        {
          "id": "back_strain_lift",
          "label": "Sharp lower back pain that started right after lifting something heavy",
          "isRedFlag": false,
          "selfCareTip": "Don't bend or lift heavy things. Rest, but also take short walks. Use a warm compress.",
          "guidance": "This is very common. Gentle movement helps more than staying in bed.",
          "title": "Back pain after lifting",
          "description": "The lower back muscles locked up right after lifting something heavy or twisting suddenly."
        },
        {
          "id": "back_chronic",
          "label": "Dull lower back ache for several weeks",
          "isRedFlag": false,
          "selfCareTip": "Do gentle back stretches. Adjust your chair height and don't sit still for long.",
          "guidance": "Long-lasting back pain gets better with exercises shown by a physiotherapist and stronger belly muscles.",
          "title": "Back pain that won't go away",
          "description": "Dull lower back pain for weeks, worse after sitting or standing for a long time."
        },
        {
          "id": "back_stiffness",
          "label": "Stiff back in the morning or after sitting for a long time",
          "isRedFlag": false,
          "selfCareTip": "In the morning, gently roll your shoulders and bend slowly a few times before you start the day.",
          "guidance": "It often comes from tense muscles or staying in one position for a long time.",
          "title": "Stiff back in the morning",
          "description": "Your back is stiff when you wake up and bending is hard. It gets better after you move a little."
        },
        {
          "id": "back_severe_difficulty",
          "label": "Severe back pain with numbness in both legs, weakness or loss of bladder control",
          "isRedFlag": true,
          "selfCareTip": "Lie down and call 112 now.",
          "guidance": "The nerves in your back may be badly pressed. You need a hospital now.",
          "title": "Back pain with numb legs",
          "description": "Strong back pain with numbness or weakness in both legs, or new problems controlling urine or stool."
        },
        {
          "id": "back_upper_blades",
          "label": "Pain, tightness or burning in the upper back or between the shoulder blades",
          "isRedFlag": false,
          "selfCareTip": "Stand up often, gently roll your shoulders back and put a warm compress across the upper back.",
          "guidance": "Upper back ache often comes from leaning over a phone or work table, or carrying heavy bags on one shoulder.",
          "title": "Upper back pain or between the shoulder blades",
          "description": "Tightness or aching high on your back and between the shoulder blades, especially after sitting or working with your arms."
        },
        {
          "id": "back_flank_kidney",
          "label": "One-sided mid-back or flank pain under the ribs, with fever, nausea or burning urine",
          "isRedFlag": false,
          "selfCareTip": "Sip plain water steadily and avoid strong anti-inflammatory painkillers until a doctor checks you.",
          "guidance": "Deep pain on one side of the back under the ribs, especially with fever or urinary changes, can come from a kidney issue and should be seen today.",
          "title": "One-sided flank or kidney area pain",
          "description": "Deep ache on one side of the mid-back under the ribs that doesn't change much with posture, sometimes with fever or stinging urine."
        }
      ],
      "arm": [
        {
          "id": "arm_shoulder_elbow",
          "label": "Shoulder pain when lifting the arm or elbow pain when gripping or carrying",
          "isRedFlag": false,
          "selfCareTip": "Rest from repeated overhead reaching and avoid sleeping directly on the sore shoulder for a few nights.",
          "guidance": "This is often an irritated tendon in the shoulder or elbow. See a doctor if you cannot lift the arm or pain lasts over a week.",
          "title": "Shoulder or elbow pain when moving",
          "description": "Your shoulder catches or aches when raising your arm or dressing, or your elbow hurts when gripping or twisting objects."
        },
        {
          "id": "arm_sprain",
          "label": "Shoulder, elbow or wrist pain after a fall, a twist or a knock",
          "isRedFlag": false,
          "selfCareTip": "Put ice wrapped in a towel on the sore spot. Rest the arm and keep it supported.",
          "guidance": "Mild knocks and sprains usually get better in a few days if you rest the joint.",
          "title": "Wrist or joint pain after a fall",
          "description": "Your wrist, elbow or shoulder hurts and is swollen after a knock or falling onto your hands."
        },
        {
          "id": "arm_numbness",
          "label": "Mild numbness or pins and needles in the fingers after typing or phone use",
          "isRedFlag": false,
          "selfCareTip": "Take 5-minute breaks often. Shake your hands and gently turn your wrists.",
          "guidance": "It may be a pinched nerve at the wrist. Tell your doctor if it doesn't go away.",
          "title": "Tingling fingers",
          "description": "Numbness or pins and needles in the thumb, index and middle fingers, often at night or when typing."
        },
        {
          "id": "arm_ache",
          "label": "Aching, tired arm muscles after heavy physical work or sports",
          "isRedFlag": false,
          "selfCareTip": "Take a warm shower, gently rub the muscles and rest for a day.",
          "guidance": "This is normal after unusual effort. It goes away by itself in 2 to 3 days.",
          "title": "Sore arm muscles",
          "description": "Your arm muscles ache after unusual effort, sport or carrying heavy things."
        },
        {
          "id": "arm_sudden_swelling",
          "label": "Sudden weakness in one arm, can't lift it, or fast, heavy swelling",
          "isRedFlag": true,
          "selfCareTip": "Don't force the arm. Call 112 now.",
          "guidance": "Sudden weakness in an arm can be a stroke or a serious injury.",
          "title": "Sudden weakness in one arm",
          "description": "Suddenly you cannot lift or hold up one arm. It may come with a drooping face or slurred speech."
        }
      ],
      "leg": [
        {
          "id": "leg_sprain",
          "label": "Swollen or painful ankle after a misstep",
          "isRedFlag": false,
          "selfCareTip": "Rest your leg up on a cushion and put a cold cloth on it for 15 minutes. Don't put your full weight on it.",
          "guidance": "Rest the ankle for a few days. If the swelling keeps growing or you cannot stand on it, get an X-ray.",
          "title": "Twisted ankle",
          "description": "Your ankle hurts and is swollen after you rolled it. It is hard to stand on."
        },
        {
          "id": "leg_cramp",
          "label": "Painful muscle spasm or sudden tightness in the calf during the night",
          "isRedFlag": false,
          "selfCareTip": "Straighten your leg and gently pull your toes towards you. Rub the calf and drink some water.",
          "guidance": "Cramps often come after tiredness, heavy sweating or not drinking enough water.",
          "title": "Calf cramp",
          "description": "The calf muscle tightens suddenly and painfully, often at night or when you have not drunk enough."
        },
        {
          "id": "leg_knee_ache",
          "label": "Knee pain going downstairs or after a long walk",
          "isRedFlag": false,
          "selfCareTip": "Avoid squatting and carrying heavy things. Wear comfortable shoes with soft soles.",
          "guidance": "Knees wear over time. Exercises that strengthen the leg muscles help.",
          "title": "Knee pain on stairs",
          "description": "Your knee hurts when you go down stairs, squat, or after sitting long with bent knees."
        },
        {
          "id": "leg_sudden_swelling",
          "label": "One leg suddenly swollen, warm, red and painful, or you can't stand on it",
          "isRedFlag": true,
          "selfCareTip": "Stay seated and don't rub the leg. See a doctor or go to the emergency department quickly.",
          "guidance": "Sudden swelling in one leg can be a blood clot. It needs treatment fast.",
          "title": "Sudden swelling in one leg",
          "description": "Only one calf swelled up suddenly and is warm, red and painful."
        },
        {
          "id": "leg_heel_foot",
          "label": "Heel, Achilles tendon or foot arch pain when stepping onto your foot",
          "isRedFlag": false,
          "selfCareTip": "Wear supportive shoes with cushioned soles and avoid walking barefoot on hard floors.",
          "guidance": "Foot sole and heel pain often follow long hours standing or thin footwear. See a doctor promptly if you have diabetes and notice any foot sore.",
          "title": "Heel or foot sole pain",
          "description": "Sharp soreness under the heel or along the arch on your first morning steps, or tightness just above the heel."
        },
        {
          "id": "leg_hip_thigh",
          "label": "Hip or thigh pain when walking, climbing stairs or rising from a chair",
          "isRedFlag": false,
          "selfCareTip": "Avoid long strides or heavy loads and place a pillow between your knees when sleeping on your side.",
          "guidance": "Hip or thigh pain can come from a strained muscle or the hip joint. See a doctor if you limp or pain lasts longer than a week.",
          "title": "Hip or thigh pain when walking",
          "description": "Aching on the side of the hip, groin crease or thigh muscles when walking, climbing stairs or lying on that side."
        }
      ]
    },
    "severity": {
      "mild": {
        "title": "Mild",
        "description": "You notice it but can do your usual things."
      },
      "moderate": {
        "title": "Moderate",
        "description": "It gets in the way of work, moving or sleep."
      },
      "severe": {
        "title": "Severe",
        "description": "You can hardly do anything."
      }
    },
    "duration": {
      "today": {
        "label": "Today or yesterday",
        "hint": "Under 24 hours"
      },
      "days": {
        "label": "2–7 days",
        "hint": "2 to 7 days"
      },
      "weeks": {
        "label": "1–2 weeks",
        "hint": "1 to 2 weeks"
      },
      "chronic": {
        "label": "Over 2 weeks",
        "hint": "Won't go away or keeps coming back"
      }
    },
    "urgency": {
      "low": {
        "title": "You can likely look after this at home",
        "intro": "Rest, drink water and watch how you feel for a few days. If it gets worse or new signs appear, call your doctor or 112."
      },
      "medium": {
        "title": "See your family doctor in the next few days",
        "intro": "This is worth showing to a doctor. If it gets worse in the meantime, call 112."
      },
      "high": {
        "title": "See a doctor today",
        "intro": "Don't put it off. Call your doctor or go to a clinic today. If it gets worse, call 112."
      }
    }
  },
  "sq": {
    "ui": {
      "eyebrow": "Kontroll shëndetësor",
      "heading": "Kontrollo simptomat",
      "subtitle": "Trego në trup ku të dhemb dhe përgjigju disa pyetjeve të shkurtra. Pastaj shiko çfarë të bësh.",
      "resetButton": "Fillo nga e para",
      "backButton": "Kthehu",
      "nextButton": "Vazhdo",
      "finishButton": "Shiko rezultatin",
      "stepIndicator": "Hapi {current} nga {total}",
      "step1Title": "Zona",
      "step2Title": "Simptoma",
      "step3Title": "Sa keq",
      "step4Title": "Rezultati",
      "step1Question": "Ku ndien dhimbje ose shqetësim?",
      "step1Prompt": "Prek zonën në trup ose zgjidhe nga lista.",
      "step2Question": "Cila i ngjan më shumë asaj që ndien?",
      "step2Prompt": "Zgjidh simptomën që të shqetëson më shumë.",
      "urgentBadge": "Shenjë urgjence",
      "step3Question": "Sa keq është dhe prej sa kohësh?",
      "step3Prompt": "Zgjidh një mundësi në çdo grup.",
      "severityHeading": "Sa keq është?",
      "durationHeading": "Prej sa kohësh e ke?",
      "step4Question": "Çfarë mund të bësh tani",
      "step4Prompt": "Sipas përgjigjeve të tua. Nuk është diagnozë.",
      "summaryHeading": "Përmbledhja e përgjigjeve",
      "areaLabel": "Zona",
      "symptomLabel": "Simptoma",
      "intensityLabel": "Sa keq",
      "durationLabel": "Prej sa kohësh",
      "recommendationHeading": "Çfarë të bësh më pas",
      "safeSelfCareHeading": "Çfarë mund të bësh në shtëpi",
      "copySummary": "Kopjo përmbledhjen",
      "copied": "U kopjua",
      "sendWhatsApp": "Ndaj në WhatsApp",
      "showDoctor": "Tregoja mjekut",
      "requestMediatorHelp": "Fol me një mediator",
      "scheduleDoctor": "Takim me mjekun online",
      "readEducationalTopic": "Lexo udhëzuesin",
      "disclaimer": "Kjo nuk është diagnozë. Nëse ndihesh më keq ose të dhemb shumë, telefono 112.",
      "viewer3D": {
        "ariaLabel": "Trupi 3D. Rrotulloje dhe prek vendin ku të dhemb.",
        "loading": "Po ngarkohet modeli 3D ({progress}%)",
        "subModelInfo": "Trupi 3D",
        "front": "Përpara",
        "back": "Prapa",
        "perspective": "Këndi",
        "rotate360": "360°",
        "zoomIn": "Zmadho",
        "zoomOut": "Zvogëlo",
        "resetView": "Rivendos pamjen",
        "tip": "Tërhiq majtas ose djathtas për ta rrotulluar trupin. Prek ku të dhemb.",
        "searchPlaceholder": "Kërko një organ ose muskul (p.sh. zemra, biceps)",
        "selected3DStructure": "Zgjodhe:",
        "activeAreaPrefix": "Zona:",
        "leftSide": "Majtas",
        "rightSide": "Djathtas",
        "selectRegionPrefix": "Zgjidh",
        "rotateTooltip": "Rrotullo trupin 180°",
        "layerHybrid": "Muskujt dhe organet",
        "layerMuscular": "Muskujt dhe tendinat",
        "layerOrgans": "Organet e brendshme",
        "layerSurface": "Lëkura",
        "legendSkeletalMuscles": "Muskujt",
        "legendTendonsJoints": "Tendinat dhe kyçet",
        "legendInternalOrgans": "Organet e brendshme",
        "legendSelectedStructure": "Struktura e zgjedhur"
      },
      "emergency": {
        "badge": "Urgjencë mjekësore 112",
        "title": "Mund të jetë urgjencë: telefono tani 112",
        "description": "Mos prit. Nëse nuk mund të telefonosh, shko shpejt në Urgjencë. Mos e drejto vetë makinën.",
        "whyEmergencyPrefix": "Zgjodhe:",
        "call112Now": "Telefono 112",
        "continueReview": "E kuptova"
      },
      "structure3DLabel": "Struktura 3D",
      "sensationLabel": "Ndjesia",
      "triggersLabel": "Çfarë e përkeqëson",
      "specialtyLabel": "Mjeku specialist",
      "warningNoticeRedFlag": "U raportuan shenja urgjence.",
      "warningNoticeSafe": "Nuk u raportuan shenja urgjence."
    },
    "bodyParts": {
      "head": {
        "title": "Koka dhe qafa",
        "subtitle": "Dhimbje koke, nofulla, veshi, qafë e ngurtë ose marramendje"
      },
      "chest": {
        "title": "Gjoksi dhe frymëmarrja",
        "subtitle": "Shtrëngim në gjoks, gjinjtë, brinjët, frymëmarrje e rëndë ose rrahje zemre"
      },
      "stomach": {
        "title": "Stomaku dhe barku",
        "subtitle": "Djegie, ngërçe tretjeje, të përziera, fryrje ose dhimbje barku"
      },
      "pelvis": {
        "title": "Pelvisi dhe fundi i barkut",
        "subtitle": "Dhimbje menstruale, vezoret, djegie gjatë urinimit, ijët ose zona intime"
      },
      "back": {
        "title": "Shpina dhe mesi",
        "subtitle": "Dhimbje në fund të shpinës, kërbishti, muskuj të bllokuar ose shpatullat"
      },
      "arm": {
        "title": "Krahët dhe duart",
        "subtitle": "Mpirje, dhimbje shpatulle, bërryli, kyçi ose gishtash"
      },
      "leg": {
        "title": "Këmbët dhe shputat",
        "subtitle": "Dhimbje ije, gjuri, kyçi i këmbës, thembre ose shpute"
      }
    },
    "symptomsByRegion": {
      "head": [
        {
          "id": "head_migraine",
          "label": "Dhimbje pulsuese në njërën anë të kokës, me të përziera ose ndjeshmëri ndaj dritës",
          "isRedFlag": false,
          "selfCareTip": "Pusho në një dhomë të qetë e të errët, pi ujë dhe vendos një kompresë të freskët në ballë.",
          "guidance": "Duket si migrenë. Nëse kthehet shpesh, pyet mjekun e familjes për një trajtim që e parandalon.",
          "title": "Migrenë ose dhimbje që rreh",
          "description": "Dhimbje që rreh, zakonisht në njërën anë të kokës. Mund të të shqetësojë drita, zhurma ose të vjen për të vjellë."
        },
        {
          "id": "head_tension",
          "label": "Shtrëngim si brez rreth kokës, pas stresit ose lodhjes",
          "isRedFlag": false,
          "selfCareTip": "Bëj një pushim nga ekranet dhe masazho lehtë qafën. Dil pak në ajër të pastër.",
          "guidance": "Shpesh vjen nga stresi, gjumi i pakët ose shumë orë në tavolinë.",
          "title": "Dhimbje koke nga stresi",
          "description": "Shtrëngim si një rrip rreth ballit ose tëmthave. Ndodh shpesh pas stresit, shumë orë para ekranit ose kur qafa është e tendosur."
        },
        {
          "id": "head_dehydration",
          "label": "Dhimbje e shurdhër dhe e vazhdueshme pas një dite të nxehtë ose kur ke pirë pak ujë",
          "isRedFlag": false,
          "selfCareTip": "Pi ngadalë 1 deri në 2 gota të mëdha me ujë ose çaj të vakët. Shmang pijet me kafeinë ose sheqer.",
          "guidance": "Shpesh kalon nëse pi ujë dhe qëndron larg vapës.",
          "title": "Dhimbje koke nga vapa ose etja",
          "description": "Dhimbje e shurdhër në gjithë kokën, më e fortë kur e lëviz. Ndodh pas diellit, vapës ose kur ke pirë pak ujë."
        },
        {
          "id": "head_fever",
          "label": "Dhimbje koke me temperaturë, të dridhura ose hundë të zënë",
          "isRedFlag": false,
          "selfCareTip": "Pusho në shtrat, mat temperaturën dhe pi shumë lëngje.",
          "guidance": "Mund të jetë ftohje ose virus. Nëse temperatura kalon 38,5 °C ose zgjat mbi 3 ditë, shko te mjeku.",
          "title": "Dhimbje koke me temperaturë",
          "description": "Të dhemb koka dhe ke temperaturë, të dridhura, dhimbje trupi ose hundë të zënë."
        },
        {
          "id": "head_sudden_severe",
          "label": "Dhimbje koke e papritur dhe shumë e fortë, ose me hutim a dobësi",
          "isRedFlag": true,
          "selfCareTip": "Ulu diku të sigurt dhe telefono menjëherë 112.",
          "guidance": "Një dhimbje koke shumë e fortë që vjen papritur është urgjencë. Të duhet mjek menjëherë.",
          "title": "Dhimbje koke e papritur dhe shumë e fortë",
          "description": "Dhimbja më e fortë e kokës në jetën tënde, e ardhur brenda pak sekondave. Mund të ketë qafë të ngurtë, shikim të turbullt ose hutim."
        },
        {
          "id": "head_neck_stiff",
          "label": "Dhimbje qafe, qafë e ngurtë ose dhimbje kur kthen kokën",
          "isRedFlag": false,
          "selfCareTip": "Vendos një peshqir të ngrohtë pas qafës, ul supet dhe ktheje kokën ngadalë pa e sforcuar. Shmang jastëkët shumë të lartë.",
          "guidance": "Zakonisht vjen nga muskujt e tendosur të qafës, pozicioni i keq në gjumë ose orët para ekranit. Shko te mjeku nëse mpirja zbret në krah.",
          "title": "Dhimbje qafe ose qafë e ngurtë",
          "description": "Qafa ose zverku të dhemb dhe lëviz me vështirësi kur kthen kokën a shikon poshtë, ndonjëherë me tendosje drejt shpatullës."
        },
        {
          "id": "head_throat_swallow",
          "label": "Dhimbje fyti kur gëlltitesh, zë i ngjirur ose gjëndra të ënjtura në qafë",
          "isRedFlag": false,
          "selfCareTip": "Pi çaj të vakët ose ujë me gllënjka të vogla, pusho zërin dhe shmang tymin a pijet shumë të ftohta.",
          "guidance": "Shumica e dhimbjeve të fytit janë virale. Shko te mjeku nëse ke temperaturë të lartë, njolla të bardha në fyt ose gëlltitesh me vështirësi.",
          "title": "Dhimbje fyti ose gjatë gëlltitjes",
          "description": "Fyti të djeg ose të dhemb kur gëlltitesh, ke zë të ngjirur ose ndien kokrra të ndjeshme nën nofull."
        },
        {
          "id": "head_jaw_ear",
          "label": "Dhimbje veshi, nofulle gjatë përtypjes ose shtypje rreth faqeve dhe sinuseve",
          "isRedFlag": false,
          "selfCareTip": "Ha ushqime të buta, mos fut shkopinj pambuku në vesh dhe vendos një kompresë të vakët jashtë mbi faqe.",
          "guidance": "Dhimbja e veshit, nyja e nofullës ose sinuset e bllokuara duhen kontrolluar nga mjeku i familjes ose dentisti.",
          "title": "Dhimbje veshi, nofulle ose sinusesh",
          "description": "Njëri vesh të dhemb ose e ndien të bllokuar, të dhemb nofulla kur përtypesh ose ndien rëndesë në ballë dhe faqe."
        },
        {
          "id": "head_neck_red_flag",
          "label": "Qafë shumë e ngurtë me temperaturë të lartë, bezdi të fortë nga drita, njolla në lëkurë ose hutim",
          "isRedFlag": true,
          "selfCareTip": "Shtrihu në një vend të qetë dhe telefono menjëherë 112.",
          "guidance": "Qafa shumë e ngurtë me temperaturë të lartë ose hutim mund të jetë infeksion i rëndë dhe kërkon spital menjëherë.",
          "title": "Qafë e ngurtë me temperaturë të lartë ose hutim",
          "description": "Nuk e ul dot mjekrën drejt gjoksit nga dhimbja, ke temperaturë të lartë, përgjumje, të vjella ose të vret shumë drita."
        }
      ],
      "chest": [
        {
          "id": "chest_reflux",
          "label": "Djegie në gjoks ose shije e thartë pas ngrënies ose kur përkulesh",
          "isRedFlag": false,
          "selfCareTip": "Mos u shtri menjëherë pas ngrënies. Për ca kohë ha më pak ushqime pikante dhe pi më pak kafe.",
          "guidance": "Djegia zakonisht vjen nga acidi i stomakut. Nëse nuk kalon, mjeku i familjes mund të të japë trajtim.",
          "title": "Djegie në gjoks",
          "description": "Djegie që ngjitet nga stomaku drejt fytit. Është më keq kur përkulesh ose pas ushqimeve të rënda a të athëta."
        },
        {
          "id": "chest_exertion",
          "label": "Shtrëngim ose shtypje në gjoks kur lodhesh ose ngjit shkallë",
          "isRedFlag": false,
          "selfCareTip": "Ndalo, ulu dhe merr frymë ngadalë.",
          "guidance": "Shtrëngimi në gjoks kur lodhesh duhet parë nga mjeku, edhe nëse kalon shpejt kur ndalon.",
          "title": "Shtrëngim në gjoks kur lodhesh",
          "description": "Shtrëngim në mes të gjoksit kur ecën shpejt, ngjit shkallë ose bën përpjekje."
        },
        {
          "id": "chest_stitch",
          "label": "Therje në njërën anë të gjoksit, më e fortë kur merr frymë thellë ose kollitesh",
          "isRedFlag": false,
          "selfCareTip": "Merr frymë lehtë dhe ngadalë për disa minuta. Vendos diçka të ngrohtë ku të dhemb.",
          "guidance": "Zakonisht është një muskul i tendosur dhe kalon vetë. Nëse merr frymë me vështirësi, telefono 112.",
          "title": "Therje kur merr frymë",
          "description": "Dhimbje e mprehtë në një pikë të gjoksit, më e fortë kur merr frymë thellë, kollitesh ose rrotullohesh."
        },
        {
          "id": "chest_breast_pain",
          "label": "Ndjeshmëri, ënjtje, skuqje në gji ose dhimbje gjatë gjidhënies",
          "isRedFlag": false,
          "selfCareTip": "Mbaj reçipeta të buta pa tel të ngushtë dhe vendos një kompresë të vakët ose të freskët sipas rehatisë.",
          "guidance": "Ndjeshmëria në të dy gjinjtë shpesh lidhet me ciklin menstrual. Nëse njëri gji skuqet, nxehet dhe ke temperaturë, shko sot te mjeku.",
          "title": "Ndjeshmëri ose dhimbje në gji",
          "description": "Gjinjtë janë të fryrë ose të ndjeshëm para ciklit, ose njëri gji dhemb e forcohet gjatë gjidhënies."
        },
        {
          "id": "chest_breast_lump",
          "label": "Gjëndër e re, zonë e fortë, gropëzim i lëkurës në gji ose ënjtje nën sqetull",
          "isRedFlag": false,
          "selfCareTip": "Mos e shtyp dhe mos e fërko fort vendin. Shëno kur e vure re që t'ia thuash mjekut.",
          "guidance": "Shumica e gjëndrave në gji janë të parrezikshme, por çdo gjëndër e re ose ndryshim i lëkurës a thithkës duhet kontrolluar nga mjeku.",
          "title": "Gjëndër e re në gji ose nën sqetull",
          "description": "Ndien një kokërr a zonë më të fortë në gji ose nën sqetull, tërheqje të lëkurës ose rrjedhje të pazakontë."
        },
        {
          "id": "chest_warning",
          "label": "Dhimbje e rëndë në gjoks që shkon te krahu i majtë, qafa ose nofulla, me vështirësi në frymëmarrje",
          "isRedFlag": true,
          "selfCareTip": "Telefono menjëherë 112. Ulu dhe liro rrobat e ngushta.",
          "guidance": "Kjo dhimbje gjoksi mund të jetë infarkt. Çdo minutë ka rëndësi.",
          "title": "Dhimbje e fortë në gjoks që përhapet",
          "description": "Shtypje e rëndë në gjoks që shkon drejt krahut të majtë, qafës, nofullës ose shpinës. Mund të ketë djersë të ftohtë ose mungesë fryme."
        }
      ],
      "stomach": [
        {
          "id": "stomach_upper_reflux",
          "label": "Djegie ose rëndesë në pjesën e sipërme të stomakut",
          "isRedFlag": false,
          "selfCareTip": "Ha ushqime të thjeshta e të lehta. Pi ujë jo të ftohtë dhe shmang vaktet e mëdha.",
          "guidance": "Stomaku i irrituar është i shpeshtë. Nëse të shqetëson çdo ditë, lër një takim te mjeku.",
          "title": "Djegie në pjesën e sipërme të stomakut",
          "description": "Djegie ose acid poshtë brinjëve. Ngopesh shpejt ose ndien shije të thartë pas ngrënies."
        },
        {
          "id": "stomach_cramping_mild",
          "label": "Ngërçe në gjithë barkun, me fryrje, tretje të vështirë ose pak të përziera",
          "isRedFlag": false,
          "selfCareTip": "Pi çaj menteje ose kamomili, vendos një peshqir të ngrohtë në bark dhe pusho.",
          "guidance": "Ngërçet e shkurtra zakonisht vijnë nga tretja ose nga ajo që ke ngrënë.",
          "title": "Ngërçe dhe fryrje",
          "description": "Barku të shtrëngohet herë pas here, është i fryrë, ke gazra ose shkon në tualet më shpesh ose më rrallë."
        },
        {
          "id": "stomach_lower_sharp",
          "label": "Dhimbje e mprehtë në një pikë, poshtë djathtas në bark",
          "isRedFlag": true,
          "selfCareTip": "Derisa të të shohë mjeku, mos merr qetësues të fortë dhe mos vendos asgjë të nxehtë në bark.",
          "guidance": "Dhimbja që qëndron poshtë djathtas në bark duhet parë shpejt nga mjeku. Mund të jetë apendicit.",
          "title": "Dhimbje poshtë djathtas",
          "description": "Dhimbje në pjesën e poshtme djathtas të barkut që përkeqësohet, më e fortë kur kollitesh, ecën ose shtyp."
        },
        {
          "id": "stomach_severe_widespread",
          "label": "Dhimbje barku shumë e fortë dhe e vazhdueshme, me të vjella të përsëritura, bark të fortë ose temperaturë",
          "isRedFlag": true,
          "selfCareTip": "Mos ha dhe mos pi shumë. Shko menjëherë në Urgjencë ose telefono 112.",
          "guidance": "Dhimbja shumë e fortë me bark të fortë mund të kërkojë operacion urgjent.",
          "title": "Dhimbje shumë e fortë në gjithë barkun",
          "description": "Gjithë barku të dhemb shumë dhe është i fortë, vjell vazhdimisht ose ndihesh sikur do të të bjerë të fikët."
        }
      ],
      "pelvis": [
        {
          "id": "pelvis_period_cramps",
          "label": "Ngërçe menstruale ose dhimbje e shurdhër poshtë në pelvis rreth ciklit",
          "isRedFlag": false,
          "selfCareTip": "Vendos një shishe me ujë të ngrohtë në fund të barkut, pi pije të ngrohta dhe pusho në krah me gjunjët e mbledhur.",
          "guidance": "Dhimbjet e lehta gjatë ciklit janë të zakonshme, por nëse të pengojnë në jetën e përditshme, kontrolli gjinekologjik ndihmon për të përjashtuar endometriozën ose miomat.",
          "title": "Dhimbje menstruale ose ciklike në pelvis",
          "description": "Shtrëngim ose dhimbje e shurdhër në fund të barkut dhe të mesit para ose gjatë periodave."
        },
        {
          "id": "pelvis_one_sided",
          "label": "Dhimbje në njërën anë të pelvisit, te vezorja ose në rrëzë të kofshës",
          "isRedFlag": false,
          "selfCareTip": "Shmang ngritjen e peshave dhe mos vendos kompresa të nxehta nëse dhimbja është therëse.",
          "guidance": "Dhimbja në njërën anë të fundit të barkut mund të vijë nga një kist në vezore, ovulimi ose tërheqja në ijë dhe ia vlen të shihet nga mjeku.",
          "title": "Dhimbje në njërën anë të pelvisit ose në ijë",
          "description": "Therje ose shtypje në njërën anë të fundit të barkut a në palën e ijës, ndonjëherë më e fortë kur lëviz."
        },
        {
          "id": "pelvis_urinary_burning",
          "label": "Djegie gjatë urinimit, urinë e turbullt ose nevojë e shpeshtë për të urinuar",
          "isRedFlag": false,
          "selfCareTip": "Pi ujë rregullisht gjatë ditës dhe mos e mbaj urinën. Shmang kafenë dhe pijet me gaz.",
          "guidance": "Ngjan me një infeksion urinar. Mjeku i familjes mund të kërkojë analizë urine dhe trajtim. Shko sot te mjeku nëse ke temperaturë ose dhimbje mesi.",
          "title": "Djegie gjatë urinimit ose urinim i shpeshtë",
          "description": "Të djeg kur urinon, ndien shtypje mbi kockën pubike ose ndien sikur fshikëza nuk u zbraz."
        },
        {
          "id": "pelvis_pressure_floor",
          "label": "Rëndesë, shtypje ose shqetësim në dyshemenë e pelvisit a zonën intime",
          "isRedFlag": false,
          "selfCareTip": "Shmang peshën e rëndë dhe kapsllëkun. Vish të brendshme të lirshme pambuku.",
          "guidance": "Ndjesia e rëndesës ose irritimit shfaqet shpesh pas lindjes, në menopauzë ose nga infeksionet lokale dhe trajtohet lehtë pas vizitës.",
          "title": "Shtypje në pelvis ose shqetësim intim",
          "description": "Ndjesi rëndese poshtë në pelvis, ndjeshmëri kur ulesh ose irritim në zonën intime."
        },
        {
          "id": "pelvis_pregnancy_bleeding",
          "label": "Dhimbje e papritur shumë e fortë në pelvis, gjakderdhje e madhe ose dhimbje kur mund të jesh shtatzënë",
          "isRedFlag": true,
          "selfCareTip": "Shtrihu në vend të sigurt, mos merr ilaçe vetë dhe telefono menjëherë 112 ose shko në Urgjencë.",
          "guidance": "Dhimbja e fortë në pelvis me gjakderdhje, marramendje ose shtatzëni të mundshme është urgjencë gjinekologjike dhe kërkon spital menjëherë.",
          "title": "Dhimbje e fortë në pelvis, gjakderdhje ose shtatzëni",
          "description": "Dhimbje e fortë e papritur në fund të barkut me gjakderdhje të madhe, marramendje, temperaturë ose kur je a dyshon se je shtatzënë."
        }
      ],
      "back": [
        {
          "id": "back_strain_lift",
          "label": "Dhimbje e mprehtë në fund të shpinës, menjëherë pas ngritjes së një peshe",
          "isRedFlag": false,
          "selfCareTip": "Mos u përkul dhe mos ngri pesha. Pusho, por bëj edhe ecje të shkurtra. Vendos një kompresë të ngrohtë.",
          "guidance": "Ndodh shpesh. Lëvizja e lehtë ndihmon më shumë se qëndrimi në shtrat.",
          "title": "Dhimbje shpine pasi ngrite diçka",
          "description": "Muskujt e poshtëm të shpinës u bllokuan menjëherë pasi ngrite diçka të rëndë ose u rrotullove papritur."
        },
        {
          "id": "back_chronic",
          "label": "Dhimbje e shurdhër në fund të shpinës prej disa javësh",
          "isRedFlag": false,
          "selfCareTip": "Bëj ushtrime të lehta shtrirjeje për shpinën. Mos rri gjatë ulur pa lëvizur.",
          "guidance": "Dhimbja e shpinës që zgjat përmirësohet me ushtrime me fizioterapist dhe me muskuj barku më të fortë.",
          "title": "Dhimbje shpine që nuk kalon",
          "description": "Dhimbje e shurdhër poshtë në shpinë prej javësh, më e fortë kur rri gjatë ulur ose në këmbë."
        },
        {
          "id": "back_stiffness",
          "label": "Shpinë e ngurtë në mëngjes ose pasi rri gjatë ulur",
          "isRedFlag": false,
          "selfCareTip": "Në mëngjes rrotullo lehtë shpatullat dhe përkulu ngadalë disa herë para se të nisësh ditën.",
          "guidance": "Shpesh vjen nga muskujt e tendosur ose nga qëndrimi gjatë në të njëjtin pozicion.",
          "title": "Shpinë e ngurtë në mëngjes",
          "description": "Në mëngjes shpina është e ngurtë dhe përkulesh me vështirësi. Bëhet më mirë pasi lëviz pak."
        },
        {
          "id": "back_severe_difficulty",
          "label": "Dhimbje e fortë shpine me mpirje në të dyja këmbët, dobësi muskulore ose humbje të kontrollit të urinimit",
          "isRedFlag": true,
          "selfCareTip": "Rri shtrirë dhe telefono menjëherë 112.",
          "guidance": "Nervat e shpinës mund të jenë shtypur rëndë. Duhet të shkosh urgjent në spital.",
          "title": "Dhimbje shpine me mpirje në këmbë",
          "description": "Dhimbje e fortë shpine me mpirje ose dobësi në të dyja këmbët, ose probleme të reja me urinën ose jashtëqitjen."
        },
        {
          "id": "back_upper_blades",
          "label": "Dhimbje ose djegie në pjesën e sipërme të shpinës ose mes shpatullave",
          "isRedFlag": false,
          "selfCareTip": "Ngrihu shpesh nga karrigia, tërhiq lehtë shpatullat mbrapa dhe vendos një kompresë të ngrohtë sipër në shpinë.",
          "guidance": "Shfaqet shpesh nga qëndrimi i përkulur mbi telefon ose tavolinë, apo nga mbajtja e çantave të rënda në një sup.",
          "title": "Dhimbje sipër në shpinë ose mes shpatullave",
          "description": "Tendosje ose dhimbje në pjesën e sipërme të shpinës dhe mes shpatullave, sidomos pas qëndrimit ulur ose punës me krahë."
        },
        {
          "id": "back_flank_kidney",
          "label": "Dhimbje në njërën anë të mesit nën brinjë, me temperaturë, të përziera ose djegie gjatë urinimit",
          "isRedFlag": false,
          "selfCareTip": "Pi ujë me gllënjka të vogla dhe mos merr qetësues të fortë para se të të shohë mjeku.",
          "guidance": "Dhimbja në njërën anë të mesit nën brinjë, sidomos me temperaturë ose djegie kur urinon, mund të vijë nga veshkat dhe duhet parë sot nga mjeku.",
          "title": "Dhimbje në njërën anë të mesit ose te veshkat",
          "description": "Dhimbje e thellë në njërën anë të shpinës nën brinjë që nuk ndryshon me lëvizjen dhe mund të ketë temperaturë ose djegie në urinë."
        }
      ],
      "arm": [
        {
          "id": "arm_shoulder_elbow",
          "label": "Dhimbje shpatulle kur ngre krahun ose dhimbje bërryli kur shtrëngon a mban diçka",
          "isRedFlag": false,
          "selfCareTip": "Pusho nga lëvizjet e përsëritura lart dhe mos fli mbi shpatullën që të dhemb për disa net.",
          "guidance": "Shpesh është tendinë e irrituar në shpatull ose bërryl. Shko te mjeku nëse nuk e ngre dot krahun ose zgjat mbi një javë.",
          "title": "Dhimbje shpatulle ose bërryli gjatë lëvizjes",
          "description": "Shpatulla të dhemb kur ngre dorën a vishesh, ose bërryli të dhemb kur kap apo rrotullon sende."
        },
        {
          "id": "arm_sprain",
          "label": "Dhimbje në shpatull, bërryl ose kyç pas një rënieje, përdredhjeje apo goditjeje",
          "isRedFlag": false,
          "selfCareTip": "Vendos akull të mbështjellë me një peshqir ku të dhemb. Pushoje krahun dhe mbaje të mbështetur.",
          "guidance": "Goditjet dhe përdredhjet e lehta zakonisht përmirësohen brenda disa ditëve nëse e mban nyjën në pushim.",
          "title": "Dhimbje kyçi pas një rënieje",
          "description": "Kyçi, bërryli ose supi të dhemb dhe është i ënjtur pas një goditjeje ose rënieje mbi duar."
        },
        {
          "id": "arm_numbness",
          "label": "Mpirje e lehtë ose shpime në gishta pasi ke punuar gjatë me tastierë ose telefon",
          "isRedFlag": false,
          "selfCareTip": "Bëj shpesh pushime 5-minutëshe. Shkund duart dhe rrotullo lehtë kyçet.",
          "guidance": "Mund të jetë një nerv i shtypur te kyçi. Thuaji mjekut nëse nuk kalon.",
          "title": "Mpirje në gishta",
          "description": "Mpirje ose ndjesi si gjilpëra në dorë, në gishtin e madh, tregues dhe të mesëm, shpesh natën ose kur shkruan në tastierë."
        },
        {
          "id": "arm_ache",
          "label": "Muskuj të lodhur dhe me dhimbje në krah pas punëve të rënda fizike ose sportit",
          "isRedFlag": false,
          "selfCareTip": "Bëj një dush të ngrohtë, masazho muskujt dhe pusho një ditë.",
          "guidance": "Është normale pas një përpjekjeje të pazakontë. Kalon vetë brenda 2 deri në 3 ditë.",
          "title": "Muskuj krahu të lodhur",
          "description": "Muskujt e krahut të dhembin pas një përpjekjeje të pazakontë, sportit ose mbajtjes së peshave."
        },
        {
          "id": "arm_sudden_swelling",
          "label": "Krahu humb fuqinë papritur, nuk ngrihet dot ose ënjtet shumë dhe shpejt",
          "isRedFlag": true,
          "selfCareTip": "Mos e sforco krahun. Telefono menjëherë 112.",
          "guidance": "Dobësia e papritur e krahut mund të jetë goditje në tru ose dëmtim serioz.",
          "title": "Dobësi e papritur në një krah",
          "description": "Papritur nuk mund ta ngresh ose ta mbash një krah. Mund të ketë fytyrë të shtrembër ose të folur të ngatërruar."
        }
      ],
      "leg": [
        {
          "id": "leg_sprain",
          "label": "Kyç i këmbës i ënjtur ose me dhimbje pas një përdredhjeje",
          "isRedFlag": false,
          "selfCareTip": "Mbaje këmbën lart mbi një jastëk dhe vendos kompresë të ftohtë për 15 minuta. Mos u mbështet me gjithë peshën mbi të.",
          "guidance": "Mbaje kyçin e këmbës në pushim disa ditë. Nëse ënjtja rritet ose nuk shkel dot, bëj një radiografi.",
          "title": "Kyç këmbe i përdredhur",
          "description": "Kyçi i këmbës të dhemb dhe është i ënjtur pasi e përdrodhe. Shkel me vështirësi."
        },
        {
          "id": "leg_cramp",
          "label": "Ngërç i dhimbshëm ose shtrëngim i papritur i pulpës gjatë natës ose pas vrapimit",
          "isRedFlag": false,
          "selfCareTip": "Zgjate butësisht këmbën duke tërhequr gishtat drejt vetes, masazhoje pulpën dhe pi ujë.",
          "guidance": "Ngërçet vijnë shpesh nga lodhja, djersitja e madhe ose kur pi pak ujë.",
          "title": "Ngërç në pulpë",
          "description": "Muskuli i pulpës shtrëngohet papritur dhe me dhimbje, shpesh natën ose kur ke pirë pak ujë."
        },
        {
          "id": "leg_knee_ache",
          "label": "Dhimbje gjuri kur zbret shkallët ose pas një ecjeje të gjatë",
          "isRedFlag": false,
          "selfCareTip": "Mos rri galiç dhe mos mbaj pesha të rënda. Vish këpucë të rehatshme me taban të butë.",
          "guidance": "Gjuri konsumohet me kohën. Ushtrimet që forcojnë muskujt e këmbës ndihmojnë.",
          "title": "Dhimbje gjuri në shkallë",
          "description": "Gjuri të dhemb kur zbret shkallët, ulesh galiç ose pasi ke ndenjur gjatë me gjunjë të përkulur."
        },
        {
          "id": "leg_sudden_swelling",
          "label": "Njëra këmbë e ënjtur papritur, e nxehtë, e kuqe dhe me shumë dhimbje, ose nuk shkel dot mbi të",
          "isRedFlag": true,
          "selfCareTip": "Rri i qetë dhe mos e masazho pulpën. Shko shpejt te mjeku ose në Urgjencë.",
          "guidance": "Ënjtja e papritur e njërës këmbë mund të jetë mpiksje gjaku (trombozë). Duhet trajtuar shpejt.",
          "title": "Pulpë e ënjtur papritur, vetëm në një këmbë",
          "description": "Vetëm njëra pulpë u ënjt papritur dhe është e ngrohtë, e kuqe dhe me dhimbje."
        },
        {
          "id": "leg_heel_foot",
          "label": "Dhimbje në thembër, tendinën e Akilit ose shputë kur shkel në tokë",
          "isRedFlag": false,
          "selfCareTip": "Vish këpucë të rehatshme me taban të butë dhe mos ec zbathur në dysheme të fortë.",
          "guidance": "Shfaqet shpesh pas qëndrimit gjatë në këmbë ose këpucëve të holla. Nëse ke diabet dhe sheh plagë në shputë, shko shpejt te mjeku.",
          "title": "Dhimbje në thembër ose në shputë",
          "description": "Ndien therje nën thembër ose në harkun e shputës në hapat e parë në mëngjes, ose tendosje mbi thembër."
        },
        {
          "id": "leg_hip_thigh",
          "label": "Dhimbje në ijë ose kofshë gjatë ecjes, në shkallë ose kur ngrihesh nga karrigia",
          "isRedFlag": false,
          "selfCareTip": "Shmang hapat e mëdhenj ose peshat dhe vendos një jastëk mes gjunjëve kur fle në krah.",
          "guidance": "Dhimbja e ijës ose kofshës mund të vijë nga një muskul i tërhequr ose nga nyja. Shko te mjeku nëse çalon ose zgjat mbi një javë.",
          "title": "Dhimbje ije ose kofshe gjatë ecjes",
          "description": "Të dhemb ija anash, rrëza e kofshës ose muskujt e kofshës kur ecën, ngjit shkallë ose shtrihesh në atë krah."
        }
      ]
    },
    "severity": {
      "mild": {
        "title": "E lehtë",
        "description": "E ndien, por i bën punët e zakonshme."
      },
      "moderate": {
        "title": "Mesatare",
        "description": "Të pengon në punë, në lëvizje ose në gjumë."
      },
      "severe": {
        "title": "E rëndë",
        "description": "Nuk mund të bësh pothuajse asgjë."
      }
    },
    "duration": {
      "today": {
        "label": "Sot ose dje",
        "hint": "Nën 24 orë"
      },
      "days": {
        "label": "2–7 ditë",
        "hint": "2 deri në 7 ditë"
      },
      "weeks": {
        "label": "1–2 javë",
        "hint": "1 deri në 2 javë"
      },
      "chronic": {
        "label": "Mbi 2 javë",
        "hint": "Nuk kalon ose kthehet shpesh"
      }
    },
    "urgency": {
      "low": {
        "title": "Mund të kujdesesh vetë në shtëpi",
        "intro": "Pusho, pi ujë dhe shiko si ndihesh për disa ditë. Nëse përkeqësohet ose shfaqen shenja të reja, telefono mjekun ose 112."
      },
      "medium": {
        "title": "Shko te mjeku i familjes brenda disa ditëve",
        "intro": "Kjo ia vlen ta shohë një mjek. Nëse përkeqësohet ndërkohë, telefono 112."
      },
      "high": {
        "title": "Shko te një mjek sot",
        "intro": "Mos e shty. Telefono mjekun ose shko sot në një klinikë. Nëse përkeqësohet, telefono 112."
      }
    }
  },
  "it": {
    "ui": {
      "eyebrow": "Controllo dei sintomi",
      "heading": "Controlla i sintomi",
      "subtitle": "Indica sul corpo dove ti fa male e rispondi ad alcune domande brevi. Poi vedi cosa fare.",
      "resetButton": "Ricomincia",
      "backButton": "Indietro",
      "nextButton": "Continua",
      "finishButton": "Vedi il risultato",
      "stepIndicator": "Passo {current} di {total}",
      "step1Title": "Zona",
      "step2Title": "Sintomo",
      "step3Title": "Quanto è forte",
      "step4Title": "Risultato",
      "step1Question": "Dove senti dolore o fastidio?",
      "step1Prompt": "Tocca la zona sul corpo o sceglila dall'elenco.",
      "step2Question": "Quale somiglia di più a quello che senti?",
      "step2Prompt": "Scegli il sintomo che ti disturba di più.",
      "urgentBadge": "Segnale di emergenza",
      "step3Question": "Quanto è forte e da quando?",
      "step3Prompt": "Scegli un'opzione per ogni gruppo.",
      "severityHeading": "Quanto è forte?",
      "durationHeading": "Da quanto tempo ce l'hai?",
      "step4Question": "Cosa puoi fare ora",
      "step4Prompt": "In base alle tue risposte. Non è una diagnosi.",
      "summaryHeading": "Riepilogo delle tue risposte",
      "areaLabel": "Zona",
      "symptomLabel": "Sintomo",
      "intensityLabel": "Quanto è forte",
      "durationLabel": "Da quanto tempo",
      "recommendationHeading": "Cosa fare ora",
      "safeSelfCareHeading": "Cosa puoi fare a casa",
      "copySummary": "Copia riepilogo",
      "copied": "Copiato",
      "sendWhatsApp": "Condividi su WhatsApp",
      "showDoctor": "Mostra al medico",
      "requestMediatorHelp": "Parla con un mediatore",
      "scheduleDoctor": "Prenota un medico online",
      "readEducationalTopic": "Leggi la guida",
      "disclaimer": "Questa non è una diagnosi. Se ti senti peggio o il dolore è molto forte, chiama il 112.",
      "viewer3D": {
        "ariaLabel": "Corpo 3D. Giralo e tocca dove fa male.",
        "loading": "Caricamento del modello 3D ({progress}%)",
        "subModelInfo": "Corpo 3D",
        "front": "Davanti",
        "back": "Dietro",
        "perspective": "Angolo",
        "rotate360": "360°",
        "zoomIn": "Ingrandisci",
        "zoomOut": "Riduci",
        "resetView": "Ripristina vista",
        "tip": "Trascina a sinistra o a destra per girare il corpo. Tocca dove fa male.",
        "searchPlaceholder": "Cerca un organo o un muscolo (es. cuore, bicipite)",
        "selected3DStructure": "Hai scelto:",
        "activeAreaPrefix": "Zona:",
        "leftSide": "Sinistra",
        "rightSide": "Destra",
        "selectRegionPrefix": "Scegli",
        "rotateTooltip": "Ruota il corpo di 180°",
        "layerHybrid": "Muscoli e organi",
        "layerMuscular": "Muscoli e tendini",
        "layerOrgans": "Organi interni",
        "layerSurface": "Pelle",
        "legendSkeletalMuscles": "Muscoli",
        "legendTendonsJoints": "Tendini e articolazioni",
        "legendInternalOrgans": "Organi interni",
        "legendSelectedStructure": "Struttura selezionata"
      },
      "emergency": {
        "badge": "Emergenza medica 112",
        "title": "Può essere un'emergenza: chiama subito il 112",
        "description": "Non aspettare. Se non puoi chiamare, vai subito al pronto soccorso. Non guidare da solo.",
        "whyEmergencyPrefix": "Hai scelto:",
        "call112Now": "Chiama il 112",
        "continueReview": "Ho capito"
      },
      "structure3DLabel": "Struttura 3D",
      "sensationLabel": "Sensazione",
      "triggersLabel": "Cosa lo peggiora",
      "specialtyLabel": "Specialista da vedere",
      "warningNoticeRedFlag": "Segnalati segni di emergenza.",
      "warningNoticeSafe": "Nessun segno di emergenza segnalato."
    },
    "bodyParts": {
      "head": {
        "title": "Testa e collo",
        "subtitle": "Mal di testa, mandibola, orecchio, collo rigido o vertigini"
      },
      "chest": {
        "title": "Petto e respirazione",
        "subtitle": "Pressione al petto, seno, costole, respiro corto o battito veloce"
      },
      "stomach": {
        "title": "Stomaco e addome",
        "subtitle": "Bruciore, crampi digestivi, nausea, gonfiore o mal di pancia"
      },
      "pelvis": {
        "title": "Pelvi e basso ventre",
        "subtitle": "Dolori mestruali, ovaie, bruciore a urinare, inguine o zona intima"
      },
      "back": {
        "title": "Schiena e zona lombare",
        "subtitle": "Mal di schiena in basso, coccige, muscoli tesi o dolore tra le scapole"
      },
      "arm": {
        "title": "Braccia e mani",
        "subtitle": "Intorpidimento, dolore a spalla, gomito, polso o dita"
      },
      "leg": {
        "title": "Gambe e piedi",
        "subtitle": "Dolore ad anca, ginocchio, caviglia, tallone o pianta del piede"
      }
    },
    "symptomsByRegion": {
      "head": [
        {
          "id": "head_migraine",
          "label": "Dolore pulsante su un lato della testa, con nausea o fastidio alla luce",
          "isRedFlag": false,
          "selfCareTip": "Riposa in una stanza tranquilla e buia, bevi acqua e appoggia un panno fresco sulla fronte.",
          "guidance": "Sembra un'emicrania. Se torna spesso, chiedi al medico di famiglia una cura per prevenirla.",
          "title": "Emicrania o dolore pulsante",
          "description": "Dolore che pulsa, di solito su un lato della testa. Luce o rumore possono darti fastidio, o puoi avere nausea."
        },
        {
          "id": "head_tension",
          "label": "Pressione a fascia attorno alla testa, legata a stress o stanchezza",
          "isRedFlag": false,
          "selfCareTip": "Fai una pausa dagli schermi, massaggia delicatamente il collo e fai una breve camminata all'aria aperta.",
          "guidance": "Spesso dipende da stress, poco sonno o tante ore alla scrivania.",
          "title": "Mal di testa da stress",
          "description": "Pressione come una fascia stretta su fronte o tempie. Capita spesso dopo stress, tanto schermo o collo teso."
        },
        {
          "id": "head_dehydration",
          "label": "Dolore sordo e costante dopo una giornata calda o dopo aver bevuto poca acqua",
          "isRedFlag": false,
          "selfCareTip": "Bevi piano 1 o 2 bicchieri grandi di acqua o tisana tiepida. Evita bevande con caffeina o zucchero.",
          "guidance": "Spesso passa se bevi acqua e stai lontano dal caldo.",
          "title": "Mal di testa da caldo o sete",
          "description": "Dolore sordo in tutta la testa, peggiore quando la muovi. Capita dopo sole, caldo o se hai bevuto poco."
        },
        {
          "id": "head_fever",
          "label": "Mal di testa con febbre, brividi o naso chiuso",
          "isRedFlag": false,
          "selfCareTip": "Riposa a letto, misura la febbre e bevi molti liquidi.",
          "guidance": "Può essere un raffreddore o un virus. Se la febbre supera 38,5 °C o dura più di 3 giorni, vai dal medico.",
          "title": "Mal di testa con febbre",
          "description": "Ti fa male la testa e hai febbre, brividi, dolori nel corpo o naso chiuso."
        },
        {
          "id": "head_sudden_severe",
          "label": "Mal di testa improvviso e fortissimo, o con confusione o debolezza",
          "isRedFlag": true,
          "selfCareTip": "Siediti in un posto sicuro e chiama subito il 112.",
          "guidance": "Un mal di testa fortissimo che arriva all'improvviso è un'emergenza. Ti serve subito un medico.",
          "title": "Mal di testa improvviso e fortissimo",
          "description": "Il peggior mal di testa della tua vita, arrivato in pochi secondi. Può esserci collo rigido, vista offuscata o confusione."
        },
        {
          "id": "head_neck_stiff",
          "label": "Dolore al collo, cervicale bloccata o dolore quando giri la testa",
          "isRedFlag": false,
          "selfCareTip": "Appoggia un panno tiepido dietro il collo, abbassa le spalle e gira la testa lentamente senza forzare. Evita cuscini troppo alti.",
          "guidance": "Di solito dipende da muscoli del collo contratti, postura scomoda nel sonno o tante ore davanti allo schermo. Vai dal medico se il formicolio scende lungo il braccio.",
          "title": "Dolore al collo o cervicale rigida",
          "description": "Il collo o la nuca fanno male e sono rigidi quando giri la testa o guardi in basso, a volte con tensione verso la spalla."
        },
        {
          "id": "head_throat_swallow",
          "label": "Mal di gola quando deglutisci, voce rauca o linfonodi gonfi sul collo",
          "isRedFlag": false,
          "selfCareTip": "Bevi tisane tiepide o acqua a piccoli sorsi, riposa la voce ed evita fumo o bevande ghiacciate.",
          "guidance": "La maggior parte dei mal di gola è virale. Vai dal medico se hai febbre alta, placche bianche in gola o fai molta fatica a deglutire.",
          "title": "Mal di gola o dolore a deglutire",
          "description": "La gola brucia o fa male quando mandi giù, hai la voce bassa o senti piccoli linfonodi dolenti sotto la mandibola."
        },
        {
          "id": "head_jaw_ear",
          "label": "Mal d'orecchio, dolore alla mandibola masticando o pressione su guance e seni nasali",
          "isRedFlag": false,
          "selfCareTip": "Mangia cibi morbidi, non inserire bastoncini nell'orecchio e appoggia un panno tiepido sulla guancia.",
          "guidance": "Il dolore all'orecchio, all'articolazione della mandibola o la sinusite meritano un controllo dal medico di famiglia o dal dentista.",
          "title": "Dolore a orecchio, mandibola o seni nasali",
          "description": "Senti un orecchio chiuso o pulsante, dolore alla mandibola quando mastichi o peso su fronte e zigomi."
        },
        {
          "id": "head_neck_red_flag",
          "label": "Collo rigidissimo con febbre alta, forte fastidio alla luce, macchie sulla pelle o confusione",
          "isRedFlag": true,
          "selfCareTip": "Sdraiati in un luogo tranquillo e chiama subito il 112.",
          "guidance": "Un collo molto rigido insieme a febbre alta o confusione può indicare un'infezione grave e richiede subito l'ospedale.",
          "title": "Collo rigido con febbre alta o confusione",
          "description": "Non riesci a piegare il mento verso il petto per il dolore, con febbre alta, sonnolenza, vomito o forte fastidio alla luce."
        }
      ],
      "chest": [
        {
          "id": "chest_reflux",
          "label": "Bruciore al petto o sapore acido dopo i pasti o quando ti pieghi in avanti",
          "isRedFlag": false,
          "selfCareTip": "Non sdraiarti subito dopo mangiato. Per un po' riduci cibi piccanti e caffè.",
          "guidance": "Il bruciore di solito viene dall'acido dello stomaco. Se non passa, il medico di famiglia può darti una cura.",
          "title": "Bruciore di stomaco",
          "description": "Bruciore che sale dallo stomaco verso la gola. Peggiora se ti pieghi o dopo pasti pesanti o acidi."
        },
        {
          "id": "chest_exertion",
          "label": "Stretta o pressione al petto sotto sforzo o salendo le scale",
          "isRedFlag": false,
          "selfCareTip": "Fermati, siediti e respira piano.",
          "guidance": "Una stretta al petto sotto sforzo va controllata da un medico, anche se passa in fretta quando ti fermi.",
          "title": "Oppressione al petto sotto sforzo",
          "description": "Stretta al centro del petto quando cammini veloce, sali le scale o fai fatica."
        },
        {
          "id": "chest_stitch",
          "label": "Fitta su un lato del petto, più forte con un respiro profondo o con la tosse",
          "isRedFlag": false,
          "selfCareTip": "Per qualche minuto respira piano, senza riempire troppo i polmoni. Metti qualcosa di tiepido dove fa male.",
          "guidance": "Di solito è un muscolo stirato e passa da solo. Se respirare diventa difficile, chiama il 112.",
          "title": "Fitta quando respiri",
          "description": "Dolore acuto in un punto del petto, peggiore quando respiri a fondo, tossisci o ti giri."
        },
        {
          "id": "chest_breast_pain",
          "label": "Tensione, gonfiore, rossore al seno o dolore durante l'allattamento",
          "isRedFlag": false,
          "selfCareTip": "Indossa un reggiseno morbido senza ferretto stretto e applica un impacco tiepido o fresco secondo ciò che ti dà sollievo.",
          "guidance": "La tensione a entrambi i seni segue spesso il ciclo mestruale. Se un seno diventa rosso, caldo e compare febbre, fatti vedere oggi da un medico.",
          "title": "Tensione o dolore al seno",
          "description": "Il seno è gonfio o dolente prima del ciclo, oppure un seno fa male ed è indurito durante l'allattamento."
        },
        {
          "id": "chest_breast_lump",
          "label": "Nuovo nodulo, zona indurita, rientranza della pelle del seno o gonfiore sotto l'ascella",
          "isRedFlag": false,
          "selfCareTip": "Non schiacciare e non massaggiare forte la zona. Annota quando l'hai notato per riferirlo al medico.",
          "guidance": "La maggior parte dei noduli al seno è benigna, ma ogni nuovo nodulo o cambiamento della pelle o del capezzolo va controllato da un medico.",
          "title": "Nuovo nodulo al seno o sotto l'ascella",
          "description": "Senti un nodulo o un punto più duro nel seno o nell'ascella, una fossetta sulla pelle o perdite insolite dal capezzolo."
        },
        {
          "id": "chest_warning",
          "label": "Forte dolore al petto che va verso braccio sinistro, collo o mandibola, con fiato corto",
          "isRedFlag": true,
          "selfCareTip": "Chiama subito il 112. Siediti e allenta i vestiti stretti.",
          "guidance": "Questo dolore al petto può essere un infarto. Ogni minuto conta.",
          "title": "Forte dolore al petto che si allarga",
          "description": "Pressione pesante al petto che va verso braccio sinistro, collo, mascella o schiena. Può esserci sudore freddo o fiato corto."
        }
      ],
      "stomach": [
        {
          "id": "stomach_upper_reflux",
          "label": "Bruciore o pesantezza nella parte alta dello stomaco",
          "isRedFlag": false,
          "selfCareTip": "Mangia cibi semplici e leggeri. Bevi acqua non fredda ed evita i pasti abbondanti.",
          "guidance": "Lo stomaco irritato è comune. Se ti disturba ogni giorno, prenota una visita.",
          "title": "Bruciore nella parte alta dello stomaco",
          "description": "Bruciore o acidità sotto le costole. Ti senti pieno presto o hai un sapore acido in bocca dopo mangiato."
        },
        {
          "id": "stomach_cramping_mild",
          "label": "Crampi in tutta la pancia, con gonfiore, digestione lenta o un po' di nausea",
          "isRedFlag": false,
          "selfCareTip": "Bevi una tisana di menta o camomilla, applica un panno tiepido sulla pancia e riposa.",
          "guidance": "I crampi brevi di solito dipendono dalla digestione o da cosa hai mangiato.",
          "title": "Crampi e gonfiore",
          "description": "La pancia si stringe ogni tanto, è gonfia, hai gas o vai in bagno più o meno spesso."
        },
        {
          "id": "stomach_lower_sharp",
          "label": "Dolore acuto in un punto, in basso a destra nella pancia",
          "isRedFlag": true,
          "selfCareTip": "Finché non ti vede un medico, non prendere antidolorifici forti e non mettere niente di caldo sulla pancia.",
          "guidance": "Un dolore fisso in basso a destra nella pancia va visto presto da un medico. Può essere appendicite.",
          "title": "Dolore in basso a destra",
          "description": "Dolore nella parte bassa destra della pancia che peggiora, più forte se tossisci, cammini o premi."
        },
        {
          "id": "stomach_severe_widespread",
          "label": "Mal di pancia fortissimo e continuo, con vomito ripetuto, pancia dura o febbre",
          "isRedFlag": true,
          "selfCareTip": "Non mangiare e non bere molto. Vai subito al pronto soccorso o chiama il 112.",
          "guidance": "Un dolore fortissimo con la pancia dura può richiedere un intervento chirurgico urgente.",
          "title": "Dolore fortissimo in tutta la pancia",
          "description": "Tutta la pancia fa molto male ed è dura, vomiti di continuo o ti senti svenire."
        }
      ],
      "pelvis": [
        {
          "id": "pelvis_period_cramps",
          "label": "Crampi mestruali o dolore sordo nel basso ventre vicino al ciclo",
          "isRedFlag": false,
          "selfCareTip": "Appoggia una borsa dell'acqua calda sul basso ventre, bevi tisane calde e riposa sul fianco con le ginocchia piegate.",
          "guidance": "I crampi lievi durante il ciclo sono comuni, ma se il dolore ti blocca nelle attività quotidiane una visita ginecologica può valutare endometriosi o fibromi.",
          "title": "Crampi mestruali o dolore ciclico pelvico",
          "description": "Crampi o dolore sordo nel basso ventre e nella schiena poco prima o durante le mestruazioni."
        },
        {
          "id": "pelvis_one_sided",
          "label": "Dolore su un solo lato del basso ventre, nella zona dell'ovaio o all'inguine",
          "isRedFlag": false,
          "selfCareTip": "Evita sforzi intensi o pesi e non mettere impacchi bollenti se il dolore è acuto.",
          "guidance": "Un dolore su un lato della pelvi può dipendere da una cisti ovarica, dall'ovulazione o da uno stiramento inguinale e merita un controllo medico.",
          "title": "Dolore su un lato della pelvi o all'inguine",
          "description": "Fitta o peso su un lato del basso ventre o nella piega dell'inguine, a volte più forte quando ti muovi."
        },
        {
          "id": "pelvis_urinary_burning",
          "label": "Bruciore quando urini, urina torbida o bisogno di andare in bagno molto spesso",
          "isRedFlag": false,
          "selfCareTip": "Bevi acqua regolarmente durante la giornata e non trattenere la pipì. Evita caffè e bevande gassate.",
          "guidance": "Spesso indica una cistite o infezione urinaria. Il medico può prescrivere esame delle urine e cura mirata. Fatti vedere oggi se compare febbre o mal di reni.",
          "title": "Bruciore a urinare o bisogno frequente",
          "description": "Bruciore mentre fai pipì, peso sopra il pube o sensazione di non aver svuotato la vescica."
        },
        {
          "id": "pelvis_pressure_floor",
          "label": "Senso di peso, pressione o fastidio al pavimento pelvico o nella zona intima",
          "isRedFlag": false,
          "selfCareTip": "Evita di sollevare pesi e previeni la stitichezza. Usa biancheria comoda in cotone.",
          "guidance": "Il senso di peso pelvico o il bruciore intimo sono frequenti dopo il parto, in menopausa o per infezioni locali e si curano bene dopo una visita.",
          "title": "Peso pelvico o fastidio intimo",
          "description": "Sensazione di peso nel basso bacino, indolenzimento stando seduti o irritazione nella zona intima."
        },
        {
          "id": "pelvis_pregnancy_bleeding",
          "label": "Dolore pelvico improvviso e fortissimo, perdita abbondante di sangue o dolore se potresti essere incinta",
          "isRedFlag": true,
          "selfCareTip": "Sdraiati in sicurezza, non prendere farmaci di tua iniziativa e chiama subito il 112 o vai al pronto soccorso.",
          "guidance": "Un dolore pelvico forte con sanguinamento abbondante, capogiri o possibile gravidanza è un'emergenza ginecologica da valutare subito in ospedale.",
          "title": "Forte dolore pelvico, perdita abbondante o gravidanza",
          "description": "Dolore improvviso e intenso nel basso ventre con forte perdita di sangue, vertigini, febbre o se sei o potresti essere incinta."
        }
      ],
      "back": [
        {
          "id": "back_strain_lift",
          "label": "Dolore acuto in basso alla schiena subito dopo aver sollevato un peso",
          "isRedFlag": false,
          "selfCareTip": "Non piegarti e non sollevare pesi. Riposa, ma fai anche brevi camminate. Usa un panno tiepido.",
          "guidance": "Succede spesso. Muoversi con calma aiuta più che stare a letto.",
          "title": "Mal di schiena dopo aver sollevato",
          "description": "I muscoli in basso della schiena si sono bloccati subito dopo aver sollevato un peso o esserti girato di colpo."
        },
        {
          "id": "back_chronic",
          "label": "Dolore sordo in basso alla schiena da qualche settimana",
          "isRedFlag": false,
          "selfCareTip": "Fai esercizi leggeri di allungamento per la schiena. Regola l'altezza della sedia e non stare fermo troppo a lungo.",
          "guidance": "Il mal di schiena che dura migliora con esercizi insegnati da un fisioterapista e muscoli della pancia più forti.",
          "title": "Mal di schiena che non passa",
          "description": "Dolore sordo in basso alla schiena da settimane, peggiore se stai a lungo seduto o in piedi."
        },
        {
          "id": "back_stiffness",
          "label": "Schiena bloccata al mattino o dopo tanto tempo seduti",
          "isRedFlag": false,
          "selfCareTip": "Al mattino ruota piano le spalle e piegati lentamente qualche volta prima di iniziare la giornata.",
          "guidance": "Spesso dipende da muscoli tesi o dallo stare a lungo nella stessa posizione.",
          "title": "Schiena rigida al mattino",
          "description": "Al risveglio la schiena è rigida e fai fatica a piegarti. Migliora dopo un po' di movimento."
        },
        {
          "id": "back_severe_difficulty",
          "label": "Forte dolore alla schiena con intorpidimento a entrambe le gambe, debolezza o perdita del controllo dell'urina",
          "isRedFlag": true,
          "selfCareTip": "Resta disteso e chiama subito il 112.",
          "guidance": "I nervi della schiena possono essere schiacciati in modo grave. Devi andare subito in ospedale.",
          "title": "Mal di schiena con gambe intorpidite",
          "description": "Forte dolore alla schiena con formicolio o debolezza in entrambe le gambe, o nuovi problemi a trattenere urina o feci."
        },
        {
          "id": "back_upper_blades",
          "label": "Dolore, tensione o bruciore nella parte alta della schiena o tra le scapole",
          "isRedFlag": false,
          "selfCareTip": "Alzati spesso dalla sedia, porta dolcemente indietro le spalle e metti un impacco caldo in alto sulla schiena.",
          "guidance": "Compare spesso stando chinati su telefono o scrivania, o portando borse pesanti su una sola spalla.",
          "title": "Dolore in alto sulla schiena o tra le scapole",
          "description": "Tensione o indolenzimento nella parte alta della schiena e tra le scapole, specie dopo ore seduti o lavoro con le braccia."
        },
        {
          "id": "back_flank_kidney",
          "label": "Dolore su un lato della schiena sotto le costole, con febbre, nausea o bruciore a urinare",
          "isRedFlag": false,
          "selfCareTip": "Bevi acqua a piccoli sorsi ed evita antidolorifici forti prima della visita medica.",
          "guidance": "Un dolore su un fianco della schiena sotto le costole, soprattutto con febbre o disturbi urinari, può riguardare i reni e va visto oggi da un medico.",
          "title": "Dolore al fianco o nella zona dei reni",
          "description": "Dolore profondo su un lato della schiena sotto le costole che cambia poco con i movimenti, a volte con febbre o bruciore a urinare."
        }
      ],
      "arm": [
        {
          "id": "arm_shoulder_elbow",
          "label": "Dolore alla spalla alzando il braccio o dolore al gomito stringendo o sollevando oggetti",
          "isRedFlag": false,
          "selfCareTip": "Evita movimenti ripetuti sopra la testa e non dormire sulla spalla dolente per qualche notte.",
          "guidance": "Spesso è un tendine infiammato di spalla o gomito. Fatti vedere se non riesci ad alzare il braccio o il dolore dura oltre una settimana.",
          "title": "Dolore a spalla o gomito nei movimenti",
          "description": "La spalla fa male quando alzi il braccio o ti vesti, oppure il gomito duole quando afferri o ruoti gli oggetti."
        },
        {
          "id": "arm_sprain",
          "label": "Dolore a spalla, gomito o polso dopo una caduta, un movimento brusco o un urto",
          "isRedFlag": false,
          "selfCareTip": "Metti del ghiaccio avvolto in un panno dove fa male. Tieni il braccio a riposo e sostenuto.",
          "guidance": "Colpi e distorsioni lievi di solito migliorano in pochi giorni se tieni a riposo l'articolazione.",
          "title": "Dolore al polso dopo una caduta",
          "description": "Polso, gomito o spalla fanno male e sono gonfi dopo un colpo o una caduta sulle mani."
        },
        {
          "id": "arm_numbness",
          "label": "Lieve formicolio o intorpidimento alle dita dopo tanto tempo su tastiera o cellulare",
          "isRedFlag": false,
          "selfCareTip": "Fai spesso pause di 5 minuti. Scuoti le mani e ruota piano i polsi.",
          "guidance": "Può essere un nervo schiacciato al polso. Dillo al medico se non passa.",
          "title": "Formicolio alle dita",
          "description": "Intorpidimento o formicolio nella mano, in pollice, indice e medio, spesso di notte o quando scrivi al computer."
        },
        {
          "id": "arm_ache",
          "label": "Muscoli delle braccia stanchi e indolenziti dopo lavori pesanti o sport",
          "isRedFlag": false,
          "selfCareTip": "Fai una doccia tiepida, massaggia piano i muscoli e riposa per un giorno.",
          "guidance": "È normale dopo uno sforzo insolito. Passa da solo in 2 o 3 giorni.",
          "title": "Muscoli del braccio indolenziti",
          "description": "I muscoli del braccio fanno male dopo uno sforzo insolito, sport o dopo aver portato pesi."
        },
        {
          "id": "arm_sudden_swelling",
          "label": "Braccio che perde forza all'improvviso, non si alza o si gonfia molto e in fretta",
          "isRedFlag": true,
          "selfCareTip": "Non forzare il braccio. Chiama subito il 112.",
          "guidance": "Un braccio debole all'improvviso può essere un ictus o una lesione grave.",
          "title": "Debolezza improvvisa a un braccio",
          "description": "All'improvviso non riesci ad alzare o tenere su un braccio. Può esserci la bocca storta o parli in modo confuso."
        }
      ],
      "leg": [
        {
          "id": "leg_sprain",
          "label": "Caviglia gonfia o dolorante dopo aver messo male il piede",
          "isRedFlag": false,
          "selfCareTip": "Tieni la gamba alzata su un cuscino e metti impacchi freddi per 15 minuti. Non caricarci tutto il peso.",
          "guidance": "Tieni a riposo la caviglia per qualche giorno. Se il gonfiore cresce o non riesci ad appoggiarla, fai una radiografia.",
          "title": "Caviglia storta",
          "description": "La caviglia fa male ed è gonfia dopo aver preso una storta. È difficile appoggiarla."
        },
        {
          "id": "leg_cramp",
          "label": "Crampo doloroso o contrattura improvvisa del polpaccio di notte o dopo la corsa",
          "isRedFlag": false,
          "selfCareTip": "Distendi la gamba tirando le dita verso di te, massaggia il polpaccio e bevi un bicchiere d'acqua.",
          "guidance": "I crampi vengono spesso dopo stanchezza, molto sudore o se bevi poco.",
          "title": "Crampo al polpaccio",
          "description": "Il polpaccio si contrae all'improvviso e fa male, spesso di notte o se hai bevuto poco."
        },
        {
          "id": "leg_knee_ache",
          "label": "Dolore al ginocchio scendendo le scale o dopo una lunga camminata",
          "isRedFlag": false,
          "selfCareTip": "Evita di accovacciarti e di portare pesi. Usa scarpe comode con la suola morbida.",
          "guidance": "Il ginocchio si consuma col tempo. Gli esercizi che rinforzano i muscoli della gamba aiutano.",
          "title": "Dolore al ginocchio sulle scale",
          "description": "Il ginocchio fa male quando scendi le scale, ti accovacci o dopo essere stato seduto a lungo."
        },
        {
          "id": "leg_sudden_swelling",
          "label": "Una sola gamba gonfia all'improvviso, calda, rossa e molto dolorante, o non riesci ad appoggiare il piede",
          "isRedFlag": true,
          "selfCareTip": "Resta a riposo e non massaggiare il polpaccio. Vai presto da un medico o al pronto soccorso.",
          "guidance": "Il gonfiore improvviso di una sola gamba può essere un coagulo di sangue (trombosi). Va curato in fretta.",
          "title": "Gamba gonfia all'improvviso, solo una",
          "description": "Un solo polpaccio si è gonfiato all'improvviso ed è caldo, rosso e dolente."
        },
        {
          "id": "leg_heel_foot",
          "label": "Dolore al tallone, al tendine d'Achille o alla pianta del piede quando appoggi il passo",
          "isRedFlag": false,
          "selfCareTip": "Usa scarpe comode con suola morbida ed evita di camminare scalzo su pavimenti duri.",
          "guidance": "Compare spesso dopo molte ore in piedi o con scarpe basse. Se hai il diabete e noti una lesione sul piede, fatti vedere subito.",
          "title": "Dolore al tallone o alla pianta del piede",
          "description": "Fitta sotto il tallone o lungo l'arco del piede ai primi passi del mattino, o tensione sopra il tallone."
        },
        {
          "id": "leg_hip_thigh",
          "label": "Dolore all'anca o alla coscia camminando, salendo le scale o alzandoti dalla sedia",
          "isRedFlag": false,
          "selfCareTip": "Evita passi lunghi o carichi pesanti e tieni un cuscino tra le ginocchia dormendo sul fianco.",
          "guidance": "Il dolore all'anca o alla coscia può dipendere da un muscolo stirato o dall'articolazione. Vai dal medico se zoppichi o dura più di una settimana.",
          "title": "Dolore all'anca o alla coscia camminando",
          "description": "Dolore sul lato dell'anca, all'inguine o nei muscoli della coscia quando cammini, sali le scale o dormi su quel lato."
        }
      ]
    },
    "severity": {
      "mild": {
        "title": "Lieve",
        "description": "Lo senti, ma fai le tue cose di sempre."
      },
      "moderate": {
        "title": "Moderato",
        "description": "Ti ostacola nel lavoro, nei movimenti o nel sonno."
      },
      "severe": {
        "title": "Grave",
        "description": "Non riesci a fare quasi niente."
      }
    },
    "duration": {
      "today": {
        "label": "Oggi o ieri",
        "hint": "Meno di 24 ore"
      },
      "days": {
        "label": "2–7 giorni",
        "hint": "Da 2 a 7 giorni"
      },
      "weeks": {
        "label": "1–2 settimane",
        "hint": "Da 1 a 2 settimane"
      },
      "chronic": {
        "label": "Più di 2 settimane",
        "hint": "Non passa o torna spesso"
      }
    },
    "urgency": {
      "low": {
        "title": "Probabilmente puoi curarti a casa",
        "intro": "Riposa, bevi acqua e osserva come ti senti per qualche giorno. Se peggiora o compaiono nuovi segni, chiama il medico o il 112."
      },
      "medium": {
        "title": "Vai dal medico di famiglia nei prossimi giorni",
        "intro": "Vale la pena farlo vedere a un medico. Se nel frattempo peggiora, chiama il 112."
      },
      "high": {
        "title": "Vai da un medico oggi",
        "intro": "Non rimandare. Chiama il medico o vai oggi in un ambulatorio. Se peggiora, chiama il 112."
      }
    }
  },
  "hr": {
    "ui": {
      "eyebrow": "Provjera zdravlja",
      "heading": "Provjeri simptome",
      "subtitle": "Pokaži na tijelu gdje te boli i odgovori na nekoliko kratkih pitanja. Zatim saznaj što učiniti.",
      "resetButton": "Ispočetka",
      "backButton": "Natrag",
      "nextButton": "Nastavi",
      "finishButton": "Pogledaj rezultat",
      "stepIndicator": "Korak {current} od {total}",
      "step1Title": "Područje",
      "step2Title": "Simptom",
      "step3Title": "Koliko je jako",
      "step4Title": "Rezultat",
      "step1Question": "Gdje osjećaš bol ili nelagodu?",
      "step1Prompt": "Dodirni područje na tijelu ili ga odaberi s popisa.",
      "step2Question": "Što je najsličnije onome što osjećaš?",
      "step2Prompt": "Odaberi simptom koji ti najviše smeta.",
      "urgentBadge": "Znak za hitnost",
      "step3Question": "Koliko je jako i koliko dugo?",
      "step3Prompt": "Odaberi po jednu opciju u svakoj skupini.",
      "severityHeading": "Koliko je jako?",
      "durationHeading": "Koliko dugo traje?",
      "step4Question": "Što možeš učiniti sada",
      "step4Prompt": "Na temelju tvojih odgovora. Ovo nije dijagnoza.",
      "summaryHeading": "Sažetak tvojih odgovora",
      "areaLabel": "Područje",
      "symptomLabel": "Simptom",
      "intensityLabel": "Koliko je jako",
      "durationLabel": "Koliko dugo",
      "recommendationHeading": "Što učiniti dalje",
      "safeSelfCareHeading": "Što možeš učiniti kod kuće",
      "copySummary": "Kopiraj sažetak",
      "copied": "Kopirano",
      "sendWhatsApp": "Pošalji na WhatsApp",
      "showDoctor": "Pokaži liječniku",
      "requestMediatorHelp": "Razgovaraj s medijatorom",
      "scheduleDoctor": "Naruči se online",
      "readEducationalTopic": "Pročitaj vodič",
      "disclaimer": "Ovo nije dijagnoza. Ako se osjećaš lošije ili je bol jako snažna, nazovi 112.",
      "viewer3D": {
        "ariaLabel": "3D tijelo. Okreni ga i dodirni mjesto koje te boli.",
        "loading": "Učitavanje 3D modela ({progress}%)",
        "subModelInfo": "3D tijelo",
        "front": "Sprijeda",
        "back": "Straga",
        "perspective": "Kut",
        "rotate360": "360°",
        "zoomIn": "Približi",
        "zoomOut": "Udalji",
        "resetView": "Vrati prikaz",
        "tip": "Povuci lijevo ili desno da okreneš tijelo. Dodirni gdje te boli.",
        "searchPlaceholder": "Pretraži organ ili mišić (npr. srce, biceps)",
        "selected3DStructure": "Odabrao si:",
        "activeAreaPrefix": "Područje:",
        "leftSide": "Lijevo",
        "rightSide": "Desno",
        "selectRegionPrefix": "Odaberi",
        "rotateTooltip": "Okreni tijelo za 180°",
        "layerHybrid": "Mišići i organi",
        "layerMuscular": "Mišići i tetive",
        "layerOrgans": "Unutarnji organi",
        "layerSurface": "Koža",
        "legendSkeletalMuscles": "Mišići",
        "legendTendonsJoints": "Tetive i zglobovi",
        "legendInternalOrgans": "Unutarnji organi",
        "legendSelectedStructure": "Odabrana struktura"
      },
      "emergency": {
        "badge": "Hitni medicinski slučaj 112",
        "title": "Ovo može biti hitno stanje: odmah nazovi 112",
        "description": "Nemoj čekati. Ako ne možeš nazvati, brzo idi na hitni bolnički prijem. Nemoj sam voziti.",
        "whyEmergencyPrefix": "Odabrao si:",
        "call112Now": "Nazovi 112 odmah",
        "continueReview": "Razumijem"
      },
      "structure3DLabel": "3D struktura",
      "sensationLabel": "Osjet",
      "triggersLabel": "Što pogoršava",
      "specialtyLabel": "Liječnik specijalist",
      "warningNoticeRedFlag": "Zabilježeni su znakovi za hitnost.",
      "warningNoticeSafe": "Nisu zabilježeni znakovi za hitnost."
    },
    "bodyParts": {
      "head": {
        "title": "Glava i vrat",
        "subtitle": "Glavobolja, čeljust, uho, ukočen vrat ili vrtoglavica"
      },
      "chest": {
        "title": "Prsa i disanje",
        "subtitle": "Pritisak u prsima, dojke, rebra, otežano disanje ili ubrzan rad srca"
      },
      "stomach": {
        "title": "Želudac i trbuh",
        "subtitle": "Žgaravica, probavni grčevi, mučnina, nadutost ili bol u trbuhu"
      },
      "pelvis": {
        "title": "Zdjelica i donji dio trbuha",
        "subtitle": "Menstrualni bolovi, jajnici, pečenje pri mokrenju, prepone ili intimno područje"
      },
      "back": {
        "title": "Leđa i kralježnica",
        "subtitle": "Bol u križima, trtica, ukočeni mišići ili bol između lopatica"
      },
      "arm": {
        "title": "Ruke i šake",
        "subtitle": "Utrnulost, bol u ramenu, laktu, zapešću ili zglobovima prstiju"
      },
      "leg": {
        "title": "Noge i stopala",
        "subtitle": "Bol u kuku, koljenu, gležnju, peti ili svodu stopala"
      }
    },
    "symptomsByRegion": {
      "head": [
        {
          "id": "head_migraine",
          "label": "Pulsirajuća bol na jednoj strani glave, uz mučninu ili smetnju svjetla",
          "isRedFlag": false,
          "selfCareTip": "Odmori se u tihoj i zamračenoj sobi. Popij malo vode i stavi hladan oblog na čelo.",
          "guidance": "Ovo nalikuje migreni. Ako se često vraća, pitaj obiteljskog liječnika o terapiji koja je sprječava.",
          "title": "Migrena ili pulsirajuća bol",
          "description": "Kucajuća bol, obično na jednoj strani glave. Mogu ti smetati svjetlo i buka ili možeš osjećati mučninu."
        },
        {
          "id": "head_tension",
          "label": "Pritisak poput čvrste trake oko glave nakon stresa ili umora",
          "isRedFlag": false,
          "selfCareTip": "Odmori oči od zaslona i nježno izmasiraj vrat. Izađi nakratko na svjež zrak.",
          "guidance": "Često nastaje zbog stresa, premalo sna ili dugog sjedenja.",
          "title": "Glavobolja od stresa",
          "description": "Pritisak poput stisnute trake preko čela ili sljepoočnica. Često nakon stresa, dugog gledanja u zaslon ili napetog vrata."
        },
        {
          "id": "head_dehydration",
          "label": "Tupa, stalna bol nakon vrućeg dana ili premalo popijene vode",
          "isRedFlag": false,
          "selfCareTip": "Polako popij 1 do 2 velike čaše vode ili mlakog čaja. Izbjegavaj kavu i zaslađene napitke.",
          "guidance": "Često prođe kada popiješ vode i skloniš se u hlad.",
          "title": "Glavobolja od vrućine ili žeđi",
          "description": "Tupa bol u cijeloj glavi koja je jača kada pomičeš glavu. Javlja se nakon sunca, vrućine ili premalo vode."
        },
        {
          "id": "head_fever",
          "label": "Glavobolja uz vrućicu, zimicu ili začepljen nos",
          "isRedFlag": false,
          "selfCareTip": "Miruj u krevetu, izmjeri temperaturu i pij puno tekućine.",
          "guidance": "Može biti prehlada ili viroza. Ako temperatura prijeđe 38,5 °C ili traje dulje od 3 dana, javi se liječniku.",
          "title": "Glavobolja s vrućicom",
          "description": "Boli te glava i imaš povišenu temperaturu, zimicu, bolove u tijelu ili začepljen nos."
        },
        {
          "id": "head_sudden_severe",
          "label": "Nagla i izrazito jaka glavobolja, ili glavobolja uz zbunjenost ili slabost",
          "isRedFlag": true,
          "selfCareTip": "Sjedni na sigurno mjesto i odmah nazovi 112.",
          "guidance": "Izrazito jaka glavobolja koja nastane naglo hitno je stanje. Odmah ti treba liječnik.",
          "title": "Nagla, jako snažna glavobolja",
          "description": "Najjača glavobolja u životu koja dostiže punu snagu u nekoliko sekundi. Može ići uz ukočen vrat, zamućen vid ili zbunjenost."
        },
        {
          "id": "head_neck_stiff",
          "label": "Bol u vratu, ukočen vrat ili bol pri okretanju glave",
          "isRedFlag": false,
          "selfCareTip": "Stavi topli oblog na stražnju stranu vrata, opusti ramena i polako okreći glavu bez forsiranja. Izbjegavaj vrlo visoke jastuke.",
          "guidance": "Obično dolazi od napetih vratnih mišića, nezgodnog položaja u snu ili dugog rada za zaslonom. Javi se liječniku ako se trnci spuštaju u ruku.",
          "title": "Bol u vratu ili ukočen vrat",
          "description": "Vrat ili zatiljak boli te i teško se pokreće pri okretanju glave ili pogledu prema dolje, ponekad uz napetost prema ramenu."
        },
        {
          "id": "head_throat_swallow",
          "label": "Grlobolja pri gutanju, promuklost ili otečeni čvorovi na vratu",
          "isRedFlag": false,
          "selfCareTip": "Pij topli čaj ili vodu u malim gutljajima, štedi glas i izbjegavaj dim ili jako hladna pića.",
          "guidance": "Većina upala grla je virusna. Javi se liječniku ako dobiješ visoku vrućicu, bijele naslage u grlu ili sve teže gutaš.",
          "title": "Grlobolja ili bol pri gutanju",
          "description": "Grlo te peče ili boli dok gutaš, glas ti je promukao ili osjećaš male osjetljive čvorove ispod čeljusti."
        },
        {
          "id": "head_jaw_ear",
          "label": "Bol u uhu, bol u čeljusti pri žvakanju ili pritisak oko obraza i sinusa",
          "isRedFlag": false,
          "selfCareTip": "Jedi mekanu hranu, ne stavljaj štapiće u uho i prisloni topli oblog s vanjske strane obraza.",
          "guidance": "Bol u uhu, čeljusnom zglobu ili začepljene sinuse dobro je provjeriti kod obiteljskog liječnika ili stomatologa.",
          "title": "Bol u uhu, čeljusti ili sinusima",
          "description": "Jedno uho osjećaš začepljeno ili pulsira, čeljust te boli pri žvakanju ili osjećaš pritisak u čelu i obrazima."
        },
        {
          "id": "head_neck_red_flag",
          "label": "Jako ukočen vrat uz visoku vrućicu, smetnju jakog svjetla, osip ili zbunjenost",
          "isRedFlag": true,
          "selfCareTip": "Legni na mirno mjesto i odmah nazovi 112.",
          "guidance": "Izrazito ukočen vrat uz visoku vrućicu ili zbunjenost može biti teška infekcija i zahtijeva bolnicu odmah.",
          "title": "Ukočen vrat uz visoku vrućicu ili zbunjenost",
          "description": "Ne možeš spustiti bradu prema prsima zbog boli u vratu, uz visoku vrućicu, pospanost, povraćanje ili jaku smetnju svjetla."
        }
      ],
      "chest": [
        {
          "id": "chest_reflux",
          "label": "Pečenje u prsima ili kiseo okus nakon jela ili pri saginjanju",
          "isRedFlag": false,
          "selfCareTip": "Nemoj leći odmah nakon jela. Privremeno izbjegavaj ljutu ili kiselu hranu i kavu.",
          "guidance": "Žgaravica obično dolazi od želučane kiseline. Ako ne prolazi, obiteljski liječnik može ti propisati terapiju.",
          "title": "Žgaravica",
          "description": "Pečenje koje se diže iz želuca prema grlu. Jače je kada se sagneš ili nakon obilnog obroka."
        },
        {
          "id": "chest_exertion",
          "label": "Stezanje ili pritisak u prsima pri naporu ili penjanju uz stepenice",
          "isRedFlag": false,
          "selfCareTip": "Prekini napor, sjedni i mirno diši.",
          "guidance": "Pritisak u prsima pri naporu mora pregledati liječnik, čak i ako brzo prođe kada staneš.",
          "title": "Pritisak u prsima pri naporu",
          "description": "Stezanje u sredini prsa koje se javlja kada brzo hodaš, penješ se uz stepenice ili radiš teži posao."
        },
        {
          "id": "chest_stitch",
          "label": "Oštra bol na jednoj strani prsa, jača pri dubokom udahu ili kašlju",
          "isRedFlag": false,
          "selfCareTip": "Diši mirno i polako nekoliko minuta. Stavi topli oblog na bolno mjesto.",
          "guidance": "Obično je riječ o istegnutom mišiću koji prolazi sam. Ako teško dišeš, nazovi 112.",
          "title": "Probadanje pri disanju",
          "description": "Oštra bol u jednoj točki prsa, jača kada duboko udahneš, zakašlješ se ili se okreneš."
        },
        {
          "id": "chest_breast_pain",
          "label": "Osjetljivost, napetost, crvenilo dojke ili bol tijekom dojenja",
          "isRedFlag": false,
          "selfCareTip": "Nosi mekan, udoban grudnjak bez čvrste žice i stavi topli ili hladni oblog prema onome što ti godi.",
          "guidance": "Osjetljivost u obje dojke često prati menstrualni ciklus. Ako jedna dojka postane crvena, vruća i dobiješ vrućicu, javi se liječniku danas.",
          "title": "Osjetljivost ili bol u dojci",
          "description": "Dojke su napete ili osjetljive prije mjesečnice, ili je jedna dojka bolna i tvrda tijekom dojenja."
        },
        {
          "id": "chest_breast_lump",
          "label": "Nova kvržica, otvrdnuće, uvlačenje kože na dojci ili oteklina pod pazuhom",
          "isRedFlag": false,
          "selfCareTip": "Nemoj jako pritiskati ni masirati to mjesto. Zapiši kada si primijetila promjenu kako bi rekla liječniku.",
          "guidance": "Većina kvržica u dojci je dobroćudna, ali svaku novu kvržicu ili promjenu kože ili bradavice treba pregledati liječnik.",
          "title": "Nova kvržica u dojci ili pod pazuhom",
          "description": "Osjećaš novu kvržicu ili tvrđe mjesto u dojci ili pazuhu, udubljenje na koži ili neobičan iscjedak."
        },
        {
          "id": "chest_warning",
          "label": "Jaka bol u prsima koja se širi u lijevu ruku, vrat ili čeljust, uz nedostatak zraka",
          "isRedFlag": true,
          "selfCareTip": "Odmah nazovi 112. Sjedni i otkopčaj usku odjeću.",
          "guidance": "Ovakva bol u prsima može biti srčani udar. Svaka je minuta važna.",
          "title": "Jaka bol u prsima koja se širi",
          "description": "Težak pritisak u prsima koji ide prema lijevoj ruci, vratu, čeljusti ili leđima. Može ići uz hladan znoj ili gušenje."
        }
      ],
      "stomach": [
        {
          "id": "stomach_upper_reflux",
          "label": "Pečenje ili težina u gornjem dijelu želuca",
          "isRedFlag": false,
          "selfCareTip": "Jedi jednostavnu, kuhanu hranu. Pij vodu sobne temperature i izbjegavaj obilne obroke.",
          "guidance": "Nadražen želudac česta je tegoba. Ako ti smeta svaki dan, naruči se liječniku.",
          "title": "Pečenje u gornjem dijelu želuca",
          "description": "Pečenje ili kiselina ispod rebara. Brzo osjetiš sitost ili kiseo okus nakon jela."
        },
        {
          "id": "stomach_cramping_mild",
          "label": "Grčevi u trbuhu uz nadutost ili češću ili rjeđu stolicu",
          "isRedFlag": false,
          "selfCareTip": "Popij čaj od mente ili kamilice, stavi nešto toplo na trbuh i odmori se.",
          "guidance": "Kratkotrajni grčevi obično dolaze od probave ili hrane koju si pojeo.",
          "title": "Grčevi i nadutost",
          "description": "Trbuh te povremeno grči, napuhnut je, imaš vjetrove ili češće ili rjeđe ideš na toalet."
        },
        {
          "id": "stomach_lower_sharp",
          "label": "Oštra bol u jednoj točki, dolje desno u trbuhu",
          "isRedFlag": true,
          "selfCareTip": "Dok te ne pregleda liječnik, ne uzimaj jake lijekove protiv bolova i ne stavljaj vruće obloge na trbuh.",
          "guidance": "Bol koja ostaje dolje desno u trbuhu mora brzo pregledati liječnik. Može biti upala slijepog crijeva.",
          "title": "Bol dolje desno u trbuhu",
          "description": "Bol u donjem desnom dijelu trbuha koja se pojačava i jača je pri kašlju, hodanju ili pritisku."
        },
        {
          "id": "stomach_severe_widespread",
          "label": "Vrlo jaka, stalna bol u trbuhu uz učestalo povraćanje, tvrd trbuh ili vrućicu",
          "isRedFlag": true,
          "selfCareTip": "Nemoj jesti ni puno piti. Odmah idi na hitni prijem ili nazovi 112.",
          "guidance": "Vrlo jaka bol uz tvrd trbuh može zahtijevati hitnu operaciju.",
          "title": "Vrlo jaka bol u cijelom trbuhu",
          "description": "Cijeli te trbuh jako boli i tvrd je na dodir, stalno povraćaš ili osjećaš da ćeš se onesvijestiti."
        }
      ],
      "pelvis": [
        {
          "id": "pelvis_period_cramps",
          "label": "Menstrualni grčevi ili tupa bol nisko u zdjelici u vrijeme mjesečnice",
          "isRedFlag": false,
          "selfCareTip": "Stavi termofor na donji dio trbuha, pij tople napitke i odmori se na boku s lagano savijenim koljenima.",
          "guidance": "Blagi menstrualni grčevi su česti, no ako te bol ometa u svakodnevnom životu, ginekološki pregled može provjeriti endometriozu ili miome.",
          "title": "Menstrualni grčevi ili mjesečna bol u zdjelici",
          "description": "Grčevi ili tupa bol nisko u trbuhu i križima neposredno prije ili tijekom mjesečnice."
        },
        {
          "id": "pelvis_one_sided",
          "label": "Bol na jednoj strani donjeg dijela zdjelice, u području jajnika ili u preponi",
          "isRedFlag": false,
          "selfCareTip": "Izbjegavaj podizanje teških tereta i ne stavljaj vruće obloge ako je bol oštra.",
          "guidance": "Jednostrana bol u zdjelici može potjecati od ciste na jajniku, ovulacije ili istegnuća prepone te zaslužuje liječnički pregled.",
          "title": "Bol na jednoj strani zdjelice ili u preponi",
          "description": "Probadanje ili pritisak na jednoj strani donjeg trbuha ili u preponi, ponekad jače pri kretanju."
        },
        {
          "id": "pelvis_urinary_burning",
          "label": "Pečenje pri mokrenju, zamućena mokraća ili vrlo čest nagon za mokrenjem",
          "isRedFlag": false,
          "selfCareTip": "Pij običnu vodu ravnomjerno tijekom dana i ne zadržavaj mokraću. Izbjegavaj kavu i gazirana pića.",
          "guidance": "Često upućuje na upalu mokraćnog mjehura. Liječnik može napraviti analizu urina i propisati lijek. Javi se danas ako dobiješ vrućicu ili bol u križima.",
          "title": "Pečenje pri mokrenju ili čest odlazak na toalet",
          "description": "Peče te dok mokriš, osjećaš pritisak iznad stidne kosti ili imaš osjećaj da mjehur nije prazan."
        },
        {
          "id": "pelvis_pressure_floor",
          "label": "Osjećaj težine, pritiska ili nelagode u dnu zdjelice ili intimnom području",
          "isRedFlag": false,
          "selfCareTip": "Izbjegavaj nošenje tereta i naprezanje na toaletu. Nosi prozračno pamučno rublje.",
          "guidance": "Osjećaj pritiska u zdjelici ili nadraženost česti su nakon poroda, u menopauzi ili kod blagih upala i dobro se liječe nakon pregleda.",
          "title": "Pritisak u dnu zdjelice ili intimna nelagoda",
          "description": "Osjećaj težine nisko u zdjelici, osjetljivost pri sjedenju ili nadraženost u intimnom području."
        },
        {
          "id": "pelvis_pregnancy_bleeding",
          "label": "Nagla i vrlo jaka bol u zdjelici, obilno krvarenje ili bol kada bi mogla biti trudna",
          "isRedFlag": true,
          "selfCareTip": "Legni na sigurno mjesto, ne uzimaj lijekove na svoju ruku i odmah nazovi 112 ili idi na hitni prijem.",
          "guidance": "Jaka bol u zdjelici uz krvarenje, vrtoglavicu ili moguću trudnoću hitno je ginekološko stanje koje zahtijeva bolnički pregled odmah.",
          "title": "Jaka bol u zdjelici, obilno krvarenje ili trudnoća",
          "description": "Nagla snažna bol nisko u trbuhu uz jako krvarenje, vrtoglavicu, vrućicu ili ako znaš ili sumnjaš da si trudna."
        }
      ],
      "back": [
        {
          "id": "back_strain_lift",
          "label": "Oštra bol u križima nastala naglo nakon podizanja tereta",
          "isRedFlag": false,
          "selfCareTip": "Nemoj se saginjati ni dizati teret. Odmori se, ali prošeći nakratko. Stavi topli oblog.",
          "guidance": "Ovo je vrlo često. Lagano kretanje pomaže više od ležanja u krevetu.",
          "title": "Bol u leđima nakon podizanja tereta",
          "description": "Mišići donjeg dijela leđa ukočili su se odmah nakon dizanja teškog predmeta ili naglog okreta."
        },
        {
          "id": "back_chronic",
          "label": "Tupa bol u donjem dijelu leđa koja traje nekoliko tjedana",
          "isRedFlag": false,
          "selfCareTip": "Radi lagane vježbe istezanja za leđa. Prilagodi visinu stolca i nemoj dugo sjediti mirno.",
          "guidance": "Dugotrajna bol u leđima popušta uz vježbe fizioterapeuta i jačanje trbušnih mišića.",
          "title": "Bol u leđima koja ne prolazi",
          "description": "Tupa bol u križima tjednima, jača nakon dugog sjedenja ili stajanja."
        },
        {
          "id": "back_stiffness",
          "label": "Ukočena leđa ujutro ili nakon dugog sjedenja",
          "isRedFlag": false,
          "selfCareTip": "Ujutro lagano zakruži ramenima i polako se razgibaj nekoliko puta prije početka dana.",
          "guidance": "Često nastaje zbog napetih mišića ili dugog boravka u istom položaju.",
          "title": "Ukočena leđa ujutro",
          "description": "Leđa su ti ukočena kada se probudiš i teško se saginješ. Popušta nakon što se malo razgibaš."
        },
        {
          "id": "back_severe_difficulty",
          "label": "Jaka bol u leđima uz utrnulost obiju nogu, slabost ili gubitak kontrole mokrenja",
          "isRedFlag": true,
          "selfCareTip": "Legni i odmah nazovi 112.",
          "guidance": "Živci u kralježnici mogu biti ozbiljno pritisnuti. Hitno ti treba bolnica.",
          "title": "Bol u leđima s utrnulim nogama",
          "description": "Snažna bol u leđima uz utrnulost ili slabost obiju nogu, ili nove smetnje s mokrenjem ili stolicom."
        },
        {
          "id": "back_upper_blades",
          "label": "Bol, napetost ili pečenje u gornjem dijelu leđa ili između lopatica",
          "isRedFlag": false,
          "selfCareTip": "Ustani često sa stolca, lagano povuci ramena unatrag i stavi topli oblog na gornji dio leđa.",
          "guidance": "Često nastaje zbog naginjanja nad telefonom ili stolom, ili nošenja teške torbe na jednom ramenu.",
          "title": "Bol u gornjem dijelu leđa ili između lopatica",
          "description": "Napetost ili probadanje visoko u leđima i između lopatica, osobito nakon dugog sjedenja ili rada rukama."
        },
        {
          "id": "back_flank_kidney",
          "label": "Bol na jednoj strani leđa ispod rebara, uz vrućicu, mučninu ili pečenje pri mokrenju",
          "isRedFlag": false,
          "selfCareTip": "Pij vodu u malim gutljajima i ne uzimaj jake lijekove protiv bolova dok te ne pregleda liječnik.",
          "guidance": "Duboka bol na jednoj strani leđa ispod rebara, osobito uz vrućicu ili smetnje mokrenja, može dolaziti od bubrega i treba pregled danas.",
          "title": "Bol u boku leđa ili području bubrega",
          "description": "Duboka bol na jednoj strani srednjih leđa ispod rebara koja se ne mijenja s položajem, ponekad uz vrućicu ili pečenje pri mokrenju."
        }
      ],
      "arm": [
        {
          "id": "arm_shoulder_elbow",
          "label": "Bol u ramenu pri podizanju ruke ili bol u laktu pri hvatanju i nošenju predmeta",
          "isRedFlag": false,
          "selfCareTip": "Izbjegavaj ponavljano podizanje ruke iznad glave i nemoj spavati na bolnom ramenu nekoliko noći.",
          "guidance": "Često je riječ o nadraženoj tetivi ramena ili lakta. Javi se liječniku ako ne možeš podići ruku ili bol traje dulje od tjedan dana.",
          "title": "Bol u ramenu ili laktu pri pokretu",
          "description": "Rame te boli dok podižeš ruku ili se oblačiš, ili te lakat boli dok stišćeš ili okrećeš predmete."
        },
        {
          "id": "arm_sprain",
          "label": "Bol u ramenu, laktu ili zapešću nakon pada, iskretanja ili udarca",
          "isRedFlag": false,
          "selfCareTip": "Stavi led umotan u ručnik na bolno mjesto. Odmori ruku i drži je poduprtu.",
          "guidance": "Lakši udarci i istegnuća obično prolaze za nekoliko dana uz mirovanje zgloba.",
          "title": "Bol u zapešću ili zglobu nakon pada",
          "description": "Zapešće, lakat ili rame boli te i otečeno je nakon udarca ili pada na dlanove."
        },
        {
          "id": "arm_numbness",
          "label": "Blaga utrnulost ili trnci u prstima nakon dugog tipkanja ili držanja telefona",
          "isRedFlag": false,
          "selfCareTip": "Pravi česte stanke od 5 minuta. Protresi šake i lagano razgibaj zapešća.",
          "guidance": "Može biti pritisnut živac u zapešću. Reci liječniku ako ne prođe.",
          "title": "Trnci u prstima",
          "description": "Utrnulost ili trnci u palcu, kažiprstu i srednjem prstu, osobito noću ili pri tipkanju."
        },
        {
          "id": "arm_ache",
          "label": "Bolni i umorni mišići ruke nakon teškog fizičkog rada ili sporta",
          "isRedFlag": false,
          "selfCareTip": "Otuširaj se toplom vodom, nježno izmasiraj mišiće i odmori ruku jedan dan.",
          "guidance": "To je uobičajeno nakon većeg napora. Prolazi samo za 2 do 3 dana.",
          "title": "Upala mišića u ruci",
          "description": "Mišići ruke bole te nakon neuobičajenog napora, vježbanja ili nošenja tereta."
        },
        {
          "id": "arm_sudden_swelling",
          "label": "Nagla slabost jedne ruke, ne možeš je podići ili naglo i jako otiče",
          "isRedFlag": true,
          "selfCareTip": "Nemoj forsirati ruku. Odmah nazovi 112.",
          "guidance": "Nagla slabost ruke može biti znak moždanog udara ili teške ozljede.",
          "title": "Nagla slabost jedne ruke",
          "description": "Odjednom ne možeš podići ili držati ruku. Može ići uz obješenu stranu lica ili nejasan govor."
        }
      ],
      "leg": [
        {
          "id": "leg_sprain",
          "label": "Otečen ili bolan gležanj nakon krivog koraka",
          "isRedFlag": false,
          "selfCareTip": "Podigni nogu na jastuk i drži hladan oblog 15 minuta. Ne oslanjaj se punom težinom na nju.",
          "guidance": "Miruj nekoliko dana. Ako oteklina raste ili ne možeš stati na nogu, otiđi na rendgen.",
          "title": "Uganut gležanj",
          "description": "Gležanj te boli i otečen je nakon što si krivo stao. Teško staješ na nogu."
        },
        {
          "id": "leg_cramp",
          "label": "Bolan grč u listu noću ili nakon napora",
          "isRedFlag": false,
          "selfCareTip": "Ispruži nogu i lagano povuci prste prema sebi. Izmasiraj list i popij čašu vode.",
          "guidance": "Grčevi se često javljaju nakon umora, jakog znojenja ili premalo vode.",
          "title": "Grč u listu",
          "description": "Mišić lista naglo se i bolno stisne, često noću ili kada piješ premalo vode."
        },
        {
          "id": "leg_knee_ache",
          "label": "Bol u koljenu pri silasku niz stepenice ili nakon dugog hodanja",
          "isRedFlag": false,
          "selfCareTip": "Izbjegavaj čučanje i nošenje tereta. Nosi udobnu obuću s mekim potplatom.",
          "guidance": "Koljeno se troši s vremenom. Vježbe za jačanje mišića natkoljenice pomažu zglobu.",
          "title": "Bol u koljenu na stepenicama",
          "description": "Koljeno te boli pri silasku niz stepenice, čučanju ili nakon dugog sjedenja sa savijenim koljenima."
        },
        {
          "id": "leg_sudden_swelling",
          "label": "Samo jedna noga naglo otečena, topla, crvena i jako bolna, ili ne možeš stati na nju",
          "isRedFlag": true,
          "selfCareTip": "Miruj i nemoj masirati list. Brzo se javi liječniku ili idi na hitni prijem.",
          "guidance": "Naglo oticanje jedne potkoljenice može biti krvni ugrušak (tromboza). Treba hitno liječenje.",
          "title": "Naglo oticanje samo jedne noge",
          "description": "Samo jedan list naglo je otekao te je topao, crven i bolan."
        },
        {
          "id": "leg_heel_foot",
          "label": "Bol u peti, Ahilovoj tetivi ili tabanu kada staneš na stopalo",
          "isRedFlag": false,
          "selfCareTip": "Nosi udobnu obuću s mekim potplatom i izbjegavaj hodanje bos po tvrdom podu.",
          "guidance": "Često se javlja nakon dugog stajanja ili tanke obuće. Ako imaš šećernu bolest i primijetiš ranicu na stopalu, brzo se javi liječniku.",
          "title": "Bol u peti ili tabanu",
          "description": "Oštra bol ispod pete ili duž svoda stopala pri prvim jutarnjim koracima, ili zatezanje iznad pete."
        },
        {
          "id": "leg_hip_thigh",
          "label": "Bol u kuku ili bedru pri hodanju, penjanju uz stepenice ili ustajanju sa stolca",
          "isRedFlag": false,
          "selfCareTip": "Izbjegavaj duge korake ili nošenje tereta i stavi jastuk između koljena dok spavaš na boku.",
          "guidance": "Bol u kuku ili natkoljenici može potjecati od istegnutog mišića ili zgloba. Javi se liječniku ako šepaš ili bol traje dulje od tjedan dana.",
          "title": "Bol u kuku ili bedru pri hodanju",
          "description": "Boli te vanjska strana kuka, prepona ili mišići natkoljenice dok hodaš, ideš uz stepenice ili ležiš na toj strani."
        }
      ]
    },
    "severity": {
      "mild": {
        "title": "Blago",
        "description": "Osjećaš simptom, ali obavljaš uobičajene poslove."
      },
      "moderate": {
        "title": "Umjereno",
        "description": "Ometa te u poslu, kretanju ili spavanju."
      },
      "severe": {
        "title": "Jako",
        "description": "Gotovo ništa ne možeš raditi."
      }
    },
    "duration": {
      "today": {
        "label": "Danas ili jučer",
        "hint": "Manje od 24 sata"
      },
      "days": {
        "label": "2–7 dana",
        "hint": "Od 2 do 7 dana"
      },
      "weeks": {
        "label": "1–2 tjedna",
        "hint": "Od 1 do 2 tjedna"
      },
      "chronic": {
        "label": "Više od 2 tjedna",
        "hint": "Ne prolazi ili se stalno vraća"
      }
    },
    "urgency": {
      "low": {
        "title": "Vjerojatno si možeš pomoći kod kuće",
        "intro": "Odmori se, pij vode i prati kako se osjećaš nekoliko dana. Ako se pogorša ili se pojave novi znakovi, nazovi obiteljskog liječnika ili 112."
      },
      "medium": {
        "title": "Javi se obiteljskom liječniku u idućih nekoliko dana",
        "intro": "Ovo vrijedi pokazati liječniku. Ako se u međuvremenu pogorša, nazovi 112."
      },
      "high": {
        "title": "Posjeti liječnika danas",
        "intro": "Nemoj odgađati. Nazovi svog liječnika ili idi danas u ambulantu. Ako se pogorša, nazovi 112."
      }
    }
  },
  "rom": {
    "ui": {
      "eyebrow": "Dikhiben e sastipnasko",
      "heading": "Dikh tire simptomura",
      "subtitle": "Sikav pe trupo kaj dukhal tut thaj de atveto pe nekobor skurte phuchimata. Porme dikh so te keres.",
      "resetButton": "Katar o anglunipen",
      "backButton": "Palpale",
      "nextButton": "Dzha maj dur",
      "finishButton": "Dikh o rezultato",
      "stepIndicator": "Drom {current} katar {total}",
      "step1Title": "Thano",
      "step2Title": "Simptomo",
      "step3Title": "Kozom zurales",
      "step4Title": "Rezultato",
      "step1Question": "Kaj hatjares dukh vaj pharipen?",
      "step1Prompt": "Azba o than pe trupo vaj alosar katar i lista.",
      "step2Question": "So miazol maj but pe kodo so hatjares?",
      "step2Prompt": "Alosar o simptomo savo dukhal tut maj but.",
      "urgentBadge": "Semno vash sigardiari",
      "step3Question": "Kozom zurales si thaj katar kana?",
      "step3Prompt": "Alosar po jekh opcija ande sako grupa.",
      "severityHeading": "Kozom zurales si?",
      "durationHeading": "Katar kana si tut o simptomo?",
      "step4Question": "So shaj te keres akana",
      "step4Prompt": "Pala tire atvetura. Akava naj dijagnoza.",
      "summaryHeading": "Rezume tire atvetengo",
      "areaLabel": "Thano",
      "symptomLabel": "Simptomo",
      "intensityLabel": "Kozom zurales",
      "durationLabel": "Katar kana",
      "recommendationHeading": "So te keres maj dur",
      "safeSelfCareHeading": "So shaj te keres khere",
      "copySummary": "Kopirisar o rezume",
      "copied": "Kopirime",
      "sendWhatsApp": "Bichhal pe WhatsApp",
      "showDoctor": "Sikav e doktoreske",
      "requestMediatorHelp": "De duma mediatoresa",
      "scheduleDoctor": "Ker termin online",
      "readEducationalTopic": "Drabar o sikavimos",
      "disclaimer": "Akava naj dijagnoza. Te hatjares tut maj nasul vaj i dukh si but bari, akhar 112.",
      "viewer3D": {
        "ariaLabel": "3D trupo. Bolde les thaj azba kaj dukhal tut.",
        "loading": "Phpherel pes o 3D modelo ({progress}%)",
        "subModelInfo": "3D trupo",
        "front": "Anglal",
        "back": "Palal",
        "perspective": "Kuto",
        "rotate360": "360°",
        "zoomIn": "Pashar",
        "zoomOut": "Durjar",
        "resetView": "Irin o dikhiben",
        "tip": "Crde stingo vaj chacho te boldes o trupo. Azba kaj dukhal tut.",
        "searchPlaceholder": "Rod organo vaj muskulo (sar ilo, biceps)",
        "selected3DStructure": "Alosardjan:",
        "activeAreaPrefix": "Thano:",
        "leftSide": "Stingo",
        "rightSide": "Chacho",
        "selectRegionPrefix": "Alosar",
        "rotateTooltip": "Bolde o trupo vash 180°",
        "layerHybrid": "Muskulura thaj organura",
        "layerMuscular": "Muskulura thaj žile",
        "layerOrgans": "Andrune organura",
        "layerSurface": "Morti",
        "legendSkeletalMuscles": "Muskulura",
        "legendTendonsJoints": "Žile thaj globura",
        "legendInternalOrgans": "Andrune organura",
        "legendSelectedStructure": "Alosardi struktura"
      },
      "emergency": {
        "badge": "Sastipnaski sigardiari 112",
        "title": "Shaj te avel sigardiari: akhar akana 112",
        "description": "Ma azhuker. Te nashti te akhares, dzha sigo ki bolnitsaki sigardiari. Ma trad korkoro o vurdono.",
        "whyEmergencyPrefix": "Alosardjan:",
        "call112Now": "Akhar 112 akana",
        "continueReview": "Haljiljom"
      },
      "structure3DLabel": "3D struktura",
      "sensationLabel": "Hatjarimos",
      "triggersLabel": "So kerel maj nasul",
      "specialtyLabel": "Doktori specijalisto",
      "warningNoticeRedFlag": "Sikadile semnja vash sigardiari.",
      "warningNoticeSafe": "Na sikadile semnja vash sigardiari."
    },
    "bodyParts": {
      "head": {
        "title": "Shero thaj kor",
        "subtitle": "Dukh ko shero, pashni, kan, phangli kor vaj o shero phirel"
      },
      "chest": {
        "title": "Kolin thaj phurdinimos",
        "subtitle": "Tasavimos ko kolin, chucha, pashavra, phari phurdinimos vaj sigo ilo"
      },
      "stomach": {
        "title": "Stomako thaj por",
        "subtitle": "Phabarimos, grčura, čhadimos, phugjarimos vaj dukh ando por"
      },
      "pelvis": {
        "title": "Teluno por thaj pelviso",
        "subtitle": "Chonutni dukh, ovariura, phabarimos ko mutrimos vaj intimno than"
      },
      "back": {
        "title": "Dumo thaj kichma",
        "subtitle": "Dukh telal ko dumo, teluno kokalo, phangle muskulura vaj mashkar e phike"
      },
      "arm": {
        "title": "Vasta thaj naja",
        "subtitle": "Pamortimos, dukh ko phiko, kohni, vast vaj klichura le najenge"
      },
      "leg": {
        "title": "Punre thaj talpe",
        "subtitle": "Dukh ko kuko, chang, globi, khur vaj talpa"
      }
    },
    "symptomsByRegion": {
      "head": [
        {
          "id": "head_migraine",
          "label": "Dukh savi marel pe jekh rig e shereski, buko čhadimaske vaj dukh katar o dud",
          "isRedFlag": false,
          "selfCareTip": "Hodinisar ande mirni thaj kali soba. Pi pani thaj čhiv shudro dikhlo pe chikat.",
          "guidance": "Miazol pe migrena. Te irinel pes butivar, phuch tire familijake doktores vash drab savi arakhel la.",
          "title": "Migrena vaj dukh savi marel",
          "description": "Dukh savi marel, obicno pe jekh rig e shereski. Shaj te dukhal tut o dud thaj i galama vaj te avel tuke te čhades."
        },
        {
          "id": "head_tension",
          "label": "Tasavimos sar phangli lenta trujal o shero, pala streso vaj khino",
          "isRedFlag": false,
          "selfCareTip": "Mukh o ekrano xanci vrjama thaj lokhes masirisar i kor. Inklji zalog pe lačhi balval.",
          "guidance": "Avel butivar katar o streso, xanci sovibe vaj lungo beshimos.",
          "title": "Dukh ko shero katar o streso",
          "description": "Tasavimos sar phangli lenta upral o chikat. Avel butivar pala streso, lungo dikhiben ko ekrano vaj phangli kor."
        },
        {
          "id": "head_dehydration",
          "label": "Surdo, sajekh dukh pala tato dives vaj pala so piljan xanci pani",
          "isRedFlag": false,
          "selfCareTip": "Pi lokhes 1 dzhi 2 bare taxtaja pani vaj tato čajo. Ma pi kafava thaj gudle sokura.",
          "guidance": "Butivar nakhel kana pjes pani thaj beshes ando uchin.",
          "title": "Dukh ko shero katar tatipen vaj trush",
          "description": "Dukh ando sasto shero, maj bari kana phiraves o shero. Avel pala kham, tatipen vaj xanci pani."
        },
        {
          "id": "head_fever",
          "label": "Dukh ko shero tatipnasa, izdravimasa vaj phanglo nakh",
          "isRedFlag": false,
          "selfCareTip": "Pashljo ko than, merisar o tatipen thaj pi but pani thaj čajo.",
          "guidance": "Shaj te avel shil vaj viroza. Te nakhel o tatipen opral 38,5 °C vaj ačhel maj but katar 3 dive, dzha ko doktori.",
          "title": "Dukh ko shero tatipnasa",
          "description": "Dukhal tiro shero thaj si tut tatipen, izdravimos, dukh ando trupo vaj phanglo nakh."
        },
        {
          "id": "head_sudden_severe",
          "label": "Sigi thaj but zurali dukh ko shero, vaj konfuzijasa thaj slabipnasa",
          "isRedFlag": true,
          "selfCareTip": "Besh pe sigurno than thaj akhar sigo 112.",
          "guidance": "But zurali dukh ko shero savi avel sigo si sigardiari. Trubul tuke doktori akana.",
          "title": "Sigi, but zurali dukh ko shero",
          "description": "I maj bari dukh ko shero ando tiro trajo, savi avel ande xanci sekunde. Shaj te avel phangle kora, kale dikhibenasa vaj konfuzijasa."
        },
        {
          "id": "head_neck_stiff",
          "label": "Dukh ki kor, phangli kor vaj dukh kana boldes o shero",
          "isRedFlag": false,
          "selfCareTip": "Čhiv tato dikhlo palal ki kor, mukh tele e phike thaj bolde o shero lokhes bi zorako. Ma sove pe but uče sheranda.",
          "guidance": "Avel butivar katar phangle muskulura ki kor, bango sovibe vaj lungo dikhiben ko ekrano. Te huljel pamortimos ko vast, dzha ko doktori.",
          "title": "Dukh ki kor vaj phangli kor",
          "description": "I kor dukhal thaj phares phirel kana boldes o shero vaj dikhes tele, varekana tasavimasa karing o phiko."
        },
        {
          "id": "head_throat_swallow",
          "label": "Dukh ando krlo kana nakaves, phanglo glaso vaj shuvljarde guke pe kor",
          "isRedFlag": false,
          "selfCareTip": "Pi tato čajo vaj pani po zalog, hodinisar o glaso thaj ačhav o thuv vaj but shudre pimatja.",
          "guidance": "Maj but dukha ando krlo aven katar viroza. Te si tut baro tatipen, parne thana ando krlo vaj phares nakaves, dzha ko doktori.",
          "title": "Dukh ando krlo vaj kana nakaves",
          "description": "Phabarel vaj dukhal tut o krlo kana nakaves, tiro glaso si phanglo vaj hatjares cikne guke tela i pashni."
        },
        {
          "id": "head_jaw_ear",
          "label": "Dukh ando kan, dukh ki pashni kana xas vaj tasavimos pasha e čhamja thaj o nakh",
          "isRedFlag": false,
          "selfCareTip": "Xa kovlo xaben, ma čhiv kashuka ando kan thaj čhiv kovlo tato dikhlo avral pe čham.",
          "guidance": "Dukh ando kan, ki pashni vaj ko sinusura valjani te dikhel o familijako doktori vaj o dantisto.",
          "title": "Dukh ando kan, pashni vaj sinusura",
          "description": "Jekh kan dukhal vaj si phanglo, dukhal i pashni kana xas vaj hatjares pharipen pe chikat thaj čhamja."
        },
        {
          "id": "head_neck_red_flag",
          "label": "Zurales phangli kor bare tatipnasa, dukh katar o dud, thana pe morti vaj konfuzija",
          "isRedFlag": true,
          "selfCareTip": "Pashljo pe mirno than thaj akhar sigo 112.",
          "guidance": "Zurales phangli kor bare tatipnasa vaj konfuzijasa shaj te avel phari infekcija thaj mangel bolnitsa akana.",
          "title": "Phangli kor bare tatipnasa vaj konfuzijasa",
          "description": "Nashti te bangjares o shero karing o kolin katar i dukh, bare tatipnasa, čhadimasa vaj dukh katar o dud."
        }
      ],
      "chest": [
        {
          "id": "chest_reflux",
          "label": "Phabarimos ko kolin vaj shuklo vkus pala o xaben vaj kana bangjos",
          "isRedFlag": false,
          "selfCareTip": "Ma pashljo sigo pala o xaben. Ma xa tikno xaben thaj ma pi kafava xanci vrjama.",
          "guidance": "O phabarimos obicno avel katar i kiselina ando stomako. Te na nakhel, o familijako doktori shaj te del tut drab.",
          "title": "Phabarimos ko kolin",
          "description": "Phabarimos savo vazdel pes katar o stomako ko krlo. Maj baro si kana bangjos vaj pala pharo xaben."
        },
        {
          "id": "chest_exertion",
          "label": "Tasavimos ko kolin kana keres phari buchi vaj inkljes pe skale",
          "isRedFlag": false,
          "selfCareTip": "Ačhav i buchi, besh tele thaj phurdine lokhes.",
          "guidance": "Tasavimos ko kolin ko phirimos musaj te dikhel o doktori, vi te nakhel sigo kana ačhes.",
          "title": "Tasavimos ko kolin ko phirimos",
          "description": "Tasavimos ko mashkar e kolinesko kana phires sigo, inkljes pe skale vaj keres phari buchi."
        },
        {
          "id": "chest_stitch",
          "label": "Pusavimos pe jekh rig e kolineski, maj baro kana les xor balval vaj xasaves",
          "isRedFlag": false,
          "selfCareTip": "Phurdine lokhes xanci minute. Čhiv vareso tato pe than savo dukhal.",
          "guidance": "Obicno si crdindo muskulo thaj nakhel korkoro. Te avel phari phurdinimos, akhar 112.",
          "title": "Pusavimos kana phurdines",
          "description": "Sigo pusavimos ko jekh than ando kolin, maj baro kana crdes xor balval, xasaves vaj boldes tut."
        },
        {
          "id": "chest_breast_pain",
          "label": "Dukh, shuvljarimos, lolipen ki chuchi vaj dukh kana des chuchi e chavoreske",
          "isRedFlag": false,
          "selfCareTip": "Phirav kovle gada bi zurale sastrnako thaj čhiv kovlo tato vaj shudro dikhlo sar avel tuke maj mishto.",
          "guidance": "Dukh ande solduj chucha butivar avel anglal o chonutno ciklo. Te avel jekh chuchi loli, tati thaj si tut tatipen, dzha adives ko doktori.",
          "title": "Kovlipen vaj dukh ki chuchi",
          "description": "Le chucha si shuvljarde anglal o chonutno ciklo, vaj jekh chuchi dukhal thaj si zurali kana des chuchi."
        },
        {
          "id": "chest_breast_lump",
          "label": "Nevi guka, zuralo than ki chuchi vaj shuvljarimos telal i phiko",
          "isRedFlag": false,
          "selfCareTip": "Ma tasav thaj ma masirisar zurales o than. Ser de kana dikhljan les te phenes e doktoreske.",
          "guidance": "Maj but guke andi chuchi naj nasul, numa svako nevi guka vaj paruvimos pe morti musaj te dikhel o doktori.",
          "title": "Nevi guka ki chuchi vaj telal i phiko",
          "description": "Hatjares nevi guka vaj maj zuralo than andi chuchi vaj telal o vast, vaj paruvimos pe morti."
        },
        {
          "id": "chest_warning",
          "label": "Zurali dukh ko kolin savi dzhal ko stingo vast, kor vaj pashni, phari phurdinimasa",
          "isRedFlag": true,
          "selfCareTip": "Akhar sigo 112. Besh tele thaj putar e tang gada.",
          "guidance": "Akaja dukh ko kolin shaj te avel infarkto ko ilo. Sako minuta si vazhno.",
          "title": "Zurali dukh ko kolin savi buhljol",
          "description": "Pharo tasavimos ko kolin savo dzhal ko stingo vast, kor, pashni vaj dumo. Shaj te avel shudre kamlimasa vaj bi balvaljako."
        }
      ],
      "stomach": [
        {
          "id": "stomach_upper_reflux",
          "label": "Phabarimos vaj pharipen opral ando stomako",
          "isRedFlag": false,
          "selfCareTip": "Xa lokho, kirado xaben. Pi pani savo naj shudro thaj ma xa bare xabena.",
          "guidance": "Xoljardo stomako si obicno buchi. Te dukhal tut sako dives, ker termin ko doktori.",
          "title": "Phabarimos opral ando stomako",
          "description": "Phabarimos vaj kiselina tela e pashavra. Čaljos sigo vaj avel tuke shuklo ando muj pala o xaben."
        },
        {
          "id": "stomach_cramping_mild",
          "label": "Grčura ando sasto por, phugjarimasa vaj maj butivar phirimos ko toaleto",
          "isRedFlag": false,
          "selfCareTip": "Pi čajo katar menta vaj kamilica, čhiv vareso tato pe por thaj hodinisar.",
          "guidance": "Cikne grčura obicno aven katar o xaben so xaljan.",
          "title": "Grčura thaj phugjarimos",
          "description": "O por kidel pes varekana, si shuvljardo, vaj dzhas maj butivar vaj maj xancivar ko toaleto."
        },
        {
          "id": "stomach_lower_sharp",
          "label": "Zurali dukh ko jekh than, telal pe chachi rig e poreski",
          "isRedFlag": true,
          "selfCareTip": "Dzhi kaj na dikhel tut o doktori, ma le zurale draba mamuj dukh thaj ma čhiv niso tato pe por.",
          "guidance": "Dukh savi ačhel telal pe chachi rig e poreski trubul sigo te dikhel o doktori. Shaj te avel apendicita.",
          "title": "Dukh telal pe chachi rig e poreski",
          "description": "Dukh telal pe chachi rig e poreski savi barjol thaj dukhal maj but kana xasaves, phires vaj tasaves."
        },
        {
          "id": "stomach_severe_widespread",
          "label": "But zurali dukh ando sasto por, butivar čhadimasa, zuralo por vaj tatipen",
          "isRedFlag": true,
          "selfCareTip": "Ma xa thaj ma pi but. Dzha sigo ki bolnitsaki sigardiari vaj akhar 112.",
          "guidance": "But zurali dukh zurale poresa shaj te mangel sigo operacija.",
          "title": "But zurali dukh ando sasto por",
          "description": "Sasto por dukhal zurales thaj si zuralo sar kasht, čhades sajekh vaj hatjares kaj peres."
        }
      ],
      "pelvis": [
        {
          "id": "pelvis_period_cramps",
          "label": "Chonutne grčura vaj surdi dukh telal ando por pasha o chonutno ciklo",
          "isRedFlag": false,
          "selfCareTip": "Čhiv tati shisha panjesa telal pe por, pi tate čajura thaj hodinisar pe rig bangjarde changensa.",
          "guidance": "Lokhe chonutne dukha si butivar, numa te ačhaven tut katar i buchi vaj o sovibe, o ginekologo shaj te dikhel sostar aven.",
          "title": "Chonutne grčura vaj dukh ando pelviso",
          "description": "Tasavimos vaj surdi dukh telal ando por thaj ko dumo anglal vaj ando chonutno ciklo."
        },
        {
          "id": "pelvis_one_sided",
          "label": "Dukh pe jekh rig telal ando pelviso, pasha o ovario vaj ko kuko",
          "isRedFlag": false,
          "selfCareTip": "Ma vazde pharo thaj ma čhiv tate dikhle te si i dukh sigi thaj pusavdi.",
          "guidance": "Dukh pe jekh rig telal ando por shaj te avel katar cista ko ovario vaj crdindo muskulo thaj valjani te dikhel la o doktori.",
          "title": "Dukh pe jekh rig telal ando pelviso",
          "description": "Pusavimos vaj tasavimos pe jekh rig telal ando por vaj pasha o punro, maj baro kana phires."
        },
        {
          "id": "pelvis_urinary_burning",
          "label": "Phabarimos kana keres muter, muter bi uzho vaj butivar phirimos ko toaleto",
          "isRedFlag": false,
          "selfCareTip": "Pi uzho pani sako xanci vrjama thaj ma inker o muter. Ma pi kafava thaj gazirime pimatja.",
          "guidance": "Miazol pe infekcija e mutreski. O familijako doktori shaj te kerel analiza thaj te del drab. Dzha adives ko doktori te avel tatipen vaj dukh ko dumo.",
          "title": "Phabarimos ko mutrimos vaj sigo phirimos ko toaleto",
          "description": "Phabarel tut kana keres muter, hatjares tasavimos telal pe por vaj sar te na chuchardilo o mutresko gono."
        },
        {
          "id": "pelvis_pressure_floor",
          "label": "Pharipen, tasavimos vaj dukh telal ando pelviso vaj ko intimno than",
          "isRedFlag": false,
          "selfCareTip": "Ma vazde phare bukja thaj phirav lokhe pambukoske gada.",
          "guidance": "Pharipen telal ando pelviso vaj xoljarimos avel butivar pala bijandimos vaj infekcija thaj sastjol lokhes pala vizita ko doktori.",
          "title": "Pharipen ando pelviso vaj intimno dukh",
          "description": "Hatjarimos pharipnasko telal ando trupo, dukh kana beshes vaj xoljarimos ko intimno than."
        },
        {
          "id": "pelvis_pregnancy_bleeding",
          "label": "Sigi thaj but zurali dukh telal ando pelviso, baro ratjarimos vaj dukh kana shaj te aves khamni",
          "isRedFlag": true,
          "selfCareTip": "Pashljo pe sigurno than, ma le draba korkori thaj akhar sigo 112 vaj dzha ki sigardiari.",
          "guidance": "Zurali dukh ando pelviso bare ratjarimasa, phirimasa e sheresko vaj kana shaj te aves khamni si sigardiari thaj mangel bolnitsa akana.",
          "title": "Zurali dukh ando pelviso, baro ratjarimos vaj khamnipen",
          "description": "Sigi zurali dukh telal ando por bare ratjarimasa, tatipnasa, vaj svako zurali dukh kana dzanes vaj gindis kaj san khamni."
        }
      ],
      "back": [
        {
          "id": "back_strain_lift",
          "label": "Zurali dukh telal ko dumo savi astardja sigo pala vazdimos phare bukjako",
          "isRedFlag": false,
          "selfCareTip": "Ma bangjo thaj ma vazde pharo. Hodinisar, numa ker vi cikne phirimata. Čhiv tato dikhlo.",
          "guidance": "Akava kerel pes butivar. Lokho phirimos azhutil maj but katar pashljimos ko than.",
          "title": "Dukh ko dumo pala vazdimos",
          "description": "E muskulura telal ko dumo phanglile sigo pala so vazdjan vareso pharo vaj boldjan tut sigo."
        },
        {
          "id": "back_chronic",
          "label": "Surdo dukh telal ko dumo xanci kurke",
          "isRedFlag": false,
          "selfCareTip": "Ker lokhe vjezhbe vash o dumo. Lačhar o skamin thaj ma besh but vrjama bi phirimasko.",
          "guidance": "Purani dukh ko dumo lačhjol vjezhbenca katar fizioterapeuto thaj maj zurale muskulenca e poreske.",
          "title": "Dukh ko dumo savi na nakhel",
          "description": "Surdo dukh telal ko dumo kurkencar, maj bari pala lungo beshimos vaj terdimos."
        },
        {
          "id": "back_stiffness",
          "label": "Phanglo dumo sabale vaj pala lungo beshimos pe skamin",
          "isRedFlag": false,
          "selfCareTip": "Sabale lokhes bolde e phike thaj bangjo lokhes xanci droma anglal te astares o dives.",
          "guidance": "Avel butivar kana e muskulura si phangle vaj beshljan but ande jekh pozicija.",
          "title": "Phanglo dumo sabale",
          "description": "Tiro dumo si phanglo kana ushtes thaj phares bangjos. Lačhjol pala so phires zalog."
        },
        {
          "id": "back_severe_difficulty",
          "label": "Zurali dukh ko dumo pamortimasa ande solduj punre, slabipen vaj xasarimos kontrolako vash muter",
          "isRedFlag": true,
          "selfCareTip": "Pashljo tele thaj akhar sigo 112.",
          "guidance": "E nervura ando dumo shaj te aven phares tasavde. Trubul tuke bolnitsa sigo.",
          "title": "Dukh ko dumo pamortime punrenca",
          "description": "Zurali dukh ko dumo pamortimasa vaj slabipnasa ande solduj punre, vaj neve problemura ko toaleto."
        },
        {
          "id": "back_upper_blades",
          "label": "Dukh vaj phabarimos opral ko dumo vaj mashkar e phike",
          "isRedFlag": false,
          "selfCareTip": "Ushti butivar katar o skamin, crde lokhes e phike palpale thaj čhiv tato dikhlo opral pe dumo.",
          "guidance": "Avel butivar kana beshes bangjardo upral o telefono vaj skamin, vaj kana ingeres pharo gono pe jekh phiko.",
          "title": "Dukh opral ko dumo vaj mashkar e phike",
          "description": "Tasavimos vaj dukh opral ko dumo thaj mashkar e phike, maj but pala beshimos vaj buchi le vastenca."
        },
        {
          "id": "back_flank_kidney",
          "label": "Dukh pe jekh rig e dumeski tela e pashavra, tatipnasa, čhadimasa vaj phabarimos ko muter",
          "isRedFlag": false,
          "selfCareTip": "Pi pani po zalog thaj ma le zurale draba mamuj dukh anglal te dikhel tut o doktori.",
          "guidance": "Dukh pe jekh rig e dumeski tela e pashavra, maj but tatipnasa vaj phabarimasa ko muter, shaj te avel katar e bobrege thaj trubul dikhli adives.",
          "title": "Dukh pe jekh rig e dumeski vaj pasha e bobrege",
          "description": "Xor dukh pe jekh rig e dumeski tela e pashavra savi na parudjol kana phires, varekana tatipnasa vaj phabarimasa ko mutrimos."
        }
      ],
      "arm": [
        {
          "id": "arm_shoulder_elbow",
          "label": "Dukh ko phiko kana vazdes o vast vaj dukh ko kohni kana astaras vareso",
          "isRedFlag": false,
          "selfCareTip": "Ma vazde o vast opral o shero butivar thaj ma sove pe dukhado phiko xanci ratja.",
          "guidance": "Butivar si xoljardi žila ko phiko vaj kohni. Te nashti te vazdes o vast vaj ačhel maj but katar jekh kurko, dzha ko doktori.",
          "title": "Dukh ko phiko vaj kohni ko phiravimos",
          "description": "O phiko dukhal kana vazdes o vast vaj urjaves tut, vaj o kohni dukhal kana astaras thaj boldes bukja."
        },
        {
          "id": "arm_sprain",
          "label": "Dukh ko phiko, kohni vaj globi e vastesko pala perimos vaj sigo phiravimos",
          "isRedFlag": false,
          "selfCareTip": "Čhiv paho phanglo ando dikhlo pe than savo dukhal. Hodinisar o vast.",
          "guidance": "Lokhe daba thaj crdimata obicno nakhen ande xanci dive te hodinisares o globi.",
          "title": "Dukh ko globi pala perimos",
          "description": "O globi, o kohni vaj o phiko dukhal thaj si shuvljardo pala dab vaj perimos pe palme."
        },
        {
          "id": "arm_numbness",
          "label": "Lokho pamortimos vaj pusavimata ande naja pala lungo labyarimos e telefonosko",
          "isRedFlag": false,
          "selfCareTip": "Ker butivar pauze po 5 minute. Izdrisar e vasta thaj lokhes bolde e globura.",
          "guidance": "Shaj te avel tasavdo nervo ko globi e vastesko. Phen e doktoreske te na nakhel.",
          "title": "Pusavimata ande naja",
          "description": "Pamortimos vaj pusavimata ande palma thaj naja, maj but ratjate vaj kana pishis."
        },
        {
          "id": "arm_ache",
          "label": "E muskulura e vasteske dukhan thaj si khine pala phari fizikani buchi",
          "isRedFlag": false,
          "selfCareTip": "Ker tato dusho, lokhes masirisar e muskulura thaj hodinisar jekh dives.",
          "guidance": "Normalno si pala neobicno phari buchi. Nakhel korkoro ande 2 dzhi 3 dive.",
          "title": "Dukh ande muskulura e vasteske",
          "description": "E muskulura tire vasteske dukhan pala phari buchi, sporto vaj ingerimos phare bukjengo."
        },
        {
          "id": "arm_sudden_swelling",
          "label": "Sigo slabipen ko jekh vast, nashti te vazdes les vaj shuvljol sigo thaj but",
          "isRedFlag": true,
          "selfCareTip": "Ma zorisar o vast. Akhar sigo 112.",
          "guidance": "Sigo slabipen ko vast shaj te avel dab ki godi vaj pharo phagimos.",
          "title": "Sigo slabipen ko jekh vast",
          "description": "Sigo nashti te vazdes vaj te inkeres jekh vast. Shaj te avel bangjarde mujesa vaj phangle dumasa."
        }
      ],
      "leg": [
        {
          "id": "leg_sprain",
          "label": "Shuvljardo vaj dukhado globi e punresko pala bango drom",
          "isRedFlag": false,
          "selfCareTip": "Vazde o punro pe sherand thaj čhiv shudro dikhlo 15 minute. Ma čhiv sasto pharipen pe leste.",
          "guidance": "Hodinisar o globi xanci dive. Te barjol o shuvljarimos vaj nashti te terdsos pe leste, dzha pe rendgeno.",
          "title": "Bangjardo globi e punresko",
          "description": "O globi dukhal thaj si shuvljardo pala so phirdjan banges. Phares terdsos pe leste."
        },
        {
          "id": "leg_cramp",
          "label": "Dukhado grčo andi pulpa e punreski ratjate vaj pala phirimos",
          "isRedFlag": false,
          "selfCareTip": "Inzar o punro thaj lokhes crde e naja karing tute. Masirisar i pulpa thaj pi pani.",
          "guidance": "E grčura butivar aven pala khino, baro kamlimos vaj kana pjes xanci pani.",
          "title": "Grčo andi pulpa",
          "description": "O muskulo e pulpako kidel pes sigo thaj dukhasa, butivar ratjate vaj kana piljan xanci pani."
        },
        {
          "id": "leg_knee_ache",
          "label": "Dukh ko chang kana huljes pe skale vaj pala lungo phirimos",
          "isRedFlag": false,
          "selfCareTip": "Ma besh pe changa thaj ma inger pharo. Phirav lokhe papuče kovle talpasa.",
          "guidance": "O chang khinjol vash vrjama. Vjezhbe save zuraren e muskulura e punreske azhutin.",
          "title": "Dukh ko chang pe skale",
          "description": "Tiro chang dukhal kana huljes pe skale vaj pala lungo beshimos bangjarde changenca."
        },
        {
          "id": "leg_sudden_swelling",
          "label": "Samo jekh punro shuvljardo sigo, tato, lolo thaj but dukhado, vaj nashti te terdsos pe leste",
          "isRedFlag": true,
          "selfCareTip": "Besh mirno thaj ma masirisar i pulpa. Dzha sigo ko doktori vaj ki bolnitsaki sigardiari.",
          "guidance": "Sigo shuvljarimos ko jekh punro shaj te avel phandlo rat (tromboza). Musaj sigo te sastjarel pes.",
          "title": "Sigo shuvljarimos samo ko jekh punro",
          "description": "Samo jekh pulpa shuvljili sigo thaj si tati, loli thaj dukhadi."
        },
        {
          "id": "leg_heel_foot",
          "label": "Dukh ando khur, žila upral o khur vaj ki talpa kana čhives o punro tele",
          "isRedFlag": false,
          "selfCareTip": "Phirav lokhe papuče kovle talpasa thaj ma phir nangepunrengo pe zurali phuv.",
          "guidance": "Avel butivar pala lungo terdimos pe punre vaj saneske papuče. Te si tut diabeto thaj dikhes rana pe talpa, dzha sigo ko doktori.",
          "title": "Dukh ando khur vaj ki talpa",
          "description": "Hatjares pusavimos tela o khur vaj ki talpa ko anglune phirimata sabale, vaj tasavimos upral o khur."
        },
        {
          "id": "leg_hip_thigh",
          "label": "Dukh ando kuko vaj opral ko punro kana phires, inkljes pe skale vaj ushtes katar o skamin",
          "isRedFlag": false,
          "selfCareTip": "Ma ker bare phirimata vaj ma inger pharo thaj čhiv sherand mashkar e changa kana soves pe rig.",
          "guidance": "Dukh ko kuko vaj opral ko punro shaj te avel katar crdindo muskulo vaj klicho. Dzha ko doktori te phires banges vaj ačhel opral jekh kurko.",
          "title": "Dukh ko kuko vaj opral ko punro ko phirimos",
          "description": "Dukhal o kuko pe rig, pasha o por vaj e muskulura opral ko punro kana phires, inkljes pe skale vaj pashljos pe kodija rig."
        }
      ]
    },
    "severity": {
      "mild": {
        "title": "Lokho",
        "description": "Hatjares les, numa keres tire sako-diveske bukja."
      },
      "moderate": {
        "title": "Mashkarutno",
        "description": "Čhinavel tut ki buchi, ko phirimos vaj ko sovibe."
      },
      "severe": {
        "title": "Zuralo",
        "description": "Pashe niso nashti te keres."
      }
    },
    "duration": {
      "today": {
        "label": "Adives vaj idž",
        "hint": "Tela 24 ore"
      },
      "days": {
        "label": "2–7 dive",
        "hint": "2 dzhi 7 dive"
      },
      "weeks": {
        "label": "1–2 kurke",
        "hint": "1 dzhi 2 kurke"
      },
      "chronic": {
        "label": "Maj but katar 2 kurke",
        "hint": "Na nakhel vaj sajekh irinel pes"
      }
    },
    "urgency": {
      "low": {
        "title": "Shaj te arakhes tut khere",
        "intro": "Hodinisar, pi pani thaj dikh sar hatjares tut xanci dive. Te avel maj nasul vaj aven neve semnja, akhar tire doktores vaj 112."
      },
      "medium": {
        "title": "Dzha ko familijako doktori ande akala dive",
        "intro": "Lačhe si te sikaves akava jekhe doktoreske. Te avel maj nasul dzhi tegani, akhar 112."
      },
      "high": {
        "title": "Dzha ko doktori adives",
        "intro": "Ma mukh pe aver dives. Akhar tire doktores vaj dzha adives ki ambulanta. Te avel maj nasul, akhar 112."
      }
    }
  }
};

export const healthCheckTranslations: Record<Lang, HealthCheckWizardLocaleData> = {
  ru: { ...rawTranslations.ru, symptoms: rawTranslations.ru.symptomsByRegion },

  ro: { ...rawTranslations.ro, symptoms: rawTranslations.ro.symptomsByRegion },
  en: { ...rawTranslations.en, symptoms: rawTranslations.en.symptomsByRegion },
  sq: { ...rawTranslations.sq, symptoms: rawTranslations.sq.symptomsByRegion },
  it: { ...rawTranslations.it, symptoms: rawTranslations.it.symptomsByRegion },
  hr: { ...rawTranslations.hr, symptoms: rawTranslations.hr.symptomsByRegion },
  rom: { ...rawTranslations.rom, symptoms: rawTranslations.rom.symptomsByRegion },
};

export interface HealthCheckSummaryExportPrefixes {
  structure3D: string;
  sensation: string;
  triggers: string;
  specialty: string;
  warningNoticeRedFlag: string;
  warningNoticeSafe: string;
}

/**
 * Returns the health-check dictionary for the requested language.
 * Safely falls back to DEFAULT_LANG ("en") if lang is undefined or unrecognized.
 */
export function getHealthCheckTranslations(lang?: Lang): HealthCheckWizardLocaleData {
  const targetLang = lang && lang in healthCheckTranslations ? lang : DEFAULT_LANG;
  return healthCheckTranslations[targetLang] ?? healthCheckTranslations[DEFAULT_LANG];
}

/**
 * Convenience alias for getHealthCheckTranslations.
 */
export function getHealthCheckWizard(lang?: Lang): HealthCheckWizardLocaleData {
  return getHealthCheckTranslations(lang);
}

/**
 * Returns localized prefixes for clipboard and WhatsApp export.
 */
export function getSummaryExportPrefixes(lang?: Lang): HealthCheckSummaryExportPrefixes {
  const d = getHealthCheckTranslations(lang);
  const targetLang = lang && lang in healthCheckTranslations ? lang : DEFAULT_LANG;
  return {
    structure3D: d.ui.structure3DLabel ?? (targetLang === "ro" ? "Structură 3D" : targetLang === "en" ? "3D structure" : targetLang === "sq" ? "Struktura 3D" : targetLang === "hr" ? "3D struktura" : targetLang === "rom" ? "3D struktura" : "Struttura 3D"),
    sensation: d.ui.sensationLabel ?? (targetLang === "ro" ? "Senzație" : targetLang === "en" ? "Sensation" : targetLang === "sq" ? "Ndjesi" : targetLang === "hr" ? "Osjet" : targetLang === "rom" ? "Hatjarimos" : "Sensazione"),
    triggers: d.ui.triggersLabel ?? (targetLang === "ro" ? "Ce agravează" : targetLang === "en" ? "What makes it worse" : targetLang === "sq" ? "Çfarë e përkeqëson" : targetLang === "hr" ? "Što pogoršava" : targetLang === "rom" ? "So kerel maj nasul" : "Cosa lo peggiora"),
    specialty: d.ui.specialtyLabel ?? (targetLang === "ro" ? "Medic specialist" : targetLang === "en" ? "Specialist to see" : targetLang === "sq" ? "Mjeku specialist" : targetLang === "hr" ? "Liječnik specijalist" : targetLang === "rom" ? "Doktori specijalisto" : "Specialista da vedere"),
    warningNoticeRedFlag: d.ui.warningNoticeRedFlag ?? (targetLang === "ro" ? "Au apărut semne de urgență." : targetLang === "en" ? "Emergency warning signs reported." : targetLang === "sq" ? "U raportuan shenja urgjence." : targetLang === "hr" ? "Zabilježeni su znakovi za hitnost." : targetLang === "rom" ? "Sikadile semnja vash sigardiari." : "Segnalati segni di emergenza."),
    warningNoticeSafe: d.ui.warningNoticeSafe ?? (targetLang === "ro" ? "Nu au apărut semne de urgență." : targetLang === "en" ? "No emergency warning signs reported." : targetLang === "sq" ? "Nuk u raportuan shenja urgjence." : targetLang === "hr" ? "Nisu zabilježeni znakovi za hitnost." : targetLang === "rom" ? "Na sikadile semnja vash sigardiari." : "Nessun segno di emergenza segnalato."),
  };
}
