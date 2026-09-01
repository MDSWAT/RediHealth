import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  ClipboardCheckIcon,
  HandHelpingIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";

const steps = [
  {
    title: "Tell us what you need",
    description:
      "Share a few details about the help you're looking for. Plain language, no forms full of jargon.",
    Icon: ClipboardCheckIcon,
  },
  {
    title: "A support worker reviews your request",
    description:
      "A healthcare support worker reads your request and works out how best to help.",
    Icon: HandHelpingIcon,
  },
  {
    title: "We help you find the right service",
    description:
      "We guide you toward the appropriate service and support you along the way.",
    Icon: StethoscopeIcon,
  },
];

export function MedicalAssistance() {
  return (
    <section className="border-y border-border bg-background py-16 sm:py-20">
      <Container>
        <SectionHeading
          as="h2"
          title="Need help getting medical care?"
          subtitle="If you're having difficulty finding a doctor or arranging an appointment, our support team can help guide you through the process."
        />

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ title, description, Icon }, index) => (
            <li
              key={title}
              className="relative flex h-full flex-col rounded-xl border border-border bg-card p-7"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/get-help" size="lg">
            Request Help
          </Button>
          <Button href="/find-help" size="lg" variant="outline">
            Find Healthcare Services
          </Button>
        </div>
      </Container>
    </section>
  );
}
