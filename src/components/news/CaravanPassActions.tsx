"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FamilyShareButton } from "@/components/ui/FamilyShareButton";
import { CalendarIcon, PinIcon } from "@/components/ui/icons";
import { caravanDirectionsUrl, downloadCaravanIcs } from "@/components/news/caravan-calendar";
import { formatNewsDate, placeName, resolveNewsBasePath } from "@/components/news/news-format";
import type { NewsArticle } from "@/lib/data/news";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { getSiteUrl } from "@/lib/site-url";

const PASS_COPY: Record<Lang, {
  directions: string;
  saveReminder: string;
  reminderSaved: string;
  reminderSavedAnnouncement: string;
}> = {
  ro: {
    directions: "Indicații rută",
    saveReminder: "Salvează în calendar",
    reminderSaved: "Salvat în calendar",
    reminderSavedAnnouncement: "Evenimentul caravanei a fost salvat în fișierul calendar.",
  },
  en: {
    directions: "Directions",
    saveReminder: "Save reminder",
    reminderSaved: "Reminder saved",
    reminderSavedAnnouncement: "Caravan reminder downloaded as a calendar file.",
  },
  sq: {
    directions: "Udhëzimet e rrugës",
    saveReminder: "Ruaj kujtesën",
    reminderSaved: "Kujtesa u ruajt",
    reminderSavedAnnouncement: "Kujtesa e karvanit u shkarkua si skedar kalendari.",
  },
  it: {
    directions: "Indicazioni",
    saveReminder: "Salva promemoria",
    reminderSaved: "Promemoria salvato",
    reminderSavedAnnouncement: "Promemoria della carovana scaricato come file calendario.",
  },
  hr: {
    directions: "Upute za dolazak",
    saveReminder: "Spremi podsjetnik",
    reminderSaved: "Podsjetnik spremljen",
    reminderSavedAnnouncement: "Podsjetnik karavane preuzet je kao kalendarska datoteka.",
  },
  rom: {
    directions: "Sikav o drom",
    saveReminder: "Garav ando kalendari",
    reminderSaved: "Kalendari garavdo",
    reminderSavedAnnouncement: "O kalendaresqo fajlo vaš i karavana sas tele-lino.",
  },
  ru: {
    directions: "Маршрут",
    saveReminder: "В календарь",
    reminderSaved: "Файл сохранён",
    reminderSavedAnnouncement: "Напоминание о караване сохранено в файл календаря.",
  },
};

export interface CaravanPassActionsProps {
  article: NewsArticle;
  lang: Lang;
}

/** Action bar for a civic caravan pass: map directions, `.ics` calendar reminder, and family share. */
export function CaravanPassActions({ article, lang }: CaravanPassActionsProps) {
  const [saved, setSaved] = useState(false);
  const copy = PASS_COPY[lang];
  const details = article.caravanDetails;

  const basePath = resolveNewsBasePath(lang);
  const articleUrl = `${getSiteUrl()}${withLangPrefix(`${basePath}/${article.slug}`, lang)}`;
  const directionsHref = caravanDirectionsUrl(article);
  const localizedArea = placeName(article.county, lang);
  const shareText = details
    ? `${details.village}, ${details.landmark} (${formatNewsDate(article.date, lang)}, ${details.hours})`
    : article.summary;

  const handleSaveReminder = () => {
    const ok = downloadCaravanIcs(article, {
      url: articleUrl,
      locationLabel: localizedArea,
    });
    if (ok) {
      setSaved(true);
    }
  };

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="action"
          size="md"
        >
          <PinIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{copy.directions}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleSaveReminder}
        >
          <CalendarIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{saved ? copy.reminderSaved : copy.saveReminder}</span>
        </Button>

        <FamilyShareButton
          title={article.title}
          text={shareText}
          url={articleUrl}
          lang={lang}
          compact
          align="left"
        />
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {saved ? copy.reminderSavedAnnouncement : ""}
      </p>
    </div>
  );
}
