import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeartIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About — RediHealth",
  description:
    "RediHealth helps people understand their health risks and connects them with medical assistance and healthcare workers.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <HeartIcon className="h-6 w-6" />
          </span>
          <SectionHeading
            as="h1"
            className="mt-5 max-w-none"
            title="About RediHealth"
            subtitle="RediHealth is a healthcare coordination platform that helps people understand their health, find medical assistance, and connect with the healthcare workers who can help."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              We built RediHealth to make it easier for people to know what to do next when they have a health concern —
              whether that means checking symptoms, learning about a condition, or requesting help from a medical
              professional or mediator.
            </p>
            <p>
              Our platform combines plain-language health information with tools that connect patients to healthcare
              workers, track care plans and follow-ups, and give people a simple way to ask for help when they need it
              most.
            </p>
            <p>
              RediHealth is not a substitute for professional medical advice, diagnosis, or treatment. If you are
              experiencing a medical emergency, call your local emergency number immediately.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
