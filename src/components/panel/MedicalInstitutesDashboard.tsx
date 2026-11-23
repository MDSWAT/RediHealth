"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { AdminShell } from "@/components/panel/AdminShell";
import { CloseIcon, EditIcon, PlusIcon, RefreshIcon, SearchIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { findHelpTranslations } from "@/lib/i18n/find-help-translations";
import { institutesAdminTranslations } from "@/lib/i18n/institutes-admin-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import {
  COUNTRY_INFO,
  INSTITUTE_CATEGORIES,
  type AdminMedicalInstitute,
  type CountryCode,
  type InstituteCategory,
} from "@/lib/medical-institutes";

const LocationPickerMap = dynamic(() => import("@/components/panel/LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[var(--panel-subtle)]" />,
});

type ListData = {
  institutes: AdminMedicalInstitute[];
  total: number;
  page: number;
  pageSize: number;
  stats: { country_code: string; total: number; active: number }[];
};

type Props = {
  initialData: ListData | null;
  userEmail: string;
  userRole?: string;
  databaseAvailable: boolean;
  workingCountry: CountryCode;
};

type FormState = {
  id: string | null;
  name: string;
  country_code: CountryCode;
  category: InstituteCategory;
  city: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  emergency: boolean;
  is_active: boolean;
  lat: string;
  lng: string;
};

function emptyForm(country: CountryCode): FormState {
  const [lat, lng] = COUNTRY_INFO[country].center;
  return {
    id: null,
    name: "",
    country_code: country,
    category: "hospital",
    city: "",
    address: "",
    phone: "",
    website: "",
    hours: "",
    emergency: false,
    is_active: true,
    lat: String(lat),
    lng: String(lng),
  };
}

function formFromInstitute(item: AdminMedicalInstitute): FormState {
  return {
    id: item.id,
    name: item.name,
    country_code: item.country_code,
    category: item.category,
    city: item.city ?? "",
    address: item.address ?? "",
    phone: item.phone ?? "",
    website: item.website ?? "",
    hours: item.hours ?? "",
    emergency: item.emergency,
    is_active: item.is_active,
    lat: String(item.lat),
    lng: String(item.lng),
  };
}

const controlClass =
  "min-h-11 rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3.5 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa]";

const outlineButtonClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3.5 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]";

export function MedicalInstitutesDashboard({
  initialData,
  userEmail,
  userRole,
  databaseAvailable,
  workingCountry,
}: Props) {
  const { lang } = useLanguage();
  const locale = langToLocale[lang];
  const t = institutesAdminTranslations[lang];
  const labels = findHelpTranslations[lang];
  // The directory is managed per country; a super admin only edits the country they are working in.
  const ownCountries: CountryCode[] = [workingCountry];

  const [data, setData] = useState<ListData | null>(initialData);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<CountryCode | "">(workingCountry);
  const [category, setCategory] = useState<InstituteCategory | "">("");
  const [status, setStatus] = useState<"all" | "active" | "hidden">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [importing, setImporting] = useState<CountryCode | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const skipInitialFetch = useRef(initialData !== null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "50", status });
      if (search) params.set("search", search);
      if (country) params.set("country", country);
      if (category) params.set("category", category);
      const response = await fetch(`/api/admin/medical-institutes?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setData((await response.json()) as ListData);
    } catch (error) {
      console.error("Failed to load medical institutes", error);
      setNotice({ tone: "error", text: t.saveFailed });
    } finally {
      setLoading(false);
    }
  }, [page, search, country, category, status, t.saveFailed]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void load();
  }, [load]);

  useEffect(() => {
    if (!form) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        setForm(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [form, saving]);

  function applyFilter(update: () => void) {
    update();
    setPage(1);
  }

  async function runImport(target: CountryCode) {
    const name = labels.countries[target];
    if (!window.confirm(t.importConfirm(name))) return;
    setImporting(target);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/medical-institutes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: target }),
      });
      const result = (await response.json().catch(() => ({}))) as { imported?: number };
      if (!response.ok) throw new Error("Import failed");
      setNotice({ tone: "ok", text: t.importDone(result.imported ?? 0, name) });
      await load();
    } catch {
      setNotice({ tone: "error", text: t.importFailed });
    } finally {
      setImporting(null);
    }
  }

  async function toggleActive(item: AdminMedicalInstitute) {
    const response = await fetch(`/api/admin/medical-institutes/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    if (response.ok) await load();
    else setNotice({ tone: "error", text: t.saveFailed });
  }

  async function remove(item: AdminMedicalInstitute) {
    const message = item.source === "osm" ? t.deleteOsmConfirm(item.name) : t.deleteConfirm(item.name);
    if (!window.confirm(message)) return;
    const response = await fetch(`/api/admin/medical-institutes/${item.id}`, { method: "DELETE" });
    if (response.ok) await load();
    else setNotice({ tone: "error", text: t.saveFailed });
  }

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError(null);
    try {
      const { id, ...payload } = form;
      const response = await fetch(
        id ? `/api/admin/medical-institutes/${id}` : "/api/admin/medical-institutes",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setFormError(result.error || t.saveFailed);
        return;
      }
      setForm(null);
      await load();
    } catch {
      setFormError(t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const formLat = form ? Number(form.lat) : NaN;
  const formLng = form ? Number(form.lng) : NaN;
  const activeCountryStat = data?.stats.find((item) => item.country_code === workingCountry);

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin>
      <main
        id="main-content"
        className="min-h-dvh bg-[var(--panel-surface)] px-4 py-6 pb-24 text-[var(--panel-ink)] sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--panel-line)] pb-5">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-[1.2] tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem]">
                {t.title}
              </h1>
              <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-[var(--panel-muted)]">
                {t.subtitle}
              </p>
              {databaseAvailable && activeCountryStat ? (
                <p className="mt-2 text-xs font-medium tabular-nums text-[var(--panel-muted)]">
                  {labels.countries[workingCountry]} — {t.activeOf(activeCountryStat.active, activeCountryStat.total)}
                </p>
              ) : null}
            </div>
            {databaseAvailable ? (
              <div className="flex flex-wrap items-center gap-2">
                {ownCountries.map((code) => (
                  <button
                    key={code}
                    type="button"
                    disabled={importing !== null}
                    onClick={() => runImport(code)}
                    title={t.importHelp}
                    className={outlineButtonClass}
                  >
                    <RefreshIcon
                      className={`h-4 w-4 shrink-0 ${importing === code ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                    <span>
                      {importing === code ? t.importing : t.importButton(labels.countries[code])}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setForm(emptyForm(workingCountry));
                  }}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--color-sapphire)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#28476f]"
                >
                  <PlusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t.add}</span>
                </button>
              </div>
            ) : null}
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
              <div className="border-b border-[var(--panel-line)] py-4">
                <p className="max-w-[75ch] text-xs leading-relaxed text-[var(--panel-muted)]">
                  <span className="font-medium text-[var(--panel-ink)]">{t.importTitle}:</span>{" "}
                  {t.importHelp}
                </p>
              </div>

              {notice ? (
                <p
                  role={notice.tone === "error" ? "alert" : "status"}
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                    notice.tone === "ok"
                      ? "border-[var(--panel-line)] bg-[var(--panel-selection)] text-[var(--panel-ink)]"
                      : "border-[#b91c1c]/30 bg-[#fef2f2] text-[#991b1b] dark:border-[#ffb4b4]/35 dark:bg-[#2c1519] dark:text-[#ffb4b4]"
                  }`}
                >
                  {notice.text}
                </p>
              ) : null}

              <div className="mt-5 flex flex-col gap-2.5 lg:flex-row lg:items-center">
                <form
                  className="flex min-w-0 lg:flex-1"
                  onSubmit={(event) => {
                    event.preventDefault();
                    applyFilter(() => setSearch(searchInput.trim()));
                  }}
                >
                  <label className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3 text-[var(--panel-muted)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-sapphire)] dark:focus-within:outline-[#bad7fa]">
                    <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) => {
                        setSearchInput(event.target.value);
                        if (!event.target.value) applyFilter(() => setSearch(""));
                      }}
                      aria-label={t.searchPlaceholder}
                      placeholder={t.searchPlaceholder}
                      className="min-h-11 w-full min-w-0 bg-transparent text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] outline-none"
                    />
                  </label>
                </form>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:flex lg:shrink-0 lg:items-center">
                  <select
                    value={country}
                    aria-label={t.fieldCountry}
                    onChange={(event) => applyFilter(() => setCountry(event.target.value as CountryCode | ""))}
                    className={`${controlClass} w-full min-w-0 whitespace-nowrap lg:w-auto lg:shrink-0`}
                  >
                    <option value="">{t.allCountries}</option>
                    {ownCountries.map((code) => (
                      <option key={code} value={code}>
                        {labels.countries[code]}
                      </option>
                    ))}
                  </select>

                  <select
                    value={category}
                    aria-label={t.fieldCategory}
                    onChange={(event) =>
                      applyFilter(() => setCategory(event.target.value as InstituteCategory | ""))
                    }
                    className={`${controlClass} w-full min-w-0 whitespace-nowrap lg:w-auto lg:shrink-0`}
                  >
                    <option value="">{t.allCategories}</option>
                    {INSTITUTE_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {labels.categories[item]}
                      </option>
                    ))}
                  </select>

                  <select
                    value={status}
                    aria-label={t.colStatus}
                    onChange={(event) => applyFilter(() => setStatus(event.target.value as typeof status))}
                    className={`${controlClass} w-full min-w-0 whitespace-nowrap lg:w-auto lg:shrink-0`}
                  >
                    <option value="all">{t.statusAll}</option>
                    <option value="active">{t.statusActive}</option>
                    <option value="hidden">{t.statusHidden}</option>
                  </select>
                </div>
              </div>

              <p
                className="py-3 text-xs font-medium tabular-nums text-[var(--panel-muted)]"
                aria-live="polite"
              >
                {loading
                  ? t.loading
                  : t.total(data?.total ?? 0).replace(
                      String(data?.total ?? 0),
                      (data?.total ?? 0).toLocaleString(locale),
                    )}
              </p>

              {!data || data.institutes.length === 0 ? (
                <p className="border-t border-[var(--panel-line)] py-10 text-sm text-[var(--panel-muted)]">
                  {loading ? t.loading : t.noEntries}
                </p>
              ) : (
                <div className="min-w-0 overflow-x-auto border-y border-[var(--panel-line)]">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-[var(--panel-line)] bg-[var(--panel-subtle)] text-xs font-semibold text-[var(--panel-muted)]">
                      <tr>
                        <th className="px-3 py-3 whitespace-nowrap">{t.colName}</th>
                        <th className="px-3 py-3 whitespace-nowrap">{t.colType}</th>
                        <th className="px-3 py-3 whitespace-nowrap">{t.colLocation}</th>
                        <th className="px-3 py-3 whitespace-nowrap">{t.colPhone}</th>
                        <th className="px-3 py-3 whitespace-nowrap">{t.colSource}</th>
                        <th className="px-3 py-3 whitespace-nowrap">{t.colStatus}</th>
                        <th className="px-3 py-3 text-right whitespace-nowrap">{t.colActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--panel-line)]">
                      {data.institutes.map((item) => (
                        <tr
                          key={item.id}
                          className="align-top transition-colors hover:bg-[var(--panel-subtle)]"
                        >
                          <td className="px-3 py-3.5 font-medium text-[var(--panel-ink)]">{item.name}</td>
                          <td className="px-3 py-3.5 whitespace-nowrap text-[var(--panel-ink)]">
                            {labels.categories[item.category]}
                          </td>
                          <td className="px-3 py-3.5 text-[var(--panel-muted)]">
                            <p className="text-[var(--panel-ink)]">
                              {[item.address, item.city].filter(Boolean).join(", ") || "—"}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--panel-muted)]">
                              {labels.countries[item.country_code]}
                            </p>
                          </td>
                          <td className="px-3 py-3.5 tabular-nums whitespace-nowrap text-[var(--panel-muted)]">
                            {item.phone || "—"}
                          </td>
                          <td className="px-3 py-3.5 text-xs whitespace-nowrap text-[var(--panel-muted)]">
                            {item.source === "osm" ? t.sourceOsm : t.sourceManual}
                            {item.source === "osm" && item.manually_edited ? (
                              <span className="text-[#9a4d0b] dark:text-[#f5c58e]">
                                {", "}
                                {t.editedBadge}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <span
                              className={
                                item.is_active
                                  ? "text-xs font-medium text-[var(--panel-ink)]"
                                  : "text-xs text-[var(--panel-muted)]"
                              }
                            >
                              {item.is_active ? t.active : t.hidden}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-nowrap items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormError(null);
                                  setForm(formFromInstitute(item));
                                }}
                                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[var(--color-sapphire)] transition-colors hover:bg-[var(--panel-selection)] dark:text-[#bad7fa]"
                              >
                                <EditIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>{t.edit}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleActive(item)}
                                className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[var(--panel-muted)] transition-colors hover:bg-[var(--panel-selection)] hover:text-[var(--panel-ink)]"
                              >
                                {item.is_active ? t.hide : t.show}
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(item)}
                                aria-label={`${t.delete}: ${item.name}`}
                                title={t.delete}
                                className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[#b91c1c] transition-colors hover:bg-[#fef2f2] dark:text-[#ffb4b4] dark:hover:bg-[#3f1d24]"
                              >
                                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data && totalPages > 1 ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((value) => value - 1)}
                    className={outlineButtonClass}
                  >
                    {t.previous}
                  </button>
                  <span className="tabular-nums text-[var(--panel-muted)]">
                    {t.pageOf(page, totalPages)}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((value) => value + 1)}
                    className={outlineButtonClass}
                  >
                    {t.next}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>

      {form ? (
        <div
          className="panel-scrim fixed inset-0 z-[2000] flex items-end justify-center overflow-y-auto bg-[#0b132b]/60 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="institute-form-title"
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setForm(null);
            }
          }}
        >
          <form
            onSubmit={submitForm}
            className="app-sheet-slide-up max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-[var(--panel-line)] bg-[var(--panel-surface)] p-5 text-[var(--panel-ink)] shadow-[0_24px_80px_rgba(11,19,43,0.28)] sm:max-h-[90vh] sm:rounded-2xl sm:p-6 care-panel-bottom-bar"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--panel-line)] pb-4">
              <h2
                id="institute-form-title"
                className="text-lg font-semibold leading-snug text-[var(--panel-ink)]"
              >
                {form.id ? t.formEditTitle : t.formAddTitle}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!saving) setForm(null);
                }}
                aria-label={t.cancel}
                className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[var(--panel-muted)] transition-colors hover:bg-[var(--panel-selection)] hover:text-[var(--panel-ink)]"
              >
                <CloseIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="space-y-3.5">
                <label className="block text-sm font-medium text-[var(--panel-ink)]">
                  {t.fieldName}
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className={`${controlClass} mt-1.5 w-full`}
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[var(--panel-ink)]">
                    {t.fieldCountry}
                    <select
                      value={form.country_code}
                      onChange={(event) => {
                        const next = event.target.value as CountryCode;
                        const [lat, lng] = COUNTRY_INFO[next].center;
                        setForm({
                          ...form,
                          country_code: next,
                          ...(form.id ? {} : { lat: String(lat), lng: String(lng) }),
                        });
                      }}
                      className={`${controlClass} mt-1.5 w-full whitespace-nowrap`}
                    >
                      {ownCountries.map((code) => (
                        <option key={code} value={code}>
                          {labels.countries[code]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-[var(--panel-ink)]">
                    {t.fieldCategory}
                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm({ ...form, category: event.target.value as InstituteCategory })
                      }
                      className={`${controlClass} mt-1.5 w-full whitespace-nowrap`}
                    >
                      {INSTITUTE_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {labels.categories[item]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block text-sm font-medium text-[var(--panel-ink)]">
                  {t.fieldCity}
                  <input
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                    className={`${controlClass} mt-1.5 w-full`}
                  />
                </label>
                <label className="block text-sm font-medium text-[var(--panel-ink)]">
                  {t.fieldAddress}
                  <input
                    value={form.address}
                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                    className={`${controlClass} mt-1.5 w-full`}
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[var(--panel-ink)]">
                    {t.fieldPhone}
                    <input
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      className={`${controlClass} mt-1.5 w-full`}
                    />
                  </label>
                  <label className="block text-sm font-medium text-[var(--panel-ink)]">
                    {t.fieldWebsite}
                    <input
                      value={form.website}
                      onChange={(event) => setForm({ ...form, website: event.target.value })}
                      className={`${controlClass} mt-1.5 w-full`}
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium text-[var(--panel-ink)]">
                  {t.fieldHours}
                  <input
                    value={form.hours}
                    placeholder={t.fieldHoursHint}
                    onChange={(event) => setForm({ ...form, hours: event.target.value })}
                    className={`${controlClass} mt-1.5 w-full`}
                  />
                </label>
                <div className="space-y-1 pt-1">
                  <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-[var(--panel-ink)]">
                    <input
                      type="checkbox"
                      checked={form.emergency}
                      onChange={(event) => setForm({ ...form, emergency: event.target.checked })}
                      className="h-4 w-4 rounded border-[var(--color-border-control)]"
                    />
                    <span>{t.fieldEmergency}</span>
                  </label>
                  <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-[var(--panel-ink)]">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                      className="h-4 w-4 rounded border-[var(--color-border-control)]"
                    />
                    <span>{t.fieldActive}</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="h-72 overflow-hidden rounded-lg border border-[var(--panel-line)] md:h-full md:min-h-72">
                  {Number.isFinite(formLat) && Number.isFinite(formLng) ? (
                    <LocationPickerMap
                      lat={formLat}
                      lng={formLng}
                      onChange={(point) =>
                        setForm((current) =>
                          current
                            ? { ...current, lat: point.lat.toFixed(6), lng: point.lng.toFixed(6) }
                            : current,
                        )
                      }
                    />
                  ) : null}
                </div>
                <p className="text-xs text-[var(--panel-muted)]">{t.mapPickHint}</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-[var(--panel-ink)]">
                    {t.fieldLat}
                    <input
                      required
                      inputMode="decimal"
                      value={form.lat}
                      onChange={(event) => setForm({ ...form, lat: event.target.value })}
                      className={`${controlClass} mt-1.5 w-full tabular-nums`}
                    />
                  </label>
                  <label className="block text-sm font-medium text-[var(--panel-ink)]">
                    {t.fieldLng}
                    <input
                      required
                      inputMode="decimal"
                      value={form.lng}
                      onChange={(event) => setForm({ ...form, lng: event.target.value })}
                      className={`${controlClass} mt-1.5 w-full tabular-nums`}
                    />
                  </label>
                </div>
              </div>
            </div>

            {formError ? (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-[#b91c1c]/30 bg-[#fef2f2] px-3.5 py-2.5 text-sm text-[#991b1b] dark:border-[#ffb4b4]/35 dark:bg-[#2c1519] dark:text-[#ffb4b4]"
              >
                {formError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2.5 border-t border-[var(--panel-line)] pt-4">
              <button
                type="button"
                onClick={() => setForm(null)}
                className={outlineButtonClass}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-sapphire)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#28476f] disabled:cursor-default disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
              >
                {saving ? t.saving : t.save}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminShell>
  );
}
