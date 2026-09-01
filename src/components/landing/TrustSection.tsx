import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  HeartIcon,
  LockIcon,
  ShieldIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";

const commitments = [
  {
    title: "Free public service",
    description: "A public service available to everyone at no cost.",
    Icon: HeartIcon,
  },
  {
    title: "Privacy and data protection",
    description: "Your information is handled carefully and kept confidential.",
    Icon: LockIcon,
  },
  {
    title: "Accessible health information",
    description: "Clear, plain-language guidance designed to be easy to use.",
    Icon: ShieldIcon,
  },
  {
    title: "Reviewed by professionals",
    description: "Information reviewed by qualified healthcare professionals.",
    Icon: StethoscopeIcon,
  },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          as="h2"
          align="center"
          title="A trusted public health service"
          subtitle="Built to support everyone, with care taken over accuracy, privacy, and accessibility."
          className="mx-auto"
        />

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {commitments.map(({ title, description, Icon }) => (
            <li
              key={title}
              className="flex h-full flex-col rounded-xl border border-border bg-card p-6 text-center"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/40 p-8">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Government and healthcare partners
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {["Partner logo", "Partner logo", "Partner logo", "Partner logo"].map(
              (label, index) => (
                <div
                  key={index}
                  className="flex h-16 items-center justify-center rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground"
                >
                  {label}
                </div>
              ),
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
