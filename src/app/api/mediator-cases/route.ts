import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { getUserWorkerContext } from "@/lib/worker-auth";

const validUrgencies = ["low", "moderate", "high", "urgent"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Lang = "en" | "ro" | "sq" | "it";

const categoryKeys = ["Routine examination", "Dental care", "Vaccination", "General practitioner registration", "Specialist consultation", "Maternal care", "Child health", "Chronic condition management", "Mental health support", "Medication access", "Screening or tests", "Emergency referral", "Other"];
const barrierKeys = ["No GP / family doctor", "No insurance / unclear entitlement", "Missing documents", "Language barrier", "Digital literacy barrier", "Transport problem", "Childcare problem", "Mobility limitation", "Financial barrier", "Discrimination concern", "Fear or lack of trust", "Previous negative experience", "Missed appointment", "Unstable housing", "Cross-border mobility", "No phone or internet", "Difficulty understanding medication", "Other"];

const categoryLabels: Record<Lang, string[]> = {
  en: ["Routine examination", "Dental care", "Vaccination", "General practitioner registration", "Specialist consultation", "Maternal care", "Child health", "Chronic condition management", "Mental health support", "Medication access", "Screening or tests", "Emergency referral", "Other"],
  ro: ["Consult de rutina", "Ingrijire dentara", "Vaccinare", "Inscriere la medic de familie", "Consult de specialitate", "Ingrijire materna", "Sanatatea copilului", "Gestionare afectiuni cronice", "Suport sanatate mintala", "Acces la medicamente", "Screening sau analize", "Trimitere urgenta", "Altele"],
  sq: ["Kontroll rutine", "Kujdes dentar", "Vaksinim", "Regjistrim te mjeku i familjes", "Konsulte specialisti", "Kujdes maternal", "Shendeti i femijes", "Menaxhim i semundjeve kronike", "Mbeshteje per shendetin mendor", "Akses ne barna", "Skrining ose analiza", "Referim urgjent", "Tjeter"],
  it: ["Visita di routine", "Cure dentali", "Vaccinazione", "Registrazione medico di base", "Consulto specialistico", "Assistenza materna", "Salute del bambino", "Gestione malattie croniche", "Supporto salute mentale", "Accesso ai farmaci", "Screening o test", "Invio urgente", "Altro"],
};

const barrierLabels: Record<Lang, string[]> = {
  en: ["No GP / family doctor", "No insurance / unclear entitlement", "Missing documents", "Language barrier", "Digital literacy barrier", "Transport problem", "Childcare problem", "Mobility limitation", "Financial barrier", "Discrimination concern", "Fear or lack of trust", "Previous negative experience", "Missed appointment", "Unstable housing", "Cross-border mobility", "No phone or internet", "Difficulty understanding medication", "Other"],
  ro: ["Fara medic de familie", "Fara asigurare / drepturi neclare", "Documente lipsa", "Bariera lingvistica", "Bariera de alfabetizare digitala", "Problema de transport", "Problema de ingrijire copil", "Limitare de mobilitate", "Bariera financiara", "Risc de discriminare", "Teama sau lipsa de incredere", "Experienta negativa anterioara", "Programare ratata", "Locuire instabila", "Mobilitate transfrontaliera", "Fara telefon sau internet", "Dificultate in intelegerea tratamentului", "Altele"],
  sq: ["Pa mjek familjeje", "Pa sigurim / te drejta te paqarta", "Dokumente qe mungojne", "Barriere gjuhesore", "Barriere ne aftesi dixhitale", "Problem transporti", "Problem kujdesi per femijet", "Kufizim levizshmerie", "Barriere financiare", "Shqetesim diskriminimi", "Frike ose mungese besimi", "Eksperience e meparshme negative", "Takim i humbur", "Strehim i paqendrueshem", "Levizshmeri nderkufitare", "Pa telefon ose internet", "Veshtiresi ne kuptimin e mjekimit", "Tjeter"],
  it: ["Nessun medico di base", "Nessuna assicurazione / diritti non chiari", "Documenti mancanti", "Barriera linguistica", "Barriera alfabetizzazione digitale", "Problema di trasporto", "Problema assistenza bambini", "Limitazione mobilita", "Barriera economica", "Rischio discriminazione", "Paura o mancanza di fiducia", "Esperienza negativa precedente", "Appuntamento mancato", "Alloggio instabile", "Mobilita transfrontaliera", "Nessun telefono o internet", "Difficolta nel comprendere i farmaci", "Altro"],
};

const sectionLabels: Record<Lang, {
  caseLabel: string;
  urgencyLabel: string;
  countyLabel: string;
  dobLabel: string;
  addressLabel: string;
  barriersLabel: string;
  noBarriers: string;
  targetDateLabel: string;
  notesLabel: string;
}> = {
  en: { caseLabel: "Mediator case", urgencyLabel: "Urgency", countyLabel: "County", dobLabel: "Date of birth", addressLabel: "Address", barriersLabel: "Barriers", noBarriers: "None identified", targetDateLabel: "Target date", notesLabel: "Notes" },
  ro: { caseLabel: "Caz mediator", urgencyLabel: "Urgenta", countyLabel: "Judet", dobLabel: "Data nasterii", addressLabel: "Adresa", barriersLabel: "Bariere", noBarriers: "Fara bariere identificate", targetDateLabel: "Data tinta", notesLabel: "Notite" },
  sq: { caseLabel: "Rast i mediatorit", urgencyLabel: "Urgjenca", countyLabel: "Qarku", dobLabel: "Datelindja", addressLabel: "Adresa", barriersLabel: "Barrierat", noBarriers: "Nuk u identifikuan barriera", targetDateLabel: "Data e synuar", notesLabel: "Shenime" },
  it: { caseLabel: "Caso mediatore", urgencyLabel: "Urgenza", countyLabel: "Contea", dobLabel: "Data di nascita", addressLabel: "Indirizzo", barriersLabel: "Barriere", noBarriers: "Nessuna barriera identificata", targetDateLabel: "Data obiettivo", notesLabel: "Note" },
};

function normalizeLang(value: unknown): Lang {
  const lang = text(value).toLowerCase();
  if (lang === "ro" || lang === "sq" || lang === "it") return lang;
  return "en";
}

function mapCategory(category: string, lang: Lang) {
  const index = categoryKeys.indexOf(category);
  if (index < 0) return category;
  return categoryLabels[lang][index] || category;
}

function mapBarrier(barrier: string, lang: Lang) {
  const index = barrierKeys.indexOf(barrier);
  if (index < 0) return barrier;
  return barrierLabels[lang][index] || barrier;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isDuplicateEntryError(error: unknown): boolean {
  const dbError = error as { code?: string; errno?: number; sqlState?: string; message?: string };
  return (
    dbError.code === "ER_DUP_ENTRY"
    || dbError.errno === 1062
    || dbError.sqlState === "23000"
    || /duplicate entry/i.test(dbError.message || "")
  );
}

function parseWorkerIds(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter((item) => item.length > 0);
      }
    } catch {
      return [];
    }
  }
  return [];
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
  const dateOfBirth = text(body.dateOfBirth);
  const phone = text(body.phone);
  const address = text(body.address);
  const email = text(body.email).toLowerCase();
  const careCategory = text(body.careCategory);
  const urgency = text(body.urgency);
  const targetDate = text(body.targetDate);
  const notes = text(body.notes);
  const lang = normalizeLang(body.lang);
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
    dateOfBirth.length > 50 ||
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
  if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return NextResponse.json({ error: "Enter a valid date of birth." }, { status: 400 });
  }

  const priorityByUrgency = {
    low: "low",
    moderate: "moderate",
    high: "high",
    urgent: "critical",
  } as const;
  const localizedCategory = mapCategory(careCategory, lang);
  const localizedBarriers = barriers.map((barrier) => mapBarrier(barrier, lang));
  const labels = sectionLabels[lang];
  const conditionNotes = [
    `${labels.caseLabel}: ${localizedCategory}`,
    `${labels.urgencyLabel}: ${urgency}`,
    `${labels.countyLabel}: ${county}`,
    dateOfBirth ? `${labels.dobLabel}: ${dateOfBirth}` : "",
    address ? `${labels.addressLabel}: ${address}` : "",
    `${labels.barriersLabel}: ${localizedBarriers.length ? localizedBarriers.join(", ") : labels.noBarriers}`,
    targetDate ? `${labels.targetDateLabel}: ${targetDate}` : "",
    notes ? `${labels.notesLabel}: ${notes}` : "",
  ].filter(Boolean).join("\n");

  const db = getDatabase();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    type ExistingPatientRow = RowDataPacket & {
      id: number | string;
      full_name: string | null;
      phone: string | null;
      date_of_birth: string | null;
      address: string | null;
      condition_notes: string | null;
      assigned_worker_id: number | string | null;
      assigned_worker_ids: unknown;
    };

    const [existingPatientRows] = await connection.query<ExistingPatientRow[]>(
      `SELECT id, full_name, phone, date_of_birth, address, condition_notes, assigned_worker_id, assigned_worker_ids
       FROM patients
       WHERE LOWER(email) = ?
          OR (phone <> '' AND phone = ?)
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [email, phone],
    );

    const existingPatient = existingPatientRows[0] || null;
    const [caseResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO mediator_cases
        (mediator_worker_id, county, full_name, date_of_birth, phone, address, care_category, urgency, barriers, target_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [worker.workerId, county, fullName, dateOfBirth || null, phone || null, address || null, careCategory, urgency, JSON.stringify(barriers), targetDate || null, notes || null],
    );

    let patientId = "";

    if (existingPatient) {
      const existingWorkerIds = parseWorkerIds(existingPatient.assigned_worker_ids);
      if (existingPatient.assigned_worker_id != null) {
        existingWorkerIds.push(String(existingPatient.assigned_worker_id));
      }
      existingWorkerIds.push(String(worker.workerId));
      const uniqueWorkerIds = [...new Set(existingWorkerIds)];

      const mergedConditionNotes = [existingPatient.condition_notes || "", conditionNotes]
        .filter(Boolean)
        .join("\n\n---\n\n");

      await connection.query<ResultSetHeader>(
        `UPDATE patients
         SET full_name = ?,
             phone = ?,
             date_of_birth = ?,
             address = ?,
             condition_notes = ?,
             status = 'active',
             priority = ?,
             assigned_worker_id = COALESCE(assigned_worker_id, ?),
             assigned_worker_ids = ?
         WHERE id = ?`,
        [
          fullName || existingPatient.full_name,
          phone || existingPatient.phone,
          dateOfBirth || existingPatient.date_of_birth,
          address || existingPatient.address,
          mergedConditionNotes,
          priorityByUrgency[urgency as keyof typeof priorityByUrgency],
          worker.workerId,
          JSON.stringify(uniqueWorkerIds),
          existingPatient.id,
        ],
      );

      patientId = String(existingPatient.id);
    } else {
      const [patientResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO patients
          (assigned_worker_id, assigned_worker_ids, full_name, phone, email, date_of_birth, address, condition_notes, status, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
        [
          worker.workerId,
          JSON.stringify([String(worker.workerId)]),
          fullName,
          phone,
          email,
          dateOfBirth || null,
          address || null,
          conditionNotes,
          priorityByUrgency[urgency as keyof typeof priorityByUrgency],
        ],
      );
      patientId = String(patientResult.insertId);
    }

    await connection.commit();
    return NextResponse.json(
      { success: true, id: String(caseResult.insertId), patientId },
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback();
    console.error("Failed to create mediator case", error);
    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        { error: "A patient with this email already exists. Please refresh and try again." },
        { status: 409 },
      );
    }
    const databaseError = error as { code?: string; errno?: number };
    const schemaError =
      databaseError.code === "ER_NO_SUCH_TABLE"
      || databaseError.code === "ER_BAD_FIELD_ERROR"
      || databaseError.errno === 1146
      || databaseError.errno === 1054;
    return NextResponse.json(
      {
        error: schemaError
          ? "The mediator case database table is not ready. Apply migration 008, including the phone and address columns."
          : "Could not save the case. Please try again.",
      },
      { status: 503 },
    );
  } finally {
    connection.release();
  }
}