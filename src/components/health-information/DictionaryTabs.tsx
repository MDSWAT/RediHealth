"use client";

export interface DictionaryTabsProps {
  active: "dictionary" | "romanes";
  dictionaryLabel: string;
  romanesLabel: string;
  onSelect: (tab: "dictionary" | "romanes") => void;
}

/** Switches between the Romanian dictionary and the Romanes glossary inside one drawer slot. */
export function DictionaryTabs({ active, dictionaryLabel, romanesLabel, onSelect }: DictionaryTabsProps) {
  return (
    <div role="tablist" className="mt-4 grid grid-cols-2 border-b border-border">
      {(["dictionary", "romanes"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => active !== tab && onSelect(tab)}
          className={`-mb-px min-h-11 border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire ${
            active === tab ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab === "dictionary" ? dictionaryLabel : romanesLabel}
        </button>
      ))}
    </div>
  );
}
