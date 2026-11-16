import { randomInt, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";
import { text } from "@/lib/text";

export interface BookingPayload {
  selectedDate: string; // e.g. "2026-11-08"
  selectedTime: string; // e.g. "14:00"
  bookingType: "self" | "family" | "community";
  patientName: string;
  patientPhone: string;
  proxyRelation?: string;
  patientAge?: string;
  reasonForVisit?: string;
  sendWhatsApp?: boolean;
}

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(`telemed-booking:ip:${getClientIp(request)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Prea multe încercări. Așteaptă un minut." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const selectedDate = text(body?.selectedDate);
    const selectedTime = text(body?.selectedTime);
    const patientName = text(body?.patientName);
    const cleanPhone = text(body?.patientPhone).replace(/[\s().-]+/g, "");

    if (!selectedDate || !selectedTime || !patientName || !cleanPhone) {
      return NextResponse.json(
        { error: "Completează data, ora, numele și telefonul." },
        { status: 400 },
      );
    }

    const appointmentDate = new Date(`${selectedDate}T${selectedTime}:00`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(selectedTime) ||
      Number.isNaN(appointmentDate.getTime()) ||
      patientName.length > 200
    ) {
      return NextResponse.json({ error: "Data sau ora programării nu este validă." }, { status: 400 });
    }

    if (!/^\+?\d{9,15}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Numărul de telefon introdus nu este valid." },
        { status: 400 },
      );
    }

    // The short code is only a human-readable reference. The room itself is unguessable,
    // so knowing or guessing a booking code never lets someone into another person's call.
    const bookingCode = `RD-${randomInt(1000, 10000)}`;
    const magicRoomId = `telemed-${randomUUID()}`;
    const magicLink = `${getSiteUrl()}/medic-online/meet/${magicRoomId}`;

    const formattedDate = appointmentDate.toLocaleDateString("ro-RO", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

    const smsMessage = `RediHealth: Consultația ta video este confirmată pentru ${formattedDate}, ora ${selectedTime}. La ora stabilită, apasă direct aici pentru a intra în legătură cu medicul: ${magicLink}`;

    // No SMS/WhatsApp gateway is connected yet, so nothing is sent and no personal data is logged.

    return NextResponse.json({
      success: true,
      bookingCode,
      magicRoomId,
      magicLink,
      formattedDate,
      time: selectedTime,
      smsMessage,
      whatsappSent: false,
    });
  } catch (error) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json({ error: "Programarea nu a putut fi confirmată." }, { status: 500 });
  }
}
