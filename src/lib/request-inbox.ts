import type { MedicalHelpRequestItem, RequestStatus } from "./types/medical-request";
export type RequestFolder = RequestStatus | "attention" | "all";
export type QueueCounts = Record<RequestFolder, number>;
export type InboxPage = { requests: MedicalHelpRequestItem[]; counts: QueueCounts; page: number; hasMore: boolean; total: number };
export const requestFolders: RequestFolder[] = ["attention", "all", "pending", "in_progress", "resolved", "archived"];
export function filterLocalInbox(requests: MedicalHelpRequestItem[], params = new URLSearchParams("folder=attention")): InboxPage {
  const options = inboxOptions(params);
  const counts: QueueCounts = { attention: 0, all: requests.length, pending: 0, in_progress: 0, resolved: 0, archived: 0 };
  for (const request of requests) { counts[request.status]++; if (request.status === "pending" || request.status === "in_progress") counts.attention++; }
  const filtered = requests.filter((r) =>
    (options.folder === "all" || options.folder === "attention" ? options.folder === "all" || ["pending", "in_progress"].includes(r.status) : r.status === options.folder)
    && (!options.id || r.id === options.id) && (!options.priority || r.priority === options.priority)
    && (!options.from || r.created_at.slice(0, 10) >= options.from) && (!options.to || r.created_at.slice(0, 10) <= options.to)
    && `${r.full_name} ${r.email} ${r.phone} ${r.description}`.toLowerCase().includes(options.search.toLowerCase()));
  const start = (options.page - 1) * options.limit;
  return { requests: filtered.slice(start, start + options.limit), counts, page: options.page, total: filtered.length, hasMore: start + options.limit < filtered.length };
}

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
