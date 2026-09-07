export type PatientStatus = "active" | "inactive" | "archived";
export type PatientPriority = "critical" | "high" | "moderate" | "low";

export type FollowupItem = {
  id: string;
  title: string;
  date: string;
  notes?: string;
  completion_notes?: string;
  completion_photos?: PatientPhoto[];
  completed_at?: string;
  status: "scheduled" | "completed" | "cancelled";
  reminder_set?: boolean;
  meeting_id?: string;
  meeting_url?: string;
  meeting_transcript?: string;
  meeting_notes?: string;
};

export type PatientPhoto = {
  id: string;
  name: string;
  data_url: string;
  date: string;
  notes?: string;
};

export type TreatmentPlan = {
  diagnosis?: string;
  goals?: string;
  medications?: string;
  care_instructions?: string;
  photos?: PatientPhoto[];
};

export type PatientItem = {
  id: string;
  request_id?: string | null;
  assigned_worker_id?: string | null;
  assigned_worker_ids?: string[];
  assigned_worker_name?: string | null;
  assigned_worker_names?: string[];
  access_token?: string | null;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  condition_notes?: string | null;
  medical_history?: string | null;
  treatment_plan?: TreatmentPlan | null;
  followups?: FollowupItem[] | null;
  photos?: PatientPhoto[] | null;
  status: PatientStatus;
  priority: PatientPriority;
  created_at: string;
  updated_at?: string;
};

export type CreatePatientPayload = {
  id?: string | number;
  request_id?: string | number | null;
  assigned_worker_id?: string | number | null;
  assigned_worker_ids?: Array<string | number>;
  access_token?: string | null;
  full_name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  condition_notes?: string;
  medical_history?: string;
  treatment_plan?: TreatmentPlan | string;
  followups?: FollowupItem[] | string;
  photos?: PatientPhoto[] | string;
  status?: PatientStatus;
  priority?: PatientPriority;
};
