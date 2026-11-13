"use client";

import { useEffect, useRef, useState } from "react";
import { useReadAloud } from "@/components/health-check/readingTools";
import { AlertCircleIcon, CloseIcon, LockIcon, VolumeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

interface RequestMediatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const modalCopy = {
  ru: {
    closeAria: "Закрыть",
    successTitle: "Посредник скоро вам позвонит",
    trackingLabel: "Номер запроса",
    closeButton: "Закрыть",
    title: "Попросите медиатора по вопросам здоровья",
    subtitle: "Для вас или кого-то из вашего сообщества, которому нужна помощь в посещении врача или получении документов.",
    errorRequired: "Выберите округ и напишите номер телефона.",
    step1: "1. Какая помощь вам нужна",
    localityPlaceholder: "например Тофлеа",
    step2: "2. Округ и телефон",
    step3: "3. Подробнее (по желанию)",
    listen: "Слушать",
    stop: "Остановить",
    categories: [
      "Запись к семейному врачу",
      "Удостоверение личности или медицинская страховка",
      "Беременная и еще не осмотренная врачом",
      "Ребенок без вакцин и тестов",
      "Пожилой человек, который не может выйти из дома",
      "Разговор с врачом из дома, с посредником там",
    ],
    notesLabel: "Что еще должен знать посредник (необязательно)",
    notesPlaceholder: "например У моей бабушки нет удостоверения личности, и она не может встать с постели.",
    privacy: "То, что вы здесь пишете, видит только медиатор вашего региона.",
    submit: "Отправить запрос",
    submitting: "Отправка…",
    beneficiaryLabel: "Кому нужна помощь, если не вам (по желанию)",
    selectCounty: "Выберите округ",
    successBody: "Посредник вашего региона позвонит вам по указанному вами номеру. Сохраните номер заявки на случай, если у вас возникнут вопросы.",
    tooManyRequests: "Вы отправили несколько запросов подряд. Повторите попытку через минуту.",
    genericError: "Запрос не был отправлен. Попробуйте еще раз.",
  },

  ro: {
    closeAria: "Închide",
    successTitle: "Te sună un mediator în curând",
    trackingLabel: "Numărul cererii",
    closeButton: "Închide",
    title: "Cere un mediator sanitar",
    subtitle: "Pentru tine sau pentru cineva din comunitate care are nevoie de ajutor la medic sau cu actele.",
    errorRequired: "Alege județul și scrie numărul de telefon.",
    step1: "1. Cu ce ai nevoie de ajutor",
    localityPlaceholder: "ex.: Toflea",
    step2: "2. Județul și telefonul",
    step3: "3. Mai multe detalii (nu e obligatoriu)",
    listen: "Ascultă",
    stop: "Oprește",
    categories: [
      "Înscriere la medicul de familie",
      "Buletin sau asigurare CNAS",
      "Gravidă care nu a fost la control",
      "Copil fără vaccinuri sau analize",
      "Bătrân care nu poate ieși din casă",
      "Discuție cu un medic de acasă, cu mediatorul alături",
    ],
    notesLabel: "Ce mai trebuie să știe mediatorul (nu e obligatoriu)",
    notesPlaceholder: "ex.: Bunica nu are buletin și nu se poate ridica din pat.",
    privacy: "Doar mediatorul din zona ta vede ce scrii aici.",
    submit: "Trimite cererea",
    submitting: "Se trimite…",
    beneficiaryLabel: "Cine are nevoie de ajutor, dacă nu ești tu (nu e obligatoriu)",
    selectCounty: "Alege județul",
    successBody: "Mediatorul din zona ta te sună la numărul pe care l-ai lăsat. Păstrează numărul cererii, în caz că ai întrebări.",
    tooManyRequests: "Ai trimis mai multe cereri una după alta. Încearcă din nou peste un minut.",
    genericError: "Cererea nu s-a trimis. Încearcă din nou.",
  },
  en: {
    closeAria: "Close",
    successTitle: "A mediator will call you soon",
    trackingLabel: "Request number",
    closeButton: "Close",
    title: "Ask for a health mediator",
    subtitle: "For you, or for someone in your community who needs help seeing a doctor or getting documents.",
    errorRequired: "Choose the county and write your phone number.",
    step1: "1. What you need help with",
    localityPlaceholder: "e.g. Toflea",
    step2: "2. County and phone number",
    step3: "3. More details (optional)",
    listen: "Listen",
    stop: "Stop",
    categories: [
      "Registering with a family doctor",
      "ID card or health insurance",
      "Pregnant and not yet checked by a doctor",
      "Child without vaccines or tests",
      "Older person who cannot leave home",
      "Talking to a doctor from home, with the mediator there",
    ],
    notesLabel: "Anything else the mediator should know (optional)",
    notesPlaceholder: "e.g. My grandmother has no ID card and cannot get out of bed.",
    privacy: "Only the mediator for your area sees what you write here.",
    submit: "Send request",
    submitting: "Sending…",
    beneficiaryLabel: "Who needs help, if not you (optional)",
    selectCounty: "Choose a county",
    successBody: "The mediator for your area will call you on the number you gave. Keep the request number in case you have questions.",
    tooManyRequests: "You sent several requests in a row. Try again in a minute.",
    genericError: "The request was not sent. Try again.",
  },
  sq: {
    closeAria: "Mbyll",
    successTitle: "Një mediator do të të telefonojë së shpejti",
    trackingLabel: "Numri i kërkesës",
    closeButton: "Mbyll",
    title: "Kërko një mediator shëndetësor",
    subtitle: "Për ty ose për dikë nga komuniteti që ka nevojë për ndihmë te mjeku ose me dokumentet.",
    errorRequired: "Zgjidh qarkun dhe shkruaj numrin e telefonit.",
    step1: "1. Për çfarë të duhet ndihmë",
    localityPlaceholder: "p.sh. Toflea",
    step2: "2. Qarku dhe telefoni",
    step3: "3. Më shumë detaje (s'është e detyrueshme)",
    listen: "Dëgjo",
    stop: "Ndalo",
    categories: [
      "Regjistrim te mjeku i familjes",
      "Letërnjoftim ose sigurim shëndetësor",
      "Shtatzënë që s'ka bërë kontroll",
      "Fëmijë pa vaksina ose analiza",
      "I moshuar që s'del dot nga shtëpia",
      "Bisedë me mjekun nga shtëpia, me mediatorin pranë",
    ],
    notesLabel: "Çfarë tjetër duhet të dijë mediatori (s'është e detyrueshme)",
    notesPlaceholder: "p.sh. Gjyshja nuk ka letërnjoftim dhe nuk ngrihet nga shtrati.",
    privacy: "Atë që shkruan këtu e sheh vetëm mediatori i zonës sate.",
    submit: "Dërgo kërkesën",
    submitting: "Po dërgohet…",
    beneficiaryLabel: "Kush ka nevojë për ndihmë, nëse nuk je ti (s'është e detyrueshme)",
    selectCounty: "Zgjidh qarkun",
    successBody: "Mediatori i zonës sate do të të telefonojë në numrin që dhe. Ruaje numrin e kërkesës, në rast se ke pyetje.",
    tooManyRequests: "Dërgove disa kërkesa njëra pas tjetrës. Provo përsëri pas një minute.",
    genericError: "Kërkesa nuk u dërgua. Provo përsëri.",
  },
  it: {
    closeAria: "Chiudi",
    successTitle: "Un mediatore ti chiamerà presto",
    trackingLabel: "Numero della richiesta",
    closeButton: "Chiudi",
    title: "Chiedi un mediatore sanitario",
    subtitle: "Per te o per qualcuno della tua comunità che ha bisogno di aiuto con il medico o con i documenti.",
    errorRequired: "Scegli la provincia e scrivi il numero di telefono.",
    step1: "1. Per cosa ti serve aiuto",
    localityPlaceholder: "es. Toflea",
    step2: "2. Provincia e telefono",
    step3: "3. Altri dettagli (facoltativo)",
    listen: "Ascolta",
    stop: "Ferma",
    categories: [
      "Iscrizione dal medico di famiglia",
      "Carta d'identità o tessera sanitaria",
      "Incinta e non ancora visitata",
      "Bambino senza vaccini o esami",
      "Anziano che non può uscire di casa",
      "Parlare con un medico da casa, con il mediatore accanto",
    ],
    notesLabel: "Altro che il mediatore deve sapere (facoltativo)",
    notesPlaceholder: "es. La nonna non ha un documento e non si alza dal letto.",
    privacy: "Solo il mediatore della tua zona vede quello che scrivi qui.",
    submit: "Invia la richiesta",
    submitting: "Invio…",
    beneficiaryLabel: "Chi ha bisogno di aiuto, se non sei tu (facoltativo)",
    selectCounty: "Scegli la provincia",
    successBody: "Il mediatore della tua zona ti chiamerà al numero che hai lasciato. Tieni il numero della richiesta, se hai domande.",
    tooManyRequests: "Hai mandato più richieste di seguito. Riprova tra un minuto.",
    genericError: "La richiesta non è partita. Riprova.",
  },
  hr: {
    closeAria: "Zatvori",
    successTitle: "Zdravstveni medijator uskoro će te nazvati",
    trackingLabel: "Broj zahtjeva",
    closeButton: "Zatvori",
    title: "Zatraži zdravstvenog medijatora",
    subtitle: "Za tebe ili za nekoga iz tvoje zajednice kome treba pomoć kod liječnika ili s dokumentima.",
    errorRequired: "Odaberi županiju i upiši broj telefona.",
    step1: "1. U čemu ti treba pomoć",
    localityPlaceholder: "npr. Čakovec",
    step2: "2. Županija i telefon",
    step3: "3. Više pojedinosti (nije obvezno)",
    listen: "Slušaj",
    stop: "Zaustavi",
    categories: [
      "Upis kod obiteljskog liječnika",
      "Osobna iskaznica ili zdravstveno osiguranje HZZO",
      "Trudnica koja još nije bila na pregledu",
      "Dijete bez cijepljenja ili nalaza",
      "Starija osoba koja ne može izlaziti iz kuće",
      "Razgovor s liječnikom od kuće uz prisutnost medijatora",
    ],
    notesLabel: "Što još medijator treba znati (nije obvezno)",
    notesPlaceholder: "npr. Baka nema osobnu iskaznicu i ne može ustati iz kreveta.",
    privacy: "Ono što ovdje napišeš vidi samo zdravstveni medijator iz tvojeg područja.",
    submit: "Pošalji zahtjev",
    submitting: "Slanje…",
    beneficiaryLabel: "Kome treba pomoć, ako nisi ti (nije obvezno)",
    selectCounty: "Odaberi županiju ili okrug",
    successBody: "Zdravstveni medijator za tvoje područje nazvat će te na broj koji si ostavio. Sačuvaj broj zahtjeva za slučaj da imaš pitanja.",
    tooManyRequests: "Poslao si više zahtjeva zaredom. Pokušaj ponovno za minutu.",
    genericError: "Zahtjev nije poslan. Pokušaj ponovno.",
  },
  rom: {
    closeAria: "Phand",
    successTitle: "Ekh sastipnasko mediatori ka marel tuke telefono sigo",
    trackingLabel: "Gin e mangipnasko",
    closeButton: "Phand",
    title: "Mang ekhe sastipnaske mediatores",
    subtitle: "Vash tuke vay vash varekon katar chi komuniteta kaske trebul zhutipen ko doktori vay e lilenca.",
    errorRequired: "Alosar o zhudeco thaj lekhav o gin e telefonosko.",
    step1: "1. Sosa trebul tuke zhutipen",
    localityPlaceholder: "misal: Toflea",
    step2: "2. Zhudeco thaj telefono",
    step3: "3. Majbut detalya (nay musay)",
    listen: "Ashun",
    stop: "Ačhav",
    categories: [
      "Lekhavipe ko familiyako doktori",
      "Buletino vay sastipnaski siguranciya",
      "Phari zhuvli kay inke na geli pe kontrola",
      "Chhavoro bi vakcinengo vay analizengo",
      "Phuro manush kay nashti te inkljel kheral",
      "Svato e doktoresa katar khere, e mediatoresa pashe",
    ],
    notesLabel: "So may trebul te zhanel o mediatori (nay musay)",
    notesPlaceholder: "misal: E mami nane la buletino thaj nashti te vazdel pes katar o pato.",
    privacy: "Numay o sastipnasko mediatori katar cho than dikhel so lekhaves kathe.",
    submit: "Bichhal o mangipe",
    submitting: "Bichhalel pes…",
    beneficiaryLabel: "Kaske trebul zhutipen, te na san tu (nay musay)",
    selectCounty: "Alosar o zhudeco",
    successBody: "O sastipnasko mediatori katar cho than ka marel tuke telefono pe gin kay mukhlyan. Arakh o gin e mangipnasko te si tut pučhimata.",
    tooManyRequests: "Bichhaldyan may but mangimata ekh pala aver. Zumav palem palo ekh minuta.",
    genericError: "O mangipe na bichhaldilo. Zumav palem.",
  },
};

export function normalizeMediatorPhone(raw: string): string {
  return raw.trim().replace(/[\s().-]+/g, "");
}

export interface MediatorRequestInput {
  county: string;
  locality: string;
  requesterName: string;
  requesterPhone: string;
  beneficiaryName: string;
  helpCategory: string;
  notes: string;
}

export function buildMediatorRequestPayload(input: MediatorRequestInput) {
  return {
    county: input.county,
    locality: input.locality.trim() || "Confirmare telefonică",
    requesterName: input.requesterName.trim() || "Solicitant telefonic",
    requesterPhone: normalizeMediatorPhone(input.requesterPhone),
    beneficiaryName: input.beneficiaryName.trim() || undefined,
    helpCategory: input.helpCategory,
    notes: input.notes.trim() || undefined,
  };
}

const ROMANIAN_COUNTIES = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov", "Brăila", "Buzău",
  "Caraș-Severin", "Călărași", "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
  "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș",
  "Neamț", "Olt", "Prahova", "Satu Mare", "Sălaj", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea",
  "Vaslui", "Vâlcea", "Vrancea", "București",
];

export function RequestMediatorModal({ isOpen, onClose }: RequestMediatorModalProps) {
  const { lang, t } = useSafeLanguage();
  const copy = modalCopy[lang] ?? modalCopy.ro;
  const labels = t.mediatorsPage ?? translations.ro.mediatorsPage;
  const [county, setCounty] = useState("");
  const [locality, setLocality] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [helpCategory, setHelpCategory] = useState(copy.categories[0]);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const voice = useReadAloud(lang);
  const { stop: stopVoice } = voice;
  useEffect(() => {
    if (!isOpen) stopVoice();
  }, [isOpen, stopVoice]);

  // Dialog behaviour: focus moves in, Escape closes, the page behind does not scroll,
  // and focus returns to the button that opened it.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!county || normalizeMediatorPhone(requesterPhone).length < 9) {
      setErrorMessage(copy.errorRequired);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/mediatori/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildMediatorRequestPayload({ county, locality, requesterName, requesterPhone, beneficiaryName, helpCategory, notes }),
        ),
      });

      const data = (await response.json().catch(() => ({}))) as { trackingCode?: string };
      if (!response.ok) {
        // The API answers in Romanian only; show the reader's own language instead.
        setErrorMessage(response.status === 429 ? copy.tooManyRequests : response.status === 400 ? copy.errorRequired : copy.genericError);
        return;
      }
      setTrackingCode(data.trackingCode ?? "");
    } catch {
      setErrorMessage(copy.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "mt-1.5 block min-h-11 w-full rounded-lg border border-border-control bg-background px-3 py-2 text-base text-foreground " +
    "placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";
  const bigFieldClass = fieldClass.replace("min-h-11", "min-h-12").replace("text-base", "text-base");
  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-mediator-title"
      className="fhs-fade fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4"
    >
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="fhs-enter relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-card shadow-xl focus:outline-none sm:max-h-[88dvh] sm:rounded-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 pb-4 pt-5 sm:px-7">
          <h2 id="request-mediator-title" className="text-lg font-semibold tracking-tight text-foreground">
            {trackingCode !== null ? copy.successTitle : copy.title}
          </h2>
          {voice.available ? (
            <button
              type="button"
              onClick={() => (voice.speaking ? voice.stop() : voice.speak([copy.title, copy.subtitle, copy.privacy]))}
              className="press-row inline-flex items-center gap-1.5 ml-auto min-h-11 shrink-0 whitespace-nowrap rounded-lg border border-border-control bg-card px-3 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <VolumeIcon className="h-4 w-4 text-sapphire" aria-hidden="true" />
              {voice.speaking ? copy.stop : copy.listen}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="press-row -mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={copy.closeAria}
          >
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {trackingCode !== null ? (
          <div className="fhs-enter overflow-y-auto px-5 py-6 sm:px-7">
            <p className="text-base leading-relaxed text-muted-foreground">{copy.successBody}</p>
            {trackingCode ? (
              <p className="mt-5 text-sm text-muted-foreground">
                {copy.trackingLabel}:{" "}
                <span className="font-semibold tabular-nums text-foreground">{trackingCode}</span>
              </p>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="press-solid mt-6 inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-lg bg-sapphire px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {copy.closeButton}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
              <p className="text-sm leading-relaxed text-muted-foreground">{copy.subtitle}</p>

              {errorMessage ? (
                <p role="alert" className="fhs-fade flex items-start gap-2 rounded-lg border border-primary/20 bg-primary-soft px-3 py-2.5 text-sm text-foreground">
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </p>
              ) : null}

              <fieldset>
                <legend className="text-sm font-semibold text-foreground">{copy.step1}</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {copy.categories.map((cat) => {
                    const isSelected = helpCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setHelpCategory(cat)}
                        aria-pressed={isSelected}
                        className={`press-row flex min-h-11 max-w-full items-center whitespace-nowrap rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isSelected
                            ? "border-sapphire bg-sapphire-soft font-semibold text-sapphire dark:border-sapphire-border dark:bg-sapphire/25 dark:text-paper"
                            : "border-border-control bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="min-w-0 truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">{copy.step2}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={labelClass}>
                    {labels.countyLabel}
                    <select required value={county} onChange={(e) => setCounty(e.target.value)} className={bigFieldClass}>
                      <option value="">{copy.selectCounty}</option>
                      {ROMANIAN_COUNTIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClass}>
                    {labels.phoneLabel}
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                      onBlur={() => setRequesterPhone(normalizeMediatorPhone(requesterPhone))}
                      className={bigFieldClass}
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">{copy.step3}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={labelClass}>
                    {labels.localityLabel}
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder={copy.localityPlaceholder}
                      className={fieldClass}
                    />
                  </label>
                  <label className={labelClass}>
                    {labels.nameLabel}
                    <input
                      type="text"
                      autoComplete="name"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                </div>
                <label className={labelClass}>
                  {copy.beneficiaryLabel}
                  <input
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className={fieldClass}
                  />
                </label>
              <label className={labelClass}>
                {copy.notesLabel}
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={copy.notesPlaceholder}
                  className={fieldClass}
                />
              </label>

              </fieldset>

              <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <LockIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{copy.privacy}</span>
              </p>
            </div>

            <div className="shrink-0 border-t border-border px-5 py-4 sm:px-7">
              <button
                type="submit"
                disabled={isSubmitting}
                className="press-solid inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-sapphire px-5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:text-[0.9375rem]"
              >
                <span className="min-w-0 truncate">{isSubmitting ? copy.submitting : copy.submit}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
