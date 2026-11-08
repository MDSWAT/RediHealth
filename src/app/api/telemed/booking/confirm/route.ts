import { NextResponse } from "next/server";

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
  try {
    const body = (await request.json()) as BookingPayload;

    if (!body.selectedDate || !body.selectedTime || !body.patientName || !body.patientPhone) {
      return NextResponse.json(
        { error: "Completează data, ora, numele și telefonul." },
        { status: 400 },
      );
    }

    // Clean phone number
    const cleanPhone = body.patientPhone.replace(/\s+/g, "");
    if (cleanPhone.length < 9) {
      return NextResponse.json(
        { error: "Numărul de telefon introdus nu este valid." },
        { status: 400 },
      );
    }

    // Generate unique human-readable code e.g. RD-8421
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `RD-${randomSuffix}`;
    const magicRoomId = `telemed-${bookingCode.toLowerCase()}`;
    const magicLink = `https://redimed.eu/medic-online/meet/${magicRoomId}`;

    // Format date for Romanian copy
    const appointmentDate = new Date(`${body.selectedDate}T${body.selectedTime}:00`);
    const formattedDate = appointmentDate.toLocaleDateString("ro-RO", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

    const smsMessage = `RediHealth: Consultația ta video este confirmată pentru ${formattedDate}, ora ${body.selectedTime}. La ora stabilită, apasă direct aici pentru a intra în legătură cu medicul: ${magicLink}`;

    // In production this connects to SMS/WhatsApp gateway (Twilio, Infobip, etc.)
    console.info(`[TELEMED_SMS_DISPATCH] To: ${cleanPhone} | Message: ${smsMessage}`);

    return NextResponse.json({
      success: true,
      bookingCode,
      magicRoomId,
      magicLink,
      formattedDate,
      time: body.selectedTime,
      smsMessage,
      whatsappSent: Boolean(body.sendWhatsApp),
    });
  } catch (error) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json({ error: "Programarea nu a putut fi confirmată." }, { status: 500 });
  }
}
