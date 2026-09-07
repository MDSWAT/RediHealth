"use client";

import {
  CalendarIcon,
  DownloadIcon,
  FilterIcon,
  RefreshIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
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
  const t = {
    en: {
      search: "Search patients by name, phone, email, notes...",
      add: "Add Patient Profile",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh patient records",
      refreshing: "Refreshing...",
      refresh: "Refresh",
      careStatus: "Care Status",
      priority: "Priority Level",
      allPatients: "All Patients",
      active: "Active Care",
      inactive: "Inactive Care",
      archived: "Archived",
      allPriorities: "All Priorities",
      critical: "Critical",
      high: "High",
      moderate: "Moderate",
      low: "Low",
      urgency: "Urgency",
      allUrgency: "All",
      overdue: "Overdue",
      dueToday: "Due Today",
      upcoming: "Upcoming",
      noFollowup: "No Follow-up",
      completed: "Completed",
      createdFrom: "Created From",
      createdTo: "Created To",
      clearDates: "Clear Dates",
    },
    ro: {
      search: "Cauta pacienti dupa nume, telefon, email, notite...",
      add: "Adauga profil pacient",
      exportCsv: "Export CSV",
      refreshTitle: "Reimprospateaza dosarele pacientilor",
      refreshing: "Se actualizeaza...",
      refresh: "Reimprospateaza",
      careStatus: "Status ingrijire",
      priority: "Nivel prioritate",
      allPatients: "Toti pacientii",
      active: "Ingrijire activa",
      inactive: "Ingrijire inactiva",
      archived: "Arhivat",
      allPriorities: "Toate prioritatile",
      critical: "Critic",
      high: "Ridicata",
      moderate: "Moderata",
      low: "Scazuta",
      urgency: "Urgenta",
      allUrgency: "Toate",
      overdue: "Depasit",
      dueToday: "Scadent azi",
      upcoming: "Urmator",
      noFollowup: "Fara monitorizare",
      completed: "Finalizat",
      createdFrom: "Creat din data",
      createdTo: "Creat pana la",
      clearDates: "Sterge datele",
    },
    sq: {
      search: "Kerko paciente sipas emrit, telefonit, emailit, shenimeve...",
      add: "Shto profil pacienti",
      exportCsv: "Eksporto CSV",
      refreshTitle: "Perditeso dosjet e pacienteve",
      refreshing: "Duke perditesuar...",
      refresh: "Perditeso",
      careStatus: "Statusi i kujdesit",
      priority: "Niveli i prioritetit",
      allPatients: "Te gjithe pacientet",
      active: "Kujdes aktiv",
      inactive: "Kujdes joaktiv",
      archived: "Arkivuar",
      allPriorities: "Te gjitha prioritetet",
      critical: "Kritik",
      high: "E larte",
      moderate: "Mesatare",
      low: "E ulet",
      urgency: "Urgjenca",
      allUrgency: "Te gjitha",
      overdue: "I vonuar",
      dueToday: "Per sot",
      upcoming: "Ne vijim",
      noFollowup: "Pa ndjekje",
      completed: "Perfunduar",
      createdFrom: "Krijuar nga data",
      createdTo: "Krijuar deri me",
      clearDates: "Pastro datat",
    },
    it: {
      search: "Cerca pazienti per nome, telefono, email, note...",
      add: "Aggiungi profilo paziente",
      exportCsv: "Esporta CSV",
      refreshTitle: "Aggiorna cartelle pazienti",
      refreshing: "Aggiornamento...",
      refresh: "Aggiorna",
      careStatus: "Stato cura",
      priority: "Livello priorita",
      allPatients: "Tutti i pazienti",
      active: "Cura attiva",
      inactive: "Cura inattiva",
      archived: "Archiviato",
      allPriorities: "Tutte le priorita",
      critical: "Critica",
      high: "Alta",
      moderate: "Moderata",
      low: "Bassa",
      urgency: "Urgenza",
      allUrgency: "Tutte",
      overdue: "In ritardo",
      dueToday: "Previsto oggi",
      upcoming: "Prossimo",
      noFollowup: "Nessun follow-up",
      completed: "Completato",
      createdFrom: "Creato dal",
      createdTo: "Creato al",
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

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full rounded-xl border border-border/80 bg-white pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <FilterIcon className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Reset filters</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onAddPatient}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <UserIcon className="h-4 w-4" />
            <span>{t.add}</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            disabled={exportDisabled}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            <DownloadIcon className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>

          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              title={t.refreshTitle}
            >
              <RefreshIcon
                className={`h-4 w-4 text-primary transition-transform ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? t.refreshing : t.refresh}
              </span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/80 pt-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="mr-1 flex items-center gap-1 font-semibold text-muted-foreground">
            <FilterIcon className="h-3.5 w-3.5" /> {t.careStatus}:
          </span>

          {localizedStatusFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeStatusFilter(item.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 font-semibold transition-colors ${
                activeStatusFilter === item.id
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="mr-1 flex items-center gap-1 font-semibold text-muted-foreground">
            {t.priority}:
          </span>

          {localizedPriorityFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangePriorityFilter(item.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 font-semibold transition-colors ${
                priorityFilter === item.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-2 text-xs">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 flex items-center gap-1 font-semibold text-muted-foreground">
              <FilterIcon className="h-3.5 w-3.5" /> {t.urgency}
            </label>
            <select
              value={urgencyFilter}
              onChange={(e) =>
                onChangeUrgencyFilter(
                  e.target.value as "all" | "overdue" | "today" | "upcoming" | "none" | "completed",
                )
              }
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {localizedUrgencyFilters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px] flex-1">
            <label className="mb-1 flex items-center gap-1 font-semibold text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" /> {t.createdFrom}
            </label>
            <input
              type="date"
              value={createdFrom}
              onChange={(e) => onChangeCreatedFrom(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="min-w-[150px] flex-1">
            <label className="mb-1 flex items-center gap-1 font-semibold text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" /> {t.createdTo}
            </label>
            <input
              type="date"
              value={createdTo}
              onChange={(e) => onChangeCreatedTo(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {(createdFrom || createdTo) && (
            <button
              type="button"
              onClick={() => {
                onChangeCreatedFrom("");
                onChangeCreatedTo("");
              }}
              className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {t.clearDates}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
