"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/panel/AdminShell";
import { RefreshIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale, panelTranslations } from "@/lib/i18n/panel-translations";
import type { ActivityLogItem } from "@/lib/types/activity-log";
import { formatPanelDate } from "@/lib/panel-dates";

type ActivityLogsDashboardProps = {
  initialLogs: ActivityLogItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  databaseAvailable: boolean;
};

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
  const extra = {
    ru: {
      refreshing: "Обновление...",
      action: "Действие",
      entity: "Объект",
      showing: (v: number, total: number) => `${v} из ${total} записей`,
      loadError: "Не удалось обновить журнал. Попробуйте еще раз.",
      clearSearch: "Очистить поиск",
    },
    en: {
      refreshing: t.refreshing,
      action: t.action,
      entity: t.entity,
      showing: (v: number, total: number) => `${v} of ${total} entries`,
      loadError: "Could not refresh the activity log. Try again.",
      clearSearch: "Clear search",
    },
    ro: {
      refreshing: t.refreshing,
      action: t.action,
      entity: t.entity,
      showing: (v: number, total: number) => `${v} din ${total} înregistrări`,
      loadError: "Jurnalul nu a putut fi actualizat. Încearcă din nou.",
      clearSearch: "Șterge căutarea",
    },
    sq: {
      refreshing: t.refreshing,
      action: t.action,
      entity: t.entity,
      showing: (v: number, total: number) => `${v} nga ${total} hyrje`,
      loadError: "Regjistri nuk u rifreskua. Provo përsëri.",
      clearSearch: "Pastro kërkimin",
    },
    it: {
      refreshing: t.refreshing,
      action: t.action,
      entity: t.entity,
      showing: (v: number, total: number) => `${v} di ${total} voci`,
      loadError: "Impossibile aggiornare il registro. Riprova.",
      clearSearch: "Cancella ricerca",
    },
    hr: {
      refreshing: t.refreshing,
      action: t.action,
      entity: t.entity,
      showing: (v: number, total: number) => `${v} od ${total} zapisa`,
      loadError: "Osvježavanje zapisnika nije uspjelo. Pokušaj ponovno.",
      clearSearch: "Očisti pretragu",
    },
    rom: {
      refreshing: t.refreshing,
      action: t.action,
      entity: t.entity,
      showing: (v: number, total: number) => `${v} katar ${total} lekhimata`,
      loadError: "O zhurnalo nashti nevyardilo. Zumav pale.",
      clearSearch: "Khos o rodimos",
    },
  }[lang];

  const [logs, setLogs] = useState<ActivityLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/activity-logs?${params.toString()}`);
      if (!response.ok) {
        setErrorMessage(extra.loadError);
        return;
      }

      const data = (await response.json()) as { logs?: ActivityLogItem[] };
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (error) {
      console.error("Failed to refresh activity logs", error);
      setErrorMessage(extra.loadError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin || isSuperAdmin}>
      <main
        id="main-content"
        className="min-h-dvh bg-[var(--panel-surface)] px-4 py-6 pb-24 text-[var(--panel-ink)] sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          {loading ? (
            <div
              role="progressbar"
              aria-label={extra.refreshing}
              className="mb-4 h-0.5 w-full overflow-hidden bg-[var(--panel-line)]"
            >
              <div className="panel-indeterminate-bar h-full bg-[var(--color-sapphire)] dark:bg-[#bad7fa]" />
            </div>
          ) : null}

          <header className="border-b border-[var(--panel-line)] pb-5">
            <h1 className="text-2xl font-bold leading-[1.2] tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem]">
              {t.title}
            </h1>
            <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-[var(--panel-muted)]">
              {t.subtitle}
            </p>
          </header>

          {!databaseAvailable ? (
            <p
              role="status"
              className="mt-6 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-subtle)] p-5 text-sm leading-relaxed text-[var(--panel-ink)]"
            >
              {t.noDatabase}
            </p>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <label className="flex min-h-11 min-w-0 flex-1 basis-72 max-w-xl items-center gap-2 rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3 text-[var(--panel-muted)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-sapphire)] dark:focus-within:outline-[#bad7fa]">
                  <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label={t.searchPlaceholder}
                    placeholder={t.searchPlaceholder}
                    className="min-h-11 w-full min-w-0 bg-transparent text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] outline-none"
                  />
                </label>

                <button
                  type="button"
                  disabled={loading}
                  onClick={refreshLogs}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-4 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
                >
                  <RefreshIcon
                    className={`h-4 w-4 shrink-0 ${loading ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  <span>{loading ? extra.refreshing : t.refresh}</span>
                </button>
              </div>

              {errorMessage ? (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-[#b91c1c]/30 bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b] dark:border-[#ffb4b4]/35 dark:bg-[#2c1519] dark:text-[#ffb4b4]"
                >
                  {errorMessage}
                </p>
              ) : null}

              {logs.length > 0 || search.trim() ? (
                <p
                  className="py-3 text-xs font-medium tabular-nums text-[var(--panel-muted)]"
                  aria-live="polite"
                >
                  {extra.showing(filteredLogs.length, logs.length)}
                </p>
              ) : null}

              {filteredLogs.length === 0 ? (
                <div
                  className={`border-t border-[var(--panel-line)] py-10 ${
                    logs.length === 0 && !search.trim() ? "mt-5" : ""
                  }`}
                >
                  <p className="text-sm text-[var(--panel-muted)]">{t.noEntries}</p>
                  {search.trim() ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-3 inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-4 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)]"
                    >
                      {extra.clearSearch}
                    </button>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-[var(--panel-line)] border-y border-[var(--panel-line)] md:hidden">
                    {filteredLogs.map((log) => (
                      <article key={log.id} className="space-y-1.5 py-4 text-sm">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <span className="font-semibold text-[var(--panel-ink)]">{log.action}</span>
                          <time
                            dateTime={log.created_at}
                            className="text-xs tabular-nums text-[var(--panel-muted)]"
                          >
                            {formatPanelDate(log.created_at, locale, "dateTime")}
                          </time>
                        </div>
                        <p className="text-xs text-[var(--panel-ink)]">
                          {log.actor_name || t.unknownActor}
                          {log.actor_email ? ` (${log.actor_email})` : ""}
                        </p>
                        <p className="text-xs tabular-nums text-[var(--panel-muted)]">
                          {log.entity_type}
                          {log.entity_id ? ` #${log.entity_id}` : ""}
                        </p>
                        {log.details ? (
                          <p className="break-words text-xs leading-relaxed text-[var(--panel-muted)]">
                            {summarizeDetails(log.details)}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>

                  <div className="hidden min-w-0 overflow-x-auto border-y border-[var(--panel-line)] md:block">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-[var(--panel-line)] bg-[var(--panel-subtle)] text-xs font-semibold text-[var(--panel-muted)]">
                        <tr>
                          <th className="px-3 py-3 whitespace-nowrap">{t.when}</th>
                          <th className="px-3 py-3 whitespace-nowrap">{t.actor}</th>
                          <th className="px-3 py-3 whitespace-nowrap">{extra.action}</th>
                          <th className="px-3 py-3 whitespace-nowrap">{extra.entity}</th>
                          <th className="px-3 py-3 whitespace-nowrap">{t.details}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--panel-line)]">
                        {filteredLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="align-top transition-colors hover:bg-[var(--panel-subtle)]"
                          >
                            <td className="px-3 py-3.5 tabular-nums whitespace-nowrap text-[var(--panel-muted)]">
                              <time dateTime={log.created_at}>
                                {formatPanelDate(log.created_at, locale, "dateTime")}
                              </time>
                            </td>
                            <td className="px-3 py-3.5">
                              <p className="font-medium text-[var(--panel-ink)]">
                                {log.actor_name || t.unknownActor}
                              </p>
                              <p className="mt-0.5 text-xs text-[var(--panel-muted)]">
                                {log.actor_email || "—"}
                              </p>
                            </td>
                            <td className="px-3 py-3.5 font-medium text-[var(--panel-ink)]">
                              {log.action}
                            </td>
                            <td className="px-3 py-3.5 tabular-nums whitespace-nowrap text-[var(--panel-ink)]">
                              {log.entity_type}
                              {log.entity_id ? ` #${log.entity_id}` : ""}
                            </td>
                            <td className="max-w-md px-3 py-3.5 text-xs leading-relaxed text-[var(--panel-muted)]">
                              <p className="break-words">{summarizeDetails(log.details) || "—"}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
