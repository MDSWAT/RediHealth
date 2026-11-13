"use client";

import { useState, useRef } from "react";
import {
  CheckCircleIcon,
  AlertCircleIcon,
  CameraIcon,
  HeartIcon,
  DropletIcon,
  UsersIcon,
  ActivityIcon,
  UserIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
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
const SYMPTOM_CATEGORIES: { id: SymptomCategoryId; apiValue: string; Icon: typeof HeartIcon }[] = [
  { id: "inima", apiValue: "Dureri de inimă sau tensiune", Icon: HeartIcon },
  { id: "diabet", apiValue: "Diabet sau sete excesivă", Icon: DropletIcon },
  { id: "sarcina", apiValue: "Sarcină sau sănătatea mamei", Icon: UsersIcon },
  { id: "respirator", apiValue: "Tuse prelungită sau lipsă de aer", Icon: ActivityIcon },
  { id: "copil", apiValue: "Copil bolnav sau vaccinuri", Icon: UserIcon },
  { id: "general", apiValue: "Alte probleme de sănătate", Icon: StethoscopeIcon },
];

const intakeCopy = {
  ru: {
    categories: {
      inima: "Боль в сердце или кровяное давление",
      diabet: "Диабет или сильная жажда",
      sarcina: "Беременность или здоровье матери",
      respirator: "Длительный кашель или одышка",
      copil: "Больной ребенок или вакцины",
      general: "Другая проблема со здоровьем",
    } as Record<SymptomCategoryId, string>,
    title: "Зарегистрировать пациента",
    stepOf: (n: number) => `Шаг ${n} из 3`,
    scriptLabel: "Что ты можешь сказать",
    script: "\"Здравствуйте. Я здесь, чтобы помочь. Что вас беспокоит больше всего и с каких пор?\"",
    nameLabel: "Имя пациента *",
    namePlaceholder: "например Василе Станеску",
    ageLabel: "Возраст (приблизительный)",
    agePlaceholder: "например 64",
    categoryLabel: "Основная проблема",
    complaintLabel: "Что говорит пациент своими словами",
    complaintPlaceholder: "например головная боль в течение 3 дней, головокружение при вставании",
    nameRequired: "Введите имя пациента.",
    next: "Продолжить",
    back: "Назад",
    documentTitle: "Сфотографируйте документ, удостоверяющий личность",
    documentBody: "Если у пациента есть удостоверение личности или сертификат, сфотографируйте его на планшет. Если у них нет документов, переходите к следующему шагу.",
    documentAlt: "Фотография документа, удостоверяющего личность",
    retakePhoto: "Переснять фото",
    captureTitle: "Сфотографируйте документ",
    captureHint: "Нажмите, чтобы открыть камеру.",
    phoneLabel: "Мобильный телефон (пациента или семьи) *",
    phoneHelp: "Консультации и ссылки врача приходят по СМС на этот номер.",
    countyLabel: "Округ",
    localityLabel: "Город или деревня",
    summaryPatient: "Пациент:",
    ageUnknown: "возраст не указан",
    summaryProblem: "Проблема:",
    submitting: "Сохранение…",
    submit: "Спасти пациента",
    missingFields: "Введите имя пациента и контактный номер.",
    saveError: "Пациента не удалось спасти. Попробуйте еще раз.",
    successTitle: "Пациент зарегистрирован",
    accountNote: "У аккаунта нет электронной почты и он привязан к этому номеру:",
    addAnother: "Добавить еще одного пациента",
  },

  ro: {
    categories: {
      inima: "Durere de inimă sau tensiune",
      diabet: "Diabet sau sete mare",
      sarcina: "Sarcină sau sănătatea mamei",
      respirator: "Tuse lungă sau lipsă de aer",
      copil: "Copil bolnav sau vaccinuri",
      general: "Altă problemă de sănătate",
    } as Record<SymptomCategoryId, string>,
    title: "Înregistrează un pacient",
    stepOf: (n: number) => `Pasul ${n} din 3`,
    scriptLabel: "Ce poți spune",
    script: "„Bună ziua. Sunt aici să vă ajut. Ce vă supără cel mai tare și de când?”",
    nameLabel: "Numele pacientului *",
    namePlaceholder: "ex.: Vasile Stănescu",
    ageLabel: "Vârsta (aproximativ)",
    agePlaceholder: "ex.: 64 de ani",
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
    localityLabel: "Localitate sau sat",
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
      inima: "Heart pain or blood pressure",
      diabet: "Diabetes or strong thirst",
      sarcina: "Pregnancy or mother's health",
      respirator: "Long cough or short of breath",
      copil: "Sick child or vaccines",
      general: "Other health problem",
    } as Record<SymptomCategoryId, string>,
    title: "Register a patient",
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
    captureTitle: "Photograph the document",
    captureHint: "Tap to open the camera.",
    phoneLabel: "Mobile phone (patient or family) *",
    phoneHelp: "The doctor's advice and links are sent by SMS to this number.",
    countyLabel: "County",
    localityLabel: "Town or village",
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
      inima: "Dhimbje zemre ose tension",
      diabet: "Diabet ose etje e madhe",
      sarcina: "Shtatzëni ose shëndeti i nënës",
      respirator: "Kollë e gjatë ose mungesë ajri",
      copil: "Fëmijë i sëmurë ose vaksina",
      general: "Problem tjetër shëndetësor",
    } as Record<SymptomCategoryId, string>,
    title: "Regjistro një pacient",
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
    localityLabel: "Qyteti ose fshati",
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
      inima: "Dolore al cuore o pressione",
      diabet: "Diabete o molta sete",
      sarcina: "Gravidanza o salute della mamma",
      respirator: "Tosse lunga o fiato corto",
      copil: "Bambino malato o vaccini",
      general: "Altro problema di salute",
    } as Record<SymptomCategoryId, string>,
    title: "Registra un paziente",
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
    captureTitle: "Fotografa il documento",
    captureHint: "Tocca per aprire la fotocamera.",
    phoneLabel: "Cellulare (paziente o familiare) *",
    phoneHelp: "I consigli del medico e i link arrivano via SMS a questo numero.",
    countyLabel: "Provincia",
    localityLabel: "Comune o paese",
    summaryPatient: "Paziente:",
    ageUnknown: "età non indicata",
    summaryProblem: "Problema:",
    submitting: "Salvataggio…",
    submit: "Salva il paziente",
    missingFields: "Scrivi il nome del paziente e un numero di contatto.",
    saveError: "Il paziente non è stato salvato. Riprova.",
    successTitle: "Paziente registrato",
    accountNote: "L'account non ha email ed è collegato al numero:",
    addAnother: "Aggiungi un paziente",
  },
  hr: {
    categories: {
      inima: "Bol u prsima ili krvni tlak",
      diabet: "Šećerna bolest ili jaka žeđ",
      sarcina: "Trudnoća ili zdravlje majke",
      respirator: "Dugotrajan kašalj ili nedostatak zraka",
      copil: "Bolesno dijete ili cijepljenje",
      general: "Druga zdravstvena poteškoća",
    } as Record<SymptomCategoryId, string>,
    title: "Upis pacijenta",
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
    localityLabel: "Grad ili naselje",
    summaryPatient: "Pacijent:",
    ageUnknown: "dob nije navedena",
    summaryProblem: "Poteškoća:",
    submitting: "Spremanje…",
    submit: "Spremi pacijenta",
    missingFields: "Upišite ime pacijenta i kontakt broj.",
    saveError: "Pacijent nije spremljen. Pokušajte ponovno.",
    successTitle: "Pacijent je upisan",
    accountNote: "Račun nema adresu e-pošte i povezan je s brojem:",
    addAnother: "Dodaj drugog pacijenta",
  },
  rom: {
    categories: {
      inima: "Dukh ko ilo vay phurdimos e ratesko (tensiyona)",
      diabet: "Zaharo (diabeto) vay bari trush",
      sarcina: "Pharipe vay sastipen e dayako",
      respirator: "Lungo xasipe vay pharo phurdipe",
      copil: "Nasvalo chhavoro vay vakcine",
      general: "Aver sastipnasko pharipen",
    } as Record<SymptomCategoryId, string>,
    title: "Lekhav ekhe pacientes",
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
    retakePhoto: "Ker e poza palem",
    captureTitle: "Ker poza e lileske",
    captureHint: "Azba te putres e kamera.",
    phoneLabel: "Mobilno telefono (paciento vay familiya) *",
    phoneHelp: "E sikavimata e doktoreske thaj e linkurya aven katar SMS pe kadava gin.",
    countyLabel: "Zhudeco / Regiyona",
    localityLabel: "Foro vay gav",
    summaryPatient: "Paciento:",
    ageUnknown: "borsha bi-zhande",
    summaryProblem: "Pharipen:",
    submitting: "Arakhel pes…",
    submit: "Arakh e pacientes",
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

export function ProxyPatientIntakeWizard({ onSuccess }: ProxyPatientIntakeWizardProps) {
  const { lang } = useSafeLanguage();
  const copy = intakeCopy[lang] ?? intakeCopy.ro;

  // Wizard steps: 1 = oral interview & symptoms, 2 = ID photo capture, 3 = contact & confirm
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategoryId>(SYMPTOM_CATEGORIES[0].id);
  const selectedCategoryApiValue =
    SYMPTOM_CATEGORIES.find((cat) => cat.id === selectedCategory)?.apiValue ?? SYMPTOM_CATEGORIES[0].apiValue;
  const [complaintText, setComplaintText] = useState("");

  const [idDocumentData, setIdDocumentData] = useState<string | null>(null);
  const [familyPhone, setFamilyPhone] = useState("");
  const [county, setCounty] = useState("Galați");
  const [locality, setLocality] = useState("Toflea");

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
          county,
          locality,
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
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire">
          <CheckCircleIcon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">
          {copy.successTitle}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {successInfo.message}
        </p>
        <div className="mt-4 rounded-md bg-muted p-3 text-xs">
          <span>{copy.accountNote} <strong>{familyPhone}</strong></span>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setFullName("");
              setAge("");
              setComplaintText("");
              setIdDocumentData(null);
              setFamilyPhone("");
              setSuccessInfo(null);
            }}
            className="min-h-[44px] rounded-lg bg-sapphire px-4 py-2 text-xs font-semibold text-white hover:bg-sapphire-light"
          >
            {copy.addAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xs">
      {/* Wizard Step Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {copy.title}
          </h2>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {copy.stepOf(step)}
        </span>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Oral interview & symptom touch cards */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Oral script box */}
          <div className="rounded-lg border border-sapphire/20 bg-sapphire/5 p-3.5 text-xs text-foreground">
            <p className="font-semibold text-sapphire dark:text-sapphire-border">
              {copy.scriptLabel}
            </p>
            <p className="mt-1 italic leading-relaxed text-muted-foreground">
              {copy.script}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {copy.nameLabel}
              </label>
              <input
                type="text"
                required
                aria-label={copy.nameLabel}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={copy.namePlaceholder}
                className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {copy.ageLabel}
              </label>
              <input
                type="text"
                aria-label={copy.ageLabel}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={copy.agePlaceholder}
                className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {copy.categoryLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SYMPTOM_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-h-[48px] flex items-center gap-2.5 whitespace-nowrap rounded-lg border p-3 text-left text-xs font-medium transition-colors duration-[var(--dur-fast)] ${
                      isSelected
                        ? "border-sapphire bg-sapphire text-white shadow-xs font-semibold"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    <cat.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{copy.categories[cat.id]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {copy.complaintLabel}
            </label>
            <textarea
              rows={2}
              aria-label={copy.complaintLabel}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder={copy.complaintPlaceholder}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
            />
          </div>

          <div className="pt-2 flex justify-end">
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
              className="min-h-[44px] whitespace-nowrap rounded-lg bg-foreground px-5 py-2 text-xs font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {copy.next}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Document / CI photo capture */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-foreground">
            <p className="font-semibold text-foreground">
              {copy.documentTitle}
            </p>
            <p className="mt-1 text-muted-foreground leading-relaxed">
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
            <div className="rounded-lg border border-border p-4 text-center bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={idDocumentData}
                alt={copy.documentAlt}
                className="max-h-52 mx-auto rounded-md object-contain border border-border shadow-xs"
              />
              <button
                type="button"
                onClick={() => setIdDocumentData(null)}
                className="mt-3 whitespace-nowrap text-xs font-semibold text-sapphire underline-offset-4 hover:underline"
              >
                {copy.retakePhoto}
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-center hover:border-foreground/30 transition-colors"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-sapphire">
                <CameraIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-foreground">
                {copy.captureTitle}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {copy.captureHint}
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[44px] whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.back}
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="min-h-[44px] whitespace-nowrap rounded-lg bg-foreground px-5 py-2 text-xs font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {copy.next}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact & final submit */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {copy.phoneLabel}
            </label>
            <input
              type="tel"
              required
              aria-label={copy.phoneLabel}
              value={familyPhone}
              onChange={(e) => setFamilyPhone(e.target.value)}
              placeholder="0721 000 000"
              className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {copy.phoneHelp}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">{copy.countyLabel}</label>
              <input
                type="text"
                aria-label={copy.countyLabel}
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">{copy.localityLabel}</label>
              <input
                type="text"
                aria-label={copy.localityLabel}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
              />
            </div>
          </div>

          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            {copy.summaryPatient} <strong>{fullName}</strong> ({age || copy.ageUnknown}), {copy.summaryProblem} <strong>{copy.categories[selectedCategory]}</strong>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[44px] whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.back}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="min-h-[44px] whitespace-nowrap rounded-lg bg-foreground px-6 py-2 text-xs font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {isSubmitting ? copy.submitting : copy.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
