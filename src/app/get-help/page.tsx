import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { RequestHelpForm } from "@/components/get-help/RequestHelpForm";
import { HandHelpingIcon, PhoneIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Request Medical Help — RediHealth",
  description:
    "Request help arranging medical care. Share your phone number, email, and a brief description of what's wrong, and a support worker will get in touch.",
};

export default function GetHelpPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <HandHelpingIcon className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Request medical help
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              If you&apos;re having difficulty finding a doctor or arranging an
              appointment, tell us a little about what you need. A healthcare
              support worker will review your request and get in touch.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <RequestHelpForm />

            <aside className="lg:pt-2">
              <div className="rounded-xl border border-primary/20 bg-primary-soft p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white">
                    <PhoneIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      In a medical emergency
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                      This service is not for emergencies. If you think you may
                      be experiencing a medical emergency, contact your local
                      emergency service immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold text-foreground">
                  What happens next
                </h2>
                <ol className="mt-4 space-y-4">
                  {[
                    "We review the details you share.",
                    "A support worker gets in touch using your contact details.",
                    "We help guide you toward the right service.",
                  ].map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
