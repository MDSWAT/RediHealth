"use client";

import { COMFORT_COPY } from "@/components/layout/ComfortMenu";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import type { Lang } from "@/lib/i18n/translations";

/**
 * The settings of the Accessibility menu, listed on the Accessibility page in the menu's own words
 * and order, so the page says what a reader can change and where. Plain rows, not controls: the
 * menu itself stays in the header. Auto-read is left out where the language has no voice, as in
 * the menu.
 */
export function AccessibilitySettingsList({ lang, lead }: { lang: Lang; lead: string }) {
  const copy = COMFORT_COPY[lang];

  const rows: { title: string; help: string }[] = [
    { title: copy.textSizeLabel, help: `${copy.scaleNormal}, ${copy.scaleLarge}, ${copy.scaleXl}` },
    ...(isVoiceEnabled(lang) ? [{ title: copy.autoReadToggle, help: copy.autoReadHelp }] : []),
    { title: copy.highContrastToggle, help: copy.highContrastHelp },
    { title: copy.underlineLinksToggle, help: copy.underlineLinksHelp },
    { title: copy.wideSpacingToggle, help: copy.wideSpacingHelp },
    { title: copy.readingGuideToggle, help: copy.readingGuideHelp },
    { title: copy.grayscaleToggle, help: copy.grayscaleHelp },
    { title: copy.calmMotionToggle, help: copy.calmMotionHelp },
  ];

  return (
    <section aria-labelledby="accessibility-settings-title" className="py-4">
      <h2 id="accessibility-settings-title" className="text-title text-foreground">
        {copy.title}
      </h2>
      <p className="mt-2">{lead}</p>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <li key={row.title} className="py-3.5">
            <p className="font-semibold text-foreground">{row.title}</p>
            <p className="mt-0.5">{row.help}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
