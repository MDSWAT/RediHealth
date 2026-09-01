import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";

type HelpOption = {
  title: string;
  description: string;
  cta: string;
  href: string;
  iconSrc: string;
};

const options: HelpOption[] = [
  {
    title: "Learn About Your Health",
    description:
      "Understand common health risks and learn practical ways to protect your health.",
    cta: "Explore Health Topics",
    href: "/health-information",
    iconSrc: "/Icons/Learn.svg",
  },
  {
    title: "Check Your Health Risks",
    description:
      "Answer a few simple questions to better understand potential health risks.",
    cta: "Start Health Check",
    href: "/health-check",
    iconSrc: "/Icons/Check.svg",
  },
  {
    title: "Get Medical Help",
    description:
      "Find healthcare services or ask for help arranging an appointment.",
    cta: "Find Help",
    href: "/find-help",
    iconSrc: "/Icons/Map.svg",
  },
];

export function HelpOptions() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          as="h2"
          align="center"
          title="How can we help?"
          subtitle="Choose what you need and we'll guide you through the next steps."
          titleClassName="text-3xl sm:text-4xl"
          className="mx-auto"
        />

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {options.map(({ title, description, cta, href, iconSrc }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-7 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <img
                  src={iconSrc}
                  alt=""
                  className="h-14 w-14 object-contain"
                />
                <h3 className="mt-5 text-xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold text-primary">
                  {cta}
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
