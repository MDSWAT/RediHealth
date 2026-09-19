"use client";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";
import type { DashboardMetrics } from "@/lib/types/medical-request";

export function DashboardOverview({ metrics }: { metrics: DashboardMetrics }) {
  const { lang } = useLanguage();
  const t = panelTranslations[lang].dashboardOverview;
  const items = [
    { label: t.pendingAction, count: metrics.pending, color: "bg-amber-500" },
    { label: t.inProgress, count: metrics.inProgress, color: "bg-sky-500" },
    { label: t.resolved, count: metrics.resolved, color: "bg-emerald-500" },
  ];
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border rounded-2xl border border-border bg-white shadow-xs">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
          <dt className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground sm:text-sm">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
            {item.label}
          </dt>
          <dd className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{item.count}</dd>
        </div>
      ))}
    </dl>
  );
}
