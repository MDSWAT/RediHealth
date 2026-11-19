"use client";

import {
  ASSISTANT_NAV_COPY,
  AssistantNavigation,
} from "@/components/health-assistant/AssistantNavigation";
import { Button } from "@/components/ui/Button";
import { ActivityIcon } from "@/components/ui/icons";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { WhereToGoGuide } from "@/components/health-assistant/WhereToGoGuide";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";

export function HealthAssistant() {
  const { lang } = useLanguage();
  const { tree } = useAssistantCopy();
  // The page is the "I don't know which doctor to see, or I have no ID card" guide.
  const title = tree.options.navigation.plainTitle;
  const lead = tree.options.navigation.subtitle;
  const nav = ASSISTANT_NAV_COPY[lang] || ASSISTANT_NAV_COPY[DEFAULT_LANG];

  return (
    // Same shell as /health-check: tabs span the site container (no jump when switching tabs).
    // No 112 panel here: the site-wide top bar already offers the 112 call on every page.
    <main id="main-content" className="flex-1 pt-2 pb-10 sm:pt-3 sm:pb-14">
      <Container>
        <AssistantNavigation />

        {/* One centred reading column for the header and the guide; text inside stays left-aligned. */}
        <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          title={title}
          lead={lead}
          actions={
            <>
              {/* Straight into the 3D body symptom tool; on phones the tool tabs above are hidden.
                  Outline, not filled: this page's main job is choosing a situation below, so a
                  sibling tool must not carry the strongest button on the page. */}
              <Button href={withLangPrefix("/health-check", lang)} variant="outline" size="md">
                <ActivityIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{nav.symptoms}</span>
              </Button>
              <PageListenAction lang={lang} segments={[title, lead]} />
            </>
          }
        />

        {/* Links across the site point at /health-assistant#triage. */}
        <div id="triage" className="mt-8 min-w-0 sm:mt-10">
          <WhereToGoGuide />
        </div>
        </div>
      </Container>
    </main>
  );
}
