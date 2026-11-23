"use client";

import { useEffect, useState } from "react";
import { COUNTRY_LABELS, type CountryCode } from "@/lib/countries";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { usePanelRuntime } from "./PanelRuntime";

type CountryAccess = {
  active: CountryCode | null;
  available: { country: CountryCode; role: string }[];
};

const labelByLang: Record<Lang, string> = {
  ru: "Страна",
  en: "Country",
  ro: "Țara",
  sq: "Shteti",
  it: "Paese",
  hr: "Država",
  rom: "Them",
};

/** Shows which country's data the panel is working with, and lets staff with several countries switch. */
export function CountrySwitcher({ compact = false }: { compact?: boolean }) {
  const { request: fetch } = usePanelRuntime();
  const { lang } = useLanguage();
  const [access, setAccess] = useState<CountryAccess | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/staff/country")
      .then((response) => (response.ok ? (response.json() as Promise<CountryAccess>) : null))
      .then((data) => {
        if (!cancelled) setAccess(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [fetch]);

  if (!access?.active) return null;

  const label = labelByLang[lang];
  const activeName = COUNTRY_LABELS[access.active][lang];

  if (access.available.length < 2) {
    return (
      <p
        className={`truncate whitespace-nowrap text-xs font-medium text-(--panel-muted) ${compact ? "text-center" : "px-1"}`}
        title={`${label}: ${activeName}`}
      >
        {compact ? access.active : `${label}: ${activeName}`}
      </p>
    );
  }

  async function switchCountry(country: CountryCode) {
    setSwitching(true);
    try {
      const response = await fetch("/api/staff/country", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
      if (response.ok) window.location.reload();
    } finally {
      setSwitching(false);
    }
  }

  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={access.active}
        disabled={switching}
        onChange={(event) => void switchCountry(event.target.value as CountryCode)}
        className={`min-h-11 w-full whitespace-nowrap rounded-lg border border-(--panel-control-border) bg-(--panel-surface) font-medium text-(--panel-ink) transition-colors hover:bg-(--panel-subtle) disabled:opacity-60 ${compact ? "px-1 text-center text-xs" : "px-2.5 text-[13px]"}`}
      >
        {access.available.map(({ country }) => (
          <option key={country} value={country}>
            {compact ? country : COUNTRY_LABELS[country][lang]}
          </option>
        ))}
      </select>
    </label>
  );
}
