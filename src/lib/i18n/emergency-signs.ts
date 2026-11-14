import type { Lang } from "@/lib/i18n/translations";

/**
 * Single plain-language list of 112 alarm signs shared across the health assistant
 * emergency gate, the health assistant 112 aside, and the home hero problem branch.
 */
export const PLAIN_ALARM_SIGNS: Record<Lang, string[]> = {
  ro: [
    "Te doare tare în piept, ca o apăsare mare",
    "Respiri foarte greu",
    "Ți-a amorțit sau a slăbit brusc fața, o mână sau un picior",
    "Nu mai poți vorbi limpede",
    "Sângerezi foarte tare",
  ],
  en: [
    "Your chest hurts badly, like a heavy weight pressing on it",
    "You find it very hard to breathe",
    "Your face, an arm or a leg has suddenly gone numb or weak",
    "You can't speak clearly any more",
    "You are bleeding a lot",
  ],
  sq: [
    "Të dhemb fort gjoksi, si një peshë e rëndë që shtyp",
    "Ke shumë vështirësi të marrësh frymë",
    "Të është mpirë ose dobësuar papritur fytyra, një krah ose një këmbë",
    "Nuk mund të flasësh më qartë",
    "Po humbet shumë gjak",
  ],
  it: [
    "Ti fa molto male il petto, come un peso che schiaccia",
    "Fai molta fatica a respirare",
    "All'improvviso senti intorpiditi o deboli il viso, un braccio o una gamba",
    "Non riesci più a parlare chiaramente",
    "Stai perdendo molto sangue",
  ],
  hr: [
    "Jako te boli u prsima, kao da ti težak teret pritišće prsni koš",
    "Vrlo teško dišeš i nedostaje ti zraka",
    "Odjednom ti je utrnulo ili oslabilo lice, ruka ili noga",
    "Više ne možeš razgovijetno govoriti",
    "Jako krvariš",
  ],
  rom: [
    "Dukhal tut zurales and-o kolin, sar baro pharipen",
    "Phurdes but phares",
    "Chiro muj, jekh vast vaj jekh punro kerdilo kovlo sigo",
    "Nashti maj vorbis uzo",
    "Thabdel tuke but rat",
  ],
  ru: [
    "Грудь сильно болит, как будто на нее давит тяжелая тяжесть.",
    "Вам очень трудно дышать",
    "Ваше лицо, рука или нога внезапно онемели или ослабли.",
    "Ты больше не можешь ясно говорить",
    "У тебя сильное кровотечение",
  ],
};
