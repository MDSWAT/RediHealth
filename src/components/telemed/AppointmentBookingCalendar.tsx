"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, ClockIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { FamilyBookingSelector, type BookingPartyData } from "./FamilyBookingSelector";
import { BookingSmsConfirmation, type BookingConfirmationData } from "./BookingSmsConfirmation";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const calendarCopy = {
  ro: {
    steps: ["Ziua și ora", "Telefonul tău", "Gata"],
    stepOf: (n: number) => `Pasul ${n} din 3`,
    chooseDay: "Alege ziua",
    availableHours: (formatted: string) => `Ore libere, ${formatted}`,
    slotDuration: "O consultație durează 20 min",
    continueToContact: "Continuă",
    contactTitle: "Unde îți trimitem confirmarea",
    bookingFor: (formatted: string, time: string) => `Programare: ${formatted}, ora ${time}`,
    changeTime: "Schimbă ora",
    back: "Înapoi",
    confirmBooking: "Confirmă programarea",
    confirming: "Se confirmă…",
    errorSelectTime: "Alege o oră.",
    errorName: "Scrie numele celui care vorbește cu medicul.",
    errorPhone: "Scrie un număr de mobil, de exemplu 0721 000 000.",
    errorGeneric: "Programarea nu s-a făcut. Încearcă din nou.",
    dayNames: ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"],
    dayNamesLong: ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"],
    monthNames: ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."],
    monthNamesLong: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
    sms: (date: string, time: string, link: string) =>
      `RediHealth: Ai programare la medic prin video ${date}, ora ${time}. La ora asta, deschide linkul ca să intri în apel: ${link}`,
  },
  en: {
    steps: ["Day and time", "Your phone", "Done"],
    stepOf: (n: number) => `Step ${n} of 3`,
    chooseDay: "Choose a day",
    availableHours: (formatted: string) => `Free times, ${formatted}`,
    slotDuration: "An appointment lasts 20 min",
    continueToContact: "Continue",
    contactTitle: "Where we send the confirmation",
    bookingFor: (formatted: string, time: string) => `Appointment: ${formatted} at ${time}`,
    changeTime: "Change time",
    back: "Back",
    confirmBooking: "Book",
    confirming: "Booking…",
    errorSelectTime: "Choose a time.",
    errorName: "Write the name of the person who talks to the doctor.",
    errorPhone: "Write a mobile number, for example 0721 000 000.",
    errorGeneric: "The booking did not go through. Try again.",
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    monthNamesLong: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    sms: (date: string, time: string, link: string) =>
      `RediHealth: You have a video appointment on ${date} at ${time}. At that time, open this link to join the call: ${link}`,
  },
  sq: {
    steps: ["Dita dhe ora", "Telefoni yt", "Gati"],
    stepOf: (n: number) => `Hapi ${n} nga 3`,
    chooseDay: "Zgjidh ditën",
    availableHours: (formatted: string) => `Orë të lira, ${formatted}`,
    slotDuration: "Një vizitë zgjat 20 min",
    continueToContact: "Vazhdo",
    contactTitle: "Ku ta dërgojmë konfirmimin",
    bookingFor: (formatted: string, time: string) => `Vizita: ${formatted}, ora ${time}`,
    changeTime: "Ndrysho orën",
    back: "Kthehu",
    confirmBooking: "Cakto vizitën",
    confirming: "Po caktohet…",
    errorSelectTime: "Zgjidh një orë.",
    errorName: "Shkruaj emrin e atij që flet me mjekun.",
    errorPhone: "Shkruaj një numër celulari, për shembull 0721 000 000.",
    errorGeneric: "Vizita nuk u caktua. Provo përsëri.",
    dayNames: ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"],
    dayNamesLong: ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"],
    monthNames: ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"],
    monthNamesLong: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
    sms: (date: string, time: string, link: string) =>
      `RediHealth: Ke një vizitë me video ${date}, ora ${time}. Në atë orë, hap këtë lidhje që të hysh në thirrje: ${link}`,
  },
  it: {
    steps: ["Giorno e ora", "Il tuo telefono", "Fatto"],
    stepOf: (n: number) => `Passo ${n} di 3`,
    chooseDay: "Scegli il giorno",
    availableHours: (formatted: string) => `Orari liberi, ${formatted}`,
    slotDuration: "Una visita dura 20 min",
    continueToContact: "Continua",
    contactTitle: "Dove ti mandiamo la conferma",
    bookingFor: (formatted: string, time: string) => `Visita: ${formatted}, ore ${time}`,
    changeTime: "Cambia orario",
    back: "Indietro",
    confirmBooking: "Prenota",
    confirming: "Prenotazione…",
    errorSelectTime: "Scegli un orario.",
    errorName: "Scrivi il nome di chi parla con il medico.",
    errorPhone: "Scrivi un numero di cellulare, per esempio 0721 000 000.",
    errorGeneric: "La prenotazione non è andata a buon fine. Riprova.",
    dayNames: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
    dayNamesLong: ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"],
    monthNames: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
    monthNamesLong: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
    sms: (date: string, time: string, link: string) =>
      `RediHealth: Hai una visita in video ${date}, ore ${time}. A quell'ora, apri questo link per entrare nella chiamata: ${link}`,
  },
};

type CalendarDay = { isoDate: string; dayNum: number; dayName: string; monthName: string; fullFormatted: string };

/** The next seven days, starting tomorrow. */
function getNext7Days(lang: Lang): CalendarDay[] {
  const copy = calendarCopy[lang] ?? calendarCopy.ro;
  const days: CalendarDay[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({
      isoDate,
      dayNum: d.getDate(),
      dayName: copy.dayNames[d.getDay()],
      monthName: copy.monthNames[d.getMonth()],
      fullFormatted: `${copy.dayNamesLong[d.getDay()]}, ${d.getDate()} ${copy.monthNamesLong[d.getMonth()]}`,
    });
  }
  return days;
}

const AVAILABLE_TIME_SLOTS = [
  "09:00", "09:20", "09:40",
  "10:00", "10:20", "10:40",
  "11:00", "11:20", "11:40",
  "14:00", "14:20", "14:40",
  "15:00", "15:20", "15:40",
  "16:00", "16:20", "16:40",
  "17:00", "17:20", "17:40",
];

const choiceBase =
  "rounded-lg border text-center transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const choiceOn = "border-sapphire bg-sapphire text-white";
const choiceOff = "border-border bg-background text-foreground hover:border-foreground/30 hover:bg-muted";

/** Booking a video consultation: pick a day and time, give contact details, see the confirmation. */
export function AppointmentBookingCalendar() {
  const { lang } = useSafeLanguage();
  const copy = calendarCopy[lang] ?? calendarCopy.ro;
  const days = getNext7Days(lang);

  // 1 = date and time, 2 = contact details, 3 = confirmed
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<string>(days[0].isoDate);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [partyData, setPartyData] = useState<BookingPartyData>({
    bookingType: "self",
    patientName: "",
    patientPhone: "",
    sendWhatsApp: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [confirmationData, setConfirmationData] = useState<BookingConfirmationData | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const movedStep = useRef(false);

  const selectedDayObj = days.find((d) => d.isoDate === selectedDate) || days[0];

  // After a step change, move focus to the new step's heading so keyboard and screen-reader users follow.
  useEffect(() => {
    if (!movedStep.current) return;
    stepHeadingRef.current?.focus();
  }, [step]);

  const goTo = (next: 1 | 2) => {
    movedStep.current = true;
    setStep(next);
  };

  const handleNextToContact = () => {
    if (!selectedTime) {
      setError(copy.errorSelectTime);
      return;
    }
    setError("");
    goTo(2);
  };

  const handleConfirmBooking = async () => {
    if (!partyData.patientName.trim()) {
      setError(copy.errorName);
      return;
    }
    if (!partyData.patientPhone.trim() || partyData.patientPhone.replace(/\s+/g, "").length < 9) {
      setError(copy.errorPhone);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/telemed/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDate,
          selectedTime,
          lang,
          bookingType: partyData.bookingType,
          patientName: partyData.patientName,
          patientPhone: partyData.patientPhone,
          proxyRelation: partyData.proxyRelation,
          patientAge: partyData.patientAge,
          reasonForVisit: partyData.reasonForVisit,
          sendWhatsApp: partyData.sendWhatsApp,
        }),
      });
      if (!response.ok) throw new Error("booking-failed");
      const data = (await response.json()) as Omit<BookingConfirmationData, "patientName" | "patientPhone">;

      // The server's messages are Romanian only; show the date and the SMS in the reader's language.
      setConfirmationData({
        ...data,
        formattedDate: selectedDayObj.fullFormatted,
        time: selectedTime,
        startsAt: `${selectedDate}T${selectedTime}`,
        smsMessage: copy.sms(selectedDayObj.fullFormatted, selectedTime, data.magicLink),
        patientName: partyData.patientName,
        patientPhone: partyData.patientPhone,
      });
      setStep(3);
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3 && confirmationData) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <BookingSmsConfirmation
          confirmation={confirmationData}
          onReset={() => {
            movedStep.current = true;
            setStep(1);
            setSelectedTime("");
            setConfirmationData(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Where you are in the booking */}
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label={copy.stepOf(step)}>
        {copy.steps.map((label, i) => {
          const n = i + 1;
          const reached = step >= n;
          return (
            <li key={label} aria-current={step === n ? "step" : undefined}>
              <span
                aria-hidden="true"
                className={cn(
                  "block h-1 rounded-full transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)]",
                  reached ? "bg-sapphire" : "bg-muted",
                )}
              />
              <span className={cn("mt-2 block text-xs leading-snug", reached ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {error && (
        <p role="alert" className="mb-6 rounded-lg border border-primary/25 bg-primary-soft/60 px-3.5 py-3 text-sm font-medium text-primary">
          {error}
        </p>
      )}

      {step === 1 && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 ref={stepHeadingRef} tabIndex={-1} className="flex items-center gap-2 text-lg font-semibold text-foreground focus:outline-none">
            <CalendarIcon className="h-5 w-5 text-sapphire" />
            {copy.chooseDay}
          </h2>

          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none]">
            {days.map((d) => {
              const isSelected = selectedDate === d.isoDate;
              return (
                <button
                  key={d.isoDate}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={d.fullFormatted}
                  onClick={() => {
                    setSelectedDate(d.isoDate);
                    setSelectedTime("");
                  }}
                  className={cn(choiceBase, "flex min-h-[64px] min-w-[64px] flex-1 flex-col items-center justify-center px-2 py-2", isSelected ? choiceOn : choiceOff)}
                >
                  <span className={cn("text-xs", isSelected ? "text-white/80" : "text-muted-foreground")}>{d.dayName}</span>
                  <span className="text-lg font-semibold tabular-nums leading-tight">{d.dayNum}</span>
                  <span className={cn("text-[11px]", isSelected ? "text-white/80" : "text-muted-foreground")}>{d.monthName}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ClockIcon className="h-4 w-4 text-sapphire" />
                {copy.availableHours(selectedDayObj.fullFormatted)}
              </h3>
              <span className="text-xs text-muted-foreground">{copy.slotDuration}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {AVAILABLE_TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedTime(slot);
                      setError("");
                    }}
                    className={cn(choiceBase, "min-h-[48px] text-sm font-semibold tabular-nums", isSelected ? choiceOn : choiceOff)}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <button
              type="button"
              onClick={handleNextToContact}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-sapphire px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {copy.continueToContact}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold text-foreground focus:outline-none">
                {copy.contactTitle}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">{copy.bookingFor(selectedDayObj.fullFormatted, selectedTime)}</p>
            </div>
            <button
              type="button"
              onClick={() => goTo(1)}
              className="min-h-[44px] rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.changeTime}
            </button>
          </div>

          <FamilyBookingSelector value={partyData} onChange={setPartyData} />

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => goTo(1)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {copy.back}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-sapphire px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {isSubmitting ? copy.confirming : copy.confirmBooking}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
