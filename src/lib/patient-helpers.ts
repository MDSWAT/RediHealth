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
  return d.toISOString().slice(0, 10);
}

export function getPriorityMeta(priority: PatientPriority = "moderate") {
  switch (priority) {
    case "critical":
      return {
        label: "Critical Priority",
        shortLabel: "Critical",
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
        recommendedDays: 1,
        dotClass: "bg-red-500 animate-pulse",
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
        label: "Low Priority",
        shortLabel: "Low",
        badgeClass: "bg-slate-100 text-slate-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        recommendedDays: 14,
        dotClass: "bg-emerald-500",
      };
  }
}

export function getFollowupState(followups?: FollowupItem[] | null) {
  if (!followups || followups.length === 0) {
    return {
      state: "none" as const,
      label: "No Follow-up Scheduled",
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
      badgeClass: "bg-emerald-100 text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-400",
      latest: latestCompleted,
    };
  }

  scheduled.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextUp = scheduled[0];

  const todayStr = new Date().toISOString().slice(0, 10);
  const targetDateStr = nextUp.date.slice(0, 10);

  if (targetDateStr < todayStr) {
    return {
      state: "overdue" as const,
      label: "OVERDUE",
      badgeClass: "bg-red-600 text-white font-bold animate-pulse",
      latest: nextUp,
    };
  }

  if (targetDateStr === todayStr) {
    return {
      state: "today" as const,
      label: "DUE TODAY",
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
