import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UsersIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Accessibility — RediHealth",
  description: "RediHealth's commitment to an accessible experience for all users.",
};

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <UsersIcon className="h-6 w-6" />
          </span>
          <SectionHeading
            as="h1"
            className="mt-5 max-w-none"
            title="Accessibility"
            subtitle="We want RediHealth to be usable by everyone, including people who rely on assistive technology."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              We aim to design RediHealth to be compatible with screen readers and keyboard navigation, with
              sufficient color contrast and clear focus states throughout the site.
            </p>
            <p>
              Accessibility is an ongoing effort. If you encounter a page or feature that is difficult to use with
              assistive technology, please let us know so we can improve it.
            </p>
            <p>
              Contact us at{" "}
              <a href="mailto:support@redihealth.app" className="text-primary hover:underline">
                support@redihealth.app
              </a>{" "}
              to report an accessibility issue or request information in an alternative format.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
