"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { panelTranslations } from "@/lib/i18n/panel-translations";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { institutesAdminTranslations } from "@/lib/i18n/institutes-admin-translations";
import { settingsTranslations } from "@/lib/i18n/settings-translations";

/** Static placeholder block. No pulsing: the whole skeleton fades in once, after a short delay (see .panel-skeleton). */
function Placeholder({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-border/60 ${className}`} />;
}

export default function PanelLoading() {
  const { lang } = useLanguage();
  const pathname = stripLangFromPathname(usePathname()).replace(/^\/demo(?=\/|$)/, "/panel");
  const t = panelTranslations[lang].adminShell;
  const loading = { en: "Loading…", ro: "Se încarcă…", sq: "Duke ngarkuar…", it: "Caricamento…" }[lang];
  const profile = /^\/panel\/patients\/[^/]+/.test(pathname);
  const calendar = pathname === "/panel/calendar";
  const title = pathname.startsWith("/panel/patients") ? t.patients
    : pathname === "/panel/workers" ? t.workers
    : calendar ? t.calendar
    : pathname === "/panel/meet" ? crmTranslations[lang].meetings
    : pathname === "/panel/logs" ? t.logs
    : pathname === "/panel/settings" ? settingsTranslations[lang].navLabel
    : pathname === "/panel/institutes" ? institutesAdminTranslations[lang].navLabel
    : crmTranslations[lang].requests;

  return <main id="main-content" aria-busy="true" className="mx-auto w-full max-w-7xl space-y-6 p-4 pb-24 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <Placeholder className="panel-skeleton h-10 w-36" />
        </div>
        <p role="status" className="text-sm text-muted-foreground">{loading}</p>
        <div aria-hidden="true" className="panel-skeleton space-y-5">
          {profile ? <>
            <div className="flex items-start gap-4"><Placeholder className="h-16 w-16 shrink-0 !rounded-full" /><div className="w-full max-w-sm space-y-3"><Placeholder className="h-7 w-3/4" /><Placeholder className="h-4 w-full" /><Placeholder className="h-4 w-2/3" /></div></div>
            <div className="flex gap-4 border-b border-border pb-4">{[0, 1, 2].map((i) => <Placeholder key={i} className="h-8 w-24" />)}</div>
            <div className="grid gap-5 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Placeholder key={i} className="h-48 w-full" />)}</div>
          </> : calendar ? <>
            <Placeholder className="h-10 w-64 max-w-full" />
            <div className="grid grid-cols-7 gap-1">{Array.from({ length: 35 }, (_, i) => <Placeholder key={i} className="h-20 sm:h-28" />)}</div>
          </> : <>
            <div className="flex flex-wrap gap-3"><Placeholder className="h-10 w-72 max-w-full" /><Placeholder className="h-10 w-28" /></div>
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <Placeholder className="h-11 w-11 shrink-0 !rounded-full" />
              <div className="min-w-0 flex-1 space-y-3"><Placeholder className="h-4 w-40 max-w-full" /><Placeholder className="h-3 w-72 max-w-full" /></div>
              <Placeholder className="hidden h-8 w-24 sm:block" />
            </div>)}
          </>}
        </div>
  </main>;
}
