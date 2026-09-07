import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { sendMeetingInvitationEmail } from "@/lib/email";
import type { FollowupItem } from "@/lib/types/patient";
import { getUserWorkerContext } from "@/lib/worker-auth";

type MeetingRow = RowDataPacket & {
  id: number;
  title: string;
  meeting_url: string;
  transcript: string | null;
  notes: string | null;
  patient_id: number | null;
  followup_id: string | null;
  created_at: string;
  updated_at: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveMeetingDomain() {
  const configured = text(process.env.JITSI_DOMAIN).replace(/^https?:\/\//i, "");
  const hostOnly = configured.split("/")[0];
  if (!hostOnly) return "meet.jit.si";
  // Prevent accidental use of short-lived provider hosts.
  if (hostOnly.includes("8x8.vc")) return "meet.jit.si";
  return hostOnly;
}

function parseFollowups(value: unknown): FollowupItem[] {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed as FollowupItem[] : [];
  } catch {
    return [];
  }
}

async function requireWorker() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.workerId) {
    return { error: NextResponse.json({ error: "Staff access is required." }, { status: 403 }) };
  }

  return { worker };
}

export async function GET(request: Request) {
  const access = await requireWorker();
  if ("error" in access) return access.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "A meeting ID is required." }, { status: 400 });
  }

  try {
    const query = access.worker.isAdmin
      ? "SELECT id, title, meeting_url, transcript, notes, patient_id, followup_id, created_at, updated_at FROM meetings WHERE id = ? LIMIT 1"
      : "SELECT id, title, meeting_url, transcript, notes, patient_id, followup_id, created_at, updated_at FROM meetings WHERE id = ? AND organizer_worker_id = ? LIMIT 1";
    const params = access.worker.isAdmin ? [id] : [id, access.worker.workerId];
    const [rows] = await getDatabase().query<MeetingRow[]>(query, params);
    if (!rows[0]) {
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }
    return NextResponse.json({ meeting: rows[0] });
  } catch (error) {
    console.error("Failed to fetch meetings", error);
    return NextResponse.json({ error: "Could not load meetings. Apply migration 009." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const access = await requireWorker();
  if ("error" in access) return access.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid meeting data." }, { status: 400 });
  }

  const title = text(body.title);
  const patientId = text(body.patientId);
  const followupId = text(body.followupId);
  const transcript = text(body.transcript);
  const notes = text(body.notes);
  if (!title || title.length > 200) {
    return NextResponse.json({ error: "Enter a meeting title." }, { status: 400 });
  }
  if (patientId && !/^\d+$/.test(patientId)) {
    return NextResponse.json({ error: "Invalid patient selection." }, { status: 400 });
  }
  if (followupId && (!patientId || followupId.length > 64)) {
    return NextResponse.json({ error: "Invalid follow-up meeting details." }, { status: 400 });
  }
  if (transcript.length > 100_000 || notes.length > 4_000) {
    return NextResponse.json({ error: "Transcript or notes are too long." }, { status: 400 });
  }
  const meetingUrl = `https://${resolveMeetingDomain()}/redihealth-${randomUUID()}`;

  try {
    let patientEmail = "";
    let patientName = "";

    if (patientId) {
      const patientQuery = access.worker.isAdmin
        ? "SELECT id, full_name, email FROM patients WHERE id = ? LIMIT 1"
        : "SELECT id, full_name, email FROM patients WHERE id = ? AND (assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(assigned_worker_ids, '[]'), '[', ''), ']', ''), '\"', '')) > 0) LIMIT 1";
      const patientParams = access.worker.isAdmin
        ? [patientId]
        : [patientId, access.worker.workerId, access.worker.workerId];
      const [patientRows] = await getDatabase().query<RowDataPacket[]>(patientQuery, patientParams);
      if (!patientRows[0]) {
        return NextResponse.json({ error: "Patient not found or not assigned to you." }, { status: 404 });
      }

      patientEmail = text(patientRows[0].email);
      patientName = text(patientRows[0].full_name);
    }

    const [result] = await getDatabase().query<ResultSetHeader>(
      "INSERT INTO meetings (organizer_worker_id, patient_id, followup_id, title, meeting_url, transcript, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [access.worker.workerId, patientId || null, followupId || null, title, meetingUrl, transcript || null, notes || null],
    );

    let emailSent: boolean | undefined;
    if (patientId && patientEmail) {
      emailSent = await sendMeetingInvitationEmail({
        name: patientName || "Patient",
        email: patientEmail,
        title,
        meetingUrl,
      });
    }

    return NextResponse.json(
      {
        id: String(result.insertId),
        meetingUrl,
        email_sent: emailSent,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create meeting", error);
    return NextResponse.json({ error: "Could not save meeting. Apply migration 009." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireWorker();
  if ("error" in access) return access.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid transcript data." }, { status: 400 });
  }

  const idValue = body.id;
  const id = typeof idValue === "number" && Number.isFinite(idValue) ? String(idValue) : text(idValue);
  const transcript = text(body.transcript);
  const notes = text(body.notes);
  if (!id || !/^\d+$/.test(id) || transcript.length > 100_000 || notes.length > 4_000) {
    return NextResponse.json({ error: "Invalid meeting record data." }, { status: 400 });
  }

  const db = getDatabase();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const meetingQuery = access.worker.isAdmin
      ? "SELECT patient_id, followup_id FROM meetings WHERE id = ? FOR UPDATE"
      : "SELECT patient_id, followup_id FROM meetings WHERE id = ? AND organizer_worker_id = ? FOR UPDATE";
    const meetingParams = access.worker.isAdmin ? [id] : [id, access.worker.workerId];
    const [meetingRows] = await connection.query<MeetingRow[]>(meetingQuery, meetingParams);
    const meeting = meetingRows[0];
    if (!meeting) {
      await connection.rollback();
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    const query = access.worker.isAdmin
      ? "UPDATE meetings SET transcript = ?, notes = ? WHERE id = ?"
      : "UPDATE meetings SET transcript = ?, notes = ? WHERE id = ? AND organizer_worker_id = ?";
    const params = access.worker.isAdmin
      ? [transcript || null, notes || null, id]
      : [transcript || null, notes || null, id, access.worker.workerId];
    const [result] = await connection.query<ResultSetHeader>(query, params);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    if (meeting.patient_id && meeting.followup_id) {
      const [patientRows] = await connection.query<(RowDataPacket & { followups: string | null })[]>(
        "SELECT followups FROM patients WHERE id = ? FOR UPDATE",
        [meeting.patient_id],
      );
      const followups = parseFollowups(patientRows[0]?.followups);
      const followupIndex = followups.findIndex((followup) => followup.id === meeting.followup_id);
      if (followupIndex < 0) {
        await connection.rollback();
        return NextResponse.json({ error: "Linked follow-up not found." }, { status: 404 });
      }
      followups[followupIndex] = {
        ...followups[followupIndex],
        meeting_transcript: transcript || undefined,
        meeting_notes: notes || undefined,
      };
      await connection.query<ResultSetHeader>("UPDATE patients SET followups = ? WHERE id = ?", [JSON.stringify(followups), meeting.patient_id]);
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Failed to save meeting transcript", error);
    return NextResponse.json({ error: "Could not save transcript." }, { status: 503 });
  } finally {
    connection.release();
  }
}

export async function DELETE(request: Request) {
  const access = await requireWorker();
  if ("error" in access) return access.error;

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid meeting." }, { status: 400 });
  }

  const connection = await getDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const meetingQuery = access.worker.isAdmin
      ? "SELECT patient_id, followup_id FROM meetings WHERE id = ? FOR UPDATE"
      : "SELECT patient_id, followup_id FROM meetings WHERE id = ? AND organizer_worker_id = ? FOR UPDATE";
    const meetingParams = access.worker.isAdmin ? [id] : [id, access.worker.workerId];
    const [meetingRows] = await connection.query<MeetingRow[]>(meetingQuery, meetingParams);
    const meeting = meetingRows[0];
    if (!meeting) {
      await connection.rollback();
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    if (meeting.patient_id && meeting.followup_id) {
      const [patientRows] = await connection.query<(RowDataPacket & { followups: string | null })[]>(
        "SELECT followups FROM patients WHERE id = ? FOR UPDATE",
        [meeting.patient_id],
      );
      const followups = parseFollowups(patientRows[0]?.followups);
      const followupIndex = followups.findIndex((followup) => followup.id === meeting.followup_id);
      if (followupIndex < 0) {
        await connection.rollback();
        return NextResponse.json({ error: "Linked follow-up not found." }, { status: 404 });
      }
      const followup = { ...followups[followupIndex] };
      delete followup.meeting_id;
      delete followup.meeting_url;
      delete followup.meeting_transcript;
      delete followup.meeting_notes;
      followups[followupIndex] = followup;
      await connection.query<ResultSetHeader>("UPDATE patients SET followups = ? WHERE id = ?", [JSON.stringify(followups), meeting.patient_id]);
    }

    await connection.query<ResultSetHeader>("DELETE FROM meetings WHERE id = ?", [id]);
    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Failed to delete meeting", error);
    return NextResponse.json({ error: "Could not delete meeting history." }, { status: 503 });
  } finally {
    connection.release();
  }
}