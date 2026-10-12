import type { MedicalHelpRequestItem, RequestStatus } from "./types/medical-request";
export type RequestFolder = RequestStatus | "attention" | "all";
export type QueueCounts = Record<RequestFolder, number>;
export type InboxPage = { requests: MedicalHelpRequestItem[]; counts: QueueCounts; page: number; hasMore: boolean; total: number };
export const requestFolders: RequestFolder[] = ["attention", "all", "pending", "in_progress", "resolved", "archived"];
export function inboxOptions(params: URLSearchParams) {
  const rawFolder = params.get("folder") || params.get("status") || "all";
  return {
    folder: (requestFolders.includes(rawFolder as RequestFolder) ? rawFolder : "all") as RequestFolder,
    search: (params.get("q") || params.get("search") || "").trim().slice(0, 200),
    priority: params.get("priority") === "urgent" ? "urgent" : "",
    from: /^\d{4}-\d{2}-\d{2}$/.test(params.get("from") || "") ? params.get("from")! : "",
    to: /^\d{4}-\d{2}-\d{2}$/.test(params.get("to") || "") ? params.get("to")! : "",
    id: /^\d+$/.test(params.get("id") || "") ? params.get("id")! : "",
    page: Math.max(1, Math.min(100_000, Math.trunc(Number(params.get("page")) || 1))),
    limit: Math.max(1, Math.min(100, Math.trunc(Number(params.get("limit")) || 100))),
  };
}

