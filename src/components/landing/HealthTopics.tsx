import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ActivityIcon,
  AppleIcon,
  ArrowRightIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";

type Topic = {
  title: string;
  description: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const topics: Topic[] = [
  {
    title: "Heart Health",
    description: "Simple habits that support a healthy heart and blood pressure.",
    href: "/health-information/heart-health",
    Icon: HeartIcon,
  },
  {
    title: "Diabetes",
    description: "Understand risk factors and everyday ways to stay in balance.",
    href: "/health-information/diabetes",
    Icon: DropletIcon,
  },
  {
    title: "Healthy Eating",
    description: "Practical, affordable food choices for better wellbeing.",
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
    description: "Care for your mind and know when to reach out for support.",
    href: "/health-information/mental-wellbeing",
    Icon: BrainIcon,
  },
  {
    title: "Smoking",
    description: "Benefits of quitting and steps that make it more achievable.",
    href: "/health-information/smoking",
    Icon: NoSmokingIcon,
  },
  {
    title: "Preventive Screening",
    description: "Check-ups that can catch problems early, before symptoms.",
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

export function HealthTopics() {
  return (
    <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
      <Container>
        <SectionHeading
          as="h2"
          title="Take care of your health"
          subtitle="Small, preventive actions taken today can meaningfully reduce your health risks over time."
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
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            href="/health-information"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-base font-semibold text-primary hover:text-primary-hover"
          >
            View all health topics
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
