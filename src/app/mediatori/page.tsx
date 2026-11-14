import type { Metadata } from "next";
import { MediatorPublicHero } from "@/components/mediator/MediatorPublicHero";
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
              <h2 className="text-section font-semibold text-foreground">{pageCopy.whoIsTitle}</h2>
              <p className="mt-3 max-w-(--measure-reading) text-body text-muted-foreground">{pageCopy.whoIsDesc}</p>
            </div>
            {/* Plain hairline-separated rows instead of decorative check marks. */}
            <div className="lg:pt-12">
              <ul className="divide-y divide-border border-y border-border text-body text-foreground">
                {pageCopy.bullets.map((bullet) => (
                  <li key={bullet} className="py-3.5">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
