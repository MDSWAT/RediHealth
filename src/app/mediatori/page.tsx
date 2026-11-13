import type { Metadata } from "next";
import { MediatorPublicHero } from "@/components/mediator/MediatorPublicHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
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
            <Reveal className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{pageCopy.whoIsTitle}</h2>
              <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-muted-foreground">{pageCopy.whoIsDesc}</p>
            </Reveal>
            {/* Plain hairline-separated rows instead of decorative check marks. */}
            <Reveal delay={0.08} className="lg:pt-12">
              <ul className="divide-y divide-border border-y border-border text-base leading-relaxed text-foreground">
                {pageCopy.bullets.map((bullet) => (
                  <li key={bullet} className="py-3.5">
                    {bullet}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>
    </main>
  );
}
