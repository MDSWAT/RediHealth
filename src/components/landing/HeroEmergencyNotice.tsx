"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircleIcon,
  CloseIcon,
  PhoneIcon,
  ShieldIcon,
  ChevronDownIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

interface HeroEmergencyNoticeProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HeroEmergencyNotice({
  isOpen: externalOpen,
  onOpenChange,
}: HeroEmergencyNoticeProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const { t } = useLanguage();

  const isModalOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setModalOpen = useCallback(
    (open: boolean) => {
      if (onOpenChange) {
        onOpenChange(open);
      } else {
        setInternalOpen(open);
      }
    },
    [onOpenChange],
  );

  const dialerRef = useRef<HTMLAnchorElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      dialerRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setModalOpen(false);
        } else if (e.key === "Tab" && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isModalOpen, setModalOpen]);

  const verbatimNotice =
    t.hero?.emergencyNoticeVerbatim ||
    "Semnele de alarmă și «Sună tu la 112» — aplicația nu apelează automat";

  return (
    <>
      {/* Sticky Apex Emergency Ribbon */}
      <div
        role="region"
        aria-label="Notificare urgență medicală 112"
        className="relative z-40 w-full border-b border-[#d90429]/40 bg-[#e63946] px-4 py-2 text-white shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <p className="font-semibold tracking-tight text-white leading-snug break-words">
              {verbatimNotice}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Vezi semnele de alarmă
            </button>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#e63946] shadow-xs transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
            >
              <PhoneIcon className="h-3.5 w-3.5" />
              Sună la 112
            </a>
          </div>
        </div>
      </div>

      {/* Accessible Warning Signs Emergency Modal */}
      {isModalOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="emergency-modal-title"
          aria-describedby="emergency-modal-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e63946]/40 bg-white p-5 sm:p-7 shadow-2xl text-[#0b132b]"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <AlertCircleIcon className="h-6 w-6" />
                </span>
                <div>
                  <h2
                    id="emergency-modal-title"
                    className="text-lg sm:text-xl font-bold tracking-tight text-[#0b132b]"
                  >
                    Semne de alarmă pentru urgență medicală
                  </h2>
                  <p id="emergency-modal-desc" className="mt-0.5 text-xs text-muted-foreground">
                    Dacă tu sau cineva de lângă tine are aceste simptome, sună imediat la 112.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Închide fereastra de urgență"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Cardinal 6 Emergency Signs Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-primary/25 bg-primary-soft/50 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e63946]" />
                  <p className="font-bold text-primary">Dureri puternice în piept</p>
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Apăsare, gheară sau arsură care iradiază spre brațul stâng, gât sau mandibulă.
                </p>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary-soft/50 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e63946]" />
                  <p className="font-bold text-primary">Respirație foarte grea</p>
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Sufocare bruscă, respirație șuierătoare acută sau incapacitate de a vorbi.
                </p>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary-soft/50 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e63946]" />
                  <p className="font-bold text-primary">Asimetrie facială sau amorțeală</p>
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Căderea colțului gurii, slăbiciune bruscă într-un braț sau vorbire neclară (FAST).
                </p>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary-soft/50 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e63946]" />
                  <p className="font-bold text-primary">Pierdere de conștiență</p>
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Leșin, lipsă de răspuns la stimuli sau cădere bruscă la pământ.
                </p>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary-soft/50 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e63946]" />
                  <p className="font-bold text-primary">Sângerare masivă</p>
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Hemoragie abundentă continuă care nu se oprește la apăsare fermă.
                </p>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary-soft/50 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e63946]" />
                  <p className="font-bold text-primary">Convulsii sau spasme</p>
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Mișcări necontrolate ale corpului, rigiditate bruscă sau încleștarea dinților.
                </p>
              </div>
            </div>

            {/* Expandable Calling Script */}
            <div className="mt-4 rounded-xl border border-border bg-[#f8f9fa] p-3 text-xs">
              <button
                type="button"
                onClick={() => setShowScript(!showScript)}
                className="flex w-full items-center justify-between font-semibold text-foreground"
              >
                <span className="flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4 text-sapphire" />
                  Cum vorbești cu dispecerul 112 (ghid rapid)
                </span>
                <ChevronDownIcon
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    showScript ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showScript && (
                <div className="mt-3 space-y-2 border-t border-border/60 pt-2.5 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">1. Unde te afli:</strong> spune satul sau comuna, strada, numărul și un punct de reper cunoscut (biserică, școală, pod).
                  </p>
                  <p>
                    <strong className="text-foreground">2. Cine are nevoie de ajutor:</strong> spune dacă este adult, vârstnic sau copil și dacă respiră.
                  </p>
                  <p>
                    <strong className="text-foreground">3. Ce s-a întâmplat:</strong> spune pe scurt dacă a leșinat, sângerează sau are dureri mari.
                  </p>
                  <p className="text-[11px] font-medium text-sapphire">
                    Rămâi la telefon până când dispecerul îți spune că poți închide.
                  </p>
                </div>
              )}
            </div>

            {/* Regional Hospital Advice */}
            <div className="mt-3 rounded-lg border border-sapphire-border bg-sapphire-soft p-3 text-[11px] text-sapphire leading-relaxed">
              Dacă ești într-o zonă rurală izolată și ambulanța poate întârzia, transportă pacientul către cea mai apropiată Unitate de Primiri Urgențe (UPU) a spitalului județean.
            </div>

            {/* Primary Dialer CTA & Legal Notice */}
            <div className="mt-5 space-y-2">
              <a
                ref={dialerRef}
                href="tel:112"
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#e63946] px-5 py-3 text-base font-bold text-white shadow-lg transition hover:bg-[#d90429] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e63946] focus-visible:ring-offset-2"
              >
                <PhoneIcon className="h-5 w-5" />
                Sună acum la 112
              </a>
              <p className="text-center text-[11px] text-muted-foreground leading-normal">
                Apasă pentru a deschide tastatura telefonului tău. Aplicația RediHealth nu poate efectua apeluri vocale în mod direct.
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary-soft/40 p-2.5 text-center text-[11px] text-muted-foreground leading-relaxed">
                Aplicația RediHealth este un instrument informativ și de sprijin comunitar. Aplicația nu apelează automat serviciile de urgență și nu înlocuiește dispeceratul 112.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
