import type { ComponentType, SVGProps } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  ActivityIcon,
  AppleIcon,
  ArrowRightIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  PhoneIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type HealthTopic = {
  slug: string;
  title: string;
  description: string;
  Icon: IconComponent;
  intro: string;
  keyFacts: string[];
  recommendations: { title: string; description: string }[];
  warningSigns: string[];
};

const topics: HealthTopic[] = [
  {
    slug: "heart-health",
    title: "Heart Health",
    description:
      "Simple habits that support a healthy heart, blood pressure, and circulation.",
    Icon: HeartIcon,
    intro:
      "Your heart works every minute of every day to move blood around your body. Looking after it lowers your risk of heart disease and stroke, and many of the habits that help are small and achievable.",
    keyFacts: [
      "Heart disease is one of the most common causes of ill health worldwide, but much of the risk is preventable.",
      "High blood pressure often has no symptoms, so regular checks matter.",
      "Being active, not smoking, and eating well all protect your heart at the same time.",
    ],
    recommendations: [
      {
        title: "Move most days",
        description:
          "Aim for regular activity you enjoy, such as brisk walking. Even short sessions add up.",
      },
      {
        title: "Eat for your heart",
        description:
          "Choose more vegetables, fruit, whole grains, and less salt and heavily processed food.",
      },
      {
        title: "Know your numbers",
        description:
          "Have your blood pressure and cholesterol checked so problems can be caught early.",
      },
    ],
    warningSigns: [
      "Chest pain, pressure, or tightness, especially if it spreads to the arm, neck, or jaw.",
      "Sudden shortness of breath or a fast, irregular heartbeat.",
      "Persistent, unexplained tiredness or swelling in the legs.",
    ],
  },
  {
    slug: "diabetes",
    title: "Diabetes",
    description:
      "Understand risk factors and everyday ways to keep blood sugar in balance.",
    Icon: DropletIcon,
    intro:
      "Diabetes affects how your body manages blood sugar. Type 2 diabetes is often linked to everyday habits and can frequently be delayed or prevented, and it can be managed well with the right support.",
    keyFacts: [
      "Many people live with type 2 diabetes for years before noticing symptoms.",
      "Small, steady changes to food and activity can meaningfully reduce your risk.",
      "Managing blood sugar helps protect your eyes, kidneys, nerves, and heart.",
    ],
    recommendations: [
      {
        title: "Balance your plate",
        description:
          "Fill half your plate with vegetables, and choose whole grains over refined ones.",
      },
      {
        title: "Stay active",
        description:
          "Regular movement helps your body use blood sugar more effectively.",
      },
      {
        title: "Get checked",
        description:
          "If diabetes runs in your family or you have risk factors, ask about a simple blood test.",
      },
    ],
    warningSigns: [
      "Feeling very thirsty or needing to urinate more often than usual.",
      "Unexplained weight loss or ongoing tiredness.",
      "Blurred vision or cuts that heal slowly.",
    ],
  },
  {
    slug: "healthy-eating",
    title: "Healthy Eating",
    description:
      "Practical, affordable food choices that support your long-term wellbeing.",
    Icon: AppleIcon,
    intro:
      "Eating well does not need to be complicated or expensive. Focusing on a few simple principles most of the time gives your body the energy and nutrients it needs.",
    keyFacts: [
      "No single food makes or breaks your health, your overall pattern matters most.",
      "Vegetables, fruit, whole grains, and beans are affordable, filling, and nutritious.",
      "Cutting back on sugary drinks is one of the easiest wins for many people.",
    ],
    recommendations: [
      {
        title: "Eat more plants",
        description:
          "Aim to include vegetables or fruit at most meals, fresh or frozen.",
      },
      {
        title: "Choose whole foods",
        description:
          "Pick whole grains and home-prepared meals over heavily processed options when you can.",
      },
      {
        title: "Rethink drinks",
        description:
          "Make water your default and limit sugary drinks and fruit juice.",
      },
    ],
    warningSigns: [
      "Unintended weight loss or gain over a short period.",
      "Ongoing digestive problems or loss of appetite.",
      "Feeling faint, weak, or unusually tired despite eating.",
    ],
  },
  {
    slug: "physical-activity",
    title: "Physical Activity",
    description: "Easy ways to move more, whatever your starting point.",
    Icon: ActivityIcon,
    intro:
      "Being active is one of the best things you can do for your body and mind. You do not need a gym, everyday movement counts, and the right amount for you is whatever you can build on.",
    keyFacts: [
      "Any movement is better than none, and it is never too late to start.",
      "Activity supports your heart, muscles, mood, and sleep.",
      "Breaking up long periods of sitting is good for you, too.",
    ],
    recommendations: [
      {
        title: "Start where you are",
        description:
          "Begin with short walks or activities you enjoy, and build up gradually.",
      },
      {
        title: "Make it regular",
        description:
          "Aim for activity on most days, consistency matters more than intensity.",
      },
      {
        title: "Add some strength",
        description:
          "Include activities that work your muscles, like carrying, gardening, or bodyweight exercises.",
      },
    ],
    warningSigns: [
      "Chest pain, dizziness, or unusual breathlessness during activity.",
      "Joint pain or swelling that gets worse with movement.",
      "Feeling faint or having an irregular heartbeat when exercising.",
    ],
  },
  {
    slug: "mental-wellbeing",
    title: "Mental Wellbeing",
    description:
      "Care for your mind and know when to reach out for extra support.",
    Icon: BrainIcon,
    intro:
      "Mental wellbeing is part of your overall health. Everyone has ups and downs, and looking after your mind, and asking for help when you need it, is a sign of strength.",
    keyFacts: [
      "Mental health can change over time and is influenced by many factors.",
      "Talking about how you feel can make problems easier to manage.",
      "Support is available, and reaching out early often helps.",
    ],
    recommendations: [
      {
        title: "Stay connected",
        description:
          "Keep in touch with people you trust, connection protects mental health.",
      },
      {
        title: "Look after the basics",
        description:
          "Sleep, activity, and time outdoors all support how you feel.",
      },
      {
        title: "Ask for support",
        description:
          "If things feel too much, talk to someone you trust or a health professional.",
      },
    ],
    warningSigns: [
      "Low mood, worry, or hopelessness that lasts for weeks.",
      "Struggling to cope with everyday life, work, or relationships.",
      "Thoughts of harming yourself, seek help urgently if this happens.",
    ],
  },
  {
    slug: "smoking",
    title: "Smoking",
    description:
      "The benefits of quitting and steps that make stopping more achievable.",
    Icon: NoSmokingIcon,
    intro:
      "Stopping smoking is one of the most powerful things you can do for your health, and your body begins to recover quickly. Most people who quit make several attempts first, each try is progress.",
    keyFacts: [
      "Your circulation and lungs start to improve within weeks of quitting.",
      "Quitting lowers your risk of heart disease, cancer, and lung problems.",
      "Support and stop-smoking aids can more than double your chance of success.",
    ],
    recommendations: [
      {
        title: "Set a quit date",
        description:
          "Choose a day, tell people you trust, and plan for situations that tempt you.",
      },
      {
        title: "Use support",
        description:
          "Stop-smoking services and approved aids make quitting more likely to stick.",
      },
      {
        title: "Keep going",
        description:
          "If you slip, treat it as a learning step rather than a failure and try again.",
      },
    ],
    warningSigns: [
      "A persistent cough or a change in a long-standing cough.",
      "Coughing up blood or ongoing chest pain.",
      "Increasing breathlessness during everyday activities.",
    ],
  },
  {
    slug: "preventive-screening",
    title: "Preventive Screening",
    description:
      "Check-ups that can catch problems early, often before symptoms appear.",
    Icon: SearchIcon,
    intro:
      "Screening looks for early signs of health problems before you notice anything wrong. Catching issues early often means simpler treatment and better outcomes.",
    keyFacts: [
      "Screening is for people who feel well, it aims to catch problems early.",
      "Which checks are right for you can depend on your age, sex, and history.",
      "Attending recommended screening invitations is a simple way to protect your health.",
    ],
    recommendations: [
      {
        title: "Know what is offered",
        description:
          "Ask which screening checks are recommended for someone your age and background.",
      },
      {
        title: "Attend your checks",
        description:
          "Respond to screening invitations and keep routine health checks up to date.",
      },
      {
        title: "Track your history",
        description:
          "Share relevant family history with your health professional to guide decisions.",
      },
    ],
    warningSigns: [
      "A new lump, unusual bleeding, or a mole that changes shape or colour.",
      "Any persistent symptom that is new or unexplained.",
      "A screening result that asks you to follow up, do not delay.",
    ],
  },
  {
    slug: "womens-health",
    title: "Women's Health",
    description: "Guidance across different life stages and health needs.",
    Icon: ShieldIcon,
    intro:
      "Women's health covers a wide range of needs that can change across life, from periods and reproductive health to menopause and beyond. Understanding what is normal for you helps you notice when something changes.",
    keyFacts: [
      "Health needs and useful checks change at different life stages.",
      "Knowing your own body makes it easier to spot changes early.",
      "Support is available for periods, pregnancy, menopause, and more.",
    ],
    recommendations: [
      {
        title: "Know your normal",
        description:
          "Pay attention to your usual cycle and body so changes stand out.",
      },
      {
        title: "Keep up with checks",
        description:
          "Attend recommended screenings and appointments for your age and stage.",
      },
      {
        title: "Seek support early",
        description:
          "Talk to a health professional about symptoms that worry or affect you.",
      },
    ],
    warningSigns: [
      "Unusual bleeding, including between periods or after menopause.",
      "Severe or persistent pelvic or abdominal pain.",
      "New breast changes such as a lump, dimpling, or skin change.",
    ],
  },
];

function getTopic(slug: string): HealthTopic | undefined {
  return topics.find((topic) => topic.slug === slug);
}

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/health-information/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);

  if (!topic) {
    return { title: "Health Information - RediHealth" };
  }

  return {
    title: topic.title + " - RediHealth",
    description: topic.description,
  };
}

export default async function HealthTopicPage({
  params,
}: PageProps<"/health-information/[slug]">) {
  const { slug } = await params;
  const topic = getTopic(slug);

  if (!topic) {
    notFound();
  }

  const { title, Icon, intro, keyFacts, recommendations, warningSigns } = topic;
  const related = topics.filter((item) => item.slug !== topic.slug).slice(0, 3);

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/health-information"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-180" />
              All health topics
            </Link>
          </nav>

          <div className="max-w-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {intro}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Why it matters
              </h2>
              <ul className="mt-6 space-y-4">
                {keyFacts.map((fact) => (
                  <li key={fact} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-primary" />
                    <span className="text-base leading-relaxed text-muted-foreground">
                      {fact}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Practical steps
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {recommendations.map(({ title: stepTitle, description }) => (
                  <li
                    key={stepTitle}
                    className="flex h-full flex-col rounded-xl border border-border bg-card p-6"
                  >
                    <h3 className="text-lg font-semibold text-foreground">
                      {stepTitle}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-primary-soft py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              When to seek medical advice
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground/80">
              Contact a health professional if you notice any of the following.
              In a medical emergency, contact your local emergency service
              immediately.
            </p>
            <ul className="mt-6 space-y-4">
              {warningSigns.map((sign) => (
                <li key={sign} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-white">
                    <PhoneIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-base leading-relaxed text-foreground">
                    {sign}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/get-help" size="lg">
                Request Medical Help
              </Button>
              <Button href="/find-help" size="lg" variant="outline">
                Find Healthcare Services
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Related topics
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(({ slug: relSlug, title: relTitle, description, Icon: RelIcon }) => (
              <li key={relSlug}>
                <Link
                  href={"/health-information/" + relSlug}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <RelIcon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {relTitle}
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

          <p className="mt-10 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            This information is educational and does not provide a medical
            diagnosis. Always speak to a qualified professional about your own
            health.
          </p>
        </Container>
      </section>
    </main>
  );
}
