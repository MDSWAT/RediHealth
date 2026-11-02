import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { getCountryDatabase, type ResultSetHeader } from "@/lib/database";
import { parseCountry } from "@/lib/countries";
import { findPatientByPortalToken } from "@/lib/data/portal";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { parseJsonColumn, stringifyJsonColumn } from "@/lib/json";
import {
  isPatientPriority,
  validateFollowupCompletionInput,
  validateFollowupInput,
  validatePhotoInput,
} from "@/lib/validation";
import type { FollowupItem, PatientPhoto } from "@/lib/types/patient";
import { PORTAL_TOKEN_PATTERN } from "@/lib/security/portal-token";
import { decryptField, encryptField } from "@/lib/security/field-encryption";

const MAX_CONDITION_NOTES_LENGTH = 4_000;

interface Params {
  params: Promise<{ token: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const token = (await params).token.trim();

  if (!PORTAL_TOKEN_PATTERN.test(token)) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  const rateLimit = await checkRateLimit(`patient-portal:patch:${token}:${getClientIp(request)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: {
    condition_notes?: unknown;
    priority?: unknown;
    new_followup?: unknown;
    new_photo?: unknown;
    complete_followup?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const lookup = await findPatientByPortalToken(token, parseCountry(new URL(request.url).searchParams.get("c")));
    if (lookup.status === "expired") {
      return NextResponse.json({ error: "This portal link has expired.", code: "link_expired" }, { status: 410 });
    }
    if (lookup.status === "not-found") {
      return NextResponse.json({ error: "Patient portal link not found." }, { status: 404 });
    }

    const patient = lookup.row;
    const patientId = patient.id;

    const updates: string[] = [];
    const updateParams: unknown[] = [];

    if (body.condition_notes !== undefined) {
      if (typeof body.condition_notes !== "string") {
        return NextResponse.json({ error: "Invalid symptom notes." }, { status: 400 });
      }
      const notes = body.condition_notes.trim();
      if (notes.length > MAX_CONDITION_NOTES_LENGTH) {
        return NextResponse.json({ error: "Symptom notes are too long." }, { status: 400 });
      }
      updates.push("condition_notes = ?");
      updateParams.push(notes);
    }

    if (body.priority !== undefined) {
      if (!isPatientPriority(body.priority)) {
        return NextResponse.json({ error: "Invalid priority value." }, { status: 400 });
      }
      updates.push("priority = ?");
      updateParams.push(body.priority);
    }

    if (body.new_followup !== undefined) {
      const result = validateFollowupInput(body.new_followup);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const existingFollowups =
        parseJsonColumn<FollowupItem[]>(patient.followups) || [];
      updates.push("followups = ?");
      updateParams.push(stringifyJsonColumn([result.value, ...existingFollowups]));
    }

    if (body.new_photo !== undefined) {
      const result = validatePhotoInput(body.new_photo);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const existingPhotos =
        parseJsonColumn<PatientPhoto[]>(decryptField(lookup.country, patient.photos)) || [];
      updates.push("photos = ?");
      updateParams.push(encryptField(lookup.country, stringifyJsonColumn([result.value, ...existingPhotos])));
    }

    if (body.complete_followup !== undefined) {
      const result = validateFollowupCompletionInput(body.complete_followup);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      const existingFollowups = parseJsonColumn<FollowupItem[]>(patient.followups) || [];
      const followupIndex = existingFollowups.findIndex(
        (item) => item.id === result.value.followup_id,
      );

      if (followupIndex < 0) {
        return NextResponse.json({ error: "Follow-up not found." }, { status: 404 });
      }

      const current = existingFollowups[followupIndex];
      const completionPhotos = result.value.completion_photos;
      const merged: FollowupItem = {
        ...current,
        status: "completed",
        completion_notes: result.value.completion_notes || current.completion_notes,
        completed_at: result.value.completed_at,
        completion_photos:
          completionPhotos.length > 0
            ? completionPhotos
            : current.completion_photos || [],
      };

      existingFollowups[followupIndex] = merged;
      updates.push("followups = ?");
      updateParams.push(stringifyJsonColumn(existingFollowups));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No update fields provided." }, { status: 400 });
    }

    updateParams.push(patientId);

    await getCountryDatabase(lookup.country).query<ResultSetHeader>(
      `UPDATE patients SET ${updates.join(", ")} WHERE id = ?`,
      updateParams,
    );

    const changedKeys = updates
      .map((entry) => entry.split("=")[0]?.trim())
      .filter(Boolean);

    await logActivity({
      country: lookup.country,
      actorName: patient.full_name,
      actorEmail: patient.email,
      actorRole: "patient_portal",
      action:
        body.complete_followup !== undefined
          ? "followup.completed_by_patient"
          : body.new_followup !== undefined
          ? "followup.created_by_patient"
          : "patient.portal_updated",
      entityType: "patient",
      entityId: patientId,
      details: {
        updated_fields: changedKeys,
        new_followup: body.new_followup !== undefined,
        complete_followup: body.complete_followup !== undefined,
        new_photo: body.new_photo !== undefined,
        priority: body.priority,
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update patient portal profile", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 503 });
  }
}
