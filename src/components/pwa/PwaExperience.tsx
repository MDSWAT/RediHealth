"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type MouseEvent, type SVGProps } from "react";
import { usePathname } from "next/navigation";
import styles from "@/components/layout/ChromeDialogs.module.css";
import {
  CheckIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  PlusIcon,
  RefreshIcon,
  ShareIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { getPwaCopy, type PwaCopy } from "@/lib/i18n/pwa-copy";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { useCalmReducedMotion } from "@/lib/motion/tokens";
import {
  applyPwaUpdate,
  closePwaInstallDialog,
  dismissPwaBanner,
  dismissPwaUpdate,
  openPwaInstall,
  usePwaSnapshot,
  type InstallPlatform,
} from "@/lib/pwa/pwa-state";

type StepIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type GuideConfig = {
  steps: readonly string[];
  icons: readonly StepIconComponent[];
  showCopyLink: boolean;
};

function getGuideConfig(platform: InstallPlatform, copy: PwaCopy): GuideConfig {
  switch (platform) {
    case "ios-safari":
      return {
        steps: copy.iosSafariSteps,
        icons: [ShareIcon, PlusIcon, CheckIcon],
        showCopyLink: false,
      };
    case "ios-other":
      return {
        steps: copy.iosOtherSteps,
        icons: [ExternalLinkIcon, ShareIcon, PlusIcon],
        showCopyLink: false,
      };
    case "in-app-browser":
      return {
        steps: copy.inAppSteps,
        icons: [MoreVerticalIcon, ExternalLinkIcon],
        showCopyLink: true,
      };
    case "android-manual":
      return {
        steps: copy.androidManualSteps,
        icons: [MoreVerticalIcon, DownloadIcon, CheckIcon],
        showCopyLink: false,
      };
    case "macos-safari":
      return {
        steps: copy.macosSafariSteps,
        icons: [ShareIcon, PlusIcon],
        showCopyLink: false,
      };
    case "desktop-manual":
    case "chromium-prompt":
    default:
      return {
        steps: copy.desktopManualSteps,
        icons: [DownloadIcon, CheckIcon],
        showCopyLink: false,
      };
  }
}

export function PwaExperience() {
  const { lang } = useLanguage();
  const pathname = usePathname() || "/";
  const barePath = stripLangFromPathname(pathname);
  const isNotePage = barePath === "/health-check/note" || barePath.startsWith("/health-check/note/");

  const snapshot = usePwaSnapshot();
  const copy = getPwaCopy(lang);
  const reducedMotion = useCalmReducedMotion();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogHeadingRef = useRef<HTMLHeadingElement>(null);
  const copyTimerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  const dialogTitleId = useId();
  const dialogSubtitleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (snapshot.installDialogOpen && !dialog.open) {
      dialog.showModal();
      // Start on the title, not the close button: the first thing shown should not be a focus ring on "×".
      dialogHeadingRef.current?.focus({ preventScroll: true });
      const root = document.documentElement;
      const previousOverflow = root.style.overflow;
      root.style.overflow = "hidden";
      return () => {
        root.style.overflow = previousOverflow;
      };
    }

    if (!snapshot.installDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [snapshot.installDialogOpen]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCloseDialog = () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    setCopied(false);
    closePwaInstallDialog();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      handleCloseDialog();
    }
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2500);
    } catch {
      // Restricted in-app browser clipboard: leave button text unchanged.
    }
  };

  const showUpdateToast = snapshot.hasUpdate && !isNotePage;
  const showInstallBanner =
    snapshot.bannerVisible && !snapshot.isStandalone && !snapshot.hasUpdate && !isNotePage;
  const guide = getGuideConfig(snapshot.platform, copy);

  return (
    <>
      {showUpdateToast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 rounded-xl border border-border bg-card p-4 text-foreground shadow-(--shadow-card-hover) print:hidden sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[24rem] dark:border-white/12 dark:bg-ink-900 dark:text-paper"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-foreground dark:text-paper">
                {copy.updateReadyTitle}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground dark:text-mist">
                {copy.updateReadyBody}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissPwaUpdate}
              aria-label={copy.closeLabel}
              className="press-row -mr-1.5 -mt-1.5 inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-mist dark:hover:bg-white/10 dark:hover:text-paper"
            >
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={snapshot.isRefreshing}
              onClick={() => void applyPwaUpdate()}
              className="press-solid inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-sapphire px-4 text-sm font-semibold text-white transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-75"
            >
              <RefreshIcon
                className={cn(
                  "h-4 w-4 shrink-0",
                  snapshot.isRefreshing && !reducedMotion && "animate-spin motion-reduce:animate-none",
                )}
                aria-hidden="true"
              />
              <span>{snapshot.isRefreshing ? copy.refreshingApp : copy.updateNow}</span>
            </button>
          </div>
        </div>
      ) : null}

      {showInstallBanner ? (
        <div
          role="region"
          aria-label={copy.bannerTitle}
          className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 rounded-xl border border-border bg-card p-4 text-foreground shadow-(--shadow-card-hover) print:hidden sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[24rem] dark:border-white/12 dark:bg-ink-900 dark:text-paper"
        >
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pwa/pwa-192x192.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl border border-border/80"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-foreground dark:text-paper">
                {copy.bannerTitle}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground dark:text-mist">
                {copy.bannerBody}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissPwaBanner}
              aria-label={copy.closeLabel}
              className="press-row -mr-1.5 -mt-1.5 inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-mist dark:hover:bg-white/10 dark:hover:text-paper"
            >
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => void openPwaInstall()}
              className="press-solid inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-sapphire px-4 text-sm font-semibold text-white transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <DownloadIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{copy.installButton}</span>
            </button>
            <button
              type="button"
              onClick={dismissPwaBanner}
              className="press-row inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-border-control bg-background px-3.5 text-sm font-medium text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-paper/20 dark:bg-ink-950 dark:text-paper dark:hover:bg-white/10"
            >
              {copy.notNow}
            </button>
          </div>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogSubtitleId}
        onCancel={(event) => {
          event.preventDefault();
          handleCloseDialog();
        }}
        onClose={() => {
          if (snapshot.installDialogOpen) {
            handleCloseDialog();
          }
        }}
        onClick={handleBackdropClick}
        className={cn(
          "m-0 mt-auto w-full max-w-none overflow-visible bg-transparent p-0 text-foreground print:hidden",
          "sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-lg",
          "backdrop:bg-ink-950/55 backdrop:backdrop-blur-[2px]",
          styles.backdropFade,
          reducedMotion
            ? "transition-none"
            : "transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none starting:open:translate-y-2 starting:open:opacity-0",
        )}
      >
        <div className="flex max-h-[90dvh] flex-col overflow-y-auto rounded-t-(--radius-surface) border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-foreground shadow-(--shadow-card-hover) sm:rounded-(--radius-surface) sm:border sm:p-6 sm:pb-6 dark:border-white/12 dark:bg-ink-900 dark:text-paper">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pwa/pwa-192x192.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-xl border border-border/80"
              />
              <div className="min-w-0">
                <h2
                  id={dialogTitleId}
                  ref={dialogHeadingRef}
                  tabIndex={-1}
                  className="text-lg font-semibold leading-snug text-foreground outline-none dark:text-paper"
                >
                  {copy.dialogTitle}
                </h2>
                <p
                  id={dialogSubtitleId}
                  className="mt-0.5 text-sm leading-relaxed text-muted-foreground dark:text-mist"
                >
                  {copy.dialogSubtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseDialog}
              aria-label={copy.closeLabel}
              className="press-row -mr-1.5 -mt-1.5 inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-mist dark:hover:bg-white/10 dark:hover:text-paper"
            >
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* A plain numbered list. The tile on the right shows the browser button to look for; steps without one have none. */}
          <ol className="mt-4 divide-y divide-border border-y border-border dark:divide-white/10 dark:border-white/10">
            {guide.steps.map((stepText, index) => {
              const StepIcon = guide.icons[index];
              const showsBrowserButton = StepIcon !== undefined && StepIcon !== CheckIcon;
              return (
                <li key={index} className="flex min-h-14 items-center gap-3.5 py-3">
                  <span
                    aria-hidden="true"
                    className="w-4 shrink-0 text-center text-base font-semibold tabular-nums text-sapphire dark:text-sapphire-border"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] leading-relaxed text-pretty text-foreground dark:text-paper">
                    {stepText}
                  </span>
                  {showsBrowserButton ? (
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire dark:bg-white/10 dark:text-sapphire-border"
                    >
                      <StepIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>

          {guide.showCopyLink ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="press-row inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border-control bg-background px-3.5 text-sm font-medium text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-paper/20 dark:bg-ink-950 dark:text-paper dark:hover:bg-white/10"
              >
                <CopyIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{copied ? copy.copiedLink : copy.copyLink}</span>
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleCloseDialog}
              className="press-solid inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-sapphire px-4 text-sm font-semibold text-white transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.doneButton}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
