"use client";

import { useContext, useState } from "react";
import dynamic from "next/dynamic";
import {
  ActivityIcon,
  AppleIcon,
  BookIcon,
  DropletIcon,
} from "@/components/ui/icons";
import { LanguageContext } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { GlucoseDynamicsModule } from "./GlucoseDynamicsModule";

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

export interface DiabetesInteractiveHubProps {
  initialTab?: DiabetesHubTab;
  lang?: Lang;
}

interface HubTabDefinition {
  id: DiabetesHubTab;
  label: string;
  shortDescription: string;
  icon: typeof ActivityIcon;
}

interface HubTranslations {
  ariaLabel: string;
  tabs: Record<DiabetesHubTab, { label: string; shortDescription: string }>;
}

const HUB_TRANSLATIONS: Record<Lang, HubTranslations> = {
  ro: {
    ariaLabel: "Lecții despre diabet",
    tabs: {
      glucose: {
        label: "Zahărul din sânge",
        shortDescription: "Cum urcă după masă și ce înseamnă valorile",
      },
      insulin: {
        label: "Cum lucrează insulina",
        shortDescription: "Insulina și tipurile de diabet",
      },
      plate: {
        label: "Farfuria potrivită",
        shortDescription: "Cât pui din fiecare aliment",
      },
      tutorials: {
        label: "Ghiduri practice",
        shortDescription: "Cum măsori zahărul și cum îngrijești picioarele",
      },
    },
  },
  en: {
    ariaLabel: "Diabetes lessons",
    tabs: {
      glucose: {
        label: "Blood sugar",
        shortDescription: "How it rises after meals and what your numbers mean",
      },
      insulin: {
        label: "How insulin works",
        shortDescription: "Insulin and the types of diabetes",
      },
      plate: {
        label: "The right plate",
        shortDescription: "How much of each food to eat",
      },
      tutorials: {
        label: "How-to guides",
        shortDescription: "Checking blood sugar and caring for your feet",
      },
    },
  },
  sq: {
    ariaLabel: "Mësime për diabetin",
    tabs: {
      glucose: {
        label: "Sheqeri në gjak",
        shortDescription: "Si rritet pas ngrënies dhe çfarë tregojnë vlerat",
      },
      insulin: {
        label: "Si punon insulina",
        shortDescription: "Insulina dhe llojet e diabetit",
      },
      plate: {
        label: "Pjata e duhur",
        shortDescription: "Sa të hash nga çdo ushqim",
      },
      tutorials: {
        label: "Udhëzime praktike",
        shortDescription: "Si të masësh sheqerin dhe të kujdesesh për këmbët",
      },
    },
  },
  it: {
    ariaLabel: "Lezioni sul diabete",
    tabs: {
      glucose: {
        label: "Lo zucchero nel sangue",
        shortDescription: "Come sale dopo i pasti e cosa dicono i valori",
      },
      insulin: {
        label: "Come funziona l'insulina",
        shortDescription: "L'insulina e i tipi di diabete",
      },
      plate: {
        label: "Il piatto giusto",
        shortDescription: "Quanto mangiare di ogni cibo",
      },
      tutorials: {
        label: "Guide pratiche",
        shortDescription: "Misurare la glicemia e curare i piedi",
      },
    },
  },
};

const TAB_ICONS: Record<DiabetesHubTab, typeof ActivityIcon> = {
  glucose: ActivityIcon,
  insulin: DropletIcon,
  plate: AppleIcon,
  tutorials: BookIcon,
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

  const tabs: HubTabDefinition[] = (["glucose", "insulin", "plate", "tutorials"] as DiabetesHubTab[]).map(
    (id) => ({
      id,
      label: strings.tabs[id].label,
      shortDescription: strings.tabs[id].shortDescription,
      icon: TAB_ICONS[id],
    })
  );

  return (
    <div
      className="space-y-4"
      data-testid="diabetes-interactive-hub"
    >
      {/* Hub Navigation Bar — clean 2x2 selector grid */}
      <div
        role="tablist"
        aria-label={strings.ariaLabel}
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`hub-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`hub-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-[68px] flex-col items-start justify-center rounded-lg border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                isSelected
                  ? "border-foreground bg-surface-subtle text-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50"
              }`}
            >
              <span className="text-[15px] font-semibold leading-snug text-foreground">
                {tab.label}
              </span>
              <span className="mt-1 text-xs leading-snug break-words text-muted-foreground">
                {tab.shortDescription}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Module Content Panel */}
      <div
        id={`hub-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`hub-tab-${activeTab}`}
      >
        {activeTab === "glucose" && <GlucoseDynamicsModule lang={activeLang} />}
        {activeTab === "insulin" && <InsulinMechanicsModule lang={activeLang} />}
        {activeTab === "plate" && <DiabetesPlateMethodModule lang={activeLang} />}
        {activeTab === "tutorials" && <DiabetesStepTutorialsModule lang={activeLang} />}
      </div>
    </div>
  );
}
