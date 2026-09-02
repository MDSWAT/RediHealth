import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact — RediHealth",
  description: "Get in touch with the RediHealth team.",
};

export default function ContactPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <MailIcon className="h-6 w-6" />
          </span>
          <SectionHeading
            as="h1"
            className="mt-5 max-w-none"
            title="Contact us"
            subtitle="Have a question about RediHealth, or need help with your account? Reach out and we'll get back to you."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl space-y-6 text-base leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">General enquiries</h2>
              <a
                href="mailto:support@redihealth.app"
                className="mt-2 inline-flex items-center gap-2 text-primary hover:underline"
              >
                <MailIcon className="h-4 w-4" />
                support@redihealth.app
              </a>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Medical emergencies</h2>
              <p className="mt-2 flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-primary" />
                If you are experiencing a medical emergency, call your local emergency number (e.g. 112) immediately.
                Do not wait for a response from this form.
              </p>
            </div>

            <p>
              For help requests and medical assistance, use the{" "}
              <a href="/get-help" className="text-primary hover:underline">
                Get Help
              </a>{" "}
              page instead so your request reaches our care team directly.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
