"use client";

import { useEffect, useState } from "react";
import { AlertCircleIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const guardCopy = {
  ro: {
    toastNotice: "Semnalul e slab. Am oprit imaginea ca să te auzi mai bine.",
    activeTitle: "Vorbiți doar cu voce",
    activeSubtitle: "Imaginea e oprită, ca sunetul să se audă clar pe semnal slab.",
    restartVideo: "Pornește imaginea",
  },
  en: {
    toastNotice: "Your signal is weak. We turned off video so you can hear each other better.",
    activeTitle: "Voice only",
    activeSubtitle: "Video is off so the sound stays clear on a weak signal.",
    restartVideo: "Turn video on",
  },
  sq: {
    toastNotice: "Sinjali është i dobët. E fikëm videon që të dëgjoheni më mirë.",
    activeTitle: "Vetëm me zë",
    activeSubtitle: "Videoja është e fikur që zëri të dëgjohet qartë me sinjal të dobët.",
    restartVideo: "Ndiz videon",
  },
  it: {
    toastNotice: "Il segnale è debole. Abbiamo spento il video per farvi sentire meglio.",
    activeTitle: "Solo voce",
    activeSubtitle: "Il video è spento, così l'audio resta chiaro anche con poco segnale.",
    restartVideo: "Accendi il video",
  },
};

interface AdaptiveBandwidthGuardProps {
  isLowBandwidth: boolean;
  onToggleAudioOnly: (audioOnly: boolean) => void;
  audioOnlyMode: boolean;
}

/**
 * Voice-only notice for the video room. On a weak connection it switches the call to voice only
 * once (unless the patient turned video back on) and says so; while voice-only is on, a compact
 * bar sits over the top of the call with a way back to video. It never covers the call's own controls.
 */
export function AdaptiveBandwidthGuard({ isLowBandwidth, onToggleAudioOnly, audioOnlyMode }: AdaptiveBandwidthGuardProps) {
  const { lang } = useSafeLanguage();
  const copy = guardCopy[lang] ?? guardCopy.ro;
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [manualVideoOverride, setManualVideoOverride] = useState(false);

  useEffect(() => {
    if (isLowBandwidth && !audioOnlyMode && !manualVideoOverride) {
      onToggleAudioOnly(true);
      const showTimer = setTimeout(() => setAutoSwitched(true), 0);
      return () => clearTimeout(showTimer);
    }
  }, [isLowBandwidth, audioOnlyMode, manualVideoOverride, onToggleAudioOnly]);

  useEffect(() => {
    if (!isLowBandwidth) {
      const resetTimer = setTimeout(() => setManualVideoOverride(false), 0);
      return () => clearTimeout(resetTimer);
    }
  }, [isLowBandwidth]);

  if (!audioOnlyMode) return null;

  return (
    <div role="status" className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
      <div className="pointer-events-auto flex w-full max-w-lg flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200 shadow-[0_12px_24px_-12px_rgb(0_0_0/0.6)]">
        {autoSwitched ? (
          <AlertCircleIcon className="h-4 w-4 shrink-0 text-amber-300" />
        ) : (
          <PhoneIcon className="h-4 w-4 shrink-0 text-sapphire-border" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{copy.activeTitle}</p>
          <p className="text-xs leading-relaxed text-slate-400">{autoSwitched ? copy.toastNotice : copy.activeSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setManualVideoOverride(true);
            setAutoSwitched(false);
            onToggleAudioOnly(false);
          }}
          className="inline-flex min-h-[40px] items-center rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {copy.restartVideo}
        </button>
      </div>
    </div>
  );
}
