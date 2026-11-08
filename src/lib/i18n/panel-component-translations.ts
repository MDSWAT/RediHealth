import type { Lang } from "@/lib/i18n/translations";

export const patientsTableTranslations: Record<Lang, {
  errDelete: string;
  errDeleteUnexpected: string;
  errUpdateStatus: string;
  dismiss: string;
  showing: (visible: number, total: number) => string;
  noneTitle: string;
  noneHint: string;
  worker: string;
  unassigned: string;
  activeCare: string;
  inactive: string;
  archived: string;
  noNotes: string;
  dobMissing: string;
  genderMissing: string;
  deleteQ: string;
  yesDelete: string;
  cancel: string;
  deletePatient: string;
  editProfile: string;
  viewDetails: string;
  closePatient: string;
  closePatientConfirm: string;
  closingPatient: string;
}> = {
  en: {
    errDelete: "Could not delete the patient.",
    errDeleteUnexpected: "Could not delete the patient. Try again.",
    errUpdateStatus: "Could not change the status.",
    dismiss: "Close",
    showing: (v, total) => `${v} of ${total} patients`,
    noneTitle: "No patients",
    noneHint: "Add a patient, or create one from a request.",
    worker: "Assigned to",
    unassigned: "Unassigned",
    activeCare: "In care",
    inactive: "Inactive",
    archived: "Archived",
    noNotes: "No notes yet.",
    dobMissing: "No date of birth",
    genderMissing: "Gender not given",
    deleteQ: "Delete this patient?",
    yesDelete: "Yes, delete",
    cancel: "Cancel",
    deletePatient: "Delete patient",
    editProfile: "Edit",
    viewDetails: "Open",
    closePatient: "Close record",
    closePatientConfirm: "Archive this patient record?",
    closingPatient: "Closing…",
  },
  ro: {
    errDelete: "Pacientul nu a putut fi șters.",
    errDeleteUnexpected: "Pacientul nu a putut fi șters. Încearcă din nou.",
    errUpdateStatus: "Statusul nu a putut fi schimbat.",
    dismiss: "Închide",
    showing: (v, total) => `${v} din ${total} pacienți`,
    noneTitle: "Nu există pacienți",
    noneHint: "Adaugă un pacient sau creează-l dintr-o solicitare.",
    worker: "Responsabil",
    unassigned: "Nealocat",
    activeCare: "În îngrijire",
    inactive: "Inactiv",
    archived: "Arhivat",
    noNotes: "Nu există notițe încă.",
    dobMissing: "Fără dată de naștere",
    genderMissing: "Gen necompletat",
    deleteQ: "Ștergi acest pacient?",
    yesDelete: "Da, șterge",
    cancel: "Anulează",
    deletePatient: "Șterge pacientul",
    editProfile: "Editează",
    viewDetails: "Deschide",
    closePatient: "Închide dosarul",
    closePatientConfirm: "Arhivezi dosarul acestui pacient?",
    closingPatient: "Se închide…",
  },
  sq: {
    errDelete: "Pacienti nuk u fshi.",
    errDeleteUnexpected: "Pacienti nuk u fshi. Provo përsëri.",
    errUpdateStatus: "Statusi nuk u ndryshua.",
    dismiss: "Mbyll",
    showing: (v, total) => `${v} nga ${total} pacientë`,
    noneTitle: "Nuk ka pacientë",
    noneHint: "Shto një pacient ose krijoje nga një kërkesë.",
    worker: "Përgjegjësi",
    unassigned: "Pa caktim",
    activeCare: "Në kujdes",
    inactive: "Joaktiv",
    archived: "Arkivuar",
    noNotes: "Ende pa shënime.",
    dobMissing: "Pa datëlindje",
    genderMissing: "Gjinia pa plotësuar",
    deleteQ: "Ta fshish këtë pacient?",
    yesDelete: "Po, fshije",
    cancel: "Anulo",
    deletePatient: "Fshi pacientin",
    editProfile: "Ndrysho",
    viewDetails: "Hap",
    closePatient: "Mbyll dosjen",
    closePatientConfirm: "Ta arkivosh dosjen e këtij pacienti?",
    closingPatient: "Duke mbyllur…",
  },
  it: {
    errDelete: "Impossibile eliminare il paziente.",
    errDeleteUnexpected: "Impossibile eliminare il paziente. Riprova.",
    errUpdateStatus: "Impossibile cambiare lo stato.",
    dismiss: "Chiudi",
    showing: (v, total) => `${v} di ${total} pazienti`,
    noneTitle: "Nessun paziente",
    noneHint: "Aggiungi un paziente o crealo da una richiesta.",
    worker: "Operatore",
    unassigned: "Non assegnato",
    activeCare: "In cura",
    inactive: "Inattivo",
    archived: "Archiviato",
    noNotes: "Ancora nessuna nota.",
    dobMissing: "Data di nascita mancante",
    genderMissing: "Genere non indicato",
    deleteQ: "Eliminare questo paziente?",
    yesDelete: "Sì, elimina",
    cancel: "Annulla",
    deletePatient: "Elimina paziente",
    editProfile: "Modifica",
    viewDetails: "Apri",
    closePatient: "Chiudi scheda",
    closePatientConfirm: "Archiviare la scheda di questo paziente?",
    closingPatient: "Chiusura…",
  },
};

export const createPatientModalTranslations: Record<Lang, {
  prefillRequest: string;
  prefillNotes: string;
  errSave: string;
  errUnexpected: string;
  warnEmail: string;
  titleEdit: string;
  titleCreate: string;
  convertedFrom: (id: string) => string;
  subtitleCreate: string;
  successEdit: string;
  successCreate: string;
  fullName: string;
  fullNamePh: string;
  phone: string;
  phonePh: string;
  email: string;
  emailPh: string;
  dob: string;
  gender: string;
  selectGender: string;
  female: string;
  male: string;
  other: string;
  preferNot: string;
  patientStatus: string;
  activeCare: string;
  inactive: string;
  archived: string;
  assignedWorker: string;
  unassigned: string;
  priority: string;
  pCritical: string;
  pHigh: string;
  pModerate: string;
  pLow: string;
  address: string;
  addressPh: string;
  county: string;
  selectCounty: string;
  condition: string;
  conditionPh: string;
  history: string;
  historyPh: string;
  cancel: string;
  close: string;
  saving: string;
  update: string;
  create: string;
}> = {
  en: {
    prefillRequest: "Request",
    prefillNotes: "Notes",
    errSave: "Could not save the patient.",
    errUnexpected: "Could not save. Try again.",
    warnEmail: "Patient created, but the portal email was not sent.",
    titleEdit: "Edit patient",
    titleCreate: "New patient",
    convertedFrom: (id) => `From request #${id}`,
    subtitleCreate: "Fill in what you know. You can edit it later.",
    successEdit: "Patient saved.",
    successCreate: "Patient created. The portal link was emailed to them.",
    fullName: "Full name",
    fullNamePh: "e.g. Maria Popescu",
    phone: "Phone",
    phonePh: "e.g. 0721 234 567",
    email: "Email",
    emailPh: "you@example.com",
    dob: "Date of birth",
    gender: "Gender",
    selectGender: "Choose gender",
    female: "Female",
    male: "Male",
    other: "Other",
    preferNot: "Prefer not to say",
    patientStatus: "Status",
    activeCare: "In care",
    inactive: "Inactive",
    archived: "Archived",
    assignedWorker: "Assigned to",
    unassigned: "Unassigned",
    priority: "Priority",
    pCritical: "Critical (< 24h)",
    pHigh: "High (< 3 days)",
    pModerate: "Medium (< 7 days)",
    pLow: "Low (< 14 days)",
    address: "Address",
    addressPh: "e.g. Main Street no. 12, Bucharest",
    county: "County",
    selectCounty: "Choose a county",
    condition: "Symptoms and condition",
    conditionPh: "Current symptoms, what the request said, first findings",
    history: "Medical history and care plan",
    historyPh: "Allergies, current treatment, recommended next steps",
    cancel: "Cancel",
    close: "Close",
    saving: "Saving...",
    update: "Save changes",
    create: "Create patient",
  },
  ro: {
    prefillRequest: "Solicitare",
    prefillNotes: "Note",
    errSave: "Pacientul nu a putut fi salvat.",
    errUnexpected: "Nu s-a putut salva. Încearcă din nou.",
    warnEmail: "Pacient adăugat, dar emailul pentru portal nu a plecat.",
    titleEdit: "Editează pacientul",
    titleCreate: "Pacient nou",
    convertedFrom: (id) => `Din solicitarea #${id}`,
    subtitleCreate: "Completează ce știi. Poți modifica mai târziu.",
    successEdit: "Pacient salvat.",
    successCreate: "Pacient adăugat. Linkul de portal i-a fost trimis pe email.",
    fullName: "Nume și prenume",
    fullNamePh: "ex. Maria Popescu",
    phone: "Telefon",
    phonePh: "ex. 0721 234 567",
    email: "Email",
    emailPh: "tu@exemplu.com",
    dob: "Data nașterii",
    gender: "Gen",
    selectGender: "Alege genul",
    female: "Feminin",
    male: "Masculin",
    other: "Altul",
    preferNot: "Nu vrea să spună",
    patientStatus: "Status",
    activeCare: "În îngrijire",
    inactive: "Inactiv",
    archived: "Arhivat",
    assignedWorker: "Responsabil",
    unassigned: "Nealocat",
    priority: "Prioritate",
    pCritical: "Critică (< 24h)",
    pHigh: "Ridicată (< 3 zile)",
    pModerate: "Medie (< 7 zile)",
    pLow: "Scăzută (< 14 zile)",
    address: "Adresă",
    addressPh: "ex. Strada Principală nr. 12, București",
    county: "Județ",
    selectCounty: "Alege județul",
    condition: "Simptome și afecțiune",
    conditionPh: "Simptome actuale, ce scria în solicitare, primele observații",
    history: "Istoric medical și plan de îngrijire",
    historyPh: "Alergii, tratament actual, pașii recomandați",
    cancel: "Anulează",
    close: "Închide",
    saving: "Se salvează...",
    update: "Salvează modificările",
    create: "Adaugă pacientul",
  },
  sq: {
    prefillRequest: "Kërkesa",
    prefillNotes: "Shënime",
    errSave: "Pacienti nuk u ruajt.",
    errUnexpected: "Nuk u ruajt. Provo përsëri.",
    warnEmail: "Pacienti u shtua, por emaili i portalit nuk u dërgua.",
    titleEdit: "Ndrysho pacientin",
    titleCreate: "Pacient i ri",
    convertedFrom: (id) => `Nga kërkesa #${id}`,
    subtitleCreate: "Plotëso çfarë di. Mund ta ndryshosh më vonë.",
    successEdit: "Pacienti u ruajt.",
    successCreate: "Pacienti u shtua. Lidhja e portalit iu dërgua me email.",
    fullName: "Emri dhe mbiemri",
    fullNamePh: "p.sh. Maria Popescu",
    phone: "Telefoni",
    phonePh: "p.sh. 0721 234 567",
    email: "Email",
    emailPh: "ti@shembull.com",
    dob: "Datëlindja",
    gender: "Gjinia",
    selectGender: "Zgjidh gjininë",
    female: "Femër",
    male: "Mashkull",
    other: "Tjetër",
    preferNot: "Nuk do ta thotë",
    patientStatus: "Statusi",
    activeCare: "Në kujdes",
    inactive: "Joaktiv",
    archived: "Arkivuar",
    assignedWorker: "Përgjegjësi",
    unassigned: "Pa caktim",
    priority: "Prioriteti",
    pCritical: "Kritik (< 24h)",
    pHigh: "I lartë (< 3 ditë)",
    pModerate: "Mesatar (< 7 ditë)",
    pLow: "I ulët (< 14 ditë)",
    address: "Adresa",
    addressPh: "p.sh. Rruga Kryesore nr. 12, Bukuresht",
    county: "Qarku",
    selectCounty: "Zgjidh qarkun",
    condition: "Simptomat dhe gjendja",
    conditionPh: "Simptomat e tanishme, çfarë thoshte kërkesa, vëzhgimet e para",
    history: "Historiku mjekësor dhe plani i kujdesit",
    historyPh: "Alergji, trajtimi aktual, hapat e rekomanduar",
    cancel: "Anulo",
    close: "Mbyll",
    saving: "Duke ruajtur...",
    update: "Ruaj ndryshimet",
    create: "Shto pacientin",
  },
  it: {
    prefillRequest: "Richiesta",
    prefillNotes: "Note",
    errSave: "Impossibile salvare il paziente.",
    errUnexpected: "Impossibile salvare. Riprova.",
    warnEmail: "Paziente aggiunto, ma l'email del portale non è partita.",
    titleEdit: "Modifica paziente",
    titleCreate: "Nuovo paziente",
    convertedFrom: (id) => `Dalla richiesta #${id}`,
    subtitleCreate: "Compila quello che sai. Puoi modificarlo dopo.",
    successEdit: "Paziente salvato.",
    successCreate: "Paziente aggiunto. Il link del portale è stato inviato via email.",
    fullName: "Nome e cognome",
    fullNamePh: "es. Maria Popescu",
    phone: "Telefono",
    phonePh: "es. 0721 234 567",
    email: "Email",
    emailPh: "tuo@esempio.com",
    dob: "Data di nascita",
    gender: "Genere",
    selectGender: "Scegli il genere",
    female: "Femmina",
    male: "Maschio",
    other: "Altro",
    preferNot: "Preferisce non dirlo",
    patientStatus: "Stato",
    activeCare: "In cura",
    inactive: "Inattivo",
    archived: "Archiviato",
    assignedWorker: "Operatore assegnato",
    unassigned: "Non assegnato",
    priority: "Priorità",
    pCritical: "Critica (< 24h)",
    pHigh: "Alta (< 3 giorni)",
    pModerate: "Media (< 7 giorni)",
    pLow: "Bassa (< 14 giorni)",
    address: "Indirizzo",
    addressPh: "es. Via Principale 12, Bucarest",
    county: "Provincia",
    selectCounty: "Scegli la provincia",
    condition: "Sintomi e condizione",
    conditionPh: "Sintomi attuali, cosa diceva la richiesta, primi rilievi",
    history: "Anamnesi e piano di cura",
    historyPh: "Allergie, terapia in corso, passi consigliati",
    cancel: "Annulla",
    close: "Chiudi",
    saving: "Salvataggio...",
    update: "Salva modifiche",
    create: "Aggiungi paziente",
  },
};

export const calendarDashboardTranslations: Record<Lang, {
  errSelectPatient: string;
  errSchedule: string;
  errSave: string;
  errUpdate: string;
  errDelete: string;
  errScheduleMeeting: string;
  errLinkMeeting: string;
  scheduleDefault: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  scheduleBtn: string;
  noDb: string;
  prev: string;
  today: string;
  next: string;
  refresh: string;
  search: string;
  filter: string;
  allEvents: string;
  scheduled: string;
  overdue: string;
  completed: string;
  weekDays: string[];
  addOnDate: (date: string) => string;
  dayAdd: string;
  dayScheduleFor: string;
  dayEvents: (count: number) => string;
  addToday: string;
  noEventsTitle: string;
  noEventsHint: string;
  prioritySuffix: string;
  client: string;
  profile: string;
  callPatient: string;
  eventDetails: string;
  clientName: string;
  eventTitle: string;
  scheduledDate: string;
  staffNotes: string;
  call: string;
  email: string;
  deleteEvent: string;
  markPending: string;
  markComplete: string;
  scheduleMeeting: string;
  creatingMeeting: string;
  openMeetingWorkspace: string;
  viewProfile: string;
  scheduleEvent: string;
  selectPatient: string;
  choosePatient: string;
  priorityText: string;
  followupTitle: string;
  followupTitlePh: string;
  dateLabel: string;
  notesLabel: string;
  notesPh: string;
  reminder: string;
  cancel: string;
  scheduling: string;
  month: string;
  week: string;
  day: string;
}> = {
  en: {
    errSelectPatient: "Please select a valid patient.",
    errSchedule: "Failed to schedule follow-up.",
    errSave: "An error occurred while saving follow-up.",
    errUpdate: "Failed to update status.",
    errDelete: "Failed to delete follow-up.",
    errScheduleMeeting: "Failed to create meeting for this follow-up.",
    errLinkMeeting: "Meeting was created but could not be linked to this follow-up.",
    scheduleDefault: "Follow-up Consultation",
    eyebrow: "Calendar Schedule",
    title: "Follow-up Calendar",
    subtitle: "View, manage, and schedule client follow-ups across day, week, and month views.",
    scheduleBtn: "Schedule Follow-up",
    noDb: "Connect MySQL to view and schedule patient follow-ups.",
    prev: "Previous period",
    today: "Today",
    next: "Next period",
    refresh: "Refresh calendar data",
    search: "Search by client name, title, or notes...",
    filter: "Filter",
    allEvents: "All Events",
    scheduled: "Scheduled",
    overdue: "OVERDUE",
    completed: "Completed",
    weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    addOnDate: (date) => `Schedule follow-up for ${date}`,
    dayAdd: "Add",
    dayScheduleFor: "Schedule for",
    dayEvents: (count) => `${count} follow-up events`,
    addToday: "Add Event for Today",
    noEventsTitle: "No follow-ups scheduled for this date",
    noEventsHint: "Click \"Add Event for Today\" to schedule a check-in.",
    prioritySuffix: "Priority",
    client: "Client",
    profile: "Profile",
    callPatient: "Call patient",
    eventDetails: "Follow-up Event Details",
    clientName: "Client Name",
    eventTitle: "Title / Purpose",
    scheduledDate: "Scheduled Date",
    staffNotes: "Staff Notes",
    call: "Call",
    email: "Email",
    deleteEvent: "Delete Event",
    markPending: "Mark Pending",
    markComplete: "Mark Complete",
    scheduleMeeting: "Schedule Meeting",
    creatingMeeting: "Creating meeting...",
    openMeetingWorkspace: "Open Meeting Workspace",
    viewProfile: "View Profile",
    scheduleEvent: "Schedule Follow-Up Event",
    selectPatient: "Select Patient / Client",
    choosePatient: "-- Choose a patient --",
    priorityText: "priority",
    followupTitle: "Follow-Up Title / Purpose",
    followupTitlePh: "e.g. Call to review symptom recovery",
    dateLabel: "Scheduled Date",
    notesLabel: "Staff Instructions / Notes",
    notesPh: "Instructions or phone script for staff member...",
    reminder: "Set active notification reminder",
    cancel: "Cancel",
    scheduling: "Scheduling...",
    month: "Month",
    week: "Week",
    day: "Day",
  },
  ro: {
    errSelectPatient: "Te rugăm să selectezi un pacient valid.",
    errSchedule: "Programarea monitorizării a eșuat.",
    errSave: "A apărut o eroare la salvarea monitorizării.",
    errUpdate: "Actualizarea statusului a eșuat.",
    errDelete: "Ștergerea monitorizării a eșuat.",
    errScheduleMeeting: "Crearea întâlnirii pentru această monitorizare a eșuat.",
    errLinkMeeting: "Întâlnirea a fost creată, dar nu a putut fi legată la monitorizare.",
    scheduleDefault: "Consultație de monitorizare",
    eyebrow: "Program calendar",
    title: "Calendar interactiv de monitorizare",
    subtitle: "Vezi, gestionează și programează monitorizările clienților în vizualizări zi, săptămână și lună.",
    scheduleBtn: "Programează monitorizare",
    noDb: "Conectează MySQL pentru a vedea și programa monitorizări.",
    prev: "Perioada anterioară",
    today: "Astăzi",
    next: "Perioada următoare",
    refresh: "Reîmprospătează calendarul",
    search: "Caută după client, titlu sau notițe...",
    filter: "Filtru",
    allEvents: "Toate evenimentele",
    scheduled: "Programate",
    overdue: "ÎNTÂRZIATE",
    completed: "Finalizate",
    weekDays: ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"],
    addOnDate: (date) => `Programează monitorizare pentru ${date}`,
    dayAdd: "Adaugă",
    dayScheduleFor: "Program pentru",
    dayEvents: (count) => `${count} evenimente de monitorizare`,
    addToday: "Adaugă eveniment pentru astăzi",
    noEventsTitle: "Nu există monitorizări programate pentru această dată",
    noEventsHint: "Apasă \"Adaugă eveniment pentru astăzi\" pentru programare.",
    prioritySuffix: "Prioritate",
    client: "Client",
    profile: "Profil",
    callPatient: "Sună pacientul",
    eventDetails: "Detalii eveniment monitorizare",
    clientName: "Nume client",
    eventTitle: "Titlu / scop",
    scheduledDate: "Data programată",
    staffNotes: "Notițe personal",
    call: "Apelează",
    email: "Email",
    deleteEvent: "Șterge eveniment",
    markPending: "Marchează în așteptare",
    markComplete: "Marchează finalizat",
    scheduleMeeting: "Programează întâlnire",
    creatingMeeting: "Se creează întâlnirea...",
    openMeetingWorkspace: "Deschide spațiul întâlnirii",
    viewProfile: "Vezi profil",
    scheduleEvent: "Programează eveniment",
    selectPatient: "Selectează pacient / client",
    choosePatient: "-- Alege un pacient --",
    priorityText: "prioritate",
    followupTitle: "Titlu / scop monitorizare",
    followupTitlePh: "ex. Apel pentru verificarea recuperării",
    dateLabel: "Data programată",
    notesLabel: "Instrucțiuni / notițe",
    notesPh: "Instrucțiuni sau script telefonic pentru personal...",
    reminder: "Setează notificare activă",
    cancel: "Anulează",
    scheduling: "Se programează...",
    month: "Lună",
    week: "Săptămână",
    day: "Zi",
  },
  sq: {
    errSelectPatient: "Ju lutem zgjidhni një pacient të vlefshëm.",
    errSchedule: "Planifikimi i ndjekjes dështoi.",
    errSave: "Ndodhi një gabim gjatë ruajtjes së ndjekjes.",
    errUpdate: "Përditësimi i statusit dështoi.",
    errDelete: "Fshirja e ndjekjes dështoi.",
    errScheduleMeeting: "Krijimi i takimit për këtë ndjekje dështoi.",
    errLinkMeeting: "Takimi u krijua, por nuk u lidh me këtë ndjekje.",
    scheduleDefault: "Konsultë ndjekjeje",
    eyebrow: "Orari i kalendarit",
    title: "Kalendari interaktiv i ndjekjeve",
    subtitle: "Shiko, menaxho dhe planifiko ndjekjet e klientëve në pamjet ditore, javore dhe mujore.",
    scheduleBtn: "Planifiko ndjekje",
    noDb: "Lidh MySQL për të pare dhe planifikuar ndjekjet.",
    prev: "Periudha e mëparshme",
    today: "Sot",
    next: "Periudha tjetër",
    refresh: "Përditëso kalendarin",
    search: "Kërko sipas klientit, titullit ose shënimeve...",
    filter: "Filtër",
    allEvents: "Të gjitha ngjarjet",
    scheduled: "Të planifikuara",
    overdue: "VONUAR",
    completed: "Të përfunduara",
    weekDays: ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"],
    addOnDate: (date) => `Planifiko ndjekje për ${date}`,
    dayAdd: "Shto",
    dayScheduleFor: "Orari për",
    dayEvents: (count) => `${count} ngjarje ndjekjeje`,
    addToday: "Shto ngjarje për sot",
    noEventsTitle: "Nuk ka ndjekje të planifikuara për këtë datë",
    noEventsHint: "Kliko \"Shto ngjarje për sot\" për të planifikuar.",
    prioritySuffix: "Prioritet",
    client: "Klient",
    profile: "Profili",
    callPatient: "Telefono pacientin",
    eventDetails: "Detajet e ngjarjes së ndjekjes",
    clientName: "Emri i klientit",
    eventTitle: "Titulli / qëllimi",
    scheduledDate: "Data e planifikuar",
    staffNotes: "Shënime stafi",
    call: "Telefono",
    email: "Email",
    deleteEvent: "Fshij ngjarjen",
    markPending: "Shëno në pritje",
    markComplete: "Shëno të përfunduar",
    scheduleMeeting: "Planifiko takim",
    creatingMeeting: "Duke krijuar takimin...",
    openMeetingWorkspace: "Hap hapësirën e takimit",
    viewProfile: "Shiko profilin",
    scheduleEvent: "Planifiko ngjarje ndjekjeje",
    selectPatient: "Zgjidh pacient / klient",
    choosePatient: "-- Zgjidh pacient --",
    priorityText: "prioritet",
    followupTitle: "Titulli / qëllimi i ndjekjes",
    followupTitlePh: "p.sh. Telefonatë për kontrollin e rikuperimit",
    dateLabel: "Data e planifikuar",
    notesLabel: "Udhëzime / shënime",
    notesPh: "Udhëzime ose skript telefoni për stafin...",
    reminder: "Vendos kujtues aktiv",
    cancel: "Anulo",
    scheduling: "Duke planifikuar...",
    month: "Muaj",
    week: "Javë",
    day: "Ditë",
  },
  it: {
    errSelectPatient: "Seleziona un paziente valido.",
    errSchedule: "Pianificazione follow-up non riuscita.",
    errSave: "Si è verificato un errore durante il salvataggio del follow-up.",
    errUpdate: "Aggiornamento stato non riuscito.",
    errDelete: "Eliminazione follow-up non riuscita.",
    errScheduleMeeting: "Creazione riunione per questo follow-up non riuscita.",
    errLinkMeeting: "La riunione è stata creata, ma non collegata al follow-up.",
    scheduleDefault: "Consulto di follow-up",
    eyebrow: "Programma calendario",
    title: "Calendario interattivo follow-up",
    subtitle: "Visualizza, gestisci e pianifica i follow-up dei clienti nelle viste giorno, settimana e mese.",
    scheduleBtn: "Pianifica follow-up",
    noDb: "Connetti MySQL per visualizzare e pianificare i follow-up.",
    prev: "Periodo precedente",
    today: "Oggi",
    next: "Periodo successivo",
    refresh: "Aggiorna calendario",
    search: "Cerca per cliente, titolo o note...",
    filter: "Filtro",
    allEvents: "Tutti gli eventi",
    scheduled: "Pianificati",
    overdue: "IN RITARDO",
    completed: "Completati",
    weekDays: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
    addOnDate: (date) => `Pianifica follow-up per ${date}`,
    dayAdd: "Aggiungi",
    dayScheduleFor: "Programma per",
    dayEvents: (count) => `${count} eventi follow-up`,
    addToday: "Aggiungi evento per oggi",
    noEventsTitle: "Nessun follow-up pianificato per questa data",
    noEventsHint: "Clicca \"Aggiungi evento per oggi\" per pianificare.",
    prioritySuffix: "Priorità",
    client: "Cliente",
    profile: "Profilo",
    callPatient: "Chiama paziente",
    eventDetails: "Dettagli evento follow-up",
    clientName: "Nome cliente",
    eventTitle: "Titolo / obiettivo",
    scheduledDate: "Data pianificata",
    staffNotes: "Note staff",
    call: "Chiama",
    email: "Email",
    deleteEvent: "Elimina evento",
    markPending: "Segna in attesa",
    markComplete: "Segna completato",
    scheduleMeeting: "Pianifica riunione",
    creatingMeeting: "Creazione riunione...",
    openMeetingWorkspace: "Apri area riunione",
    viewProfile: "Vedi profilo",
    scheduleEvent: "Pianifica evento follow-up",
    selectPatient: "Seleziona paziente / cliente",
    choosePatient: "-- Scegli un paziente --",
    priorityText: "priorita",
    followupTitle: "Titolo / obiettivo follow-up",
    followupTitlePh: "es. Chiamata per verificare recupero sintomi",
    dateLabel: "Data pianificata",
    notesLabel: "Istruzioni / note staff",
    notesPh: "Istruzioni o script telefonico per l'operatore...",
    reminder: "Imposta promemoria attivo",
    cancel: "Annulla",
    scheduling: "Pianificazione...",
    month: "Mese",
    week: "Settimana",
    day: "Giorno",
  },
};
