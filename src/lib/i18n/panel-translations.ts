import type { Lang } from "@/lib/i18n/translations";

export const langToLocale: Record<Lang, string> = {
  en: "en-US",
  ro: "ro-RO",
  sq: "sq-AL",
  it: "it-IT",
};

type PanelTranslations = {
  adminShell: {
    requests: string;
    patients: string;
    workers: string;
    followups: string;
    calendar: string;
    mediator: string;
    manage: string;
    expandNav: string;
    minimizeNav: string;
    pendingRequests: (count: number) => string;
    overdueFollowups: (count: number) => string;
    returnToWebsite: string;
    signOut: string;
    openMenu: string;
    closeMenu: string;
  };
  dashboardOverview: {
    totalRequests: string;
    pendingAction: string;
    inProgress: string;
    resolved: string;
    receivedToday: string;
    active: string;
  };
  workerDashboard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    noDatabase: string;
    queueTitle: string;
  };
  patientsDashboard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    noDatabase: string;
  };
  workersDashboard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    noDatabase: string;
    totalStaffWorkers: string;
    activeStaff: string;
    assignedPatients: string;
    unassignedPatients: string;
  };
  requestsTable: {
    searchPlaceholder: string;
    sortNewest: string;
    sortOldest: string;
    sortPriority: string;
    exportCsv: string;
    refreshTitle: string;
    refresh: string;
    refreshing: string;
    filter: string;
    allRequests: string;
    pending: string;
    inProgress: string;
    resolved: string;
    archived: string;
    dismiss: string;
    showing: (visible: number, total: number) => string;
    noRequests: string;
    noRequestsHint: string;
    notProvided: string;
    urgent: string;
    noteAttached: string;
    deleting: string;
    delete: string;
    cancel: string;
    deleteRequest: string;
    openEmailTemplates: string;
    details: string;
    errorDelete: string;
    errorDeleteUnexpected: string;
    errorUpdateStatus: string;
  };
  followupsDashboard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    noDatabase: string;
    totalClients: string;
    attention: string;
    overdue: string;
    dueToday: string;
    upcoming: string;
    criticalPatients: string;
    searchPlaceholder: string;
    exportCsv: string;
    refreshTitle: string;
    refresh: string;
    refreshing: string;
    followupState: string;
    allStates: string;
    stateOverdue: string;
    stateToday: string;
    stateUpcoming: string;
    stateCompleted: string;
    stateNone: string;
    patientPriority: string;
    allPriorities: string;
    noMatches: string;
    noMatchesHint: string;
    recordId: (id: string) => string;
    date: string;
    outcome: string;
    noFollowupLogged: string;
    careSuffix: string;
    markCompleteTitle: string;
    complete: string;
    scheduleTitle: string;
    schedule: string;
    profile: string;
    modalScheduleTitle: string;
    modalClient: string;
    modalPriority: string;
    modalSuggestedInterval: string;
    modalDays: string;
    modalTitleLabel: string;
    modalTitlePlaceholder: string;
    modalDateLabel: string;
    modalNotesLabel: string;
    modalNotesPlaceholder: string;
    modalReminder: string;
    scheduling: string;
    saveFollowup: string;
    completeFollowupTitle: string;
    completeFollowupSubtitle: (name: string) => string;
    closeCompletion: string;
    followupNotes: string;
    completionPlaceholder: string;
    saving: string;
    completeFollowup: string;
    errorUpdateStatus: string;
    errorSchedule: string;
    errorScheduleUnexpected: string;
  };
};

export const panelTranslations: Record<Lang, PanelTranslations> = {
  en: {
    adminShell: {
      requests: "Requests",
      patients: "Patients",
      workers: "Workers",
      followups: "Follow-ups",
      calendar: "Calendar",
      mediator: "New mediator case",
      manage: "Manage",
      expandNav: "Expand dashboard navigation",
      minimizeNav: "Minimize dashboard navigation",
      pendingRequests: (count) => `${count} pending requests`,
      overdueFollowups: (count) => `${count} overdue follow-ups`,
      returnToWebsite: "Return to website",
      signOut: "Sign out",
      openMenu: "Open admin menu",
      closeMenu: "Close admin menu",
    },
    dashboardOverview: {
      totalRequests: "Total Requests",
      pendingAction: "Pending Action",
      inProgress: "In Progress",
      resolved: "Resolved",
      receivedToday: "Received Today",
      active: "Active",
    },
    workerDashboard: {
      eyebrow: "Requests",
      title: "Medical Help Requests",
      subtitle: "Review, prioritize, and respond to incoming requests.",
      noDatabase: "Connect MySQL and apply the database migrations to view and manage medical help requests.",
      queueTitle: "Medical Help Requests Queue",
    },
    patientsDashboard: {
      eyebrow: "Patients",
      title: "Patient Profiles & Records",
      subtitle: "Manage medical profiles, care status, condition notes, and treatment histories.",
      noDatabase: "Connect MySQL and apply migration 003 to view and manage patient profiles.",
    },
    workersDashboard: {
      eyebrow: "Staff Management",
      title: "Healthcare Workers & Staff",
      subtitle: "Manage staff profiles, assign clients/patients to workers, and track active staff directory.",
      noDatabase: "Connect MySQL and apply migration 006 to manage healthcare workers.",
      totalStaffWorkers: "Total Staff Workers",
      activeStaff: "Active Staff",
      assignedPatients: "Assigned Patients",
      unassignedPatients: "Unassigned Patients",
    },
    requestsTable: {
      searchPlaceholder: "Search by name, phone, email or description...",
      sortNewest: "Sort: Newest First",
      sortOldest: "Sort: Oldest First",
      sortPriority: "Sort: Priority First",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh medical help requests",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      filter: "Filter",
      allRequests: "All Requests",
      pending: "Pending",
      inProgress: "In Progress",
      resolved: "Resolved",
      archived: "Archived",
      dismiss: "Dismiss",
      showing: (visible, total) => `Showing ${visible} of ${total} requests`,
      noRequests: "No requests found",
      noRequestsHint: "Try adjusting your search criteria or status filter.",
      notProvided: "Not provided",
      urgent: "Urgent",
      noteAttached: "Note attached",
      deleting: "Deleting...",
      delete: "Delete",
      cancel: "Cancel",
      deleteRequest: "Delete request",
      openEmailTemplates: "Open email templates",
      details: "Details",
      errorDelete: "Failed to delete request.",
      errorDeleteUnexpected: "An error occurred while deleting the request.",
      errorUpdateStatus: "Failed to update request status.",
    },
    followupsDashboard: {
      eyebrow: "Follow-ups Queue",
      title: "Patient Follow-ups & Reminders",
      subtitle: "Track scheduled consultations, overdue care reminders, and patient check-ins.",
      noDatabase: "Connect MySQL to manage patient follow-ups and care schedules.",
      totalClients: "Total Clients / Patients",
      attention: "Attention",
      overdue: "Overdue Follow-ups",
      dueToday: "Due Today",
      upcoming: "Upcoming Scheduled",
      criticalPatients: "Critical Patients",
      searchPlaceholder: "Search clients by name, phone, title, notes...",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh follow-up records",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      followupState: "Follow-up State",
      allStates: "All States",
      stateOverdue: "OVERDUE",
      stateToday: "Due Today",
      stateUpcoming: "Upcoming",
      stateCompleted: "Completed",
      stateNone: "No Follow-up",
      patientPriority: "Patient Priority",
      allPriorities: "All Priorities",
      noMatches: "No follow-ups match criteria",
      noMatchesHint: "Try clearing search query or adjusting filter options.",
      recordId: (id) => `Record ID #${id}`,
      date: "Date",
      outcome: "Outcome",
      noFollowupLogged: "No follow-up logged",
      careSuffix: "care",
      markCompleteTitle: "Mark latest follow-up as completed",
      complete: "Complete",
      scheduleTitle: "Schedule new follow-up",
      schedule: "Schedule",
      profile: "Profile",
      modalScheduleTitle: "Schedule Follow-Up",
      modalClient: "Client",
      modalPriority: "Priority",
      modalSuggestedInterval: "Suggested follow-up interval",
      modalDays: "days",
      modalTitleLabel: "Follow-Up Title / Purpose",
      modalTitlePlaceholder: "e.g. Call to check medication progress",
      modalDateLabel: "Scheduled Date",
      modalNotesLabel: "Staff Instructions / Notes",
      modalNotesPlaceholder: "Notes for staff member performing the follow-up...",
      modalReminder: "Set active notification reminder",
      scheduling: "Scheduling...",
      saveFollowup: "Save Follow-Up",
      completeFollowupTitle: "Complete follow-up",
      completeFollowupSubtitle: (name) => `Add an outcome note for ${name}.`,
      closeCompletion: "Close completion form",
      followupNotes: "Follow-up notes",
      completionPlaceholder: "Record contact made, outcome, next steps, or concerns.",
      saving: "Saving...",
      completeFollowup: "Complete follow-up",
      errorUpdateStatus: "Failed to update follow-up status.",
      errorSchedule: "Failed to schedule follow-up.",
      errorScheduleUnexpected: "An error occurred while saving follow-up.",
    },
  },
  ro: {
    adminShell: {
      requests: "Cereri",
      patients: "Pacienti",
      workers: "Lucratori",
      followups: "Monitorizari",
      calendar: "Calendar",
      mediator: "Caz nou mediator",
      manage: "Administrare",
      expandNav: "Extinde navigatia panoului",
      minimizeNav: "Restrange navigatia panoului",
      pendingRequests: (count) => `${count} cereri in asteptare`,
      overdueFollowups: (count) => `${count} monitorizari intarziate`,
      returnToWebsite: "Inapoi la site",
      signOut: "Deconectare",
      openMenu: "Deschide meniul de administrare",
      closeMenu: "Inchide meniul de administrare",
    },
    dashboardOverview: {
      totalRequests: "Total cereri",
      pendingAction: "Actiune in asteptare",
      inProgress: "In curs",
      resolved: "Rezolvate",
      receivedToday: "Primite azi",
      active: "Activ",
    },
    workerDashboard: {
      eyebrow: "Cereri",
      title: "Cereri de ajutor medical",
      subtitle: "Revizuieste, prioritizeaza si raspunde la cererile primite.",
      noDatabase: "Conecteaza MySQL si aplica migrarile bazei de date pentru a vedea si gestiona cererile medicale.",
      queueTitle: "Coada cereri ajutor medical",
    },
    patientsDashboard: {
      eyebrow: "Pacienti",
      title: "Profiluri si dosare pacienti",
      subtitle: "Gestioneaza profiluri medicale, statusul ingrijirii, notite clinice si istoricul tratamentelor.",
      noDatabase: "Conecteaza MySQL si aplica migrarea 003 pentru a vedea si gestiona pacientii.",
    },
    workersDashboard: {
      eyebrow: "Management personal",
      title: "Lucratori medicali si personal",
      subtitle: "Gestioneaza profilurile personalului, aloca pacienti si urmareste echipa activa.",
      noDatabase: "Conecteaza MySQL si aplica migrarea 006 pentru a gestiona lucratorii medicali.",
      totalStaffWorkers: "Total personal",
      activeStaff: "Personal activ",
      assignedPatients: "Pacienti alocati",
      unassignedPatients: "Pacienti nealocati",
    },
    requestsTable: {
      searchPlaceholder: "Cauta dupa nume, telefon, email sau descriere...",
      sortNewest: "Sortare: cele mai noi",
      sortOldest: "Sortare: cele mai vechi",
      sortPriority: "Sortare: prioritate",
      exportCsv: "Export CSV",
      refreshTitle: "Reimprospateaza cererile medicale",
      refresh: "Reimprospateaza",
      refreshing: "Se actualizeaza...",
      filter: "Filtru",
      allRequests: "Toate cererile",
      pending: "In asteptare",
      inProgress: "In curs",
      resolved: "Rezolvate",
      archived: "Arhivate",
      dismiss: "Inchide",
      showing: (visible, total) => `Se afiseaza ${visible} din ${total} cereri`,
      noRequests: "Nu exista cereri",
      noRequestsHint: "Incearca sa modifici cautarea sau filtrul de status.",
      notProvided: "Nespecificat",
      urgent: "Urgent",
      noteAttached: "Nota atasata",
      deleting: "Se sterge...",
      delete: "Sterge",
      cancel: "Anuleaza",
      deleteRequest: "Sterge cererea",
      openEmailTemplates: "Deschide sabloane email",
      details: "Detalii",
      errorDelete: "Stergerea cererii a esuat.",
      errorDeleteUnexpected: "A aparut o eroare la stergerea cererii.",
      errorUpdateStatus: "Actualizarea statusului cererii a esuat.",
    },
    followupsDashboard: {
      eyebrow: "Coada monitorizari",
      title: "Monitorizari si remindere pacienti",
      subtitle: "Urmareste consultatiile programate, monitorizarile intarziate si verificarile pacientilor.",
      noDatabase: "Conecteaza MySQL pentru a gestiona monitorizarile pacientilor.",
      totalClients: "Total clienti / pacienti",
      attention: "Atentie",
      overdue: "Monitorizari intarziate",
      dueToday: "Scadente azi",
      upcoming: "Programate viitor",
      criticalPatients: "Pacienti critici",
      searchPlaceholder: "Cauta clienti dupa nume, telefon, titlu, notite...",
      exportCsv: "Export CSV",
      refreshTitle: "Reimprospateaza monitorizarile",
      refresh: "Reimprospateaza",
      refreshing: "Se actualizeaza...",
      followupState: "Stare monitorizare",
      allStates: "Toate starile",
      stateOverdue: "INTARZIAT",
      stateToday: "Scadent azi",
      stateUpcoming: "Viitor",
      stateCompleted: "Finalizat",
      stateNone: "Fara monitorizare",
      patientPriority: "Prioritate pacient",
      allPriorities: "Toate prioritatile",
      noMatches: "Nicio monitorizare nu corespunde",
      noMatchesHint: "Incearca sa stergi cautarea sau sa ajustezi filtrele.",
      recordId: (id) => `ID dosar #${id}`,
      date: "Data",
      outcome: "Rezultat",
      noFollowupLogged: "Nicio monitorizare inregistrata",
      careSuffix: "ingrijire",
      markCompleteTitle: "Marcheaza monitorizarea ca finalizata",
      complete: "Finalizeaza",
      scheduleTitle: "Programeaza monitorizare noua",
      schedule: "Programeaza",
      profile: "Profil",
      modalScheduleTitle: "Programeaza monitorizare",
      modalClient: "Client",
      modalPriority: "Prioritate",
      modalSuggestedInterval: "Interval recomandat",
      modalDays: "zile",
      modalTitleLabel: "Titlu / scop monitorizare",
      modalTitlePlaceholder: "ex. Apel pentru verificarea tratamentului",
      modalDateLabel: "Data programata",
      modalNotesLabel: "Instructiuni / notite personal",
      modalNotesPlaceholder: "Notite pentru membrul echipei care face monitorizarea...",
      modalReminder: "Seteaza notificare activa",
      scheduling: "Se programeaza...",
      saveFollowup: "Salveaza monitorizarea",
      completeFollowupTitle: "Finalizeaza monitorizarea",
      completeFollowupSubtitle: (name) => `Adauga un rezultat pentru ${name}.`,
      closeCompletion: "Inchide formularul",
      followupNotes: "Notite monitorizare",
      completionPlaceholder: "Noteaza contactul, rezultatul, pasii urmatori sau ingrijorari.",
      saving: "Se salveaza...",
      completeFollowup: "Finalizeaza monitorizarea",
      errorUpdateStatus: "Actualizarea statusului monitorizarii a esuat.",
      errorSchedule: "Programarea monitorizarii a esuat.",
      errorScheduleUnexpected: "A aparut o eroare la salvare.",
    },
  },
  sq: {
    adminShell: {
      requests: "Kerkesa",
      patients: "Pacientet",
      workers: "Punonjesit",
      followups: "Ndjekje",
      calendar: "Kalendari",
      mediator: "Rast i ri per mediator",
      manage: "Menaxho",
      expandNav: "Zgjero navigimin e panelit",
      minimizeNav: "Ngushto navigimin e panelit",
      pendingRequests: (count) => `${count} kerkesa ne pritje`,
      overdueFollowups: (count) => `${count} ndjekje te vonuara`,
      returnToWebsite: "Kthehu ne faqe",
      signOut: "Dil",
      openMenu: "Hap menune e panelit",
      closeMenu: "Mbyll menune e panelit",
    },
    dashboardOverview: {
      totalRequests: "Totali i kerkesave",
      pendingAction: "Veprim ne pritje",
      inProgress: "Ne progres",
      resolved: "Te zgjidhura",
      receivedToday: "Marre sot",
      active: "Aktive",
    },
    workerDashboard: {
      eyebrow: "Kerkesa",
      title: "Kerkesa per ndihme mjekesore",
      subtitle: "Shqyrto, vendos perparesi dhe pergjigju kerkesave te ardhura.",
      noDatabase: "Lidh MySQL dhe apliko migrimet per te menaxhuar kerkesat mjekesore.",
      queueTitle: "Radha e kerkesave mjekesore",
    },
    patientsDashboard: {
      eyebrow: "Pacientet",
      title: "Profilet dhe dosjet e pacienteve",
      subtitle: "Menaxho profilet mjekesore, statusin e kujdesit dhe historine e trajtimit.",
      noDatabase: "Lidh MySQL dhe apliko migrimin 003 per menaxhimin e pacienteve.",
    },
    workersDashboard: {
      eyebrow: "Menaxhimi i stafit",
      title: "Punonjesit dhe stafi shendetesor",
      subtitle: "Menaxho stafin, cakto paciente dhe ndiq stafin aktiv.",
      noDatabase: "Lidh MySQL dhe apliko migrimin 006 per menaxhimin e stafit.",
      totalStaffWorkers: "Totali i stafit",
      activeStaff: "Staf aktiv",
      assignedPatients: "Pacient te caktuar",
      unassignedPatients: "Pacient pa caktim",
    },
    requestsTable: {
      searchPlaceholder: "Kerko sipas emrit, telefonit, emailit ose pershkrimit...",
      sortNewest: "Rendit: me te rejat",
      sortOldest: "Rendit: me te vjetrat",
      sortPriority: "Rendit: perparesi",
      exportCsv: "Eksporto CSV",
      refreshTitle: "Perditeso kerkesat mjekesore",
      refresh: "Perditeso",
      refreshing: "Duke perditesuar...",
      filter: "Filtër",
      allRequests: "Te gjitha kerkesat",
      pending: "Ne pritje",
      inProgress: "Ne progres",
      resolved: "Te zgjidhura",
      archived: "Arkivuar",
      dismiss: "Mbyll",
      showing: (visible, total) => `Shfaqen ${visible} nga ${total} kerkesa`,
      noRequests: "Nuk u gjeten kerkesa",
      noRequestsHint: "Provoni te ndryshoni kerkimin ose filtrin.",
      notProvided: "Pa specifikuar",
      urgent: "Urgjente",
      noteAttached: "Shenim i bashkangjitur",
      deleting: "Duke fshire...",
      delete: "Fshij",
      cancel: "Anulo",
      deleteRequest: "Fshij kerkesen",
      openEmailTemplates: "Hap modelet e email-it",
      details: "Detaje",
      errorDelete: "Deshtoi fshirja e kerkeses.",
      errorDeleteUnexpected: "Ndodhi nje gabim gjate fshirjes.",
      errorUpdateStatus: "Deshtoi perditesimi i statusit.",
    },
    followupsDashboard: {
      eyebrow: "Radha e ndjekjeve",
      title: "Ndjekje dhe kujtues per pacientet",
      subtitle: "Ndiq konsultat e planifikuara, rastet e vonuara dhe kontrollat e pacienteve.",
      noDatabase: "Lidh MySQL per te menaxhuar ndjekjet e pacienteve.",
      totalClients: "Total kliente / paciente",
      attention: "Kujdes",
      overdue: "Ndjekje te vonuara",
      dueToday: "Sot per t'u kryer",
      upcoming: "Te planifikuara",
      criticalPatients: "Pacient kritik",
      searchPlaceholder: "Kerko kliente sipas emrit, telefonit, titullit, shenimeve...",
      exportCsv: "Eksporto CSV",
      refreshTitle: "Perditeso ndjekjet",
      refresh: "Perditeso",
      refreshing: "Duke perditesuar...",
      followupState: "Gjendja e ndjekjes",
      allStates: "Te gjitha gjendjet",
      stateOverdue: "VONUAR",
      stateToday: "Sot",
      stateUpcoming: "Ne vazhdim",
      stateCompleted: "Perfunduar",
      stateNone: "Pa ndjekje",
      patientPriority: "Prioriteti i pacientit",
      allPriorities: "Te gjitha prioritetet",
      noMatches: "Asnje ndjekje nuk perputhet",
      noMatchesHint: "Pastro kerkimin ose ndrysho filtrat.",
      recordId: (id) => `ID e dosjes #${id}`,
      date: "Data",
      outcome: "Rezultati",
      noFollowupLogged: "Nuk ka ndjekje te regjistruar",
      careSuffix: "kujdes",
      markCompleteTitle: "Sheno ndjekjen e fundit si te perfunduar",
      complete: "Perfundo",
      scheduleTitle: "Planifiko ndjekje te re",
      schedule: "Planifiko",
      profile: "Profili",
      modalScheduleTitle: "Planifiko ndjekje",
      modalClient: "Klienti",
      modalPriority: "Prioriteti",
      modalSuggestedInterval: "Intervali i sugjeruar",
      modalDays: "dite",
      modalTitleLabel: "Titulli / qellimi i ndjekjes",
      modalTitlePlaceholder: "p.sh. Telefonate per ecurine e mjekimit",
      modalDateLabel: "Data e planifikuar",
      modalNotesLabel: "Udhezime / shenime per stafin",
      modalNotesPlaceholder: "Shenime per anetarin e stafit qe kryen ndjekjen...",
      modalReminder: "Vendos kujtues aktiv",
      scheduling: "Duke planifikuar...",
      saveFollowup: "Ruaj ndjekjen",
      completeFollowupTitle: "Perfundo ndjekjen",
      completeFollowupSubtitle: (name) => `Shto nje shenim rezultati per ${name}.`,
      closeCompletion: "Mbyll formularin",
      followupNotes: "Shenime ndjekjeje",
      completionPlaceholder: "Shkruaj kontaktin, rezultatin, hapat e ardhshem ose shqetesimet.",
      saving: "Duke ruajtur...",
      completeFollowup: "Perfundo ndjekjen",
      errorUpdateStatus: "Deshtoi perditesimi i statusit te ndjekjes.",
      errorSchedule: "Deshtoi planifikimi i ndjekjes.",
      errorScheduleUnexpected: "Ndodhi nje gabim gjate ruajtjes.",
    },
  },
  it: {
    adminShell: {
      requests: "Richieste",
      patients: "Pazienti",
      workers: "Operatori",
      followups: "Follow-up",
      calendar: "Calendario",
      mediator: "Nuovo caso mediatore",
      manage: "Gestione",
      expandNav: "Espandi la navigazione del pannello",
      minimizeNav: "Riduci la navigazione del pannello",
      pendingRequests: (count) => `${count} richieste in attesa`,
      overdueFollowups: (count) => `${count} follow-up in ritardo`,
      returnToWebsite: "Torna al sito",
      signOut: "Esci",
      openMenu: "Apri menu amministrazione",
      closeMenu: "Chiudi menu amministrazione",
    },
    dashboardOverview: {
      totalRequests: "Richieste totali",
      pendingAction: "Azione in attesa",
      inProgress: "In corso",
      resolved: "Risolte",
      receivedToday: "Ricevute oggi",
      active: "Attivo",
    },
    workerDashboard: {
      eyebrow: "Richieste",
      title: "Richieste di aiuto medico",
      subtitle: "Rivedi, assegna priorita e rispondi alle richieste in arrivo.",
      noDatabase: "Connetti MySQL e applica le migrazioni per gestire le richieste mediche.",
      queueTitle: "Coda richieste aiuto medico",
    },
    patientsDashboard: {
      eyebrow: "Pazienti",
      title: "Profili e cartelle pazienti",
      subtitle: "Gestisci profili medici, stato di cura, note cliniche e storico trattamenti.",
      noDatabase: "Connetti MySQL e applica la migrazione 003 per gestire i pazienti.",
    },
    workersDashboard: {
      eyebrow: "Gestione staff",
      title: "Operatori sanitari e staff",
      subtitle: "Gestisci i profili dello staff, assegna pazienti e monitora il personale attivo.",
      noDatabase: "Connetti MySQL e applica la migrazione 006 per gestire gli operatori.",
      totalStaffWorkers: "Totale staff",
      activeStaff: "Staff attivo",
      assignedPatients: "Pazienti assegnati",
      unassignedPatients: "Pazienti non assegnati",
    },
    requestsTable: {
      searchPlaceholder: "Cerca per nome, telefono, email o descrizione...",
      sortNewest: "Ordina: piu recenti",
      sortOldest: "Ordina: piu vecchie",
      sortPriority: "Ordina: priorita",
      exportCsv: "Esporta CSV",
      refreshTitle: "Aggiorna richieste mediche",
      refresh: "Aggiorna",
      refreshing: "Aggiornamento...",
      filter: "Filtro",
      allRequests: "Tutte le richieste",
      pending: "In attesa",
      inProgress: "In corso",
      resolved: "Risolte",
      archived: "Archiviate",
      dismiss: "Chiudi",
      showing: (visible, total) => `Mostrate ${visible} di ${total} richieste`,
      noRequests: "Nessuna richiesta trovata",
      noRequestsHint: "Prova a modificare la ricerca o il filtro stato.",
      notProvided: "Non specificato",
      urgent: "Urgente",
      noteAttached: "Nota allegata",
      deleting: "Eliminazione...",
      delete: "Elimina",
      cancel: "Annulla",
      deleteRequest: "Elimina richiesta",
      openEmailTemplates: "Apri modelli email",
      details: "Dettagli",
      errorDelete: "Eliminazione richiesta non riuscita.",
      errorDeleteUnexpected: "Si e verificato un errore durante l'eliminazione.",
      errorUpdateStatus: "Aggiornamento stato non riuscito.",
    },
    followupsDashboard: {
      eyebrow: "Coda follow-up",
      title: "Follow-up e promemoria pazienti",
      subtitle: "Monitora consulti pianificati, promemoria in ritardo e controlli pazienti.",
      noDatabase: "Connetti MySQL per gestire follow-up e pianificazione cure.",
      totalClients: "Totale clienti / pazienti",
      attention: "Attenzione",
      overdue: "Follow-up in ritardo",
      dueToday: "Scadenza oggi",
      upcoming: "Programmato",
      criticalPatients: "Pazienti critici",
      searchPlaceholder: "Cerca clienti per nome, telefono, titolo, note...",
      exportCsv: "Esporta CSV",
      refreshTitle: "Aggiorna follow-up",
      refresh: "Aggiorna",
      refreshing: "Aggiornamento...",
      followupState: "Stato follow-up",
      allStates: "Tutti gli stati",
      stateOverdue: "IN RITARDO",
      stateToday: "Scadenza oggi",
      stateUpcoming: "Prossimi",
      stateCompleted: "Completati",
      stateNone: "Nessun follow-up",
      patientPriority: "Priorita paziente",
      allPriorities: "Tutte le priorita",
      noMatches: "Nessun follow-up corrisponde ai criteri",
      noMatchesHint: "Prova a cancellare la ricerca o a modificare i filtri.",
      recordId: (id) => `ID scheda #${id}`,
      date: "Data",
      outcome: "Esito",
      noFollowupLogged: "Nessun follow-up registrato",
      careSuffix: "cura",
      markCompleteTitle: "Segna l'ultimo follow-up come completato",
      complete: "Completa",
      scheduleTitle: "Pianifica nuovo follow-up",
      schedule: "Pianifica",
      profile: "Profilo",
      modalScheduleTitle: "Pianifica follow-up",
      modalClient: "Cliente",
      modalPriority: "Priorita",
      modalSuggestedInterval: "Intervallo consigliato",
      modalDays: "giorni",
      modalTitleLabel: "Titolo / scopo follow-up",
      modalTitlePlaceholder: "es. Chiamata per verificare i progressi della terapia",
      modalDateLabel: "Data pianificata",
      modalNotesLabel: "Istruzioni / note staff",
      modalNotesPlaceholder: "Note per l'operatore che eseguira il follow-up...",
      modalReminder: "Imposta promemoria attivo",
      scheduling: "Pianificazione...",
      saveFollowup: "Salva follow-up",
      completeFollowupTitle: "Completa follow-up",
      completeFollowupSubtitle: (name) => `Aggiungi una nota di esito per ${name}.`,
      closeCompletion: "Chiudi modulo completamento",
      followupNotes: "Note follow-up",
      completionPlaceholder: "Registra contatto, esito, passi successivi o criticita.",
      saving: "Salvataggio...",
      completeFollowup: "Completa follow-up",
      errorUpdateStatus: "Aggiornamento stato follow-up non riuscito.",
      errorSchedule: "Pianificazione follow-up non riuscita.",
      errorScheduleUnexpected: "Si e verificato un errore durante il salvataggio.",
    },
  },
};
