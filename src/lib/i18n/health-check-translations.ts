import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export type BodyPartId = "head" | "chest" | "stomach" | "back" | "arm" | "leg";
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
  "ro": {
    "ui": {
      "eyebrow": "Verificare de sănătate",
      "heading": "Verifică simptomele",
      "subtitle": "Arată pe corp unde te doare și răspunde la 3 întrebări. Apoi afli ce poți face.",
      "resetButton": "De la capăt",
      "backButton": "Înapoi",
      "nextButton": "Continuă",
      "finishButton": "Vezi rezultatul",
      "stepIndicator": "Pasul {current} din {total}",
      "step1Title": "Zona",
      "step2Title": "Simptomul",
      "step3Title": "Intensitatea",
      "step4Title": "Rezultatul",
      "step1Question": "Unde simți durere sau disconfort?",
      "step1Prompt": "Atinge zona pe corp sau alege din listă.",
      "step2Question": "Care seamănă cel mai mult cu ce simți?",
      "step2Prompt": "Alege simptomul cel mai puternic.",
      "urgentBadge": "Semn de urgență",
      "step3Question": "Cât de tare și de când?",
      "step3Prompt": "Alege câte o variantă din fiecare grup.",
      "severityHeading": "Cât de tare este?",
      "durationHeading": "De când ai simptomul?",
      "step4Question": "Ce poți face acum",
      "step4Prompt": "Pe baza răspunsurilor tale. Nu este un diagnostic.",
      "summaryHeading": "Rezumatul răspunsurilor",
      "areaLabel": "Zona",
      "symptomLabel": "Simptomul",
      "intensityLabel": "Intensitate",
      "durationLabel": "Durată",
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
        "subtitle": "Dureri de cap, ceafă înțepenită, amețeli sau vedere tulbure"
      },
      "chest": {
        "title": "Piept și respirație",
        "subtitle": "Apăsare în piept, respirație grea sau bătăi rapide de inimă"
      },
      "stomach": {
        "title": "Stomac și burtă",
        "subtitle": "Arsuri, crampe, greață, balonare sau dureri de burtă"
      },
      "back": {
        "title": "Spate și șale",
        "subtitle": "Durere jos pe spate, mușchi blocați sau durere între omoplați"
      },
      "arm": {
        "title": "Brațe și mâini",
        "subtitle": "Amorțeli, dureri de umăr ori de cot sau încheieturi umflate"
      },
      "leg": {
        "title": "Picioare și tălpi",
        "subtitle": "Dureri de genunchi, gleznă umflată sau greutate la mers"
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
        }
      ],
      "arm": [
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
      "subtitle": "Show on the body where it hurts and answer 3 questions. Then see what to do next.",
      "resetButton": "Start over",
      "backButton": "Back",
      "nextButton": "Continue",
      "finishButton": "See result",
      "stepIndicator": "Step {current} of {total}",
      "step1Title": "Area",
      "step2Title": "Symptom",
      "step3Title": "Severity",
      "step4Title": "Result",
      "step1Question": "Where do you feel pain or discomfort?",
      "step1Prompt": "Tap the area on the body or pick it from the list.",
      "step2Question": "Which of these is closest to what you feel?",
      "step2Prompt": "Pick the symptom that bothers you most.",
      "urgentBadge": "Emergency sign",
      "step3Question": "How strong, and since when?",
      "step3Prompt": "Pick one option in each group.",
      "severityHeading": "How bad is it?",
      "durationHeading": "How long have you had it?",
      "step4Question": "What you can do now",
      "step4Prompt": "Based on your answers. This is not a diagnosis.",
      "summaryHeading": "Summary of your answers",
      "areaLabel": "Body area",
      "symptomLabel": "Symptom",
      "intensityLabel": "Intensity",
      "durationLabel": "Duration",
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
        "subtitle": "Headaches, stiff neck, dizziness or blurry vision"
      },
      "chest": {
        "title": "Chest and breathing",
        "subtitle": "Chest pressure, hard breathing or a racing heart"
      },
      "stomach": {
        "title": "Stomach and abdomen",
        "subtitle": "Heartburn, cramps, nausea, bloating or belly pain"
      },
      "back": {
        "title": "Back and spine",
        "subtitle": "Lower back pain, tense muscles or pain between the shoulder blades"
      },
      "arm": {
        "title": "Arms and hands",
        "subtitle": "Numbness, shoulder or elbow pain, or swollen joints"
      },
      "leg": {
        "title": "Legs and feet",
        "subtitle": "Knee pain, a swollen ankle or trouble walking"
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
        }
      ],
      "arm": [
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
      "subtitle": "Trego në trup ku të dhemb dhe përgjigju 3 pyetjeve. Pastaj shiko çfarë të bësh.",
      "resetButton": "Fillo nga e para",
      "backButton": "Kthehu",
      "nextButton": "Vazhdo",
      "finishButton": "Shiko rezultatin",
      "stepIndicator": "Hapi {current} nga {total}",
      "step1Title": "Zona",
      "step2Title": "Simptoma",
      "step3Title": "Intensiteti",
      "step4Title": "Rezultati",
      "step1Question": "Ku ndien dhimbje ose shqetësim?",
      "step1Prompt": "Prek zonën në trup ose zgjidhe nga lista.",
      "step2Question": "Cila i ngjan më shumë asaj që ndien?",
      "step2Prompt": "Zgjidh simptomën që të shqetëson më shumë.",
      "urgentBadge": "Shenjë urgjence",
      "step3Question": "Sa fort dhe që kur?",
      "step3Prompt": "Zgjidh një mundësi në çdo grup.",
      "severityHeading": "Sa fort të shqetëson?",
      "durationHeading": "Prej sa kohësh e ke?",
      "step4Question": "Çfarë mund të bësh tani",
      "step4Prompt": "Sipas përgjigjeve të tua. Nuk është diagnozë.",
      "summaryHeading": "Përmbledhja e përgjigjeve",
      "areaLabel": "Zona",
      "symptomLabel": "Simptoma",
      "intensityLabel": "Intensiteti",
      "durationLabel": "Kohëzgjatja",
      "recommendationHeading": "Çfarë të bësh më pas",
      "safeSelfCareHeading": "Çfarë mund të bësh në shtëpi",
      "copySummary": "Kopjo përmbledhjen",
      "copied": "U kopjua",
      "sendWhatsApp": "Ndaj në WhatsApp",
      "showDoctor": "Tregoja mjekut",
      "requestMediatorHelp": "Fol me një ndërmjetës",
      "scheduleDoctor": "Lër takim me mjekun online",
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
        "subtitle": "Dhimbje koke, qafë e ngurtë, marramendje ose shikim i turbullt"
      },
      "chest": {
        "title": "Gjoksi dhe frymëmarrja",
        "subtitle": "Shtrëngim në gjoks, frymëmarrje e rëndë ose rrahje të shpejta të zemrës"
      },
      "stomach": {
        "title": "Stomaku dhe barku",
        "subtitle": "Djegie, ngërçe, të përziera, fryrje ose dhimbje barku"
      },
      "back": {
        "title": "Shpina dhe mesi",
        "subtitle": "Dhimbje në fund të shpinës, muskuj të bllokuar ose dhimbje mes shpatullave"
      },
      "arm": {
        "title": "Krahët dhe duart",
        "subtitle": "Mpirje, dhimbje shpatulle apo bërryli ose kyçe të fryra"
      },
      "leg": {
        "title": "Këmbët dhe shputat",
        "subtitle": "Dhimbje gjuri, kyç i këmbës i ënjtur ose vështirësi në ecje"
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
        }
      ],
      "arm": [
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
      "subtitle": "Indica sul corpo dove ti fa male e rispondi a 3 domande. Poi vedi cosa fare.",
      "resetButton": "Ricomincia",
      "backButton": "Indietro",
      "nextButton": "Continua",
      "finishButton": "Vedi il risultato",
      "stepIndicator": "Passo {current} di {total}",
      "step1Title": "Zona",
      "step2Title": "Sintomo",
      "step3Title": "Intensità",
      "step4Title": "Risultato",
      "step1Question": "Dove senti dolore o fastidio?",
      "step1Prompt": "Tocca la zona sul corpo o sceglila dall'elenco.",
      "step2Question": "Quale somiglia di più a quello che senti?",
      "step2Prompt": "Scegli il sintomo che ti disturba di più.",
      "urgentBadge": "Segnale di emergenza",
      "step3Question": "Quanto forte e da quando?",
      "step3Prompt": "Scegli un'opzione per ogni gruppo.",
      "severityHeading": "Quanto è forte?",
      "durationHeading": "Da quanto tempo ce l'hai?",
      "step4Question": "Cosa puoi fare ora",
      "step4Prompt": "In base alle tue risposte. Non è una diagnosi.",
      "summaryHeading": "Riepilogo delle tue risposte",
      "areaLabel": "Zona",
      "symptomLabel": "Sintomo",
      "intensityLabel": "Intensità",
      "durationLabel": "Durata",
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
        "subtitle": "Mal di testa, collo rigido, vertigini o vista offuscata"
      },
      "chest": {
        "title": "Petto e respirazione",
        "subtitle": "Pressione al petto, respiro affannoso o cuore che batte forte"
      },
      "stomach": {
        "title": "Stomaco e addome",
        "subtitle": "Bruciore, crampi, nausea, gonfiore o mal di pancia"
      },
      "back": {
        "title": "Schiena e zona lombare",
        "subtitle": "Mal di schiena in basso, muscoli tesi o dolore tra le scapole"
      },
      "arm": {
        "title": "Braccia e mani",
        "subtitle": "Intorpidimento, dolore alla spalla o al gomito o articolazioni gonfie"
      },
      "leg": {
        "title": "Gambe e piedi",
        "subtitle": "Dolore al ginocchio, caviglia gonfia o difficoltà a camminare"
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
        }
      ],
      "arm": [
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
  }
};

export const healthCheckTranslations: Record<Lang, HealthCheckWizardLocaleData> = {
  ro: { ...rawTranslations.ro, symptoms: rawTranslations.ro.symptomsByRegion },
  en: { ...rawTranslations.en, symptoms: rawTranslations.en.symptomsByRegion },
  sq: { ...rawTranslations.sq, symptoms: rawTranslations.sq.symptomsByRegion },
  it: { ...rawTranslations.it, symptoms: rawTranslations.it.symptomsByRegion },
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
    structure3D: d.ui.structure3DLabel ?? (targetLang === "ro" ? "Structură 3D" : targetLang === "en" ? "3D structure" : targetLang === "sq" ? "Struktura 3D" : "Struttura 3D"),
    sensation: d.ui.sensationLabel ?? (targetLang === "ro" ? "Senzație" : targetLang === "en" ? "Sensation" : targetLang === "sq" ? "Ndjesi" : "Sensazione"),
    triggers: d.ui.triggersLabel ?? (targetLang === "ro" ? "Ce agravează" : targetLang === "en" ? "What makes it worse" : targetLang === "sq" ? "Çfarë e përkeqëson" : "Cosa lo peggiora"),
    specialty: d.ui.specialtyLabel ?? (targetLang === "ro" ? "Medic specialist" : targetLang === "en" ? "Specialist to see" : targetLang === "sq" ? "Mjeku specialist" : "Specialista da vedere"),
    warningNoticeRedFlag: d.ui.warningNoticeRedFlag ?? (targetLang === "ro" ? "Au apărut semne de urgență." : targetLang === "en" ? "Emergency warning signs reported." : targetLang === "sq" ? "U raportuan shenja urgjence." : "Segnalati segni di emergenza."),
    warningNoticeSafe: d.ui.warningNoticeSafe ?? (targetLang === "ro" ? "Nu au apărut semne de urgență." : targetLang === "en" ? "No emergency warning signs reported." : targetLang === "sq" ? "Nuk u raportuan shenja urgjence." : "Nessun segno di emergenza segnalato."),
  };
}
