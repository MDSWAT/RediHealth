import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FindHelpExplorer } from "@/components/find-help/FindHelpExplorer";
import { HandHelpingIcon, PhoneIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Find Medical Help — RediHealth",
  description:
    "Find medical institutes near you. Browse hospitals, clinics, GP practices, pharmacies, and more with addresses and an interactive map.",
};

export default function FindHelpPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <HandHelpingIcon className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Find medical help
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Browse medical institutes near you and see where they are on the
              map. Select a place to view its address and contact details.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <FindHelpExplorer />
        </Container>
      </section>

      <section className="border-t border-border bg-primary-soft py-12">
        <Container>
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white">
                <PhoneIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Not sure where to go?
                </h2>
                <p className="mt-1 max-w-xl text-base leading-relaxed text-foreground/80">
                  If you need help choosing or arranging care, our support team
                  can guide you. In a medical emergency, contact your local
                  emergency service immediately.
                </p>
              </div>
            </div>
            <Button href="/get-help" size="lg">
              Request Medical Help
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
