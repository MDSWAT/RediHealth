import { getControlDatabase, hasControlDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { isSupportedCountry, type CountryCode } from "@/lib/countries";
import { isSupportedLang } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  computeFeedbackSummary,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  normalizeAgeGroup,
  type FeedbackGender,
  type FeedbackMaritalStatus,
  type PlatformFeedbackItem,
  type PlatformFeedbackSummary,
  type ValidatedFeedbackSubmission,
} from "@/lib/platform-feedback-shared";

export * from "@/lib/platform-feedback-shared";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS platform_feedback (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  country_code CHAR(2) NOT NULL DEFAULT 'RO',
  lang VARCHAR(8) NOT NULL DEFAULT 'ro',
  page_path VARCHAR(255) NULL,
  rating_usefulness TINYINT UNSIGNED NOT NULL,
  rating_ease_of_use TINYINT UNSIGNED NOT NULL,
  rating_visual_design TINYINT UNSIGNED NOT NULL,
  rating_content_clarity TINYINT UNSIGNED NOT NULL,
  rating_future_use TINYINT UNSIGNED NOT NULL,
  open_feedback TEXT NULL,
  gender VARCHAR(32) NULL,
  age_group VARCHAR(24) NULL,
  locality VARCHAR(120) NULL,
  occupation VARCHAR(120) NULL,
  marital_status VARCHAR(32) NULL,
  anonymized_redactions TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX platform_feedback_created_idx (created_at),
  INDEX platform_feedback_country_idx (country_code, created_at),
  INDEX platform_feedback_lang_idx (lang, created_at)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci
`;

let tableEnsured = false;

async function ensureFeedbackTable() {
  if (tableEnsured || !hasControlDatabase()) return;
  await getControlDatabase().query(CREATE_TABLE_SQL);
  tableEnsured = true;
}

type FeedbackRow = RowDataPacket & {
  id: number | string;
  country_code: string;
  lang: string;
  page_path: string | null;
  rating_usefulness: number;
  rating_ease_of_use: number;
  rating_visual_design: number;
  rating_content_clarity: number;
  rating_future_use: number;
  open_feedback: string | null;
  gender: string | null;
  age_group: string | null;
  locality: string | null;
  occupation: string | null;
  marital_status: string | null;
  anonymized_redactions: number;
  created_at: Date | string;
};

function rowToItem(row: FeedbackRow): PlatformFeedbackItem {
  const r1 = Number(row.rating_usefulness) || 0;
  const r2 = Number(row.rating_ease_of_use) || 0;
  const r3 = Number(row.rating_visual_design) || 0;
  const r4 = Number(row.rating_content_clarity) || 0;
  const r5 = Number(row.rating_future_use) || 0;
  const avg = Number(((r1 + r2 + r3 + r4 + r5) / 5).toFixed(2));
  const cc = String(row.country_code || "RO").toUpperCase();
  const lg = String(row.lang || "ro").toLowerCase();

  return {
    id: String(row.id),
    country_code: isSupportedCountry(cc) ? cc : "RO",
    lang: isSupportedLang(lg) ? lg : "ro",
    page_path: row.page_path || null,
    rating_usefulness: r1,
    rating_ease_of_use: r2,
    rating_visual_design: r3,
    rating_content_clarity: r4,
    rating_future_use: r5,
    average_rating: avg,
    open_feedback: row.open_feedback || null,
    gender: row.gender && (GENDER_OPTIONS as readonly string[]).includes(row.gender) ? (row.gender as FeedbackGender) : null,
    age_group: normalizeAgeGroup(row.age_group),
    locality: row.locality || null,
    occupation: row.occupation || null,
    marital_status:
      row.marital_status && (MARITAL_STATUS_OPTIONS as readonly string[]).includes(row.marital_status)
        ? (row.marital_status as FeedbackMaritalStatus)
        : null,
    anonymized_redactions: Number(row.anonymized_redactions) || 0,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function insertPlatformFeedback(submission: ValidatedFeedbackSubmission): Promise<string> {
  await ensureFeedbackTable();
  const [result] = await getControlDatabase().query<ResultSetHeader>(
    `INSERT INTO platform_feedback (
      country_code, lang, page_path,
      rating_usefulness, rating_ease_of_use, rating_visual_design, rating_content_clarity, rating_future_use,
      open_feedback, gender, age_group, locality, occupation, marital_status, anonymized_redactions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      submission.country_code,
      submission.lang,
      submission.page_path,
      submission.rating_usefulness,
      submission.rating_ease_of_use,
      submission.rating_visual_design,
      submission.rating_content_clarity,
      submission.rating_future_use,
      submission.open_feedback,
      submission.gender,
      submission.age_group,
      submission.locality,
      submission.occupation,
      submission.marital_status,
      submission.anonymized_redactions,
    ],
  );
  return String(result.insertId);
}

export async function listPlatformFeedback(options?: {
  country?: CountryCode | "";
  lang?: Lang | "";
  limit?: number;
}): Promise<{ items: PlatformFeedbackItem[]; summary: PlatformFeedbackSummary }> {
  await ensureFeedbackTable();
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (options?.country) {
    clauses.push("country_code = ?");
    params.push(options.country);
  }
  if (options?.lang) {
    clauses.push("lang = ?");
    params.push(options.lang);
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = Math.min(500, Math.max(1, options?.limit ?? 250));

  const [rows] = await getControlDatabase().query<FeedbackRow[]>(
    `SELECT id, country_code, lang, page_path,
            rating_usefulness, rating_ease_of_use, rating_visual_design, rating_content_clarity, rating_future_use,
            open_feedback, gender, age_group, locality, occupation, marital_status, anonymized_redactions, created_at
     FROM platform_feedback
     ${whereSql}
     ORDER BY created_at DESC, id DESC
     LIMIT ?`,
    [...params, limit],
  );

  const items = rows.map(rowToItem);
  return {
    items,
    summary: computeFeedbackSummary(items),
  };
}

export async function deletePlatformFeedback(id: string): Promise<boolean> {
  const numericId = Number.parseInt(id, 10);
  if (!Number.isFinite(numericId) || numericId <= 0) return false;
  await ensureFeedbackTable();
  const [result] = await getControlDatabase().query<ResultSetHeader>(
    "DELETE FROM platform_feedback WHERE id = ? LIMIT 1",
    [numericId],
  );
  return result.affectedRows > 0;
}
