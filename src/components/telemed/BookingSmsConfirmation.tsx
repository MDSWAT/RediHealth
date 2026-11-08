"use client";

import Link from "next/link";
import { CheckCircleIcon, CalendarIcon, PhoneIcon, VideoIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const confirmationCopy = {
  ro: {
    title: "Ai programare la medic",
    codeLabel: "Codul programării",
    atHour: "ora",
    forPatient: "Pentru:",
    smsTitle: (phone: string) => `Am trimis un SMS la ${phone}`,
    whatsAppSent: "Ți-am trimis confirmarea și pe WhatsApp.",
    openRoom: "Intră în apel",
    addToCalendar: "Pune în calendar",
    anotherBooking: "Fă altă programare",
    calSummary: (code: string) => `Consultație video RediHealth (${code})`,
    calDesc: (link: string) => `Consultație video cu un medic voluntar RediHealth. Intri de aici: ${link}`,
  },
  en: {
    title: "Your appointment is booked",
    codeLabel: "Booking code",
    atHour: "at",
    forPatient: "For:",
    smsTitle: (phone: string) => `We sent a text message to ${phone}`,
    whatsAppSent: "We also sent the confirmation on WhatsApp.",
    openRoom: "Join the call",
    addToCalendar: "Add to calendar",
    anotherBooking: "Book another",
    calSummary: (code: string) => `RediHealth video appointment (${code})`,
    calDesc: (link: string) => `Video appointment with a RediHealth volunteer doctor. Join here: ${link}`,
  },
  sq: {
    title: "Vizita jote u caktua",
    codeLabel: "Kodi i vizitës",
    atHour: "ora",
    forPatient: "Për:",
    smsTitle: (phone: string) => `Të dërguam një SMS në ${phone}`,
    whatsAppSent: "Konfirmimin ta dërguam edhe në WhatsApp.",
    openRoom: "Hyr në thirrje",
    addToCalendar: "Shto në kalendar",
    anotherBooking: "Cakto një tjetër",
    calSummary: (code: string) => `Vizitë me video RediHealth (${code})`,
    calDesc: (link: string) => `Vizitë me video me një mjek vullnetar të RediHealth. Hyr këtu: ${link}`,
  },
  it: {
    title: "La visita è prenotata",
    codeLabel: "Codice della prenotazione",
    atHour: "ore",
    forPatient: "Per:",
    smsTitle: (phone: string) => `Ti abbiamo mandato un SMS al ${phone}`,
    whatsAppSent: "Ti abbiamo mandato la conferma anche su WhatsApp.",
    openRoom: "Entra nella chiamata",
    addToCalendar: "Aggiungi al calendario",
    anotherBooking: "Prenota un'altra visita",
    calSummary: (code: string) => `Visita video RediHealth (${code})`,
    calDesc: (link: string) => `Visita video con un medico volontario RediHealth. Entra da qui: ${link}`,
  },
};

export interface BookingConfirmationData {
  bookingCode: string;
  magicLink: string;
  magicRoomId: string;
  formattedDate: string;
  time: string;
  /** Local start time of the appointment, "2026-11-09T14:00". */
  startsAt?: string;
  smsMessage: string;
  patientName: string;
  patientPhone: string;
  whatsappSent?: boolean;
}

/** RFC 5545 text escaping: backslash, semicolon, comma, newline. */
function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** "2026-11-09T14:00" plus minutes, as a floating local ICS time "20261109T142000". */
function icsLocalTime(startsAt: string, plusMinutes = 0): string {
  const [date, time] = startsAt.split("T");
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const dt = new Date(y, mo - 1, d, h, mi + plusMinutes);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}${p(dt.getMonth() + 1)}${p(dt.getDate())}T${p(dt.getHours())}${p(dt.getMinutes())}00`;
}

export function BookingSmsConfirmation({
  confirmation,
  onReset,
}: {
  confirmation: BookingConfirmationData;
  onReset?: () => void;
}) {
  const { lang } = useSafeLanguage();
  const copy = confirmationCopy[lang] ?? confirmationCopy.ro;

  // A calendar entry at the booked time (20 minutes), in the phone's own time zone.
  const handleDownloadCalendar = () => {
    if (!confirmation.startsAt) return;
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//RediHealth//Telemed//EN",
      "BEGIN:VEVENT",
      `UID:${confirmation.bookingCode.toLowerCase()}@redihealth`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsLocalTime(confirmation.startsAt)}`,
      `DTEND:${icsLocalTime(confirmation.startsAt, 20)}`,
      `SUMMARY:${icsText(copy.calSummary(confirmation.bookingCode))}`,
      `DESCRIPTION:${icsText(copy.calDesc(confirmation.magicLink))}`,
      `URL:${confirmation.magicLink}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const url = URL.createObjectURL(new Blob([icsContent], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `redihealth-${confirmation.bookingCode}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-sapphire" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{copy.title}</h1>
      </div>

      <p className="mt-2 text-base font-medium text-foreground tabular-nums">
        {confirmation.formattedDate}, {copy.atHour} {confirmation.time}
      </p>

      <dl className="mt-5 grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-y border-border py-4 text-sm">
        <dt className="text-muted-foreground">{copy.codeLabel}</dt>
        <dd className="font-mono text-lg font-semibold tracking-wide text-foreground">{confirmation.bookingCode}</dd>
        <dt className="text-muted-foreground">{copy.forPatient}</dt>
        <dd className="text-foreground">{confirmation.patientName}</dd>
      </dl>

      <div className="mt-5 flex items-start gap-3">
        <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-foreground">{copy.smsTitle(confirmation.patientPhone)}</p>
          <p className="mt-1 text-muted-foreground">{confirmation.smsMessage}</p>
          {confirmation.whatsappSent && <p className="mt-1 text-muted-foreground">{copy.whatsAppSent}</p>}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href={withLangPrefix(`/medic-online/meet/${confirmation.magicRoomId}`, lang)}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-sapphire px-5 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <VideoIcon className="h-4 w-4" />
          {copy.openRoom}
        </Link>

        {confirmation.startsAt && (
          <button
            type="button"
            onClick={handleDownloadCalendar}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CalendarIcon className="h-4 w-4" />
            {copy.addToCalendar}
          </button>
        )}

        {onReset && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onReset}
              className="min-h-[44px] rounded-sm px-2 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.anotherBooking}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
