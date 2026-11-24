import type { ComponentType, SVGProps } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { translations } from "@/lib/i18n/translations";
import {
  ActivityIcon,
  AppleIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";

export type HealthTopicContent = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  keyFacts: string[];
  recommendations: { title: string; description: string }[];
  warningSigns: string[];
};

type HealthTopicDictionary = {
  labels: {
    allTopics: string;
    whyItMatters: string;
    practicalSteps: string;
    seekAdviceTitle: string;
    seekAdviceBody: string;
    relatedTopics: string;
    readMore: string;
    disclaimer: string;
  };
  topics: HealthTopicContent[];
};

const dictionaries: Record<Lang, HealthTopicDictionary> = {
  ru: {
    labels: {
      allTopics:
        "Все темы о здоровье",
      whyItMatters:
        "Почему это важно",
      practicalSteps:
        "Что вы можете сделать",
      seekAdviceTitle:
        "Когда обратиться к врачу",
      seekAdviceBody:
        "Обратитесь к врачу, если заметили любой из этих признаков. В экстренной ситуации сразу звоните 112.",
      relatedTopics:
        "Другие руководства",
      readMore:
        "Подробнее",
      disclaimer:
        "Эта информация не является диагнозом. Поговорите с врачом о своем здоровье.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Здоровье сердца",
        description:
          "Простые привычки для здоровья сердца и нормального давления.",
        intro:
          "Сердце качает кровь по всему телу каждую минуту. Забота о нем снижает риск болезней сердца и инсульта. Помогают даже небольшие привычки.",
        keyFacts: [
          "Высокое давление и холестерин годами незаметно перегружают сосуды и заставляют сердце работать с лишней нагрузкой — без всяких симптомов.",
          "Здоровое сердце и нормальное давление дают больше сил, легкое дыхание и снижают риск инсульта.",
          "Меньше соли в еде, быстрая ходьба почти каждый день и регулярное измерение давления защищают сердце.",
        ],
        recommendations: [
          {
            title: "Двигайтесь почти каждый день",
            description:
              "Ходите в быстром темпе или выберите любое занятие по душе. Короткие прогулки тоже идут на пользу.",
          },
          {
            title: "Питайтесь с пользой для сердца",
            description:
              "Ешьте больше овощей, фруктов и цельнозерновых продуктов. Добавляйте меньше соли и реже берите готовые блюда.",
          },
          {
            title: "Следите за показателями",
            description:
              "Регулярно проверяйте давление и холестерин. На ранней стадии проблемы лечатся проще.",
          },
        ],
        warningSigns: [
          "Боль, давление или сжатие в груди, особенно если они отдают в руку, шею или челюсть.",
          "Внезапная одышка, учащенное или неровное сердцебиение.",
          "Постоянная усталость, которая не проходит, или отеки на ногах.",
        ],
      },
      {
        slug: "diabetes",
        title: "Диабет",
        description:
          "От чего растет риск и как держать сахар в крови в норме.",
        intro:
          "Диабет меняет то, как организм усваивает сахар из крови. Диабет 2 типа часто связан с повседневными привычками. Его нередко можно отсрочить или предотвратить, а при правильной помощи — спокойно с ним жить.",
        keyFacts: [
          "При диабете 2 типа сахар остается в крови, а не попадает в клетки, и может годами незаметно повреждать кровеносные сосуды.",
          "Стабильный уровень сахара в крови дает ровную энергию на весь день и защищает глаза, почки, нервы и сердце.",
          "Простые ежедневные привычки — например, половина тарелки овощей и прогулка после еды — снижают риск.",
        ],
        recommendations: [
          {
            title: "Сбалансируйте тарелку",
            description:
              "Наполните половину тарелки овощами. Выбирайте цельнозерновой хлеб, рис и макароны.",
          },
          {
            title: "Больше двигайтесь",
            description:
              "Регулярное движение помогает организму лучше усваивать сахар из крови.",
          },
          {
            title: "Сдайте анализ",
            description:
              "Если у близких есть диабет или у вас есть факторы риска, попросите врача назначить простой анализ крови.",
          },
        ],
        warningSigns: [
          "Сильная жажда или частое мочеиспускание, чаще обычного.",
          "Потеря веса без причины или постоянная усталость.",
          "Затуманенное зрение или порезы, которые медленно заживают.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Здоровое питание",
        description:
          "Простая и доступная еда на каждый день.",
        intro:
          "Здоровое питание не обязано быть сложным или дорогим. Несколько простых правил на каждый день дадут организму все необходимое.",
        keyFacts: [
          "Клетчатка из овощей и цельнозерновых продуктов помогает держать сахар в крови и давление в норме.",
          "Простая домашняя еда дает ровную энергию в течение дня и избавляет от сонливости после еды.",
          "Сезонные овощи, фасоль и чечевица стоят недорого, а вода вместо сладких напитков сразу приносит пользу.",
        ],
        recommendations: [
          {
            title: "Больше овощей и фруктов",
            description:
              "Добавляйте овощи или фрукты почти к каждому приему пищи. Подойдут и свежие, и замороженные.",
          },
          {
            title: "Готовьте дома",
            description:
              "По возможности выбирайте цельнозерновые продукты и домашнюю еду вместо готовых полуфабрикатов.",
          },
          {
            title: "Пейте воду",
            description:
              "Пусть вода будет вашим главным напитком. Сладкие напитки и соки лучше ограничить.",
          },
        ],
        warningSigns: [
          "Быстрая потеря или набор веса без видимой причины.",
          "Проблемы с желудком, которые не проходят, или потеря аппетита.",
          "Сильная слабость, головокружение или усталость, даже если вы нормально едите.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Физическая активность",
        description:
          "Простые способы двигаться больше при любой подготовке.",
        intro:
          "Больше двигаться — одно из лучших решений для тела и настроения. Спортзал не нужен. Важно любое движение каждый день.",
        keyFacts: [
          "Движение улучшает кровообращение, укрепляет сердце и мышцы и помогает клеткам использовать сахар из крови для энергии.",
          "Регулярное движение дает больше сил, крепкий сон, лучшее равновесие и подвижность.",
          "Спортзал не нужен: вставайте со стула каждый час и гуляйте по 15–30 минут почти каждый день.",
        ],
        recommendations: [
          {
            title: "Начните с малого",
            description:
              "Начните с коротких прогулок или любого занятия по душе. Каждую неделю добавляйте понемногу.",
          },
          {
            title: "Двигайтесь почти каждый день",
            description:
              "Небольшая активность почти каждый день полезнее, чем редкая тяжелая тренировка.",
          },
          {
            title: "Укрепляйте мышцы",
            description:
              "Давайте нагрузку мышцам: носите сумки из магазина, работайте в саду или делайте приседания.",
          },
        ],
        warningSigns: [
          "Боль в груди, головокружение или сильная одышка при нагрузке.",
          "Боль в суставах или отек, которые усиливаются при движении.",
          "Предобморочное состояние или перебои в сердцебиении при движении.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Психическое здоровье",
        description:
          "Как беречь душевное равновесие и когда просить о помощи.",
        intro:
          "Психическое здоровье — важная часть общего здоровья. У каждого бывают хорошие и трудные периоды. Просить о помощи, когда тяжело, — нормально.",
        keyFacts: [
          "Затяжной стресс держит организм в напряжении, напрягает мышцы, учащает пульс и портит сон.",
          "Забота о душевном состоянии помогает лучше спать, легче сосредоточиться днем и сохранять тепло в общении с близкими.",
          "Медленное глубокое дыхание, регулярный сон и откровенный разговор с близким человеком быстро снимают напряжение.",
        ],
        recommendations: [
          {
            title: "Общайтесь с близкими",
            description:
              "Проводите время с людьми, которым доверяете. Поддержка близких бережет психику.",
          },
          {
            title: "Берегите режим дня",
            description:
              "Сон, движение и время на свежем воздухе помогают вам чувствовать себя лучше.",
          },
          {
            title: "Просите о помощи",
            description:
              "Если становится слишком тяжело, поговорите с близким человеком или с врачом.",
          },
        ],
        warningSigns: [
          "Чувство подавленности, беспокойства или безнадежности в течение нескольких недель.",
          "Становится трудно справляться с повседневными делами, работой или общением.",
          "Мысли о том, чтобы причинить себе вред. Если они появились, немедленно обратитесь за помощью.",
        ],
      },
      {
        slug: "smoking",
        title: "Курение и алкоголь",
        description:
          "Как бросить курить, пить меньше и кто может помочь.",
        intro:
          "Курение и алкоголь вредят сердцу, лёгким и печени и повышают риск рака. Важен каждый шаг: организм быстро начинает восстанавливаться, когда вы бросаете или пьёте меньше.",
        keyFacts: [
          "Уже через несколько часов после последней сигареты кислорода в крови становится больше, сосуды расслабляются, а лёгкие начинают очищаться.",
          "Чем меньше алкоголя вы пьёте, тем лучше для печени, сердца и давления. Полностью безопасного количества нет.",
          "Если выбрать день отказа, переждать 3 минуты тяги и попросить поддержки у врача, шансы на успех удваиваются.",
        ],
        recommendations: [
          {
            title: "Выберите день",
            description:
              "Выберите день, когда бросаете курить или начинаете пить меньше. Заранее решите, что будете делать, когда придёт тяга.",
          },
          {
            title: "Пейте меньше",
            description:
              "Оставляйте несколько дней в неделю без алкоголя. Не пейте совсем при беременности, за рулём и с лекарствами, которые несовместимы с алкоголем.",
          },
          {
            title: "Попросите помощи",
            description:
              "Семейный врач поможет бросить курить или пить. Если сорвались, не сдавайтесь: попробуйте снова.",
          },
        ],
        warningSigns: [
          "Кашель с кровью, боль в груди, которая не проходит, или одышка всё чаще.",
          "Кашель, который не проходит, или изменение привычного кашля.",
          "Вы не можете перестать пить, вам нужен алкоголь по утрам, или вас трясёт и бросает в пот, когда вы не пьёте. Резкий отказ может быть опасен: обратитесь к врачу.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Проверка здоровья",
        description:
          "Анализы и осмотры, которые находят болезнь раньше симптомов.",
        intro:
          "Профилактическая проверка ищет первые признаки болезни еще до того, как вы почувствуете недомогание. Ранние проблемы лечить намного проще.",
        keyFacts: [
          "Многие болезни — высокое давление, диабет или ранние стадии рака — долго развиваются незаметно, пока ничего не болит.",
          "Даже если вы каждый день чувствуете себя хорошо, плановый осмотр дает спокойствие и выявляет изменения, пока лечение простое.",
          "Узнайте у семейного врача, какие бесплатные осмотры и обследования по возрасту вы можете пройти в этом году.",
        ],
        recommendations: [
          {
            title: "Узнайте, что вам подходит",
            description:
              "Спросите врача, какие обследования подходят для вашего возраста и состояния здоровья.",
          },
          {
            title: "Проходите плановые осмотры",
            description:
              "Приходите по приглашениям на обследование и не пропускайте регулярные осмотры.",
          },
          {
            title: "Расскажите о болезнях в семье",
            description:
              "Сообщите врачу, какими болезнями болели ваши близкие. Это поможет выбрать нужные анализы.",
          },
        ],
        warningSigns: [
          "Новое уплотнение, необычное кровотечение или родинка, которая меняет форму или цвет.",
          "Любой новый симптом, который не проходит без понятной причины.",
          "Результат анализа, после которого просят прийти повторно. Не откладывайте.",
        ],
      },
      {
        slug: "womens-health",
        title: "Беременность",
        description:
          "Как заботиться о себе и малыше: от первого теста до родов.",
        intro:
          "Беременность длится около 40 недель. Регулярные осмотры, несколько полезных привычек и своевременная помощь защищают вас и малыша.",
        keyFacts: [
          "Фолиевая кислота до беременности и в первые 3 месяца снижает риск некоторых пороков развития у ребёнка.",
          "Регулярные осмотры проверяют давление, анализы и рост малыша, даже когда вы хорошо себя чувствуете.",
          "Алкоголь и курение попадают к ребёнку через кровь. Безопасного количества алкоголя при беременности нет.",
        ],
        recommendations: [
          {
            title: "Рано обратитесь к врачу",
            description:
              "Когда узнаете о беременности, обратитесь к семейному врачу или гинекологу.",
          },
          {
            title: "Принимайте фолиевую кислоту",
            description:
              "Спросите врача, какую дозу принимать и как долго. Не принимайте другие лекарства, не спросив его.",
          },
          {
            title: "Берегите себя",
            description:
              "Питайтесь разнообразно, отдыхайте, не пейте алкоголь и не курите. Попросите помощи, если трудно остановиться.",
          },
        ],
        warningSigns: [
          "Кровотечение из влагалища или сильная боль в животе.",
          "Сильная головная боль, нечёткое зрение или внезапный отёк лица и рук.",
          "Малыш шевелится меньше обычного или из влагалища подтекает жидкость.",
        ],
      },
    ],
  },

  en: {
    labels: {
      allTopics:
        "All health topics",
      whyItMatters:
        "Why it matters",
      practicalSteps:
        "What you can do",
      seekAdviceTitle:
        "When to see a doctor",
      seekAdviceBody:
        "See a doctor if you notice any of these signs. In an emergency, call 112 straight away.",
      relatedTopics:
        "Other guides",
      readMore:
        "Read more",
      disclaimer:
        "This information is not a diagnosis. Talk to a doctor about your own health.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Heart health",
        description:
          "Everyday habits for a healthy heart and blood pressure.",
        intro:
          "Your heart pumps blood around your body every minute of the day. Looking after it lowers your risk of heart disease and stroke. Most of the habits that help are small.",
        keyFacts: [
          "High blood pressure and cholesterol gradually strain your arteries and make your heart work harder for years without signs.",
          "A healthy heart and normal blood pressure give you better stamina, steadier breathing and lower risk of stroke.",
          "Using less salt, walking briskly most days and checking your blood pressure regularly protect your heart.",
        ],
        recommendations: [
          {
            title: "Move most days",
            description:
              "Walk briskly or do any activity you like. Short walks count too.",
          },
          {
            title: "Eat for your heart",
            description:
              "Eat more vegetables, fruit and whole grains. Use less salt and eat fewer ready-made foods.",
          },
          {
            title: "Check your numbers",
            description:
              "Have your blood pressure and cholesterol checked. Problems are easier to treat when found early.",
          },
        ],
        warningSigns: [
          "Chest pain, pressure or tightness, especially if it spreads to your arm, neck or jaw.",
          "Sudden shortness of breath, or a fast or irregular heartbeat.",
          "Tiredness that does not go away, or swollen legs.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabetes",
        description:
          "What raises your risk and how to keep your blood sugar steady.",
        intro:
          "Diabetes affects how your body handles sugar in the blood. Type 2 diabetes is often linked to daily habits. You can often delay or prevent it, and with the right help you can live well with it.",
        keyFacts: [
          "In type 2 diabetes, sugar stays in the blood instead of entering your cells, and can gradually harm blood vessels for years.",
          "Keeping your blood sugar steady gives you even energy through the day and protects your eyes, kidneys, nerves and heart.",
          "Small daily habits like filling half your plate with vegetables and walking after meals lower your risk.",
        ],
        recommendations: [
          {
            title: "Balance your plate",
            description:
              "Fill half your plate with vegetables. Choose wholegrain bread, rice and pasta.",
          },
          {
            title: "Stay active",
            description:
              "Moving regularly helps your body use blood sugar better.",
          },
          {
            title: "Get checked",
            description:
              "If diabetes runs in your family or you have other risk factors, ask your doctor for a simple blood test.",
          },
        ],
        warningSigns: [
          "Being very thirsty or needing to pee more often than usual.",
          "Losing weight without trying, or feeling tired all the time.",
          "Blurred vision, or cuts that heal slowly.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Healthy eating",
        description:
          "Low-cost, simple food choices for every day.",
        intro:
          "Eating well does not have to be hard or expensive. A few simple rules, followed most days, give your body what it needs.",
        keyFacts: [
          "Fiber from vegetables and whole grains keeps your blood sugar and blood pressure steady.",
          "Simple home-cooked food gives you steady energy through the day and prevents tiredness after meals.",
          "Seasonal vegetables, beans and lentils are cheap, and drinking water instead of sugary drinks helps straight away.",
        ],
        recommendations: [
          {
            title: "More vegetables and fruit",
            description:
              "Add vegetables or fruit to most meals. Fresh or frozen are both fine.",
          },
          {
            title: "Cook at home",
            description:
              "Choose whole grains and home-cooked meals over ready-made food when you can.",
          },
          {
            title: "Drink water",
            description:
              "Make water your main drink. Limit sugary drinks and fruit juice.",
          },
        ],
        warningSigns: [
          "Losing or gaining weight quickly without trying.",
          "Stomach problems that do not go away, or loss of appetite.",
          "Feeling faint, weak or very tired even though you eat.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Physical activity",
        description:
          "Easy ways to move more, whatever your fitness.",
        intro:
          "Moving more is one of the best things you can do for your body and mind. You do not need a gym. Everyday movement counts.",
        keyFacts: [
          "Movement gets your blood flowing, strengthens your heart and muscles, and helps your cells use blood sugar for energy.",
          "Moving regularly gives you steadier energy, deeper sleep at night, and better balance and mobility.",
          "You do not need a gym: stand up every hour and take a 15–30 minute walk on most days.",
        ],
        recommendations: [
          {
            title: "Start small",
            description:
              "Begin with short walks or something you enjoy. Do a little more each week.",
          },
          {
            title: "Move most days",
            description:
              "A little movement most days does more than a hard workout now and then.",
          },
          {
            title: "Build strength",
            description:
              "Do things that work your muscles, like carrying bags, gardening or squats.",
          },
        ],
        warningSigns: [
          "Chest pain, dizziness or unusual breathlessness when you are active.",
          "Joint pain or swelling that gets worse when you move.",
          "Feeling faint, or an irregular heartbeat, when you exercise.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Mental health",
        description:
          "Look after your mind and know when to ask for help.",
        intro:
          "Your mental health is part of your health. Everyone has good and bad times. Asking for help when you need it is normal.",
        keyFacts: [
          "Long-term stress keeps stress hormones high, tightening your muscles, raising your pulse and disturbing your sleep.",
          "Looking after your mind helps you sleep better, focus during the day and stay connected with the people around you.",
          "Slow breathing exercises, regular sleep hours and talking openly with someone you trust ease tension quickly.",
        ],
        recommendations: [
          {
            title: "Stay in touch",
            description:
              "Spend time with people you trust. Being close to others protects your mind.",
          },
          {
            title: "Look after the basics",
            description:
              "Sleep, moving your body and time outdoors all help you feel better.",
          },
          {
            title: "Ask for help",
            description:
              "If things feel too much, talk to someone you trust or to a doctor.",
          },
        ],
        warningSigns: [
          "Feeling low, worried or hopeless for weeks.",
          "Finding it hard to cope with daily life, work or the people close to you.",
          "Thoughts of hurting yourself. If this happens, get help straight away.",
        ],
      },
      {
        slug: "smoking",
        title: "Smoking and alcohol",
        description:
          "How to stop smoking, drink less and who can help you.",
        intro:
          "Smoking and alcohol harm your heart, lungs and liver and raise the risk of cancer. Every step counts: your body starts to recover quickly once you stop or cut down.",
        keyFacts: [
          "Within hours of your last cigarette, oxygen levels rise, blood vessels relax and your lungs begin clearing themselves.",
          "The less alcohol you drink, the better for your liver, heart and blood pressure. No amount is completely risk-free.",
          "Setting a quit date, waiting out 3-minute cravings and asking your doctor for support double your chances of stopping.",
        ],
        recommendations: [
          {
            title: "Pick a date",
            description:
              "Choose the day you stop smoking or start drinking less. Plan what you will do when the craving comes.",
          },
          {
            title: "Drink less",
            description:
              "Keep several alcohol-free days each week. Do not drink at all in pregnancy, when driving or with medicines that do not mix with alcohol.",
          },
          {
            title: "Get help",
            description:
              "Your family doctor can help you stop smoking or drinking. If you smoke or drink again, do not give up: try again.",
          },
        ],
        warningSigns: [
          "Coughing up blood, chest pain that does not go away, or getting more and more out of breath.",
          "A cough that will not go away, or a change in a cough you have had for a long time.",
          "You cannot stop drinking, you need alcohol in the morning, or you shake and sweat when you do not drink. Stopping suddenly can be dangerous: see a doctor.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Health check-ups",
        description:
          "Tests that catch health problems early, before you feel ill.",
        intro:
          "Screening looks for early signs of illness before you notice anything wrong. Problems found early are often easier to treat.",
        keyFacts: [
          "Many conditions like high blood pressure, diabetes or early cancers start without noticeable symptoms long before any pain appears.",
          "Even when you feel well every day, a routine check gives you peace of mind and catches changes while treatment is simple.",
          "Ask your family doctor which free check-ups and age-appropriate screening tests you can book this year.",
        ],
        recommendations: [
          {
            title: "Ask what you need",
            description:
              "Ask your doctor which checks are right for your age and history.",
          },
          {
            title: "Go to your checks",
            description:
              "Reply to screening invitations and keep up with your regular check-ups.",
          },
          {
            title: "Share your family history",
            description:
              "Tell your doctor about illnesses in your family. It helps decide which tests you need.",
          },
        ],
        warningSigns: [
          "A new lump, unusual bleeding, or a mole that changes shape or colour.",
          "Any new symptom that does not go away and has no clear cause.",
          "A screening result that asks you to come back. Do not wait.",
        ],
      },
      {
        slug: "womens-health",
        title: "Pregnancy",
        description:
          "How to look after yourself and your baby, from the first test to the birth.",
        intro:
          "Pregnancy lasts about 40 weeks. Regular check-ups, a few healthy habits and asking for help early protect you and your baby.",
        keyFacts: [
          "Folic acid, taken before pregnancy and in the first 3 months, lowers the risk of some birth defects.",
          "Regular check-ups look at your blood pressure, your tests and how the baby is growing, even when you feel well.",
          "Alcohol and smoking reach the baby through the blood. There is no safe amount of alcohol in pregnancy.",
        ],
        recommendations: [
          {
            title: "See a doctor early",
            description:
              "When you find out you are pregnant, go to your family doctor or a gynaecologist.",
          },
          {
            title: "Take folic acid",
            description:
              "Ask your doctor what dose to take and for how long. Do not take other medicines without asking.",
          },
          {
            title: "Look after yourself",
            description:
              "Eat a varied diet, rest, and do not drink alcohol or smoke. Ask for help if it is hard to stop.",
          },
        ],
        warningSigns: [
          "Bleeding from the vagina or strong pain in your belly.",
          "A bad headache, blurred vision or sudden swelling of your face and hands.",
          "The baby is moving less than usual, or fluid is leaking from your vagina.",
        ],
      },
    ],
  },
  ro: {
    labels: {
      allTopics:
        "Toate ghidurile de sănătate",
      whyItMatters:
        "De ce contează",
      practicalSteps:
        "Ce poți face",
      seekAdviceTitle:
        "Când mergi la medic",
      seekAdviceBody:
        "Mergi la medic dacă observi unul dintre semnele de mai jos. Dacă e o urgență, sună imediat la 112.",
      relatedTopics:
        "Alte ghiduri",
      readMore:
        "Citește mai mult",
      disclaimer:
        "Aceste informații nu sunt un diagnostic. Pentru sănătatea ta, vorbește cu medicul.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Sănătatea inimii",
        description:
          "Obiceiuri simple pentru o inimă sănătoasă și o tensiune bună.",
        intro:
          "Inima pompează sângele prin corp în fiecare minut. Dacă ai grijă de ea, scade riscul de boli de inimă și de accident vascular.",
        keyFacts: [
          "Tensiunea mare și colesterolul crescut apasă în tăcere pe pereții arterelor și obosesc inima fără să dea semne.",
          "O inimă puternică și o tensiune bună îți dau rezistență la efort, respirație ușoară și risc mai mic de accident vascular.",
          "Mai puțină sare în mâncare, mersul pe jos în fiecare zi și măsurarea regulată a tensiunii îți protejează inima.",
        ],
        recommendations: [
          {
            title: "Mișcă-te des",
            description:
              "Mergi pe jos în pas vioi cât de des poți.",
          },
          {
            title: "Mănâncă sănătos",
            description:
              "Pune în farfurie mai multe legume, fructe și cereale integrale.",
          },
          {
            title: "Fă-ți controalele",
            description:
              "Verifică regulat tensiunea și colesterolul.",
          },
        ],
        warningSigns: [
          "Durere sau apăsare în piept, mai ales dacă se întinde spre braț sau maxilar.",
          "Lipsă bruscă de aer sau bătăi neregulate ale inimii.",
          "Oboseală care nu trece sau picioare umflate.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabet",
        description:
          "Ce crește riscul și cum ții zahărul din sânge sub control.",
        intro:
          "Diabetul schimbă felul în care corpul folosește zahărul din sânge. Cu ajutorul potrivit, poate fi prevenit sau ținut sub control.",
        keyFacts: [
          "În diabetul de tip 2, zahărul rămâne în sânge în loc să intre în celule și poate afecta vasele de sânge ani de zile fără semne clare.",
          "Când ții zahărul din sânge în echilibru, ai energie constantă peste zi și îți protejezi ochii, rinichii, nervii și inima.",
          "Schimbările mici făcute zi de zi, cum ar fi jumătate de farfurie cu legume și o plimbare după masă, scad riscul.",
        ],
        recommendations: [
          {
            title: "Echilibrează farfuria",
            description:
              "Umple jumătate din farfurie cu legume. Alege pâine și cereale integrale.",
          },
          {
            title: "Mișcă-te",
            description:
              "Mișcarea regulată ajută corpul să folosească mai bine zahărul din sânge.",
          },
          {
            title: "Fă analize",
            description:
              "Dacă ai factori de risc, cere medicului o analiză de sânge.",
          },
        ],
        warningSigns: [
          "Sete mare sau urinat des.",
          "Slăbești fără să vrei sau ești mereu obosit.",
          "Vezi încețoșat sau rănile se vindecă greu.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Alimentație sănătoasă",
        description:
          "Mâncare simplă și ieftină, pentru fiecare zi.",
        intro:
          "Ca să mănânci sănătos, nu ai nevoie de rețete grele sau scumpe. Câteva reguli simple, respectate zilnic, te ajută mult.",
        keyFacts: [
          "Fibrele din legume și cereale integrale țin zahărul din sânge și tensiunea în limite normale.",
          "Mâncarea gătită simplu îți dă energie peste zi și te ferește de oboseala de după masă.",
          "Legumele de sezon, fasolea și lintea sunt ieftine, iar apa în loc de sucuri dulci ajută imediat.",
        ],
        recommendations: [
          {
            title: "Mai multe legume și fructe",
            description:
              "Pune legume sau fructe la cele mai multe mese.",
          },
          {
            title: "Gătește acasă",
            description:
              "Alege cereale integrale și mâncare gătită acasă.",
          },
          {
            title: "Bea apă",
            description:
              "Bea mai ales apă și cât mai puține sucuri dulci.",
          },
        ],
        warningSigns: [
          "Te îngrași sau slăbești mult în scurt timp.",
          "Probleme cu digestia care nu trec sau lipsa poftei de mâncare.",
          "Slăbiciune, amețeală sau oboseală neobișnuită.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Activitate fizică",
        description:
          "Cum te miști mai mult, chiar dacă nu ai făcut sport.",
        intro:
          "Mișcarea regulată face bine corpului și minții. Nu ai nevoie de sală. Contează și mersul pe jos.",
        keyFacts: [
          "Mișcarea pune sângele în circulație, întărește inima și mușchii și ajută celulele să folosească zahărul din sânge.",
          "Când te miști regulat, ai mai multă energie, dormi mai bine noaptea și îți păstrezi echilibrul și mobilitatea.",
          "Nu ai nevoie de sală: ridică-te de pe scaun la fiecare oră și mergi pe jos 15–30 de minute în majoritatea zilelor.",
        ],
        recommendations: [
          {
            title: "Începe ușor",
            description:
              "Pornește cu plimbări scurte. Mergi puțin mai mult în fiecare săptămână.",
          },
          {
            title: "Mișcă-te regulat",
            description:
              "Puțină mișcare în fiecare zi ajută mai mult decât un efort mare din când în când.",
          },
          {
            title: "Lucrează mușchii",
            description:
              "Cară sacoșe, lucrează în grădină sau fă genuflexiuni.",
          },
        ],
        warningSigns: [
          "Durere în piept, amețeală sau lipsă de aer când faci efort.",
          "Dureri de încheieturi care se agravează când te miști.",
          "Simți că leșini sau inima bate neregulat în timpul exercițiilor.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Echilibru emoțional",
        description:
          "Ai grijă de mintea ta și cere ajutor când ai nevoie.",
        intro:
          "Sănătatea minții face parte din sănătatea ta. E normal să ai și perioade grele.",
        keyFacts: [
          "Stresul prelungit ține corpul în încordare, grăbește bătăile inimii, strânge mușchii și tulbură somnul.",
          "Când ai grijă de echilibrul emoțional, dormi mai liniștit, te concentrezi mai ușor și faci față mai bine grijilor.",
          "Respirația rară și adâncă, programul regulat de somn și o discuție deschisă cu cineva apropiat liniștesc corpul.",
        ],
        recommendations: [
          {
            title: "Păstrează legătura",
            description:
              "Vorbește des cu oamenii în care ai încredere.",
          },
          {
            title: "Ai grijă de lucrurile de bază",
            description:
              "Somnul, mișcarea și timpul petrecut afară te ajută.",
          },
          {
            title: "Cere ajutor",
            description:
              "Vorbește cu cineva de încredere sau cu un medic.",
          },
        ],
        warningSigns: [
          "Tristețe, griji sau lipsă de speranță care țin mai multe săptămâni.",
          "Nu mai faci față la muncă, acasă sau în relațiile cu ceilalți.",
          "Dacă te gândești să îți faci rău, cere ajutor imediat.",
        ],
      },
      {
        slug: "smoking",
        title: "Fumat și alcool",
        description:
          "Cum renunți la țigări, cum bei mai puțin și cine te ajută.",
        intro:
          "Fumatul și alcoolul fac rău inimii, plămânilor, ficatului și cresc riscul de cancer. Orice pas contează: corpul începe repede să se refacă după ce te oprești sau bei mai puțin.",
        keyFacts: [
          "Din primele ore după ultima țigară, nivelul de oxigen din sânge urcă, vasele se relaxează și plămânii încep să se curețe.",
          "Cu cât bei mai puțin alcool, cu atât e mai bine pentru ficat, inimă și tensiune. Nu există o cantitate fără niciun risc.",
          "Dacă îți alegi o zi de oprire, lași să treacă cele 3 minute de poftă și ceri sprijinul medicului, îți dublezi șansele de reușită.",
        ],
        recommendations: [
          {
            title: "Alege o zi",
            description:
              "Alege ziua în care te lași de fumat sau în care începi să bei mai puțin. Gândește-te dinainte ce faci când ai poftă.",
          },
          {
            title: "Bea mai puțin",
            description:
              "Păstrează câteva zile pe săptămână fără alcool. Nu bea deloc în sarcină, când conduci sau când iei medicamente care nu se potrivesc cu alcoolul.",
          },
          {
            title: "Cere ajutor",
            description:
              "Medicul de familie te poate ajuta să renunți la fumat sau la băutură. Dacă ai fumat sau ai băut din nou, nu renunța: încearcă iar.",
          },
        ],
        warningSigns: [
          "Tuși cu sânge, ai durere în piept care nu trece sau rămâi tot mai des fără aer.",
          "Tuse care nu trece sau tuse obișnuită care se schimbă.",
          "Nu te poți opri din băut, ai nevoie de alcool dimineața sau tremuri și transpiri când nu bei. Oprirea bruscă poate fi periculoasă: mergi la medic.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Controale de sănătate",
        description:
          "Controale care găsesc bolile devreme, înainte să ai semne.",
        intro:
          "Screeningul caută primele semne ale unei boli, chiar dacă te simți bine.",
        keyFacts: [
          "Multe afecțiuni, cum ar fi tensiunea mare, diabetul sau unele forme de cancer, încep în tăcere în corp, cu mult înainte să doară.",
          "Chiar când te simți în putere zi de zi, un control de rutină îți dă liniște și descoperă schimbările când se tratează ușor.",
          "Cere medicului de familie analizele gratuite și controalele decontate de CNAS potrivite pentru vârsta ta.",
        ],
        recommendations: [
          {
            title: "Întreabă ce îți trebuie",
            description:
              "Întreabă medicul de familie ce controale sunt potrivite pentru tine.",
          },
          {
            title: "Mergi la controale",
            description:
              "Mergi când ești chemat la screening și la controalele obișnuite.",
          },
          {
            title: "Spune ce boli sunt în familie",
            description:
              "Spune-i medicului ce boli au avut părinții, frații sau bunicii.",
          },
        ],
        warningSigns: [
          "Un nodul nou, o sângerare neobișnuită sau o aluniță care își schimbă forma.",
          "Orice semn nou care nu trece și nu știi de unde vine.",
          "Un rezultat la screening după care trebuie să mai faci analize.",
        ],
      },
      {
        slug: "womens-health",
        title: "Sarcina",
        description:
          "Cum ai grijă de tine și de copil, de la primul test până la naștere.",
        intro:
          "Sarcina durează cam 40 de săptămâni. Controalele regulate, câteva obiceiuri sănătoase și ajutorul cerut la timp te protejează pe tine și pe copil.",
        keyFacts: [
          "Acidul folic, luat înainte de sarcină și în primele 3 luni, scade riscul unor malformații la copil.",
          "Controalele regulate la medic verifică tensiunea, analizele și creșterea copilului, chiar dacă te simți bine.",
          "Alcoolul și fumatul ajung la copil prin sânge. Nu există o cantitate sigură de alcool în sarcină.",
        ],
        recommendations: [
          {
            title: "Mergi devreme la medic",
            description:
              "Când afli că ești însărcinată, mergi la medicul de familie sau la ginecolog. Consultațiile în sarcină sunt gratuite, chiar și fără asigurare.",
          },
          {
            title: "Ia acid folic",
            description:
              "Întreabă medicul ce doză să iei și cât timp. Nu lua alte medicamente fără să-l întrebi.",
          },
          {
            title: "Ai grijă de tine",
            description:
              "Mănâncă variat, odihnește-te și nu bea alcool și nu fuma. Cere ajutor dacă îți este greu să te oprești.",
          },
        ],
        warningSigns: [
          "Sângerare din vagin sau durere puternică de burtă.",
          "Durere de cap puternică, vedere încețoșată sau umflarea bruscă a feței și a mâinilor.",
          "Copilul se mișcă mai puțin decât de obicei sau îți curge lichid din vagin.",
        ],
      },
    ],
  },
  sq: {
    labels: {
      allTopics:
        "Të gjitha temat e shëndetit",
      whyItMatters:
        "Pse ka rëndësi",
      practicalSteps:
        "Çfarë mund të bësh",
      seekAdviceTitle:
        "Kur të shkosh te mjeku",
      seekAdviceBody:
        "Shko te mjeku nëse vë re një nga këto shenja. Në rast urgjence, telefono menjëherë 112.",
      relatedTopics:
        "Tema të tjera",
      readMore:
        "Lexo më shumë",
      disclaimer:
        "Ky informacion nuk është diagnozë. Për shëndetin tënd, fol me mjekun.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Shëndeti i zemrës",
        description:
          "Zakone të thjeshta për një zemër të shëndetshme dhe tension normal.",
        intro:
          "Zemra pompon gjakun në trup çdo minutë. Kur kujdesesh për të, ulet rreziku i sëmundjeve të zemrës dhe i goditjes në tru.",
        keyFacts: [
          "Tensioni i lartë dhe kolesteroli i shtuar rëndojnë në heshtje muret e arterieve dhe e lodhin zemrën pa dhënë shenja.",
          "Një zemër e fortë dhe tension normal të japin më shumë qëndrueshmëri, frymëmarrje të lehtë dhe rrezik më të ulët për goditje në tru.",
          "Më pak kripë në ushqim, ecja e përditshme dhe matja e rregullt e tensionit e mbrojnë zemrën.",
        ],
        recommendations: [
          {
            title: "Lëviz shpesh",
            description:
              "Ec me hap të shpejtë sa më shpesh që mundesh.",
          },
          {
            title: "Ha shëndetshëm",
            description:
              "Ha më shumë perime, fruta dhe drithëra integrale.",
          },
          {
            title: "Kontrollo vlerat",
            description:
              "Mat rregullisht tensionin dhe kontrollo kolesterolin.",
          },
        ],
        warningSigns: [
          "Dhimbje ose shtrëngim në gjoks, sidomos nëse shtrihet në krah ose në nofull.",
          "Mungesë e papritur ajri ose rrahje të parregullta të zemrës.",
          "Lodhje që nuk kalon ose këmbë të ënjtura.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabeti",
        description:
          "Çfarë e rrit rrezikun dhe si ta mbash sheqerin nën kontroll.",
        intro:
          "Diabeti ndikon në mënyrën si trupi përdor sheqerin në gjak. Me ndihmën e duhur, mund të parandalohet ose të mbahet nën kontroll.",
        keyFacts: [
          "Te diabeti i tipit 2, sheqeri mbetet në gjak në vend që të hyjë në qeliza dhe mund të dëmtojë enët e gjakut për vite pa shenja të qarta.",
          "Kur e mban sheqerin në ekuilibër, ke energji të qëndrueshme gjatë ditës dhe mbron sytë, veshkat, nervat dhe zemrën.",
          "Ndryshimet e vogla çdo ditë, si gjysma e pjatës me perime dhe një shëtitje pas vaktit, e ulin rrezikun.",
        ],
        recommendations: [
          {
            title: "Balanco pjatën",
            description:
              "Mbush gjysmën e pjatës me perime dhe zgjidh drithëra integrale.",
          },
          {
            title: "Lëviz rregullisht",
            description:
              "Lëvizja e rregullt e ndihmon trupin të përdorë më mirë sheqerin.",
          },
          {
            title: "Bëj analizat",
            description:
              "Nëse ke faktorë rreziku, kërkoji mjekut një analizë gjaku.",
          },
        ],
        warningSigns: [
          "Etje e madhe ose urinim i shpeshtë.",
          "Humb peshë pa dashur ose je gjithmonë i lodhur.",
          "Shikim i turbullt ose plagë që shërohen ngadalë.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Ushqyerja e shëndetshme",
        description:
          "Ushqime të shëndetshme dhe të lira për çdo ditë.",
        intro:
          "Të hash mirë nuk është e vështirë as e shtrenjtë. Disa rregulla të thjeshta, çdo ditë, të ndihmojnë shumë.",
        keyFacts: [
          "Fibrat nga perimet dhe drithërat integrale mbajnë sheqerin në gjak dhe tensionin në kufij normalë.",
          "Ushqimi i gatuar thjesht të jep energji gjatë ditës dhe shmang lodhjen pas ngrënies.",
          "Perimet e stinës, fasulet dhe thjerrëzat janë të lira, ndërsa uji në vend të pijeve me sheqer ndihmon menjëherë.",
        ],
        recommendations: [
          {
            title: "Më shumë perime dhe fruta",
            description:
              "Shto perime ose fruta në shumicën e vakteve.",
          },
          {
            title: "Gatuaj në shtëpi",
            description:
              "Zgjidh drithëra integrale dhe ushqime të gatuara në shtëpi.",
          },
          {
            title: "Pi ujë",
            description:
              "Pi kryesisht ujë dhe sa më pak pije të ëmbla.",
          },
        ],
        warningSigns: [
          "Shton ose humb shumë peshë në pak kohë.",
          "Probleme me tretjen që nuk kalojnë ose s'ke oreks.",
          "Dobësi, marramendje ose lodhje e pazakontë.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Aktiviteti fizik",
        description:
          "Mënyra të thjeshta për të lëvizur më shumë.",
        intro:
          "Lëvizja e rregullt i bën mirë trupit dhe mendjes. Nuk të duhet palestër. Edhe ecja ka vlerë.",
        keyFacts: [
          "Lëvizja vë gjakun në qarkullim, forcon zemrën dhe muskujt dhe ndihmon qelizat të përdorin sheqerin në gjak.",
          "Kur lëviz rregullisht, ke më shumë energji, fle më mirë natën dhe ruan ekuilibrin dhe lëvizshmërinë.",
          "Nuk të duhet palestër: çohu nga karrigia çdo orë dhe ec 15–30 minuta në shumicën e ditëve.",
        ],
        recommendations: [
          {
            title: "Fillo ngadalë",
            description:
              "Nis me ecje të shkurtra dhe shto pak nga pak.",
          },
          {
            title: "Lëviz çdo ditë",
            description:
              "Pak lëvizje çdo ditë vlen më shumë se një përpjekje e madhe herë pas here.",
          },
          {
            title: "Forco muskujt",
            description:
              "Mbaj çanta, puno në kopsht ose bëj mbledhje këmbësh.",
          },
        ],
        warningSigns: [
          "Dhimbje gjoksi, marramendje ose mungesë e pazakontë ajri kur lëviz.",
          "Dhimbje kyçesh që përkeqësohen kur lëviz.",
          "Të vjen të fikët ose zemra rreh e parregullt gjatë ushtrimeve.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Ekuilibri emocional",
        description:
          "Kujdesu për mendjen dhe kërko ndihmë kur të duhet.",
        intro:
          "Shëndeti mendor është pjesë e shëndetit tënd. Është normale të kesh edhe periudha të vështira.",
        keyFacts: [
          "Stresi i zgjatur e mban trupin të tendosur, shpejton rrahjet e zemrës, shtrëngon muskujt dhe prish gjumin.",
          "Kur kujdesesh për ekuilibrin emocional, fle më qetë, përqendrohesh më lehtë dhe i përballon më mirë shqetësimet.",
          "Frymëmarrja e ngadaltë e e thellë, orari i rregullt i gjumit dhe një bisedë e hapur me dikë të afërt e qetësojnë trupin.",
        ],
        recommendations: [
          {
            title: "Mos u izolo",
            description:
              "Mbaj lidhje me njerëzit që u beson.",
          },
          {
            title: "Kujdesu për bazat",
            description:
              "Gjumi, lëvizja dhe koha jashtë të ndihmojnë.",
          },
          {
            title: "Kërko ndihmë",
            description:
              "Fol me dikë që i beson ose me mjekun.",
          },
        ],
        warningSigns: [
          "Trishtim, ankth ose mungesë shprese që zgjat disa javë.",
          "Nuk po ia del me jetën e përditshme, punën ose marrëdhëniet.",
          "Nëse mendon të lëndosh veten, kërko ndihmë menjëherë.",
        ],
      },
      {
        slug: "smoking",
        title: "Duhani dhe alkooli",
        description:
          "Si të lësh duhanin, të pish më pak dhe kush të ndihmon.",
        intro:
          "Duhani dhe alkooli dëmtojnë zemrën, mushkëritë dhe mëlçinë dhe rritin rrezikun e kancerit. Çdo hap ka rëndësi: trupi fillon të shërohet shpejt kur ndalon ose pi më pak.",
        keyFacts: [
          "Në orët e para pas cigares së fundit, oksigjeni në gjak rritet, enët e gjakut çlirohen dhe mushkëritë nisin të pastrohen.",
          "Sa më pak alkool të pish, aq më mirë për mëlçinë, zemrën dhe tensionin. Asnjë sasi nuk është pa rrezik.",
          "Nëse zgjedh një ditë ndalimi, pret që të kalojnë 3 minutat e dëshirës dhe kërkon ndihmën e mjekut, i dyfishon shanset.",
        ],
        recommendations: [
          {
            title: "Zgjidh një ditë",
            description:
              "Zgjidh ditën kur e lë duhanin ose fillon të pish më pak. Mendo që më parë çfarë do të bësh kur të vijë dëshira.",
          },
          {
            title: "Pi më pak",
            description:
              "Mbaj disa ditë në javë pa alkool. Mos pi fare në shtatzëni, kur nget makinën ose me ilaçe që nuk shkojnë me alkoolin.",
          },
          {
            title: "Kërko ndihmë",
            description:
              "Mjeku i familjes të ndihmon ta lësh duhanin ose pijen. Nëse pi përsëri, mos u dorëzo: provo sërish.",
          },
        ],
        warningSigns: [
          "Kollitesh me gjak, ke dhimbje gjoksi që nuk kalon ose të merret fryma gjithnjë e më shpesh.",
          "Kollë që nuk kalon ose kollë e vjetër që ndryshon.",
          "Nuk mund të ndalosh së piri, të duhet alkool në mëngjes ose dridhesh e djersitesh kur nuk pi. Ndalimi i papritur mund të jetë i rrezikshëm: shko te mjeku.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Kontrollet parandaluese",
        description:
          "Kontrolle që zbulojnë problemet herët, para shenjave.",
        intro:
          "Kontrollet parandaluese kërkojnë shenjat e para të një sëmundjeje, edhe kur ndihesh mirë.",
        keyFacts: [
          "Shumë probleme, si tensioni i lartë, diabeti apo disa lloje kanceri, nisin në heshtje në trup shumë kohë para se të dhembin.",
          "Edhe kur ndihesh mirë çdo ditë, një kontroll i rregullt të jep qetësi dhe i kap ndryshimet kur mjekohen lehtë.",
          "Kërkoji mjekut të familjes analizat falas dhe kontrollet e rekomanduara për moshën tënde.",
        ],
        recommendations: [
          {
            title: "Pyet çfarë të duhet",
            description:
              "Pyet mjekun cilat kontrolle rekomandohen për ty.",
          },
          {
            title: "Shko në kontrolle",
            description:
              "Mos i humb ftesat për kontroll dhe analizat e zakonshme.",
          },
          {
            title: "Trego sëmundjet në familje",
            description:
              "Tregoji mjekut çfarë sëmundjesh kanë pasur prindërit, vëllezërit, motrat ose gjyshërit.",
          },
        ],
        warningSigns: [
          "Një gungë e re, gjakderdhje e pazakontë ose nishan që ndryshon formë.",
          "Çdo shenjë e re që nuk kalon dhe nuk e di nga vjen.",
          "Një rezultat kontrolli që kërkon analiza të tjera.",
        ],
      },
      {
        slug: "womens-health",
        title: "Shtatzënia",
        description:
          "Si të kujdesesh për veten dhe për foshnjën, nga testi i parë deri te lindja.",
        intro:
          "Shtatzënia zgjat rreth 40 javë. Kontrollet e rregullta, disa zakone të shëndetshme dhe ndihma e kërkuar me kohë të mbrojnë ty dhe foshnjën.",
        keyFacts: [
          "Acidi folik, i marrë para shtatzënisë dhe në 3 muajt e parë, ul rrezikun e disa keqformimeve te foshnja.",
          "Kontrollet e rregullta te mjeku shohin tensionin, analizat dhe rritjen e foshnjës, edhe kur ndihesh mirë.",
          "Alkooli dhe duhani arrijnë te foshnja përmes gjakut. Nuk ka sasi të sigurt alkooli gjatë shtatzënisë.",
        ],
        recommendations: [
          {
            title: "Shko herët te mjeku",
            description:
              "Kur mëson se je shtatzënë, shko te mjeku i familjes ose te gjinekologu.",
          },
          {
            title: "Merr acid folik",
            description:
              "Pyet mjekun çfarë doze të marrësh dhe për sa kohë. Mos merr ilaçe të tjera pa e pyetur.",
          },
          {
            title: "Kujdesu për veten",
            description:
              "Ha ushqime të larmishme, pusho dhe mos pi alkool e mos pi duhan. Kërko ndihmë nëse e ke të vështirë të ndalosh.",
          },
        ],
        warningSigns: [
          "Gjakderdhje nga vagina ose dhimbje e fortë barku.",
          "Dhimbje koke e fortë, shikim i turbullt ose ënjtje e papritur e fytyrës dhe e duarve.",
          "Foshnja lëviz më pak se zakonisht ose të rrjedh lëng nga vagina.",
        ],
      },
    ],
  },
  it: {
    labels: {
      allTopics:
        "Tutte le guide sulla salute",
      whyItMatters:
        "Perché è importante",
      practicalSteps:
        "Cosa puoi fare",
      seekAdviceTitle:
        "Quando andare dal medico",
      seekAdviceBody:
        "Vai dal medico se noti uno di questi segnali. In caso di emergenza, chiama subito il 112.",
      relatedTopics:
        "Altre guide",
      readMore:
        "Leggi di più",
      disclaimer:
        "Queste informazioni non sono una diagnosi. Per la tua salute, parla con il medico.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Salute del cuore",
        description:
          "Abitudini semplici per un cuore sano e una pressione nella norma.",
        intro:
          "Il cuore pompa il sangue in tutto il corpo, ogni minuto. Se te ne prendi cura, riduci il rischio di malattie del cuore e di ictus.",
        keyFacts: [
          "La pressione alta e il colesterolo elevato affaticano in silenzio le arterie e il cuore per anni senza dare sintomi.",
          "Un cuore forte e una pressione normale ti danno più resistenza allo sforzo, respiro migliore e minor rischio di ictus.",
          "Usare meno sale a tavola, camminare ogni giorno e misurare regolarmente la pressione proteggono il cuore.",
        ],
        recommendations: [
          {
            title: "Muoviti spesso",
            description:
              "Cammina a passo svelto ogni volta che puoi.",
          },
          {
            title: "Mangia meglio",
            description:
              "Mangia più verdura, frutta e cereali integrali.",
          },
          {
            title: "Controlla i valori",
            description:
              "Fatti controllare spesso pressione e colesterolo.",
          },
        ],
        warningSigns: [
          "Dolore o peso al petto, soprattutto se arriva al braccio o alla mandibola.",
          "Fiato corto all'improvviso o battito irregolare.",
          "Stanchezza che non passa o gambe gonfie.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabete",
        description:
          "Cosa aumenta il rischio e come tenere stabile lo zucchero nel sangue.",
        intro:
          "Il diabete cambia il modo in cui il corpo usa lo zucchero nel sangue. Con l'aiuto giusto, si può prevenire o tenere sotto controllo.",
        keyFacts: [
          "Nel diabete di tipo 2 lo zucchero resta nel sangue invece di entrare nelle cellule e può danneggiare i vasi per anni senza sintomi chiari.",
          "Tenere in equilibrio lo zucchero nel sangue ti dà energia costante durante il giorno e protegge occhi, reni, nervi e cuore.",
          "Piccoli cambiamenti ogni giorno, come metà piatto di verdure e una passeggiata dopo i pasti, riducono il rischio.",
        ],
        recommendations: [
          {
            title: "Bilancia il piatto",
            description:
              "Riempi metà piatto di verdura e scegli cereali integrali.",
          },
          {
            title: "Resta attivo",
            description:
              "Muoverti con regolarità aiuta il corpo a usare meglio lo zucchero.",
          },
          {
            title: "Fai le analisi",
            description:
              "Se hai fattori di rischio, chiedi al medico un esame del sangue.",
          },
        ],
        warningSigns: [
          "Molta sete o bisogno di urinare spesso.",
          "Perdi peso senza motivo o sei sempre stanco.",
          "Vista annebbiata o ferite che guariscono lentamente.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Alimentazione sana",
        description:
          "Cibo sano ed economico, per tutti i giorni.",
        intro:
          "Mangiare bene non deve essere complicato o costoso. Poche regole semplici, ogni giorno, ti aiutano molto.",
        keyFacts: [
          "Le fibre di verdure e cereali integrali tengono stabili lo zucchero nel sangue e la pressione.",
          "Il cibo cucinato in modo semplice ti dà energia costante e ti evita la stanchezza dopo i pasti.",
          "Verdure di stagione, fagioli e lenticchie costano poco, e bere acqua al posto delle bibite zuccherate aiuta subito.",
        ],
        recommendations: [
          {
            title: "Più verdura e frutta",
            description:
              "Aggiungi verdura o frutta alla maggior parte dei pasti.",
          },
          {
            title: "Cucina a casa",
            description:
              "Preferisci cereali integrali e piatti cucinati a casa.",
          },
          {
            title: "Bevi acqua",
            description:
              "Bevi soprattutto acqua e poche bibite zuccherate.",
          },
        ],
        warningSigns: [
          "Aumento o perdita di peso in poco tempo.",
          "Problemi di digestione che non passano o poca fame.",
          "Debolezza, capogiri o stanchezza insolita.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Attività fisica",
        description:
          "Modi semplici per muoverti di più.",
        intro:
          "Muoverti con regolarità fa bene al corpo e alla mente. Non ti serve la palestra. Anche camminare conta.",
        keyFacts: [
          "Il movimento attiva la circolazione, rafforza il cuore e i muscoli e aiuta le cellule a usare lo zucchero nel sangue.",
          "Muoverti con regolarità ti dà più energia, un sonno migliore e più equilibrio e mobilità ogni giorno.",
          "Non serve la palestra: alzati dalla sedia ogni ora e cammina per 15–30 minuti nella maggior parte dei giorni.",
        ],
        recommendations: [
          {
            title: "Inizia piano",
            description:
              "Comincia con brevi camminate e aumenta poco alla volta.",
          },
          {
            title: "Muoviti con costanza",
            description:
              "Un po' di movimento ogni giorno conta più di un grande sforzo ogni tanto.",
          },
          {
            title: "Rinforza i muscoli",
            description:
              "Porta la spesa, lavora in giardino o fai qualche piegamento sulle gambe.",
          },
        ],
        warningSigns: [
          "Dolore al petto, capogiri o fiato corto insolito durante l'attività.",
          "Dolore alle articolazioni che peggiora quando ti muovi.",
          "Senso di svenimento o battito irregolare durante l'esercizio.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Equilibrio emotivo",
        description:
          "Prenditi cura della mente e chiedi aiuto quando serve.",
        intro:
          "La salute mentale fa parte della tua salute. È normale avere anche periodi difficili.",
        keyFacts: [
          "Lo stress prolungato mantiene il corpo in tensione, accelera il battito, irrigidisce i muscoli e disturba il sonno.",
          "Quando ti prendi cura dell'equilibrio emotivo dormi più sereno, ti concentri meglio e affronti con più calma le preoccupazioni.",
          "La respirazione lenta e profonda, orari di sonno regolari e parlare apertamente con una persona fidata calmano il corpo.",
        ],
        recommendations: [
          {
            title: "Resta in contatto",
            description:
              "Tieniti in contatto con le persone di cui ti fidi.",
          },
          {
            title: "Cura le basi",
            description:
              "Sonno, movimento e tempo all'aperto ti aiutano.",
          },
          {
            title: "Chiedi aiuto",
            description:
              "Parla con una persona di fiducia o con il medico.",
          },
        ],
        warningSigns: [
          "Umore basso, ansia o mancanza di speranza per settimane.",
          "Fai fatica nella vita di tutti i giorni, al lavoro o con gli altri.",
          "Se pensi di farti del male, chiedi aiuto subito.",
        ],
      },
      {
        slug: "smoking",
        title: "Fumo e alcol",
        description:
          "Come smettere di fumare, bere meno e chi può aiutarti.",
        intro:
          "Fumo e alcol danneggiano cuore, polmoni e fegato e aumentano il rischio di tumori. Ogni passo conta: il corpo inizia presto a riprendersi quando smetti o bevi meno.",
        keyFacts: [
          "Già poche ore dopo l'ultima sigaretta l'ossigeno nel sangue sale, i vasi si rilassano e i polmoni iniziano a pulirsi.",
          "Meno alcol bevi, meglio è per fegato, cuore e pressione. Nessuna quantità è del tutto senza rischi.",
          "Scegliere un giorno per smettere, aspettare che passino i 3 minuti di voglia e chiedere aiuto al medico raddoppia le probabilità di riuscire.",
        ],
        recommendations: [
          {
            title: "Scegli un giorno",
            description:
              "Scegli il giorno in cui smetti di fumare o inizi a bere meno. Pensa prima a cosa farai quando arriva la voglia.",
          },
          {
            title: "Bevi meno",
            description:
              "Tieni alcuni giorni a settimana senza alcol. Non bere affatto in gravidanza, quando guidi o con farmaci che non vanno con l'alcol.",
          },
          {
            title: "Chiedi aiuto",
            description:
              "Il medico di famiglia può aiutarti a smettere di fumare o di bere. Se ricominci, non arrenderti: riprova.",
          },
        ],
        warningSigns: [
          "Tossisci sangue, hai dolore al petto che non passa o ti manca il fiato sempre più spesso.",
          "Una tosse che non passa o una tosse abituale che cambia.",
          "Non riesci a smettere di bere, ti serve alcol al mattino o tremi e sudi quando non bevi. Smettere di colpo può essere pericoloso: vai dal medico.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Controlli di salute",
        description:
          "Controlli che trovano i problemi presto, prima dei sintomi.",
        intro:
          "Lo screening cerca i primi segni di una malattia, anche quando ti senti bene.",
        keyFacts: [
          "Molte condizioni, come la pressione alta, il diabete o alcuni tumori, iniziano in silenzio nel corpo molto prima di dare dolore.",
          "Anche quando ti senti in forze ogni giorno, un controllo di routine ti dà tranquillità e individua i cambiamenti quando si curano facilmente.",
          "Chiedi al medico di famiglia gli esami gratuiti e gli screening consigliati per la tua età.",
        ],
        recommendations: [
          {
            title: "Chiedi cosa ti serve",
            description:
              "Chiedi al medico quali controlli sono consigliati per te.",
          },
          {
            title: "Vai ai controlli",
            description:
              "Non saltare gli inviti allo screening e i controlli di routine.",
          },
          {
            title: "Parla della tua famiglia",
            description:
              "Di' al medico quali malattie hanno avuto i tuoi genitori, fratelli o nonni.",
          },
        ],
        warningSigns: [
          "Un nodulo nuovo, un sanguinamento strano o un neo che cambia forma.",
          "Qualsiasi sintomo nuovo che non passa e non ha una causa chiara.",
          "Un risultato di screening che richiede altri esami.",
        ],
      },
      {
        slug: "womens-health",
        title: "Gravidanza",
        description:
          "Come prenderti cura di te e del bambino, dal primo test al parto.",
        intro:
          "La gravidanza dura circa 40 settimane. Controlli regolari, poche abitudini sane e un aiuto chiesto in tempo proteggono te e il bambino.",
        keyFacts: [
          "L'acido folico, preso prima della gravidanza e nei primi 3 mesi, riduce il rischio di alcune malformazioni del bambino.",
          "I controlli regolari verificano la pressione, gli esami e la crescita del bambino, anche quando ti senti bene.",
          "Alcol e fumo arrivano al bambino attraverso il sangue. In gravidanza non esiste una quantità sicura di alcol.",
        ],
        recommendations: [
          {
            title: "Vai presto dal medico",
            description:
              "Quando scopri di essere incinta, vai dal medico di famiglia, in consultorio o dal ginecologo.",
          },
          {
            title: "Prendi l'acido folico",
            description:
              "Chiedi al medico quale dose prendere e per quanto tempo. Non prendere altri farmaci senza chiedere.",
          },
          {
            title: "Prenditi cura di te",
            description:
              "Mangia in modo vario, riposa e non bere alcol e non fumare. Chiedi aiuto se è difficile smettere.",
          },
        ],
        warningSigns: [
          "Perdite di sangue dalla vagina o forte dolore alla pancia.",
          "Forte mal di testa, vista offuscata o gonfiore improvviso di viso e mani.",
          "Il bambino si muove meno del solito o perdi liquido dalla vagina.",
        ],
      },
    ],
  },
  hr: {
    labels: {
      allTopics:
        "Svi zdravstveni vodiči",
      whyItMatters:
        "Zašto je važno",
      practicalSteps:
        "Što možeš učiniti",
      seekAdviceTitle:
        "Kada otići liječniku",
      seekAdviceBody:
        "Javi se liječniku ako primijetiš neki od ovih znakova. U hitnom slučaju odmah nazovi 112.",
      relatedTopics:
        "Drugi vodiči",
      readMore:
        "Pročitaj više",
      disclaimer:
        "Ove informacije nisu dijagnoza. Za svoje zdravlje razgovaraj s liječnikom.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Zdravlje srca",
        description:
          "Jednostavne navike za zdravo srce i dobar krvni tlak.",
        intro:
          "Tvoje srce svake minute pumpa krv kroz cijelo tijelo. Briga o srcu smanjuje rizik od srčanih bolesti i moždanog udara.",
        keyFacts: [
          "Visoki krvni tlak i povišeni kolesterol tiho opterećuju arterije i umaraju srce godinama bez ikakvih znakova.",
          "Snažno srce i normalan tlak daju ti bolju izdržljivost, lakše disanje i manji rizik od moždanog udara.",
          "Manje soli u hrani, svakodnevno brzo hodanje i redovito mjerenje tlaka štite tvoje srce.",
        ],
        recommendations: [
          {
            title: "Kreći se većinu dana",
            description:
              "Hodaj brzim korakom ili radi aktivnost koju voliš. I kratke šetnje vrijede.",
          },
          {
            title: "Jedi zdravo za srce",
            description:
              "Jedi više povrća, voća i cjelovitih žitarica. Smanji sol i gotovu industrijsku hranu.",
          },
          {
            title: "Provjeravaj svoje vrijednosti",
            description:
              "Redovito provjeravaj krvni tlak i kolesterol. Tegobe se lakše liječe kada se otkriju rano.",
          },
        ],
        warningSigns: [
          "Bol, pritisak ili stezanje u prsima, osobito ako se širi u ruku, vrat ili čeljust.",
          "Nagli nedostatak zraka ili brz i nepravilan rad srca.",
          "Umor koji ne prolazi ili otečene noge.",
        ],
      },
      {
        slug: "diabetes",
        title: "Dijabetes",
        description:
          "Što povećava rizik i kako držati šećer u krvi pod kontrolom.",
        intro:
          "Dijabetes utječe na to kako tvoje tijelo koristi šećer u krvi. Uz pravu podršku tip 2 možeš spriječiti, odgoditi ili dobro držati pod kontrolom.",
        keyFacts: [
          "Kod dijabetesa tipa 2 šećer ostaje u krvi umjesto da ulazi u stanice te može godinama tiho oštećivati krvne žile.",
          "Stabilan šećer u krvi daje ti ravnomjernu energiju kroz dan i čuva oči, bubrege, živce i srce.",
          "Male svakodnevne navike, poput polovice tanjura povrća i šetnje nakon obroka, smanjuju rizik.",
        ],
        recommendations: [
          {
            title: "Uravnoteži tanjur",
            description:
              "Napuni polovicu tanjura povrćem. Biraj cjeloviti kruh, rižu i tjesteninu.",
          },
          {
            title: "Budi aktivan",
            description:
              "Redovito kretanje pomaže tvom tijelu bolje iskoristiti šećer iz krvi.",
          },
          {
            title: "Obavi krvnu pretragu",
            description:
              "Ako u obitelji imaš dijabetes ili druge čimbenike rizika, zatraži od liječnika analizu krvi.",
          },
        ],
        warningSigns: [
          "Jaka žeđ ili mokrenje češće nego inače.",
          "Gubitak težine bez namjere ili stalni umor.",
          "Zamućen vid ili rane koje sporo cijele.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Zdrava prehrana",
        description:
          "Povoljna i jednostavna hrana za svaki dan.",
        intro:
          "Zdrava prehrana ne mora biti komplicirana ni skupa. Nekoliko jednostavnih pravila iz dana u dan daje tvom tijelu sve što mu treba.",
        keyFacts: [
          "Vlakna iz povrća i cjelovitih žitarica drže šećer u krvi i krvni tlak stabilnima.",
          "Jednostavna hrana kuhana kod kuće daje ti ravnomjernu energiju i sprječava umor nakon jela.",
          "Sezonsko povrće, grah i leća povoljni su, a pijenje vode umjesto slatkih sokova pomaže odmah.",
        ],
        recommendations: [
          {
            title: "Više povrća i voća",
            description:
              "Dodaj povrće ili voće u većinu obroka. Svježe i smrznuto jednako su dobri.",
          },
          {
            title: "Kuhaj kod kuće",
            description:
              "Biraj cjelovite žitarice i obroke kuhane kod kuće umjesto gotove hrane kad god možeš.",
          },
          {
            title: "Pij vodu",
            description:
              "Neka ti voda bude glavno piće. Smanji zaslađene napitke i voćne sokove.",
          },
        ],
        warningSigns: [
          "Naglo mršavljenje ili debljanje bez jasnog razloga.",
          "Probavne tegobe koje ne prolaze ili gubitak teka.",
          "Slabost, vrtoglavica ili jak umor iako redovito jedeš.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Tjelesna aktivnost",
        description:
          "Jednostavni načini za više kretanja, bez obzira na tvoju kondiciju.",
        intro:
          "Redovito kretanje jedna je od najboljih stvari za tvoje tijelo i um. Ne treba ti teretana. Svakodnevno hodanje se računa.",
        keyFacts: [
          "Kretanje potiče krvotok, jača srce i mišiće te pomaže stanicama iskoristiti šećer u krvi za energiju.",
          "Redovita aktivnost daje ti više energije, dublji san noću te bolju ravnotežu i pokretljivost.",
          "Ne treba ti teretana: ustani sa stolca svaki sat i hodaj 15–30 minuta većinu dana.",
        ],
        recommendations: [
          {
            title: "Kreni polako",
            description:
              "Započni kratkim šetnjama ili aktivnošću koja ti prija. Svaki tjedan dodaj malo više.",
          },
          {
            title: "Kreći se redovito",
            description:
              "Malo kretanja većinu dana pomaže više nego naporan trening tu i tamo.",
          },
          {
            title: "Jačaj mišiće",
            description:
              "Radi poslove koji uključuju mišiće, poput nošenja vrećica, rada u vrtu ili čučnjeva.",
          },
        ],
        warningSigns: [
          "Bol u prsima, vrtoglavica ili neobičan nedostatak zraka pri naporu.",
          "Bol ili oticanje zglobova koje se pogoršava pri kretanju.",
          "Osjećaj nesvjestice ili nepravilan rad srca tijekom aktivnosti.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Mentalno zdravlje",
        description:
          "Brini se o svom umu i znaj kada potražiti pomoć.",
        intro:
          "Mentalno zdravlje dio je tvog cjelokupnog zdravlja. Normalno je imati i teža razdoblja te potražiti pomoć kada ti zatreba.",
        keyFacts: [
          "Dugotrajan stres drži tijelo u napetosti, ubrzava puls, grči mišiće i remeti san.",
          "Briga o mentalnom zdravlju donosi mirniji san, bolju koncentraciju i lakše nošenje sa svakodnevnim brigama.",
          "Sporo i duboko disanje, redovito vrijeme spavanja i iskren razgovor s bliskom osobom brzo smiruju tijelo.",
        ],
        recommendations: [
          {
            title: "Ostani povezan",
            description:
              "Provodi vrijeme s ljudima kojima vjeruješ. Bliskost s drugima čuva tvoj um.",
          },
          {
            title: "Pazi na osnove",
            description:
              "San, kretanje i boravak na svježem zraku pomažu ti da se osjećaš bolje.",
          },
          {
            title: "Zatraži pomoć",
            description:
              "Ako ti postane preteško, razgovaraj s osobom od povjerenja ili s liječnikom.",
          },
        ],
        warningSigns: [
          "Tuga, tjeskoba ili osjećaj beznađa koji traju tjednima.",
          "Teško se nosiš sa svakodnevnim obvezama, poslom ili odnosima s bližnjima.",
          "Misli o samoozljeđivanju. Ako se to dogodi, odmah potraži pomoć.",
        ],
      },
      {
        slug: "smoking",
        title: "Pušenje i alkohol",
        description:
          "Kako prestati pušiti, piti manje i tko ti može pomoći.",
        intro:
          "Pušenje i alkohol štete srcu, plućima i jetri i povećavaju rizik od raka. Svaki korak je važan: tijelo se brzo počinje oporavljati kad prestaneš ili piješ manje.",
        keyFacts: [
          "Već nekoliko sati nakon zadnje cigarete razina kisika u krvi raste, žile se opuštaju i pluća se počinju čistiti.",
          "Što manje alkohola piješ, to bolje za jetru, srce i tlak. Nijedna količina nije potpuno bez rizika.",
          "Ako odabereš dan prestanka, pričekaš da prođu 3 minute žudnje i zatražiš podršku liječnika, udvostručuješ šanse za uspjeh.",
        ],
        recommendations: [
          {
            title: "Odaberi dan",
            description:
              "Odaberi dan kad prestaješ pušiti ili počinješ piti manje. Unaprijed smisli što ćeš raditi kad dođe žudnja.",
          },
          {
            title: "Pij manje",
            description:
              "Imaj nekoliko dana u tjednu bez alkohola. Ne pij uopće u trudnoći, kad voziš ili uz lijekove koji ne idu s alkoholom.",
          },
          {
            title: "Zatraži pomoć",
            description:
              "Obiteljski liječnik ti može pomoći da prestaneš pušiti ili piti. Ako ponovno zapališ ili popiješ, ne odustaj: pokušaj opet.",
          },
        ],
        warningSigns: [
          "Iskašljavaš krv, imaš bol u prsima koja ne prolazi ili sve češće ostaješ bez zraka.",
          "Kašalj koji ne prolazi ili stari kašalj koji se mijenja.",
          "Ne možeš prestati piti, trebaš alkohol ujutro ili se treseš i znojiš kad ne piješ. Nagli prestanak može biti opasan: javi se liječniku.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Preventivni pregledi",
        description:
          "Pretrage koje otkrivaju probleme rano, prije prvih znakova.",
        intro:
          "Preventivni pregledi traže prve znakove bolesti dok se još osjećaš sasvim dobro. Rano otkrivene bolesti lakše se liječe.",
        keyFacts: [
          "Mnoge bolesti, poput visokog tlaka, dijabetesa ili ranih stadija raka, počinju tiho u tijelu mnogo prije boli.",
          "Čak i kada se svaki dan osjećaš dobro, redoviti pregled donosi mir i otkriva promjene dok je liječenje jednostavno.",
          "Pitaj svog obiteljskog liječnika koje besplatne HZZO preventivne preglede i nacionalne programe probira možeš obaviti ove godine.",
        ],
        recommendations: [
          {
            title: "Pitaj što ti treba",
            description:
              "Pitaj obiteljskog liječnika koji su pregledi preporučeni za tvoju dob i zdravlje.",
          },
          {
            title: "Odazovi se na preglede",
            description:
              "Odazovi se pozivima na nacionalne preventivne programe i redovite kontrole.",
          },
          {
            title: "Podijeli obiteljsku povijest",
            description:
              "Reci liječniku od kojih su bolesti bolovali tvoji roditelji, braća, sestre ili bake i djedovi.",
          },
        ],
        warningSigns: [
          "Nova kvržica, neobično krvarenje ili madež koji mijenja oblik ili boju.",
          "Svaki novi simptom koji ne prolazi i nema jasan uzrok.",
          "Nalaz probira koji traži dodatne pretrage. Nemoj čekati.",
        ],
      },
      {
        slug: "womens-health",
        title: "Trudnoća",
        description:
          "Kako se brinuti za sebe i dijete, od prvog testa do poroda.",
        intro:
          "Trudnoća traje oko 40 tjedana. Redoviti pregledi, nekoliko zdravih navika i pravodobno traženje pomoći štite tebe i dijete.",
        keyFacts: [
          "Folna kiselina, uzeta prije trudnoće i u prva 3 mjeseca, smanjuje rizik od nekih prirođenih mana kod djeteta.",
          "Redoviti pregledi prate tlak, nalaze i rast djeteta, čak i kad se osjećaš dobro.",
          "Alkohol i pušenje dolaze do djeteta kroz krv. U trudnoći ne postoji sigurna količina alkohola.",
        ],
        recommendations: [
          {
            title: "Rano se javi liječniku",
            description:
              "Kad saznaš da si trudna, javi se obiteljskom liječniku ili ginekologu.",
          },
          {
            title: "Uzimaj folnu kiselinu",
            description:
              "Pitaj liječnika koju dozu uzimati i koliko dugo. Ne uzimaj druge lijekove bez pitanja.",
          },
          {
            title: "Brini se o sebi",
            description:
              "Jedi raznoliko, odmaraj se i ne pij alkohol i ne puši. Zatraži pomoć ako ti je teško prestati.",
          },
        ],
        warningSigns: [
          "Krvarenje iz rodnice ili jaka bol u trbuhu.",
          "Jaka glavobolja, zamućen vid ili naglo oticanje lica i ruku.",
          "Dijete se miče manje nego inače ili ti iz rodnice curi tekućina.",
        ],
      },
    ],
  },
  rom: {
    labels: {
      allTopics:
        "Savore sastipnaske sikavimata",
      whyItMatters:
        "Sostar si vazhno",
      practicalSteps:
        "So shaj te keres",
      seekAdviceTitle:
        "Kana te dzhas ko doktori",
      seekAdviceBody:
        "Dzha ko doktori te dikhes varesavo katar akala semnja. Kana si sigardiari, akhar sigo 112.",
      relatedTopics:
        "Aver sikavimata",
      readMore:
        "Drabar maj but",
      disclaimer:
        "Akala informacije naj dijagnoza. Vash tiro sastipen, de duma e doktoresa.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Sastipen e ilesko",
        description:
          "Sako-diveske tabijetura save arakhen tiro ilo thaj tiri tensija.",
        intro:
          "Tiro ilo bičhalel o rat ando sasto trupo sako minuta. Kana arakhes les, tiknjarel pes o riziko vash nasvalipena e ileske thaj dab ki godi.",
        keyFacts: [
          "Kana o rat phurdel zurales thaj o kolesterolo si ucho, von lokhes khinjaren e arterije thaj o ilo bershencar bi semnjengo.",
          "Zuralo ilo thaj normalno tensija den tut maj bari zor, maj lokho phurdinimos thaj maj cikno riziko vash dab ki godi.",
          "Maj xanci lon ando xaben, sigo phirimos sako dives thaj redovno merimos e tensijako arakhen tiro ilo.",
        ],
        recommendations: [
          {
            title: "Phir maj but dive",
            description:
              "Phir sigo vaj ker buchi savi plachal tut. Vi e cikne phirimata ginaven pes.",
          },
          {
            title: "Xa mishto vash tiro ilo",
            description:
              "Xa maj but zelenimata, frute thaj integralno manro. Čhiv maj xanci lon thaj xa maj xanci gata xaben.",
          },
          {
            title: "Dikh tire numere",
            description:
              "Merisar redovno i tensija thaj o kolesterolo. E problemura sastjaren pes maj lokhes kana arakhen pes rano.",
          },
        ],
        warningSigns: [
          "Dukh vaj tasavimos ko kolin, maj but te dzhal ko vast, ki kor vaj ki pashni.",
          "Sigo phari phurdinimos, vaj ilo so marel sigo thaj bi ritmosko.",
          "Khino savo na nakhel vaj shuvljarde punre.",
        ],
      },
      {
        slug: "diabetes",
        title: "Dijabeto",
        description:
          "So barjarel o riziko thaj sar te inkeres o gudlo rat ando balanso.",
        intro:
          "O dijabeto paruvel sar tiro trupo labyarel o zahari ando rat. Lačhe azhutimasa shaj te arakhes tut lestar vaj te trais mishto lesa.",
        keyFacts: [
          "Ko dijabeto tip 2, o zahari ačhel ando rat namesto te del ande celije, thaj shaj bershencar lokhes te dukhavel e rateske droma.",
          "Kana inkeres o gudlo rat ando balanso, si tut zor sasto dives thaj arakhes tire jakha, bobrege, nervura thaj o ilo.",
          "Cikne sako-diveske tabijetura, sar dopash charo zelenimasa thaj phirimos pala o xaben, tiknjaren o riziko.",
        ],
        recommendations: [
          {
            title: "Balansirisar o charo",
            description:
              "Pher dopash charo zelenimasa. Alosar integralno manro, rizo thaj makarone.",
          },
          {
            title: "Ačhov aktivno",
            description:
              "Redovno phirimos azhutil tiro trupo maj mishto te labyarel o zahari katar o rat.",
          },
          {
            title: "Ker rengro dikhiben",
            description:
              "Te si dijabeto andi familija vaj aver riziko, mang katar o doktori jekh rengro dikhiben.",
          },
        ],
        warningSigns: [
          "Bari trush vaj butivar phirimos ko toaleto.",
          "Xasares kile bi te manges vaj san sajekh khino.",
          "Kalo dikhiben vaj rane save sastjon lokhes.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Sasto xaben",
        description:
          "Ieftino thaj lokho xaben vash sako dives.",
        intro:
          "Te xas sasto na musaj te avel pharo vaj kuč. Xanci lokhe pravila sako dives den tire truposke so trubul leske.",
        keyFacts: [
          "E vlakne katar e zelenimata thaj integralno giv inkeren o gudlo rat thaj i tensija ando balanso.",
          "Lokho xaben kirado khere del tut zor sasto dives thaj arakhel tut katar khino pala o xaben.",
          "Zelenimata e sezonake, o fusuj thaj i leča si ieftine, thaj o pani namesto gudle pimatja azhutil sigo.",
        ],
        recommendations: [
          {
            title: "Maj but zelenimata thaj frute",
            description:
              "Čhiv zelenimata vaj frute ko maj but xabena. Neve vaj shudrarde si solduj lačhe.",
          },
          {
            title: "Kirav khere",
            description:
              "Alosar integralno manro thaj xaben kirado khere kana shaj.",
          },
          {
            title: "Pi pani",
            description:
              "Mukh o pani te avel tiro angluno pimos. Pi so maj xanci gudle sokura.",
          },
        ],
        warningSigns: [
          "Xasares vaj čhives but kile ande cikni vrjama.",
          "Problemura e poresa save na nakhen vaj xasarimos e bokhako.",
          "Slabipen, o shero phirel vaj baro khino vi kana xas.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Fizikani aktivnost",
        description:
          "Lokhe droma te phires maj but, savi godi te avel tiri zor.",
        intro:
          "Te phires maj but si jekh katar e maj lačhe bukja vash tiro trupo thaj godi. Na trubul tut sala. Sako phirimos ginavel pes.",
        keyFacts: [
          "O phirimos mukhel o rat te phirel, zurarel o ilo thaj e muskulura, thaj azhutil e celijen te labyaren o zahari.",
          "Redovno phirimos del tut maj but zor, maj lačho sovibe ratjate thaj maj lačho balanso.",
          "Na trubul tut sala: ushti katar o skamin sako ora thaj phir 15–30 minute ko maj but dive.",
        ],
        recommendations: [
          {
            title: "Astar ciknes",
            description:
              "Astar cikne phirimasa. Ker zalog maj but sako kurko.",
          },
          {
            title: "Phir redovno",
            description:
              "Zalog phirimos sako dives azhutil maj but katar baro khinimos varekana.",
          },
          {
            title: "Zurar e muskulura",
            description:
              "Inger gono, ker buchi andi barcha vaj ker lokhe vjezhbe.",
          },
        ],
        warningSigns: [
          "Dukh ko kolin, o shero phirel vaj phari phurdinimos kana phires.",
          "Dukh vaj shuvljarimos ko globura savo barjol kana phires.",
          "Hatjares kaj peres vaj o ilo marel bi ritmosko kana keres vjezhbe.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Sastipen e godjako",
        description:
          "Arakh tiri godi thaj dzhan kana te manges azhutimos.",
        intro:
          "O sastipen e godjako si kotor katar tiro sastipen. Sako manush nakhavel vi lačhe vi phare dive. Normalno si te manges azhutimos.",
        keyFacts: [
          "Lungo streso inkerel o trupo phanglo, sigjarel o pulso, tasavel e muskulura thaj phagel o sovibe.",
          "Kana arakhes tiri godi, soves maj mirno, dikhes maj mishto tiri buchi thaj ačhes pasha tire manusha.",
          "Lokho thaj xor phurdinimos, redovno vrjama vash sovibe thaj putardi duma jekhe manushesa kaste pakjas lokhjaren o trupo.",
        ],
        recommendations: [
          {
            title: "Ačhov pasha e manusha",
            description:
              "Nakhar vrjama manushenca kaste pakjas. Te aves pasha avera arakhel tiri godi.",
          },
          {
            title: "Arakh e anglune bukja",
            description:
              "O sovibe, o phirimos thaj i vrjama avri azhutin tut te hatjares tut maj mishto.",
          },
          {
            title: "Mang azhutimos",
            description:
              "Te avel tuke but phares, de duma jekhe manushesa kaste pakjas vaj jekhe doktoresa.",
          },
        ],
        warningSigns: [
          "Brigipe, dar vaj bi-nadako hatjarimos savo ačhel kurkencar.",
          "Phares ikljos ko kraj sako-diveske bukjenca, khere vaj avere manushenca.",
          "Gindura te keres tuke nasul. Te avel akava, mang azhutimos sigo.",
        ],
      },
      {
        slug: "smoking",
        title: "Duhano thaj pimos",
        description:
          "Sar te mukes o duhano, te pes maj tsera thaj kon azhutil tut.",
        intro:
          "O duhano thaj o pimos keren nasul e ileske, e bukenge thaj e buklakiake thaj barjaren o riziko vash kancero. Sako pash si importanto: o trupo sigo lel te sastyol kana achhaves vaj pes maj tsera.",
        keyFacts: [
          "Ande angluno ore pala i palutni cigara, o oksigeno ando rat barjol, e vine relaksisaren pe thaj e buke lenas te uzharen pe.",
          "Sar maj tsera pimos pes, ajsi maj lasho e buklakiake, e ileske thaj e tenziake. Nai kantitato bi khanchesko riziko.",
          "Te alos jekh dyes te achhaves, azhukeres te nakhen e 3 minutura e kamlimaske thaj mangle azhutipe katar o doktori, duvar maj but shansura si tut.",
        ],
        recommendations: [
          {
            title: "Alosar jekh dyes",
            description:
              "Alosar o dyes kana mukes o duhano vaj las te pes maj tsera. Gindisar anglal so keres kana avel tuke kamlimos.",
          },
          {
            title: "Pi maj tsera",
            description:
              "Ingre nesave dyes ando kurko bi pimasko. Na pi ande khabnipen, kana tradés i masina vaj kana les draba save na djan pimasa.",
          },
          {
            title: "Mang azhutipe",
            description:
              "O familiako doktori shaj azhutil tut te mukes o duhano vaj o pimos. Te pilan palem, na mukh: zumav palem.",
          },
        ],
        warningSigns: [
          "Ankales rat, dukhal tut o kolin thaj na nakhel, vaj sa maj but na resel tuke o phurdipen.",
          "Kashlipen savo na nakhel vaj phuro kashlipen savo parudel pe.",
          "Na shaj achhaves te pes, trebul tuke pimos ande sabaile, vaj izdras thaj xamles kana na pes. Te achhaves sigo shaj te avel dandzheresko: ja ko doktori.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Preventivno dikhiben",
        description:
          "Dikhibena save arakhen problemura rano, anglal e semnja.",
        intro:
          "O preventivno dikhiben rodel e anglune semnja e nasvalipnaske anglal te dukhal tut vareso. Problemura arakhle rano sastjaren pes maj lokhes.",
        keyFacts: [
          "But nasvalipena, sar uchi tensija, dijabeto vaj varesave kancerura, astaren mirno ando trupo but anglal te dukhan.",
          "Vi kana hatjares tut zuralo sako dives, jekh redovno dikhiben del tut mir thaj arakhel e paruvimata kana sastjaren pes lokhes.",
          "Phuch tire familijake doktores save bi-loveske dikhibena thaj rengre dikhibena shaj te keres akava bersh.",
        ],
        recommendations: [
          {
            title: "Phuch so trubul tuke",
            description:
              "Phuch tire doktores save dikhibena si lačhe vash tiri vrjama thaj sastipen.",
          },
          {
            title: "Dzha ko dikhibena",
            description:
              "Dzha kana akharen tut ko preventivno dikhiben thaj ko redovne kontrole.",
          },
          {
            title: "Phen vash e nasvalipena andi familija",
            description:
              "Phen e doktoreske save nasvalipena sas tire daja, dades, phralen vaj papon.",
          },
        ],
        warningSigns: [
          "Nevi guka, neobicno ratjarimos vaj mladezho savo paruvel forma vaj boja.",
          "Sako nevo semno savo na nakhel thaj na dzhanes katar avel.",
          "Rezultato katar o dikhiben savo mangel te aves pale. Ma azhuker.",
        ],
      },
      {
        slug: "womens-health",
        title: "Khabnipen",
        description:
          "Sar te las sama tutar thaj e chavorestar, katar o angluno testo dzi ko bijandipen.",
        intro:
          "O khabnipen lel pashe 40 kurke. E kontrolura, nesave sastipnaske obichaya thaj o azhutipe mangle ande vrjama arakhen tut thaj e chavores.",
        keyFacts: [
          "O folno acido, lino anglal o khabnipen thaj ande angluno 3 chhon, tikjarel o riziko vash nesave bilashimata ko chavoro.",
          "E kontrolura ko doktori dikhen i tenzia, e analize thaj sar barol o chavoro, vi kana hatyares tut mishto.",
          "O pimos thaj o duhano resen ko chavoro prekal o rat. Ando khabnipen nai pimos savo te avel bi dandzheresko.",
        ],
        recommendations: [
          {
            title: "Ja sigo ko doktori",
            description:
              "Kana dzanes kaj san khabni, ja ko familiako doktori vaj ko ginekologo.",
          },
          {
            title: "Le folno acido",
            description:
              "Puch e doktores savi doza te les thaj kozom vrjama. Na le aver draba bi te puches.",
          },
          {
            title: "Le sama tutar",
            description:
              "Xa felo felo xabe, odihnisar thaj na pi pimos thaj na pi duhano. Mang azhutipe te si tuke phares te achhaves.",
          },
        ],
        warningSigns: [
          "Avel tutar rat katar i vagina vaj but dukhal tut o por.",
          "But zuralo dukh e sheresko, na dikhes lasho vaj shuvlilo sigo o mui thaj o vasta.",
          "O chavoro mishkisarel maj tsera sar sas, vaj zhal tutar pani katar i vagina.",
        ],
      },
    ],
  },
};

export function getHealthInformationDictionary(lang: Lang) {
  return dictionaries[lang] || dictionaries.en;
}

export function getHealthTopicBySlug(lang: Lang, slug: string) {
  return getHealthInformationDictionary(lang).topics.find((topic) => topic.slug === slug);
}

export const healthTopicSlugs = dictionaries.en.topics.map((topic) => topic.slug);

export interface TopicItem {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  image: string;
  keyFact?: string;
  recommendationTitle?: string;
  recommendationBody?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  readMinutes: number;
  audioMinutes: number;
}

export const HEALTH_TOPIC_CARD_SUMMARIES: Record<
  Lang,
  Record<string, { title: string; description: string }>
> = {
  ru: {
    "heart-health": {
      title: "Здоровье сердца",
      description:
        "Простые привычки для здорового давления и крепкого сердца.",
    },
    diabetes: {
      title: "Профилактика диабета",
      description:
        "Ранние признаки и как держать сахар в крови в норме.",
    },
    "healthy-eating": {
      title: "Здоровое питание",
      description:
        "Простая и сытная еда с меньшим количеством соли и сахара.",
    },
    "physical-activity": {
      title: "Физическая активность",
      description:
        "Как больше двигаться каждый день в любом возрасте без спортзала.",
    },
    "mental-wellbeing": {
      title: "Психическое здоровье",
      description:
        "Как заметить затяжной стресс и тревогу и где найти бесплатную помощь.",
    },
    smoking: {
      title: "Курение и алкоголь",
      description:
        "Как бросить курить, пить меньше и кто может помочь.",
    },
    "preventive-screening": {
      title: "Проверка здоровья",
      description:
        "Бесплатные осмотры, которые находят болезнь раньше, чем появятся боли.",
    },
    "womens-health": {
      title: "Беременность",
      description:
        "Осмотры, фолиевая кислота и признаки, при которых нужно звонить врачу.",
    },
  },

  ro: {
    "heart-health": {
      title: "Sănătatea inimii",
      description:
        "Obiceiuri simple pentru o tensiune bună și o inimă puternică.",
    },
    diabetes: {
      title: "Prevenția diabetului",
      description:
        "Primele semne și cum ții zahărul din sânge sub control.",
    },
    "healthy-eating": {
      title: "Alimentație sănătoasă",
      description:
        "Mese sățioase și ieftine, cu mai puțină sare și zahăr.",
    },
    "physical-activity": {
      title: "Activitate fizică",
      description:
        "Cum te miști mai mult zilnic, la orice vârstă, fără sală.",
    },
    "mental-wellbeing": {
      title: "Echilibru emoțional",
      description:
        "Recunoaște stresul și grijile care nu trec și găsește ajutor gratuit.",
    },
    smoking: {
      title: "Fumat și alcool",
      description:
        "Cum renunți la țigări, cum bei mai puțin și cine te ajută.",
    },
    "preventive-screening": {
      title: "Controale de sănătate",
      description:
        "Controale gratuite care găsesc bolile devreme, înainte să doară.",
    },
    "womens-health": {
      title: "Sarcina",
      description:
        "Controale, acid folic și semnele la care chemi medicul în sarcină.",
    },
  },
  en: {
    "heart-health": {
      title: "Heart health",
      description:
        "Simple habits for healthy blood pressure and a strong heart.",
    },
    diabetes: {
      title: "Diabetes prevention",
      description:
        "Early signs and how to keep your blood sugar steady.",
    },
    "healthy-eating": {
      title: "Healthy eating",
      description:
        "Low-cost, filling meals with less salt and sugar.",
    },
    "physical-activity": {
      title: "Physical activity",
      description:
        "Ways to move more every day, at any age, without a gym.",
    },
    "mental-wellbeing": {
      title: "Mental health",
      description:
        "Spot stress and worry that stay too long, and find free help.",
    },
    smoking: {
      title: "Smoking and alcohol",
      description:
        "How to stop smoking, drink less and who can help you.",
    },
    "preventive-screening": {
      title: "Health check-ups",
      description:
        "Free check-ups that catch illness early, before it hurts.",
    },
    "womens-health": {
      title: "Pregnancy",
      description:
        "Check-ups, folic acid and the signs that mean you should call a doctor.",
    },
  },
  sq: {
    "heart-health": {
      title: "Shëndeti i zemrës",
      description:
        "Zakone të thjeshta për tension normal dhe zemër të fortë.",
    },
    diabetes: {
      title: "Parandalimi i diabetit",
      description:
        "Shenjat e para dhe si ta mbash sheqerin nën kontroll.",
    },
    "healthy-eating": {
      title: "Ushqyerja e shëndetshme",
      description:
        "Vakte të lira e të shëndetshme, me më pak kripë e sheqer.",
    },
    "physical-activity": {
      title: "Aktiviteti fizik",
      description:
        "Si të lëvizësh më shumë çdo ditë, në çdo moshë, pa palestër.",
    },
    "mental-wellbeing": {
      title: "Ekuilibri emocional",
      description:
        "Njih stresin dhe ankthin që zgjatin dhe gjej ndihmë falas.",
    },
    smoking: {
      title: "Duhani dhe alkooli",
      description:
        "Si të lësh duhanin, të pish më pak dhe kush të ndihmon.",
    },
    "preventive-screening": {
      title: "Kontrollet parandaluese",
      description:
        "Kontrolle falas që zbulojnë sëmundjet herët, para dhimbjes.",
    },
    "womens-health": {
      title: "Shtatzënia",
      description:
        "Kontrollet, acidi folik dhe shenjat kur duhet të thërrasësh mjekun.",
    },
  },
  it: {
    "heart-health": {
      title: "Salute del cuore",
      description:
        "Abitudini semplici per pressione regolare e cuore forte.",
    },
    diabetes: {
      title: "Prevenzione del diabete",
      description:
        "I primi segnali e come tenere stabile lo zucchero nel sangue.",
    },
    "healthy-eating": {
      title: "Alimentazione sana",
      description:
        "Pasti economici e sazianti, con meno sale e zucchero.",
    },
    "physical-activity": {
      title: "Attività fisica",
      description:
        "Come muoverti di più ogni giorno, a ogni età, senza palestra.",
    },
    "mental-wellbeing": {
      title: "Equilibrio emotivo",
      description:
        "Riconosci stress e ansia che non passano e trova aiuto gratuito.",
    },
    smoking: {
      title: "Fumo e alcol",
      description:
        "Come smettere di fumare, bere meno e chi può aiutarti.",
    },
    "preventive-screening": {
      title: "Controlli di salute",
      description:
        "Controlli gratuiti per scoprire i problemi presto, prima del dolore.",
    },
    "womens-health": {
      title: "Gravidanza",
      description:
        "Controlli, acido folico e i segnali per cui chiamare il medico.",
    },
  },
  hr: {
    "heart-health": {
      title: "Zdravlje srca",
      description:
        "Jednostavne navike za zdrav tlak i snažno srce.",
    },
    diabetes: {
      title: "Prevencija dijabetesa",
      description:
        "Rani znakovi i kako držati šećer u krvi stabilnim.",
    },
    "healthy-eating": {
      title: "Zdrava prehrana",
      description:
        "Povoljni i zasitni obroci s manje soli i šećera.",
    },
    "physical-activity": {
      title: "Tjelesna aktivnost",
      description:
        "Kako se kretati više svaki dan, u svakoj dobi, bez teretane.",
    },
    "mental-wellbeing": {
      title: "Mentalno zdravlje",
      description:
        "Prepoznaj stres i brige koje ne prolaze i pronađi besplatnu pomoć.",
    },
    smoking: {
      title: "Pušenje i alkohol",
      description:
        "Kako prestati pušiti, piti manje i tko ti može pomoći.",
    },
    "preventive-screening": {
      title: "Preventivni pregledi",
      description:
        "Besplatni pregledi koji otkrivaju bolesti rano, prije boli.",
    },
    "womens-health": {
      title: "Trudnoća",
      description:
        "Pregledi, folna kiselina i znakovi zbog kojih treba zvati liječnika.",
    },
  },
  rom: {
    "heart-health": {
      title: "Sastipen e ilesko",
      description:
        "Lokhe tabijetura vash normalno tensija thaj zuralo ilo.",
    },
    diabetes: {
      title: "Arakhimos katar o dijabeto",
      description:
        "Anglune semnja thaj sar te inkeres o gudlo rat ando balanso.",
    },
    "healthy-eating": {
      title: "Sasto xaben",
      description:
        "Ieftino thaj čaljardo xaben maj xanci lonesa thaj zaharosa.",
    },
    "physical-activity": {
      title: "Fizikani aktivnost",
      description:
        "Sar te phires maj but sako dives, ki sako vrjama, bi salako.",
    },
    "mental-wellbeing": {
      title: "Sastipen e godjako",
      description:
        "Pinzhar o streso thaj e brige save na nakhen thaj arakh bi-lovesko azhutimos.",
    },
    smoking: {
      title: "Duhano thaj pimos",
      description:
        "Sar te mukes o duhano, te pes maj tsera thaj kon azhutil tut.",
    },
    "preventive-screening": {
      title: "Preventivno dikhiben",
      description:
        "Bi-loveske dikhibena save arakhen nasvalipena rano, anglal te dukhal.",
    },
    "womens-health": {
      title: "Khabnipen",
      description:
        "Kontrolura, folno acido thaj e semnura kana akhares e doktores.",
    },
  },
};

export const HEALTH_TOPICS_BASE = [
  { slug: "heart-health", categorySlug: "inima", readMinutes: 3, audioMinutes: 2 },
  { slug: "diabetes", categorySlug: "diabet", readMinutes: 4, audioMinutes: 3 },
  { slug: "healthy-eating", categorySlug: "nutritie", readMinutes: 3, audioMinutes: 2 },
  { slug: "physical-activity", categorySlug: "miscare", readMinutes: 2, audioMinutes: 2 },
  { slug: "mental-wellbeing", categorySlug: "minte", readMinutes: 4, audioMinutes: 3 },
  { slug: "smoking", categorySlug: "fumat", readMinutes: 3, audioMinutes: 2 },
  { slug: "preventive-screening", categorySlug: "screening", readMinutes: 3, audioMinutes: 2 },
  { slug: "womens-health", categorySlug: "femei", readMinutes: 4, audioMinutes: 3 },
];

const TOPIC_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "heart-health": HeartIcon,
  diabetes: DropletIcon,
  "healthy-eating": AppleIcon,
  "physical-activity": ActivityIcon,
  "mental-wellbeing": BrainIcon,
  smoking: NoSmokingIcon,
  "preventive-screening": SearchIcon,
  "womens-health": ShieldIcon,
};

/**
 * The interactive tool inside each guide, named in every language. Shown on the guide cards so a
 * reader sees that a guide holds something to do, not only something to read.
 */
export const TOOL_LABELS_BY_SLUG: Record<string, Record<Lang, string>> = {
  // Named for what the reader gets, in everyday words. The Romani names are the earlier ones,
  // kept until a native speaker can check new wording.
  "heart-health": {
    ro: "Înțelege-ți tensiunea",
    en: "Understand your blood pressure",
    sq: "Kupto tensionin tënd",
    it: "Capisci la tua pressione",
    hr: "Razumij svoj krvni tlak",
    rom: "Dikhiben e ratesko presia",
    ru: "Что значит ваше давление",
  },
  diabetes: {
    ro: "Înțelege-ți glicemia",
    en: "Understand your blood sugar",
    sq: "Kupto sheqerin në gjak",
    it: "Capisci la tua glicemia",
    hr: "Razumij svoj šećer u krvi",
    rom: "Dikhiben e guglimasko",
    ru: "Что значит ваш сахар в крови",
  },
  "healthy-eating": {
    ro: "Câtă sare mănânci",
    en: "How much salt you eat",
    sq: "Sa kripë ha",
    it: "Quanto sale mangi",
    hr: "Koliko soli jedeš",
    rom: "Kalkulatoro e lonesko",
    ru: "Сколько соли вы едите",
  },
  "physical-activity": {
    ro: "Planul tău de mișcare",
    en: "Your movement plan",
    sq: "Plani yt i lëvizjes",
    it: "Il tuo piano di movimento",
    hr: "Tvoj plan kretanja",
    rom: "Plano e miškipnasko",
    ru: "Ваш план движения",
  },
  "mental-wellbeing": {
    ro: "Exercițiu de respirație",
    en: "Breathing exercise",
    sq: "Ushtrimi i frymëmarrjes",
    it: "Esercizio di respirazione",
    hr: "Vježba disanja",
    rom: "Phurdipen thaj relaksacia",
    ru: "Дыхательное упражнение",
  },
  smoking: {
    ro: "Planul tău de renunțare la fumat",
    en: "Your plan to stop smoking",
    sq: "Plani yt për të lënë duhanin",
    it: "Il tuo piano per non fumare più",
    hr: "Tvoj plan za prestanak pušenja",
    rom: "Ažutipen te mekes o duvano",
    ru: "Ваш план отказа от курения",
  },
  "preventive-screening": {
    ro: "Ce analize îți trebuie",
    en: "Which check-ups you need",
    sq: "Cilat kontrolle të duhen",
    it: "Quali controlli ti servono",
    hr: "Koji pregledi ti trebaju",
    rom: "Alosaripen e kontrolengo",
    ru: "Какие обследования вам нужны",
  },
  "womens-health": {
    ro: "Sănătatea femeii, pas cu pas",
    en: "Women's health, step by step",
    sq: "Shëndeti i gruas, hap pas hapi",
    it: "Salute della donna, passo passo",
    hr: "Zdravlje žena, korak po korak",
    rom: "Dikhiben sastipen e džuvljengo",
    ru: "Женское здоровье, шаг за шагом",
  },
};

const TOPIC_KEY_FACT_INDEX: Record<string, number> = {
  "heart-health": 0,
  diabetes: 0,
  "healthy-eating": 1,
  "physical-activity": 1,
  "mental-wellbeing": 1,
  smoking: 0,
  "preventive-screening": 0,
  "womens-health": 0,
};

export function getHealthTopicsList(lang: Lang = "ro"): TopicItem[] {
  const summaries = HEALTH_TOPIC_CARD_SUMMARIES[lang] || HEALTH_TOPIC_CARD_SUMMARIES.ro;
  const fullDict = getHealthInformationDictionary(lang);
  return HEALTH_TOPICS_BASE.map((base) => {
    const fullTopic = fullDict.topics.find((t) => t.slug === base.slug);
    const factIdx = TOPIC_KEY_FACT_INDEX[base.slug] ?? 0;
    const firstRec = fullTopic?.recommendations?.[0];
    return {
      ...base,
      title: summaries[base.slug]?.title ?? base.slug,
      description: summaries[base.slug]?.description ?? "",
      image:
        base.slug === "heart-health"
          ? "/images/health-topics/heart-health-care.jpg"
          : `/images/health-topics/${base.slug}.jpg`,
      keyFact: fullTopic?.keyFacts?.[factIdx] ?? fullTopic?.keyFacts?.[0] ?? "",
      recommendationTitle: firstRec?.title ?? "",
      recommendationBody: firstRec?.description ?? "",
      icon: TOPIC_ICONS[base.slug] ?? HeartIcon,
    };
  });
}

export const HEALTH_TOPICS_LIST: TopicItem[] = getHealthTopicsList("ro");

/** The four main guides shown on the guides page, in this order. */
export const FEATURED_GUIDE_SLUGS = ["womens-health", "heart-health", "mental-wellbeing", "smoking"] as const;

export function getFeaturedHealthTopics(lang: Lang = "ro"): TopicItem[] {
  const topics = getHealthTopicsList(lang);
  return FEATURED_GUIDE_SLUGS.flatMap((slug) => topics.filter((topic) => topic.slug === slug));
}

export function getHealthTopicGridDictionary(lang: Lang) {
  return (
    translations[lang]?.healthInfoPage?.topicGrid ??
    translations.ro.healthInfoPage.topicGrid!
  );
}
