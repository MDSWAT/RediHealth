
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CameraIcon,
  CloseIcon,
  ClockIcon,
  FileTextIcon,
  LogOutIcon,
  StethoscopeIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";
import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import "./panel.css";

type AdminShellProps = {
  children: ReactNode;
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  pendingCount?: number;
};

export function AdminShell({
  children,
  userEmail,
  userRole = "Administrator",
  isAdmin = true,
  pendingCount = 0,
}: AdminShellProps) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = panelTranslations[lang].adminShell;
  const copy = panelDesignTranslations[lang];
  const currentPath = stripLangFromPathname(pathname);
  const role = userRole.trim().toLowerCase();
  const isSuperAdmin = role === "super admin" || role === "superadmin";
  const isMediatorOnly = role === "mediator" && !isAdmin;
  const [mobileAccountSheetOpen, setMobileAccountSheetOpen] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [reportEmail, setReportEmail] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // All desktop items
  const desktopItems = [
    { label: copy.requests, href: "/panel", icon: FileTextIcon },
    { label: t.patients, href: "/panel/patients", icon: UsersIcon },
    { label: t.calendar, href: "/panel/calendar", icon: CalendarIcon },
    { label: copy.video, href: "/panel/meet", icon: CameraIcon },
    { label: t.mediator, href: "/panel/mediator", icon: FileTextIcon },
    { label: t.workers, href: "/panel/workers", icon: StethoscopeIcon },
  ].filter((item) => {
    if (isMediatorOnly && ["/panel/calendar", "/panel/meet"].includes(item.href)) return false;
    if (item.href === "/panel/workers" && !isAdmin) return false;
    if (item.href === "/panel/mediator" && role !== "mediator" && !isAdmin) return false;
    return true;
  });

  // Mobile App Bottom Navigation Bar items (primary quick tabs)
  const mobilePrimaryTabs = isMediatorOnly
    ? [
        { label: copy.requests, href: "/panel", icon: FileTextIcon },
        { label: t.patients, href: "/panel/patients", icon: UsersIcon },
        { label: t.mediator, href: "/panel/mediator", icon: FileTextIcon },
      ]
    : [
        { label: copy.requests, href: "/panel", icon: FileTextIcon },
        { label: t.patients, href: "/panel/patients", icon: UsersIcon },
        { label: t.calendar, href: "/panel/calendar", icon: CalendarIcon },
        { label: copy.video, href: "/panel/meet", icon: CameraIcon },
      ];

  const userInitial = (userEmail || "U").charAt(0).toUpperCase();

  // Extra links for the mobile "More" sheet, excluding anything already in the bottom tab bar.
  const sheetQuickLinks = [
    { label: t.reportIssue, href: "#report-issue", icon: AlertCircleIcon },
    ...(isAdmin ? [{ label: t.workers, href: "/panel/workers", icon: StethoscopeIcon }] : []),
    ...(role === "mediator" || isAdmin
      ? [{ label: t.mediator, href: "/panel/mediator", icon: FileTextIcon }]
      : []),
    ...(isSuperAdmin ? [{ label: t.logs, href: "/panel/logs", icon: ClockIcon }] : []),
  ].filter((link) => !mobilePrimaryTabs.some((tab) => tab.href === link.href));

  const reportCopyByLang = {
    en: {
      title: "Report an issue",
      subtitle: "Tell us what happened and we will investigate.",
      email: "Your email (optional)",
      message: "Issue details",
      send: "Send report",
      sending: "Sending...",
      cancel: "Cancel",
      success: "Thanks. Your report has been sent.",
      genericError: "We could not send your report. Please try again.",
      detailError: "Please include at least 10 characters so we can investigate.",
      placeholder: "Describe what happened, what you expected, and what happened instead.",
    },
    ro: {
      title: "Raporteaza o problema",
      subtitle: "Spune-ne ce s-a intamplat si vom investiga.",
      email: "Emailul tau (optional)",
      message: "Detalii problema",
      send: "Trimite raportul",
      sending: "Se trimite...",
      cancel: "Anuleaza",
      success: "Multumim. Raportul a fost trimis.",
      genericError: "Nu am putut trimite raportul. Te rugam sa incerci din nou.",
      detailError: "Te rugam sa scrii cel putin 10 caractere pentru a putea investiga.",
      placeholder: "Descrie ce s-a intamplat, ce te asteptai si ce s-a intamplat in schimb.",
    },
    sq: {
      title: "Raporto nje problem",
      subtitle: "Na trego cfare ndodhi dhe ne do ta hetojme.",
      email: "Emaili juaj (opsional)",
      message: "Detajet e problemit",
      send: "Dergo raportin",
      sending: "Duke u derguar...",
      cancel: "Anulo",
      success: "Faleminderit. Raporti juaj u dergua.",
      genericError: "Nuk mundem ta dergojme raportin. Ju lutemi provoni perseri.",
      detailError: "Ju lutemi shkruani te pakten 10 karaktere qe te mund te hetojme.",
      placeholder: "Pershkruani cfare ndodhi, cfare prisnit dhe cfare ndodhi ne vend te kesaj.",
    },
    it: {
      title: "Segnala un problema",
      subtitle: "Raccontaci cosa e successo e verificheremo.",
      email: "La tua email (opzionale)",
      message: "Dettagli del problema",
      send: "Invia segnalazione",
      sending: "Invio in corso...",
      cancel: "Annulla",
      success: "Grazie. La segnalazione e stata inviata.",
      genericError: "Non siamo riusciti a inviare la segnalazione. Riprova.",
      detailError: "Inserisci almeno 10 caratteri per consentirci di verificare.",
      placeholder: "Descrivi cosa e successo, cosa ti aspettavi e cosa e successo invece.",
    },
  } as const;

  const reportText = reportCopyByLang[lang];

  async function handleSubmitIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReportError(null);
    setReportSuccess(null);

    if (reportMessage.trim().length < 10) {
      setReportError(reportText.detailError);
      return;
    }

    setReportSubmitting(true);
    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: reportEmail.trim(),
          message: reportMessage.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setReportError(data.error || reportText.genericError);
        return;
      }

      setReportEmail("");
      setReportMessage("");
      setReportSuccess(reportText.success);
    } catch {
      setReportError(reportText.genericError);
    } finally {
      setReportSubmitting(false);
    }
  }

  const handleSignOut = () => {
    const target = withLangPrefix("/sign-in", lang);
    void signOut({ redirect: false })
      .catch(() => undefined)
      .finally(() => {
        // Hard same-origin navigation so sign-out does not depend on AUTH_URL.
        window.location.assign(target);
      });
  };

  return (
    <div className="care-panel min-h-screen bg-slate-50/50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:shadow-md focus:text-primary focus:font-semibold"
      >
        {copy.skip}
      </a>

      {/* Mobile Native-style Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <Logo href={withLangPrefix("/", lang)} className="[&_img]:h-7 [&_img]:w-7 text-sm" />
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Care
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 ? (
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white shadow-2xs"
              aria-label={t.pendingRequests(pendingCount)}
            >
              {pendingCount}
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => setMobileAccountSheetOpen(true)}
            aria-label={copy.account}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary ring-2 ring-primary/20 transition-transform active:scale-95"
          >
            {userInitial}
          </button>
        </div>
      </header>

      {/* Mobile Account Bottom Sheet */}
      {mobileAccountSheetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs lg:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setMobileAccountSheetOpen(false)}
            aria-hidden="true"
          />
          <aside className="app-sheet-slide-up relative w-full rounded-t-3xl border-t border-border bg-card p-5 shadow-2xl max-h-[85dvh] overflow-y-auto care-panel-bottom-bar">
            {/* Grab Handle */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />

            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-base font-bold text-primary">
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{userRole}</p>
                  <p className="truncate text-xs text-muted-foreground" title={userEmail}>
                    {userEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileAccountSheetOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t.closeMenu}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Navigation Links */}
            <div className="mt-4 space-y-1">
              {sheetQuickLinks.length > 0 ? (
                <>
                  <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {copy.quickActions}
                  </p>

                  {sheetQuickLinks.map((link) => {
                    const Icon = link.icon;
                    const isReportIssueLink = link.href === "#report-issue";
                    return (
                      isReportIssueLink ? (
                        <button
                          key={link.href}
                          type="button"
                          onClick={() => {
                            setMobileAccountSheetOpen(false);
                            setReportIssueOpen(true);
                            setReportError(null);
                            setReportSuccess(null);
                          }}
                          className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted active:bg-muted"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="h-5 w-5 text-primary" />
                            <span>{link.label}</span>
                          </span>
                          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ) : (
                        <Link
                          key={link.href}
                          href={withLangPrefix(link.href, lang)}
                          onClick={() => setMobileAccountSheetOpen(false)}
                          className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:bg-muted"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="h-5 w-5 text-primary" />
                            <span>{link.label}</span>
                          </span>
                          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )
                    );
                  })}
                </>
              ) : null}

              <Link
                href={withLangPrefix("/", lang)}
                onClick={() => setMobileAccountSheetOpen(false)}
                className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:bg-muted"
              >
                <span className="flex items-center gap-2.5">
                  <ArrowRightIcon className="h-5 w-5 text-muted-foreground rotate-180" />
                  <span>{t.returnToWebsite}</span>
                </span>
                <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-bold text-primary transition-colors hover:bg-red-100 active:scale-[0.99]"
              >
                <LogOutIcon className="h-4 w-4" />
                <span>{t.signOut}</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Desktop Sticky Sidebar */}
      <div className="lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <div className="flex flex-col gap-1 border-b border-border/80 px-6 py-6">
            <Logo href={withLangPrefix("/", lang)} className="[&_img]:h-9 [&_img]:w-9" />
            <p className="mt-1 text-xs font-medium text-muted-foreground">{copy.workspace}</p>
          </div>

          <nav aria-label={copy.navigation} className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {desktopItems.map((item) => {
                const active =
                  item.href === "/panel"
                    ? currentPath === "/panel"
                    : currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={withLangPrefix(item.href, lang)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all ${
                        active
                          ? "bg-primary text-white shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                      {item.href === "/panel" && pendingCount > 0 ? (
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                            active ? "bg-white text-primary" : "bg-primary-soft text-primary"
                          }`}
                          aria-label={t.pendingRequests(pendingCount)}
                        >
                          {pendingCount}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {isSuperAdmin ? (
              <div className="mt-4 border-t border-border/70 pt-3">
                <Link
                  href={withLangPrefix("/panel/logs", lang)}
                  aria-current={currentPath === "/panel/logs" || currentPath.startsWith("/panel/logs/") ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all ${
                    currentPath === "/panel/logs" || currentPath.startsWith("/panel/logs/")
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <ClockIcon className="h-5 w-5 shrink-0" />
                  <span>{t.logs}</span>
                </Link>
              </div>
            ) : null}

            <div className="mt-4 border-t border-border/70 pt-3">
              <button
                type="button"
                onClick={() => {
                  setReportIssueOpen(true);
                  setReportError(null);
                  setReportSuccess(null);
                }}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <AlertCircleIcon className="h-5 w-5 shrink-0" />
                <span>{t.reportIssue}</span>
              </button>
            </div>
          </nav>

          <div className="space-y-3 border-t border-border p-4 bg-muted/20">
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-white p-2.5 shadow-2xs">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary"
              >
                {userInitial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground">{userRole}</p>
                <p className="truncate text-[11px] text-muted-foreground" title={userEmail}>
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                href={withLangPrefix("/", lang)}
                className="flex h-9 items-center justify-between rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span>{t.returnToWebsite}</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-primary"
              >
                <span>{t.signOut}</span>
                <LogOutIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area - with bottom padding for mobile app bar */}
        <div className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</div>
      </div>

      {/* Native App Bottom Tab Bar (Mobile only) */}
      <nav
        aria-label={copy.navigation}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-md lg:hidden care-panel-bottom-bar shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      >
        <ul className="flex items-center justify-around h-14 px-1">
          {mobilePrimaryTabs.map((item) => {
            const active =
              item.href === "/panel"
                ? currentPath === "/panel"
                : currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={withLangPrefix(item.href, lang)}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center justify-center py-1 text-center transition-colors active:scale-95 ${
                    active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.href === "/panel" && pendingCount > 0 ? (
                      <span
                        className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-2xs"
                        aria-label={t.pendingRequests(pendingCount)}
                      >
                        {pendingCount}
                      </span>
                    ) : null}
                  </div>
                  <span className="mt-1 text-[10px] tracking-tight truncate max-w-[68px] block">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* Account / More tab */}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMobileAccountSheetOpen(true)}
              aria-label={copy.more}
              className={`flex flex-col items-center justify-center py-1 text-center w-full transition-colors active:scale-95 ${
                mobileAccountSheetOpen
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span className="mt-1 text-[10px] tracking-tight truncate max-w-[68px] block">
                {copy.more}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {reportIssueOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setReportIssueOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-2xl rounded-t-3xl border-t border-border bg-card p-5 shadow-2xl sm:rounded-2xl sm:border sm:p-6"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border sm:hidden" />
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-4 sm:items-center">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-foreground sm:text-lg">{reportText.title}</h2>
                <p className="text-sm text-muted-foreground">{reportText.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setReportIssueOpen(false)}
                aria-label={reportText.cancel}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">{reportText.email}</label>
                <input
                  type="email"
                  value={reportEmail}
                  onChange={(event) => setReportEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">{reportText.message}</label>
                <textarea
                  required
                  minLength={10}
                  rows={7}
                  value={reportMessage}
                  onChange={(event) => setReportMessage(event.target.value)}
                  placeholder={reportText.placeholder}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {reportError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{reportError}</p>
              ) : null}

              {reportSuccess ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{reportSuccess}</p>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportIssueOpen(false)}
                  className="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  {reportText.cancel}
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                >
                  {reportSubmitting ? reportText.sending : reportText.send}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
