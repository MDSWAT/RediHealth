"use client";

import { useEffect, useRef, useState } from "react";
import { useReadAloud } from "@/components/health-check/readingTools";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, CheckCircleIcon, PhoneIcon, VolumeIcon } from "@/components/ui/icons";
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

export const calendarCopy = {
  ru: {
    morning: "Утром",
    afternoon: "Днем",
    listen: "Слушать",
    stop: "Остановить",
    steps: ["День и время", "Ваш телефон", "Готово"],
    stepOf: (n: number) => `Шаг ${n} из 3`,
    chooseDay: "Выберите день",
    availableHours: (formatted: string) => `Свободное время, ${formatted}`,
    slotDuration: "Звонок длится 20 минут",
    continueToContact: "Продолжить",
    contactTitle: "Куда мы отправляем подтверждение",
    bookingFor: (formatted: string, time: string) => `Звонок: ${formatted} в ${time}`,
    changeTime: "Изменить время",
    back: "Назад",
    confirmBooking: "Забронировать",
    confirming: "Бронирование…",
    errorSelectTime: "Выберите время.",
    errorName: "Напишите имя человека, который разговаривает с врачом.",
    errorPhone: "Напишите номер мобильного телефона, например 0721 000 000.",
    errorGeneric: "Бронирование не прошло. Попробуйте еще раз.",
    dayNames: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    dayNamesLong: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
    monthNames: ["янв.", "февр.", "март", "апр.", "май", "июнь", "июль", "авг.", "сент.", "окт.", "нояб.", "дек."],
    monthNamesLong: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
    sms: (date: string, time: string, link: string) =>
      `RediHealth: Запись подтверждена: врач позвонит вам ${date} в ${time}. В это время откройте ссылку, чтобы присоединиться к звонку: ${link}`,
    summaryHeading: "Детали вашей записи",
    summaryDayLabel: "Выбранный день",
    summaryTimeLabel: "Выбранное время",
    summaryTimePending: "Выберите свободное время слева",
    howItWorksHeading: "Как проходит звонок",
    howItWorksItems: [
      ["Бесплатно и без приложения", "Вы получите ссылку по SMS и откроете звонок прямо в браузере."],
      ["Конфиденциально", "Вы разговариваете напрямую с лицензированным врачом."],
      ["Держите заметки рядом", "Подготовьте рецепт или упаковки лекарств, которые принимаете."],
    ],
  },

  ro: {
    morning: "Dimineața",
    afternoon: "După-amiaza",
    listen: "Ascultă",
    stop: "Oprește",
    steps: ["Ziua și ora", "Telefonul tău", "Gata"],
    stepOf: (n: number) => `Pasul ${n} din 3`,
    chooseDay: "Alege ziua",
    availableHours: (formatted: string) => `Ore libere, ${formatted}`,
    slotDuration: "Un apel durează 20 min",
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
      `RediHealth: Ai un apel programat cu medicul ${date}, ora ${time}. La ora asta, deschide linkul ca să intri în apel: ${link}`,
    summaryHeading: "Rezumatul programării",
    summaryDayLabel: "Ziua aleasă",
    summaryTimeLabel: "Ora aleasă",
    summaryTimePending: "Alege o oră din stânga",
    howItWorksHeading: "Cum decurge apelul",
    howItWorksItems: [
      ["Gratuit și fără aplicație", "Primești un link prin SMS și intri direct din browser."],
      ["Confidențial", "Vorbești direct cu un medic cu drept de practică."],
      ["Pregătește pe scurt", "Ține aproape rețeta sau lista cu medicamentele pe care le iei."],
    ],
  },
  en: {
    morning: "Morning",
    afternoon: "Afternoon",
    listen: "Listen",
    stop: "Stop",
    steps: ["Day and time", "Your phone", "Done"],
    stepOf: (n: number) => `Step ${n} of 3`,
    chooseDay: "Choose a day",
    availableHours: (formatted: string) => `Free times, ${formatted}`,
    slotDuration: "A call lasts 20 min",
    continueToContact: "Continue",
    contactTitle: "Where we send the confirmation",
    bookingFor: (formatted: string, time: string) => `Call: ${formatted} at ${time}`,
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
      `RediHealth: You have a call with a doctor on ${date} at ${time}. At that time, open this link to join the call: ${link}`,
    summaryHeading: "Your booking summary",
    summaryDayLabel: "Chosen day",
    summaryTimeLabel: "Chosen time",
    summaryTimePending: "Pick a free time on the left",
    howItWorksHeading: "How the call works",
    howItWorksItems: [
      ["Free and without an app", "You get a link by SMS and join right from your browser."],
      ["Private consultation", "You speak directly with a licensed volunteer doctor."],
      ["Keep your notes nearby", "Have your prescription or current medicines within reach."],
    ],
  },
  sq: {
    morning: "Paradite",
    afternoon: "Pasdite",
    listen: "Dëgjo",
    stop: "Ndalo",
    steps: ["Dita dhe ora", "Telefoni yt", "Gati"],
    stepOf: (n: number) => `Hapi ${n} nga 3`,
    chooseDay: "Zgjidh ditën",
    availableHours: (formatted: string) => `Orë të lira, ${formatted}`,
    slotDuration: "Një thirrje zgjat 20 min",
    continueToContact: "Vazhdo",
    contactTitle: "Ku ta dërgojmë konfirmimin",
    bookingFor: (formatted: string, time: string) => `Thirrja: ${formatted}, ora ${time}`,
    changeTime: "Ndrysho orën",
    back: "Kthehu",
    confirmBooking: "Cakto thirrjen",
    confirming: "Po caktohet…",
    errorSelectTime: "Zgjidh një orë.",
    errorName: "Shkruaj emrin e atij që flet me mjekun.",
    errorPhone: "Shkruaj një numër celulari, për shembull 0721 000 000.",
    errorGeneric: "Thirrja nuk u caktua. Provo përsëri.",
    dayNames: ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"],
    dayNamesLong: ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"],
    monthNames: ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"],
    monthNamesLong: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
    sms: (date: string, time: string, link: string) =>
      `RediHealth: Ke një thirrje me mjekun ${date}, ora ${time}. Në atë orë, hap këtë lidhje që të hysh në thirrje: ${link}`,
    summaryHeading: "Përmbledhja e rezervimit",
    summaryDayLabel: "Dita e zgjedhur",
    summaryTimeLabel: "Ora e zgjedhur",
    summaryTimePending: "Zgjidh një orë majtas",
    howItWorksHeading: "Si zhvillohet thirrja",
    howItWorksItems: [
      ["Falas dhe pa aplikacion", "Merr një lidhje me SMS dhe hyn drejtpërdrejt nga shfletuesi."],
      ["Konfidenciale", "Flet drejtpërdrejt me një mjek vullnetar me licencë."],
      ["Mbaj shënimet afër", "Mbaj pranë recetën ose kutitë e ilaçeve që përdor."],
    ],
  },
  it: {
    morning: "Mattina",
    afternoon: "Pomeriggio",
    listen: "Ascolta",
    stop: "Ferma",
    steps: ["Giorno e ora", "Il tuo telefono", "Fatto"],
    stepOf: (n: number) => `Passo ${n} di 3`,
    chooseDay: "Scegli il giorno",
    availableHours: (formatted: string) => `Orari liberi, ${formatted}`,
    slotDuration: "Una chiamata dura 20 min",
    continueToContact: "Continua",
    contactTitle: "Dove ti mandiamo la conferma",
    bookingFor: (formatted: string, time: string) => `Chiamata: ${formatted}, ore ${time}`,
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
      `RediHealth: Hai una chiamata con il medico ${date}, ore ${time}. A quell'ora, apri questo link per entrare nella chiamata: ${link}`,
    summaryHeading: "Riepilogo della prenotazione",
    summaryDayLabel: "Giorno scelto",
    summaryTimeLabel: "Orario scelto",
    summaryTimePending: "Scegli un orario qui a sinistra",
    howItWorksHeading: "Come funziona la chiamata",
    howItWorksItems: [
      ["Gratuita e senza app", "Ricevi un link via SMS ed entri subito dal browser."],
      ["Riservata", "Parli direttamente con un medico volontario abilitato."],
      ["Tieni tutto vicino", "Prepara la ricetta o le scatole delle medicine che prendi."],
    ],
  },
  hr: {
    morning: "Ujutro",
    afternoon: "Poslijepodne",
    listen: "Slušaj",
    stop: "Zaustavi",
    steps: ["Dan i vrijeme", "Tvoj telefon", "Gotovo"],
    stepOf: (n: number) => `Korak ${n} od 3`,
    chooseDay: "Odaberi dan",
    availableHours: (formatted: string) => `Slobodni termini, ${formatted}`,
    slotDuration: "Poziv traje 20 min",
    continueToContact: "Nastavi",
    contactTitle: "Kamo šaljemo potvrdu",
    bookingFor: (formatted: string, time: string) => `Poziv: ${formatted} u ${time}`,
    changeTime: "Promijeni vrijeme",
    back: "Natrag",
    confirmBooking: "Potvrdi termin",
    confirming: "Potvrđivanje…",
    errorSelectTime: "Odaberi vrijeme.",
    errorName: "Upiši ime osobe koja će razgovarati s liječnikom.",
    errorPhone: "Upiši broj mobitela, na primjer 091 000 0000.",
    errorGeneric: "Rezervacija nije uspjela. Pokušaj ponovno.",
    dayNames: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
    dayNamesLong: ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"],
    monthNames: ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"],
    monthNamesLong: ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"],
    sms: (date: string, time: string, link: string) =>
      `RediHealth: Imaš zakazan poziv s liječnikom ${date} u ${time}. U to vrijeme otvori ovu poveznicu za ulazak u poziv: ${link}`,
    summaryHeading: "Sažetak rezervacije",
    summaryDayLabel: "Odabrani dan",
    summaryTimeLabel: "Odabrano vrijeme",
    summaryTimePending: "Odaberi slobodan termin lijevo",
    howItWorksHeading: "Kako izgleda poziv",
    howItWorksItems: [
      ["Besplatno i bez aplikacije", "Dobivaš poveznicu SMS porukom i ulaziš izravno u pregledniku."],
      ["Povjerljivo", "Razgovaraš izravno s licenciranim liječnikom volonterom."],
      ["Pripremi bilješke", "Drži pri ruci recept ili kutije lijekova koje uzimaš."],
    ],
  },
  rom: {
    morning: "Javin",
    afternoon: "Palal mizmeri",
    listen: "Shun",
    stop: "Ushtav",
    steps: ["Dives thaj chaso", "Cho telefono", "Gata"],
    stepOf: (n: number) => `Phiripen ${n} katar 3`,
    chooseDay: "Alosar o dives",
    availableHours: (formatted: string) => `Mukhle chasurya, ${formatted}`,
    slotDuration: "Ekh svato inkerel 20 min",
    continueToContact: "Zha may dur",
    contactTitle: "Kay bichhalas o chacharipe",
    bookingFor: (formatted: string, time: string) => `Svato: ${formatted}, ko ${time}`,
    changeTime: "Paruv o chaso",
    back: "Palpale",
    confirmBooking: "Chachar e vrama",
    confirming: "Chacharel pes…",
    errorSelectTime: "Alosar ekh chaso.",
    errorName: "Lekhav o anav okolesko kay ka del svato e doktoresa.",
    errorPhone: "Lekhav mobilno gin, misal 0721 000 000.",
    errorGeneric: "O alosaripe na kerdili. Zumav palem.",
    dayNames: ["Kur", "Luy", "Mar", "Tet", "Zho", "Par", "Sav"],
    dayNamesLong: ["kurko", "luya", "marci", "tetradji", "zhoya", "parashkevi", "savato"],
    monthNames: ["yan", "fev", "mar", "apr", "may", "yun", "yul", "avg", "sep", "okt", "nov", "dek"],
    monthNamesLong: ["yanuaro", "fevruaro", "marto", "aprilo", "mayo", "yunio", "yulio", "avgusto", "septembro", "oktombro", "noyembro", "dekembro"],
    sms: (date: string, time: string, link: string) =>
      `RediHealth: Si tut svato e doktoresa pe ${date}, ko ${time}. Ko odova chaso, putar kadava linko te khuves and-o svato: ${link}`,
    summaryHeading: "Cho alosaripe pe xarno",
    summaryDayLabel: "Alosardo dives",
    summaryTimeLabel: "Alosardo chaso",
    summaryTimePending: "Alosar ekh chaso stânga",
    howItWorksHeading: "Sar nakhel o svato",
    howItWorksItems: [
      ["Bi lovesko thaj bi aplikaciyako", "Les ekh linko katar SMS thaj khuves direktno and-o browser."],
      ["Chori thaj garado", "Des svato direktno ekhe doktoresa licencasa."],
      ["Inker pashe tire lila", "Inker pashe e recepta vay e kutiye e drabenge kay les."],
    ],
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

/** Splits slots into morning (before 12:00) and afternoon. */
export function groupTimeSlotsByPeriod(slots: string[]): { morning: string[]; afternoon: string[] } {
  return {
    morning: slots.filter((slot) => slot < "12:00"),
    afternoon: slots.filter((slot) => slot >= "12:00"),
  };
}

/** Forgiving phone input: drops spaces, dots, dashes and brackets. */
export function normalizeBookingPhone(raw: string): string {
  return raw.trim().replace(/[\s().-]+/g, "");
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

// Day and time pickers are one surface of cells split by hairlines (no grid of bordered boxes);
// the chosen cell is filled with ink. The focus ring sits inside the cell so the surface does not clip it.
// Selection crossfades at --dur-base, and the chosen cell gains a short bar under its figure that
// draws out from the centre, so the choice is marked by shape as well as by the inverted colours.
const cellBase =
  "press-row relative whitespace-nowrap text-center transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring " +
  "after:pointer-events-none after:absolute after:inset-x-[30%] after:bottom-1 after:h-0.5 after:rounded-xs after:bg-current after:scale-x-0 after:transition-transform after:duration-[var(--dur-base)] after:ease-[var(--ease-out-calm)] aria-pressed:after:scale-x-100 motion-reduce:after:transition-none";
const cellOn = "bg-foreground text-background";
const cellOff = "bg-card text-foreground hover:bg-muted";
const nextButton =
  "group press-solid inline-flex min-h-12 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:px-5 sm:text-[0.9375rem]";

/** Booking a voice call with a doctor: pick a day and time, give contact details, see the confirmation. */
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
  const voice = useReadAloud(lang);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const movedStep = useRef(false);

  const groupedSlots = groupTimeSlotsByPeriod(AVAILABLE_TIME_SLOTS);
  const selectedDayObj = days.find((d) => d.isoDate === selectedDate) || days[0];

  // After a step change, move focus to the new step's heading so keyboard and screen-reader users follow.
  useEffect(() => {
    if (!movedStep.current) return;
    stepHeadingRef.current?.focus();
  }, [step]);

  const goTo = (next: 1 | 2) => {
    movedStep.current = true;
    setError("");
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
    const phone = normalizeBookingPhone(partyData.patientPhone);
    if (phone.length < 9) {
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
          patientPhone: phone,
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
        patientPhone: phone,
      });
      setStep(3);
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  const listenButton = (parts: string[]) =>
    voice.available ? (
      <button
        type="button"
        onClick={() => (voice.speaking ? voice.stop() : voice.speak(parts))}
        aria-pressed={voice.speaking}
        className="press-row inline-flex min-h-11 max-w-full items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-control bg-background px-3 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <VolumeIcon className="h-4 w-4 shrink-0 text-sapphire" />
        <span className="min-w-0 truncate">{voice.speaking ? copy.stop : copy.listen}</span>
      </button>
    ) : null;

  // The error sits right above the button that caused it, so it is seen on a phone without scrolling up.
  const errorNote = error ? (
    <p role="alert" className="swap-in mt-6 rounded-lg border border-amber-care-border bg-amber-care-soft/40 px-3.5 py-3 text-sm font-medium text-foreground dark:bg-amber-care/10">
      {error}
    </p>
  ) : null;

  const howItWorksIcons = [PhoneIcon, CheckCircleIcon, CalendarIcon] as const;

  return (
    <Container className="py-8 sm:py-10">
      {/* Where you are in the booking */}
      <ol className="mb-8 grid grid-cols-3 gap-3" aria-label={copy.stepOf(step)}>
        {copy.steps.map((label, i) => {
          const n = i + 1;
          const reached = step >= n;
          return (
            <li key={label} aria-current={step === n ? "step" : undefined}>
              {/* The bar fills from its start edge as the step is reached, rather than changing colour at once. */}
              <span aria-hidden="true" className="block h-1 overflow-hidden rounded-sm bg-border">
                <span
                  className={cn(
                    "block h-full w-full origin-left rounded-sm bg-foreground transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] motion-reduce:transition-none rtl:origin-right",
                    reached ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
              <span className={cn("mt-2 block text-xs leading-snug", reached ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)] lg:items-start lg:gap-8 xl:gap-10">
        <div className="min-w-0">
          {step === 1 && (
            <div className="fhs-enter rounded-xl border border-border bg-card p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 ref={stepHeadingRef} tabIndex={-1} className="text-balance text-lg font-semibold text-foreground focus:outline-none">
                  {copy.chooseDay}
                </h2>
                {listenButton([copy.chooseDay, copy.availableHours(selectedDayObj.fullFormatted), copy.slotDuration])}
              </div>

              <div className="mt-4 grid grid-cols-7 divide-x divide-border overflow-hidden rounded-lg border border-border-control">
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
                      className={cn(cellBase, "flex min-h-[68px] min-w-0 flex-col items-center justify-center px-0.5 py-2", isSelected ? cellOn : cellOff)}
                    >
                      <span className={cn("max-w-full truncate text-xs", isSelected ? "text-background/80" : "text-muted-foreground")}>{d.dayName}</span>
                      <span className="text-lg font-semibold tabular-nums leading-tight">{d.dayNum}</span>
                      <span className={cn("max-w-full truncate text-[11px]", isSelected ? "text-background/80" : "text-muted-foreground")}>{d.monthName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Keyed on the day: a new day's hours replace the last ones in place. */}
              <div key={selectedDate} className="swap-in mt-6 border-t border-border pt-5">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-balance text-sm font-semibold text-foreground">
                    {copy.availableHours(selectedDayObj.fullFormatted)}
                  </h3>
                  <span className="text-xs text-muted-foreground">{copy.slotDuration}</span>
                </div>

                {([["morning", copy.morning], ["afternoon", copy.afternoon]] as const).map(([period, label]) => (
                  <div key={period} className="mt-4 first:mt-0">
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">{label}</h4>
                    <div className={cn("grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border-control bg-border", period === "morning" ? "sm:grid-cols-9" : "sm:grid-cols-6")}>
                      {groupedSlots[period].map((slot) => {
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
                            className={cn(cellBase, "min-h-12 whitespace-nowrap text-sm font-semibold tabular-nums", isSelected ? cellOn : cellOff)}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {errorNote}

              <div className="mt-6 flex justify-end border-t border-border pt-4">
                <button type="button" onClick={handleNextToContact} className={nextButton}>
                  <span className="min-w-0 truncate">{copy.continueToContact}</span>
                  <ArrowRightIcon aria-hidden="true" className="arrow-travel h-4 w-4 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fhs-enter rounded-xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 ref={stepHeadingRef} tabIndex={-1} className="text-balance text-lg font-semibold text-foreground focus:outline-none">
                    {copy.contactTitle}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">{copy.bookingFor(selectedDayObj.fullFormatted, selectedTime)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {listenButton([copy.contactTitle, copy.bookingFor(selectedDayObj.fullFormatted, selectedTime)])}
                  <button
                    type="button"
                    onClick={() => goTo(1)}
                    className="group press-row min-h-11 max-w-full whitespace-nowrap rounded-sm text-sm font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 truncate hover:text-sapphire-light">{copy.changeTime}</span>
                  </button>
                </div>
              </div>

              <FamilyBookingSelector value={partyData} onChange={setPartyData} />

              {errorNote}

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="press-row -mx-2 inline-flex min-h-11 max-w-full items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeftIcon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">{copy.back}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className={nextButton}
                >
                  <span className="min-w-0 truncate">{isSubmitting ? copy.confirming : copy.confirmBooking}</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && confirmationData && (
            <BookingSmsConfirmation
              confirmation={confirmationData}
              onReset={() => {
                movedStep.current = true;
                setStep(1);
                setSelectedTime("");
                setConfirmationData(null);
              }}
            />
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1.5rem)]">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
              <h2 className="text-balance text-title text-foreground">{copy.summaryHeading}</h2>
            </div>

            <dl className="mt-4 divide-y divide-border text-sm">
              <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0">
                <dt className="text-muted-foreground">{copy.summaryDayLabel}</dt>
                <dd key={selectedDate} className="swap-in text-right font-semibold text-foreground tabular-nums">{selectedDayObj.fullFormatted}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5 last:pb-0">
                <dt className="text-muted-foreground">{copy.summaryTimeLabel}</dt>
                <dd
                  key={selectedTime || "pending"}
                  className={cn(
                    "swap-in text-right tabular-nums",
                    selectedTime ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {selectedTime ? `${selectedTime} (${copy.slotDuration})` : copy.summaryTimePending}
                </dd>
              </div>
            </dl>
          </div>

          <section aria-labelledby="booking-how-heading">
            <h2 id="booking-how-heading" className="text-balance text-title text-foreground">
              {copy.howItWorksHeading}
            </h2>
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {copy.howItWorksItems.map(([title, desc], i) => {
                const Icon = howItWorksIcons[i] ?? CheckCircleIcon;
                return (
                  <li key={title} className="flex items-start gap-3 p-4">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sapphire" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </Container>
  );
}
