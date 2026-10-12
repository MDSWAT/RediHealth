"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";
import { AdminShell } from "@/components/panel/AdminShell";
import { EditIcon, PlusIcon, RefreshIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { findHelpTranslations } from "@/lib/i18n/find-help-translations";
import { institutesAdminTranslations } from "@/lib/i18n/institutes-admin-translations";
import {
  COUNTRY_INFO,
  INSTITUTE_CATEGORIES,
  SUPPORTED_COUNTRIES,
  type AdminMedicalInstitute,
  type CountryCode,
  type InstituteCategory,
} from "@/lib/medical-institutes";

const LocationPickerMap = dynamic(() => import("@/components/panel/LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted" />,
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

const inputClass =
  "min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary";

export function MedicalInstitutesDashboard({ initialData, userEmail, userRole, databaseAvailable }: Props) {
  const { lang } = useLanguage();
  const t = institutesAdminTranslations[lang];
  const labels = findHelpTranslations[lang];

  const [data, setData] = useState<ListData | null>(initialData);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<CountryCode | "">("");
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

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin>
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-6 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{t.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
            {databaseAvailable ? (
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setForm(emptyForm(country || "RO"));
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                <PlusIcon className="h-4 w-4" />
                {t.add}
              </button>
            ) : null}
          </div>

          {!databaseAvailable ? (
            <p className="rounded-2xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
            </p>
          ) : (
            <>
              <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold text-foreground">{t.importTitle}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.importHelp}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUPPORTED_COUNTRIES.map((code) => {
                      const stat = data?.stats.find((item) => item.country_code === code);
                      return (
                        <button
                          key={code}
                          type="button"
                          disabled={importing !== null}
                          onClick={() => runImport(code)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground hover:border-primary/40 disabled:opacity-60"
                        >
                          <RefreshIcon className={`h-4 w-4 ${importing === code ? "animate-spin" : ""}`} />
                          {importing === code ? t.importing : t.importButton(labels.countries[code])}
                          {stat ? (
                            <span className="text-xs font-normal text-muted-foreground">
                              ({t.activeOf(stat.active, stat.total)})
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {notice ? (
                <p
                  role="status"
                  className={`mb-4 rounded-xl border p-3 text-sm ${
                    notice.tone === "ok"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-primary/20 bg-primary-soft text-foreground"
                  }`}
                >
                  {notice.text}
                </p>
              ) : null}

              <div className="mb-4 flex flex-col gap-2 lg:flex-row">
                <form
                  className="flex flex-1 gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    applyFilter(() => setSearch(searchInput.trim()));
                  }}
                >
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => {
                      setSearchInput(event.target.value);
                      if (!event.target.value) applyFilter(() => setSearch(""));
                    }}
                    placeholder={t.searchPlaceholder}
                    className={inputClass}
                  />
                </form>
                <select
                  value={country}
                  onChange={(event) => applyFilter(() => setCountry(event.target.value as CountryCode | ""))}
                  className={`${inputClass} lg:w-44`}
                >
                  <option value="">{t.allCountries}</option>
                  {SUPPORTED_COUNTRIES.map((code) => (
                    <option key={code} value={code}>
                      {labels.countries[code]}
                    </option>
                  ))}
                </select>
                <select
                  value={category}
                  onChange={(event) => applyFilter(() => setCategory(event.target.value as InstituteCategory | ""))}
                  className={`${inputClass} lg:w-44`}
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
                  onChange={(event) => applyFilter(() => setStatus(event.target.value as typeof status))}
                  className={`${inputClass} lg:w-40`}
                >
                  <option value="all">{t.statusAll}</option>
                  <option value="active">{t.statusActive}</option>
                  <option value="hidden">{t.statusHidden}</option>
                </select>
              </div>

              <p className="mb-2 text-xs text-muted-foreground" aria-live="polite">
                {loading ? t.loading : t.total(data?.total ?? 0)}
              </p>

              {!data || data.institutes.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                  {loading ? t.loading : t.noEntries}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-4 py-3">{t.colName}</th>
                        <th className="px-4 py-3">{t.colType}</th>
                        <th className="px-4 py-3">{t.colLocation}</th>
                        <th className="px-4 py-3">{t.colPhone}</th>
                        <th className="px-4 py-3">{t.colSource}</th>
                        <th className="px-4 py-3">{t.colStatus}</th>
                        <th className="px-4 py-3 text-right">{t.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.institutes.map((item) => (
                        <tr key={item.id} className="border-b border-border/70 align-top">
                          <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                          <td className="px-4 py-3 text-slate-700">{labels.categories[item.category]}</td>
                          <td className="px-4 py-3 text-slate-600">
                            <p>{[item.address, item.city].filter(Boolean).join(", ") || "-"}</p>
                            <p className="text-xs text-slate-500">{labels.countries[item.country_code]}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{item.phone || "-"}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {item.source === "osm" ? t.sourceOsm : t.sourceManual}
                            {item.source === "osm" && item.manually_edited ? (
                              <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">{t.editedBadge}</span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.is_active ? t.active : t.hidden}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormError(null);
                                  setForm(formFromInstitute(item));
                                }}
                                className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary hover:bg-primary-soft"
                              >
                                <EditIcon className="h-4 w-4" />
                                {t.edit}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleActive(item)}
                                className="min-h-8 rounded-lg px-2 text-xs font-semibold text-slate-600 hover:bg-muted"
                              >
                                {item.is_active ? t.hide : t.show}
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(item)}
                                aria-label={t.delete}
                                title={t.delete}
                                className="inline-flex min-h-8 items-center rounded-lg px-2 text-slate-500 hover:bg-primary-soft hover:text-primary"
                              >
                                <TrashIcon className="h-4 w-4" />
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
                <div className="mt-4 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((value) => value - 1)}
                    className="min-h-10 rounded-xl border border-border bg-white px-4 font-semibold disabled:opacity-50"
                  >
                    {t.previous}
                  </button>
                  <span className="text-muted-foreground">{t.pageOf(page, totalPages)}</span>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((value) => value + 1)}
                    className="min-h-10 rounded-xl border border-border bg-white px-4 font-semibold disabled:opacity-50"
                  >
                    {t.next}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </Container>
      </main>

      {form ? (
        <div
          className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="institute-form-title"
        >
          <form
            onSubmit={submitForm}
            className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="institute-form-title" className="text-lg font-bold text-foreground">
              {form.id ? t.formEditTitle : t.formAddTitle}
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  {t.fieldName}
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium">
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
                      className={`${inputClass} mt-1`}
                    >
                      {SUPPORTED_COUNTRIES.map((code) => (
                        <option key={code} value={code}>
                          {labels.countries[code]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    {t.fieldCategory}
                    <select
                      value={form.category}
                      onChange={(event) => setForm({ ...form, category: event.target.value as InstituteCategory })}
                      className={`${inputClass} mt-1`}
                    >
                      {INSTITUTE_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {labels.categories[item]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block text-sm font-medium">
                  {t.fieldCity}
                  <input
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="block text-sm font-medium">
                  {t.fieldAddress}
                  <input
                    value={form.address}
                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium">
                    {t.fieldPhone}
                    <input
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    {t.fieldWebsite}
                    <input
                      value={form.website}
                      onChange={(event) => setForm({ ...form, website: event.target.value })}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium">
                  {t.fieldHours}
                  <input
                    value={form.hours}
                    placeholder={t.fieldHoursHint}
                    onChange={(event) => setForm({ ...form, hours: event.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.emergency}
                    onChange={(event) => setForm({ ...form, emergency: event.target.checked })}
                  />
                  {t.fieldEmergency}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                  />
                  {t.fieldActive}
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <div className="h-72 overflow-hidden rounded-xl border border-border md:h-full md:min-h-72">
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
                <p className="text-xs text-muted-foreground">{t.mapPickHint}</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium">
                    {t.fieldLat}
                    <input
                      required
                      inputMode="decimal"
                      value={form.lat}
                      onChange={(event) => setForm({ ...form, lat: event.target.value })}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    {t.fieldLng}
                    <input
                      required
                      inputMode="decimal"
                      value={form.lng}
                      onChange={(event) => setForm({ ...form, lng: event.target.value })}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                </div>
              </div>
            </div>

            {formError ? (
              <p role="alert" className="mt-4 rounded-xl bg-primary-soft p-3 text-sm text-foreground">
                {formError}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="min-h-10 rounded-xl border border-border px-4 text-sm font-semibold"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
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
