"use client";

import {
  DownloadIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale } from "@/lib/i18n/panel-translations";
import type { WorkerStatus } from "@/lib/types/worker";

interface WorkersFilterBarProps {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  statusFilter: WorkerStatus | "all";
  onChangeStatusFilter: (value: WorkerStatus | "all") => void;
  counts?: { all: number; active: number; inactive: number };
  onAddWorker: () => void;
  onAddMediator: () => void;
  onExportCSV: () => void;
  exportDisabled: boolean;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const STATUS_IDS = ["all", "active", "inactive"] as const;

export function WorkersFilterBar({
  searchQuery,
  onChangeSearchQuery,
  statusFilter,
  onChangeStatusFilter,
  counts,
  onAddWorker,
  onAddMediator,
  onExportCSV,
  exportDisabled,
  onRefresh,
  isRefreshing = false,
}: WorkersFilterBarProps) {
  const { lang } = useLanguage();
  const locale = langToLocale[lang];
  const t = {
    ru: {
      search: "Поиск по имени, почте, телефону или роли",
      addWorker: "Добавить сотрудника",
      addMediator: "Добавить медиатора",
      addMediatorTitle: "Добавить аккаунт медиатора",
      exportCsv: "Экспорт CSV",
      refreshTitle: "Обновить список сотрудников",
      refreshing: "Обновление...",
      refresh: "Обновить",
      staffStatus: "Статус персонала",
      all: "Весь персонал",
      active: "Активные",
      inactive: "Неактивные",
    },
    en: {
      search: "Search by name, email, phone or role",
      addWorker: "Add staff member",
      addMediator: "Add mediator",
      addMediatorTitle: "Add a mediator account",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh staff list",
      refreshing: "Refreshing...",
      refresh: "Refresh",
      staffStatus: "Staff status",
      all: "All staff",
      active: "Active",
      inactive: "Inactive",
    },
    ro: {
      search: "Caută după nume, email, telefon sau rol",
      addWorker: "Adaugă în personal",
      addMediator: "Adaugă mediator",
      addMediatorTitle: "Adaugă un cont de mediator",
      exportCsv: "Exportă CSV",
      refreshTitle: "Actualizează lista personalului",
      refreshing: "Se actualizează...",
      refresh: "Actualizează",
      staffStatus: "Status personal",
      all: "Tot personalul",
      active: "Activ",
      inactive: "Inactiv",
    },
    sq: {
      search: "Kërko sipas emrit, emailit, telefonit ose rolit",
      addWorker: "Shto punonjës",
      addMediator: "Shto mediator",
      addMediatorTitle: "Shto një llogari mediatori",
      exportCsv: "Eksporto CSV",
      refreshTitle: "Rifresko listën e stafit",
      refreshing: "Duke rifreskuar...",
      refresh: "Rifresko",
      staffStatus: "Statusi i stafit",
      all: "I gjithë stafi",
      active: "Aktiv",
      inactive: "Joaktiv",
    },
    it: {
      search: "Cerca per nome, email, telefono o ruolo",
      addWorker: "Aggiungi operatore",
      addMediator: "Aggiungi mediatore",
      addMediatorTitle: "Aggiungi un account mediatore",
      exportCsv: "Esporta CSV",
      refreshTitle: "Aggiorna elenco operatori",
      refreshing: "Aggiornamento...",
      refresh: "Aggiorna",
      staffStatus: "Stato operatori",
      all: "Tutti gli operatori",
      active: "Attivi",
      inactive: "Inattivi",
    },
    hr: {
      search: "Pretraži po imenu, emailu, telefonu ili ulozi",
      addWorker: "Dodaj osoblje",
      addMediator: "Dodaj medijatora",
      addMediatorTitle: "Dodaj račun zdravstvenog medijatora",
      exportCsv: "Izvezi CSV",
      refreshTitle: "Osvježi popis osoblja",
      refreshing: "Osvježavanje...",
      refresh: "Osvježi",
      staffStatus: "Status osoblja",
      all: "Svo osoblje",
      active: "Aktivni",
      inactive: "Neaktivni",
    },
    rom: {
      search: "Rode pala anav, email, telefono vay rolo",
      addWorker: "Tho and-i ekipa",
      addMediator: "Tho mediatori",
      addMediatorTitle: "Tho ekh konto sastipnaske mediatoresko",
      exportCsv: "Inkal CSV",
      refreshTitle: "Nevyar i lista e ekipaki",
      refreshing: "Nevyarel...",
      refresh: "Nevyar",
      staffStatus: "Statuso e ekipako",
      all: "Sasti ekipa",
      active: "Aktivne",
      inactive: "Bi-aktivne",
    },
  }[lang];

  const statusTabs = STATUS_IDS.map((id) => ({
    id,
    label: id === "all" ? t.all : id === "active" ? t.active : t.inactive,
    count: counts ? counts[id] : undefined,
  }));

  const outlineBtn =
    "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] sm:px-3.5";

  return (
    <div className="pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-11 min-w-0 flex-1 basis-64 items-center gap-2 rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3 text-[var(--panel-muted)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-sapphire)] dark:focus-within:outline-[#bad7fa]">
          <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            aria-label={t.search}
            placeholder={t.search}
            className="min-h-11 w-full min-w-0 bg-transparent text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] outline-none"
          />
        </label>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAddWorker}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--color-sapphire)] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#28476f] sm:gap-2 sm:px-4"
            >
              <PlusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t.addWorker}</span>
            </button>

            <button
              type="button"
              onClick={onAddMediator}
              title={t.addMediatorTitle}
              className={outlineBtn}
            >
              <span>{t.addMediator}</span>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onExportCSV}
              disabled={exportDisabled}
              aria-label={t.exportCsv}
              className={outlineBtn}
            >
              <DownloadIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t.exportCsv}</span>
            </button>

            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label={isRefreshing ? t.refreshing : t.refreshTitle}
                title={t.refreshTitle}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] sm:h-11 sm:w-11 sm:min-w-11 sm:px-0"
              >
                <RefreshIcon
                  className={`h-4 w-4 shrink-0 ${isRefreshing ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                <span className="sm:hidden">{isRefreshing ? t.refreshing : t.refresh}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div
        role="group"
        aria-label={t.staffStatus}
        className="mt-3 flex flex-nowrap gap-6 overflow-x-auto border-b border-[var(--panel-line)]"
      >
        {statusTabs.map((item) => {
          const active = statusFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChangeStatusFilter(item.id)}
              className={`relative inline-flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap py-3 text-sm transition-colors ${
                active
                  ? "font-semibold text-[var(--color-sapphire)] dark:text-[#bad7fa]"
                  : "font-medium text-[var(--panel-muted)] hover:text-[var(--panel-ink)]"
              }`}
            >
              <span>{item.label}</span>
              {typeof item.count === "number" ? (
                <span className="font-display text-xs font-medium tabular-nums text-[var(--panel-muted)]">
                  {item.count.toLocaleString(locale)}
                </span>
              ) : null}
              {active ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-sapphire)] dark:bg-[#bad7fa]"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
