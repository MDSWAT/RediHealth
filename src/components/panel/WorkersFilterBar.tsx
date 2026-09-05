"use client";

import {
  DownloadIcon,
  FilterIcon,
  HandHelpingIcon,
  RefreshIcon,
  SearchIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { WorkerStatus } from "@/lib/types/worker";

interface WorkersFilterBarProps {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  statusFilter: WorkerStatus | "all";
  onChangeStatusFilter: (value: WorkerStatus | "all") => void;
  onAddWorker: () => void;
  onAddMediator: () => void;
  onExportCSV: () => void;
  exportDisabled: boolean;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const statusFilters = [
  { id: "all", label: "All Staff" },
  { id: "active", label: "Active Staff" },
  { id: "inactive", label: "Inactive Staff" },
] as const;

export function WorkersFilterBar({
  searchQuery,
  onChangeSearchQuery,
  statusFilter,
  onChangeStatusFilter,
  onAddWorker,
  onAddMediator,
  onExportCSV,
  exportDisabled,
  onRefresh,
  isRefreshing = false,
}: WorkersFilterBarProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      search: "Search workers by name, email, phone, role...",
      addWorker: "Add Staff Worker",
      addMediator: "Add Mediator",
      addMediatorTitle: "Quick-create a mediator workspace",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh worker records",
      refreshing: "Refreshing...",
      refresh: "Refresh",
      staffStatus: "Staff Status",
      all: "All Staff",
      active: "Active Staff",
      inactive: "Inactive Staff",
    },
    ro: {
      search: "Cauta lucratori dupa nume, email, telefon, rol...",
      addWorker: "Adauga lucrator",
      addMediator: "Adauga mediator",
      addMediatorTitle: "Creeaza rapid un spatiu de lucru mediator",
      exportCsv: "Export CSV",
      refreshTitle: "Reimprospateaza dosarele lucratorilor",
      refreshing: "Se actualizeaza...",
      refresh: "Reimprospateaza",
      staffStatus: "Status personal",
      all: "Tot personalul",
      active: "Personal activ",
      inactive: "Personal inactiv",
    },
    sq: {
      search: "Kerko punonjes sipas emrit, emailit, telefonit, rolit...",
      addWorker: "Shto punonjes",
      addMediator: "Shto mediator",
      addMediatorTitle: "Krijo shpejt nje hapesire pune per mediator",
      exportCsv: "Eksporto CSV",
      refreshTitle: "Perditeso dosjet e punonjesve",
      refreshing: "Duke perditesuar...",
      refresh: "Perditeso",
      staffStatus: "Statusi i stafit",
      all: "I gjithe stafi",
      active: "Staf aktiv",
      inactive: "Staf joaktiv",
    },
    it: {
      search: "Cerca operatori per nome, email, telefono, ruolo...",
      addWorker: "Aggiungi operatore",
      addMediator: "Aggiungi mediatore",
      addMediatorTitle: "Crea rapidamente uno spazio di lavoro mediatore",
      exportCsv: "Esporta CSV",
      refreshTitle: "Aggiorna schede operatori",
      refreshing: "Aggiornamento...",
      refresh: "Aggiorna",
      staffStatus: "Stato staff",
      all: "Tutto lo staff",
      active: "Staff attivo",
      inactive: "Staff inattivo",
    },
  }[lang];

  const localizedStatusFilters = statusFilters.map((item) => ({
    ...item,
    label: item.id === "all" ? t.all : item.id === "active" ? t.active : t.inactive,
  }));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddWorker}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <StethoscopeIcon className="h-4 w-4" />
            <span>{t.addWorker}</span>
          </button>

          <button
            type="button"
            onClick={onAddMediator}
            title={t.addMediatorTitle}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <HandHelpingIcon className="h-4 w-4 text-primary" />
            <span>{t.addMediator}</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            disabled={exportDisabled}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            <DownloadIcon className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>

          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
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

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-muted-foreground font-semibold flex items-center gap-1 mr-1">
          <FilterIcon className="h-3.5 w-3.5" /> {t.staffStatus}:
        </span>

        {localizedStatusFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeStatusFilter(item.id)}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
              statusFilter === item.id
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
