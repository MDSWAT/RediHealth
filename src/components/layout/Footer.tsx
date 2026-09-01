import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

const linkGroups: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Health",
    links: [
      { label: "Health Information", href: "/health-information" },
      { label: "Find Medical Help", href: "/find-help" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "About the Platform", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Health information on this platform is educational and does not
              replace professional medical advice.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="flex h-12 items-center rounded-lg border border-dashed border-border bg-card px-4 text-xs font-medium text-muted-foreground">
                Government Partner
              </span>
              <span className="flex h-12 items-center rounded-lg border border-dashed border-border bg-card px-4 text-xs font-medium text-muted-foreground">
                Healthcare Partners
              </span>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.heading}>
                <h2 className="text-sm font-semibold text-foreground">
                  {group.heading}
                </h2>
                <ul className="mt-4 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-[40px] items-center rounded-md text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RediHealth.
          </p>
        </div>
      </Container>
    </footer>
  );
}
