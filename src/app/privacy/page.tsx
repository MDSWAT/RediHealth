import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LockIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Privacy Notice — RediHealth",
  description: "How RediHealth collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <LockIcon className="h-6 w-6" />
          </span>
          <SectionHeading
            as="h1"
            className="mt-5 max-w-none"
            title="Privacy Notice"
            subtitle="This notice explains what information RediHealth collects and how it is used."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl space-y-6 text-base leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Information we collect</h2>
              <p className="mt-2">
                When you request help, create a patient profile, or sign in, we collect information such as your
                name, contact details, and the health information you choose to share with us, so that healthcare
                workers can assist you.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">How we use it</h2>
              <p className="mt-2">
                Your information is used to coordinate care, contact you about your requests, and improve the
                services we offer. We do not sell your personal or health information.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Who can see it</h2>
              <p className="mt-2">
                Health information is only visible to the healthcare workers, mediators, and administrators involved
                in coordinating your care, and to you through the patient portal.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Your choices</h2>
              <p className="mt-2">
                You can request access to, correction of, or deletion of your information by contacting us at{" "}
                <a href="mailto:support@redihealth.app" className="text-primary hover:underline">
                  support@redihealth.app
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
