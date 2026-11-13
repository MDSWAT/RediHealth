"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CameraIcon, CheckCircleIcon } from "@/components/ui/icons";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import {
  optionArrow,
  optionDesc,
  optionIcon,
  optionRow,
  optionTitle,
  primaryButton,
  stepHeading,
  stepLead,
  subHeading,
  textInput,
} from "@/components/health-assistant/step-ui";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

interface PathwayPrescriptionProps {
  step: 2 | 3;
  input: {
    method?: "photo" | "text";
    medicineName?: string;
  };
  onSelectInput: (method: "photo" | "text", medicineName?: string) => void;
  plainLanguage: boolean;
}

/** Brand and generic names as they appear on prescriptions; amoxicillin is spelled per language. */
const AMOXICILLIN: Record<Lang, string> = {
ru: "Амоксициллин",

  ro: "Amoxicilină",
  en: "Amoxicillin",
  sq: "Amoksicilinë",
  it: "Amoxicillina",
  hr: "Amoksicilin",
  rom: "Amoksicilina",
};
const COMMON_DRUGS = [
  "Augmentin",
  "Paracetamol",
  "Metformin",
  "Enalapril",
  "Ibuprofen",
  "Omeprazol",
  "Aspenter",
  "No-Spa",
  "Algocalmin",
];

export function PathwayPrescription({ step, input, onSelectInput, plainLanguage }: PathwayPrescriptionProps) {
  const { lang } = useLanguage();
  const { rx } = useAssistantCopy();
  const inputId = useId();
  const listId = useId();
  const [medicineSearch, setMedicineSearch] = useState(input.medicineName || "");
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const drugs = [AMOXICILLIN[lang] ?? AMOXICILLIN.ro, ...COMMON_DRUGS];
  const term = medicineSearch.toLowerCase().trim();
  const filteredDrugs = term ? drugs.filter((d) => d.toLowerCase().includes(term)) : [];
  const listOpen = showAutocomplete && filteredDrugs.length > 0;

  function handleSelectDrug(drug: string) {
    setMedicineSearch(drug);
    setShowAutocomplete(false);
    onSelectInput("text", drug);
  }

  function handleTextSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!medicineSearch.trim()) return;
    onSelectInput("text", medicineSearch.trim());
  }

  if (step === 2) {
    return (
      <div>
        <h2 className={stepHeading}>{rx.heading}</h2>
        <p className={stepLead}>{rx.lead}</p>

        {/* Two ways in: a photo of the prescription, or the medicine's name. */}
        <Link href={withLangPrefix("/prescription-review", lang)} className={`mt-6 ${optionRow}`}>
          <span aria-hidden="true" className={optionIcon}>
            <CameraIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={optionTitle}>{rx.photoTitle}</span>
            <span className={optionDesc}>{rx.photoDesc}</span>
          </span>
          <ArrowRightIcon aria-hidden="true" className={optionArrow} />
        </Link>

        <form onSubmit={handleTextSubmit} className="mt-6 border-t border-border pt-6">
          <label htmlFor={inputId} className={`block ${subHeading}`}>
            {rx.searchTitle}
          </label>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{rx.searchDesc}</p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="relative min-w-0 flex-1">
              <input
                id={inputId}
                type="text"
                role="combobox"
                aria-expanded={listOpen}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                value={medicineSearch}
                onChange={(e) => {
                  setMedicineSearch(e.target.value);
                  setShowAutocomplete(true);
                }}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => setShowAutocomplete(false)}
                placeholder={rx.placeholder}
                className={textInput}
              />

              {listOpen && (
                <ul
                  id={listId}
                  role="listbox"
                  aria-label={rx.suggestions}
                  className="absolute left-0 right-0 z-10 mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg"
                >
                  {filteredDrugs.map((drug) => (
                    <li key={drug} role="option" aria-selected={false}>
                      <button
                        type="button"
                        // Keep focus in the input so blur does not close the list before the click lands.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectDrug(drug)}
                        className="flex min-h-11 w-full items-center whitespace-nowrap rounded-lg px-3 text-left text-sm text-foreground hover:bg-sapphire-soft/50 sm:text-[0.9375rem]"
                      >
                        <span className="min-w-0 truncate">{drug}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" disabled={!medicineSearch.trim()} className={`shrink-0 ${primaryButton}`}>
              {rx.submit}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const selectedMed = input.medicineName || medicineSearch || rx.fallbackMedicine;
  const rules = plainLanguage ? rx.plainRules : rx.rules;

  return (
    <div>
      <h2 className={stepHeading}>{rx.resultHeading(selectedMed)}</h2>

      <h3 className={`mt-6 ${subHeading}`}>{rx.rulesHeading}</h3>
      <ul className="mt-3 space-y-2.5">
        {rules.map((rule) => (
          <li key={rule} className="flex items-start gap-2.5 text-base leading-relaxed text-foreground">
            <CheckCircleIcon className="mt-1 h-4.5 w-4.5 shrink-0 text-sapphire dark:text-sapphire-border" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <UniversalDoctorExit
        pathway="prescription"
        title={rx.exitTitle}
        description={rx.exitBody}
        summary={rx.summary(selectedMed)}
      />
    </div>
  );
}
