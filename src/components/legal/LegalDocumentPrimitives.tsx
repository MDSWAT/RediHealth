import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/ui/icons";
import type { Lang } from "@/lib/i18n/languages";
import { withLangPrefix } from "@/lib/i18n/routing";

export type TocSection = {
  id: string;
  title: string;
};

type LegalShellCopy = {
  onThisPage: string;
  relatedHeading: string;
  privacy: string;
  cookies: string;
  terms: string;
  contact: string;
};

const shellCopy: Record<Lang, LegalShellCopy> = {
  ro: {
    onThisPage: "Cuprins",
    relatedHeading: "Alte pagini legale și de contact",
    privacy: "Politica de confidențialitate",
    cookies: "Politica de cookie-uri",
    terms: "Termeni și condiții",
    contact: "Contact și date operator",
  },
  en: {
    onThisPage: "On this page",
    relatedHeading: "Related legal and contact pages",
    privacy: "Privacy policy",
    cookies: "Cookie policy",
    terms: "Terms and conditions",
    contact: "Contact and operator details",
  },
  sq: {
    onThisPage: "Në këtë faqe",
    relatedHeading: "Faqe të tjera ligjore dhe kontakti",
    privacy: "Politika e privatësisë",
    cookies: "Politika e cookie-ve",
    terms: "Kushtet dhe rregullat",
    contact: "Kontakti dhe operatori",
  },
  it: {
    onThisPage: "In questa pagina",
    relatedHeading: "Altre pagine legali e contatti",
    privacy: "Informativa sulla privacy",
    cookies: "Politica sui cookie",
    terms: "Termini e condizioni",
    contact: "Contatti e operatore",
  },
  hr: {
    onThisPage: "Na ovoj stranici",
    relatedHeading: "Povezane pravne i kontakt stranice",
    privacy: "Pravila privatnosti",
    cookies: "Politika kolačića",
    terms: "Uvjeti korištenja",
    contact: "Kontakt i voditelj",
  },
  rom: {
    onThisPage: "Pe kadaya rig",
    relatedHeading: "Aver zakoneske thaj kontaktoske riga",
    privacy: "Garavipnaske pravila",
    cookies: "Cookie pravila",
    terms: "Labaripnaske pravila",
    contact: "Kontakto thaj organizaciya",
  },
  ru: {
    onThisPage: "Содержание",
    relatedHeading: "Другие юридические страницы и контакты",
    privacy: "Политика конфиденциальности",
    cookies: "Политика cookie",
    terms: "Условия использования",
    contact: "Контакты и оператор",
  },
};

export const LEGAL_LINK_CLASS =
  "rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:hover:text-white";

/**
 * Editorial 2-column legal document shell:
 * - Mobile (< lg): collapsible "On this page" disclosure above the document so content starts immediately.
 * - Desktop (lg+): sticky left table of contents rail + spacious reading column (no horizontal scroll).
 */
export function LegalDocumentLayout({
  lang,
  currentPath,
  versionMeta,
  sections,
  children,
}: {
  lang: Lang;
  currentPath: "/privacy" | "/cookies" | "/terms";
  versionMeta: string;
  sections: TocSection[];
  children: ReactNode;
}) {
  const copy = shellCopy[lang] ?? shellCopy.en;
  const related = [
    { href: "/privacy", label: copy.privacy },
    { href: "/cookies", label: copy.cookies },
    { href: "/terms", label: copy.terms },
    { href: "/contact", label: copy.contact },
  ].filter((item) => item.href !== currentPath);

  return (
    <div className="mt-4">
      <p className="text-meta text-muted-foreground">{versionMeta}</p>

      {/* Mobile collapsible table of contents */}
      <details className="group mt-6 rounded-xl border border-border bg-card lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-body font-semibold text-foreground select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span>{copy.onThisPage}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-base) ease-(--ease-out-calm) group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <nav aria-label={copy.onThisPage} className="border-t border-border px-4 py-2">
          <ol className="divide-y divide-border/70">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex min-h-11 items-baseline gap-2.5 py-2 text-body text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="w-5 shrink-0 font-mono text-meta tabular-nums text-muted-foreground/80">
                    {index + 1}.
                  </span>
                  <span className="min-w-0 [overflow-wrap:anywhere]">{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </details>

      {/* Desktop sticky TOC rail + main document body */}
      <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:gap-16">
        <aside className="hidden lg:sticky lg:top-[calc(var(--site-header-h,4.5rem)+1.5rem)] lg:block">
          <nav aria-label={copy.onThisPage}>
            <p className="text-meta font-semibold text-foreground">{copy.onThisPage}</p>
            <ol className="mt-3 space-y-0.5">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex items-baseline gap-2 rounded-lg px-2.5 py-1.5 text-meta leading-snug text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted/60 hover:text-foreground focus-visible:bg-muted/60 focus-visible:text-foreground focus-visible:outline-none dark:hover:bg-white/[0.06]"
                  >
                    <span className="w-4 shrink-0 font-mono tabular-nums text-muted-foreground/75">
                      {index + 1}.
                    </span>
                    <span className="min-w-0">{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0 max-w-3xl text-body text-muted-foreground">
          {children}

          <nav
            aria-label={copy.relatedHeading}
            className="mt-10 border-t border-border pt-7"
          >
            <h2 className="text-body font-semibold text-foreground">{copy.relatedHeading}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {related.map((item) => (
                <li key={item.href}>
                  <Link
                    href={withLangPrefix(item.href, lang)}
                    className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

/** Numbered editorial clause block with proper scroll-margin for anchor links. */
export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 sm:py-8"
    >
      <h2 className="flex items-baseline gap-2.5 text-title text-foreground">
        <span className="shrink-0 font-mono text-meta font-medium tabular-nums text-muted-foreground">
          {number}.
        </span>
        <span className="min-w-0">{title}</span>
      </h2>
      <div className="mt-3.5 space-y-4">{children}</div>
    </section>
  );
}

/**
 * Zero-horizontal-scroll structured records table:
 * - Mobile (< md): clean stacked cards with labeled key-value pairs (zero horizontal scrolling).
 * - Desktop (md+): semantic 3-column or 2-column table sized naturally to the reading column.
 */
export function ResponsiveLegalTable({
  columns,
  rows,
  monoFirstColumn = false,
}: {
  columns: readonly string[];
  rows: ReadonlyArray<readonly string[]>;
  monoFirstColumn?: boolean;
}) {
  const isThreeCol = columns.length >= 3;

  return (
    <div className="min-w-0">
      {/* Mobile / narrow screens: stacked accessible cards — zero horizontal scroll */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row[0]}
            className="rounded-xl border border-border bg-card p-4"
          >
            <h3
              className={`text-body font-semibold text-foreground [overflow-wrap:anywhere] ${
                monoFirstColumn ? "font-mono text-meta" : ""
              }`}
            >
              {row[0]}
            </h3>
            <dl className="mt-3 space-y-2.5 border-t border-border/80 pt-3">
              {columns.slice(1).map((colLabel, idx) => (
                <div key={colLabel} className="space-y-0.5">
                  <dt className="text-meta font-medium text-foreground/80">
                    {colLabel}
                  </dt>
                  <dd className="text-body leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                    {row[idx + 1]}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      {/* Tablet / desktop (md+): clean full-width table without horizontal scroll */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/45">
              {columns.map((col, idx) => (
                <th
                  key={col}
                  scope="col"
                  className={`px-4 py-3 text-meta font-semibold text-foreground ${
                    isThreeCol
                      ? monoFirstColumn
                        ? idx === 0
                          ? "w-[38%]"
                          : idx === 1
                            ? "w-[44%]"
                            : "w-[18%]"
                        : idx === 0
                          ? "w-[28%]"
                          : idx === 1
                            ? "w-[32%]"
                            : "w-[40%]"
                      : idx === 0
                        ? "w-[38%]"
                        : "w-[62%]"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row[0]} className="align-top">
                {row.map((cell, idx) => (
                  <td
                    key={`${row[0]}-${idx}`}
                    className={`px-4 py-3.5 text-meta leading-relaxed ${
                      idx === 0
                        ? monoFirstColumn
                          ? "whitespace-nowrap font-mono font-medium text-foreground"
                          : "font-semibold text-foreground [overflow-wrap:anywhere]"
                        : "text-muted-foreground [overflow-wrap:anywhere]"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
