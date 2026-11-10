"use client";

import {
  DownloadIcon,
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
      search: "Search by name, email, phone or role",
      addWorker: "Add staff member",
      addMediator: "Add mediator",
      addMediatorTitle: "Add a mediator account",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh staff list",
      refreshing: "Refreshing...",
      refresh: "Refresh",
      staffStatus: "Status",
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
      staffStatus: "Status",
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
      staffStatus: "Statusi",
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
      staffStatus: "Stato",
      all: "Tutti gli operatori",
      active: "Attivi",
      inactive: "Inattivi",
    },
    hr: {
      search: "Pretraži po imenu, emailu, telefonu ili ulozi",
      addWorker: "Dodaj člana osoblja",
      addMediator: "Dodaj medijatora",
      addMediatorTitle: "Dodaj račun zdravstvenog medijatora",
      exportCsv: "Izvezi CSV",
      refreshTitle: "Osvježi popis osoblja",
      refreshing: "Osvježavanje...",
      refresh: "Osvježi",
      staffStatus: "Status",
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
      staffStatus: "Statuso",
      all: "Sasti ekipa",
      active: "Aktivne",
      inactive: "Bi-aktivne",
    },
  }[lang];

  const localizedStatusFilters = statusFilters.map((item) => ({
    ...item,
    label: item.id === "all" ? t.all : item.id === "active" ? t.active : t.inactive,
  }));

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="crm-input crm-input-auto !mt-0"
            aria-label={t.staffStatus}
            value={statusFilter}
            onChange={(e) => onChangeStatusFilter(e.target.value as WorkerStatus | "all")}
          >
            {localizedStatusFilters.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>

          <button type="button" onClick={onAddWorker} className="crm-button crm-primary">
            <StethoscopeIcon className="h-4 w-4" />
            <span>{t.addWorker}</span>
          </button>

          <button type="button" onClick={onAddMediator} title={t.addMediatorTitle} className="crm-button">
            <HandHelpingIcon className="h-4 w-4" />
            <span>{t.addMediator}</span>
          </button>

          <button type="button" onClick={onExportCSV} disabled={exportDisabled} aria-label={t.exportCsv} className="crm-button">
            <DownloadIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>

          {onRefresh ? (
            <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label={t.refreshTitle} title={t.refreshTitle} className="crm-button">
              <RefreshIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
