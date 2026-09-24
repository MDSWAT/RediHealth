"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { AdminShell } from "@/components/panel/AdminShell";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale, panelTranslations } from "@/lib/i18n/panel-translations";
import type { ActivityLogItem } from "@/lib/types/activity-log";

type ActivityLogsDashboardProps = {
  initialLogs: ActivityLogItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  databaseAvailable: boolean;
};

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function summarizeDetails(details: Record<string, unknown> | null) {
  if (!details) return "";
  const pairs = Object.entries(details)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`);
  return pairs.join(" | ");
}

export function ActivityLogsDashboard({
  initialLogs,
  userEmail,
  userRole,
  isAdmin,
  isSuperAdmin,
  databaseAvailable,
}: ActivityLogsDashboardProps) {
  const { lang } = useLanguage();
  const locale = langToLocale[lang];
  const t = panelTranslations[lang].activityLogs;
  const [logs, setLogs] = useState<ActivityLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return logs;

    return logs.filter((log) => {
      const detailText = log.details ? JSON.stringify(log.details).toLowerCase() : "";
      return [
        log.action.toLowerCase(),
        log.entity_type.toLowerCase(),
        (log.entity_id || "").toLowerCase(),
        (log.actor_name || "").toLowerCase(),
        (log.actor_email || "").toLowerCase(),
        detailText,
      ].some((field) => field.includes(query));
    });
  }, [logs, search]);

  async function refreshLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/activity-logs?${params.toString()}`);
      if (!response.ok) return;

      const data = (await response.json()) as { logs?: ActivityLogItem[] };
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (error) {
      console.error("Failed to refresh activity logs", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin || isSuperAdmin}>
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-6 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{t.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="min-h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={refreshLogs}
                className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white"
              >
                {loading ? t.refreshing : t.refresh}
              </button>
            </div>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-2xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
            </p>
          ) : filteredLogs.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              {t.noEntries}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">{t.when}</th>
                    <th className="px-4 py-3">{t.actor}</th>
                    <th className="px-4 py-3">{t.action}</th>
                    <th className="px-4 py-3">{t.entity}</th>
                    <th className="px-4 py-3">{t.details}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border/70 align-top">
                      <td className="px-4 py-3 text-slate-600">{formatDate(log.created_at, locale)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{log.actor_name || t.unknownActor}</p>
                        <p className="text-xs text-slate-500">{log.actor_email || "-"}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{log.action}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {log.entity_type}
                        {log.entity_id ? ` #${log.entity_id}` : ""}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <p>{summarizeDetails(log.details) || "-"}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Container>
      </main>
    </AdminShell>
  );
}
