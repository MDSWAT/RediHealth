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
}> = {
  en: {
    errDelete: "Failed to delete patient.",
    errDeleteUnexpected: "An error occurred while deleting patient.",
    errUpdateStatus: "Failed to update patient status.",
    dismiss: "Dismiss",
    showing: (v, total) => `Showing ${v} of ${total} patient profiles`,
    noneTitle: "No patient records found",
    noneHint: "Create a patient profile or convert a request to start building patient profiles.",
    worker: "Worker",
    unassigned: "Unassigned",
    activeCare: "Active Care",
    inactive: "Inactive",
    archived: "Archived",
    noNotes: "No condition notes recorded.",
    dobMissing: "DOB not provided",
    genderMissing: "Gender not specified",
    deleteQ: "Delete this patient?",
    yesDelete: "Yes, delete",
    cancel: "Cancel",
    deletePatient: "Delete Patient",
    editProfile: "Edit Profile",
    viewDetails: "View Details",
  },
  ro: {
    errDelete: "Stergerea pacientului a esuat.",
    errDeleteUnexpected: "A aparut o eroare la stergerea pacientului.",
    errUpdateStatus: "Actualizarea statusului pacientului a esuat.",
    dismiss: "Inchide",
    showing: (v, total) => `Se afiseaza ${v} din ${total} profiluri`,
    noneTitle: "Nu exista dosare pacient",
    noneHint: "Creeaza un profil pacient sau converteste o cerere pentru a incepe.",
    worker: "Lucrator",
    unassigned: "Nealocat",
    activeCare: "Ingrijire activa",
    inactive: "Inactiv",
    archived: "Arhivat",
    noNotes: "Nu exista notite clinice.",
    dobMissing: "Data nasterii nespecificata",
    genderMissing: "Gen nespecificat",
    deleteQ: "Stergi acest pacient?",
    yesDelete: "Da, sterge",
    cancel: "Anuleaza",
    deletePatient: "Sterge pacient",
    editProfile: "Editeaza profil",
    viewDetails: "Vezi detalii",
  },
  sq: {
    errDelete: "Deshtoi fshirja e pacientit.",
    errDeleteUnexpected: "Ndodhi nje gabim gjate fshirjes se pacientit.",
    errUpdateStatus: "Deshtoi perditesimi i statusit te pacientit.",
    dismiss: "Mbyll",
    showing: (v, total) => `Shfaqen ${v} nga ${total} profile pacientesh`,
    noneTitle: "Nuk u gjeten dosje pacientesh",
    noneHint: "Krijo nje profil pacienti ose konverto nje kerkese per te filluar.",
    worker: "Punonjes",
    unassigned: "Pacaktuar",
    activeCare: "Kujdes aktiv",
    inactive: "Joaktiv",
    archived: "Arkivuar",
    noNotes: "Nuk ka shenime mbi gjendjen.",
    dobMissing: "Datelindja nuk eshte dhene",
    genderMissing: "Gjinia nuk eshte specifikuar",
    deleteQ: "Ta fshijme kete pacient?",
    yesDelete: "Po, fshije",
    cancel: "Anulo",
    deletePatient: "Fshij pacientin",
    editProfile: "Ndrysho profilin",
    viewDetails: "Shiko detaje",
  },
  it: {
    errDelete: "Eliminazione paziente non riuscita.",
    errDeleteUnexpected: "Si e verificato un errore durante l'eliminazione del paziente.",
    errUpdateStatus: "Aggiornamento stato paziente non riuscito.",
    dismiss: "Chiudi",
    showing: (v, total) => `Mostrati ${v} di ${total} profili paziente`,
    noneTitle: "Nessuna scheda paziente trovata",
    noneHint: "Crea un profilo paziente o converti una richiesta per iniziare.",
    worker: "Operatore",
    unassigned: "Non assegnato",
    activeCare: "Cura attiva",
    inactive: "Inattivo",
    archived: "Archiviato",
    noNotes: "Nessuna nota clinica registrata.",
    dobMissing: "Data di nascita non indicata",
    genderMissing: "Genere non specificato",
    deleteQ: "Eliminare questo paziente?",
    yesDelete: "Si, elimina",
    cancel: "Annulla",
    deletePatient: "Elimina paziente",
    editProfile: "Modifica profilo",
    viewDetails: "Vedi dettagli",
  },
};

export const createPatientModalTranslations: Record<Lang, {
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
    errSave: "Failed to save patient profile.",
    errUnexpected: "An unexpected error occurred while saving.",
    warnEmail: "Patient profile was created, but we could not send the portal email.",
    titleEdit: "Edit Patient Profile",
    titleCreate: "Create Patient Profile",
    convertedFrom: (id) => `Converted from Request #${id}`,
    subtitleCreate: "Enter medical profile details for staff record",
    successEdit: "Patient profile saved successfully!",
    successCreate: "Patient profile created and portal link emailed to patient!",
    fullName: "Full Name",
    fullNamePh: "e.g. Maria Popescu",
    phone: "Phone Number",
    phonePh: "e.g. 0721 234 567",
    email: "Email Address",
    emailPh: "you@example.com",
    dob: "Date of Birth",
    gender: "Gender",
    selectGender: "Select gender",
    female: "Female",
    male: "Male",
    other: "Other",
    preferNot: "Prefer not to say",
    patientStatus: "Patient Status",
    activeCare: "Active Care",
    inactive: "Inactive",
    archived: "Archived Record",
    assignedWorker: "Assigned Healthcare Worker",
    unassigned: "-- Unassigned --",
    priority: "Priority / Urgency Level",
    pCritical: "Critical (< 24h)",
    pHigh: "High (< 3 days)",
    pModerate: "Moderate (< 7 days)",
    pLow: "Low (< 14 days)",
    address: "Address / Location",
    addressPh: "e.g. Main Street no. 12, Bucharest",
    condition: "Condition and Symptoms Notes",
    conditionPh: "Details regarding current symptoms, request notes, or initial findings...",
    history: "Medical History / Care Plan",
    historyPh: "Known allergies, ongoing treatments, or recommended health steps...",
    cancel: "Cancel",
    close: "Close modal",
    saving: "Saving...",
    update: "Update Patient Profile",
    create: "Create Patient Profile",
  },
  ro: {
    errSave: "Salvarea profilului pacientului a esuat.",
    errUnexpected: "A aparut o eroare neasteptata la salvare.",
    warnEmail: "Profilul a fost creat, dar emailul pentru portal nu a putut fi trimis.",
    titleEdit: "Editeaza profil pacient",
    titleCreate: "Creeaza profil pacient",
    convertedFrom: (id) => `Convertit din cererea #${id}`,
    subtitleCreate: "Introdu detaliile profilului medical",
    successEdit: "Profilul pacientului a fost salvat!",
    successCreate: "Profilul pacientului a fost creat si linkul portalului a fost trimis!",
    fullName: "Nume complet",
    fullNamePh: "ex. Maria Popescu",
    phone: "Numar telefon",
    phonePh: "ex. 0721 234 567",
    email: "Adresa email",
    emailPh: "tu@exemplu.com",
    dob: "Data nasterii",
    gender: "Gen",
    selectGender: "Selecteaza genul",
    female: "Feminin",
    male: "Masculin",
    other: "Altul",
    preferNot: "Prefer sa nu spun",
    patientStatus: "Status pacient",
    activeCare: "Ingrijire activa",
    inactive: "Inactiv",
    archived: "Dosar arhivat",
    assignedWorker: "Lucrator medical alocat",
    unassigned: "-- Nealocat --",
    priority: "Prioritate / Urgenta",
    pCritical: "Critic (< 24h)",
    pHigh: "Ridicata (< 3 zile)",
    pModerate: "Moderata (< 7 zile)",
    pLow: "Scazuta (< 14 zile)",
    address: "Adresa / Locatie",
    addressPh: "ex. Strada Principala nr. 12, Bucuresti",
    condition: "Notite despre afectiune si simptome",
    conditionPh: "Detalii despre simptomele curente, cerere sau observatii initiale...",
    history: "Istoric medical / Plan de ingrijire",
    historyPh: "Alergii cunoscute, tratamente in curs sau recomandari...",
    cancel: "Anuleaza",
    close: "Inchide fereastra",
    saving: "Se salveaza...",
    update: "Actualizeaza profilul",
    create: "Creeaza profilul",
  },
  sq: {
    errSave: "Ruajtja e profilit te pacientit deshtoi.",
    errUnexpected: "Ndodhi nje gabim i papritur gjate ruajtjes.",
    warnEmail: "Profili u krijua, por emaili i portalit nuk mund te dergohej.",
    titleEdit: "Ndrysho profilin e pacientit",
    titleCreate: "Krijo profil pacienti",
    convertedFrom: (id) => `Konvertuar nga kerkesa #${id}`,
    subtitleCreate: "Vendos detajet e profilit mjekesor",
    successEdit: "Profili i pacientit u ruajt me sukses!",
    successCreate: "Profili i pacientit u krijua dhe lidhja e portalit u dergua me email!",
    fullName: "Emri i plote",
    fullNamePh: "p.sh. Maria Popescu",
    phone: "Numri i telefonit",
    phonePh: "p.sh. 0721 234 567",
    email: "Adresa email",
    emailPh: "ti@shembull.com",
    dob: "Datelindja",
    gender: "Gjinia",
    selectGender: "Zgjidh gjinine",
    female: "Femer",
    male: "Mashkull",
    other: "Tjeter",
    preferNot: "Preferoj te mos them",
    patientStatus: "Statusi i pacientit",
    activeCare: "Kujdes aktiv",
    inactive: "Joaktiv",
    archived: "Dosje e arkivuar",
    assignedWorker: "Punonjesi i caktuar",
    unassigned: "-- Pacaktuar --",
    priority: "Prioritet / Urgjence",
    pCritical: "Kritik (< 24h)",
    pHigh: "I larte (< 3 dite)",
    pModerate: "Mesatar (< 7 dite)",
    pLow: "I ulet (< 14 dite)",
    address: "Adresa / Vendndodhja",
    addressPh: "p.sh. Rruga Kryesore nr. 12, Bukuresht",
    condition: "Shenime mbi gjendjen dhe simptomat",
    conditionPh: "Detaje mbi simptomat aktuale, kerkesen ose gjetjet fillestare...",
    history: "Historia mjekesore / Plani i kujdesit",
    historyPh: "Alergji te njohura, trajtime ne vazhdim ose hapa te rekomanduar...",
    cancel: "Anulo",
    close: "Mbyll dritaren",
    saving: "Duke ruajtur...",
    update: "Perditeso profilin",
    create: "Krijo profilin",
  },
  it: {
    errSave: "Salvataggio profilo paziente non riuscito.",
    errUnexpected: "Si e verificato un errore imprevisto durante il salvataggio.",
    warnEmail: "Il profilo e stato creato, ma non e stato possibile inviare l'email del portale.",
    titleEdit: "Modifica profilo paziente",
    titleCreate: "Crea profilo paziente",
    convertedFrom: (id) => `Convertito dalla richiesta #${id}`,
    subtitleCreate: "Inserisci i dettagli del profilo medico",
    successEdit: "Profilo paziente salvato con successo!",
    successCreate: "Profilo paziente creato e link del portale inviato via email!",
    fullName: "Nome completo",
    fullNamePh: "es. Maria Popescu",
    phone: "Numero di telefono",
    phonePh: "es. 0721 234 567",
    email: "Indirizzo email",
    emailPh: "tuo@esempio.com",
    dob: "Data di nascita",
    gender: "Genere",
    selectGender: "Seleziona genere",
    female: "Femmina",
    male: "Maschio",
    other: "Altro",
    preferNot: "Preferisco non dirlo",
    patientStatus: "Stato paziente",
    activeCare: "Cura attiva",
    inactive: "Inattivo",
    archived: "Scheda archiviata",
    assignedWorker: "Operatore assegnato",
    unassigned: "-- Non assegnato --",
    priority: "Priorita / Urgenza",
    pCritical: "Critica (< 24h)",
    pHigh: "Alta (< 3 giorni)",
    pModerate: "Moderata (< 7 giorni)",
    pLow: "Bassa (< 14 giorni)",
    address: "Indirizzo / Localita",
    addressPh: "es. Via Principale 12, Bucarest",
    condition: "Note su condizione e sintomi",
    conditionPh: "Dettagli su sintomi attuali, richiesta o rilievi iniziali...",
    history: "Storia clinica / Piano di cura",
    historyPh: "Allergie note, trattamenti in corso o passi consigliati...",
    cancel: "Annulla",
    close: "Chiudi finestra",
    saving: "Salvataggio...",
    update: "Aggiorna profilo",
    create: "Crea profilo",
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
    errSelectPatient: "Te rugam sa selectezi un pacient valid.",
    errSchedule: "Programarea monitorizarii a esuat.",
    errSave: "A aparut o eroare la salvarea monitorizarii.",
    errUpdate: "Actualizarea statusului a esuat.",
    errDelete: "Stergerea monitorizarii a esuat.",
    errScheduleMeeting: "Crearea intalnirii pentru aceasta monitorizare a esuat.",
    errLinkMeeting: "Intalnirea a fost creata, dar nu a putut fi legata la monitorizare.",
    scheduleDefault: "Consultatie de monitorizare",
    eyebrow: "Program calendar",
    title: "Calendar interactiv de monitorizare",
    subtitle: "Vezi, gestioneaza si programeaza monitorizarile clientilor in vizualizari zi, saptamana si luna.",
    scheduleBtn: "Programeaza monitorizare",
    noDb: "Conecteaza MySQL pentru a vedea si programa monitorizari.",
    prev: "Perioada anterioara",
    today: "Astazi",
    next: "Perioada urmatoare",
    refresh: "Reimprospateaza calendarul",
    search: "Cauta dupa client, titlu sau notite...",
    filter: "Filtru",
    allEvents: "Toate evenimentele",
    scheduled: "Programate",
    overdue: "INTARZIATE",
    completed: "Finalizate",
    weekDays: ["Lun", "Mar", "Mie", "Joi", "Vin", "Sam", "Dum"],
    addOnDate: (date) => `Programeaza monitorizare pentru ${date}`,
    dayAdd: "Adauga",
    dayScheduleFor: "Program pentru",
    dayEvents: (count) => `${count} evenimente de monitorizare`,
    addToday: "Adauga eveniment pentru astazi",
    noEventsTitle: "Nu exista monitorizari programate pentru aceasta data",
    noEventsHint: "Apasa \"Adauga eveniment pentru astazi\" pentru programare.",
    prioritySuffix: "Prioritate",
    client: "Client",
    profile: "Profil",
    callPatient: "Suna pacientul",
    eventDetails: "Detalii eveniment monitorizare",
    clientName: "Nume client",
    eventTitle: "Titlu / scop",
    scheduledDate: "Data programata",
    staffNotes: "Notite personal",
    call: "Apeleaza",
    email: "Email",
    deleteEvent: "Sterge eveniment",
    markPending: "Marcheaza in asteptare",
    markComplete: "Marcheaza finalizat",
    scheduleMeeting: "Programeaza intalnire",
    creatingMeeting: "Se creeaza intalnirea...",
    openMeetingWorkspace: "Deschide spatiul intalnirii",
    viewProfile: "Vezi profil",
    scheduleEvent: "Programeaza eveniment",
    selectPatient: "Selecteaza pacient / client",
    choosePatient: "-- Alege un pacient --",
    priorityText: "prioritate",
    followupTitle: "Titlu / scop monitorizare",
    followupTitlePh: "ex. Apel pentru verificarea recuperarii",
    dateLabel: "Data programata",
    notesLabel: "Instructiuni / notite",
    notesPh: "Instructiuni sau script telefonic pentru personal...",
    reminder: "Seteaza notificare activa",
    cancel: "Anuleaza",
    scheduling: "Se programeaza...",
    month: "Luna",
    week: "Saptamana",
    day: "Zi",
  },
  sq: {
    errSelectPatient: "Ju lutem zgjidhni nje pacient te vlefshem.",
    errSchedule: "Planifikimi i ndjekjes deshtoi.",
    errSave: "Ndodhi nje gabim gjate ruajtjes se ndjekjes.",
    errUpdate: "Perditesimi i statusit deshtoi.",
    errDelete: "Fshirja e ndjekjes deshtoi.",
    errScheduleMeeting: "Krijimi i takimit per kete ndjekje deshtoi.",
    errLinkMeeting: "Takimi u krijua, por nuk u lidh me kete ndjekje.",
    scheduleDefault: "Konsulte ndjekjeje",
    eyebrow: "Orari i kalendarit",
    title: "Kalendari interaktiv i ndjekjeve",
    subtitle: "Shiko, menaxho dhe planifiko ndjekjet e klienteve ne pamjet ditore, javore dhe mujore.",
    scheduleBtn: "Planifiko ndjekje",
    noDb: "Lidh MySQL per te pare dhe planifikuar ndjekjet.",
    prev: "Periudha e meparshme",
    today: "Sot",
    next: "Periudha tjeter",
    refresh: "Perditeso kalendarin",
    search: "Kerko sipas klientit, titullit ose shenimeve...",
    filter: "Filter",
    allEvents: "Te gjitha ngjarjet",
    scheduled: "Te planifikuara",
    overdue: "VONUAR",
    completed: "Te perfunduara",
    weekDays: ["Hen", "Mar", "Mer", "Enj", "Pre", "Sht", "Die"],
    addOnDate: (date) => `Planifiko ndjekje per ${date}`,
    dayAdd: "Shto",
    dayScheduleFor: "Orari per",
    dayEvents: (count) => `${count} ngjarje ndjekjeje`,
    addToday: "Shto ngjarje per sot",
    noEventsTitle: "Nuk ka ndjekje te planifikuara per kete date",
    noEventsHint: "Kliko \"Shto ngjarje per sot\" per te planifikuar.",
    prioritySuffix: "Prioritet",
    client: "Klient",
    profile: "Profili",
    callPatient: "Telefono pacientin",
    eventDetails: "Detajet e ngjarjes se ndjekjes",
    clientName: "Emri i klientit",
    eventTitle: "Titulli / qellimi",
    scheduledDate: "Data e planifikuar",
    staffNotes: "Shenime stafi",
    call: "Telefono",
    email: "Email",
    deleteEvent: "Fshij ngjarjen",
    markPending: "Sheno ne pritje",
    markComplete: "Sheno te perfunduar",
    scheduleMeeting: "Planifiko takim",
    creatingMeeting: "Duke krijuar takimin...",
    openMeetingWorkspace: "Hap hapesiren e takimit",
    viewProfile: "Shiko profilin",
    scheduleEvent: "Planifiko ngjarje ndjekjeje",
    selectPatient: "Zgjidh pacient / klient",
    choosePatient: "-- Zgjidh pacient --",
    priorityText: "prioritet",
    followupTitle: "Titulli / qellimi i ndjekjes",
    followupTitlePh: "p.sh. Telefonate per kontrollin e rikuperimit",
    dateLabel: "Data e planifikuar",
    notesLabel: "Udhezime / shenime",
    notesPh: "Udhezime ose skript telefoni per stafin...",
    reminder: "Vendos kujtues aktiv",
    cancel: "Anulo",
    scheduling: "Duke planifikuar...",
    month: "Muaj",
    week: "Jave",
    day: "Dite",
  },
  it: {
    errSelectPatient: "Seleziona un paziente valido.",
    errSchedule: "Pianificazione follow-up non riuscita.",
    errSave: "Si e verificato un errore durante il salvataggio del follow-up.",
    errUpdate: "Aggiornamento stato non riuscito.",
    errDelete: "Eliminazione follow-up non riuscita.",
    errScheduleMeeting: "Creazione riunione per questo follow-up non riuscita.",
    errLinkMeeting: "La riunione e stata creata, ma non collegata al follow-up.",
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
    prioritySuffix: "Priorita",
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
