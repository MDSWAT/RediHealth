"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CAPSULE_TABS, capsuleTab } from "@/components/layout/chrome-capsule";
import { CapsuleGlidePlate, useCapsuleGlide } from "@/components/layout/CapsuleGlide";
import { ActivityIcon, AiAssistantIcon, FileTextIcon, HandHelpingIcon, PinIcon } from "@/components/ui/icons";
import { AI_CHAT_COPY } from "@/components/health-assistant/ai-chat-copy";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export const ASSISTANT_NAV_COPY: Record<
  Lang,
  { navLabel: string; assistant: string; symptoms: string; prescription: string }
> = {
  ru: {
    navLabel: "Разделы помощника по здоровью",
    assistant: "Врач и документы",
    symptoms: "Проверить симптомы",
    prescription: "Объяснить рецепт",
  },
  en: {
    navLabel: "Health assistant sections",
    assistant: "Doctor and documents",
    symptoms: "Check my symptoms",
    prescription: "Explain my prescription",
  },
  ro: {
    navLabel: "Secțiunile asistentului virtual",
    assistant: "Doctor și acte",
    symptoms: "Verifică simptomele",
    prescription: "Explică-mi rețeta",
  },
  sq: {
    navLabel: "Pjesët e asistentit shëndetësor",
    assistant: "Mjeku dhe dokumentet",
    symptoms: "Kontrollo simptomat",
    prescription: "Shpjego recetën time",
  },
  it: {
    navLabel: "Sezioni dell'assistente sanitario",
    assistant: "Medico e documenti",
    symptoms: "Controlla i sintomi",
    prescription: "Spiegami la ricetta",
  },
  hr: {
    navLabel: "Odjeljci zdravstvenog asistenta",
    assistant: "Liječnik i dokumenti",
    symptoms: "Provjeri simptome",
    prescription: "Objasni mi recept",
  },
  rom: {
    navLabel: "Riga le sastipnaske azhutitoreske",
    assistant: "Doktori thaj lila",
    symptoms: "Dikh e simptome",
    prescription: "Xatyar mange i receta",
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

  // Ordered as a visit usually goes: what is wrong, then medicines, then where to go and who to see.
  const items = [
    { href: "/health-check", label: t.symptoms, Icon: ActivityIcon },
    // Free-text AI assistant: describe symptoms, learn how soon to see a doctor.
    { href: "/ai-assistant", label: (AI_CHAT_COPY[lang] ?? AI_CHAT_COPY[DEFAULT_LANG]).navLabel, Icon: AiAssistantIcon },
    { href: "/prescription-review", label: t.prescription, Icon: FileTextIcon },
    // The former step-by-step assistant: now the "which doctor, or no ID card" guide.
    { href: "/health-assistant", label: t.assistant, Icon: HandHelpingIcon },
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
    // Horizontal capsule menu on every width; on phones it scrolls sideways with the current tool in view.
    // Centred over the page, on every tool page that shares it.
    <nav aria-label={t.navLabel} className="mb-4 flex justify-center sm:mb-5">
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

