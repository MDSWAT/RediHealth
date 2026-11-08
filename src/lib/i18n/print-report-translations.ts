import type { Lang } from "@/lib/i18n/translations";

type PrintReportCopy = {
  title: string;
  backToProfile: string;
  printSave: string;
  clinicName: string;
  subtitle: string;
  confidential: string;
  reportDate: string;
  recordId: string;
  s1: string;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  careStatus: string;
  address: string;
  notSpecified: string;
  active: string;
  inactive: string;
  archived: string;
  s2: string;
  s3: string;
  noFollowups: string;
  scheduledDate: string;
  goal: string;
  status: string;
  notes: string;
  scheduled: string;
  completed: string;
  cancelled: string;
  s4: string;
  symptoms: string;
  history: string;
  noneRecorded: string;
  s5: string;
  signature: string;
  authorizedWorker: string;
  generatedBy: string;
  strictlyConfidential: string;
};

export const printReportTranslations: Record<Lang, PrintReportCopy> = {
  en: {
    title: "Patient report",
    backToProfile: "Back to patient",
    printSave: "Print or save PDF",
    clinicName: "RediHealth",
    subtitle: "Patient details, care and medical history",
    confidential: "Confidential medical record",
    reportDate: "Report date",
    recordId: "Record number",
    s1: "1. Patient details",
    fullName: "Full name:",
    phone: "Phone:",
    email: "Email:",
    dob: "Date of birth:",
    gender: "Gender:",
    careStatus: "Care status:",
    address: "Address:",
    notSpecified: "Not given",
    active: "In care",
    inactive: "Inactive",
    archived: "Archived",
    s2: "2. Treatment plans",
    s3: "3. Follow-ups",
    noFollowups: "No follow-ups recorded.",
    scheduledDate: "Date",
    goal: "Reason",
    status: "Status",
    notes: "Clinical notes",
    scheduled: "Planned",
    completed: "Done",
    cancelled: "Cancelled",
    s4: "4. Symptoms and medical history",
    symptoms: "First request and symptoms:",
    history: "Medical history and allergies:",
    noneRecorded: "None recorded.",
    s5: "5. Images and documents",
    signature: "Staff signature:",
    authorizedWorker: "Authorized staff member",
    generatedBy: "Made with RediHealth",
    strictlyConfidential: "Confidential document",
  },
  ro: {
    title: "Raportul pacientului",
    backToProfile: "Înapoi la pacient",
    printSave: "Tipărește sau salvează PDF",
    clinicName: "RediHealth",
    subtitle: "Datele pacientului, îngrijirea și istoricul medical",
    confidential: "Dosar medical confidențial",
    reportDate: "Data raportului",
    recordId: "Număr dosar",
    s1: "1. Datele pacientului",
    fullName: "Nume și prenume:",
    phone: "Telefon:",
    email: "Email:",
    dob: "Data nașterii:",
    gender: "Gen:",
    careStatus: "Status îngrijire:",
    address: "Adresă:",
    notSpecified: "Necompletat",
    active: "În îngrijire",
    inactive: "Inactiv",
    archived: "Arhivat",
    s2: "2. Planuri de tratament",
    s3: "3. Controale",
    noFollowups: "Nu există controale înregistrate.",
    scheduledDate: "Data",
    goal: "Motiv",
    status: "Status",
    notes: "Note clinice",
    scheduled: "Programat",
    completed: "Efectuat",
    cancelled: "Anulat",
    s4: "4. Simptome și istoric medical",
    symptoms: "Prima solicitare și simptome:",
    history: "Istoric medical și alergii:",
    noneRecorded: "Nimic înregistrat.",
    s5: "5. Imagini și documente",
    signature: "Semnătura personalului:",
    authorizedWorker: "Membru autorizat al personalului",
    generatedBy: "Generat cu RediHealth",
    strictlyConfidential: "Document confidențial",
  },
  sq: {
    title: "Raporti i pacientit",
    backToProfile: "Kthehu te pacienti",
    printSave: "Printo ose ruaj PDF",
    clinicName: "RediHealth",
    subtitle: "Të dhënat e pacientit, kujdesi dhe historiku mjekësor",
    confidential: "Dosje mjekësore konfidenciale",
    reportDate: "Data e raportit",
    recordId: "Numri i dosjes",
    s1: "1. Të dhënat e pacientit",
    fullName: "Emri dhe mbiemri:",
    phone: "Telefoni:",
    email: "Email:",
    dob: "Datëlindja:",
    gender: "Gjinia:",
    careStatus: "Statusi i kujdesit:",
    address: "Adresa:",
    notSpecified: "Pa plotësuar",
    active: "Në kujdes",
    inactive: "Joaktiv",
    archived: "Arkivuar",
    s2: "2. Planet e trajtimit",
    s3: "3. Kontrollet",
    noFollowups: "Nuk ka kontrolle të regjistruara.",
    scheduledDate: "Data",
    goal: "Arsyeja",
    status: "Statusi",
    notes: "Shënime klinike",
    scheduled: "Planifikuar",
    completed: "Kryer",
    cancelled: "Anuluar",
    s4: "4. Simptomat dhe historiku mjekësor",
    symptoms: "Kërkesa e parë dhe simptomat:",
    history: "Historiku mjekësor dhe alergjitë:",
    noneRecorded: "Asgjë e regjistruar.",
    s5: "5. Imazhe dhe dokumente",
    signature: "Nënshkrimi i stafit:",
    authorizedWorker: "Anëtar i autorizuar i stafit",
    generatedBy: "Krijuar me RediHealth",
    strictlyConfidential: "Dokument konfidencial",
  },
  it: {
    title: "Rapporto del paziente",
    backToProfile: "Torna al paziente",
    printSave: "Stampa o salva PDF",
    clinicName: "RediHealth",
    subtitle: "Dati del paziente, cure e storia clinica",
    confidential: "Cartella clinica riservata",
    reportDate: "Data del rapporto",
    recordId: "Numero scheda",
    s1: "1. Dati del paziente",
    fullName: "Nome e cognome:",
    phone: "Telefono:",
    email: "Email:",
    dob: "Data di nascita:",
    gender: "Genere:",
    careStatus: "Stato delle cure:",
    address: "Indirizzo:",
    notSpecified: "Non indicato",
    active: "In cura",
    inactive: "Inattivo",
    archived: "Archiviato",
    s2: "2. Piani di trattamento",
    s3: "3. Controlli",
    noFollowups: "Nessun controllo registrato.",
    scheduledDate: "Data",
    goal: "Motivo",
    status: "Stato",
    notes: "Note cliniche",
    scheduled: "Programmato",
    completed: "Fatto",
    cancelled: "Annullato",
    s4: "4. Sintomi e storia clinica",
    symptoms: "Prima richiesta e sintomi:",
    history: "Storia clinica e allergie:",
    noneRecorded: "Niente di registrato.",
    s5: "5. Immagini e documenti",
    signature: "Firma dell'operatore:",
    authorizedWorker: "Operatore autorizzato",
    generatedBy: "Creato con RediHealth",
    strictlyConfidential: "Documento riservato",
  },
};
