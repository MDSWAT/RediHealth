import type { Lang } from "@/lib/i18n/translations";

/**
 * Every string the encrypted offline workspace (/offline, staff only) shows, in ro, en, sq and it.
 * Staff screens: neutral and short. Error texts thrown by src/lib/offline-vault.ts and
 * src/lib/offline-store.ts are not here; they come from those libraries.
 */
export type OfflineCopy = {
  title: string;
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
  ro: {
    title: "Spațiu offline criptat",
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
    deviceValue: "Dispozitiv",
    onlineValue: "Online",
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
    deviceValue: "Device",
    onlineValue: "Online",
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
    deviceValue: "Pajisja",
    onlineValue: "Në linjë",
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
    deviceValue: "Dispositivo",
    onlineValue: "Online",
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
};

/** BCP 47 locale for the expiry date in each language. */
export const offlineDateLocale: Record<Lang, string> = { ro: "ro-RO", en: "en-GB", sq: "sq-AL", it: "it-IT" };
