"use client";

import { useContext, useState } from "react";
import { AlertCircleIcon, CheckCircleIcon, CheckIcon } from "@/components/ui/icons";
import { LanguageContext } from "@/lib/i18n/language-context";
import {
  ROW_CLASS,
  ROW_LIST_CLASS,
  ROW_LIST_SINGLE_CLASS,
  STEP_LIST_CLASS,
  radioDotClass,
  stepCellClass,
  stepNumberClass,
} from "./choice-styles";
import type { Lang } from "@/lib/i18n/translations";

export interface DiabetesStepTutorialsModuleProps {
  initialTab?: TutorialTab;
  lang?: Lang;
}

export type TutorialTab = "glucometer" | "footcare";

interface StepDetail {
  number: number;
  title: string;
  action: string;
  doctorTip: string;
  mistakeToAvoid: string;
}

interface TutorialProgram {
  id: TutorialTab;
  tabLabel: string;
  title: string;
  badge: string;
  summary: string;
  steps: StepDetail[];
  clinicalRedFlags: string[];
}

type FootHotspotId = "heel" | "hallux" | "web_spaces" | "plantar_arch" | "lateral_margin";

interface FootHotspot {
  id: FootHotspotId;
  name: string;
  /** Label on the quick-select button. */
  shortName: string;
  inspectionNote: string;
}

interface TutorialsUiStrings {
  moduleAriaLabel: string;
  title: string;
  description: string;
  tabSelectPrompt: string;
  stageLabel: string;
  ofFour: string;
  actionHeading: string;
  doctorTipHeading: string;
  mistakeHeading: string;
  redFlagsHeading: string;
  stepDoneToggle: string;
  stepMarkDone: string;
  hotspotsHeading: string;
  hotspotsSubtitle: string;
  tapHotspotPrompt: string;
  hotspotSelectedLabel: string;
}

const UI_STRINGS: Record<Lang, TutorialsUiStrings> = {
  ru: {
    moduleAriaLabel: "Практические руководства по диабету",
    title: "Проверка уровня сахара в крови и уход за ногами",
    description:
      "Выполнение этих действий дома предотвращает многие проблемы. Выберите гида и следуйте инструкциям.",
    tabSelectPrompt: "Выберите гида",
    stageLabel: "Шаг",
    ofFour: "из 4",
    actionHeading: "Что делать:",
    doctorTipHeading: "Полезный совет",
    mistakeHeading: "Распространенная ошибка",
    redFlagsHeading: "Когда звонить семейному врачу",
    stepDoneToggle: "Готово",
    stepMarkDone: "понял",
    hotspotsHeading: "Куда смотреть, когда проверяешь ноги",
    hotspotsSubtitle: "Коснитесь одной из 5 точек, чтобы увидеть, что искать.",
    tapHotspotPrompt: "Выберите область подошвы",
    hotspotSelectedLabel: "Выбранная территория:",
  },

  ro: {
    moduleAriaLabel: "Ghiduri practice pentru diabet",
    title: "Cum îți măsori zahărul și cum îți îngrijești picioarele",
    description:
      "Dacă faci corect aceste lucruri acasă, previi multe probleme. Alege un ghid și urmează pașii.",
    tabSelectPrompt: "Alege ghidul",
    stageLabel: "Pasul",
    ofFour: "din 4",
    actionHeading: "Ce faci:",
    doctorTipHeading: "Sfat util",
    mistakeHeading: "Greșeală frecventă",
    redFlagsHeading: "Când suni la medicul de familie",
    stepDoneToggle: "Pas bifat",
    stepMarkDone: "Am înțeles",
    hotspotsHeading: "Unde te uiți când îți verifici talpa",
    hotspotsSubtitle: "Apasă pe unul din cele 5 puncte ca să vezi la ce să fii atent.",
    tapHotspotPrompt: "Alege o zonă de pe talpă",
    hotspotSelectedLabel: "Zona aleasă:",
  },
  en: {
    moduleAriaLabel: "Practical diabetes guides",
    title: "Checking your blood sugar and caring for your feet",
    description:
      "Doing these things right at home prevents many problems. Choose a guide and follow the steps.",
    tabSelectPrompt: "Choose a guide",
    stageLabel: "Step",
    ofFour: "of 4",
    actionHeading: "What to do:",
    doctorTipHeading: "Helpful tip",
    mistakeHeading: "Common mistake",
    redFlagsHeading: "When to call your family doctor",
    stepDoneToggle: "Done",
    stepMarkDone: "Got it",
    hotspotsHeading: "Where to look when you check your feet",
    hotspotsSubtitle: "Tap one of the 5 points to see what to look for.",
    tapHotspotPrompt: "Choose an area of the sole",
    hotspotSelectedLabel: "Selected area:",
  },
  sq: {
    moduleAriaLabel: "Udhëzime praktike për diabetin",
    title: "Si të masësh sheqerin dhe të kujdesesh për këmbët",
    description:
      "Kur i bën saktë këto në shtëpi, shmang shumë probleme. Zgjidh një udhëzim dhe ndiq hapat.",
    tabSelectPrompt: "Zgjidh udhëzimin",
    stageLabel: "Hapi",
    ofFour: "nga 4",
    actionHeading: "Çfarë të bësh:",
    doctorTipHeading: "Këshillë e dobishme",
    mistakeHeading: "Gabim i shpeshtë",
    redFlagsHeading: "Kur të telefonosh mjekun e familjes",
    stepDoneToggle: "U krye",
    stepMarkDone: "E kuptova",
    hotspotsHeading: "Ku të shikosh kur kontrollon shputën",
    hotspotsSubtitle: "Prek një nga 5 pikat për të parë çfarë të shikosh.",
    tapHotspotPrompt: "Zgjidh një zonë të shputës",
    hotspotSelectedLabel: "Zona e zgjedhur:",
  },
  it: {
    moduleAriaLabel: "Guide pratiche sul diabete",
    title: "Misurare la glicemia e curare i piedi",
    description:
      "Se fai bene queste cose a casa, eviti molti problemi. Scegli una guida e segui i passi.",
    tabSelectPrompt: "Scegli la guida",
    stageLabel: "Passo",
    ofFour: "di 4",
    actionHeading: "Cosa fare:",
    doctorTipHeading: "Consiglio utile",
    mistakeHeading: "Errore comune",
    redFlagsHeading: "Quando chiamare il medico di famiglia",
    stepDoneToggle: "Fatto",
    stepMarkDone: "Ho capito",
    hotspotsHeading: "Dove guardare quando controlli i piedi",
    hotspotsSubtitle: "Tocca uno dei 5 punti per vedere a cosa fare attenzione.",
    tapHotspotPrompt: "Scegli una zona della pianta",
    hotspotSelectedLabel: "Zona scelta:",
  },
  hr: {
    moduleAriaLabel: "Praktične upute za šećernu bolest",
    title: "Mjerenje glukoze u krvi i njega stopala",
    description:
      "Ako ove korake kod kuće radiš pravilno, sprječavaš brojne komplikacije. Odaberi vodič i slijedi korake.",
    tabSelectPrompt: "Odaberi vodič",
    stageLabel: "Korak",
    ofFour: "od 4",
    actionHeading: "Što učiniti:",
    doctorTipHeading: "Koristan savjet",
    mistakeHeading: "Česta pogreška",
    redFlagsHeading: "Kada nazvati obiteljskog liječnika",
    stepDoneToggle: "Dovršeno",
    stepMarkDone: "Razumijem",
    hotspotsHeading: "Gdje gledati pri pregledu tabana",
    hotspotsSubtitle: "Dodirni jednu od 5 točaka i pogledaj na što trebaš paziti.",
    tapHotspotPrompt: "Odaberi područje tabana",
    hotspotSelectedLabel: "Odabrano područje:",
  },
  rom: {
    moduleAriaLabel: "Kherutne siklyarimata vash o gudlo rat",
    title: "Sar te mares o zaharo and-o rat thaj sar te arakhes che punre",
    description:
      "Kana keres kadava vorta khere, arakhes tut katar but nasvalimata. Alosar ekh siklyarimos thaj zha palal le pasurya.",
    tabSelectPrompt: "Alosar o siklyarimos",
    stageLabel: "Paso",
    ofFour: "katar 4",
    actionHeading: "So te keres:",
    doctorTipHeading: "Lachho svato",
    mistakeHeading: "Dosh so kerel pe butivar",
    redFlagsHeading: "Kana te mares ko familiyako doktori",
    stepDoneToggle: "Kerdo",
    stepMarkDone: "Hatyarav",
    hotspotsHeading: "Kay te dikhes kana dikhes che talpe",
    hotspotsSubtitle: "Azba ekh katar le 5 thana te dikhes sostar te arakhes tut.",
    tapHotspotPrompt: "Alosar ekh than pe talpa",
    hotspotSelectedLabel: "Alosardo than:",
  },
};

const TUTORIALS_DATA: Record<Lang, Record<TutorialTab, TutorialProgram>> = {
  ru: {
    glucometer: {
      id: "glucometer",
      tabLabel: "Проверка уровня сахара в крови глюкометром",
      title: "Как правильно проверить уровень сахара в крови",
      badge: "Дома, со своим счетчиком",
      summary:
        "Если вы сделаете тест правильно, ваш врач получит хорошие результаты. Вы также увидите, как еда и движение меняют уровень сахара в крови.",
      steps: [
        {
          number: 1,
          title: "Вымойте и высушите руки",
          action:
            "Wash your hands with warm water and plain soap. Dry them well with a clean towel. Warm water brings blood into your fingers.",
          doctorTip:
            "Не используйте медицинский спирт или ароматизированные влажные салфетки. Спирт сушит кожу, а духи или глицерин могут испортить результат.",
          mistakeToAvoid:
            "Не прокалывайте мокрый палец. Вода разжижает кровь и счетчик показывает меньшую цифру, чем реальная.",
        },
        {
          number: 2,
          title: "Подготовьте глюкометр и иглу.",
          action:
            "Put a new strip into the meter until you hear a click or see the drop sign on the screen. Put a new needle (lancet) in the pricker and set it to depth 2 or 3.",
          doctorTip:
            "Храните коробку со стрипами плотно закрытой, в сухом месте, вдали от солнечных лучей и тепла.",
          mistakeToAvoid:
            "Не используйте одну и ту же иглу более одного раза. Тупая игла причиняет больше боли и повреждает кожу.",
        },
        {
          number: 3,
          title: "Уколите боковую часть пальца",
          action:
            "Prick the side of your fingertip, not the middle. Gently rub the finger from base to tip until a round drop forms. Touch the drop with the end of the strip.",
          doctorTip:
            "По бокам меньше нервов, чем посередине, поэтому болит меньше.",
          mistakeToAvoid:
            "Не сжимайте палец сильно. Тканевая жидкость тоже выходит наружу, разжижает кровь и портит результат.",
        },
        {
          number: 4,
          title: "Прочитай, запиши, иголку выбрось.",
          action:
            "Wait 5 seconds for the number. Write it in a notebook or app, with the time and whether it was before or after a meal. Put the cap on the needle and throw it into a hard plastic bottle or box.",
          doctorTip:
            "Одна только цифра не расскажет всей истории. Также запишите, что вы ели, чтобы обсудить это со своим врачом.",
          mistakeToAvoid:
            "Не выбрасывайте иглы без колпачков в обычный мусор. Кто-то мог уколоться.",
        },
      ],
      clinicalRedFlags: [
        "У вас уровень ниже 70 мг/дл, и вы чувствуете головокружение или не можете ясно мыслить. Используйте правило 15/15.",
        "У вас часто уровень выше 250 мг/дл, и вы не знаете, какая пища вызвала это.",
        "Счетчик часто показывает ошибку. Проверьте срок годности полосок или батарею.",
      ],
    },
    footcare: {
      id: "footcare",
      tabLabel: "Ежедневный уход за ногами",
      title: "Как защитить ноги от ран",
      badge: "Каждый вечер",
      summary:
        "Диабет может привести к онемению ног. Тогда вы плохо чувствуете боль или жар. Небольшая мозоль или порез могут остаться незамеченными, если не осматривать их каждый день.",
      steps: [
        {
          number: 1,
          title: "Смотри на свои подошвы каждый вечер",
          action:
            "Every evening, in good light, look closely at your soles, heels and between your toes. If you cannot lift your foot, put a mirror on the floor or ask someone in your family.",
          doctorTip:
            "Обратите внимание на покраснения, волдыри, трещины или пятна, которые кажутся теплыми.",
          mistakeToAvoid:
            "Не игнорируйте красное пятно или мозоль и надейтесь, что оно исчезнет. При диабете раны заживают медленнее.",
        },
        {
          number: 2,
          title: "Хорошо вымойте и высушите ноги",
          action:
            "Wash your feet every day with lukewarm water and mild soap. Do not soak them for more than 5 minutes, so the skin does not dry out. Pat them dry with a soft towel, especially between the toes.",
          doctorTip:
            "Проверяйте воду локтем или термометром, а не ногой. Ваша нога может не чувствовать, что вода слишком горячая.",
          mistakeToAvoid:
            "Не оставляйте кожу между пальцами ног влажной. Там легко разрастается грибок.",
        },
        {
          number: 3,
          title: "Крем на пятках, а не между пальцами ног.",
          action:
            "Put urea cream or a simple greasy cream on your heels, soles and the top of your foot. The skin stays soft and does not crack.",
          doctorTip:
            "Микробы проникают через потрескавшуюся кожу. Использование крема часто сохраняет кожу целой.",
          mistakeToAvoid:
            "Не наносите крем между пальцами ног. Кожа там становится слишком мягкой и рвется.",
        },
        {
          number: 4,
          title: "Хорошие носки и клетчатая обувь.",
          action:
            "Wear white or light cotton socks, with no thick seams and no tight elastic at the ankle. Before you put your shoes on, feel inside with your hand for small stones, folds or nails.",
          doctorTip:
            "На белых носках сразу видишь небольшое пятнышко крови или гноя.",
          mistakeToAvoid:
            "Никогда не ходите босиком, даже дома или на пляже. Осколок или острый предмет могут оставить глубокую рану.",
        },
      ],
      clinicalRedFlags: [
        "Рана, порез или волдырь не зажили в течение 48 часов.",
        "Красная, опухшая или горячая область возле ногтя или на пятке.",
        "Онемение, покалывание или вы больше не чувствуете прикосновения.",
      ],
    },
  },

  ro: {
    glucometer: {
      id: "glucometer",
      tabLabel: "Măsurarea zahărului cu glucometrul",
      title: "Cum îți măsori corect zahărul din sânge",
      badge: "Acasă, cu glucometrul tău",
      summary:
        "Când măsori corect, medicul primește cifre bune. Și vezi singur cum îți schimbă mâncarea și mișcarea zahărul din sânge.",
      steps: [
        {
          number: 1,
          title: "Spală-te și usucă-te pe mâini",
          action:
            "Spală-te pe mâini cu apă caldă și săpun simplu. Usucă-le bine cu un prosop curat. Apa caldă aduce sângele în degete.",
          doctorTip:
            "Nu folosi spirt sau șervețele umede parfumate. Spirtul usucă pielea, iar parfumul sau glicerina pot strica rezultatul.",
          mistakeToAvoid:
            "Nu înțepa un deget ud. Apa subțiază sângele și aparatul arată o valoare mai mică decât e.",
        },
        {
          number: 2,
          title: "Pregătește aparatul și acul",
          action:
            "Pune o bandeletă nouă în aparat până auzi un clic sau vezi pe ecran semnul picăturii. Pune un ac nou în înțepător și alege adâncimea 2 sau 3.",
          doctorTip:
            "Ține cutia cu bandelete bine închisă, într-un loc uscat, ferit de soare și de căldură.",
          mistakeToAvoid:
            "Nu folosi același ac de mai multe ori. Acul tocit doare mai tare și rănește pielea.",
        },
        {
          number: 3,
          title: "Înțeapă pe marginea degetului",
          action:
            "Înțeapă pe marginea degetului, nu în mijlocul buricului. Masează ușor degetul de la bază spre vârf până se face o picătură rotundă. Atinge picătura cu capătul bandeletei.",
          doctorTip:
            "Pe margini sunt mai puțini nervi decât în mijloc, așa că doare mai puțin.",
          mistakeToAvoid:
            "Nu stoarce degetul tare. Iese și lichid din țesut, care subțiază sângele și strică rezultatul.",
        },
        {
          number: 4,
          title: "Citește, notează, aruncă acul",
          action:
            "Așteaptă 5 secunde să apară valoarea. Scrie rezultatul în caiet sau în aplicație, cu ora și dacă ai măsurat înainte sau după masă. Pune capacul pe ac și aruncă-l într-o sticlă sau cutie de plastic tare.",
          doctorTip:
            "O singură valoare nu spune tot. Notează și ce ai mâncat, ca să discuți cu medicul la control.",
          mistakeToAvoid:
            "Nu arunca acele fără capac la gunoiul obișnuit. Se poate înțepa cineva.",
        },
      ],
      clinicalRedFlags: [
        "Ai sub 70 mg/dL și ai amețeli sau nu gândești limpede. Folosește regula 15/15.",
        "Ai des peste 250 mg/dL și nu știi de la ce mâncare.",
        "Aparatul arată des un mesaj de eroare. Verifică data de expirare a bandeletelor sau bateria.",
      ],
    },
    footcare: {
      id: "footcare",
      tabLabel: "Îngrijirea zilnică a picioarelor",
      title: "Cum îți ferești picioarele de răni",
      badge: "În fiecare seară",
      summary:
        "Diabetul poate amorți picioarele. Atunci nu mai simți bine durerea sau căldura. O bășică sau o tăietură mică poate trece neobservată dacă nu te uiți zilnic.",
      steps: [
        {
          number: 1,
          title: "Uită-te la tălpi în fiecare seară",
          action:
            "Seara, la lumină bună, uită-te atent la tălpi, la călcâie și între degete. Dacă nu poți ridica piciorul, pune o oglindă pe jos sau roagă pe cineva din familie.",
          doctorTip:
            "Caută roșeață, bășici, crăpături sau locuri mai calde la atingere.",
          mistakeToAvoid:
            "Nu ignora o pată roșie sau o bătătură, crezând că trece singură. Cu diabet, rănile se vindecă mai greu.",
        },
        {
          number: 2,
          title: "Spală și usucă bine picioarele",
          action:
            "Spală picioarele zilnic cu apă călduță și săpun blând. Nu le ține în apă mai mult de 5 minute, ca să nu se usuce pielea. Tamponează-le cu un prosop moale, mai ales între degete.",
          doctorTip:
            "Încearcă apa cu cotul sau cu un termometru, nu cu piciorul. Piciorul poate să nu simtă că apa e prea fierbinte.",
          mistakeToAvoid:
            "Nu lăsa umezeală între degete. Acolo cresc ușor ciuperci.",
        },
        {
          number: 3,
          title: "Unge călcâiele, nu între degete",
          action:
            "Pune cremă cu uree sau o cremă grasă simplă pe călcâie, pe tălpi și pe partea de sus a piciorului. Pielea rămâne moale și nu crapă.",
          doctorTip:
            "Prin pielea crăpată intră microbii. Crema pusă des ține pielea întreagă.",
          mistakeToAvoid:
            "Nu pune cremă între degete. Pielea de acolo se înmoaie prea tare și se rănește.",
        },
        {
          number: 4,
          title: "Șosete bune și pantofi verificați",
          action:
            "Poartă șosete de bumbac, albe sau deschise la culoare, fără cusături groase și fără elastic strâns la gleznă. Înainte să te încalți, bagă mâna în pantof și caută pietricele, cute sau cuie.",
          doctorTip:
            "Pe șosetele albe vezi imediat o pată mică de sânge sau de puroi.",
          mistakeToAvoid:
            "Nu umbla desculț, nici prin casă, nici pe plajă. O așchie sau un ciob mic poate face o rană adâncă.",
        },
      ],
      clinicalRedFlags: [
        "O rană, o tăietură sau o bășică nu se vindecă în 48 de ore.",
        "Ai o zonă roșie, umflată sau fierbinte lângă o unghie sau pe călcâi.",
        "Ai amorțeală, furnicături sau nu mai simți atingerea.",
      ],
    },
  },
  en: {
    glucometer: {
      id: "glucometer",
      tabLabel: "Checking blood sugar with a meter",
      title: "How to check your blood sugar correctly",
      badge: "At home, with your meter",
      summary:
        "When you test correctly, your doctor gets good numbers. You also see how food and movement change your blood sugar.",
      steps: [
        {
          number: 1,
          title: "Wash and dry your hands",
          action:
            "Wash your hands with warm water and plain soap. Dry them well with a clean towel. Warm water brings blood into your fingers.",
          doctorTip:
            "Do not use rubbing alcohol or scented wet wipes. Alcohol dries the skin, and perfume or glycerine can spoil the result.",
          mistakeToAvoid:
            "Do not prick a wet finger. Water thins the blood and the meter shows a lower number than the real one.",
        },
        {
          number: 2,
          title: "Get the meter and needle ready",
          action:
            "Put a new strip into the meter until you hear a click or see the drop sign on the screen. Put a new needle (lancet) in the pricker and set it to depth 2 or 3.",
          doctorTip:
            "Keep the strip box tightly closed, in a dry place, away from sun and heat.",
          mistakeToAvoid:
            "Do not use the same needle more than once. A blunt needle hurts more and damages the skin.",
        },
        {
          number: 3,
          title: "Prick the side of your finger",
          action:
            "Prick the side of your fingertip, not the middle. Gently rub the finger from base to tip until a round drop forms. Touch the drop with the end of the strip.",
          doctorTip:
            "The sides have fewer nerves than the middle, so it hurts less.",
          mistakeToAvoid:
            "Do not squeeze the finger hard. Tissue fluid comes out too, thins the blood and spoils the result.",
        },
        {
          number: 4,
          title: "Read, write down, throw away the needle",
          action:
            "Wait 5 seconds for the number. Write it in a notebook or app, with the time and whether it was before or after a meal. Put the cap on the needle and throw it into a hard plastic bottle or box.",
          doctorTip:
            "One number alone does not tell the whole story. Also write down what you ate, so you can talk it over with your doctor.",
          mistakeToAvoid:
            "Do not throw uncapped needles in the normal rubbish. Someone could get pricked.",
        },
      ],
      clinicalRedFlags: [
        "You are under 70 mg/dL and feel dizzy or cannot think clearly. Use the 15/15 rule.",
        "You are often over 250 mg/dL and do not know which food caused it.",
        "The meter often shows an error. Check the strips' expiry date or the battery.",
      ],
    },
    footcare: {
      id: "footcare",
      tabLabel: "Daily foot care",
      title: "How to protect your feet from wounds",
      badge: "Every evening",
      summary:
        "Diabetes can make your feet numb. Then you do not feel pain or heat well. A small blister or cut can go unnoticed if you do not look every day.",
      steps: [
        {
          number: 1,
          title: "Look at your soles every evening",
          action:
            "Every evening, in good light, look closely at your soles, heels and between your toes. If you cannot lift your foot, put a mirror on the floor or ask someone in your family.",
          doctorTip:
            "Look for redness, blisters, cracks or spots that feel warm.",
          mistakeToAvoid:
            "Do not ignore a red spot or a callus and hope it goes away. With diabetes, wounds heal more slowly.",
        },
        {
          number: 2,
          title: "Wash and dry your feet well",
          action:
            "Wash your feet every day with lukewarm water and mild soap. Do not soak them for more than 5 minutes, so the skin does not dry out. Pat them dry with a soft towel, especially between the toes.",
          doctorTip:
            "Test the water with your elbow or a thermometer, not your foot. Your foot may not feel that the water is too hot.",
          mistakeToAvoid:
            "Do not leave the skin damp between your toes. Fungus grows easily there.",
        },
        {
          number: 3,
          title: "Cream on the heels, not between toes",
          action:
            "Put urea cream or a simple greasy cream on your heels, soles and the top of your foot. The skin stays soft and does not crack.",
          doctorTip:
            "Germs get in through cracked skin. Using cream often keeps the skin whole.",
          mistakeToAvoid:
            "Do not put cream between your toes. The skin there gets too soft and breaks.",
        },
        {
          number: 4,
          title: "Good socks and checked shoes",
          action:
            "Wear white or light cotton socks, with no thick seams and no tight elastic at the ankle. Before you put your shoes on, feel inside with your hand for small stones, folds or nails.",
          doctorTip:
            "On white socks you see a small spot of blood or pus straight away.",
          mistakeToAvoid:
            "Never walk barefoot, not even at home or on the beach. A splinter or a sharp bit can make a deep wound.",
        },
      ],
      clinicalRedFlags: [
        "A wound, cut or blister has not healed after 48 hours.",
        "A red, swollen or hot area near a toenail or on the heel.",
        "Numbness, tingling, or you no longer feel touch.",
      ],
    },
  },
  sq: {
    glucometer: {
      id: "glucometer",
      tabLabel: "Matja e sheqerit me aparat",
      title: "Si ta masësh saktë sheqerin në gjak",
      badge: "Në shtëpi, me aparatin tënd",
      summary:
        "Kur mat saktë, mjeku merr shifra të sakta. Edhe ti sheh si e ndryshojnë ushqimi dhe lëvizja sheqerin në gjak.",
      steps: [
        {
          number: 1,
          title: "Laj dhe thaji duart",
          action:
            "Laji duart me ujë të ngrohtë dhe sapun të thjeshtë. Thaji mirë me një peshqir të pastër. Uji i ngrohtë e sjell gjakun te gishtat.",
          doctorTip:
            "Mos përdor alkool ose peceta të lagura me aromë. Alkooli e than lëkurën, ndërsa parfumi ose glicerina mund ta prishin rezultatin.",
          mistakeToAvoid:
            "Mos e shpo gishtin kur është i lagur. Uji e hollon gjakun dhe aparati tregon më pak nga sa është.",
        },
        {
          number: 2,
          title: "Përgatit aparatin dhe gjilpërën",
          action:
            "Fut një shirit të ri në aparat derisa të dëgjosh një klik ose të shohësh shenjën e pikës në ekran. Vendos një gjilpërë të re te shpuesi dhe zgjidh thellësinë 2 ose 3.",
          doctorTip:
            "Mbaje kutinë e shiritave të mbyllur mirë, në vend të thatë, larg diellit dhe nxehtësisë.",
          mistakeToAvoid:
            "Mos e përdor të njëjtën gjilpërë disa herë. Gjilpëra e topitur dhemb më shumë dhe e dëmton lëkurën.",
        },
        {
          number: 3,
          title: "Shpo anën e gishtit",
          action:
            "Shpo anën e majës së gishtit, jo mesin. Fërko lehtë gishtin nga baza drejt majës derisa të dalë një pikë e rrumbullakët. Prek pikën me fundin e shiritit.",
          doctorTip:
            "Anët kanë më pak nerva se mesi, ndaj dhemb më pak.",
          mistakeToAvoid:
            "Mos e shtrydh fort gishtin. Del edhe lëng nga indet, që e hollon gjakun dhe e prish rezultatin.",
        },
        {
          number: 4,
          title: "Lexo, shëno, hidh gjilpërën",
          action:
            "Prit 5 sekonda derisa të dalë vlera. Shkruaje në fletore ose në aplikacion, me orën dhe nëse ishte para apo pas ngrënies. Vëri kapakun gjilpërës dhe hidhe në një shishe ose kuti plastike të fortë.",
          doctorTip:
            "Një vlerë e vetme nuk tregon gjithçka. Shëno edhe çfarë ke ngrënë, që ta diskutosh me mjekun.",
          mistakeToAvoid:
            "Mos i hidh gjilpërat pa kapak te plehrat e zakonshme. Mund të shpohet dikush.",
        },
      ],
      clinicalRedFlags: [
        "Ke nën 70 mg/dL dhe të merren mendtë ose nuk mendon qartë. Përdor rregullin 15/15.",
        "Ke shpesh mbi 250 mg/dL dhe nuk e di nga cili ushqim.",
        "Aparati tregon shpesh gabim. Kontrollo datën e skadencës së shiritave ose baterinë.",
      ],
    },
    footcare: {
      id: "footcare",
      tabLabel: "Kujdesi i përditshëm për këmbët",
      title: "Si t'i mbrosh këmbët nga plagët",
      badge: "Çdo mbrëmje",
      summary:
        "Diabeti mund t'i mpijë këmbët. Atëherë nuk e ndien mirë dhimbjen ose nxehtësinë. Një fshikëz ose prerje e vogël mund të mos vihet re nëse nuk shikon çdo ditë.",
      steps: [
        {
          number: 1,
          title: "Shiko shputat çdo mbrëmje",
          action:
            "Çdo mbrëmje, në dritë të mirë, shiko me kujdes shputat, thembrat dhe mes gishtave. Nëse nuk e ngre dot këmbën, vendos një pasqyrë në dysheme ose kërko ndihmë nga dikush në familje.",
          doctorTip:
            "Kërko skuqje, fshikëza, çarje ose vende që janë të ngrohta kur i prek.",
          mistakeToAvoid:
            "Mos e lër pas dore një njollë të kuqe ose një kallo, duke menduar se kalon vetë. Me diabet, plagët shërohen më ngadalë.",
        },
        {
          number: 2,
          title: "Laji dhe thaji mirë këmbët",
          action:
            "Laji këmbët çdo ditë me ujë të vakët dhe sapun të butë. Mos i mbaj në ujë më shumë se 5 minuta, që të mos thahet lëkura. Thaji me një peshqir të butë, sidomos mes gishtave.",
          doctorTip:
            "Provoje ujin me bërryl ose me termometër, jo me këmbë. Këmba mund të mos e ndiejë që uji është shumë i nxehtë.",
          mistakeToAvoid:
            "Mos lër lagështi mes gishtave. Aty rriten lehtë kërpudhat.",
        },
        {
          number: 3,
          title: "Krem te thembrat, jo mes gishtave",
          action:
            "Vër krem me ure ose një krem të thjeshtë yndyror në thembra, në shputa dhe sipër këmbës. Lëkura mbetet e butë dhe nuk çahet.",
          doctorTip:
            "Mikrobet hyjnë nga lëkura e çarë. Kremi i përdorur shpesh e mban lëkurën të shëndoshë.",
          mistakeToAvoid:
            "Mos vër krem mes gishtave. Lëkura aty zbutet shumë dhe dëmtohet.",
        },
        {
          number: 4,
          title: "Çorape të mira dhe këpucë të kontrolluara",
          action:
            "Vish çorape pambuku të bardha ose të çelura, pa qepje të trasha dhe pa llastik të shtrënguar te kyçi. Para se të mbathësh këpucët, fut dorën brenda dhe kërko guralecë, palosje ose gozhdë.",
          doctorTip:
            "Te çorapet e bardha sheh menjëherë një njollë të vogël gjaku ose qelbi.",
          mistakeToAvoid:
            "Mos ec kurrë zbathur, as në shtëpi, as në plazh. Një ashkël ose një copë e mprehtë mund të bëjë plagë të thellë.",
        },
      ],
      clinicalRedFlags: [
        "Një plagë, prerje ose fshikëz nuk shërohet pas 48 orësh.",
        "Një zonë e kuqe, e fryrë ose e nxehtë pranë thoit ose te thembra.",
        "Mpirje, therje ose nuk e ndien më prekjen.",
      ],
    },
  },
  it: {
    glucometer: {
      id: "glucometer",
      tabLabel: "Misurare la glicemia con il glucometro",
      title: "Come misurare bene lo zucchero nel sangue",
      badge: "A casa, con il tuo glucometro",
      summary:
        "Se misuri bene, il medico ha numeri giusti. E vedi tu stesso come cibo e movimento cambiano la glicemia.",
      steps: [
        {
          number: 1,
          title: "Lava e asciuga le mani",
          action:
            "Lavati le mani con acqua calda e sapone semplice. Asciugale bene con un asciugamano pulito. L'acqua calda porta il sangue alle dita.",
          doctorTip:
            "Non usare alcol o salviette umide profumate. L'alcol secca la pelle, e profumo o glicerina possono falsare il risultato.",
          mistakeToAvoid:
            "Non pungere un dito bagnato. L'acqua diluisce il sangue e il valore risulta più basso del vero.",
        },
        {
          number: 2,
          title: "Prepara glucometro e pungidito",
          action:
            "Inserisci una striscia nuova nel glucometro finché senti un clic o vedi il simbolo della goccia. Metti una lancetta nuova nel pungidito e scegli la profondità 2 o 3.",
          doctorTip:
            "Tieni la scatola delle strisce ben chiusa, in un posto asciutto, lontano da sole e calore.",
          mistakeToAvoid:
            "Non usare la stessa lancetta più volte. Una punta consumata fa più male e rovina la pelle.",
        },
        {
          number: 3,
          title: "Pungi il lato del dito",
          action:
            "Pungi il lato del polpastrello, non il centro. Massaggia piano il dito dalla base alla punta finché si forma una goccia tonda. Tocca la goccia con la punta della striscia.",
          doctorTip:
            "Ai lati ci sono meno nervi che al centro, quindi fa meno male.",
          mistakeToAvoid:
            "Non spremere forte il dito. Esce anche liquido dei tessuti, che diluisce il sangue e falsa il risultato.",
        },
        {
          number: 4,
          title: "Leggi, scrivi, butta la lancetta",
          action:
            "Aspetta 5 secondi che compaia il valore. Scrivilo su un quaderno o nell'app, con l'ora e se era prima o dopo il pasto. Rimetti il cappuccio alla lancetta e buttala in una bottiglia o scatola di plastica rigida.",
          doctorTip:
            "Un solo valore non dice tutto. Scrivi anche cosa hai mangiato, così ne parli con il medico.",
          mistakeToAvoid:
            "Non buttare lancette senza cappuccio nei rifiuti di casa. Qualcuno potrebbe pungersi.",
        },
      ],
      clinicalRedFlags: [
        "Hai meno di 70 mg/dL e hai capogiri o non riesci a ragionare bene. Usa la regola 15/15.",
        "Hai spesso più di 250 mg/dL e non sai quale cibo l'ha causato.",
        "Il glucometro mostra spesso un errore. Controlla la scadenza delle strisce o la batteria.",
      ],
    },
    footcare: {
      id: "footcare",
      tabLabel: "Cura dei piedi ogni giorno",
      title: "Come proteggere i piedi dalle ferite",
      badge: "Ogni sera",
      summary:
        "Il diabete può rendere i piedi poco sensibili. Allora non senti bene il dolore o il caldo. Una piccola vescica o un taglio possono passare inosservati se non guardi ogni giorno.",
      steps: [
        {
          number: 1,
          title: "Guarda le piante ogni sera",
          action:
            "Ogni sera, con una buona luce, guarda bene piante, talloni e tra le dita. Se non riesci ad alzare il piede, metti uno specchio a terra o chiedi a qualcuno in famiglia.",
          doctorTip:
            "Cerca rossori, vesciche, crepe o zone calde al tatto.",
          mistakeToAvoid:
            "Non ignorare un puntino rosso o un callo pensando che passi da solo. Con il diabete le ferite guariscono più lentamente.",
        },
        {
          number: 2,
          title: "Lava e asciuga bene i piedi",
          action:
            "Lava i piedi ogni giorno con acqua tiepida e sapone delicato. Non tenerli in acqua più di 5 minuti, così la pelle non si secca. Tamponali con un asciugamano morbido, soprattutto tra le dita.",
          doctorTip:
            "Prova l'acqua con il gomito o con un termometro, non con il piede. Il piede potrebbe non sentire che l'acqua è troppo calda.",
          mistakeToAvoid:
            "Non lasciare umido tra le dita. Lì crescono facilmente i funghi.",
        },
        {
          number: 3,
          title: "Crema sui talloni, non tra le dita",
          action:
            "Metti una crema all'urea o una crema grassa semplice su talloni, pianta e dorso del piede. La pelle resta morbida e non si spacca.",
          doctorTip:
            "I microbi entrano dalla pelle screpolata. La crema usata spesso tiene la pelle integra.",
          mistakeToAvoid:
            "Non mettere crema tra le dita. Lì la pelle si ammorbidisce troppo e si rovina.",
        },
        {
          number: 4,
          title: "Calze giuste e scarpe controllate",
          action:
            "Metti calze di cotone bianche o chiare, senza cuciture spesse e senza elastico stretto alla caviglia. Prima di metterti le scarpe, passa la mano dentro e cerca sassolini, pieghe o chiodi.",
          doctorTip:
            "Sulle calze bianche vedi subito una macchiolina di sangue o di pus.",
          mistakeToAvoid:
            "Non camminare mai scalzo, nemmeno in casa o in spiaggia. Una scheggia o un pezzetto tagliente possono fare una ferita profonda.",
        },
      ],
      clinicalRedFlags: [
        "Una ferita, un taglio o una vescica non guarisce dopo 48 ore.",
        "Una zona rossa, gonfia o calda vicino a un'unghia o sul tallone.",
        "Intorpidimento, formicolio, oppure non senti più il tocco.",
      ],
    },
  },
  hr: {
    glucometer: {
      id: "glucometer",
      tabLabel: "Mjerenje glukoze u krvi glukometrom",
      title: "Kako pravilno izmjeriti glukozu u krvi",
      badge: "Kod kuće, svojim uređajem",
      summary:
        "Kada mjeriš pravilno, tvoj obiteljski liječnik dobiva točne podatke. Uz to i sam vidiš kako hrana i kretanje utječu na glukozu u krvi.",
      steps: [
        {
          number: 1,
          title: "Operi i osuši ruke",
          action:
            "Operi ruke toplom vodom i običnim sapunom. Dobro ih obriši čistim ručnikom. Topla voda potiče protok krvi u jagodicama prstiju.",
          doctorTip:
            "Nemoj koristiti medicinski alkohol ni mirisne vlažne maramice. Alkohol isušuje kožu, a mirisi ili glicerin mogu iskriviti nalaz.",
          mistakeToAvoid:
            "Nemoj bosti mokar prst. Voda razrjeđuje kap krvi pa glukometar pokaže nižu vrijednost od stvarne.",
        },
        {
          number: 2,
          title: "Pripremi glukometar i lancetu",
          action:
            "Umetni novu test-trakicu u uređaj dok ne čuješ klik ili na zaslonu vidiš znak kapljice. Stavi novu iglicu (lancetu) u lancetar i podesi dubinu na 2 ili 3.",
          doctorTip:
            "Kutijicu s trakicama drži čvrsto zatvorenu na suhome mjestu, podalje od sunca i topline.",
          mistakeToAvoid:
            "Nemoj koristiti istu lancetu više puta. Tupa iglica jače boli i oštećuje kožu.",
        },
        {
          number: 3,
          title: "Ubodi bočnu stranu jagodice",
          action:
            "Ubodi bočnu stranu jagodice prsta, a ne samu sredinu. Nježno masiraj prst od korijena prema vrhu dok se ne stvori okrugla kapljica. Prisloni vrh trakice uz kapljicu.",
          doctorTip:
            "Na bočnim stranama prsta ima manje živčanih završetaka nego u sredini pa ubod manje boli.",
          mistakeToAvoid:
            "Nemoj snažno cijediti vrh prsta. Tako izlazi i tkivna tekućina koja razrjeđuje krv i kvari rezultat.",
        },
        {
          number: 4,
          title: "Očitaj, zapiši i sigurno odloži iglicu",
          action:
            "Pričekaj 5 sekundi da se prikaže broj. Zapiši vrijednost u dnevnik ili aplikaciju uz sat i napomenu je li mjerenje bilo prije ili poslije obroka. Vrati kapicu na lancetu i odloži je u čvrstu plastičnu posudu.",
          doctorTip:
            "Jedna brojka sama za sebe ne govori sve. Zapiši i što si jeo kako bi to mogao proći s obiteljskim liječnikom.",
          mistakeToAvoid:
            "Nemoj bacati nezaštićene iglice u obično kućno smeće jer se netko može nabosti.",
        },
      ],
      clinicalRedFlags: [
        "Glukoza u krvi je ispod 70 mg/dL uz vrtoglavicu ili smetenost. Odmah primijeni pravilo 15/15.",
        "Vrijednosti su često iznad 250 mg/dL, a ne znaš koja ih je hrana potaknula.",
        "Glukometar često javlja pogrešku. Provjeri rok trajanja trakica ili bateriju.",
      ],
    },
    footcare: {
      id: "footcare",
      tabLabel: "Svakodnevna njega stopala",
      title: "Kako zaštititi stopala od ranica",
      badge: "Svake večeri",
      summary:
        "Šećerna bolest može smanjiti osjet u stopalima pa slabije osjećaš bol ili toplinu. Mali žulj ili posjekotina lako prođu neopaženo ako stopala ne pregledaš svaki dan.",
      steps: [
        {
          number: 1,
          title: "Pregledaj tabane svake večeri",
          action:
            "Svake večeri pri dobrom svjetlu pažljivo pogledaj tabane, pete i prostore između prstiju. Ako ne možeš podignuti stopalo, položi ogledalo na pod ili zamoli ukućane za pomoć.",
          doctorTip:
            "Potraži crvenilo, žuljeve, pukotine ili mjesta koja su toplija na dodir.",
          mistakeToAvoid:
            "Nemoj zanemariti crvenu mrlju ili natisak misleći da će proći sam od sebe. Uz dijabetes rane sporije cijele.",
        },
        {
          number: 2,
          title: "Operi i dobro osuši stopala",
          action:
            "Operi stopala svaki dan mlakom vodom i blagim sapunom. Nemoj ih namakati dulje od 5 minuta kako se koža ne bi isušila. Nježno ih utapkaj mekim ručnikom, osobito između prstiju.",
          doctorTip:
            "Temperaturu vode provjeri laktom ili termometrom, a ne stopalom. Stopalo možda neće osjetiti da je voda prevruća.",
          mistakeToAvoid:
            "Nemoj ostavljati vlagu između prstiju jer se ondje lako razviju gljivice.",
        },
        {
          number: 3,
          title: "Namaži pete, ali ne između prstiju",
          action:
            "Nanesi kremu s urejom ili običnu masnu kremu na pete, tabane i gornji dio stopala. Koža tako ostaje mekana i ne puca.",
          doctorTip:
            "Bakterije ulaze kroz ispucanu kožu. Redovito mazanje čuva kožnu barijeru cijelom.",
          mistakeToAvoid:
            "Nemoj nanositi kremu između prstiju. Ondje koža previše omekša i lako pukne.",
        },
        {
          number: 4,
          title: "Dobre čarape i provjerena obuća",
          action:
            "Nosi bijele ili svijetle pamučne čarape bez debelih šavova i bez čvrste gumice oko gležnja. Prije obuvanja rukom provjeri unutrašnjost cipele da nema kamenčića, nabora ili oštrih rubova.",
          doctorTip:
            "Na bijelim čarapama odmah uočiš i najmanju trag krvi ili iscjetka.",
          mistakeToAvoid:
            "Nikada nemoj hodati bos, čak ni po kući ili plaži. Trn ili krhotina mogu napraviti duboku ranu.",
        },
      ],
      clinicalRedFlags: [
        "Ranica, posjekotina ili žulj ne počinju cijeliti nakon 48 sati.",
        "Crveno, natečeno ili vruće mjesto uz nokat ili na peti.",
        "Utrnulost, trnci ili gubitak osjeta dodira u stopalu.",
      ],
    },
  },
  rom: {
    glucometer: {
      id: "glucometer",
      tabLabel: "Marimos vash o zaharo glukometrosa",
      title: "Sar te mares vorta o zaharo and-o rat",
      badge: "Khere, che aparatesa",
      summary:
        "Kana mares vorta, cho familiyako doktori dikhel chache numere. Vi tu dikhes sar o xaben thaj o phirimos paruven o zaharo and-o rat.",
      steps: [
        {
          number: 1,
          title: "Xalav thaj shushtar che vast",
          action:
            "Xalav che vast tate payesa thaj sapunosa. Shushtar len mishto chiste peshkiresa. O tato pay anel o rat and-e naya.",
          doctorTip:
            "Na labyar spirt vay sungale shervetsurya. O spirt shukyarel i morti thaj shaj rimol o rezultato.",
          mistakeToAvoid:
            "Na pusav ekh kinglo nay. O pay sanyarel o rat thaj o aparato sikavel may tikno numero.",
        },
        {
          number: 2,
          title: "Gatisar o aparato thaj i suv",
          action:
            "Thov ekh nevi bandeleta and-o aparato zhi kay dikhes o semno vash o rat. Thov ekh nevi tikni suv thaj alosar 2 vay 3.",
          doctorTip:
            "Inker i kutiya le bandeletensa mishto phandadi, pe shuko than dur katar o kham.",
          mistakeToAvoid:
            "Na labyar eyni suv may butivar. E purani suv kerel may bari dukh.",
        },
        {
          number: 3,
          title: "Pusav pi rig katar o nay",
          action:
            "Pusav pi rig katar o nay, na and-o mashkar. Azba lokhes o nay zhi kay inklyol ekh tikni kapka rat. Azba i kapka la bandeletasa.",
          doctorTip:
            "Pe riga si may tsera nervurya sar and-o mashkar, kadaleske i dukh si may tikni.",
          mistakeToAvoid:
            "Na chupin o nay zurales. Inklyol vi pay andar i morti so rimol o rezultato.",
        },
        {
          number: 4,
          title: "Ginav, ramosar thaj chhude i suv",
          action:
            "Azhuker 5 sekunde te sikadyol o numero. Ramosar les and-o lil chasosa, anglal vay palal o xaben. Thov o kapako pe suv thaj chhude la and-ekh zurali plastikaki shisha.",
          doctorTip:
            "Ramosar vi so xalyan, te shaj keres vorba che familiyake doktoresa.",
          mistakeToAvoid:
            "Na chhude bi kapakeske suva and-o gunoyo, te na pusavel pe varekon.",
        },
      ],
      clinicalRedFlags: [
        "Si tut telal 70 mg/dL thaj phirel cho shero. Labyar sigo o regulo 15/15.",
        "Si tut butivar opr-al 250 mg/dL thaj na zhanes katar savo xaben.",
        "O aparato sikavel dosh. Dikh o datumo pe bandelete vay i bateriya.",
      ],
    },
    footcare: {
      id: "footcare",
      tabLabel: "Arakhimos vash le punre svako dives",
      title: "Sar te arakhes che punre katar le rane",
      badge: "Svako rjat",
      summary:
        "O gudlo rat shaj kerel che punre te na hatyaren mishto i dukh vay o tatipen. Ekh tikni rana shaj barol te na dikhes che punre svako dives.",
      steps: [
        {
          number: 1,
          title: "Dikh che talpe svako rjat",
          action:
            "Svako rjat, po lachho dud, dikh mishto che talpe, khura thaj mashkar le naya. Te na shaj vazdes o punro, thov ekh oglinda tele vay mang varekas andar i familiya.",
          doctorTip:
            "Rode lolimos, phuknyori, phadimata vay thana so si tate kana azbas len.",
          mistakeToAvoid:
            "Na mukh ekh lolo than gindindoy ke nakhel korkoro. Kana si tut gudlo rat, le rane sastyon may phares.",
        },
        {
          number: 2,
          title: "Xalav thaj shushtar mishto le punre",
          action:
            "Xalav che punre svako dives kovle tate payesa thaj kovle sapunosa. Na inker len and-o pay may but sar 5 minuturya. Shushtar len kovle peshkiresa, may but mashkar le naya.",
          doctorTip:
            "Probisar o pay che konesa, na le punresa. O punro shaj na hatyarel ke o pay si but tato.",
          mistakeToAvoid:
            "Na mukh kinglimos mashkar le naya, ke kothe barol nasvalimos pe morti.",
        },
        {
          number: 3,
          title: "Thov krema pe khura, na mashkar le naya",
          action:
            "Thov krema pe khura, pe talpe thaj opral po punro. Kadya i morti achhel kovli thaj na phadyol.",
          doctorTip:
            "Andar i phadi morti zhan mikroburya. E krema arakhel i morti intregi.",
          mistakeToAvoid:
            "Na thov krema mashkar le naya. Kothe i morti kerdol but kovli thaj phadyol.",
        },
        {
          number: 4,
          title: "Lachhe choraepa thaj dikhle papucha",
          action:
            "Phirav parne pambukoske choraepa bi thule suvimatengo. Anglal te thoves le papucha, chhuve o vast andre te dikhes te nay barrora vay kuya.",
          doctorTip:
            "Pe parne choraepa dikhes sigo ekh tikni kapka rat.",
          mistakeToAvoid:
            "Na phir nango punrengo nikay, ni khere. Ekh tikno kash vay shisha shaj kerel bari rana.",
        },
      ],
      clinicalRedFlags: [
        "Ekh rana vay phuknyori na astarel te sastyol palal 48 chasurya.",
        "Lolo, shuvlo vay tato than pashe ugiya vay pe khur.",
        "Na hatyares mishto kana azbas cho punro.",
      ],
    },
  },
};

const FOOT_HOTSPOTS: Record<Lang, FootHotspot[]> = {
  ru: [
    {
      id: "heel",
      name: "Пятка и задний край",
      shortName: "каблук",
      inspectionNote:
        "Ищите глубокие трещины и толстую твердую кожицу. Микробы проникают через трещины.",
    },
    {
      id: "hallux",
      name: "Отличный палец и ногтевое ложе",
      shortName: "Большой палец ноги",
      inspectionNote:
        "Ногти стригите прямо поперек, не закругляя углы. Это останавливает врастание ногтей и инфекцию.",
    },
    {
      id: "web_spaces",
      name: "Пространства между пальцами ног",
      shortName: "Между пальцами ног",
      inspectionNote:
        "Влажная кожа здесь приводит к микозу стопы. Держите его полностью сухим.",
    },
    {
      id: "plantar_arch",
      name: "Подушечка стопы",
      shortName: "Подушечка стопы",
      inspectionNote:
        "Здесь сильнее всего нажимаешь, когда идешь. Если нога онемела, рану может скрыть мозоль, которая не болит.",
    },
    {
      id: "lateral_margin",
      name: "Внешний край и мизинец",
      shortName: "Внешний край",
      inspectionNote:
        "Тесная обувь натирает здесь и вызывает появление волдырей и мозолей. Выбирайте обувь, широкую спереди.",
    },
  ],

  ro: [
    {
      id: "heel",
      name: "Călcâiul și marginea din spate",
      shortName: "Călcâiul",
      inspectionNote:
        "Caută crăpături adânci și piele îngroșată. Prin crăpături intră microbii.",
    },
    {
      id: "hallux",
      name: "Degetul mare și patul unghial",
      shortName: "Degetul mare",
      inspectionNote:
        "Taie unghiile drept, nu rotunjite la colțuri. Așa unghia nu intră în carne și nu se infectează.",
    },
    {
      id: "web_spaces",
      name: "Spațiile dintre degete",
      shortName: "Între degete",
      inspectionNote:
        "Umezeala de aici aduce ciuperca piciorului. Ține locul bine uscat.",
    },
    {
      id: "plantar_arch",
      name: "Partea din față a tălpii",
      shortName: "Talpa",
      inspectionNote:
        "Aici apeși cel mai tare când mergi. Dacă piciorul e amorțit, sub o bătătură care nu doare se poate ascunde o rană.",
    },
    {
      id: "lateral_margin",
      name: "Marginea laterală și degetul mic",
      shortName: "Marginea exterioară",
      inspectionNote:
        "Pantofii strâmți freacă aici și fac bășici și bătături. Alege pantofi largi în față.",
    },
  ],
  en: [
    {
      id: "heel",
      name: "Heel and back edge",
      shortName: "Heel",
      inspectionNote:
        "Look for deep cracks and thick hard skin. Germs get in through cracks.",
    },
    {
      id: "hallux",
      name: "Great toe and nail bed",
      shortName: "Big toe",
      inspectionNote:
        "Cut nails straight across, not rounded at the corners. This stops ingrown nails and infection.",
    },
    {
      id: "web_spaces",
      name: "Spaces between the toes",
      shortName: "Between the toes",
      inspectionNote:
        "Damp skin here leads to athlete's foot. Keep it fully dry.",
    },
    {
      id: "plantar_arch",
      name: "Ball of the foot",
      shortName: "Ball of the foot",
      inspectionNote:
        "You press hardest here when you walk. If your foot is numb, a callus that does not hurt can hide a wound.",
    },
    {
      id: "lateral_margin",
      name: "Outer edge and little toe",
      shortName: "Outer edge",
      inspectionNote:
        "Tight shoes rub here and cause blisters and calluses. Choose shoes that are wide at the front.",
    },
  ],
  sq: [
    {
      id: "heel",
      name: "Thembra dhe pjesa e pasme",
      shortName: "Thembra",
      inspectionNote:
        "Kërko çarje të thella dhe lëkurë të trashë. Mikrobet hyjnë nga çarjet.",
    },
    {
      id: "hallux",
      name: "Gishti i madh dhe shtrati i thonjve",
      shortName: "Gishti i madh",
      inspectionNote:
        "Prij thonjtë drejt, jo të rrumbullakët në cepa. Kështu thoi nuk futet në mish dhe nuk infektohet.",
    },
    {
      id: "web_spaces",
      name: "Hapësirat mes gishtave",
      shortName: "Mes gishtave",
      inspectionNote:
        "Lagështia këtu sjell kërpudha. Mbaje vendin plotësisht të thatë.",
    },
    {
      id: "plantar_arch",
      name: "Pjesa e përparme e shputës",
      shortName: "Shputa",
      inspectionNote:
        "Këtu shtyp më shumë kur ecën. Nëse këmba është e mpirë, nën një kallo që nuk dhemb mund të fshihet një plagë.",
    },
    {
      id: "lateral_margin",
      name: "Ana anësore dhe gishti i vogël",
      shortName: "Ana e jashtme",
      inspectionNote:
        "Këpucët e ngushta fërkojnë këtu dhe bëjnë fshikëza e kallo. Zgjidh këpucë të gjera përpara.",
    },
  ],
  it: [
    {
      id: "heel",
      name: "Tallone e bordo posteriore",
      shortName: "Tallone",
      inspectionNote:
        "Cerca crepe profonde e pelle spessa. I microbi entrano dalle crepe.",
    },
    {
      id: "hallux",
      name: "Alluce e letto ungueale",
      shortName: "Alluce",
      inspectionNote:
        "Taglia le unghie dritte, non arrotondate agli angoli. Così l'unghia non si incarna e non si infetta.",
    },
    {
      id: "web_spaces",
      name: "Spazi interdigitali",
      shortName: "Tra le dita",
      inspectionNote:
        "L'umidità qui porta il piede d'atleta. Tieni la zona ben asciutta.",
    },
    {
      id: "plantar_arch",
      name: "Avampiede (pianta anteriore)",
      shortName: "Pianta",
      inspectionNote:
        "Qui premi di più quando cammini. Se il piede è poco sensibile, sotto un callo che non fa male può nascondersi una ferita.",
    },
    {
      id: "lateral_margin",
      name: "Bordo esterno e quinto dito",
      shortName: "Bordo esterno",
      inspectionNote:
        "Le scarpe strette sfregano qui e fanno vesciche e calli. Scegli scarpe larghe davanti.",
    },
  ],
  hr: [
    {
      id: "heel",
      name: "Peta i stražnji rub stopala",
      shortName: "Peta",
      inspectionNote:
        "Potraži duboke pukotine i zadebljanu suhu kožu. Kroz pukotine ulaze bakterije.",
    },
    {
      id: "hallux",
      name: "Palac i ležište nokta",
      shortName: "Palac",
      inspectionNote:
        "Nokte reži ravno, bez zaobljivanja kutova. Tako sprječavaš urastanje nokta i upalu.",
    },
    {
      id: "web_spaces",
      name: "Prostori između prstiju",
      shortName: "Između prstiju",
      inspectionNote:
        "Vlaga na ovome mjestu potiče gljivičnu infekciju. Uvijek dobro posuši kožu.",
    },
    {
      id: "plantar_arch",
      name: "Prednji jastučić tabana",
      shortName: "Taban",
      inspectionNote:
        "Ovdje je pritisak pri hodu najveći. Ako je osjet oslabljen, ispod bezbolnog natiska može se skrivati rana.",
    },
    {
      id: "lateral_margin",
      name: "Vanjski rub stopala i mali prst",
      shortName: "Vanjski rub",
      inspectionNote:
        "Uska obuća ovdje stvara trenje, žuljeve i natiske. Biraj obuću sa širokim prednjim dijelom.",
    },
  ],
  rom: [
    {
      id: "heel",
      name: "I khur thaj i paluni rig",
      shortName: "I khur",
      inspectionNote:
        "Rode hor phadimata thaj thuli shuki morti. Andar le phadimata zhan mikroburya.",
    },
    {
      id: "hallux",
      name: "O baro nay thaj i ugiya",
      shortName: "O baro nay",
      inspectionNote:
        "Chhin le ugiye vorta, na pe koltsurya. Kadya i ugiya na zhal and-o mas thaj na kerel infektso.",
    },
    {
      id: "web_spaces",
      name: "O than mashkar le naya",
      shortName: "Mashkar le naya",
      inspectionNote:
        "O kinglimos kathe anel nasvalimos pe morti. Inker o than mishto shuko.",
    },
    {
      id: "plantar_arch",
      name: "Angluno kotor la talpako",
      shortName: "I talpa",
      inspectionNote:
        "Kathe phares may zurales kana phires. Telal i thuli morti shaj garadyol ekh rana bi dukhako.",
    },
    {
      id: "lateral_margin",
      name: "Avrutni rig thaj o tikno nay",
      shortName: "Avrutni rig",
      inspectionNote:
        "Tang papucha xalaven kathe thaj keren phuknyori. Alosar papucha so si buhle anglal.",
    },
  ],
};

function useSafeLanguage(propLang?: Lang): Lang {
  const ctx = useContext(LanguageContext);
  if (propLang && UI_STRINGS[propLang]) return propLang;
  if (ctx?.lang && UI_STRINGS[ctx.lang]) return ctx.lang;
  return "ro";
}

/**
 * Sole of the left foot seen from below (toes up, big toe on the left), viewBox 160 x 300.
 * The inner edge curves in at the arch; the outer edge is almost straight.
 */
const SOLE_PATH =
  "M 84 291 C 66 291 56 278 56 256 C 56 232 62 214 60 192 C 58 168 46 150 40 128 C 34 106 34 82 44 66 C 52 54 66 52 80 54 C 96 56 112 58 122 66 C 132 76 132 96 128 118 C 124 140 116 160 114 186 C 112 212 112 236 112 256 C 112 278 102 291 84 291 Z";
/** Toes as [cx, cy, rx, ry], from the big toe to the little toe. */
const TOES: [number, number, number, number][] = [
  [52, 36, 11.5, 14.5],
  [76, 36, 7.5, 10],
  [94, 40, 7, 9],
  [108, 46, 6.5, 8],
  [125, 58, 5.5, 6.5],
];
/** Where each numbered marker sits on the sole drawing. */
const HOTSPOT_POSITION: Record<FootHotspotId, { x: number; y: number }> = {
  heel: { x: 84, y: 262 },
  hallux: { x: 52, y: 36 },
  web_spaces: { x: 85, y: 51 },
  plantar_arch: { x: 72, y: 100 },
  lateral_margin: { x: 118, y: 150 },
};

export function DiabetesStepTutorialsModule({
  initialTab = "glucometer",
  lang: propLang,
}: DiabetesStepTutorialsModuleProps) {
  const [activeTab, setActiveTab] = useState<TutorialTab>(initialTab);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [selectedHotspotId, setSelectedHotspotId] = useState<FootHotspotId | null>("heel");

  const activeLang = useSafeLanguage(propLang);
  const ui = UI_STRINGS[activeLang] || UI_STRINGS.ro;
  const tutorialsByLang = TUTORIALS_DATA[activeLang] || TUTORIALS_DATA.ro;
  const hotspots = FOOT_HOTSPOTS[activeLang] || FOOT_HOTSPOTS.ro;

  const currentProgram = tutorialsByLang[activeTab];
  const step = currentProgram.steps[activeStepIndex];

  const handleTabChange = (tab: TutorialTab) => {
    setActiveTab(tab);
    setActiveStepIndex(0);
  };

  const toggleStepCompleted = (stepKey: string) => {
    setCompletedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const currentStepKey = `${activeTab}_step_${step.number}`;
  const isCurrentStepDone = !!completedSteps[currentStepKey];
  const activeHotspot = hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];

  return (
    <section
      aria-label={ui.moduleAriaLabel}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{ui.title}</h3>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">{ui.description}</p>
      </header>

      {/* Which guide */}
      <div className="space-y-4 border-t border-border pt-6">
        <div role="radiogroup" aria-label={ui.tabSelectPrompt} className={ROW_LIST_CLASS}>
          {(["glucometer", "footcare"] as TutorialTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            const prog = tutorialsByLang[tab];
            return (
              <label key={tab} className={`${ROW_CLASS} cursor-pointer`}>
                <input
                  type="radio"
                  name="diabetes-tutorial"
                  value={tab}
                  checked={isSelected}
                  onChange={() => handleTabChange(tab)}
                  className="sr-only"
                />
                <span className={radioDotClass(isSelected)} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-foreground">{prog.tabLabel}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{prog.badge}</span>
                </span>
              </label>
            );
          })}
        </div>

        <p className="max-w-prose text-sm leading-relaxed text-foreground">
          <strong className="font-semibold">{currentProgram.title}.</strong> {currentProgram.summary}
        </p>
      </div>

      {/* Stepper and current step */}
      <div
        id="tutorial-step-display"
        role="region"
        aria-label={`${currentProgram.title}: ${step.title}`}
        className="space-y-6 border-t border-border pt-6"
      >
        <ol className={`${STEP_LIST_CLASS} sm:grid-cols-2`}>
          {currentProgram.steps.map((st, idx) => {
            const isCurrent = idx === activeStepIndex;
            const isDone = !!completedSteps[`${activeTab}_step_${st.number}`];
            return (
              <li key={st.number}>
                <button
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => setActiveStepIndex(idx)}
                  className={stepCellClass(isCurrent)}
                >
                  <span className={stepNumberClass(isCurrent)}>{st.number}</span>
                  <span
                    className={`min-w-0 flex-1 text-sm leading-snug break-words ${
                      isCurrent ? "font-semibold text-foreground" : "font-medium text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {st.title}
                  </span>
                  {isDone && <CheckCircleIcon className="h-4 w-4 shrink-0 text-live-sage" />}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="space-y-5 border-t border-border pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5" aria-live="polite">
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {ui.stageLabel} {step.number} {ui.ofFour}
              </span>
              <h5 className="text-sm font-semibold text-foreground">{ui.actionHeading}</h5>
            </div>
            <button
              type="button"
              aria-pressed={isCurrentStepDone}
              onClick={() => toggleStepCompleted(currentStepKey)}
              className={`flex min-h-[44px] shrink-0 items-center gap-2 self-start rounded-lg border px-3.5 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                isCurrentStepDone
                  ? "border-live-sage/40 bg-live-sage-soft text-foreground"
                  : "border-border bg-card text-foreground hover:bg-surface-subtle"
              }`}
            >
              {isCurrentStepDone ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-xs border border-muted-foreground" aria-hidden="true" />
              )}
              {isCurrentStepDone ? ui.stepDoneToggle : ui.stepMarkDone}
            </button>
          </div>

          <p className="max-w-prose text-sm leading-relaxed text-foreground">{step.action}</p>

          <div className="grid grid-cols-1 gap-6 border-t border-border pt-4 md:grid-cols-2">
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-foreground">
                {ui.doctorTipHeading}
              </h5>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.doctorTip}</p>
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-foreground">
                {ui.mistakeHeading}
              </h5>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.mistakeToAvoid}</p>
            </div>
          </div>
        </div>

        {/* Where to look on the sole */}
        {activeTab === "footcare" && (
          <div className="space-y-4 border-t border-border pt-5">
            <div>
              <h5 className="text-sm font-semibold text-foreground">{ui.hotspotsHeading}</h5>
              <p className="mt-0.5 text-sm text-muted-foreground">{ui.hotspotsSubtitle}</p>
            </div>

            <div className="grid grid-cols-[112px_1fr] items-start gap-4 sm:grid-cols-[150px_1fr] sm:gap-8">
              <svg viewBox="0 0 160 300" className="h-auto w-full select-none" aria-hidden="true">
                <path
                  d={SOLE_PATH}
                  fill="var(--color-surface-subtle)"
                  stroke="var(--color-muted-foreground)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {TOES.map(([cx, cy, rx, ry]) => (
                  <ellipse
                    key={cx}
                    cx={cx}
                    cy={cy}
                    rx={rx}
                    ry={ry}
                    fill="var(--color-surface-subtle)"
                    stroke="var(--color-muted-foreground)"
                    strokeWidth="1.5"
                  />
                ))}
                {hotspots.map((h, i) => {
                  const isSelected = h.id === activeHotspot.id;
                  const { x, y } = HOTSPOT_POSITION[h.id];
                  return (
                    <g key={h.id} className="cursor-pointer" onClick={() => setSelectedHotspotId(h.id)}>
                      <circle
                        cx={x}
                        cy={y}
                        r="9"
                        fill={isSelected ? "var(--color-foreground)" : "var(--color-card)"}
                        stroke="var(--color-foreground)"
                        strokeWidth="1.5"
                        style={{ transition: "fill var(--dur-base) var(--ease-out-calm)" }}
                      />
                      <text
                        x={x}
                        y={y + 3.8}
                        textAnchor="middle"
                        fontSize="10.5"
                        fontWeight="600"
                        fill={isSelected ? "var(--color-card)" : "var(--color-foreground)"}
                        style={{ transition: "fill var(--dur-base) var(--ease-out-calm)" }}
                      >
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="space-y-3">
                <div role="radiogroup" aria-label={ui.tapHotspotPrompt} className={ROW_LIST_SINGLE_CLASS}>
                  {hotspots.map((h, i) => {
                    const isSelected = h.id === activeHotspot.id;
                    return (
                      <label key={h.id} className={`${ROW_CLASS} min-h-[44px] cursor-pointer py-2`}>
                        <input
                          type="radio"
                          name="foot-hotspot"
                          value={h.id}
                          checked={isSelected}
                          onChange={() => setSelectedHotspotId(h.id)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
                            isSelected ? "bg-foreground text-white" : "border border-foreground text-foreground"
                          }`}
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        <span className={`text-sm leading-snug text-foreground ${isSelected ? "font-semibold" : ""}`}>{h.shortName}</span>
                      </label>
                    );
                  })}
                </div>

                <div aria-live="polite" className="border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground">{ui.hotspotSelectedLabel}</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{activeHotspot.name}</p>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{activeHotspot.inspectionNote}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* When to call the family doctor */}
        <div className="border-t border-border pt-5">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-amber-care" />
            {ui.redFlagsHeading}
          </h5>
          <ul className="mt-2 list-disc space-y-1.5 pl-6 text-sm leading-relaxed text-muted-foreground">
            {currentProgram.clinicalRedFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
