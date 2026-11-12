import type { Lang } from "@/lib/i18n/translations";

/**
 * Every string the encrypted offline workspace (/offline, staff only) shows, in ro, en, sq, it, hr and rom.
 * Staff screens: neutral and short. Error texts thrown by src/lib/offline-vault.ts and
 * src/lib/offline-store.ts are not here; they come from those libraries.
 */
export type OfflineCopy = {
  title: string;
  encryptionBadge: string;
  storageMeterLabel: string;
  storageQuotaSummary: (usedMb: string, quotaMb: string) => string;
  idlePauseIn: (clock: string) => string;
  stayUnlocked: string;
  vaultDetailsToggle: string;
  diffFieldHeader: string;
  entityLabels: {
    patient: string;
    request: string;
  };
  attachmentSummary: (count: number) => string;
  fieldLabels: Record<string, string>;
  online: string;
  offline: string;
  intro: string;
  limits: (count: number) => string;
  checkingStorage: string;
  legacyPassphrase: string;
  trustedDevice: string;
  wait: string;
  migrate: string;
  reopen: string;
  enable: string;
  discardAndRemove: string;
  backToPanel: string;
  openPanel: string;
  pendingChanges: (count: number) => string;
  expires: string;
  syncing: string;
  syncNow: string;
  pause: string;
  signOut: string;
  editsNote: string;
  autoAccessNote: string;
  compareResolve: string;
  reviewTitle: string;
  reviewBody: string;
  deviceValue: string;
  onlineValue: string;
  notInSnapshot: string;
  empty: string;
  useOnline: string;
  retryCreate: string;
  keepMine: string;
  cancel: string;
  onlineOnlyPage: string;
  errors: {
    needsHttps: string;
    prepareTimeout: string;
    authFailed: string;
    confirmTrusted: string;
    noLocks: string;
    otherTab: string;
    storageRemoved: string;
    evictionWarning: string;
    renewMismatch: string;
    workspaceClosed: string;
    openFailed: string;
    needsReview: string;
    synced: string;
    syncFailed: string;
    discardConfirm: string;
    signOutBlocked: string;
    deviceDataRemoved: string;
    removeFailed: string;
    sameAccount: string;
    retryConfirm: string;
    alreadyProcessed: string;
    conflictFailed: string;
    needsConnection: string;
  };
};

/** Romanian puts "de" between a number and its noun from 20 up (20 de pacienți, but 7 pacienți). */
function roCount(count: number) {
  const rest = count % 100;
  return count !== 0 && (rest === 0 || rest >= 20) ? `${count} de` : `${count}`;
}

export const offlineCopy: Record<Lang, OfflineCopy> = {
  ru: {




"encryptionBadge": "AES-GCM 256 бит",
"storageMeterLabel": "Зашифрованное хранилище устройства",
"storageQuotaSummary": (usedMb,quotaMb)=>`Использовано ${usedMb} МБ из ${quotaMb} МБ`,
"idlePauseIn": clock=>`Блокировка при бездействии через ${clock}`,
"stayUnlocked": "Оставить разблокированным",
"vaultDetailsToggle": "Сведения о хранилище",
"diffFieldHeader": "Медицинское поле",
"entityLabels": {"patient":"Пациент","request":"Запрос"},
"attachmentSummary": count=>`Прикрепленных файлов или изображений: ${count}`,
"fieldLabels": {"full_name":"Полное имя","phone":"Телефон","email":"Электронная почта","date_of_birth":"Дата рождения","gender":"Пол","address":"Адрес","county":"Округ или регион","status":"Статус помощи","priority":"Приоритет","condition_notes":"Симптомы и заметки о состоянии","medical_history":"История болезни и аллергии","treatment_plan":"План лечения","followups":"Запланированные осмотры","photos":"Изображения и документы","intake":"Первичный прием","profile_photo":"Фото профиля","description":"Описание запроса","internal_notes":"Внутренние заметки","assigned_worker_id":"Назначенный сотрудник","patient_id":"Связанная запись пациента"},

    title: "Зашифрованное автономное рабочее пространство",
    online: "Онлайн",
    offline: "Оффлайн",
    intro:
      "Медицинские записи и вложения остаются зашифрованными, но ключ хранится в этом браузере для автоматического доступа без пароля. Любой, кто использует этот профиль браузера, может получить доступ к записям. Используйте только частное устройство, защищенное блокировкой экрана.",
    limits: (count) =>
      `Подготовьтесь до ${count} недавно назначенные пациенты и ${count} недавние запросы в режиме онлайн. Доступ истекает через 30 дней; пауза после 10 минут простоя. Повторное открытие не требует пароля. Это не офлайн-вход.`,
    checkingStorage: "Проверка зашифрованного хранилища устройства…",
    legacyPassphrase: "Существующая парольная фраза для автономного режима (один раз для переноса)",
    trustedDevice: "Это частное устройство. Я понимаю, что любой, кто использует этот профиль браузера, может открывать автономные записи без пароля.",
    wait: "Пожалуйста, подождите…",
    migrate: "Перейти на автоматический доступ",
    reopen: "Повторно открыть автономное рабочее пространство",
    enable: "Включить офлайн-режим на этом устройстве",
    discardAndRemove: "Отменить ожидающие изменения и удалить данные устройства.",
    backToPanel: "Вернуться к онлайн-панели",
    openPanel: "Открыть онлайн-панель",
    pendingChanges: (count) => (count === 1 ? "1 pending change" : `${count} ожидающие изменения`),
    expires: "Срок действия истекает",
    syncing: "Синхронизация…",
    syncNow: "Синхронизировать сейчас",
    pause: "Пауза",
    signOut: "Выйти",
    editsNote: "Изменения сохраняются в зашифрованном виде локально и синхронизируются при повторном подключении, пока они разблокированы. Для электронной почты, приглашений и звонков требуется онлайн-панель.",
    autoAccessNote: "Автоматический доступ: ключ хранится в этом браузере. Пауза не является блокировкой доступа; повторное открытие не требует пароля.",
    compareResolve: "Сравните и решите",
    reviewTitle: "Просмотрите конфликт",
    reviewBody:
      "Сравните измененные поля с текущей онлайн-записью. Откройте пациента онлайн, чтобы проверить вложение и содержимое изображения. Перезапись не происходит, пока вы явно не выберете.",
    deviceValue: "Устройство",
    onlineValue: "Онлайн",
    notInSnapshot: "(нет в текущем авторизованном снимке)",
    empty: "(пусто)",
    useOnline: "Использовать онлайн и отменить это ожидающее изменение",
    retryCreate: "Повторите попытку создания этого пациента.",
    keepMine: "Сохранить измененные поля (повторить попытку для этой версии)",
    cancel: "Отмена",
    onlineOnlyPage: "Эта страница доступна только онлайн, или информация о пациенте не кэширована на этом устройстве.",
    errors: {
      needsHttps: "Для автономного доступа требуется HTTPS и браузер с поддержкой Service Worker.",
      prepareTimeout: "Время подготовки автономного приложения истекло. Оставайтесь онлайн и повторите попытку.",
      authFailed: "Онлайн-авторизация не удалась.",
      confirmTrusted: "Подтвердите, что это частное, доверенное устройство.",
      noLocks: "Этот браузер не может безопасно заблокировать автономное хранилище для всех вкладок. Используйте текущую версию Chrome, Edge, Firefox или Safari.",
      otherTab: "Офлайн-данные уже открыты в другой вкладке. Сначала приостановите эту вкладку.",
      storageRemoved: "Зашифрованное хранилище устройства было удалено.",
      evictionWarning: "Зашифрованное хранилище доступно, но этот браузер может его удалить. Синхронизируйте чаще и не удаляйте данные сайта.",
      renewMismatch: "Войдите в исходную учетную запись сотрудника и страну, чтобы продлить срок действия этого устройства.",
      workspaceClosed: "Офлайн-рабочая область закрыта.",
      openFailed: "Не удалось открыть зашифрованное хранилище устройства.",
      needsReview: "Некоторые изменения требуют рассмотрения ниже. Они не перезаписали онлайн-записи.",
      synced: "Все изменения синхронизированы. Никакие электронные письма или приглашения не отправлялись автоматически.",
      syncFailed: "Синхронизация не удалась. Изменения остаются зашифрованными на этом устройстве.",
      discardConfirm: "Навсегда отменить все несинхронизированные изменения и удалить зашифрованные медицинские данные на этом устройстве? Это невозможно отменить.",
      signOutBlocked: "Выход заблокирован: синхронизируйте ожидающие изменения или явно отмените их и удалите данные этого устройства.",
      deviceDataRemoved: "Зашифрованные данные устройства удалены. Подключитесь к Интернету, чтобы завершить выход из веб-сеанса.",
      removeFailed: "Не удалось удалить зашифрованные данные.",
      sameAccount: "Войдите в исходную учетную запись сотрудника и страну.",
      retryConfirm: "Повторить попытку изменить поля в проверенной онлайн-версии? Если оно снова изменится, синхронизация прекратится для повторной проверки.",
      alreadyProcessed: "Это ожидающее изменение уже обработано.",
      conflictFailed: "Разрешение конфликта не удалось.",
      needsConnection: "Звонки, электронная почта и внешние ссылки требуют подключения.",
    },
  },

  ro: {
    title: "Spațiu offline criptat",
    encryptionBadge: "AES-GCM 256-bit",
    storageMeterLabel: "Stocare locală criptată",
    storageQuotaSummary: (usedMb, quotaMb) => `${usedMb} MB folosiți din ${quotaMb} MB disponibili`,
    idlePauseIn: (clock) => `Pauză automată în ${clock}`,
    stayUnlocked: "Rămâi deblocat",
    vaultDetailsToggle: "Detalii securitate",
    diffFieldHeader: "Câmp clinic",
    entityLabels: {
      patient: "Pacient",
      request: "Solicitare",
    },
    attachmentSummary: (count) =>
      count === 1 ? "1 document sau imagine atașată" : `${roCount(count)} documente sau imagini atașate`,
    fieldLabels: {
      full_name: "Nume și prenume",
      phone: "Telefon",
      email: "Email",
      date_of_birth: "Data nașterii",
      gender: "Gen",
      address: "Adresă",
      county: "Județ",
      status: "Status îngrijire",
      priority: "Prioritate",
      condition_notes: "Simptome și observații",
      medical_history: "Istoric medical și alergii",
      treatment_plan: "Plan de tratament",
      followups: "Controale programate",
      photos: "Imagini și documente",
      intake: "Fișă inițială",
      profile_photo: "Fotografie de profil",
      description: "Descriere solicitare",
      internal_notes: "Note interne",
      assigned_worker_id: "Personal alocat",
      patient_id: "Dosar pacient",
    },
    online: "Online",
    offline: "Offline",
    intro:
      "Datele medicale și documentele rămân criptate, dar cheia este salvată în acest browser pentru deschidere automată, fără parolă. Oricine folosește acest profil de browser poate accesa datele. Folosește doar un dispozitiv privat, protejat prin blocarea ecranului.",
    limits: (count) =>
      `Pregătește online maximum ${roCount(count)} pacienți alocați recent și ${roCount(count)} cereri recente. Accesul expiră după 30 de zile; pauză după 10 minute de inactivitate. Redeschiderea nu cere parolă. Nu este autentificare offline.`,
    checkingStorage: "Se verifică stocarea criptată…",
    legacyPassphrase: "Parola offline existentă (o singură dată, pentru migrare)",
    trustedDevice:
      "Confirm că acesta este un dispozitiv privat și accept că oricine folosește acest profil de browser poate deschide datele offline fără parolă.",
    wait: "Așteaptă…",
    migrate: "Migrează la acces automat",
    reopen: "Redeschide spațiul offline",
    enable: "Activează offline pe acest dispozitiv",
    discardAndRemove: "Renunță la modificări și șterge datele dispozitivului",
    backToPanel: "Înapoi la panoul online",
    openPanel: "Deschide panoul online",
    pendingChanges: (count) => (count === 1 ? "1 modificare în așteptare" : `${roCount(count)} modificări în așteptare`),
    expires: "Expiră",
    syncing: "Se sincronizează…",
    syncNow: "Sincronizează",
    pause: "Pauză",
    signOut: "Deconectare",
    editsNote:
      "Modificările sunt salvate criptat local și trimise la reconectare, cât timp spațiul este deblocat. Emailurile, invitațiile și apelurile necesită panoul online.",
    autoAccessNote: "Acces automat: cheia este salvată în browser. Pauza nu blochează accesul; redeschiderea nu cere parolă.",
    compareResolve: "Compară și rezolvă",
    reviewTitle: "Verifică diferențele",
    reviewBody:
      "Compară câmpurile modificate cu datele online. Pentru conținutul documentelor și imaginilor, deschide pacientul în panoul online. Datele nu sunt suprascrise fără alegerea ta explicită.",
    deviceValue: "Modificare pe dispozitiv",
    onlineValue: "Dosar online actual",
    notInSnapshot: "(nu este disponibil în datele autorizate actuale)",
    empty: "(gol)",
    useOnline: "Folosește datele online și renunță la modificare",
    retryCreate: "Reîncearcă adăugarea pacientului",
    keepMine: "Păstrează câmpurile mele (reîncearcă pe această versiune)",
    cancel: "Anulează",
    onlineOnlyPage: "Această pagină necesită internet sau pacientul nu este salvat pe acest dispozitiv.",
    errors: {
      needsHttps: "Modul offline are nevoie de HTTPS și de un browser care suportă service worker.",
      prepareTimeout: "Pregătirea aplicației offline a durat prea mult. Rămâi online și încearcă din nou.",
      authFailed: "Autorizarea online a eșuat.",
      confirmTrusted: "Confirmă că acesta este un dispozitiv privat și de încredere.",
      noLocks: "Acest browser nu poate bloca în siguranță datele offline între file. Folosește o versiune actuală de Chrome, Edge, Firefox sau Safari.",
      otherTab: "Datele offline sunt deja deschise în altă filă. Pune mai întâi pauză în acea filă.",
      storageRemoved: "Datele criptate de pe dispozitiv au fost șterse.",
      evictionWarning: "Datele criptate sunt salvate, dar browserul le poate șterge. Sincronizează des și nu șterge datele site-ului.",
      renewMismatch: "Ca să reînnoiești acest dispozitiv expirat, intră în contul de personal și în țara folosite inițial.",
      workspaceClosed: "Spațiul offline a fost închis.",
      openFailed: "Datele criptate de pe dispozitiv nu au putut fi deschise.",
      needsReview: "Unele modificări necesită verificare mai jos. Datele online nu au fost suprascrise.",
      synced: "Toate modificările au fost sincronizate. Nu s-au trimis automat emailuri sau invitații.",
      syncFailed: "Sincronizarea a eșuat. Modificările rămân criptate pe acest dispozitiv.",
      discardConfirm:
        "Renunți definitiv la toate modificările nesincronizate și ștergi datele medicale criptate de pe dispozitiv? Nu mai poți reveni.",
      signOutBlocked:
        "Nu te poți deconecta încă: sincronizează modificările în așteptare sau renunță explicit la ele și șterge datele de pe acest dispozitiv.",
      deviceDataRemoved: "Datele criptate de pe dispozitiv au fost șterse. Conectează-te la internet ca să termini deconectarea din cont.",
      removeFailed: "Datele criptate nu au putut fi șterse.",
      sameAccount: "Intră în contul de personal și în țara folosite inițial.",
      retryConfirm:
        "Reîncerci modificările tale peste versiunea online verificată? Dacă datele se modifică din nou, sincronizarea se va opri pentru o nouă verificare.",
      alreadyProcessed: "Această modificare a fost deja procesată.",
      conflictFailed: "Diferențele nu au putut fi rezolvate.",
      needsConnection: "Apelurile, emailurile și linkurile externe necesită internet.",
    },
  },
  en: {
    title: "Encrypted offline workspace",
    encryptionBadge: "AES-GCM 256-bit",
    storageMeterLabel: "Encrypted device storage",
    storageQuotaSummary: (usedMb, quotaMb) => `${usedMb} MB used of ${quotaMb} MB available`,
    idlePauseIn: (clock) => `Idle pause in ${clock}`,
    stayUnlocked: "Stay unlocked",
    vaultDetailsToggle: "Vault details",
    diffFieldHeader: "Clinical field",
    entityLabels: {
      patient: "Patient",
      request: "Request",
    },
    attachmentSummary: (count) =>
      count === 1 ? "1 attached file or image" : `${count} attached files or images`,
    fieldLabels: {
      full_name: "Full name",
      phone: "Phone",
      email: "Email",
      date_of_birth: "Date of birth",
      gender: "Gender",
      address: "Address",
      county: "County or region",
      status: "Care status",
      priority: "Priority",
      condition_notes: "Symptoms and condition notes",
      medical_history: "Medical history and allergies",
      treatment_plan: "Treatment plan",
      followups: "Scheduled follow-ups",
      photos: "Images and documents",
      intake: "Initial intake",
      profile_photo: "Profile photo",
      description: "Request description",
      internal_notes: "Internal notes",
      assigned_worker_id: "Assigned staff member",
      patient_id: "Linked patient record",
    },
    online: "Online",
    offline: "Offline",
    intro:
      "Medical records and attachments remain encrypted, but the key is stored in this browser for automatic access without a password. Anyone using this browser profile can access the records. Use only a private device protected by a screen lock.",
    limits: (count) =>
      `Prepare up to ${count} recent assigned patients and ${count} recent requests while online. Access expires after 30 days; pauses after 10 idle minutes. Reopening does not require a password. This is not offline sign-in.`,
    checkingStorage: "Checking encrypted device storage…",
    legacyPassphrase: "Existing offline passphrase (once, to migrate)",
    trustedDevice: "This is a private device. I understand anyone using this browser profile can open offline records without a password.",
    wait: "Please wait…",
    migrate: "Migrate to automatic access",
    reopen: "Reopen offline workspace",
    enable: "Enable offline on this device",
    discardAndRemove: "Discard pending changes and remove device data",
    backToPanel: "Back to online panel",
    openPanel: "Open online panel",
    pendingChanges: (count) => (count === 1 ? "1 pending change" : `${count} pending changes`),
    expires: "Expires",
    syncing: "Syncing…",
    syncNow: "Sync now",
    pause: "Pause",
    signOut: "Sign out",
    editsNote: "Edits save encrypted locally and sync on reconnect while unlocked. Email, invitations and calls require the online panel.",
    autoAccessNote: "Automatic access: the key is stored in this browser. Pausing is not an access lock; reopening requires no password.",
    compareResolve: "Compare and resolve",
    reviewTitle: "Review conflict",
    reviewBody:
      "Compare your changed fields with the current online record. Open the patient online to inspect attachment and image content. No overwrite occurs until you explicitly choose.",
    deviceValue: "Device edit",
    onlineValue: "Current online record",
    notInSnapshot: "(not in current authorized snapshot)",
    empty: "(empty)",
    useOnline: "Use online and discard this pending edit",
    retryCreate: "Retry creating this patient",
    keepMine: "Keep my changed fields (retry against this version)",
    cancel: "Cancel",
    onlineOnlyPage: "This page is online-only or the patient is not cached on this device.",
    errors: {
      needsHttps: "Offline access requires HTTPS and a browser with service worker support.",
      prepareTimeout: "Timed out preparing the offline app. Stay online and try again.",
      authFailed: "Online authorization failed.",
      confirmTrusted: "Confirm this is a private, trusted device.",
      noLocks: "This browser cannot safely lock offline storage across tabs. Use a current Chrome, Edge, Firefox or Safari.",
      otherTab: "Offline data is already open in another tab. Pause that tab first.",
      storageRemoved: "Encrypted device storage was removed.",
      evictionWarning: "Encrypted storage is available, but this browser may evict it. Synchronize frequently and do not clear site data.",
      renewMismatch: "Sign in to the original staff account and country to renew this expired device.",
      workspaceClosed: "Offline workspace closed.",
      openFailed: "Could not open encrypted device storage.",
      needsReview: "Some changes need review below. They have not overwritten online records.",
      synced: "All changes synchronized. No emails or invitations were sent automatically.",
      syncFailed: "Sync failed. Changes remain encrypted on this device.",
      discardConfirm: "Permanently discard all unsynced changes and delete the encrypted medical data on this device? This cannot be undone.",
      signOutBlocked: "Sign-out blocked: synchronize pending changes, or explicitly discard them and remove this device's data.",
      deviceDataRemoved: "Encrypted device data removed. Connect online to finish signing out of the web session.",
      removeFailed: "Could not remove encrypted data.",
      sameAccount: "Sign in to the original staff account and country.",
      retryConfirm: "Retry your changed fields over the reviewed online version? If it changes again, sync will stop for another review.",
      alreadyProcessed: "This pending change has already been processed.",
      conflictFailed: "Conflict resolution failed.",
      needsConnection: "Calls, email and external links require connectivity.",
    },
  },
  sq: {
    title: "Hapësirë offline e enkriptuar",
    encryptionBadge: "AES-GCM 256-bit",
    storageMeterLabel: "Ruajtja e enkriptuar e pajisjes",
    storageQuotaSummary: (usedMb, quotaMb) => `${usedMb} MB të përdorura nga ${quotaMb} MB në dispozicion`,
    idlePauseIn: (clock) => `Pushim automatik për ${clock}`,
    stayUnlocked: "Qëndro hapur",
    vaultDetailsToggle: "Hollësitë e sigurisë",
    diffFieldHeader: "Fusha klinike",
    entityLabels: {
      patient: "Pacient",
      request: "Kërkesë",
    },
    attachmentSummary: (count) =>
      count === 1 ? "1 dokument ose foto e bashkëngjitur" : `${count} dokumente ose foto të bashkëngjitura`,
    fieldLabels: {
      full_name: "Emri dhe mbiemri",
      phone: "Telefoni",
      email: "Email",
      date_of_birth: "Datëlindja",
      gender: "Gjinia",
      address: "Adresa",
      county: "Qarku ose rajoni",
      status: "Statusi i kujdesit",
      priority: "Prioriteti",
      condition_notes: "Simptomat dhe shënimet",
      medical_history: "Historiku mjekësor dhe alergjitë",
      treatment_plan: "Plani i trajtimit",
      followups: "Kontrollet e planifikuara",
      photos: "Imazhe dhe dokumente",
      intake: "Formulari fillestar",
      profile_photo: "Foto e profilit",
      description: "Përshkrimi i kërkesës",
      internal_notes: "Shënime të brendshme",
      assigned_worker_id: "Stafi ose mediator i caktuar",
      patient_id: "Dosja e pacientit",
    },
    online: "Në linjë",
    offline: "Jashtë linje",
    intro:
      "Të dhënat mjekësore dhe dokumentet mbeten të enkriptuara, por çelësi ruhet në këtë shfletues që hapja të bëhet automatikisht, pa fjalëkalim. Kushdo që përdor këtë profil shfletuesi mund t'i hapë të dhënat. Përdor vetëm një pajisje private, të mbrojtur me kyçje ekrani.",
    limits: (count) =>
      `Përgatit në linjë deri në ${count} pacientë të caktuar së fundi dhe ${count} kërkesa të fundit. Qasja skadon pas 30 ditësh; pushon pas 10 minutash pa aktivitet. Rihapja nuk kërkon fjalëkalim. Kjo nuk është hyrje offline.`,
    checkingStorage: "Po kontrollohet ruajtja e enkriptuar…",
    legacyPassphrase: "Fjalëkalimi offline ekzistues (vetëm një herë, për migrimin)",
    trustedDevice:
      "Kjo është një pajisje private. E kuptoj që kushdo që përdor këtë profil shfletuesi mund t'i hapë të dhënat offline pa fjalëkalim.",
    wait: "Prit…",
    migrate: "Kalo te qasja automatike",
    reopen: "Rihap hapësirën offline",
    enable: "Aktivizo offline në këtë pajisje",
    discardAndRemove: "Hiq ndryshimet në pritje dhe fshi të dhënat e pajisjes",
    backToPanel: "Kthehu te paneli në linjë",
    openPanel: "Hap panelin në linjë",
    pendingChanges: (count) => (count === 1 ? "1 ndryshim në pritje" : `${count} ndryshime në pritje`),
    expires: "Skadon",
    syncing: "Po sinkronizohet…",
    syncNow: "Sinkronizo tani",
    pause: "Pushim",
    signOut: "Dil",
    editsNote:
      "Ndryshimet ruhen të enkriptuara në pajisje dhe dërgohen kur rikthehet lidhja, për sa kohë hapësira është e hapur. Email-et, ftesat dhe thirrjet kërkojnë panelin në linjë.",
    autoAccessNote: "Qasje automatike: çelësi ruhet në shfletues. Pushimi nuk e bllokon qasjen; rihapja nuk kërkon fjalëkalim.",
    compareResolve: "Krahaso dhe zgjidh",
    reviewTitle: "Shiko ndryshimet",
    reviewBody:
      "Krahaso fushat që ndryshove me të dhënat aktuale në linjë. Për përmbajtjen e dokumenteve dhe të fotove, hap pacientin në panelin në linjë. Asgjë nuk mbishkruhet pa zgjedhjen tënde.",
    deviceValue: "Ndryshimi në pajisje",
    onlineValue: "Dosja aktuale në linjë",
    notInSnapshot: "(nuk gjendet në të dhënat e autorizuara aktuale)",
    empty: "(bosh)",
    useOnline: "Përdor të dhënat në linjë dhe hiq këtë ndryshim",
    retryCreate: "Provo sërish shtimin e pacientit",
    keepMine: "Mbaj fushat e mia (provo sërish mbi këtë version)",
    cancel: "Anulo",
    onlineOnlyPage: "Kjo faqe kërkon internet, ose pacienti nuk është ruajtur në këtë pajisje.",
    errors: {
      needsHttps: "Qasja offline kërkon HTTPS dhe një shfletues që mbështet service worker.",
      prepareTimeout: "Përgatitja e aplikacionit offline zgjati shumë. Qëndro në linjë dhe provo sërish.",
      authFailed: "Autorizimi në linjë dështoi.",
      confirmTrusted: "Konfirmo që kjo është një pajisje private dhe e besuar.",
      noLocks: "Ky shfletues nuk mund t'i bllokojë në mënyrë të sigurt të dhënat offline mes skedave. Përdor një version të ri të Chrome, Edge, Firefox ose Safari.",
      otherTab: "Të dhënat offline janë hapur tashmë në një skedë tjetër. Vendos pushim atje fillimisht.",
      storageRemoved: "Të dhënat e enkriptuara të pajisjes u fshinë.",
      evictionWarning: "Të dhënat e enkriptuara u ruajtën, por ky shfletues mund t'i fshijë. Sinkronizo shpesh dhe mos i fshi të dhënat e faqes.",
      renewMismatch: "Për të rinovuar këtë pajisje që ka skaduar, hyr me llogarinë e stafit dhe shtetin që përdore në fillim.",
      workspaceClosed: "Hapësira offline u mbyll.",
      openFailed: "Të dhënat e enkriptuara të pajisjes nuk u hapën.",
      needsReview: "Disa ndryshime duhen parë më poshtë. Të dhënat në linjë nuk u mbishkruan.",
      synced: "Të gjitha ndryshimet u sinkronizuan. Nuk u dërgua automatikisht asnjë email apo ftesë.",
      syncFailed: "Sinkronizimi dështoi. Ndryshimet mbeten të enkriptuara në këtë pajisje.",
      discardConfirm:
        "Do t'i heqësh përgjithmonë të gjitha ndryshimet e pasinkronizuara dhe do t'i fshish të dhënat mjekësore të enkriptuara nga pajisja? Ky veprim nuk kthehet pas.",
      signOutBlocked:
        "Nuk mund të dalësh ende: sinkronizo ndryshimet në pritje, ose hiqi ato qartë dhe fshi të dhënat e kësaj pajisjeje.",
      deviceDataRemoved: "Të dhënat e enkriptuara të pajisjes u fshinë. Lidhu me internetin që të përfundosh daljen nga llogaria.",
      removeFailed: "Të dhënat e enkriptuara nuk u fshinë.",
      sameAccount: "Hyr me llogarinë e stafit dhe shtetin që përdore në fillim.",
      retryConfirm:
        "Do t'i provosh sërish ndryshimet e tua mbi versionin në linjë që pe? Nëse të dhënat ndryshojnë përsëri, sinkronizimi do të ndalet për një kontroll të ri.",
      alreadyProcessed: "Ky ndryshim është përpunuar tashmë.",
      conflictFailed: "Ndryshimet nuk u zgjidhën.",
      needsConnection: "Thirrjet, email-et dhe lidhjet e jashtme kërkojnë internet.",
    },
  },
  it: {
    title: "Area offline cifrata",
    encryptionBadge: "AES-GCM 256-bit",
    storageMeterLabel: "Archivio cifrato del dispositivo",
    storageQuotaSummary: (usedMb, quotaMb) => `${usedMb} MB usati su ${quotaMb} MB disponibili`,
    idlePauseIn: (clock) => `Pausa automatica tra ${clock}`,
    stayUnlocked: "Resta sbloccato",
    vaultDetailsToggle: "Dettagli sicurezza",
    diffFieldHeader: "Campo clinico",
    entityLabels: {
      patient: "Paziente",
      request: "Richiesta",
    },
    attachmentSummary: (count) =>
      count === 1 ? "1 documento o immagine allegata" : `${count} documenti o immagini allegate`,
    fieldLabels: {
      full_name: "Nome e cognome",
      phone: "Telefono",
      email: "Email",
      date_of_birth: "Data di nascita",
      gender: "Genere",
      address: "Indirizzo",
      county: "Provincia o regione",
      status: "Stato delle cure",
      priority: "Priorità",
      condition_notes: "Sintomi e note cliniche",
      medical_history: "Storia clinica e allergie",
      treatment_plan: "Piano di trattamento",
      followups: "Controlli programmati",
      photos: "Immagini e documenti",
      intake: "Scheda iniziale",
      profile_photo: "Foto profilo",
      description: "Descrizione richiesta",
      internal_notes: "Note interne",
      assigned_worker_id: "Operatore assegnato",
      patient_id: "Scheda paziente collegata",
    },
    online: "Online",
    offline: "Offline",
    intro:
      "I dati medici e i documenti restano cifrati, ma la chiave è salvata in questo browser per l'apertura automatica, senza password. Chiunque usi questo profilo del browser può aprire i dati. Usa solo un dispositivo privato, protetto dal blocco schermo.",
    limits: (count) =>
      `Prepara online fino a ${count} pazienti assegnati di recente e ${count} richieste recenti. L'accesso scade dopo 30 giorni; va in pausa dopo 10 minuti di inattività. La riapertura non chiede la password. Non è un accesso offline.`,
    checkingStorage: "Controllo dell'archivio cifrato…",
    legacyPassphrase: "Password offline attuale (una sola volta, per la migrazione)",
    trustedDevice:
      "Questo è un dispositivo privato. So che chiunque usi questo profilo del browser può aprire i dati offline senza password.",
    wait: "Attendi…",
    migrate: "Passa all'accesso automatico",
    reopen: "Riapri l'area offline",
    enable: "Attiva l'offline su questo dispositivo",
    discardAndRemove: "Annulla le modifiche e cancella i dati del dispositivo",
    backToPanel: "Torna al pannello online",
    openPanel: "Apri il pannello online",
    pendingChanges: (count) => (count === 1 ? "1 modifica in attesa" : `${count} modifiche in attesa`),
    expires: "Scade il",
    syncing: "Sincronizzazione…",
    syncNow: "Sincronizza ora",
    pause: "Pausa",
    signOut: "Esci",
    editsNote:
      "Le modifiche vengono salvate cifrate sul dispositivo e inviate quando torna la connessione, finché l'area è sbloccata. Email, inviti e chiamate richiedono il pannello online.",
    autoAccessNote: "Accesso automatico: la chiave è salvata nel browser. La pausa non blocca l'accesso; la riapertura non chiede la password.",
    compareResolve: "Confronta e risolvi",
    reviewTitle: "Controlla le differenze",
    reviewBody:
      "Confronta i campi che hai modificato con i dati online attuali. Per il contenuto di documenti e immagini, apri il paziente nel pannello online. Nulla viene sovrascritto senza una tua scelta esplicita.",
    deviceValue: "Modifica sul dispositivo",
    onlineValue: "Scheda online attuale",
    notInSnapshot: "(non presente nei dati autorizzati attuali)",
    empty: "(vuoto)",
    useOnline: "Usa i dati online e annulla questa modifica",
    retryCreate: "Riprova ad aggiungere il paziente",
    keepMine: "Tieni i miei campi (riprova su questa versione)",
    cancel: "Annulla",
    onlineOnlyPage: "Questa pagina richiede internet, oppure il paziente non è salvato su questo dispositivo.",
    errors: {
      needsHttps: "L'accesso offline richiede HTTPS e un browser che supporti i service worker.",
      prepareTimeout: "La preparazione dell'app offline ha richiesto troppo tempo. Resta online e riprova.",
      authFailed: "Autorizzazione online non riuscita.",
      confirmTrusted: "Conferma che questo è un dispositivo privato e affidabile.",
      noLocks: "Questo browser non può bloccare in modo sicuro i dati offline tra le schede. Usa una versione recente di Chrome, Edge, Firefox o Safari.",
      otherTab: "I dati offline sono già aperti in un'altra scheda. Metti prima in pausa quella scheda.",
      storageRemoved: "I dati cifrati del dispositivo sono stati cancellati.",
      evictionWarning: "I dati cifrati sono salvati, ma questo browser potrebbe cancellarli. Sincronizza spesso e non cancellare i dati del sito.",
      renewMismatch: "Per rinnovare questo dispositivo scaduto, accedi con l'account del personale e il paese usati all'inizio.",
      workspaceClosed: "Area offline chiusa.",
      openFailed: "Impossibile aprire i dati cifrati del dispositivo.",
      needsReview: "Alcune modifiche vanno controllate qui sotto. I dati online non sono stati sovrascritti.",
      synced: "Tutte le modifiche sono state sincronizzate. Non sono state inviate email o inviti in automatico.",
      syncFailed: "Sincronizzazione non riuscita. Le modifiche restano cifrate su questo dispositivo.",
      discardConfirm:
        "Vuoi annullare per sempre tutte le modifiche non sincronizzate e cancellare i dati medici cifrati da questo dispositivo? Non si può tornare indietro.",
      signOutBlocked:
        "Non puoi ancora uscire: sincronizza le modifiche in attesa, oppure annullale in modo esplicito e cancella i dati di questo dispositivo.",
      deviceDataRemoved: "Dati cifrati del dispositivo cancellati. Connettiti a internet per completare l'uscita dall'account.",
      removeFailed: "Impossibile cancellare i dati cifrati.",
      sameAccount: "Accedi con l'account del personale e il paese usati all'inizio.",
      retryConfirm:
        "Vuoi riprovare le tue modifiche sulla versione online che hai controllato? Se i dati cambiano di nuovo, la sincronizzazione si fermerà per un nuovo controllo.",
      alreadyProcessed: "Questa modifica è già stata elaborata.",
      conflictFailed: "Impossibile risolvere le differenze.",
      needsConnection: "Chiamate, email e link esterni richiedono internet.",
    },
  },
  hr: {
    title: "Šifrirani izvanmrežni radni prostor",
    encryptionBadge: "AES-GCM 256-bit",
    storageMeterLabel: "Šifrirana pohrana uređaja",
    storageQuotaSummary: (usedMb, quotaMb) => `Iskorišteno ${usedMb} MB od dostupnih ${quotaMb} MB`,
    idlePauseIn: (clock) => `Automatska pauza za ${clock}`,
    stayUnlocked: "Ostani otključan",
    vaultDetailsToggle: "Sigurnosni detalji",
    diffFieldHeader: "Kliničko polje",
    entityLabels: {
      patient: "Pacijent",
      request: "Zahtjev",
    },
    attachmentSummary: (count) =>
      count === 1 ? "1 priloženi dokument ili slika" : `${count} priloženih dokumenata ili slika`,
    fieldLabels: {
      full_name: "Ime i prezime",
      phone: "Telefon",
      email: "Email",
      date_of_birth: "Datum rođenja",
      gender: "Spol",
      address: "Adresa",
      county: "Županija ili regija",
      status: "Status skrbi",
      priority: "Prioritet",
      condition_notes: "Simptomi i bilješke",
      medical_history: "Povijest bolesti i alergije",
      treatment_plan: "Plan liječenja",
      followups: "Zakazane kontrole",
      photos: "Slike i dokumenti",
      intake: "Početni upitnik",
      profile_photo: "Profilna fotografija",
      description: "Opis zahtjeva",
      internal_notes: "Interne bilješke",
      assigned_worker_id: "Dodijeljeno osoblje",
      patient_id: "Povezani karton pacijenta",
    },
    online: "Na mreži",
    offline: "Izvan mreže",
    intro:
      "Karton pacijenta i prilozi ostaju šifrirani, no ključ je spremljen u ovom pregledniku radi automatskog otvaranja bez zaporke. Svatko tko rabi ovaj profil preglednika može pristupiti podatcima. Koristite isključivo privatni uređaj zaštićen zaključavanjem zaslona.",
    limits: (count) =>
      `Dok ste na mreži, pripremite do ${count} nedavno dodijeljenih pacijenata i ${count} nedavnih zahtjeva. Pristup istječe nakon 30 dana, a pauzira se nakon 10 minuta neaktivnosti. Ponovno otvaranje ne traži zaporku. Ovo nije izvanmrežna prijava.`,
    checkingStorage: "Provjera šifrirane pohrane uređaja…",
    legacyPassphrase: "Postojeća izvanmrežna zaporka (jednokratno, za prijenos)",
    trustedDevice:
      "Ovo je privatni uređaj. Razumijem da svatko tko rabi ovaj profil preglednika može otvoriti izvanmrežne kartone bez zaporke.",
    wait: "Pričekajte…",
    migrate: "Prijeđi na automatski pristup",
    reopen: "Ponovno otvori izvanmrežni radni prostor",
    enable: "Uključi izvanmrežni rad na ovom uređaju",
    discardAndRemove: "Odbaci izmjene na čekanju i ukloni podatke uređaja",
    backToPanel: "Natrag na mrežnu ploču",
    openPanel: "Otvori mrežnu ploču",
    pendingChanges: (count) =>
      count === 1 ? "1 izmjena na čekanju" : `${count} izmjena na čekanju`,
    expires: "Istječe",
    syncing: "Sinkronizacija…",
    syncNow: "Sinkroniziraj sada",
    pause: "Pauziraj",
    signOut: "Odjava",
    editsNote:
      "Izmjene se spremaju lokalno u šifriranom obliku i sinkroniziraju pri ponovnom spajanju dok je radni prostor otključan. E-pošta, pozivnice i pozivi zahtijevaju mrežnu ploču.",
    autoAccessNote:
      "Automatski pristup: ključ je spremljen u ovom pregledniku. Pauziranje ne zaključava pristup, a ponovno otvaranje ne traži zaporku.",
    compareResolve: "Usporedi i riješi",
    reviewTitle: "Pregled nepodudaranja",
    reviewBody:
      "Usporedite izmijenjena polja s trenutačnim mrežnim kartonom. Za pregled sadržaja priloga i slika otvorite pacijenta u mrežnoj ploči. Ništa se ne prepisuje bez vašeg izričitog odabira.",
    deviceValue: "Izmjena na uređaju",
    onlineValue: "Trenutačni mrežni karton",
    notInSnapshot: "(nije u trenutačnom ovlaštenom snimku)",
    empty: "(prazno)",
    useOnline: "Preuzmi mrežne podatke i odbaci ovu izmjenu",
    retryCreate: "Pokušaj ponovno dodati ovog pacijenta",
    keepMine: "Zadrži moja izmijenjena polja (pokušaj ponovno nad ovom inačicom)",
    cancel: "Odustani",
    onlineOnlyPage: "Ova stranica zahtijeva internetsku vezu ili pacijent nije spremljen na ovom uređaju.",
    errors: {
      needsHttps: "Izvanmrežni pristup zahtijeva HTTPS i preglednik s podrškom za service worker.",
      prepareTimeout: "Priprema izvanmrežne aplikacije trajala je predugo. Ostanite na mreži i pokušajte ponovno.",
      authFailed: "Mrežna autorizacija nije uspjela.",
      confirmTrusted: "Potvrdite da je ovo privatan i pouzdan uređaj.",
      noLocks: "Ovaj preglednik ne može sigurno zaključati izvanmrežnu pohranu između kartica. Koristite noviju inačicu preglednika Chrome, Edge, Firefox ili Safari.",
      otherTab: "Izvanmrežni podatci već su otvoreni u drugoj kartici. Najprije pauzirajte tu karticu.",
      storageRemoved: "Šifrirana pohrana uređaja je uklonjena.",
      evictionWarning: "Šifrirana pohrana je dostupna, no ovaj je preglednik može obrisati. Redovito sinkronizirajte i nemojte brisati podatke stranice.",
      renewMismatch: "Za obnovu ovog isteklog uređaja prijavite se izvornim računom osoblja i državom.",
      workspaceClosed: "Izvanmrežni radni prostor je zatvoren.",
      openFailed: "Nije moguće otvoriti šifriranu pohranu uređaja.",
      needsReview: "Neke izmjene zahtijevaju pregled niže. Mrežni kartoni nisu prepisani.",
      synced: "Sve su izmjene sinkronizirane. E-poruke i pozivnice nisu poslane automatski.",
      syncFailed: "Sinkronizacija nije uspjela. Izmjene ostaju šifrirane na ovom uređaju.",
      discardConfirm:
        "Trajno odbaciti sve nesinkronizirane izmjene i izbrisati šifrirane zdravstvene podatke s ovog uređaja? Ova se radnja ne može poništiti.",
      signOutBlocked:
        "Odjava je blokirana: sinkronizirajte izmjene na čekanju ili ih izričito odbacite i uklonite podatke s ovog uređaja.",
      deviceDataRemoved: "Šifrirani podatci s uređaja su uklonjeni. Spojite se na internet kako biste dovršili odjavu iz mrežne prijave.",
      removeFailed: "Nije moguće ukloniti šifrirane podatke.",
      sameAccount: "Prijavite se izvornim računom osoblja i državom.",
      retryConfirm:
        "Ponoviti slanje izmijenjenih polja preko pregledane mrežne inačice? Ako se podatci ponovno promijene, sinkronizacija će stati radi novog pregleda.",
      alreadyProcessed: "Ova izmjena na čekanju već je obrađena.",
      conflictFailed: "Rješavanje nepodudaranja nije uspjelo.",
      needsConnection: "Pozivi, e-pošta i vanjske poveznice zahtijevaju internetsku vezu.",
    },
  },
  rom: {
    title: "Garavdo bi-internetesko than",
    encryptionBadge: "AES-GCM 256-bit",
    storageMeterLabel: "Garavdo arakhipe pe aparati",
    storageQuotaSummary: (usedMb, quotaMb) => `${usedMb} MB labarde katar ${quotaMb} MB`,
    idlePauseIn: (clock) => `Pauza ande ${clock}`,
    stayUnlocked: "Achh putardo",
    vaultDetailsToggle: "Garavipnaske detalyurya",
    diffFieldHeader: "Klinikano than",
    entityLabels: {
      patient: "Paciento",
      request: "Mangimos",
    },
    attachmentSummary: (count) =>
      count === 1 ? "1 phandlo lil vay poza" : `${count} phandle lila vay poze`,
    fieldLabels: {
      full_name: "Anav thaj familijako anav",
      phone: "Telefono",
      email: "Email",
      date_of_birth: "Dyes e biyanipnasko",
      gender: "Dzheno",
      address: "Adresa",
      county: "Than",
      status: "Statuso sastipnasko",
      priority: "Prioriteto",
      condition_notes: "Simptomurya thaj noticye",
      medical_history: "Istoriya e nasvalipnaski thaj alergiye",
      treatment_plan: "Plano tratamentesko",
      followups: "Planisarde kontrole",
      photos: "Tasvirya thaj lila",
      intake: "Angluno lil",
      profile_photo: "Poza e profiloski",
      description: "Lekhavipe e mangimasko",
      internal_notes: "Andrutne noticye",
      assigned_worker_id: "Alosardo bukyarno",
      patient_id: "Lil e pacientesko",
    },
    online: "Pe rig (online)",
    offline: "Bi-internetesko",
    intro:
      "O sastipnasko lil thaj e dokumenturya achhen garavde, numay e klidi si arakhadi ande kadava brauzero te putrel pes korkori, bi parolako. Sakon kay labarel kadava brauzeresko profilo shay te dikhel e date. Labar numay cho privatno aparati arakhado katar ekranesko phandipe.",
    limits: (count) =>
      `Getosar online zhi ko ${count} neve alosarde pacienturya thaj ${count} neve mangimata. O shayipe nakhel palo 30 divesa, thaj achel palo 10 minute bi buchako. Nevo putripe na mangel parola. Kadava nay bi-internetesko khuvipe andre.`,
    checkingStorage: "Dikhlyol pes o garavdo arakhipe pe aparati…",
    legacyPassphrase: "Purani bi-interneteski parola (ekh drom, vash nakhavipe)",
    trustedDevice:
      "Kadava si privatno aparati. Achharav kay sakon kay labarel kadava brauzeresko profilo shay te putrel e bi-interneteske lila bi parolako.",
    wait: "Azhuker…",
    migrate: "Nakh ko korkoro putripe",
    reopen: "Putar palem o garavdo bi-internetesko than",
    enable: "Muk bi-internetesko butikeripe pe kadava aparati",
    discardAndRemove: "Muk tele e paruvimata thaj kos e date katar o aparati",
    backToPanel: "Palpale ko online panelo",
    openPanel: "Putar o online panelo",
    pendingChanges: (count) =>
      count === 1 ? "1 paruvipe azhukerel" : `${count} paruvimata azhukeren`,
    expires: "Nakhel",
    syncing: "Sinkronizisarel pes…",
    syncNow: "Sinkronizisar akana",
    pause: "Pauza",
    signOut: "Inkljes avri",
    editsNote:
      "E paruvimata arakhadyon garavde pe aparati thaj bichhalyon kana avel o interneto, zhi kay o than si putardo. Emailurya, akharimata thaj telefonurya mangen o online panelo.",
    autoAccessNote:
      "Korkoro putripe: e klidi si arakhadi and-o brauzero. E pauza na phandel o shayipe, thaj o nevo putripe na mangel parola.",
    compareResolve: "Ververisar thaj lačhar",
    reviewTitle: "Dikh e ververimata",
    reviewBody:
      "Dikh che paruvde thana khetane e online datenca. Vash dokumenturya thaj poze, putar e pacientes ko online panelo. Khanch na lekhavel pes opral bi che alosaripnasko.",
    deviceValue: "Paruvipe pe aparati",
    onlineValue: "Online lil akana",
    notInSnapshot: "(nane and-e akana mukhle date)",
    empty: "(chuchho)",
    useOnline: "Labar e online date thaj muk kadava paruvipe",
    retryCreate: "Zumav palem te thos kadale pacientes",
    keepMine: "Arakh mure paruvde thana (zumav palem pe kadi verzia)",
    cancel: "Mekh",
    onlineOnlyPage: "Kadi rig mangel interneto vay o paciento nane arakhado pe kadava aparati.",
    errors: {
      needsHttps: "Bi-internetesko butikeripe mangel HTTPS thaj brauzero kay zhutil service worker.",
      prepareTimeout: "O getosaripe vash bi-interneteski aplikacia nakhlo but vrama. Achh online thaj zumav palem.",
      authFailed: "Online muklipe na kerdili.",
      confirmTrusted: "Phen chaches kay kadava si privatno thaj pakhivalo aparati.",
      noLocks: "Kadava brauzero nashti te phandel garavdes e bi-interneteske date mashkar e riga. Labar nevi verzia katar Chrome, Edge, Firefox vay Safari.",
      otherTab: "E bi-interneteske date si vorta putarde ande aver rig. Tho pauza kothe anglal.",
      storageRemoved: "O garavdo arakhipe katar o aparati sas koslo.",
      evictionWarning: "O garavdo arakhipe si kathe, numay kadava brauzero shay te kosel les. Sinkronizisar butivar thaj ma kos e date e rigake.",
      renewMismatch: "Te nevyaras kadava nakhlo aparati, khuves andre e anglune bukyarne kontosa thaj themesa.",
      workspaceClosed: "O garavdo bi-internetesko than phandilo.",
      openFailed: "Nashti te putrel pes o garavdo arakhipe pe aparati.",
      needsReview: "Nesave paruvimata mangen dikhlipe tele. E online lila na sas paruvde.",
      synced: "Sa e paruvimata sinkronizisardile. Na bichhaldile korkori emailurya vay akharimata.",
      syncFailed: "E sinkronizacia na kerdili. E paruvimata achhen garavde pe kadava aparati.",
      discardConfirm:
        "Kames chaches te mukhes sa e bi-sinkronizisarde paruvimata thaj te koses e garavde sastipnaske date katar kadava aparati? Kadava nashti te irinel pes.",
      signOutBlocked:
        "Nashti te inkljes avri akana: sinkronizisar e paruvimata kay azhukeren, vay muk len chaches thaj kos e date katar kadava aparati.",
      deviceDataRemoved: "E garavde date katar o aparati sas kosle. Phand tu ko interneto te gatisares o inkljipe avri.",
      removeFailed: "Nashti te kosen pes e garavde date.",
      sameAccount: "Khuves andre e anglune bukyarne kontosa thaj themesa.",
      retryConfirm:
        "Zumaves palem che paruvde thana opral e dikhli online verzia? Te paruvdyona e date palem, e sinkronizacia ka achel vash nevo dikhlipe.",
      alreadyProcessed: "Kadava paruvipe sas vorta kerdo.",
      conflictFailed: "O lačharipe e ververimatengo na kerdili.",
      needsConnection: "Telefonurya, emailurya thaj avrutne linkurya mangen interneto.",
    },
  },
};

/** BCP 47 locale for the expiry date in each language. */
export const offlineDateLocale: Record<Lang, string> = {
ru: "ru-RU",

  ro: "ro-RO",
  en: "en-GB",
  sq: "sq-AL",
  it: "it-IT",
  hr: "hr-HR",
  rom: "ro-RO",
};
