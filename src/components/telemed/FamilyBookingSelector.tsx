"use client";

import { UserIcon, UsersIcon } from "@/components/ui/icons";
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

const familyCopy = {
  ru: {
    title: "К кому обращен призыв?",
    self: "Для меня",
    family: "Для семьи",
    community: "Для кого-то другого",
    nameLabelSelf: "Ваше имя",
    nameLabelOther: "Имя человека, который разговаривает с врачом",
    namePlaceholder: "например Мария Ионеску",
    phoneLabel: "Номер мобильного телефона (мы отправим вам ссылку)",
    phonePlaceholder: "0721 000 000",
    assistedDataTitle: "О человеке, для которого вы бронируете",
    relationLabel: "Как они связаны с вами",
    relationPlaceholder: "Выберите…",
    relations: [
      "Ребенок",
      "Родитель или дедушка или бабушка",
      "Муж или жена",
      "Еще один член семьи",
      "Сосед или кто-то из сообщества",
    ],
    ageLabel: "Возраст, примерно",
    agePlaceholder: "например 72",
    reasonLabel: "О чем ты хочешь поговорить? (необязательно)",
    reasonPlaceholder: "например температура в течение 2 дней, вопросы о таблетках от давления",
    whatsAppNotice: "Также отправьте подтверждение и ссылку на WhatsApp.",
  },

  ro: {
    title: "Pentru cine este apelul?",
    self: "Pentru mine",
    family: "Pentru familie",
    community: "Pentru altcineva",
    nameLabelSelf: "Numele tău",
    nameLabelOther: "Numele celui care vorbește cu medicul",
    namePlaceholder: "ex.: Maria Ionescu",
    phoneLabel: "Telefon mobil (primești linkul prin SMS)",
    phonePlaceholder: "0721 000 000",
    assistedDataTitle: "Despre persoana pentru care faci programarea",
    relationLabel: "Ce îți este",
    relationPlaceholder: "Alege…",
    relations: [
      "Copil",
      "Părinte sau bunic",
      "Soț sau soție",
      "Alt membru al familiei",
      "Vecin sau persoană din comunitate",
    ],
    ageLabel: "Vârsta, cam cât",
    agePlaceholder: "ex.: 72",
    reasonLabel: "Despre ce vrei să vorbești? (nu e obligatoriu)",
    reasonPlaceholder: "ex.: febră de 2 zile, întrebări despre pastilele de tensiune",
    whatsAppNotice: "Trimite confirmarea și linkul și pe WhatsApp",
  },
  en: {
    title: "Who is the call for?",
    self: "For me",
    family: "For family",
    community: "For someone else",
    nameLabelSelf: "Your name",
    nameLabelOther: "Name of the person who talks to the doctor",
    namePlaceholder: "e.g. Maria Ionescu",
    phoneLabel: "Mobile number (we text you the link)",
    phonePlaceholder: "0721 000 000",
    assistedDataTitle: "About the person you are booking for",
    relationLabel: "How they are related to you",
    relationPlaceholder: "Choose…",
    relations: [
      "Child",
      "Parent or grandparent",
      "Husband or wife",
      "Another family member",
      "Neighbour or someone from the community",
    ],
    ageLabel: "Age, roughly",
    agePlaceholder: "e.g. 72",
    reasonLabel: "What do you want to talk about? (optional)",
    reasonPlaceholder: "e.g. fever for 2 days, questions about blood pressure tablets",
    whatsAppNotice: "Also send the confirmation and link on WhatsApp",
  },
  sq: {
    title: "Për kë është thirrja?",
    self: "Për mua",
    family: "Për familjen",
    community: "Për dikë tjetër",
    nameLabelSelf: "Emri yt",
    nameLabelOther: "Emri i atij që flet me mjekun",
    namePlaceholder: "p.sh. Maria Ionescu",
    phoneLabel: "Numri i celularit (lidhjen ta dërgojmë me SMS)",
    phonePlaceholder: "0721 000 000",
    assistedDataTitle: "Për personin për të cilin cakton thirrjen",
    relationLabel: "Çfarë të është",
    relationPlaceholder: "Zgjidh…",
    relations: [
      "Fëmijë",
      "Prind ose gjysh",
      "Bashkëshort ose bashkëshorte",
      "Anëtar tjetër i familjes",
      "Fqinj ose person nga komuniteti",
    ],
    ageLabel: "Mosha, afërsisht",
    agePlaceholder: "p.sh. 72",
    reasonLabel: "Për çfarë do të flasësh? (nuk është e detyrueshme)",
    reasonPlaceholder: "p.sh. temperaturë prej 2 ditësh, pyetje për ilaçet e tensionit",
    whatsAppNotice: "Dërgo konfirmimin dhe lidhjen edhe në WhatsApp",
  },
  it: {
    title: "Per chi è la chiamata?",
    self: "Per me",
    family: "Per la famiglia",
    community: "Per un'altra persona",
    nameLabelSelf: "Il tuo nome e cognome",
    nameLabelOther: "Nome di chi parla con il medico",
    namePlaceholder: "es. Maria Ionescu",
    phoneLabel: "Cellulare (ti mandiamo il link via SMS)",
    phonePlaceholder: "0721 000 000",
    assistedDataTitle: "Sulla persona per cui prenoti",
    relationLabel: "Chi è per te",
    relationPlaceholder: "Scegli…",
    relations: [
      "Figlio o figlia",
      "Genitore o nonno",
      "Coniuge",
      "Altro familiare",
      "Vicino o persona della comunità",
    ],
    ageLabel: "Età, più o meno",
    agePlaceholder: "es. 72",
    reasonLabel: "Di cosa vuoi parlare? (facoltativo)",
    reasonPlaceholder: "es. febbre da 2 giorni, dubbi sulle pastiglie per la pressione",
    whatsAppNotice: "Manda conferma e link anche su WhatsApp",
  },
  hr: {
    title: "Za koga je poziv?",
    self: "Za mene",
    family: "Za člana obitelji",
    community: "Za drugu osobu",
    nameLabelSelf: "Tvoje ime i prezime",
    nameLabelOther: "Ime osobe koja će razgovarati s liječnikom",
    namePlaceholder: "npr. Ana Horvat",
    phoneLabel: "Broj mobitela (poveznicu šaljemo SMS porukom)",
    phonePlaceholder: "091 000 0000",
    assistedDataTitle: "O osobi za koju rezerviraš termin",
    relationLabel: "Srodstvo ili odnos",
    relationPlaceholder: "Odaberi…",
    relations: [
      "Dijete",
      "Roditelj ili djed i baka",
      "Supružnik",
      "Drugi član obitelji",
      "Susjed ili osoba iz zajednice",
    ],
    ageLabel: "Dob, okvirno",
    agePlaceholder: "npr. 72",
    reasonLabel: "O čemu želiš razgovarati? (nije obvezno)",
    reasonPlaceholder: "npr. povišena temperatura već 2 dana, pitanja o lijekovima za krvni tlak",
    whatsAppNotice: "Pošalji potvrdu i poveznicu i na WhatsApp",
  },
  rom: {
    title: "Vash kaste si o svato?",
    self: "Vash mande",
    family: "Vash familiya",
    community: "Vash aver manush",
    nameLabelSelf: "Cho anav",
    nameLabelOther: "Anav okolesko kay ka del svato e doktoresa",
    namePlaceholder: "misal: Maria Ionescu",
    phoneLabel: "Mobilno telefono (bichhalas o linko katar SMS)",
    phonePlaceholder: "0721 000 000",
    assistedDataTitle: "Vash o manush kaske alosares e vrama",
    relationLabel: "So avel tuke",
    relationPlaceholder: "Alosar…",
    relations: [
      "Chhavoro",
      "Dad, day vay papo thaj mami",
      "Rom vay romni",
      "Aver zheno katar e familiya",
      "Pashutno vay manush katar e komuniteta",
    ],
    ageLabel: "Borsha, pashe",
    agePlaceholder: "misal: 72",
    reasonLabel: "Vash soste kames te des svato? (nay musay)",
    reasonPlaceholder: "misal: tatipen 2 divesa, pučhimata vash draba e tensiyonake",
    whatsAppNotice: "Bichhal o chacharipe thaj o linko vi pe WhatsApp",
  },
};

export type BookingTargetType = "self" | "family" | "community";

export interface BookingPartyData {
  bookingType: BookingTargetType;
  patientName: string;
  patientPhone: string;
  proxyRelation?: string;
  patientAge?: string;
  reasonForVisit?: string;
  sendWhatsApp: boolean;
}

export interface BookingFieldErrors {
  patientName?: string;
  patientPhone?: string;
}

interface FamilyBookingSelectorProps {
  value: BookingPartyData;
  onChange: (updated: BookingPartyData) => void;
  errors?: BookingFieldErrors;
  onFieldBlur?: (field: keyof BookingFieldErrors, relatedTarget: EventTarget | null) => void;
}

export function FamilyBookingSelector({ value, onChange, errors, onFieldBlur }: FamilyBookingSelectorProps) {
  const { lang } = useSafeLanguage();
  const copy = familyCopy[lang] ?? familyCopy.ro;

  const handleTypeChange = (type: BookingTargetType) => {
    onChange({
      ...value,
      bookingType: type,
    });
  };

  const handleFieldChange = (field: keyof BookingPartyData, val: unknown) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const nameInvalid = Boolean(errors?.patientName);
  const phoneInvalid = Boolean(errors?.patientPhone);

  return (
    <div className="space-y-5">
      {/* Who the booking is for: one choice, so radio rows on one surface. */}
      <fieldset>
        <legend className="mb-2 block text-body font-semibold text-foreground">{copy.title}</legend>
        <div className="divide-y divide-border rounded-lg border border-border-control">
          {(
            [
              ["self", copy.self, UserIcon],
              ["family", copy.family, UsersIcon],
              ["community", copy.community, UsersIcon],
            ] as const
          ).map(([type, label, Icon]) => {
            const selected = value.bookingType === type;
            return (
              <label
                key={type}
                className="press-row flex min-h-12 cursor-pointer items-center gap-3 px-3.5 py-2.5 text-body transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none first:rounded-t-lg last:rounded-b-lg hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring"
              >
                <input
                  type="radio"
                  name="booking-for"
                  value={type}
                  checked={selected}
                  onChange={() => handleTypeChange(type)}
                  className="h-4 w-4 shrink-0 accent-foreground focus-visible:outline-none"
                />
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className={selected ? "font-semibold text-foreground" : "text-foreground"}>{label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Primary fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="patientName" className="mb-1.5 block text-body font-semibold text-foreground">
            {value.bookingType === "self" ? copy.nameLabelSelf : copy.nameLabelOther} <span aria-hidden="true">*</span>
          </label>
          <input
            id="patientName"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={nameInvalid}
            aria-describedby={nameInvalid ? "patientName-error" : undefined}
            value={value.patientName}
            onChange={(e) => handleFieldChange("patientName", e.target.value)}
            onBlur={(e) => onFieldBlur?.("patientName", e.relatedTarget)}
            placeholder={copy.namePlaceholder}
            className="field-focus min-h-12 w-full rounded-lg border border-border-control bg-background px-3 py-2 text-body text-foreground placeholder:text-muted-foreground"
          />
          {errors?.patientName ? (
            <p id="patientName-error" role="alert" className="swap-in mt-1.5 text-meta font-medium text-primary dark:text-ruby-300">
              {errors.patientName}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="patientPhone" className="mb-1.5 block text-body font-semibold text-foreground">
            {copy.phoneLabel} <span aria-hidden="true">*</span>
          </label>
          <input
            id="patientPhone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            aria-required="true"
            aria-invalid={phoneInvalid}
            aria-describedby={phoneInvalid ? "patientPhone-error" : undefined}
            value={value.patientPhone}
            onChange={(e) => handleFieldChange("patientPhone", e.target.value)}
            onBlur={(e) => onFieldBlur?.("patientPhone", e.relatedTarget)}
            placeholder={copy.phonePlaceholder}
            className="field-focus min-h-12 w-full rounded-lg border border-border-control bg-background px-3 py-2 text-body text-foreground placeholder:text-muted-foreground"
          />
          {errors?.patientPhone ? (
            <p id="patientPhone-error" role="alert" className="swap-in mt-1.5 text-meta font-medium text-primary dark:text-ruby-300">
              {errors.patientPhone}
            </p>
          ) : null}
        </div>
      </div>

      {/* Conditional Proxy Fields */}
      {value.bookingType !== "self" && (
        <fieldset className="border-t border-border pt-5">
          <legend className="float-left mb-1 w-full text-body font-semibold text-foreground">{copy.assistedDataTitle}</legend>

          <div className="clear-both grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
            <div>
              <label htmlFor="proxyRelation" className="mb-1.5 block text-body font-medium text-foreground">
                {copy.relationLabel}
              </label>
              <select
                id="proxyRelation"
                value={value.proxyRelation || ""}
                onChange={(e) => handleFieldChange("proxyRelation", e.target.value)}
                className="field-focus min-h-12 w-full rounded-lg border border-border-control bg-background px-3 py-2 text-body text-foreground"
              >
                <option value="">{copy.relationPlaceholder}</option>
                {copy.relations.map((relation) => (
                  <option key={relation} value={relation}>
                    {relation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="patientAge" className="mb-1.5 block text-body font-medium text-foreground">
                {copy.ageLabel}
              </label>
              <input
                id="patientAge"
                type="text"
                inputMode="numeric"
                value={value.patientAge || ""}
                onChange={(e) => handleFieldChange("patientAge", e.target.value)}
                placeholder={copy.agePlaceholder}
                className="field-focus min-h-12 w-full rounded-lg border border-border-control bg-background px-3 py-2 text-body text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* Reason for consultation */}
      <div>
        <label htmlFor="reasonForVisit" className="mb-1.5 block text-body font-semibold text-foreground">
          {copy.reasonLabel}
        </label>
        <textarea
          id="reasonForVisit"
          rows={2}
          value={value.reasonForVisit || ""}
          onChange={(e) => handleFieldChange("reasonForVisit", e.target.value)}
          placeholder={copy.reasonPlaceholder}
          className="field-focus w-full rounded-lg border border-border-control bg-background px-3 py-2 text-body text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* WhatsApp delivery checkbox: full-row min-h-12 clickable label hit envelope */}
      <label
        htmlFor="sendWhatsApp"
        className="press-row flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg border border-border-control bg-background px-3.5 py-2.5 text-body transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring"
      >
        <input
          id="sendWhatsApp"
          type="checkbox"
          checked={value.sendWhatsApp}
          onChange={(e) => handleFieldChange("sendWhatsApp", e.target.checked)}
          className="h-5 w-5 shrink-0 rounded border-border-control accent-sapphire focus-visible:outline-none"
        />
        <span className="text-body text-foreground">{copy.whatsAppNotice}</span>
      </label>
    </div>
  );
}
