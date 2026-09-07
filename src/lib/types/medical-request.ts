export type RequestStatus = "pending" | "in_progress" | "resolved" | "archived";
export type RequestPriority = "normal" | "urgent";

export type MedicalHelpRequestItem = {
  id: string;
  full_name: string | null;
  phone: string;
  email: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  internal_notes: string | null;
  status_updated_by_name?: string | null;
  status_updated_by_email?: string | null;
  status_updated_at?: string;
  created_at: string;
  updated_at?: string;
};

export type DashboardMetrics = {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  todayCount: number;
};
