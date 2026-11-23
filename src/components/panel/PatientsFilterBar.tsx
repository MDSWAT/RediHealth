"use client";

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

const STATUS_FILTER_IDS = ["all", "active", "inactive", "archived"] as const;
const PRIORITY_FILTER_IDS = ["all", "critical", "high", "moderate", "low"] as const;
const URGENCY_FILTER_IDS = ["all", "overdue", "today", "upcoming", "none", "completed"] as const;

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
}: PatientsFilterBarProps) {
  const { lang } = useLanguage();
  const copy = panelDesignTranslations[lang];
  const [showFilters, setShowFilters] = useState(false);
  const t = {
    ru: {
      search: "Поиск по имени, телефону, электронной почте или заметкам",
      add: "Добавить пациента",
      exportCsv: "Экспортировать CSV",
      refreshTitle: "Обновить пациентов",
      refreshing: "Обновление...",
      refresh: "Обновить",
      careStatus: "Статус ухода",
      priority: "Приоритет",
      allPatients: "Все пациенты",
      active: "Под присмотром",
      inactive: "Неактивный",
      archived: "В архиве",
      allPriorities: "Все приоритеты",
      critical: "Критический",
      high: "Высокий",
      moderate: "Средний",
      low: "Низкий",
      urgency: "Контроль",
      allUrgency: "Все",
      overdue: "Просрочено",
      dueToday: "На сегодня",
      upcoming: "Предстоящие",
      noFollowup: "Без контроля",
      completed: "Готово",
      createdFrom: "Добавлен с",
      createdTo: "Добавлен по",
      clearDates: "Очистить даты",
    },

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
    hr: {
      search: "Pretraži po imenu, telefonu, emailu ili bilješkama",
      add: "Dodaj pacijenta",
      exportCsv: "Izvezi CSV",
      refreshTitle: "Osvježi pacijente",
      refreshing: "Osvježavanje...",
      refresh: "Osvježi",
      careStatus: "Status skrbi",
      priority: "Prioritet",
      allPatients: "Svi pacijenti",
      active: "U skrbi",
      inactive: "Neaktivan",
      archived: "Arhiviran",
      allPriorities: "Svi prioriteti",
      critical: "Kritičan",
      high: "Visok",
      moderate: "Srednji",
      low: "Nizak",
      urgency: "Kontrolni pregled",
      allUrgency: "Svi",
      overdue: "Zakašnjeli",
      dueToday: "Danas",
      upcoming: "Nadolazeći",
      noFollowup: "Bez kontrole",
      completed: "Obavljeno",
      createdFrom: "Dodano od",
      createdTo: "Dodano do",
      clearDates: "Očisti datume",
    },
    rom: {
      search: "Rode pala anav, telefono, email vay noticye",
      add: "Tho paciento",
      exportCsv: "Inkal CSV",
      refreshTitle: "Nevyar le pacienturen",
      refreshing: "Nevyarel...",
      refresh: "Nevyar",
      careStatus: "Statuso sastipnasko",
      priority: "Prioriteto",
      allPatients: "Sa le pacienturya",
      active: "And-o dikhiben",
      inactive: "Bi-aktivno",
      archived: "Arkhivime",
      allPriorities: "Sa le prioriteturya",
      critical: "Kritiko",
      high: "Ucho",
      moderate: "Mashkarutno",
      low: "Tikno",
      urgency: "Kontrola",
      allUrgency: "Sa",
      overdue: "Nakhlini",
      dueToday: "Adyes",
      upcoming: "Avutni",
      noFollowup: "Bi kontroleko",
      completed: "Kerdi",
      createdFrom: "Thodino katar",
      createdTo: "Thodino zhi ko",
      clearDates: "Kos le dyesa",
    },
  }[lang];

  const localizedStatusFilters = STATUS_FILTER_IDS.map((id) => ({
    id,
    label:
      id === "all"
        ? t.allPatients
        : id === "active"
        ? t.active
        : id === "inactive"
        ? t.inactive
        : t.archived,
  }));

  const localizedPriorityFilters = PRIORITY_FILTER_IDS.map((id) => ({
    id,
    label:
      id === "all"
        ? t.allPriorities
        : id === "critical"
        ? t.critical
        : id === "high"
        ? t.high
        : id === "moderate"
        ? t.moderate
        : t.low,
  }));

  const localizedUrgencyFilters = URGENCY_FILTER_IDS.map((id) => ({
    id,
    label:
      id === "all"
        ? t.allUrgency
        : id === "overdue"
        ? t.overdue
        : id === "today"
        ? t.dueToday
        : id === "upcoming"
        ? t.upcoming
        : id === "none"
        ? t.noFollowup
        : t.completed,
  }));

  const activeAdvancedCount =
    (activeStatusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (urgencyFilter !== "all" ? 1 : 0) +
    (createdFrom ? 1 : 0) +
    (createdTo ? 1 : 0);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      {/* Top search and actions row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--panel-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="min-h-11 w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] pl-10 pr-4 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            className={`crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] ${
              showFilters || activeAdvancedCount > 0
                ? "border-[var(--color-sapphire)] bg-[var(--panel-selection)] text-[var(--color-sapphire)] dark:border-[#bad7fa] dark:text-[#bad7fa]"
                : ""
            }`}
          >
            <FilterIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{copy.filters}</span>
            {activeAdvancedCount > 0 ? (
              <span className="tabular-nums [font-feature-settings:'zero'_0]">
                ({activeAdvancedCount})
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            disabled={exportDisabled}
            className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
          >
            {t.exportCsv}
          </button>

          <button
            type="button"
            onClick={onAddPatient}
            className="crm-button crm-primary whitespace-nowrap"
          >
            <UserIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{t.add}</span>
          </button>
        </div>
      </div>

      {/* Filters: one row of labelled fields, matching the inbox filters. */}
      {showFilters ? (
        <div className="grid grid-cols-1 items-end gap-3 border-t border-[var(--panel-line)] pt-4 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
          <label className="crm-label text-[var(--panel-ink)]">
            {t.careStatus}
            <select
              className="crm-input whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)]"
              value={activeStatusFilter}
              onChange={(e) => onChangeStatusFilter(e.target.value as typeof activeStatusFilter)}
            >
              {localizedStatusFilters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-label text-[var(--panel-ink)]">
            {t.priority}
            <select
              className="crm-input whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)]"
              value={priorityFilter}
              onChange={(e) => onChangePriorityFilter(e.target.value as typeof priorityFilter)}
            >
              {localizedPriorityFilters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-label text-[var(--panel-ink)]">
            {t.urgency}
            <select
              className="crm-input whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)]"
              value={urgencyFilter}
              onChange={(e) => onChangeUrgencyFilter(e.target.value as typeof urgencyFilter)}
            >
              {localizedUrgencyFilters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-label text-[var(--panel-ink)]">
            {t.createdFrom}
            <input
              type="date"
              className="crm-input border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] tabular-nums"
              value={createdFrom}
              onChange={(e) => onChangeCreatedFrom(e.target.value)}
            />
          </label>
          <label className="crm-label text-[var(--panel-ink)]">
            {t.createdTo}
            <input
              type="date"
              className="crm-input border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] tabular-nums"
              value={createdTo}
              onChange={(e) => onChangeCreatedTo(e.target.value)}
            />
          </label>
          {createdFrom || createdTo ? (
            <button
              type="button"
              className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)]"
              onClick={() => {
                onChangeCreatedFrom("");
                onChangeCreatedTo("");
              }}
            >
              {t.clearDates}
            </button>
          ) : null}
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[var(--panel-muted)]">{copy.activeFilters}</span>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold text-primary underline-offset-2 hover:underline dark:text-[#bad7fa]"
          >
            {copy.reset}
          </button>
        </div>
      ) : null}
    </div>
  );
}
