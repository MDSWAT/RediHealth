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
    agePlaceholder: "ex.: 5 ani, 72 de ani",
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
    agePlaceholder: "e.g. 5 years, 72 years",
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
    agePlaceholder: "p.sh. 5 vjeç, 72 vjeç",
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
    agePlaceholder: "es. 5 anni, 72 anni",
    reasonLabel: "Di cosa vuoi parlare? (facoltativo)",
    reasonPlaceholder: "es. febbre da 2 giorni, dubbi sulle pastiglie per la pressione",
    whatsAppNotice: "Manda conferma e link anche su WhatsApp",
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

interface FamilyBookingSelectorProps {
  value: BookingPartyData;
  onChange: (updated: BookingPartyData) => void;
}

export function FamilyBookingSelector({ value, onChange }: FamilyBookingSelectorProps) {
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

  return (
    <div className="space-y-5">
      {/* Who the booking is for: one choice, so radio rows on one surface. */}
      <fieldset>
        <legend className="mb-2 block text-sm font-semibold text-foreground">{copy.title}</legend>
        <div className="divide-y divide-border rounded-lg border border-border">
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
                className="flex min-h-[48px] cursor-pointer items-center gap-3 px-3.5 py-2.5 text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] first:rounded-t-lg last:rounded-b-lg hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="patientName" className="mb-1.5 block text-sm font-semibold text-foreground">
            {value.bookingType === "self" ? copy.nameLabelSelf : copy.nameLabelOther} <span aria-hidden="true">*</span>
          </label>
          <input
            id="patientName"
            type="text"
            autoComplete="name"
            required
            value={value.patientName}
            onChange={(e) => handleFieldChange("patientName", e.target.value)}
            placeholder={copy.namePlaceholder}
            className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="patientPhone" className="mb-1.5 block text-sm font-semibold text-foreground">
            {copy.phoneLabel} <span aria-hidden="true">*</span>
          </label>
          <input
            id="patientPhone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            value={value.patientPhone}
            onChange={(e) => handleFieldChange("patientPhone", e.target.value)}
            placeholder={copy.phonePlaceholder}
            className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Conditional Proxy Fields */}
      {value.bookingType !== "self" && (
        <fieldset className="border-t border-border pt-5">
          <legend className="float-left mb-1 w-full text-sm font-semibold text-foreground">{copy.assistedDataTitle}</legend>

          <div className="clear-both grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
            <div>
              <label htmlFor="proxyRelation" className="mb-1.5 block text-sm font-medium text-foreground">
                {copy.relationLabel}
              </label>
              <select
                id="proxyRelation"
                value={value.proxyRelation || ""}
                onChange={(e) => handleFieldChange("proxyRelation", e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <label htmlFor="patientAge" className="mb-1.5 block text-sm font-medium text-foreground">
                {copy.ageLabel}
              </label>
              <input
                id="patientAge"
                type="text"
                value={value.patientAge || ""}
                onChange={(e) => handleFieldChange("patientAge", e.target.value)}
                placeholder={copy.agePlaceholder}
                className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* Reason for consultation */}
      <div>
        <label htmlFor="reasonForVisit" className="mb-1.5 block text-sm font-semibold text-foreground">
          {copy.reasonLabel}
        </label>
        <textarea
          id="reasonForVisit"
          rows={2}
          value={value.reasonForVisit || ""}
          onChange={(e) => handleFieldChange("reasonForVisit", e.target.value)}
          placeholder={copy.reasonPlaceholder}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* WhatsApp delivery checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          id="sendWhatsApp"
          type="checkbox"
          checked={value.sendWhatsApp}
          onChange={(e) => handleFieldChange("sendWhatsApp", e.target.checked)}
          className="h-5 w-5 shrink-0 rounded border-border accent-sapphire"
        />
        <label htmlFor="sendWhatsApp" className="cursor-pointer text-sm text-muted-foreground">
          {copy.whatsAppNotice}
        </label>
      </div>
    </div>
  );
}
