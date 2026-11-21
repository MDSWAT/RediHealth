"use client";

import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { WhereToGoGuide } from "@/components/health-assistant/WhereToGoGuide";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { useLanguage } from "@/lib/i18n/language-context";

export function HealthAssistant() {
  const { lang } = useLanguage();
  const { tree } = useAssistantCopy();
  // The page is the "I don't know which doctor to see, or I have no ID card" guide.
  const title = tree.options.navigation.plainTitle;
  const lead = tree.options.navigation.subtitle;

  return (
    <main id="main-content" className="flex-1 pt-2 pb-10 sm:pt-3 sm:pb-14">
      <Container>
        {/* One centred reading column for the header and the guide; text inside stays left-aligned. */}
        <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          title={title}
          lead={lead}
          actions={<PageListenAction lang={lang} segments={[title, lead]} />}
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
