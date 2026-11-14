"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CAPSULE_TABS, capsuleTab } from "@/components/layout/chrome-capsule";
import { CapsuleGlidePlate, useCapsuleGlide } from "@/components/layout/CapsuleGlide";
import { ActivityIcon, FileTextIcon, MessageDotsIcon, PinIcon } from "@/components/ui/icons";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export const ASSISTANT_NAV_COPY: Record<
  Lang,
  { navLabel: string; assistant: string; symptoms: string; prescription: string; otherTools: string }
> = {
  ru: {
    navLabel: "Разделы помощника по здоровью",
    assistant: "Помощник по здоровью",
    symptoms: "Проверить симптомы",
    prescription: "Объяснить рецепт",
    otherTools: "Другие способы помочь",
  },
  en: {
    navLabel: "Health assistant sections",
    assistant: "Health assistant",
    symptoms: "Check my symptoms",
    prescription: "Explain my prescription",
    otherTools: "Other ways we can help",
  },
  ro: {
    navLabel: "Secțiunile asistentului virtual",
    assistant: "Asistent virtual",
    symptoms: "Verifică simptomele",
    prescription: "Explică-mi rețeta",
    otherTools: "Alte moduri prin care te putem ajuta",
  },
  sq: {
    navLabel: "Pjesët e asistentit shëndetësor",
    assistant: "Asistent shëndetësor",
    symptoms: "Kontrollo simptomat",
    prescription: "Shpjego recetën time",
    otherTools: "Mënyra të tjera si mund të ndihmojmë",
  },
  it: {
    navLabel: "Sezioni dell'assistente sanitario",
    assistant: "Assistente sanitario",
    symptoms: "Controlla i sintomi",
    prescription: "Spiegami la ricetta",
    otherTools: "Altri modi in cui possiamo aiutare",
  },
  hr: {
    navLabel: "Odjeljci zdravstvenog asistenta",
    assistant: "Zdravstveni asistent",
    symptoms: "Provjeri simptome",
    prescription: "Objasni mi recept",
    otherTools: "Drugi načini na koje možemo pomoći",
  },
  rom: {
    navLabel: "Riga le sastipnaske azhutitoreske",
    assistant: "Sastipnasko azhutitori",
    symptoms: "Dikh e simptome",
    prescription: "Xatyar mange i receta",
    otherTools: "Aver droma sar shaj azhutis tut",
  },
};

function useAssistantNavState() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const normalizedPathname = stripLangFromPathname(pathname);
  const { trackRef, plateRef } = useCapsuleGlide<HTMLDivElement>();

  // On narrow phones the menu scrolls sideways: bring the current tool into view without moving the page.
  useEffect(() => {
    const track = trackRef.current;
    const current = track?.querySelector<HTMLElement>("[aria-current]");
    if (!track || !current) return;
    const overflowRight = current.offsetLeft + current.offsetWidth - track.clientWidth + 4;
    if (overflowRight > 0) track.scrollLeft = overflowRight;
  }, [normalizedPathname, trackRef]);

  const t = ASSISTANT_NAV_COPY[lang] || ASSISTANT_NAV_COPY[DEFAULT_LANG];

  const items = [
    { href: "/health-assistant", label: t.assistant, Icon: MessageDotsIcon },
    { href: "/health-check", label: t.symptoms, Icon: ActivityIcon },
    { href: "/prescription-review", label: t.prescription, Icon: FileTextIcon },
    // Opens the map of pharmacies, practices and hospitals: often the first stop before a doctor.
    { href: "/find-help", label: findHelpLinks(lang).nav, Icon: PinIcon },
  ].map((item) => ({
    ...item,
    isActive: normalizedPathname === item.href || normalizedPathname.startsWith(`${item.href}/`),
  }));

  return { lang, t, items, trackRef, plateRef };
}

export function AssistantNavigation() {
  const { lang, t, items, trackRef, plateRef } = useAssistantNavState();

  return (
    // Desktop/tablet horizontal capsule menu; phones use AssistantOtherTools at page bottom (P24 + 8ee82c9).
    <nav aria-label={t.navLabel} className="max-md:hidden mb-4 flex sm:mb-5">
      <div ref={trackRef} className={CAPSULE_TABS}>
        <CapsuleGlidePlate plateRef={plateRef} />
        {items.map(({ href, label, Icon, isActive }) => (
          <Link
            key={href}
            href={withLangPrefix(href, lang)}
            aria-current={isActive ? "page" : undefined}
            data-capsule-item=""
            className={capsuleTab(isActive)}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${isActive ? "text-sapphire dark:text-sapphire-border" : "opacity-70"}`}
              aria-hidden="true"
            />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Below md, renders sibling tools as a vertical icon-and-label list at the end of the page. */
export function AssistantOtherTools() {
  const headingId = useId();
  const { lang, t, items } = useAssistantNavState();
  const otherItems = items.filter((item) => !item.isActive);

  return (
    <section
      aria-labelledby={headingId}
      className="mt-8 border-t border-border pt-6 md:hidden dark:border-ink-800 print:hidden"
    >
      <h2 id={headingId} className="text-body font-semibold text-foreground">
        {t.otherTools}
      </h2>
      <ul className="mt-3 divide-y divide-border border-y border-border dark:divide-ink-800 dark:border-ink-800">
        {otherItems.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={withLangPrefix(href, lang)}
              className="press-row flex min-h-12 w-full items-center gap-3 whitespace-nowrap py-2.5 text-body font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none dark:hover:text-sapphire-border"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
