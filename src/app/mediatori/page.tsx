import type { Metadata } from "next";
import { MediatorPublicHero } from "@/components/mediator/MediatorPublicHero";
import { CheckIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { mediatorPageCopy, mediatorPageDescriptions } from "@/components/mediator/mediator-page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();

  return {
    title: localizedPageTitle(lang, "mediatori", "Community health mediators - RediHealth"),
    description: mediatorPageDescriptions[lang] ?? mediatorPageDescriptions.en,
  };
}

export default async function MediatoriPublicPage() {
  const lang = await getRequestLang();
  const pageCopy = mediatorPageCopy[lang] ?? mediatorPageCopy.en;

  return (
    <main id="main-content" className="flex-1 bg-background">
      <MediatorPublicHero />

      <section className="py-10 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{pageCopy.whoIsTitle}</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{pageCopy.whoIsDesc}</p>
            </div>
            <ul className="space-y-3 text-base leading-relaxed text-foreground lg:pt-12">
              {pageCopy.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </main>
  );
}
