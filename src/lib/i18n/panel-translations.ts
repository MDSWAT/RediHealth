import type { Lang } from "@/lib/i18n/translations";

export const langToLocale: Record<Lang, string> = {
  ru: "ru-RU",

  en: "en-US",
  ro: "ro-RO",
  sq: "sq-AL",
  it: "it-IT",
  hr: "hr-HR",
  rom: "rom",
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
};

export const panelTranslations: Record<Lang, PanelTranslations> = {
  ru: {
    adminShell: {
      requests: "Запросы",
      patients: "Пациенты",
      workers: "Персонал",
      logs: "Журнал активности",
      reportIssue: "Сообщить о проблеме",
      followups: "Последующие действия",
      calendar: "Календарь",
      mediator: "Новое дело медиатора",
      manage: "Управление",
      expandNav: "Развернуть меню",
      minimizeNav: "Свернуть меню",
      pendingRequests: (count) => (count === 1 ? "1 request needs attention" : `${count} запросы требуют внимания`),
      overdueFollowups: (count) => `${count} просроченные последующие действия`,
      returnToWebsite: "Вернуться на сайт",
      signOut: "Выйти",
      openMenu: "Открыть меню",
      closeMenu: "Закрыть меню",
    },
    workerDashboard: {
      eyebrow: "Запросы",
      title: "Запросы на помощь",
      subtitle: "Отвечайте на новые запросы. Срочные дела на первом месте.",
      noDatabase: "База данных не подключена. Подключите PostgreSQL и запустите миграцию.",
      queueTitle: "Список запросов",
    },
    patientsDashboard: {
      eyebrow: "Пациенты",
      title: "Записи пациентов",
      subtitle: "Статус ухода, примечания и лечение для каждого пациента.",
      noDatabase: "База данных не подключена. Подключите PostgreSQL и запустите миграцию.",
    },
    workersDashboard: {
      eyebrow: "Персонал",
      title: "Персонал и назначенные пациенты",
      subtitle: "Добавляйте персонал и назначайте к ним пациентов.",
      noDatabase: "База данных не подключена. Подключите PostgreSQL и запустите миграцию.",
      totalStaffWorkers: "Весь персонал",
      activeStaff: "Активный персонал",
      assignedPatients: "Назначенные пациенты",
      unassignedPatients: "Неназначенные пациенты",
    },
    activityLogs: {
      eyebrow: "Журнал активности",
      title: "Деятельность персонала",
      subtitle: "Кто, что и когда изменил.",
      searchPlaceholder: "Поиск по человеку, действию или деталям",
      refresh: "Обновить",
      refreshing: "Освежающий...",
      noDatabase: "База данных не подключена. Подключите PostgreSQL и запустите миграцию.",
      noEntries: "Пока нет активности.",
      when: "Когда",
      actor: "Кто",
      action: "Action",
      entity: "Товар",
      details: "Подробности",
      unknownActor: "Неизвестно",
    },
  },

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
    workerDashboard: {
      eyebrow: "Requests",
      title: "Help requests",
      subtitle: "Answer new requests. Urgent ones come first.",
      noDatabase: "Database not connected. Connect PostgreSQL and run the migrations.",
      queueTitle: "Request list",
    },
    patientsDashboard: {
      eyebrow: "Patients",
      title: "Patient records",
      subtitle: "Care status, notes and treatment for each patient.",
      noDatabase: "Database not connected. Connect PostgreSQL and run the migrations.",
    },
    workersDashboard: {
      eyebrow: "Staff",
      title: "Staff and assigned patients",
      subtitle: "Add staff and assign patients to them.",
      noDatabase: "Database not connected. Connect PostgreSQL and run the migrations.",
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
      noDatabase: "Database not connected. Connect PostgreSQL and run the migrations.",
      noEntries: "No activity yet.",
      when: "When",
      actor: "Who",
      action: "Action",
      entity: "Item",
      details: "Details",
      unknownActor: "Unknown",
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
    workerDashboard: {
      eyebrow: "Solicitări",
      title: "Solicitări de ajutor",
      subtitle: "Răspunde la solicitările noi. Cele urgente apar primele.",
      noDatabase: "Baza de date nu e conectată. Conectează PostgreSQL și rulează migrările.",
      queueTitle: "Lista solicitărilor",
    },
    patientsDashboard: {
      eyebrow: "Pacienți",
      title: "Dosarele pacienților",
      subtitle: "Starea îngrijirii, notițe și tratament pentru fiecare pacient.",
      noDatabase: "Baza de date nu e conectată. Conectează PostgreSQL și rulează migrarea.",
    },
    workersDashboard: {
      eyebrow: "Personal",
      title: "Personal și pacienți alocați",
      subtitle: "Adaugă membri ai personalului și alocă-le pacienți.",
      noDatabase: "Baza de date nu e conectată. Conectează PostgreSQL și rulează migrarea.",
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
      noDatabase: "Baza de date nu e conectată. Conectează PostgreSQL și rulează migrarea.",
      noEntries: "Nu există activitate încă.",
      when: "Când",
      actor: "Cine",
      action: "Acțiune",
      entity: "Element",
      details: "Detalii",
      unknownActor: "Necunoscut",
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
    workerDashboard: {
      eyebrow: "Kërkesat",
      title: "Kërkesat për ndihmë",
      subtitle: "Përgjigju kërkesave të reja. Të urgjentat dalin të parat.",
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh PostgreSQL dhe ekzekuto migrimet.",
      queueTitle: "Lista e kërkesave",
    },
    patientsDashboard: {
      eyebrow: "Pacientët",
      title: "Dosjet e pacientëve",
      subtitle: "Gjendja e kujdesit, shënimet dhe trajtimi për çdo pacient.",
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh PostgreSQL dhe ekzekuto migrimin.",
    },
    workersDashboard: {
      eyebrow: "Stafi",
      title: "Stafi dhe pacientët e caktuar",
      subtitle: "Shto punonjës dhe cakto pacientë për ta.",
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh PostgreSQL dhe ekzekuto migrimin.",
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
      noDatabase: "Baza e të dhënave nuk është e lidhur. Lidh PostgreSQL dhe ekzekuto migrimin.",
      noEntries: "Ende nuk ka veprime.",
      when: "Kur",
      actor: "Kush",
      action: "Veprimi",
      entity: "Elementi",
      details: "Detaje",
      unknownActor: "I panjohur",
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
    workerDashboard: {
      eyebrow: "Richieste",
      title: "Richieste di aiuto",
      subtitle: "Rispondi alle nuove richieste. Quelle urgenti sono in cima.",
      noDatabase: "Database non collegato. Collega PostgreSQL ed esegui le migrazioni.",
      queueTitle: "Elenco richieste",
    },
    patientsDashboard: {
      eyebrow: "Pazienti",
      title: "Schede pazienti",
      subtitle: "Stato delle cure, note e terapia di ogni paziente.",
      noDatabase: "Database non collegato. Collega PostgreSQL ed esegui la migrazione.",
    },
    workersDashboard: {
      eyebrow: "Operatori",
      title: "Operatori e pazienti assegnati",
      subtitle: "Aggiungi operatori e assegna loro i pazienti.",
      noDatabase: "Database non collegato. Collega PostgreSQL ed esegui la migrazione.",
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
      noDatabase: "Database non collegato. Collega PostgreSQL ed esegui la migrazione.",
      noEntries: "Ancora nessuna attività.",
      when: "Quando",
      actor: "Chi",
      action: "Azione",
      entity: "Elemento",
      details: "Dettagli",
      unknownActor: "Sconosciuto",
    },
  },
  hr: {
    adminShell: {
      requests: "Zahtjevi",
      patients: "Pacijenti",
      workers: "Osoblje",
      logs: "Dnevnik aktivnosti",
      reportIssue: "Prijavi problem",
      followups: "Kontrolni pregledi",
      calendar: "Kalendar",
      mediator: "Novi slučaj medijacije",
      manage: "Upravljanje",
      expandNav: "Proširi izbornik",
      minimizeNav: "Sažmi izbornik",
      pendingRequests: (count) => (count === 1 ? "1 zahtjev traži pozornost" : `${count} zahtjeva traži pozornost`),
      overdueFollowups: (count) => `${count} zakašnjelih kontrolnih pregleda`,
      returnToWebsite: "Natrag na stranicu",
      signOut: "Odjava",
      openMenu: "Otvori izbornik",
      closeMenu: "Zatvori izbornik",
    },
    workerDashboard: {
      eyebrow: "Zahtjevi",
      title: "Zahtjevi za pomoć",
      subtitle: "Odgovori na nove zahtjeve. Hitni zahtjevi prikazuju se prvi.",
      noDatabase: "Baza podataka nije povezana. Poveži PostgreSQL i pokreni migracije.",
      queueTitle: "Popis zahtjeva",
    },
    patientsDashboard: {
      eyebrow: "Pacijenti",
      title: "Kartoni pacijenata",
      subtitle: "Status skrbi, bilješke i plan liječenja za svakog pacijenta.",
      noDatabase: "Baza podataka nije povezana. Poveži PostgreSQL i pokreni migraciju.",
    },
    workersDashboard: {
      eyebrow: "Osoblje",
      title: "Osoblje i dodijeljeni pacijenti",
      subtitle: "Dodaj osoblje i dodijeli im pacijente.",
      noDatabase: "Baza podataka nije povezana. Poveži PostgreSQL i pokreni migraciju.",
      totalStaffWorkers: "Svo osoblje",
      activeStaff: "Aktivno osoblje",
      assignedPatients: "Dodijeljeni pacijenti",
      unassignedPatients: "Nedodijeljeni pacijenti",
    },
    activityLogs: {
      eyebrow: "Dnevnik aktivnosti",
      title: "Aktivnosti osoblja",
      subtitle: "Tko je što promijenio i kada.",
      searchPlaceholder: "Pretraži po osobi, radnji ili pojedinostima",
      refresh: "Osvježi",
      refreshing: "Osvježavanje...",
      noDatabase: "Baza podataka nije povezana. Poveži PostgreSQL i pokreni migraciju.",
      noEntries: "Još nema aktivnosti.",
      when: "Kada",
      actor: "Tko",
      action: "Radnja",
      entity: "Stavka",
      details: "Pojedinosti",
      unknownActor: "Nepoznato",
    },
  },
  rom: {
    adminShell: {
      requests: "Mangimata",
      patients: "Pacienturya",
      workers: "Ekipa",
      logs: "Zhurnalo bukyako",
      reportIssue: "Phen ekh pharimos",
      followups: "Kontrole",
      calendar: "Kalendaro",
      mediator: "Nevo kazo mediatoresko",
      manage: "Administraciya",
      expandNav: "Putar o meniu",
      minimizeNav: "Phandav o meniu",
      pendingRequests: (count) => (count === 1 ? "1 mangimos mangel sama" : `${count} mangimata mangen sama`),
      overdueFollowups: (count) => `${count} nakhline kontrole`,
      returnToWebsite: "Palpale ko sayto",
      signOut: "Inkljes avri",
      openMenu: "Putar o meniu",
      closeMenu: "Phandav o meniu",
    },
    workerDashboard: {
      eyebrow: "Mangimata",
      title: "Mangimata zhutipnaske",
      subtitle: "De palpale ko neve mangimata. Le sigake aven anglal.",
      noDatabase: "I baza e datengi nay phangli. Phande PostgreSQL thaj phirav le migraciye.",
      queueTitle: "Lista e mangimatengi",
    },
    patientsDashboard: {
      eyebrow: "Pacienturya",
      title: "Sastipnaske lila e pacientenge",
      subtitle: "Statuso sastipnasko, noticye thaj plano tratamentesko vash svako paciento.",
      noDatabase: "I baza e datengi nay phangli. Phande PostgreSQL thaj phirav i migraciya.",
    },
    workersDashboard: {
      eyebrow: "Ekipa",
      title: "Ekipa thaj dine pacienturya",
      subtitle: "Tho manusha and-i ekipa thaj de lenge pacienturya.",
      noDatabase: "I baza e datengi nay phangli. Phande PostgreSQL thaj phirav i migraciya.",
      totalStaffWorkers: "Sasti ekipa",
      activeStaff: "Aktivni ekipa",
      assignedPatients: "Dine pacienturya",
      unassignedPatients: "Bi-dine pacienturya",
    },
    activityLogs: {
      eyebrow: "Zhurnalo bukyako",
      title: "Buchi e ekipaki",
      subtitle: "Kon so paruvdyas, thaj kana.",
      searchPlaceholder: "Rode pala manush, buchi vay detalurya",
      refresh: "Nevyar",
      refreshing: "Nevyarel...",
      noDatabase: "I baza e datengi nay phangli. Phande PostgreSQL thaj phirav i migraciya.",
      noEntries: "Inke nay buchi lekhardi.",
      when: "Kana",
      actor: "Kon",
      action: "Buchi",
      entity: "Elementi",
      details: "Detalurya",
      unknownActor: "Bi-prinzhando",
    },
  },
};
