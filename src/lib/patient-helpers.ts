import { localDateKey, sortFollowups } from "./panel-dates";
import type { FollowupItem, PatientPriority } from "@/lib/types/patient";

export function getRecommendedFollowupDate(priority: PatientPriority = "moderate"): string {
  const d = new Date();
  switch (priority) {
    case "critical":
      d.setDate(d.getDate() + 1);
      break;
    case "high":
      d.setDate(d.getDate() + 3);
      break;
    case "moderate":
      d.setDate(d.getDate() + 7);
      break;
    case "low":
      d.setDate(d.getDate() + 14);
      break;
  }
  return localDateKey(d);
}

export function getPriorityMeta(priority: PatientPriority = "moderate") {
  switch (priority) {
    case "critical":
      return {
        label: "Critical Priority",
        shortLabel: "Critical",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
        recommendedDays: 1,
        dotClass: "bg-red-600",
      };
    case "high":
      return {
        label: "High Priority",
        shortLabel: "High",
        badgeClass: "bg-orange-100 text-orange-800 dark:bg-amber-500/10 dark:text-amber-400",
        recommendedDays: 3,
        dotClass: "bg-amber-500",
      };
    case "moderate":
      return {
        label: "Moderate Priority",
        shortLabel: "Moderate",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
        recommendedDays: 7,
        dotClass: "bg-blue-500",
      };
    case "low":
      return {
        label: "Low priority",
        shortLabel: "Low",
        badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        recommendedDays: 14,
        dotClass: "bg-slate-400",
      };
  }
}

export function getFollowupState(followups?: FollowupItem[] | null) {
  if (!followups || followups.length === 0) {
    return {
      state: "none" as const,
      label: "No follow-up scheduled",
      badgeClass: "bg-slate-100 text-slate-700 dark:bg-gray-500/10 dark:text-gray-400",
      latest: null,
    };
  }

  const scheduled = followups.filter((f) => f.status === "scheduled");

  if (scheduled.length === 0) {
    const latestCompleted = followups[0];
    return {
      state: "completed" as const,
      label: "Completed",
      badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      latest: latestCompleted,
    };
  }

  const nextUp = sortFollowups(scheduled)[0];

  const todayStr = localDateKey();
  const targetDateStr = nextUp.date.slice(0, 10);

  if (targetDateStr < todayStr) {
    return {
      state: "overdue" as const,
      label: "Overdue",
      badgeClass: "bg-red-50 text-red-800 font-semibold dark:bg-red-500/10 dark:text-red-300",
      latest: nextUp,
    };
  }

  if (targetDateStr === todayStr) {
    return {
      state: "today" as const,
      label: "Due today",
      badgeClass: "bg-amber-500 text-white font-bold",
      latest: nextUp,
    };
  }

  return {
    state: "upcoming" as const,
    label: "Upcoming",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 font-semibold",
    latest: nextUp,
  };
}
