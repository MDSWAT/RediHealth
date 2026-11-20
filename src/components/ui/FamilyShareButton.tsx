"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { CopyIcon, MessageDotsIcon, ShareIcon } from "@/components/ui/icons";

const ESTIMATED_MENU_HEIGHT = 272;
const VIEWPORT_MARGIN = 16;

function findVerticalClipBounds(el: HTMLElement): { top: number; bottom: number } {
  let top = 0;
  let bottom = window.innerHeight;
  let parent = el.parentElement;

  while (parent && parent !== document.body && parent !== document.documentElement) {
    const { overflowY } = window.getComputedStyle(parent);
    if (/(auto|scroll|hidden|clip)/.test(overflowY)) {
      const rect = parent.getBoundingClientRect();
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }
    parent = parent.parentElement;
  }

  return { top, bottom };
}

type FamilyShareCopy = {
  buttonLabel: string;
  buttonAria: string;
  menuLabel: string;
  whatsapp: string;
  sms: string;
  copyText: string;
  copied: string;
  deviceShare: string;
};

const FAMILY_SHARE_COPY: Record<Lang, FamilyShareCopy> = {
  ro: {
    buttonLabel: "Trimite familiei",
    buttonAria: "Trimite informațiile familiei sau unei persoane apropiate",
    menuLabel: "Alege cum vrei să trimiți",
    whatsapp: "Trimite pe WhatsApp",
    sms: "Trimite prin SMS",
    copyText: "Copiază textul",
    copied: "Text copiat",
    deviceShare: "Alte aplicații",
  },
  en: {
    buttonLabel: "Send to family",
    buttonAria: "Send this information to a family member or carer",
    menuLabel: "Choose how to share",
    whatsapp: "Send via WhatsApp",
    sms: "Send via SMS",
    copyText: "Copy text",
    copied: "Text copied",
    deviceShare: "More apps",
  },
  sq: {
    buttonLabel: "Dërgoji familjes",
    buttonAria: "Dërgoja këto informacione një familjari ose kujdestari",
    menuLabel: "Zgjidh mënyrën e dërgimit",
    whatsapp: "Dërgo me WhatsApp",
    sms: "Dërgo me SMS",
    copyText: "Kopjo tekstin",
    copied: "Teksti u kopjua",
    deviceShare: "Aplikacione të tjera",
  },
  it: {
    buttonLabel: "Invia alla famiglia",
    buttonAria: "Invia queste informazioni a un familiare o caregiver",
    menuLabel: "Scegli come inviare",
    whatsapp: "Invia su WhatsApp",
    sms: "Invia tramite SMS",
    copyText: "Copia il testo",
    copied: "Testo copiato",
    deviceShare: "Altre app",
  },
  hr: {
    buttonLabel: "Pošalji obitelji",
    buttonAria: "Pošalji ove podatke članu obitelji ili njegovatelju",
    menuLabel: "Odaberi kako želiš poslati",
    whatsapp: "Pošalji putem WhatsAppa",
    sms: "Pošalji SMS porukom",
    copyText: "Kopiraj tekst",
    copied: "Tekst je kopiran",
    deviceShare: "Druge aplikacije",
  },
  rom: {
    buttonLabel: "Bičhal e familiake",
    buttonAria: "Bičhal kadala informacie e familiake vai jekhe manušeske",
    menuLabel: "Alosar sar te bičhales",
    whatsapp: "Bičhal pe WhatsApp",
    sms: "Bičhal SMS-osa",
    copyText: "Kopirisar o teksto",
    copied: "O teksto kopirisajlo",
    deviceShare: "Aver aplikacie",
  },
  ru: {
    buttonLabel: "Отправить семье",
    buttonAria: "Отправить эту информацию члену семьи или близкому человеку",
    menuLabel: "Выберите способ отправки",
    whatsapp: "Отправить в WhatsApp",
    sms: "Отправить по SMS",
    copyText: "Скопировать текст",
    copied: "Текст скопирован",
    deviceShare: "Другие приложения",
  },
};

export interface FamilyShareButtonProps {
  title: string;
  text: string;
  url?: string;
  lang?: Lang;
  compact?: boolean;
  iconOnly?: boolean;
  align?: "left" | "right";
  className?: string;
}

export function FamilyShareButton({
  title,
  text,
  url,
  lang = "ro",
  compact = false,
  iconOnly = false,
  align,
  className = "",
}: FamilyShareButtonProps) {
  const copy = FAMILY_SHARE_COPY[lang] ?? FAMILY_SHARE_COPY.ro;
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"down" | "up">("down");
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const resolvePlacement = useCallback((measuredHeight?: number): "down" | "up" => {
    const trigger = containerRef.current;
    if (!trigger || typeof window === "undefined") return "down";
    const rect = trigger.getBoundingClientRect();
    const bounds = findVerticalClipBounds(trigger);
    const needed = (measuredHeight ?? ESTIMATED_MENU_HEIGHT) + VIEWPORT_MARGIN;
    const spaceBelow = bounds.bottom - rect.bottom;
    const spaceAbove = rect.top - bounds.top;
    if (spaceBelow < needed && spaceAbove > spaceBelow) {
      return "up";
    }
    return "down";
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const updatePlacement = () => {
      const menuHeight = menuRef.current?.offsetHeight || ESTIMATED_MENU_HEIGHT;
      setPlacement(resolvePlacement(menuHeight));
    };

    updatePlacement();

    const menuEl = menuRef.current;
    if (menuEl && typeof window !== "undefined") {
      const menuRect = menuEl.getBoundingClientRect();
      const bounds = containerRef.current
        ? findVerticalClipBounds(containerRef.current)
        : { top: 0, bottom: window.innerHeight };
      if (menuRect.bottom > bounds.bottom - 8 || menuRect.top < bounds.top + 8) {
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
        menuEl.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      }
    }

    window.addEventListener("resize", updatePlacement, { passive: true });
    window.addEventListener("scroll", updatePlacement, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open, resolvePlacement]);

  function handleToggle() {
    if (!open) {
      setPlacement(resolvePlacement());
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const combinedText = [title, text, url].filter(Boolean).join("\n\n");
  const encodedText = encodeURIComponent(combinedText);
  const canNativeShare =
    open && typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(combinedText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard may be unavailable in restricted contexts; ignore silently.
    }
  }

  async function handleNativeShare() {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") return;
    try {
      await navigator.share({
        title,
        text: url ? `${title}\n${text}` : text,
        ...(url ? { url } : {}),
      });
      setOpen(false);
    } catch {
      // User cancelled share sheet; keep menu usable.
    }
  }

  const resolvedAlign =
    align === "right" ? "right" : align === "left" ? "left" : iconOnly ? "right" : compact ? "left" : undefined;
  const alignClass =
    resolvedAlign === "right"
      ? "right-0"
      : resolvedAlign === "left"
        ? "left-0"
        : "left-0 sm:left-auto sm:right-0";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={copy.buttonAria}
        title={copy.buttonLabel}
        className={
          iconOnly
            ? `press-row inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border p-0 shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                open
                  ? "border-rose-border bg-rose-tint text-rose-ink"
                  : "border-border-control bg-card text-foreground hover:border-sapphire/50 hover:bg-sapphire-soft/45 hover:text-sapphire"
              }`
            : `press-row inline-flex min-h-11 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border font-semibold shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                open
                  ? "border-rose-border bg-rose-tint text-rose-ink"
                  : "border-border-control bg-card text-foreground hover:border-sapphire/50 hover:bg-sapphire-soft/35 hover:text-sapphire"
              } ${compact ? "px-3 py-2 text-body" : "px-4 py-2 text-body"}`
        }
      >
        <ShareIcon className={`h-4 w-4 shrink-0 ${open ? "text-rose-ink" : "text-sapphire"}`} />
        {iconOnly ? <span className="sr-only">{copy.buttonLabel}</span> : <span className="min-w-0 truncate">{copy.buttonLabel}</span>}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="dialog"
          aria-label={copy.menuLabel}
          data-placement={placement}
          className={`fhs-enter absolute z-40 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card/98 p-2 shadow-xl shadow-ink-950/10 backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/98 ${
            placement === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } ${alignClass}`}
        >
          <p className="px-2.5 py-1.5 text-meta font-medium text-muted-foreground">
            {copy.menuLabel}
          </p>

          <div className="mt-1 flex flex-col gap-1">
            <a
              href={`https://wa.me/?text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex min-h-11 max-w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-body font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MessageDotsIcon className="h-4 w-4 shrink-0 text-sapphire" />
              <span className="min-w-0 truncate">{copy.whatsapp}</span>
            </a>

            <a
              href={`sms:?body=${encodedText}`}
              onClick={() => setOpen(false)}
              className="flex min-h-11 max-w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-body font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MessageDotsIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">{copy.sms}</span>
            </a>

            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex min-h-11 w-full max-w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-body font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CopyIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">{copied ? copy.copied : copy.copyText}</span>
            </button>

            {canNativeShare && (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="flex min-h-11 w-full max-w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-body font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ShareIcon className="h-4 w-4 shrink-0 text-sapphire" />
                <span className="min-w-0 truncate">{copy.deviceShare}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
