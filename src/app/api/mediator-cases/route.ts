import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { auth } from "@/auth";
import { getDatabase } from "@/lib/database";
import { getUserWorkerContext } from "@/lib/worker-auth";

const validUrgencies = ["low", "moderate", "high", "urgent"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const worker = await getUserWorkerContext(userEmail);
  const role = worker.role.trim().toLowerCase();
  if (!worker.workerId || (role !== "mediator" && !worker.isAdmin)) {
    return NextResponse.json({ error: "Mediator or administrator access is required." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid case data." }, { status: 400 });
  }

  const county = text(body.county);
  const fullName = text(body.fullName);
  const phone = text(body.phone);
  const address = text(body.address);
  const email = text(body.email).toLowerCase();
  const careCategory = text(body.careCategory);
  const urgency = text(body.urgency);
  const targetDate = text(body.targetDate);
  const notes = text(body.notes);
  const barriers = Array.isArray(body.barriers)
    ? body.barriers.filter((barrier): barrier is string => typeof barrier === "string" && barrier.length <= 100)
    : [];

  if (
    !county ||
    !fullName ||
    !phone ||
    !emailPattern.test(email) ||
    !careCategory ||
    !validUrgencies.includes(urgency)
  ) {
    return NextResponse.json({ error: "Complete the required case details, including phone and email." }, { status: 400 });
  }

  if (
    county.length > 100 ||
    fullName.length > 200 ||
    phone.length > 50 ||
    address.length > 500 ||
    email.length > 320 ||
    careCategory.length > 100 ||
    notes.length > 4_000
  ) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }

  if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return NextResponse.json({ error: "Enter a valid target date." }, { status: 400 });
  }

  const priorityByUrgency = {
    low: "low",
    moderate: "moderate",
    high: "high",
    urgent: "critical",
  } as const;
  const conditionNotes = [
    `Mediator case: ${careCategory}`,
    `Urgency: ${urgency}`,
    `County: ${county}`,
    `Barriers: ${barriers.length ? barriers.join(", ") : "None identified"}`,
    targetDate ? `Target date: ${targetDate}` : "",
    notes ? `Notes: ${notes}` : "",
  ].filter(Boolean).join("\n");

  const db = getDatabase();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [caseResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO mediator_cases
        (mediator_worker_id, county, full_name, phone, address, care_category, urgency, barriers, target_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [worker.workerId, county, fullName, phone || null, address || null, careCategory, urgency, JSON.stringify(barriers), targetDate || null, notes || null],
    );

    const [patientResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO patients
        (assigned_worker_id, full_name, phone, email, address, condition_notes, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [worker.workerId, fullName, phone, email, address || null, conditionNotes, priorityByUrgency[urgency as keyof typeof priorityByUrgency]],
    );
    await connection.commit();
    return NextResponse.json(
      { success: true, id: String(caseResult.insertId), patientId: String(patientResult.insertId) },
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback();
    console.error("Failed to create mediator case", error);
    const databaseError = error as { code?: string };
    const schemaError =
      databaseError.code === "ER_NO_SUCH_TABLE" ||
      databaseError.code === "ER_BAD_FIELD_ERROR";
    return NextResponse.json(
      {
        error: schemaError
          ? "The mediator case database table is not ready. Apply migration 008, including the phone and address columns."
          : "Could not save the case. Please try again.",
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}