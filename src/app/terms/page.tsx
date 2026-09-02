import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FileTextIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Terms of Use — RediHealth",
  description: "The terms that apply when you use RediHealth.",
};

export default function TermsPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <FileTextIcon className="h-6 w-6" />
          </span>
          <SectionHeading
            as="h1"
            className="mt-5 max-w-none"
            title="Terms of Use"
            subtitle="By using RediHealth, you agree to the following terms."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl space-y-6 text-base leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Not a substitute for medical care</h2>
              <p className="mt-2">
                RediHealth provides general health information and helps coordinate access to care. It does not
                provide medical diagnoses and is not a substitute for professional medical advice. In an emergency,
                call your local emergency number immediately.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Your account</h2>
              <p className="mt-2">
                You are responsible for the accuracy of the information you provide and for keeping your account
                credentials secure.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Acceptable use</h2>
              <p className="mt-2">
                You agree not to misuse the platform, including submitting false medical information, attempting to
                access accounts that are not yours, or interfering with the operation of the service.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Changes</h2>
              <p className="mt-2">
                We may update these terms from time to time. Continued use of RediHealth after changes take effect
                means you accept the updated terms.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
