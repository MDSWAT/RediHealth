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
    logs: string;
    reportIssue: string;
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
  activityLogs: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    refresh: string;
    refreshing: string;
    noDatabase: string;
    noEntries: string;
    when: string;
    actor: string;
    action: string;
    entity: string;
    details: string;
    unknownActor: string;
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
    view: string;
    viewList: string;
    viewGrid: string;
    pin: string;
    unpin: string;
    pinned: string;
    statusUpdatedBy: (name: string) => string;
    filter: string;
    urgency: string;
    urgencyAll: string;
    urgencyUrgent: string;
    urgencyNormal: string;
    createdFrom: string;
    createdTo: string;
    clearDates: string;
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
    createMeeting: string;
    openMeeting: string;
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
      workers: "Staff",
      logs: "Activity log",
      reportIssue: "Report a problem",
      followups: "Follow-ups",
      calendar: "Calendar",
      mediator: "New mediator case",
      manage: "Manage",
      expandNav: "Expand menu",
      minimizeNav: "Collapse menu",
      pendingRequests: (count) => (count === 1 ? "1 request needs attention" : `${count} requests need attention`),
      overdueFollowups: (count) => `${count} overdue follow-ups`,
      returnToWebsite: "Back to website",
      signOut: "Sign out",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    dashboardOverview: {
      totalRequests: "All requests",
      pendingAction: "Pending",
      inProgress: "In progress",
      resolved: "Resolved",
      receivedToday: "Received today",
      active: "Active",
    },
    workerDashboard: {
      eyebrow: "Requests",
      title: "Help requests",
      subtitle: "Answer new requests. Urgent ones come first.",
      noDatabase: "Database not connected. Connect MySQL and run the migrations.",
      queueTitle: "Request list",
    },
    patientsDashboard: {
      eyebrow: "Patients",
      title: "Patient records",
      subtitle: "Care status, notes and treatment for each patient.",
      noDatabase: "Database not connected. Connect MySQL and run migration 003.",
    },
    workersDashboard: {
      eyebrow: "Staff",
      title: "Staff and assigned patients",
      subtitle: "Add staff and assign patients to them.",
      noDatabase: "Database not connected. Connect MySQL and run migration 006.",
      totalStaffWorkers: "All staff",
      activeStaff: "Active staff",
      assignedPatients: "Assigned patients",
      unassignedPatients: "Unassigned patients",
    },
    activityLogs: {
      eyebrow: "Activity log",
      title: "Staff activity",
      subtitle: "Who changed what, and when.",
      searchPlaceholder: "Search by person, action or details",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      noDatabase: "Database not connected. Connect MySQL and run migration 006.",
      noEntries: "No activity yet.",
      when: "When",
      actor: "Who",
      action: "Action",
      entity: "Item",
      details: "Details",
      unknownActor: "Unknown",
    },
    requestsTable: {
      searchPlaceholder: "Search by name, phone, email or text",
      sortNewest: "Newest first",
      sortOldest: "Oldest first",
      sortPriority: "Urgent first",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh requests",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      view: "View",
      viewList: "List",
      viewGrid: "Grid",
      pin: "Pin request",
      unpin: "Unpin request",
      pinned: "Pinned",
      statusUpdatedBy: (name) => `Status updated by ${name}`,
      filter: "Filter",
      urgency: "Urgency",
      urgencyAll: "All",
      urgencyUrgent: "Urgent",
      urgencyNormal: "Normal",
      createdFrom: "From",
      createdTo: "To",
      clearDates: "Clear dates",
      allRequests: "All requests",
      pending: "Pending",
      inProgress: "In progress",
      resolved: "Resolved",
      archived: "Archived",
      dismiss: "Close",
      showing: (visible, total) => `${visible} of ${total} requests`,
      noRequests: "No requests",
      noRequestsHint: "Change the search or the status filter.",
      notProvided: "Not given",
      urgent: "Urgent",
      noteAttached: "Has a note",
      deleting: "Deleting...",
      delete: "Delete",
      cancel: "Cancel",
      deleteRequest: "Delete request",
      openEmailTemplates: "Email templates",
      details: "Details",
      errorDelete: "Could not delete the request.",
      errorDeleteUnexpected: "Could not delete the request. Try again.",
      errorUpdateStatus: "Could not change the status.",
    },
    followupsDashboard: {
      eyebrow: "Follow-ups",
      title: "Patient follow-ups",
      subtitle: "Planned calls and visits for each patient.",
      noDatabase: "Database not connected. Connect MySQL to see follow-ups.",
      totalClients: "All patients",
      attention: "Needs attention",
      overdue: "Overdue",
      dueToday: "Due today",
      upcoming: "Upcoming",
      criticalPatients: "Critical patients",
      searchPlaceholder: "Search by name, phone, title or notes",
      exportCsv: "Export CSV",
      refreshTitle: "Refresh follow-ups",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      followupState: "Follow-up status",
      allStates: "All",
      stateOverdue: "Overdue",
      stateToday: "Due today",
      stateUpcoming: "Upcoming",
      stateCompleted: "Done",
      stateNone: "No follow-up",
      patientPriority: "Priority",
      allPriorities: "All priorities",
      noMatches: "No follow-ups found",
      noMatchesHint: "Clear the search or change the filters.",
      recordId: (id) => `Record #${id}`,
      date: "Date",
      outcome: "Outcome",
      noFollowupLogged: "No follow-up yet",
      careSuffix: "care",
      markCompleteTitle: "Mark the last follow-up as done",
      complete: "Mark done",
      scheduleTitle: "Plan a new follow-up",
      schedule: "Plan",
      profile: "Profile",
      modalScheduleTitle: "Plan a follow-up",
      modalClient: "Patient",
      modalPriority: "Priority",
      modalSuggestedInterval: "Suggested interval",
      modalDays: "days",
      modalTitleLabel: "Reason",
      modalTitlePlaceholder: "e.g. Call to ask about the medicine",
      modalDateLabel: "Date",
      modalNotesLabel: "Notes for staff",
      modalNotesPlaceholder: "What the staff member should do or ask",
      modalReminder: "Send a reminder",
      createMeeting: "Add a video meeting",
      openMeeting: "Open meeting",
      scheduling: "Saving...",
      saveFollowup: "Save follow-up",
      completeFollowupTitle: "Close follow-up",
      completeFollowupSubtitle: (name) => `Write what happened with ${name}.`,
      closeCompletion: "Close form",
      followupNotes: "Notes",
      completionPlaceholder: "Who you reached, what was decided, next steps.",
      saving: "Saving...",
      completeFollowup: "Mark done",
      errorUpdateStatus: "Could not change the status.",
      errorSchedule: "Could not save the follow-up.",
      errorScheduleUnexpected: "Could not save the follow-up. Try again.",
    },
  },
  ro: {
    adminShell: {
      requests: "Solicitări",
      patients: "Pacienți",
      workers: "Personal",
      logs: "Jurnal de activitate",
      reportIssue: "Raportează o problemă",
      followups: "Monitorizări",
      calendar: "Calendar",
      mediator: "Caz nou de mediere",
      manage: "Administrare",
      expandNav: "Deschide meniul lateral",
      minimizeNav: "Strânge meniul lateral",
      pendingRequests: (count) => (count === 1 ? "1 solicitare necesită atenție" : `${count} ${count % 100 === 0 || count % 100 >= 20 ? "de " : ""}solicitări necesită atenție`),
      overdueFollowups: (count) => `${count} monitorizări întârziate`,
      returnToWebsite: "Înapoi la site",
      signOut: "Ieși din cont",
      openMenu: "Deschide meniul",
      closeMenu: "Închide meniul",
    },
    dashboardOverview: {
      totalRequests: "Toate solicitările",
      pendingAction: "În așteptare",
      inProgress: "În lucru",
      resolved: "Rezolvate",
      receivedToday: "Primite azi",
      active: "Active",
    },
    workerDashboard: {
      eyebrow: "Solicitări",
      title: "Solicitări de ajutor",
      subtitle: "Răspunde la solicitările noi. Cele urgente apar primele.",
      noDatabase: "Baza de date nu e conectată. Conectează MySQL și rulează migrările.",
      queueTitle: "Lista solicitărilor",
    },
    patientsDashboard: {
      eyebrow: "Pacienți",
      title: "Dosarele pacienților",
      subtitle: "Starea îngrijirii, notițe și tratament pentru fiecare pacient.",
      noDatabase: "Baza de date nu e conectată. Conectează MySQL și rulează migrarea 003.",
    },
    workersDashboard: {
      eyebrow: "Personal",
      title: "Personal și pacienți alocați",
      subtitle: "Adaugă membri ai personalului și alocă-le pacienți.",
      noDatabase: "Baza de date nu e conectată. Conectează MySQL și rulează migrarea 006.",
      totalStaffWorkers: "Tot personalul",
      activeStaff: "Personal activ",
      assignedPatients: "Pacienți alocați",
      unassignedPatients: "Pacienți nealocați",
    },
    activityLogs: {
      eyebrow: "Jurnal de activitate",
      title: "Activitatea personalului",
      subtitle: "Cine a schimbat ce și când.",
      searchPlaceholder: "Caută după persoană, acțiune sau detalii",
      refresh: "Actualizează",
      refreshing: "Se actualizează...",
      noDatabase: "Baza de date nu e conectată. Conectează MySQL și rulează migrarea 006.",
      noEntries: "Nu există activitate încă.",
      when: "Când",
      actor: "Cine",
      action: "Acțiune",
      entity: "Element",
      details: "Detalii",
      unknownActor: "Necunoscut",
    },
    requestsTable: {
      searchPlaceholder: "Caută după nume, telefon, email sau text",
      sortNewest: "Cele mai noi",
      sortOldest: "Cele mai vechi",
      sortPriority: "Urgente întâi",
      exportCsv: "Exportă CSV",
      refreshTitle: "Actualizează solicitările",
      refresh: "Actualizează",
      refreshing: "Se actualizează...",
      view: "Afișare",
      viewList: "Listă",
      viewGrid: "Carduri",
      pin: "Fixează solicitarea",
      unpin: "Anulează fixarea",
      pinned: "Fixată",
      statusUpdatedBy: (name) => `Status schimbat de ${name}`,
      filter: "Filtru",
      urgency: "Urgență",
      urgencyAll: "Toate",
      urgencyUrgent: "Urgente",
      urgencyNormal: "Normale",
      createdFrom: "De la",
      createdTo: "Până la",
      clearDates: "Șterge datele",
      allRequests: "Toate solicitările",
      pending: "În așteptare",
      inProgress: "În lucru",
      resolved: "Rezolvate",
      archived: "Arhivate",
      dismiss: "Închide",
      showing: (visible, total) => `${visible} din ${total} solicitări`,
      noRequests: "Nu există solicitări",
      noRequestsHint: "Schimbă căutarea sau filtrul de status.",
      notProvided: "Necompletat",
      urgent: "Urgent",
      noteAttached: "Are notă",
      deleting: "Se șterge...",
      delete: "Șterge",
      cancel: "Anulează",
      deleteRequest: "Șterge solicitarea",
      openEmailTemplates: "Șabloane email",
      details: "Detalii",
      errorDelete: "Solicitarea nu a putut fi ștearsă.",
      errorDeleteUnexpected: "Solicitarea nu a putut fi ștearsă. Încearcă din nou.",
      errorUpdateStatus: "Statusul nu a putut fi schimbat.",
    },
    followupsDashboard: {
      eyebrow: "Monitorizări",
      title: "Monitorizarea pacienților",
      subtitle: "Apelurile și vizitele planificate pentru fiecare pacient.",
      noDatabase: "Baza de date nu e conectată. Conectează MySQL ca să vezi monitorizările.",
      totalClients: "Toți pacienții",
      attention: "Necesită atenție",
      overdue: "Întârziate",
      dueToday: "Azi",
      upcoming: "Următoare",
      criticalPatients: "Pacienți critici",
      searchPlaceholder: "Caută după nume, telefon, titlu sau notițe",
      exportCsv: "Exportă CSV",
      refreshTitle: "Actualizează monitorizările",
      refresh: "Actualizează",
      refreshing: "Se actualizează...",
      followupState: "Status monitorizare",
      allStates: "Toate",
      stateOverdue: "Întârziată",
      stateToday: "Azi",
      stateUpcoming: "Următoare",
      stateCompleted: "Făcută",
      stateNone: "Fără monitorizare",
      patientPriority: "Prioritate",
      allPriorities: "Toate prioritățile",
      noMatches: "Nu am găsit monitorizări",
      noMatchesHint: "Șterge căutarea sau schimbă filtrele.",
      recordId: (id) => `Dosar #${id}`,
      date: "Data",
      outcome: "Rezultat",
      noFollowupLogged: "Nicio monitorizare încă",
      careSuffix: "îngrijire",
      markCompleteTitle: "Marchează ultima monitorizare ca făcută",
      complete: "Marchează făcută",
      scheduleTitle: "Planifică o monitorizare",
      schedule: "Planifică",
      profile: "Profil",
      modalScheduleTitle: "Planifică o monitorizare",
      modalClient: "Pacient",
      modalPriority: "Prioritate",
      modalSuggestedInterval: "Interval recomandat",
      modalDays: "zile",
      modalTitleLabel: "Motiv",
      modalTitlePlaceholder: "ex. Sună să întrebi de tratament",
      modalDateLabel: "Data",
      modalNotesLabel: "Notițe pentru personal",
      modalNotesPlaceholder: "Ce trebuie să facă sau să întrebe colegul",
      modalReminder: "Trimite memento",
      createMeeting: "Adaugă o întâlnire video",
      openMeeting: "Deschide întâlnirea",
      scheduling: "Se salvează...",
      saveFollowup: "Salvează monitorizarea",
      completeFollowupTitle: "Închide monitorizarea",
      completeFollowupSubtitle: (name) => `Scrie ce s-a întâmplat cu ${name}.`,
      closeCompletion: "Închide formularul",
      followupNotes: "Notițe",
      completionPlaceholder: "Pe cine ai contactat, ce s-a hotărât, pașii următori.",
      saving: "Se salvează...",
      completeFollowup: "Marchează făcută",
      errorUpdateStatus: "Statusul nu a putut fi schimbat.",
      errorSchedule: "Monitorizarea nu a putut fi salvată.",
      errorScheduleUnexpected: "Monitorizarea nu a putut fi salvată. Încearcă din nou.",
    },
  },
  sq: {
    adminShell: {
      requests: "Kërkesa",
      patients: "Pacientët",
      workers: "Stafi",
      logs: "Regjistri i veprimeve",
      reportIssue: "Raporto një problem",
      followups: "Ndjekjet",
      calendar: "Kalendari",
      mediator: "Rast i ri i mediatorit",
      manage: "Administrimi",
      expandNav: "Hap menunë anësore",
      minimizeNav: "Mbyll menunë anësore",
      pendingRequests: (count) => (count === 1 ? "1 kërkesë kërkon vëmendje" : `${count} kërkesa kërkojnë vëmendje`),
      overdueFollowups: (count) => `${count} ndjekje me vonesë`,
      returnToWebsite: "Kthehu te faqja",
      signOut: "Dil",
      openMenu: "Hap menunë",
      closeMenu: "Mbyll menunë",
    },
    dashboardOverview: {
      totalRequests: "Të gjitha kërkesat",
      pendingAction: "Në pritje",
      inProgress: "Në punë",
      resolved: "Të zgjidhura",
      receivedToday: "Ardhur sot",
      active: "Aktive",
    },
    workerDashboard: {
      eyebrow: "Kërkesat",
      title: "Kërkesat për ndihmë",
      subtitle: "Përgjigju kërkesave të reja. Të urgjentat dalin të parat.",
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh MySQL dhe ekzekuto migrimet.",
      queueTitle: "Lista e kërkesave",
    },
    patientsDashboard: {
      eyebrow: "Pacientët",
      title: "Dosjet e pacientëve",
      subtitle: "Gjendja e kujdesit, shënimet dhe trajtimi për çdo pacient.",
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh MySQL dhe ekzekuto migrimin 003.",
    },
    workersDashboard: {
      eyebrow: "Stafi",
      title: "Stafi dhe pacientët e caktuar",
      subtitle: "Shto punonjës dhe cakto pacientë për ta.",
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh MySQL dhe ekzekuto migrimin 006.",
      totalStaffWorkers: "I gjithë stafi",
      activeStaff: "Staf aktiv",
      assignedPatients: "Pacientë të caktuar",
      unassignedPatients: "Pacientë pa caktim",
    },
    activityLogs: {
      eyebrow: "Regjistri i veprimeve",
      title: "Veprimet e stafit",
      subtitle: "Kush ndryshoi çfarë dhe kur.",
      searchPlaceholder: "Kërko sipas personit, veprimit ose detajeve",
      refresh: "Rifresko",
      refreshing: "Duke rifreskuar...",
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh MySQL dhe ekzekuto migrimin 006.",
      noEntries: "Ende nuk ka veprime.",
      when: "Kur",
      actor: "Kush",
      action: "Veprimi",
      entity: "Elementi",
      details: "Detaje",
      unknownActor: "I panjohur",
    },
    requestsTable: {
      searchPlaceholder: "Kërko sipas emrit, telefonit, emailit ose tekstit",
      sortNewest: "Më të rejat",
      sortOldest: "Më të vjetrat",
      sortPriority: "Urgjentet së pari",
      exportCsv: "Eksporto CSV",
      refreshTitle: "Rifresko kërkesat",
      refresh: "Rifresko",
      refreshing: "Duke rifreskuar...",
      view: "Pamja",
      viewList: "Listë",
      viewGrid: "Karta",
      pin: "Fikso kërkesën",
      unpin: "Hiq fiksimin",
      pinned: "E fiksuar",
      statusUpdatedBy: (name) => `Statusi u ndryshua nga ${name}`,
      filter: "Filtri",
      urgency: "Urgjenca",
      urgencyAll: "Të gjitha",
      urgencyUrgent: "Urgjente",
      urgencyNormal: "Normale",
      createdFrom: "Nga",
      createdTo: "Deri",
      clearDates: "Pastro datat",
      allRequests: "Të gjitha kërkesat",
      pending: "Në pritje",
      inProgress: "Në punë",
      resolved: "Të zgjidhura",
      archived: "Të arkivuara",
      dismiss: "Mbyll",
      showing: (visible, total) => `${visible} nga ${total} kërkesa`,
      noRequests: "Nuk ka kërkesa",
      noRequestsHint: "Ndrysho kërkimin ose filtrin e statusit.",
      notProvided: "Pa plotësuar",
      urgent: "Urgjente",
      noteAttached: "Ka shënim",
      deleting: "Duke fshirë...",
      delete: "Fshi",
      cancel: "Anulo",
      deleteRequest: "Fshi kërkesën",
      openEmailTemplates: "Modelet e emailit",
      details: "Detaje",
      errorDelete: "Kërkesa nuk u fshi.",
      errorDeleteUnexpected: "Kërkesa nuk u fshi. Provo përsëri.",
      errorUpdateStatus: "Statusi nuk u ndryshua.",
    },
    followupsDashboard: {
      eyebrow: "Ndjekjet",
      title: "Ndjekja e pacientëve",
      subtitle: "Telefonatat dhe vizitat e planifikuara për çdo pacient.",
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh MySQL për të parë ndjekjet.",
      totalClients: "Të gjithë pacientët",
      attention: "Kërkon vëmendje",
      overdue: "Me vonesë",
      dueToday: "Sot",
      upcoming: "Në vijim",
      criticalPatients: "Pacientë në gjendje kritike",
      searchPlaceholder: "Kërko sipas emrit, telefonit, titullit ose shënimeve",
      exportCsv: "Eksporto CSV",
      refreshTitle: "Rifresko ndjekjet",
      refresh: "Rifresko",
      refreshing: "Duke rifreskuar...",
      followupState: "Statusi i ndjekjes",
      allStates: "Të gjitha",
      stateOverdue: "Me vonesë",
      stateToday: "Sot",
      stateUpcoming: "Në vijim",
      stateCompleted: "E kryer",
      stateNone: "Pa ndjekje",
      patientPriority: "Prioriteti",
      allPriorities: "Të gjitha prioritetet",
      noMatches: "Nuk u gjet asnjë ndjekje",
      noMatchesHint: "Pastro kërkimin ose ndrysho filtrat.",
      recordId: (id) => `Dosja #${id}`,
      date: "Data",
      outcome: "Rezultati",
      noFollowupLogged: "Ende pa ndjekje",
      careSuffix: "kujdes",
      markCompleteTitle: "Shëno ndjekjen e fundit si të kryer",
      complete: "Shëno të kryer",
      scheduleTitle: "Planifiko një ndjekje",
      schedule: "Planifiko",
      profile: "Profili",
      modalScheduleTitle: "Planifiko një ndjekje",
      modalClient: "Pacienti",
      modalPriority: "Prioriteti",
      modalSuggestedInterval: "Intervali i sugjeruar",
      modalDays: "ditë",
      modalTitleLabel: "Arsyeja",
      modalTitlePlaceholder: "p.sh. Telefono për të pyetur për ilaçet",
      modalDateLabel: "Data",
      modalNotesLabel: "Shënime për stafin",
      modalNotesPlaceholder: "Çfarë duhet të bëjë ose të pyesë kolegu",
      modalReminder: "Dërgo kujtesë",
      createMeeting: "Shto një takim me video",
      openMeeting: "Hap takimin",
      scheduling: "Duke ruajtur...",
      saveFollowup: "Ruaj ndjekjen",
      completeFollowupTitle: "Mbyll ndjekjen",
      completeFollowupSubtitle: (name) => `Shkruaj çfarë ndodhi me ${name}.`,
      closeCompletion: "Mbyll formularin",
      followupNotes: "Shënime",
      completionPlaceholder: "Me kë fole, çfarë u vendos, hapat e ardhshëm.",
      saving: "Duke ruajtur...",
      completeFollowup: "Shëno të kryer",
      errorUpdateStatus: "Statusi nuk u ndryshua.",
      errorSchedule: "Ndjekja nuk u ruajt.",
      errorScheduleUnexpected: "Ndjekja nuk u ruajt. Provo përsëri.",
    },
  },
  it: {
    adminShell: {
      requests: "Richieste",
      patients: "Pazienti",
      workers: "Operatori",
      logs: "Registro attività",
      reportIssue: "Segnala un problema",
      followups: "Follow-up",
      calendar: "Calendario",
      mediator: "Nuovo caso di mediazione",
      manage: "Gestione",
      expandNav: "Apri il menu laterale",
      minimizeNav: "Chiudi il menu laterale",
      pendingRequests: (count) => (count === 1 ? "1 richiesta da seguire" : `${count} richieste da seguire`),
      overdueFollowups: (count) => `${count} follow-up in ritardo`,
      returnToWebsite: "Torna al sito",
      signOut: "Esci",
      openMenu: "Apri menu",
      closeMenu: "Chiudi menu",
    },
    dashboardOverview: {
      totalRequests: "Tutte le richieste",
      pendingAction: "In attesa",
      inProgress: "In lavorazione",
      resolved: "Risolte",
      receivedToday: "Arrivate oggi",
      active: "Attive",
    },
    workerDashboard: {
      eyebrow: "Richieste",
      title: "Richieste di aiuto",
      subtitle: "Rispondi alle nuove richieste. Quelle urgenti sono in cima.",
      noDatabase: "Database non collegato. Collega MySQL ed esegui le migrazioni.",
      queueTitle: "Elenco richieste",
    },
    patientsDashboard: {
      eyebrow: "Pazienti",
      title: "Schede pazienti",
      subtitle: "Stato delle cure, note e terapia di ogni paziente.",
      noDatabase: "Database non collegato. Collega MySQL ed esegui la migrazione 003.",
    },
    workersDashboard: {
      eyebrow: "Operatori",
      title: "Operatori e pazienti assegnati",
      subtitle: "Aggiungi operatori e assegna loro i pazienti.",
      noDatabase: "Database non collegato. Collega MySQL ed esegui la migrazione 006.",
      totalStaffWorkers: "Tutti gli operatori",
      activeStaff: "Operatori attivi",
      assignedPatients: "Pazienti assegnati",
      unassignedPatients: "Pazienti non assegnati",
    },
    activityLogs: {
      eyebrow: "Registro attività",
      title: "Attività degli operatori",
      subtitle: "Chi ha cambiato cosa, e quando.",
      searchPlaceholder: "Cerca per persona, azione o dettagli",
      refresh: "Aggiorna",
      refreshing: "Aggiornamento...",
      noDatabase: "Database non collegato. Collega MySQL ed esegui la migrazione 006.",
      noEntries: "Ancora nessuna attività.",
      when: "Quando",
      actor: "Chi",
      action: "Azione",
      entity: "Elemento",
      details: "Dettagli",
      unknownActor: "Sconosciuto",
    },
    requestsTable: {
      searchPlaceholder: "Cerca per nome, telefono, email o testo",
      sortNewest: "Più recenti",
      sortOldest: "Meno recenti",
      sortPriority: "Prima le urgenti",
      exportCsv: "Esporta CSV",
      refreshTitle: "Aggiorna richieste",
      refresh: "Aggiorna",
      refreshing: "Aggiornamento...",
      view: "Vista",
      viewList: "Elenco",
      viewGrid: "Schede",
      pin: "Fissa richiesta",
      unpin: "Sblocca richiesta",
      pinned: "Fissata",
      statusUpdatedBy: (name) => `Stato cambiato da ${name}`,
      filter: "Filtro",
      urgency: "Urgenza",
      urgencyAll: "Tutte",
      urgencyUrgent: "Urgenti",
      urgencyNormal: "Normali",
      createdFrom: "Dal",
      createdTo: "Al",
      clearDates: "Azzera date",
      allRequests: "Tutte le richieste",
      pending: "In attesa",
      inProgress: "In lavorazione",
      resolved: "Risolte",
      archived: "Archiviate",
      dismiss: "Chiudi",
      showing: (visible, total) => `${visible} di ${total} richieste`,
      noRequests: "Nessuna richiesta",
      noRequestsHint: "Cambia la ricerca o il filtro di stato.",
      notProvided: "Non indicato",
      urgent: "Urgente",
      noteAttached: "Con nota",
      deleting: "Eliminazione...",
      delete: "Elimina",
      cancel: "Annulla",
      deleteRequest: "Elimina richiesta",
      openEmailTemplates: "Modelli email",
      details: "Dettagli",
      errorDelete: "Impossibile eliminare la richiesta.",
      errorDeleteUnexpected: "Impossibile eliminare la richiesta. Riprova.",
      errorUpdateStatus: "Impossibile cambiare lo stato.",
    },
    followupsDashboard: {
      eyebrow: "Follow-up",
      title: "Follow-up dei pazienti",
      subtitle: "Chiamate e visite programmate per ogni paziente.",
      noDatabase: "Database non collegato. Collega MySQL per vedere i follow-up.",
      totalClients: "Tutti i pazienti",
      attention: "Da seguire",
      overdue: "In ritardo",
      dueToday: "Oggi",
      upcoming: "Prossimi",
      criticalPatients: "Pazienti critici",
      searchPlaceholder: "Cerca per nome, telefono, titolo o note",
      exportCsv: "Esporta CSV",
      refreshTitle: "Aggiorna follow-up",
      refresh: "Aggiorna",
      refreshing: "Aggiornamento...",
      followupState: "Stato follow-up",
      allStates: "Tutti",
      stateOverdue: "In ritardo",
      stateToday: "Oggi",
      stateUpcoming: "Prossimi",
      stateCompleted: "Fatti",
      stateNone: "Nessun follow-up",
      patientPriority: "Priorità",
      allPriorities: "Tutte le priorità",
      noMatches: "Nessun follow-up trovato",
      noMatchesHint: "Cancella la ricerca o cambia i filtri.",
      recordId: (id) => `Scheda #${id}`,
      date: "Data",
      outcome: "Esito",
      noFollowupLogged: "Ancora nessun follow-up",
      careSuffix: "cura",
      markCompleteTitle: "Segna l'ultimo follow-up come fatto",
      complete: "Segna fatto",
      scheduleTitle: "Programma un follow-up",
      schedule: "Programma",
      profile: "Profilo",
      modalScheduleTitle: "Programma un follow-up",
      modalClient: "Paziente",
      modalPriority: "Priorità",
      modalSuggestedInterval: "Intervallo consigliato",
      modalDays: "giorni",
      modalTitleLabel: "Motivo",
      modalTitlePlaceholder: "es. Chiama per chiedere della terapia",
      modalDateLabel: "Data",
      modalNotesLabel: "Note per l'operatore",
      modalNotesPlaceholder: "Cosa deve fare o chiedere il collega",
      modalReminder: "Invia promemoria",
      createMeeting: "Aggiungi una videochiamata",
      openMeeting: "Apri videochiamata",
      scheduling: "Salvataggio...",
      saveFollowup: "Salva follow-up",
      completeFollowupTitle: "Chiudi follow-up",
      completeFollowupSubtitle: (name) => `Scrivi com'è andata con ${name}.`,
      closeCompletion: "Chiudi modulo",
      followupNotes: "Note",
      completionPlaceholder: "Chi hai sentito, cosa avete deciso, prossimi passi.",
      saving: "Salvataggio...",
      completeFollowup: "Segna fatto",
      errorUpdateStatus: "Impossibile cambiare lo stato.",
      errorSchedule: "Impossibile salvare il follow-up.",
      errorScheduleUnexpected: "Impossibile salvare il follow-up. Riprova.",
    },
  },
};
