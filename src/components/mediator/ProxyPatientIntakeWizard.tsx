"use client";

import { useId, useRef, useState } from "react";
import { CameraIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

interface ProxyPatientIntakeWizardProps {
  onSuccess?: (patientData: { patientId: number | string; fullName: string }) => void;
  onCancel?: () => void;
}

type SymptomCategoryId = "inima" | "diabet" | "sarcina" | "respirator" | "copil" | "general";

// apiValue is the value stored by /api/mediatori/intake. Keep it unchanged; only the label is localized.
const SYMPTOM_CATEGORIES: { id: SymptomCategoryId; apiValue: string }[] = [
  { id: "inima", apiValue: "Dureri de inimă sau tensiune" },
  { id: "diabet", apiValue: "Diabet sau sete excesivă" },
  { id: "sarcina", apiValue: "Sarcină sau sănătatea mamei" },
  { id: "respirator", apiValue: "Tuse prelungită sau lipsă de aer" },
  { id: "copil", apiValue: "Copil bolnav sau vaccinuri" },
  { id: "general", apiValue: "Alte probleme de sănătate" },
];

const intakeCopy = {
  ru: {
    categories: {
      inima: "Сердце или давление",
      diabet: "Диабет или жажда",
      sarcina: "Беременность и мама",
      respirator: "Кашель или одышка",
      copil: "Ребёнок или прививки",
      general: "Другой вопрос",
    } as Record<SymptomCategoryId, string>,
    stepOf: (n: number) => `Шаг ${n} из 3`,
    scriptLabel: "Что можно сказать",
    script: "«Здравствуйте. Я здесь, чтобы помочь. Что беспокоит вас больше всего и с каких пор?»",
    nameLabel: "Имя пациента *",
    namePlaceholder: "Например: Василе Стэнеску",
    ageLabel: "Возраст (примерно)",
    agePlaceholder: "Например: 64",
    categoryLabel: "Основная проблема",
    complaintLabel: "Что говорит пациент своими словами",
    complaintPlaceholder: "Например: головная боль 3 дня, головокружение при вставании",
    nameRequired: "Введите имя пациента.",
    next: "Продолжить",
    back: "Назад",
    documentTitle: "Фото документа, удостоверяющего личность",
    documentBody: "Если у пациента есть удостоверение личности или справка, сделайте фото на планшет. Если документов нет, перейдите к следующему шагу.",
    documentAlt: "Фотография документа, удостоверяющего личность",
    retakePhoto: "Переснять фото",
    captureTitle: "Сделать фото документа",
    captureHint: "Нажмите, чтобы открыть камеру.",
    phoneLabel: "Мобильный телефон (пациента или семьи) *",
    phoneHelp: "Рекомендации врача и ссылки приходят по SMS на этот номер.",
    countyLabel: "Округ или область",
    countyPlaceholder: "Например: Галац",
    localityLabel: "Город или село",
    localityPlaceholder: "Название населённого пункта",
    summaryPatient: "Пациент:",
    ageUnknown: "возраст не указан",
    summaryProblem: "Проблема:",
    submitting: "Сохранение…",
    submit: "Сохранить пациента",
    missingFields: "Введите имя пациента и контактный номер.",
    saveError: "Не удалось сохранить пациента. Попробуйте ещё раз.",
    successTitle: "Пациент зарегистрирован",
    accountNote: "Аккаунт без электронной почты привязан к номеру:",
    addAnother: "Добавить ещё пациента",
  },
  ro: {
    categories: {
      inima: "Inimă sau tensiune",
      diabet: "Diabet sau sete",
      sarcina: "Sarcină și mamă",
      respirator: "Tuse sau lipsă de aer",
      copil: "Copil sau vaccinuri",
      general: "Altă problemă",
    } as Record<SymptomCategoryId, string>,
    stepOf: (n: number) => `Pasul ${n} din 3`,
    scriptLabel: "Ce poți spune",
    script: "„Bună ziua. Sunt aici să vă ajut. Ce vă supără cel mai tare și de când?”",
    nameLabel: "Numele pacientului *",
    namePlaceholder: "ex.: Vasile Stănescu",
    ageLabel: "Vârsta (aproximativ)",
    agePlaceholder: "ex.: 64 ani",
    categoryLabel: "Problema principală",
    complaintLabel: "Ce spune pacientul, cu cuvintele lui",
    complaintPlaceholder: "ex.: îl doare capul de 3 zile și amețește când se ridică",
    nameRequired: "Scrie numele pacientului.",
    next: "Continuă",
    back: "Înapoi",
    documentTitle: "Fotografiază actul de identitate",
    documentBody: "Dacă pacientul are buletin sau adeverință, fotografiază actul cu tableta. Dacă nu are acte, treci la pasul următor.",
    documentAlt: "Fotografia actului de identitate",
    retakePhoto: "Refă fotografia",
    captureTitle: "Fotografiază actul",
    captureHint: "Apasă ca să deschizi camera.",
    phoneLabel: "Telefon mobil (pacient sau familie) *",
    phoneHelp: "Sfaturile medicului și linkurile vin prin SMS la acest număr.",
    countyLabel: "Județ",
    countyPlaceholder: "ex.: Galați",
    localityLabel: "Localitate sau sat",
    localityPlaceholder: "Numele localității",
    summaryPatient: "Pacient:",
    ageUnknown: "vârstă necunoscută",
    summaryProblem: "Problemă:",
    submitting: "Se salvează…",
    submit: "Salvează pacientul",
    missingFields: "Completează numele pacientului și un număr de contact.",
    saveError: "Pacientul nu s-a salvat. Încearcă din nou.",
    successTitle: "Pacient înregistrat",
    accountNote: "Contul nu are email și e legat de numărul:",
    addAnother: "Adaugă alt pacient",
  },
  en: {
    categories: {
      inima: "Heart or blood pressure",
      diabet: "Diabetes or thirst",
      sarcina: "Pregnancy or maternal",
      respirator: "Cough or breathing",
      copil: "Sick child or vaccines",
      general: "Other health issue",
    } as Record<SymptomCategoryId, string>,
    stepOf: (n: number) => `Step ${n} of 3`,
    scriptLabel: "What you can say",
    script: "“Hello. I'm here to help. What bothers you most, and since when?”",
    nameLabel: "Patient name *",
    namePlaceholder: "e.g. Vasile Stănescu",
    ageLabel: "Age (approximate)",
    agePlaceholder: "e.g. 64",
    categoryLabel: "Main problem",
    complaintLabel: "What the patient says, in their own words",
    complaintPlaceholder: "e.g. headache for 3 days, dizzy when standing up",
    nameRequired: "Enter the patient's name.",
    next: "Continue",
    back: "Back",
    documentTitle: "Photograph the ID document",
    documentBody: "If the patient has an ID card or certificate, photograph it with the tablet. If they have no documents, go to the next step.",
    documentAlt: "Photo of the ID document",
    retakePhoto: "Retake photo",
    captureTitle: "Photograph document",
    captureHint: "Tap to open the camera.",
    phoneLabel: "Mobile phone (patient or family) *",
    phoneHelp: "The doctor's advice and links are sent by SMS to this number.",
    countyLabel: "County",
    countyPlaceholder: "e.g. Cluj",
    localityLabel: "Town or village",
    localityPlaceholder: "Locality name",
    summaryPatient: "Patient:",
    ageUnknown: "age not given",
    summaryProblem: "Problem:",
    submitting: "Saving…",
    submit: "Save patient",
    missingFields: "Enter the patient's name and a contact number.",
    saveError: "The patient was not saved. Try again.",
    successTitle: "Patient registered",
    accountNote: "The account has no email and is linked to this number:",
    addAnother: "Add another patient",
  },
  sq: {
    categories: {
      inima: "Zemra ose tensioni",
      diabet: "Diabeti ose etja",
      sarcina: "Shtatzënia dhe nëna",
      respirator: "Kolla ose frymëmarrja",
      copil: "Fëmija ose vaksinat",
      general: "Problem tjetër",
    } as Record<SymptomCategoryId, string>,
    stepOf: (n: number) => `Hapi ${n} nga 3`,
    scriptLabel: "Çfarë mund të thuash",
    script: "“Mirëdita. Jam këtu t'ju ndihmoj. Çfarë ju shqetëson më shumë dhe që kur?”",
    nameLabel: "Emri i pacientit *",
    namePlaceholder: "p.sh. Vasile Stănescu",
    ageLabel: "Mosha (përafërsisht)",
    agePlaceholder: "p.sh. 64 vjeç",
    categoryLabel: "Problemi kryesor",
    complaintLabel: "Çfarë thotë pacienti, me fjalët e veta",
    complaintPlaceholder: "p.sh. i dhemb koka prej 3 ditësh dhe i merren mendtë kur ngrihet",
    nameRequired: "Shkruaj emrin e pacientit.",
    next: "Vazhdo",
    back: "Mbrapa",
    documentTitle: "Fotografo dokumentin e identitetit",
    documentBody: "Nëse pacienti ka letërnjoftim ose vërtetim, fotografoje me tabletin. Nëse nuk ka dokumente, kalo te hapi tjetër.",
    documentAlt: "Fotografia e dokumentit të identitetit",
    retakePhoto: "Bëje foton sërish",
    captureTitle: "Fotografo dokumentin",
    captureHint: "Prek për të hapur kamerën.",
    phoneLabel: "Celulari (i pacientit ose i familjes) *",
    phoneHelp: "Këshillat e mjekut dhe lidhjet vijnë me SMS në këtë numër.",
    countyLabel: "Qarku",
    countyPlaceholder: "p.sh. Tiranë",
    localityLabel: "Qyteti ose fshati",
    localityPlaceholder: "Emri i vendbanimit",
    summaryPatient: "Pacienti:",
    ageUnknown: "mosha nuk dihet",
    summaryProblem: "Problemi:",
    submitting: "Po ruhet…",
    submit: "Ruaj pacientin",
    missingFields: "Shkruaj emrin e pacientit dhe një numër kontakti.",
    saveError: "Pacienti nuk u ruajt. Provo përsëri.",
    successTitle: "Pacienti u regjistrua",
    accountNote: "Llogaria nuk ka email dhe është e lidhur me numrin:",
    addAnother: "Shto pacient tjetër",
  },
  it: {
    categories: {
      inima: "Cuore o pressione",
      diabet: "Diabete o sete",
      sarcina: "Gravidanza o mamma",
      respirator: "Tosse o respiro corto",
      copil: "Bambino o vaccini",
      general: "Altro problema",
    } as Record<SymptomCategoryId, string>,
    stepOf: (n: number) => `Passo ${n} di 3`,
    scriptLabel: "Cosa puoi dire",
    script: "“Buongiorno. Sono qui per aiutarla. Che cosa la disturba di più, e da quando?”",
    nameLabel: "Nome del paziente *",
    namePlaceholder: "es. Vasile Stănescu",
    ageLabel: "Età (circa)",
    agePlaceholder: "es. 64 anni",
    categoryLabel: "Problema principale",
    complaintLabel: "Cosa dice il paziente, con parole sue",
    complaintPlaceholder: "es. mal di testa da 3 giorni, capogiri quando si alza",
    nameRequired: "Scrivi il nome del paziente.",
    next: "Continua",
    back: "Indietro",
    documentTitle: "Fotografa il documento d'identità",
    documentBody: "Se il paziente ha la carta d'identità o un certificato, fotografalo con il tablet. Se non ha documenti, vai al passo successivo.",
    documentAlt: "Foto del documento d'identità",
    retakePhoto: "Rifai la foto",
    captureTitle: "Fotografa documento",
    captureHint: "Tocca per aprire la fotocamera.",
    phoneLabel: "Cellulare (paziente o familiare) *",
    phoneHelp: "I consigli del medico e i link arrivano via SMS a questo numero.",
    countyLabel: "Provincia",
    countyPlaceholder: "es. Vicenza",
    localityLabel: "Comune o paese",
    localityPlaceholder: "Nome del comune",
    summaryPatient: "Paziente:",
    ageUnknown: "età non indicata",
    summaryProblem: "Problema:",
    submitting: "Salvataggio…",
    submit: "Salva paziente",
    missingFields: "Scrivi il nome del paziente e un numero di contatto.",
    saveError: "Il paziente non è stato salvato. Riprova.",
    successTitle: "Paziente registrato",
    accountNote: "L'account non ha email ed è collegato al numero:",
    addAnother: "Aggiungi paziente",
  },
  hr: {
    categories: {
      inima: "Srce ili krvni tlak",
      diabet: "Dijabetes ili žeđ",
      sarcina: "Trudnoća i majka",
      respirator: "Kašalj ili zaduha",
      copil: "Dijete ili cijepljenje",
      general: "Druga poteškoća",
    } as Record<SymptomCategoryId, string>,
    stepOf: (n: number) => `Korak ${n} od 3`,
    scriptLabel: "Što možete reći",
    script: "„Dobar dan. Ovdje sam da vam pomognem. Što vas najviše muči i od kada?”",
    nameLabel: "Ime i prezime pacijenta *",
    namePlaceholder: "npr. Ivan Horvat",
    ageLabel: "Dob (okvirno)",
    agePlaceholder: "npr. 64 godine",
    categoryLabel: "Glavna poteškoća",
    complaintLabel: "Što pacijent kaže svojim riječima",
    complaintPlaceholder: "npr. glavobolja traje 3 dana, vrtoglavica pri ustajanju",
    nameRequired: "Upišite ime pacijenta.",
    next: "Nastavi",
    back: "Natrag",
    documentTitle: "Fotografirajte osobni dokument",
    documentBody: "Ako pacijent ima osobnu iskaznicu ili potvrdu, fotografirajte dokument tabletom. Ako nema dokumente, prijeđite na sljedeći korak.",
    documentAlt: "Fotografija osobnog dokumenta",
    retakePhoto: "Ponovi fotografiju",
    captureTitle: "Fotografiraj dokument",
    captureHint: "Dodirnite za otvaranje kamere.",
    phoneLabel: "Broj mobitela (pacijent ili obitelj) *",
    phoneHelp: "Upute liječnika i poveznice stižu SMS porukom na ovaj broj.",
    countyLabel: "Županija",
    countyPlaceholder: "npr. Međimurska",
    localityLabel: "Grad ili naselje",
    localityPlaceholder: "Naziv mjesta",
    summaryPatient: "Pacijent:",
    ageUnknown: "dob nije navedena",
    summaryProblem: "Poteškoća:",
    submitting: "Spremanje…",
    submit: "Spremi pacijenta",
    missingFields: "Upišite ime pacijenta i kontakt broj.",
    saveError: "Pacijent nije spremljen. Pokušajte ponovno.",
    successTitle: "Pacijent je upisan",
    accountNote: "Račun nema adresu e-pošte i povezan je s brojem:",
    addAnother: "Dodaj pacijenta",
  },
  rom: {
    categories: {
      inima: "Ilo vay tensiyona",
      diabet: "Diabeto vay trush",
      sarcina: "Pharipe thaj day",
      respirator: "Xasipe vay pharo phurdipe",
      copil: "Chhavoro vay vakcine",
      general: "Aver pharipen",
    } as Record<SymptomCategoryId, string>,
    stepOf: (n: number) => `Phiripen ${n} katar 3`,
    scriptLabel: "So shay te phenes",
    script: "„Lacho dives. Sem kathe te zhutisarav tumen. So dukhal tumen nay-but thaj katar kana?”",
    nameLabel: "Anav e pacientesko *",
    namePlaceholder: "misal: Vasile Stănescu",
    ageLabel: "Borsha (pashe)",
    agePlaceholder: "misal: 64 borsha",
    categoryLabel: "Angluno pharipen",
    complaintLabel: "So phenel o paciento, peske lavenca",
    complaintPlaceholder: "misal: dukhal les o shero 3 divesa thaj phiravel pes lesko shero kana vazdel pes",
    nameRequired: "Lekhav o anav e pacientesko.",
    next: "Zha may dur",
    back: "Palpale",
    documentTitle: "Ker poza e identiteteske lileske",
    documentBody: "Te si e pacientes buletino vay adeverinca, ker poza e tabletesa. Te nane les lila, nakh ko aver phiripen.",
    documentAlt: "Poza e identiteteske lileski",
    retakePhoto: "Ker poza palem",
    captureTitle: "Ker poza lileske",
    captureHint: "Azba te putres e kamera.",
    phoneLabel: "Mobilno telefono (paciento vay familiya) *",
    phoneHelp: "E sikavimata e doktoreske thaj e linkurya aven katar SMS pe kadava gin.",
    countyLabel: "Zhudeco",
    countyPlaceholder: "misal: Cluj",
    localityLabel: "Foro vay gav",
    localityPlaceholder: "Anav e gavesko",
    summaryPatient: "Paciento:",
    ageUnknown: "borsha bi-zhande",
    summaryProblem: "Pharipen:",
    submitting: "Arakhel pes…",
    submit: "Arakh pacientes",
    missingFields: "Lekhav o anav e pacientesko thaj telefonesko gin.",
    saveError: "O paciento na arakhadilo. Zumav palem.",
    successTitle: "O paciento sas lekhavdo",
    accountNote: "O konto nane les emailo thaj si phandino e ginesa:",
    addAnother: "Tho aver paciento",
  },
};

interface IntakeSuccessData {
  patientId: number | string;
  message?: string;
  tempPassword?: string;
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

const primaryBtnClass =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#28476f] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]";

const outlineBtnClass =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-4 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

export function ProxyPatientIntakeWizard({ onSuccess }: ProxyPatientIntakeWizardProps) {
  const { lang } = useSafeLanguage();
  const copy = intakeCopy[lang] ?? intakeCopy.ro;
  const baseId = useId();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategoryId>(SYMPTOM_CATEGORIES[0].id);
  const selectedCategoryApiValue =
    SYMPTOM_CATEGORIES.find((cat) => cat.id === selectedCategory)?.apiValue ?? SYMPTOM_CATEGORIES[0].apiValue;
  const [complaintText, setComplaintText] = useState("");

  const [idDocumentData, setIdDocumentData] = useState<string | null>(null);
  const [familyPhone, setFamilyPhone] = useState("");
  const [county, setCounty] = useState("");
  const [locality, setLocality] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<IntakeSuccessData | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDocumentCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setIdDocumentData(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleFinalSubmit = async () => {
    if (!fullName.trim() || !familyPhone.trim()) {
      setErrorMessage(copy.missingFields);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/mediatori/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          age: age.trim() || undefined,
          phone: familyPhone.trim(),
          familyContactPhone: familyPhone.trim(),
          county: county.trim() || undefined,
          locality: locality.trim() || undefined,
          symptomCategory: selectedCategoryApiValue,
          chiefComplaint: complaintText.trim() || undefined,
          documentScanUrl: idDocumentData || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || copy.saveError);
      }

      setSuccessInfo(data);
      if (onSuccess) {
        onSuccess({ patientId: data.patientId, fullName: fullName.trim() });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : copy.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successInfo) {
    return (
      <div role="status" aria-live="polite" className="max-w-xl space-y-3 py-2">
        <h3 className="text-base font-semibold text-[var(--panel-ink)]">
          {copy.successTitle}
        </h3>
        {successInfo.message && (
          <p className="text-sm text-[var(--panel-muted)]">{successInfo.message}</p>
        )}
        <p className="text-sm text-[var(--panel-ink)]">
          <span className="text-[var(--panel-muted)]">{copy.accountNote} </span>
          <strong className="font-semibold tabular-nums">{familyPhone}</strong>
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setFullName("");
              setAge("");
              setComplaintText("");
              setIdDocumentData(null);
              setFamilyPhone("");
              setCounty("");
              setLocality("");
              setSuccessInfo(null);
            }}
            className={primaryBtnClass}
          >
            {copy.addAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <p className="text-sm font-medium tabular-nums text-[var(--panel-muted)]">
        {copy.stepOf(step)}
      </p>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg border border-[#b91c1c]/35 bg-[#b91c1c]/10 px-3.5 py-2.5 text-sm font-medium text-[#b91c1c] dark:border-[#ffb4b4]/35 dark:bg-[#b91c1c]/20 dark:text-[#ffb4b4]"
        >
          {errorMessage}
        </p>
      )}

      {/* Step 1: Oral interview and symptom choices */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="border-t border-[var(--panel-line)] pt-3">
            <p className="text-xs font-semibold text-sapphire dark:text-[#bad7fa]">
              {copy.scriptLabel}
            </p>
            <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-[var(--panel-muted)]">
              {copy.script}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${baseId}-name`}
                className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
              >
                {copy.nameLabel}
              </label>
              <input
                id={`${baseId}-name`}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={copy.namePlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor={`${baseId}-age`}
                className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
              >
                {copy.ageLabel}
              </label>
              <input
                id={`${baseId}-age`}
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={copy.agePlaceholder}
                className={inputClass}
              />
            </div>
          </div>

          <div role="group" aria-labelledby={`${baseId}-cat-label`}>
            <p
              id={`${baseId}-cat-label`}
              className="mb-2 text-sm font-medium text-[var(--panel-ink)]"
            >
              {copy.categoryLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa] ${
                      isSelected
                        ? "border-sapphire bg-sapphire font-semibold text-white"
                        : "border-[#8a94a6] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] dark:border-[var(--panel-line)]"
                    }`}
                  >
                    {copy.categories[cat.id]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor={`${baseId}-complaint`}
              className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
            >
              {copy.complaintLabel}
            </label>
            <textarea
              id={`${baseId}-complaint`}
              rows={2}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder={copy.complaintPlaceholder}
              className={`${inputClass} min-h-[76px]`}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                if (!fullName.trim()) {
                  setErrorMessage(copy.nameRequired);
                  return;
                }
                setErrorMessage("");
                setStep(2);
              }}
              className={primaryBtnClass}
            >
              {copy.next}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Document photo capture */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[var(--panel-ink)]">
              {copy.documentTitle}
            </p>
            <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-[var(--panel-muted)]">
              {copy.documentBody}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleDocumentCapture}
            className="hidden"
          />

          {idDocumentData ? (
            <div className="space-y-3 border-t border-[var(--panel-line)] pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={idDocumentData}
                alt={copy.documentAlt}
                className="max-h-56 rounded-lg border border-[var(--panel-line)] object-contain"
              />
              <div>
                <button
                  type="button"
                  onClick={() => setIdDocumentData(null)}
                  className={outlineBtnClass}
                >
                  {copy.retakePhoto}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#8a94a6] bg-[var(--panel-subtle)] p-6 text-center transition-colors hover:bg-[var(--panel-selection)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]"
            >
              <CameraIcon className="h-5 w-5 text-sapphire dark:text-[#bad7fa]" aria-hidden="true" />
              <span className="whitespace-nowrap text-sm font-semibold text-[var(--panel-ink)]">
                {copy.captureTitle}
              </span>
              <span className="text-xs text-[var(--panel-muted)]">
                {copy.captureHint}
              </span>
            </button>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button type="button" onClick={() => setStep(1)} className={outlineBtnClass}>
              {copy.back}
            </button>
            <button type="button" onClick={() => setStep(3)} className={primaryBtnClass}>
              {copy.next}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact and final submit */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={`${baseId}-phone`}
              className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
            >
              {copy.phoneLabel}
            </label>
            <input
              id={`${baseId}-phone`}
              type="tel"
              inputMode="tel"
              required
              value={familyPhone}
              onChange={(e) => setFamilyPhone(e.target.value)}
              placeholder="0721 000 000"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-[var(--panel-muted)]">
              {copy.phoneHelp}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${baseId}-county`}
                className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
              >
                {copy.countyLabel}
              </label>
              <input
                id={`${baseId}-county`}
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder={copy.countyPlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor={`${baseId}-locality`}
                className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
              >
                {copy.localityLabel}
              </label>
              <input
                id={`${baseId}-locality`}
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder={copy.localityPlaceholder}
                className={inputClass}
              />
            </div>
          </div>

          <p className="border-t border-[var(--panel-line)] pt-3 text-sm text-[var(--panel-muted)]">
            {copy.summaryPatient}{" "}
            <strong className="font-semibold text-[var(--panel-ink)]">{fullName}</strong>{" "}
            ({age || copy.ageUnknown}), {copy.summaryProblem}{" "}
            <strong className="font-semibold text-[var(--panel-ink)]">
              {copy.categories[selectedCategory]}
            </strong>
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button type="button" onClick={() => setStep(2)} className={outlineBtnClass}>
              {copy.back}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className={primaryBtnClass}
            >
              {isSubmitting ? copy.submitting : copy.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
