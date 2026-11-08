"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CameraIcon, CheckCircleIcon } from "@/components/ui/icons";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

interface PathwayPrescriptionProps {
  step: 2 | 3;
  input: {
    method?: "photo" | "text";
    medicineName?: string;
  };
  onSelectInput: (method: "photo" | "text", medicineName?: string) => void;
  plainLanguage: boolean;
}

/** Brand and generic names as they appear on Romanian prescriptions; amoxicillin is spelled per language. */
const AMOXICILLIN: Record<string, string> = {
  ro: "Amoxicilină",
  en: "Amoxicillin",
  sq: "Amoksicilinë",
  it: "Amoxicillina",
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
        <h2 className="text-lg font-semibold text-foreground">{rx.heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{rx.lead}</p>

        {/* One surface, two ways in: no overflow clipping, so the medicine suggestions can extend below. */}
        <div className="mt-5 grid grid-cols-1 divide-y divide-border rounded-lg border border-border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <Link
            href={withLangPrefix("/prescription-review", lang)}
            className="flex min-h-[56px] flex-col items-start rounded-t-lg p-5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:rounded-l-lg sm:rounded-tr-none"
          >
            <CameraIcon className="h-6 w-6 text-sapphire dark:text-sapphire-border" />
            <span className="mt-3 text-sm font-semibold text-foreground">{rx.photoTitle}</span>
            <span className="mt-1 text-sm text-muted-foreground">{rx.photoDesc}</span>
          </Link>

          <form onSubmit={handleTextSubmit} className="p-5">
            <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
              {rx.searchTitle}
            </label>
            <p className="mt-1 text-sm text-muted-foreground">{rx.searchDesc}</p>

            <div className="relative mt-3">
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
                className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              />

              {listOpen && (
                <ul
                  id={listId}
                  role="listbox"
                  aria-label={rx.suggestions}
                  className="absolute left-0 right-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-md"
                >
                  {filteredDrugs.map((drug) => (
                    <li key={drug} role="option" aria-selected={false}>
                      <button
                        type="button"
                        // Keep focus in the input so blur does not close the list before the click lands.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectDrug(drug)}
                        className="w-full px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted"
                      >
                        {drug}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={!medicineSearch.trim()}
              className="mt-3 min-h-[44px] w-full rounded-lg bg-sapphire px-4 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {rx.submit}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const selectedMed = input.medicineName || medicineSearch || rx.fallbackMedicine;
  const rules = plainLanguage ? rx.plainRules : rx.rules;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{rx.resultHeading(selectedMed)}</h2>

      <h3 className="mt-5 text-sm font-semibold text-foreground">{rx.rulesHeading}</h3>
      <ul className="mt-2 space-y-2.5">
        {rules.map((rule) => (
          <li key={rule} className="flex items-start gap-2.5 text-base leading-relaxed text-foreground">
            <CheckCircleIcon className="mt-1 h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
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
