import type { ComponentType, SVGProps } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  ActivityIcon,
  AppleIcon,
  ArrowRightIcon,
  BookIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  PhoneIcon,
  SearchIcon,
  ShieldIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Health Information — RediHealth",
  description:
    "Clear, plain-language health information covering prevention, common conditions, healthy living, and when to seek medical care.",
};

type Topic = {
  title: string;
  description: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const topics: Topic[] = [
  {
    title: "Heart Health",
    description:
      "Simple habits that support a healthy heart, blood pressure, and circulation.",
    href: "/health-information/heart-health",
    Icon: HeartIcon,
  },
  {
    title: "Diabetes",
    description:
      "Understand risk factors and everyday ways to keep blood sugar in balance.",
    href: "/health-information/diabetes",
    Icon: DropletIcon,
  },
  {
    title: "Healthy Eating",
    description:
      "Practical, affordable food choices that support your long-term wellbeing.",
    href: "/health-information/healthy-eating",
    Icon: AppleIcon,
  },
  {
    title: "Physical Activity",
    description: "Easy ways to move more, whatever your starting point.",
    href: "/health-information/physical-activity",
    Icon: ActivityIcon,
  },
  {
    title: "Mental Wellbeing",
    description:
      "Care for your mind and know when to reach out for extra support.",
    href: "/health-information/mental-wellbeing",
    Icon: BrainIcon,
  },
  {
    title: "Smoking",
    description:
      "The benefits of quitting and steps that make stopping more achievable.",
    href: "/health-information/smoking",
    Icon: NoSmokingIcon,
  },
  {
    title: "Preventive Screening",
    description:
      "Check-ups that can catch problems early, often before symptoms appear.",
    href: "/health-information/preventive-screening",
    Icon: SearchIcon,
  },
  {
    title: "Women's Health",
    description: "Guidance across different life stages and health needs.",
    href: "/health-information/womens-health",
    Icon: ShieldIcon,
  },
];

type Guide = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const usingThisInformation: Guide[] = [
  {
    title: "Learn the basics",
    description:
      "Start with a topic that matters to you and read the plain-language overview.",
    Icon: BookIcon,
  },
  {
    title: "Understand your risks",
    description:
      "Notice the everyday factors that affect your health and what you can change.",
    Icon: ShieldIcon,
  },
  {
    title: "Take a next step",
    description:
      "Use the guidance to make a small change or decide when to seek care.",
    Icon: StethoscopeIcon,
  },
];

export default function HealthInformationPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Health Information"
            title="Understand your health, one topic at a time"
            subtitle="Reliable, plain-language health information to help you understand common conditions, protect your health, and know when to seek medical care."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            as="h2"
            title="Browse health topics"
            subtitle="Choose a topic to learn practical, everyday ways to look after your health."
          />

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map(({ title, description, href, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Read more
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <SectionHeading
            as="h2"
            title="How to use this information"
            subtitle="Health information here is educational. It can help you make informed choices, but it does not replace advice from a qualified professional."
          />

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {usingThisInformation.map(({ title, description, Icon }, index) => (
              <li
                key={title}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-7"
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
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.5fr_1fr] lg:items-center">
              <div className="max-w-xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <StethoscopeIcon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Need help getting medical care?
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  If reading about your health raises questions or concerns, our
                  support team can help guide you toward the right service.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button href="/get-help" size="lg">
                    Request Medical Help
                  </Button>
                  <Button href="/find-help" size="lg" variant="outline">
                    Find Healthcare Services
                  </Button>
                </div>

                <p className="mt-6 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  This information is educational and does not provide a medical
                  diagnosis.
                </p>
              </div>

              <div
                className="hidden rounded-xl bg-muted/60 p-8 lg:block"
                aria-hidden="true"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white">
                    <PhoneIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      In a medical emergency
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Contact your local emergency service immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
