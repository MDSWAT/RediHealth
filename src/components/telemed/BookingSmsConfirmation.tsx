"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircleIcon, CalendarIcon, PhoneIcon } from "@/components/ui/icons";
import { FamilyShareButton } from "@/components/ui/FamilyShareButton";
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
  ru: {
    title: "Ваш звонок забронирован",
    codeLabel: "Код бронирования",
    atHour: "в",
    forPatient: "Для:",
    smsTitle: (phone: string) => `Мы отправили текстовое сообщение на ${phone}`,
    whatsAppSent: "Мы также отправили подтверждение в WhatsApp.",
    openRoom: "Войти в звонок",
    addToCalendar: "Добавить в календарь",
    anotherBooking: "Забронировать еще",
    calSummary: (code: string) => `RediHealth звонок врачу (${code})`,
    calDesc: (link: string) => `Позвоните врачу-волонтеру RediHealth. Присоединяйтесь здесь: ${link}`,
  },

  ro: {
    title: "Apelul cu medicul este programat",
    codeLabel: "Codul programării",
    atHour: "ora",
    forPatient: "Pentru:",
    smsTitle: (phone: string) => `Am trimis un SMS la ${phone}`,
    whatsAppSent: "Ți-am trimis confirmarea și pe WhatsApp.",
    openRoom: "Intră în apel",
    addToCalendar: "Pune în calendar",
    anotherBooking: "Fă altă programare",
    calSummary: (code: string) => `Apel cu medicul RediHealth (${code})`,
    calDesc: (link: string) => `Apel cu un medic voluntar RediHealth. Intri de aici: ${link}`,
  },
  en: {
    title: "Your call is booked",
    codeLabel: "Booking code",
    atHour: "at",
    forPatient: "For:",
    smsTitle: (phone: string) => `We sent a text message to ${phone}`,
    whatsAppSent: "We also sent the confirmation on WhatsApp.",
    openRoom: "Join the call",
    addToCalendar: "Add to calendar",
    anotherBooking: "Book another",
    calSummary: (code: string) => `RediHealth call with a doctor (${code})`,
    calDesc: (link: string) => `Call with a RediHealth volunteer doctor. Join here: ${link}`,
  },
  sq: {
    title: "Thirrja jote u caktua",
    codeLabel: "Kodi i rezervimit",
    atHour: "ora",
    forPatient: "Për:",
    smsTitle: (phone: string) => `Të dërguam një SMS në ${phone}`,
    whatsAppSent: "Konfirmimin ta dërguam edhe në WhatsApp.",
    openRoom: "Hyr në thirrje",
    addToCalendar: "Shto në kalendar",
    anotherBooking: "Cakto një tjetër",
    calSummary: (code: string) => `Thirrje me mjekun RediHealth (${code})`,
    calDesc: (link: string) => `Thirrje me një mjek vullnetar të RediHealth. Hyr këtu: ${link}`,
  },
  it: {
    title: "La chiamata è prenotata",
    codeLabel: "Codice della prenotazione",
    atHour: "ore",
    forPatient: "Per:",
    smsTitle: (phone: string) => `Ti abbiamo mandato un SMS al ${phone}`,
    whatsAppSent: "Ti abbiamo mandato la conferma anche su WhatsApp.",
    openRoom: "Entra nella chiamata",
    addToCalendar: "Aggiungi al calendario",
    anotherBooking: "Prenota un altro orario",
    calSummary: (code: string) => `Chiamata con il medico RediHealth (${code})`,
    calDesc: (link: string) => `Chiamata con un medico volontario RediHealth. Entra da qui: ${link}`,
  },
  hr: {
    title: "Tvoj poziv je rezerviran",
    codeLabel: "Kod rezervacije",
    atHour: "u",
    forPatient: "Za:",
    smsTitle: (phone: string) => `Poslali smo SMS poruku na broj ${phone}`,
    whatsAppSent: "Potvrdu smo ti poslali i putem aplikacije WhatsApp.",
    openRoom: "Pridruži se pozivu",
    addToCalendar: "Dodaj u kalendar",
    anotherBooking: "Rezerviraj drugi termin",
    calSummary: (code: string) => `Poziv s liječnikom RediHealth (${code})`,
    calDesc: (link: string) => `Poziv s liječnikom volonterom na platformi RediHealth. Pridruži se ovdje: ${link}`,
  },
  rom: {
    title: "Cho svato e doktoresa si thodino",
    codeLabel: "Kodo e vramako",
    atHour: "ko",
    forPatient: "Vash:",
    smsTitle: (phone: string) => `Bichhaldyam SMS pe ${phone}`,
    whatsAppSent: "Bichhaldyam o chacharipe vi pe WhatsApp.",
    openRoom: "Khuves and-o svato",
    addToCalendar: "Tho and-o kalendaro",
    anotherBooking: "Alosar aver vrama",
    calSummary: (code: string) => `Svato e doktoresa RediHealth (${code})`,
    calDesc: (link: string) => `Svato ekhe doktoresa volonteri katar RediHealth. Khuves kathe: ${link}`,
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
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The confirmation replaces the form: move focus to it so screen-reader and keyboard users hear it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.closest("div")?.scrollIntoView({ block: "nearest" });
  }, []);

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
    <div className="w-full rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-sapphire" />
        <h2 ref={headingRef} tabIndex={-1} className="text-balance text-2xl font-semibold tracking-tight text-foreground focus:outline-none">{copy.title}</h2>
      </div>

      <p className="mt-2 text-base font-medium text-foreground tabular-nums">
        {confirmation.formattedDate}, {copy.atHour} {confirmation.time}
      </p>

      <dl className="mt-5 grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-y border-border py-4 text-sm">
        <dt className="text-muted-foreground">{copy.codeLabel}</dt>
        <dd className="font-mono text-lg font-semibold text-foreground">{confirmation.bookingCode}</dd>
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

      <div className="mt-8 space-y-2.5">
        <Link
          href={withLangPrefix(`/medic-online/meet/${confirmation.magicRoomId}`, lang)}
          className="inline-flex min-h-[44px] w-full max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-sapphire px-4 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5 sm:text-[0.9375rem]"
        >
          <PhoneIcon className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">{copy.openRoom}</span>
        </Link>

        {confirmation.startsAt ? (
          <div className="flex flex-nowrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="press-row inline-flex min-h-11 min-w-0 max-w-full flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border-control bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 sm:text-[0.9375rem]"
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              {copy.addToCalendar}
            </button>

            <FamilyShareButton
              iconOnly
              align="right"
              title={copy.title}
              text={`${confirmation.formattedDate}, ${copy.atHour} ${confirmation.time}\n${copy.codeLabel}: ${confirmation.bookingCode}\n${copy.forPatient}: ${confirmation.patientName}`}
              url={confirmation.magicLink}
              lang={lang}
            />
          </div>
        ) : (
          <FamilyShareButton
            title={copy.title}
            text={`${confirmation.formattedDate}, ${copy.atHour} ${confirmation.time}\n${copy.codeLabel}: ${confirmation.bookingCode}\n${copy.forPatient}: ${confirmation.patientName}`}
            url={confirmation.magicLink}
            lang={lang}
            className="w-full [&>button]:w-full"
          />
        )}

        {onReset && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-[44px] max-w-full items-center justify-center whitespace-nowrap rounded-sm px-2 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[0.9375rem]"
            >
              <span className="min-w-0 truncate">{copy.anotherBooking}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
