"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { CheckCircleIcon, CopyIcon, MessageDotsIcon, ShareIcon } from "@/components/ui/icons";

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
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={copy.buttonAria}
        title={copy.buttonLabel}
        className={
          iconOnly
            ? "press-row inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-border-control bg-card p-0 text-foreground shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/50 hover:bg-sapphire-soft/45 hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            : `press-row inline-flex min-h-11 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border-control bg-card font-semibold text-foreground shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/50 hover:bg-sapphire-soft/35 hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                compact ? "px-3 py-2 text-xs sm:text-sm" : "px-4 py-2 text-sm"
              }`
        }
      >
        <ShareIcon className="h-4 w-4 shrink-0 text-sapphire" />
        {iconOnly ? <span className="sr-only">{copy.buttonLabel}</span> : <span className="min-w-0 truncate">{copy.buttonLabel}</span>}
      </button>

      {open && (
        <div
          id={menuId}
          role="dialog"
          aria-label={copy.menuLabel}
          className={`fhs-enter absolute top-full z-40 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200/90 bg-card/98 p-2 shadow-xl shadow-ink-950/10 backdrop-blur-md dark:border-stone-800 dark:bg-ink-900/98 ${alignClass}`}
        >
          <p className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
            {copy.menuLabel}
          </p>

          <div className="mt-1 flex flex-col gap-1">
            <a
              href={`https://wa.me/?text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex min-h-11 max-w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MessageDotsIcon className="h-4 w-4 shrink-0 text-sapphire" />
              <span className="min-w-0 truncate">{copy.whatsapp}</span>
            </a>

            <a
              href={`sms:?body=${encodedText}`}
              onClick={() => setOpen(false)}
              className="flex min-h-11 max-w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MessageDotsIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">{copy.sms}</span>
            </a>

            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex min-h-11 w-full max-w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? (
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-sapphire" />
              ) : (
                <CopyIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 truncate">{copied ? copy.copied : copy.copyText}</span>
            </button>

            {canNativeShare && (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="flex min-h-11 w-full max-w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
