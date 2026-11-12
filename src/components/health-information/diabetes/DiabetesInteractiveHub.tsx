"use client";

import { useContext, useState } from "react";
import dynamic from "next/dynamic";
import { LanguageContext } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { GlucoseDynamicsModule } from "./GlucoseDynamicsModule";
import { HUB_CARD_CLASS, TAB_LIST_CLASS, tabClass, handleTabKey } from "./choice-styles";

const InsulinMechanicsModule = dynamic(() =>
  import("./InsulinMechanicsModule").then((m) => m.InsulinMechanicsModule)
);
const DiabetesPlateMethodModule = dynamic(() =>
  import("./DiabetesPlateMethodModule").then((m) => m.DiabetesPlateMethodModule)
);
const DiabetesStepTutorialsModule = dynamic(() =>
  import("./DiabetesStepTutorialsModule").then((m) => m.DiabetesStepTutorialsModule)
);

export type DiabetesHubTab = "glucose" | "insulin" | "plate" | "tutorials";

const HUB_TABS: readonly DiabetesHubTab[] = ["glucose", "insulin", "plate", "tutorials"];

export interface DiabetesInteractiveHubProps {
  initialTab?: DiabetesHubTab;
  lang?: Lang;
}

interface HubTranslations {
  ariaLabel: string;
  tabs: Record<DiabetesHubTab, { label: string }>;
}

const HUB_TRANSLATIONS: Record<Lang, HubTranslations> = {
  ru: {
    ariaLabel: "Уроки диабета",
    tabs: {
      glucose: { label: "Уровень сахара в крови" },
      insulin: { label: "Как работает инсулин" },
      plate: { label: "Правильная тарелка" },
      tutorials: { label: "Практические руководства" },
    },
  },

  ro: {
    ariaLabel: "Lecții despre diabet",
    tabs: {
      glucose: { label: "Zahărul din sânge" },
      insulin: { label: "Cum lucrează insulina" },
      plate: { label: "Farfuria potrivită" },
      tutorials: { label: "Ghiduri practice" },
    },
  },
  en: {
    ariaLabel: "Diabetes lessons",
    tabs: {
      glucose: { label: "Blood sugar" },
      insulin: { label: "How insulin works" },
      plate: { label: "The right plate" },
      tutorials: { label: "How-to guides" },
    },
  },
  sq: {
    ariaLabel: "Mësime për diabetin",
    tabs: {
      glucose: { label: "Sheqeri në gjak" },
      insulin: { label: "Si punon insulina" },
      plate: { label: "Pjata e duhur" },
      tutorials: { label: "Udhëzime praktike" },
    },
  },
  it: {
    ariaLabel: "Lezioni sul diabete",
    tabs: {
      glucose: { label: "Lo zucchero nel sangue" },
      insulin: { label: "Come funziona l'insulina" },
      plate: { label: "Il piatto giusto" },
      tutorials: { label: "Guide pratiche" },
    },
  },
  hr: {
    ariaLabel: "Vodiči o šećernoj bolesti",
    tabs: {
      glucose: { label: "Glukoza u krvi" },
      insulin: { label: "Kako djeluje inzulin" },
      plate: { label: "Pravilan tanjur" },
      tutorials: { label: "Praktične upute" },
    },
  },
  rom: {
    ariaLabel: "Siklyarimata vash o gudlo rat",
    tabs: {
      glucose: { label: "Zaharo and-o rat" },
      insulin: { label: "Sar kerel buchi i insulina" },
      plate: { label: "O vorta charo" },
      tutorials: { label: "Kherutne siklyarimata" },
    },
  },
};

function useSafeLanguage(propLang?: Lang): Lang {
  const ctx = useContext(LanguageContext);
  if (propLang && HUB_TRANSLATIONS[propLang]) return propLang;
  if (ctx?.lang && HUB_TRANSLATIONS[ctx.lang]) return ctx.lang;
  return "ro";
}

export function DiabetesInteractiveHub({
  initialTab = "glucose",
  lang: propLang,
}: DiabetesInteractiveHubProps) {
  const [activeTab, setActiveTab] = useState<DiabetesHubTab>(initialTab);
  const activeLang = useSafeLanguage(propLang);
  const strings = HUB_TRANSLATIONS[activeLang] || HUB_TRANSLATIONS.ro;


  return (
    <div className={HUB_CARD_CLASS} data-testid="diabetes-interactive-hub">
      <div role="tablist" aria-label={strings.ariaLabel} className={`${TAB_LIST_CLASS} grid-cols-2`}>
        {HUB_TABS.map((id) => {
          const isSelected = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`hub-tab-${id}`}
              aria-selected={isSelected}
              aria-controls={`hub-panel-${id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(id)}
              onKeyDown={(event) => handleTabKey(event, HUB_TABS, activeTab, setActiveTab)}
              className={tabClass(isSelected)}
            >
              {strings.tabs[id].label}
            </button>
          );
        })}
      </div>

      <div
        id={`hub-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`hub-tab-${activeTab}`}
        className="pt-6 sm:pt-7"
      >
        {activeTab === "glucose" && <GlucoseDynamicsModule lang={activeLang} />}
        {activeTab === "insulin" && <InsulinMechanicsModule lang={activeLang} />}
        {activeTab === "plate" && <DiabetesPlateMethodModule lang={activeLang} />}
        {activeTab === "tutorials" && <DiabetesStepTutorialsModule lang={activeLang} />}
      </div>
    </div>
  );
}
