"use client";

import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import type { DashboardMetrics, RequestStatus } from "@/lib/types/medical-request";

interface DashboardOverviewProps {
  metrics: DashboardMetrics;
  activeStatusFilter: RequestStatus | "all";
  onSelectStatusFilter: (status: RequestStatus | "all") => void;
}

export function DashboardOverview({
  metrics,
  activeStatusFilter,
  onSelectStatusFilter,
}: DashboardOverviewProps) {
  const cards = [
    {
      id: "all",
      label: "Total Requests",
      count: metrics.total,
      icon: FileTextIcon,
      bgColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      borderColor: activeStatusFilter === "all" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-border",
    },
    {
      id: "pending",
      label: "Pending Action",
      count: metrics.pending,
      icon: ClockIcon,
      bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      borderColor: activeStatusFilter === "pending" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border",
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: metrics.inProgress,
      icon: AlertCircleIcon,
      bgColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      borderColor: activeStatusFilter === "in_progress" ? "border-purple-500 ring-2 ring-purple-500/20" : "border-border",
    },
    {
      id: "resolved",
      label: "Resolved",
      count: metrics.resolved,
      icon: CheckCircleIcon,
      bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      borderColor: activeStatusFilter === "resolved" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border",
    },
    {
      id: "today",
      label: "Received Today",
      count: metrics.todayCount,
      icon: ShieldIcon,
      bgColor: "bg-primary-soft text-primary",
      borderColor: "border-border",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = card.id !== "today";

        return (
          <button
            key={card.id}
            type="button"
            disabled={!isClickable}
            onClick={() => {
              if (isClickable) {
                onSelectStatusFilter(card.id as RequestStatus | "all");
              }
            }}
            className={`flex flex-col justify-between rounded-xl border bg-card p-5 text-left transition-all ${
              card.borderColor
            } ${
              isClickable ? "hover:border-primary cursor-pointer" : "cursor-default"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                <Icon className="h-5 w-5" />
              </span>
              {card.id === activeStatusFilter ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Active
                </span>
              ) : null}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {card.count}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {card.label}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
