"use client";

import { useEffect, useRef, useState, type ComponentType, type FormEvent, type SVGProps } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ActivityIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  HandHelpingIcon,
  PinIcon,
  PrescriptionIcon,
  SearchIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { cn } from "@/lib/cn";
import { HERO_NEED_ORDER, localHref, type HeroCopy, type HeroNeedId } from "@/lib/i18n/hero-copy";
import type { Lang } from "@/lib/i18n/translations";
import type { TriageView } from "./TriagePanel";
import styles from "./HeroRoutes.module.css";

const TriagePanel = dynamic(() => import("./TriagePanel").then((mod) => mod.TriagePanel), {
  ssr: false,
});

const ROUTE_ICONS: Record<HeroNeedId, ComponentType<SVGProps<SVGSVGElement>>> = {
  problem: ActivityIcon,
  risk: ClipboardCheckIcon,
  doctor: StethoscopeIcon,
  nearby: PinIcon,
  prescription: PrescriptionIcon,
  navigate: HandHelpingIcon,
};

const ROW =
  "hero-focus group relative -mx-3 flex min-h-12 w-[calc(100%+1.5rem)] items-center gap-3.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-left text-body text-paper/90 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-paper/[0.07] hover:text-paper motion-reduce:transition-none";

/**
 * Desktop (lg and up): the hero's quick options, on the right of the headline.
 * - The question, with the mediator route beside it.
 * - Ask: a quiet button that opens in place into a field (see HeroRoutes.module.css). What the
 *   visitor types opens smart search with it. Escape, or leaving it empty, closes it again.
 * - The six needs as a light list. The two that are a single step link straight to their page;
 *   the others open the triage panel in a dialog on that answer, with Back to the full chooser.
 * Phones and tablets use HeroDock instead.
 */
export function HeroRoutes({ copy, lang }: { copy: HeroCopy; lang: Lang }) {
  const { panel } = copy;
  const [asking, setAsking] = useState(false);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ view: TriageView; visit: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (asking) {
      inputRef.current?.focus();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [asking]);

  const closeAsk = (restoreFocus: boolean) => {
    returnFocus.current = restoreFocus;
    setQuery("");
    setAsking(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    openSmartSearch(query.trim());
  };

  useEffect(() => {
    const element = dialogRef.current;
    if (!dialog || !element || element.open) return;
    // A modal dialog: focus stays inside, Escape closes it, and focus returns to the row.
    element.showModal();
  }, [dialog]);

  return (
    <div className="lg:ml-auto lg:max-w-[30rem]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-title font-bold leading-tight text-paper">{panel.question}</h2>
        <Link
          href={localHref("/mediatori", lang)}
          className="hero-focus group -mr-1 inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl px-1 text-body font-semibold text-amber-care-border transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-paper motion-reduce:transition-none"
        >
          {panel.mediators}
          <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </div>

      <div className={cn(styles.ask, "mt-4 text-lead")} data-open={asking}>
        {asking ? (
          <form role="search" onSubmit={submit} className="contents">
            <SearchIcon className={styles.glyph} aria-hidden="true" />
            <label htmlFor="hero-ask" className="sr-only">
              {copy.primaryCta}
            </label>
            <input
              ref={inputRef}
              id="hero-ask"
              type="text"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeAsk(true);
                }
              }}
              onBlur={(event) => {
                // Leaving an empty field folds it back into the button; a typed question stays.
                if (!query.trim() && !event.currentTarget.form?.contains(event.relatedTarget as Node | null)) {
                  closeAsk(false);
                }
              }}
              placeholder={copy.primaryCta}
              autoComplete="off"
              enterKeyHint="search"
              className={styles.input}
            />
            <button type="submit" aria-label={copy.primaryCta} title={copy.primaryCta} className={styles.go}>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </form>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={false}
            onClick={() => setAsking(true)}
            className={cn(styles.trigger, "flex items-center gap-3 pl-[1.125rem] pr-1.5 text-left")}
          >
            <SearchIcon className={styles.glyph} aria-hidden="true" />
            <span className={styles.prompt}>{copy.primaryCta}</span>
            <span className={styles.go} aria-hidden="true">
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </button>
        )}
      </div>

      <ul className="mt-4 border-t border-paper/12">
        {HERO_NEED_ORDER.map((id) => {
          const need = panel.needs[id];
          const Icon = ROUTE_ICONS[id];
          const inner = (
            <>
              <Icon className="h-5 w-5 shrink-0 text-paper/55 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire-border motion-reduce:transition-none" />
              <span className={cn("min-w-0 flex-1", id === "problem" ? "font-semibold" : "font-medium")}>
                {need.label}
              </span>
              <ChevronRightIcon className="h-4.5 w-4.5 shrink-0 text-paper/35 transition-[translate,color] duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-1 group-hover:text-paper motion-reduce:transition-none" />
            </>
          );
          return (
            <li key={id} className="border-b border-paper/12">
              {need.direct ? (
                <Link id={`triage-option-${id}`} href={localHref(need.action.href, lang)} className={ROW}>
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  id={`triage-option-${id}`}
                  aria-haspopup="dialog"
                  onClick={() => setDialog((previous) => ({ view: id, visit: (previous?.visit ?? 0) + 1 }))}
                  className={ROW}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {dialog && (
        <dialog
          ref={dialogRef}
          aria-label={panel.label}
          className="triage-dialog"
          onClose={() => setDialog(null)}
          onClick={(event) => {
            // A click on the dimmed page around the panel (the dialog's own box) closes it.
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
        >
          <TriagePanel
            key={dialog.visit}
            initialView={dialog.view}
            copy={panel}
            alarmSigns={copy.emergency.alarmSigns}
            lang={lang}
            onClose={() => dialogRef.current?.close()}
            closeLabel={copy.emergency.close}
          />
        </dialog>
      )}
    </div>
  );
}
