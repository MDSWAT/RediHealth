"use client";

import { useRef } from "react";
import { AlertCircleIcon, CloseIcon, PhoneIcon } from "@/components/ui/icons";
import type { HeroCopy } from "@/lib/i18n/hero-copy";

/**
 * The fixed 112 line the concept requires on every screen, set as one calm
 * sentence rather than a shouting banner. The alarm signs open in a native
 * <dialog>, which gives focus trapping, Escape and inert background for free.
 */
export function EmergencyBar({ copy }: { copy: HeroCopy["emergency"] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="border-b border-white/10 bg-ink-900/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
        <p className="flex items-start gap-2.5 text-[13.5px] leading-snug text-paper/90 sm:text-[14px]">
          <AlertCircleIcon className="mt-px h-[18px] w-[18px] shrink-0 text-ruby-300" />
          <span>{copy.notice}</span>
        </p>

        <div className="flex shrink-0 items-center gap-4 pl-[28px] sm:pl-0">
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="hero-focus rounded text-[14px] font-medium text-paper underline decoration-paper/35 underline-offset-4 transition-colors hover:decoration-paper"
          >
            {copy.signsLink}
          </button>
          <a
            href="tel:112"
            className="hero-focus inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <PhoneIcon className="h-4 w-4" />
            {copy.call}
          </a>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="alarm-signs-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-paper p-0 text-ink-950 shadow-2xl backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id="alarm-signs-title" className="text-[22px] font-semibold tracking-tight">
              {copy.modalTitle}
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={copy.close}
              className="-mr-2 -mt-1 flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-200/70 hover:text-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">{copy.modalIntro}</p>

          <ul className="mt-5 space-y-2.5">
            {copy.alarmSigns.map((sign) => (
              <li key={sign} className="border-l-2 border-primary pl-3 text-[15px] font-medium leading-snug">
                {sign}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[14px] leading-relaxed text-stone-600">{copy.callAdvice}</p>

          <a
            href="tel:112"
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[16px] font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <PhoneIcon className="h-5 w-5" />
            {copy.call}
          </a>
        </div>
      </dialog>
    </div>
  );
}
