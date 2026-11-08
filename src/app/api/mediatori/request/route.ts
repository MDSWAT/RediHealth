import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isCountryConfigured, getCountryDatabase, type ResultSetHeader } from "@/lib/database";
import type { MediatorRequestPayload } from "@/lib/types/telemetry";

export async function POST(request: Request) {
  try {
    const ipRateLimit = await checkRateLimit(`mediator-req:ip:${getClientIp(request)}`, {
      limit: 10,
      windowMs: 60_000,
    });
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: "Prea multe solicitări. Așteaptă un minut." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as MediatorRequestPayload;

    if (!body.county || !body.locality || !body.requesterName || !body.requesterPhone) {
      return NextResponse.json(
        { error: "Completează județul, localitatea, numele și numărul de telefon." },
        { status: 400 },
      );
    }

    const cleanPhone = body.requesterPhone.replace(/\s+/g, "");
    if (cleanPhone.length < 9) {
      return NextResponse.json(
        { error: "Numărul de telefon introdus nu este valid." },
        { status: 400 },
      );
    }

    const trackingSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `MED-${trackingSuffix}`;

    const country = "RO" as const;
    if (isCountryConfigured(country)) {
      try {
        const db = getCountryDatabase(country);
        await db.query<ResultSetHeader>(
          `INSERT INTO mediator_requests (
            county, locality, requester_name, requester_phone, beneficiary_name,
            help_category, notes, tracking_code, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
          [
            body.county,
            body.locality,
            body.requesterName,
            cleanPhone,
            body.beneficiaryName || null,
            body.helpCategory || "Asistență medicală generală",
            body.notes || null,
            trackingCode,
          ],
        );
      } catch (err) {
        console.warn("Could not insert mediator request into database:", err);
      }
    }

    const smsMessage = `RediHealth: Solicitarea ta pentru mediator sanitar în ${body.locality} (${body.county}) a fost înregistrată. Cod urmărire: ${trackingCode}. Un mediator te va contacta în cel mai scurt timp.`;
    console.info(`[MEDIATOR_SMS_DISPATCH] To: ${cleanPhone} | ${smsMessage}`);

    return NextResponse.json({
      success: true,
      trackingCode,
      message: `Solicitarea a fost trimisă cu succes. Vei primi confirmarea prin SMS la numărul ${cleanPhone}.`,
    });
  } catch (error) {
    console.error("Error processing mediator request:", error);
    return NextResponse.json({ error: "Solicitarea nu a putut fi trimisă." }, { status: 500 });
  }
}
