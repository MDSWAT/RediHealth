export type WorkerStatus = "active" | "inactive";

export type WorkerItem = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  department?: string | null;
  status: WorkerStatus;
  assigned_patients_count?: number;
  created_at: string;
  updated_at?: string;
};

export type CreateWorkerPayload = {
  id?: string | number;
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  status?: WorkerStatus;
};
