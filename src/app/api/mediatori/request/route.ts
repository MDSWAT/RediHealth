import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { parseCountry } from "@/lib/countries";
import { configuredCountries, getCountryDatabase, type ResultSetHeader } from "@/lib/database";
import { text } from "@/lib/text";

export async function POST(request: Request) {
  const ipRateLimit = await checkRateLimit(`mediator-req:ip:${getClientIp(request)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      { error: "Prea multe solicitări. Așteaptă un minut." },
      { status: 429, headers: { "Retry-After": String(ipRateLimit.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  const county = text(body.county);
  const locality = text(body.locality);
  const requesterName = text(body.requesterName);
  const cleanPhone = text(body.requesterPhone).replace(/[\s().-]+/g, "");
  const beneficiaryName = text(body.beneficiaryName);
  const helpCategory = text(body.helpCategory) || "Asistență medicală generală";
  const notes = text(body.notes);

  if (!county || !locality || !requesterName || !cleanPhone) {
    return NextResponse.json(
      { error: "Completează județul, localitatea, numele și numărul de telefon." },
      { status: 400 },
    );
  }
  if (!/^\+?\d{9,15}$/.test(cleanPhone)) {
    return NextResponse.json(
      { error: "Numărul de telefon introdus nu este valid." },
      { status: 400 },
    );
  }
  if (
    county.length > 100 || locality.length > 200 || requesterName.length > 200 ||
    beneficiaryName.length > 200 || helpCategory.length > 100 || notes.length > 4000
  ) {
    return NextResponse.json({ error: "Unul sau mai multe câmpuri sunt prea lungi." }, { status: 400 });
  }

  // The request is stored in the database of the country the person chose, never anywhere else.
  const available = configuredCountries();
  const country = parseCountry(body.country) ?? (available.length === 1 ? available[0] : null);
  if (!country || !available.includes(country)) {
    return NextResponse.json({ error: "Alege țara." }, { status: 400 });
  }

  const trackingCode = `MED-${randomInt(100000, 1000000)}`;
  try {
    await getCountryDatabase(country).query<ResultSetHeader>(
      `INSERT INTO mediator_requests (
        county, locality, requester_name, requester_phone, beneficiary_name,
        help_category, notes, tracking_code, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [county, locality, requesterName, cleanPhone, beneficiaryName || null, helpCategory, notes || null, trackingCode],
    );
  } catch (error) {
    // Never confirm a request that was not saved (for example before migration 015 is applied).
    console.error("Mediator request could not be saved", error);
    return NextResponse.json({ error: "Solicitarea nu a putut fi trimisă." }, { status: 503 });
  }

  // No SMS gateway is connected yet, so no message is sent and no personal data is logged.
  return NextResponse.json({
    success: true,
    trackingCode,
    message: "Solicitarea a fost înregistrată. Un mediator te va contacta în cel mai scurt timp.",
  });
}
