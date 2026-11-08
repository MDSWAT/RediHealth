"use client";

import { crmTranslations } from "@/lib/i18n/crm-translations";
import { useState } from "react";
import {
  FilterIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PatientPriority, PatientStatus } from "@/lib/types/patient";

interface PatientsFilterBarProps {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  activeStatusFilter: PatientStatus | "all";
  onChangeStatusFilter: (value: PatientStatus | "all") => void;
  priorityFilter: PatientPriority | "all";
  onChangePriorityFilter: (value: PatientPriority | "all") => void;
  urgencyFilter: "all" | "overdue" | "today" | "upcoming" | "none" | "completed";
  onChangeUrgencyFilter: (value: "all" | "overdue" | "today" | "upcoming" | "none" | "completed") => void;
  createdFrom: string;
  onChangeCreatedFrom: (value: string) => void;
  createdTo: string;
  onChangeCreatedTo: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onAddPatient: () => void;
  onExportCSV: () => void;
  exportDisabled: boolean;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const statusFilters = [
  { id: "all", label: "All Patients" },
  { id: "active", label: "Active Care" },
  { id: "inactive", label: "Inactive Care" },
  { id: "archived", label: "Archived" },
] as const;

const priorityFilters = [
  { id: "all", label: "All Priorities" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "moderate", label: "Moderate" },
  { id: "low", label: "Low" },
] as const;

const urgencyFilters = [
  { id: "all", label: "All" },
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Due Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "none", label: "No Follow-up" },
  { id: "completed", label: "Completed" },
] as const;

export function PatientsFilterBar({
  searchQuery,
  onChangeSearchQuery,
  activeStatusFilter,
  onChangeStatusFilter,
  priorityFilter,
  onChangePriorityFilter,
  urgencyFilter,
  onChangeUrgencyFilter,
  createdFrom,
  onChangeCreatedFrom,
  createdTo,
  onChangeCreatedTo,
  onResetFilters,
  hasActiveFilters,
  onAddPatient,
  onExportCSV,
  exportDisabled,
  onRefresh,
  isRefreshing = false,
}: PatientsFilterBarProps) {
  const { lang } = useLanguage();
  const copy = panelDesignTranslations[lang];
  const crm = crmTranslations[lang];
  const [showFilters, setShowFilters] = useState(false);
  const t = {
    en: {
      search: "Search by name, phone, email or notes",
      add: "Add patient",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh patients",
      refreshing: "Refreshing...",
      refresh: "Refresh",
      careStatus: "Care status",
      priority: "Priority",
      allPatients: "All patients",
      active: "In care",
      inactive: "Inactive",
      archived: "Archived",
      allPriorities: "All priorities",
      critical: "Critical",
      high: "High",
      moderate: "Medium",
      low: "Low",
      urgency: "Follow-up",
      allUrgency: "All",
      overdue: "Overdue",
      dueToday: "Due today",
      upcoming: "Upcoming",
      noFollowup: "No follow-up",
      completed: "Done",
      createdFrom: "Added from",
      createdTo: "Added until",
      clearDates: "Clear dates",
    },
    ro: {
      search: "Caută după nume, telefon, email sau notițe",
      add: "Adaugă pacient",
      exportCsv: "Exportă CSV",
      refreshTitle: "Actualizează lista de pacienți",
      refreshing: "Se actualizează...",
      refresh: "Actualizează",
      careStatus: "Status îngrijire",
      priority: "Prioritate",
      allPatients: "Toți pacienții",
      active: "În îngrijire",
      inactive: "Inactiv",
      archived: "Arhivat",
      allPriorities: "Toate prioritățile",
      critical: "Critică",
      high: "Ridicată",
      moderate: "Medie",
      low: "Scăzută",
      urgency: "Control",
      allUrgency: "Toate",
      overdue: "Întârziat",
      dueToday: "Azi",
      upcoming: "Următor",
      noFollowup: "Fără control",
      completed: "Efectuat",
      createdFrom: "Adăugat de la",
      createdTo: "Adăugat până la",
      clearDates: "Șterge datele",
    },
    sq: {
      search: "Kërko sipas emrit, telefonit, emailit ose shënimeve",
      add: "Shto pacient",
      exportCsv: "Eksporto CSV",
      refreshTitle: "Rifresko pacientët",
      refreshing: "Duke rifreskuar...",
      refresh: "Rifresko",
      careStatus: "Statusi i kujdesit",
      priority: "Prioriteti",
      allPatients: "Të gjithë pacientët",
      active: "Në kujdes",
      inactive: "Joaktiv",
      archived: "Arkivuar",
      allPriorities: "Të gjitha prioritetet",
      critical: "Kritik",
      high: "E lartë",
      moderate: "Mesatare",
      low: "E ulët",
      urgency: "Kontrolli",
      allUrgency: "Të gjitha",
      overdue: "Me vonesë",
      dueToday: "Sot",
      upcoming: "Në vijim",
      noFollowup: "Pa kontroll",
      completed: "Kryer",
      createdFrom: "Shtuar nga",
      createdTo: "Shtuar deri më",
      clearDates: "Pastro datat",
    },
    it: {
      search: "Cerca per nome, telefono, email o note",
      add: "Aggiungi paziente",
      exportCsv: "Esporta CSV",
      refreshTitle: "Aggiorna pazienti",
      refreshing: "Aggiornamento...",
      refresh: "Aggiorna",
      careStatus: "Stato delle cure",
      priority: "Priorità",
      allPatients: "Tutti i pazienti",
      active: "In cura",
      inactive: "Inattivo",
      archived: "Archiviato",
      allPriorities: "Tutte le priorità",
      critical: "Critica",
      high: "Alta",
      moderate: "Media",
      low: "Bassa",
      urgency: "Controllo",
      allUrgency: "Tutte",
      overdue: "In ritardo",
      dueToday: "Oggi",
      upcoming: "Prossimo",
      noFollowup: "Nessun controllo",
      completed: "Fatto",
      createdFrom: "Aggiunto dal",
      createdTo: "Aggiunto fino al",
      clearDates: "Azzera date",
    },
  }[lang];

  const localizedStatusFilters = statusFilters.map((item) => ({
    ...item,
    label:
      item.id === "all"
        ? t.allPatients
        : item.id === "active"
        ? t.active
        : item.id === "inactive"
        ? t.inactive
        : t.archived,
  }));

  const localizedPriorityFilters = priorityFilters.map((item) => ({
    ...item,
    label:
      item.id === "all"
        ? t.allPriorities
        : item.id === "critical"
        ? t.critical
        : item.id === "high"
        ? t.high
        : item.id === "moderate"
        ? t.moderate
        : t.low,
  }));

    const localizedUrgencyFilters = urgencyFilters.map((item) => ({
      ...item,
      label:
        item.id === "all"
          ? t.allUrgency
          : item.id === "overdue"
          ? t.overdue
          : item.id === "today"
          ? t.dueToday
          : item.id === "upcoming"
          ? t.upcoming
          : item.id === "none"
          ? t.noFollowup
          : t.completed,
    }));

  const hasAdvancedFilters = Boolean(
    priorityFilter !== "all" || urgencyFilter !== "all" || createdFrom || createdTo,
  );

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      {/* Top search and actions row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            className={`crm-button ${showFilters || hasAdvancedFilters ? "!border-primary/40 !bg-primary-soft !text-primary" : ""}`}
          >
            <FilterIcon className="h-4 w-4" />
            <span>{copy.filters}</span>
            {hasAdvancedFilters ? <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" /> : null}
          </button>

          <button type="button" onClick={onAddPatient} className="crm-button crm-primary">
            <UserIcon className="h-4 w-4" />
            <span>{t.add}</span>
          </button>

          <details className="crm-menu"><summary className="crm-button">{crm.more}</summary><div>
            <button type="button" onClick={onExportCSV} disabled={exportDisabled}>{t.exportCsv}</button>
            {onRefresh && <button type="button" onClick={onRefresh} disabled={isRefreshing}>{t.refresh}</button>}
          </div></details>
        </div>
      </div>

      {/* Filters: one row of labelled fields, the same controls the inbox filters use. */}
      {showFilters ? (
        <div className="grid grid-cols-1 items-end gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
          <label className="crm-label">{t.careStatus}
            <select className="crm-input" value={activeStatusFilter} onChange={(e) => onChangeStatusFilter(e.target.value as typeof activeStatusFilter)}>
              {localizedStatusFilters.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="crm-label">{t.priority}
            <select className="crm-input" value={priorityFilter} onChange={(e) => onChangePriorityFilter(e.target.value as typeof priorityFilter)}>
              {localizedPriorityFilters.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="crm-label">{t.urgency}
            <select className="crm-input" value={urgencyFilter} onChange={(e) => onChangeUrgencyFilter(e.target.value as typeof urgencyFilter)}>
              {localizedUrgencyFilters.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="crm-label">{t.createdFrom}
            <input type="date" className="crm-input" value={createdFrom} onChange={(e) => onChangeCreatedFrom(e.target.value)} />
          </label>
          <label className="crm-label">{t.createdTo}
            <input type="date" className="crm-input" value={createdTo} onChange={(e) => onChangeCreatedTo(e.target.value)} />
          </label>
          {createdFrom || createdTo ? (
            <button type="button" className="crm-button" onClick={() => { onChangeCreatedFrom(""); onChangeCreatedTo(""); }}>
              {t.clearDates}
            </button>
          ) : null}
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">{copy.activeFilters}</span>
          <button
            type="button"
            onClick={onResetFilters}
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            {copy.reset}
          </button>
        </div>
      ) : null}
    </div>
  );
}
