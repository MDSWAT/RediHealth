import type { Lang } from "./translations";

type IntakeCopy = {
  contact: string; care: string; location: string; documents: string; hasDocuments: string;
  documentHint: string; medical: string; identity: string; upload: string; reading: string;
  remove: string; fileError: string; readError: string; useGps: string; locating: string;
  gpsHint: string; gpsDenied: string; gpsUnavailable: string; gpsTimeout: string; gpsUnsupported: string;
  accuracy: string; noDocuments: string; download: string; more: string;
};

export const patientIntakeTranslations: Record<Lang, IntakeCopy> = {
  en: {
    contact: "Patient details", care: "Care needs", location: "Address & location", documents: "Patient documents",
    hasDocuments: "The patient has documents", documentHint: "Attach medical or identity documents now, or later. PDF, JPEG, PNG or WebP; up to 5 files, 5 MB each, 10 MB total. Only upload documents needed for care.",
    medical: "Medical document", identity: "Identity document", upload: "Choose documents", reading: "Reading files…",
    remove: "Remove", fileError: "Use valid PDF, JPEG, PNG or WebP files: up to 5 files, 5 MB each and 10 MB total.",
    readError: "Could not read the file. Please try again.", useGps: "Use current location", locating: "Getting location…",
    gpsHint: "Only use this at the patient's location. GPS coordinates are saved separately; your typed address stays unchanged.",
    gpsDenied: "Location permission was denied. Allow location access in your browser or enter the address manually.",
    gpsUnavailable: "Your location could not be determined. Try again or enter the address manually.",
    gpsTimeout: "Location timed out. Try again outdoors or enter the address manually.",
    gpsUnsupported: "GPS requires a supported browser and a secure HTTPS connection.",
    accuracy: "Accuracy", noDocuments: "No documents declared", download: "Download", more: "Additional details",
  },
  ro: {
    contact: "Datele pacientului", care: "Nevoi de îngrijire", location: "Adresă și localizare", documents: "Documentele pacientului",
    hasDocuments: "Pacientul are documente", documentHint: "Atașează documente medicale sau de identitate acum ori mai târziu. PDF, JPEG, PNG sau WebP; maximum 5 fișiere, 5 MB fiecare, 10 MB în total. Încarcă doar documentele necesare îngrijirii.",
    medical: "Document medical", identity: "Document de identitate", upload: "Alege documentele", reading: "Se citesc fișierele…",
    remove: "Elimină", fileError: "Folosește fișiere PDF, JPEG, PNG sau WebP valide: maximum 5 fișiere, 5 MB fiecare și 10 MB în total.",
    readError: "Fișierul nu a putut fi citit. Încearcă din nou.", useGps: "Folosește locația curentă", locating: "Se obține locația…",
    gpsHint: "Folosește această opțiune doar la locația pacientului. Coordonatele GPS se salvează separat; adresa scrisă rămâne neschimbată.",
    gpsDenied: "Accesul la locație a fost refuzat. Permite accesul în browser sau completează adresa manual.",
    gpsUnavailable: "Locația nu a putut fi determinată. Încearcă din nou sau completează adresa manual.",
    gpsTimeout: "Localizarea a durat prea mult. Încearcă din nou în aer liber sau completează adresa manual.",
    gpsUnsupported: "GPS necesită un browser compatibil și o conexiune securizată HTTPS.",
    accuracy: "Precizie", noDocuments: "Nu au fost declarate documente", download: "Descarcă", more: "Detalii suplimentare",
  },
  sq: {
    contact: "Të dhënat e pacientit", care: "Nevojat për kujdes", location: "Adresa dhe vendndodhja", documents: "Dokumentet e pacientit",
    hasDocuments: "Pacienti ka dokumente", documentHint: "Bashkëngjitni dokumente mjekësore ose identiteti tani ose më vonë. PDF, JPEG, PNG ose WebP; deri në 5 skedarë, 5 MB secili, 10 MB gjithsej. Ngarkoni vetëm dokumentet e nevojshme për kujdesin.",
    medical: "Dokument mjekësor", identity: "Dokument identiteti", upload: "Zgjidhni dokumentet", reading: "Duke lexuar skedarët…",
    remove: "Hiq", fileError: "Përdorni skedarë të vlefshëm PDF, JPEG, PNG ose WebP: deri në 5 skedarë, 5 MB secili dhe 10 MB gjithsej.",
    readError: "Skedari nuk mund të lexohej. Provoni përsëri.", useGps: "Përdor vendndodhjen aktuale", locating: "Duke marrë vendndodhjen…",
    gpsHint: "Përdoreni vetëm në vendndodhjen e pacientit. Koordinatat GPS ruhen veçmas; adresa e shkruar nuk ndryshon.",
    gpsDenied: "Leja e vendndodhjes u refuzua. Lejojeni në shfletues ose shkruani adresën manualisht.",
    gpsUnavailable: "Vendndodhja nuk u përcaktua. Provoni përsëri ose shkruani adresën manualisht.",
    gpsTimeout: "Koha e vendndodhjes mbaroi. Provoni jashtë ose shkruani adresën manualisht.",
    gpsUnsupported: "GPS kërkon një shfletues të përshtatshëm dhe lidhje të sigurt HTTPS.",
    accuracy: "Saktësia", noDocuments: "Nuk janë deklaruar dokumente", download: "Shkarko", more: "Detaje shtesë",
  },
  it: {
    contact: "Dati del paziente", care: "Esigenze di assistenza", location: "Indirizzo e posizione", documents: "Documenti del paziente",
    hasDocuments: "Il paziente ha documenti", documentHint: "Allega documenti medici o d'identità ora o in seguito. PDF, JPEG, PNG o WebP; massimo 5 file, 5 MB ciascuno, 10 MB totali. Carica solo i documenti necessari alle cure.",
    medical: "Documento medico", identity: "Documento d'identità", upload: "Scegli documenti", reading: "Lettura dei file…",
    remove: "Rimuovi", fileError: "Usa file PDF, JPEG, PNG o WebP validi: massimo 5 file, 5 MB ciascuno e 10 MB totali.",
    readError: "Impossibile leggere il file. Riprova.", useGps: "Usa posizione attuale", locating: "Acquisizione posizione…",
    gpsHint: "Usa questa opzione solo dove si trova il paziente. Le coordinate GPS vengono salvate separatamente; l'indirizzo scritto non cambia.",
    gpsDenied: "Accesso alla posizione negato. Consenti l'accesso nel browser o inserisci l'indirizzo manualmente.",
    gpsUnavailable: "Impossibile determinare la posizione. Riprova o inserisci l'indirizzo manualmente.",
    gpsTimeout: "Tempo di localizzazione scaduto. Riprova all'aperto o inserisci l'indirizzo manualmente.",
    gpsUnsupported: "Il GPS richiede un browser compatibile e una connessione HTTPS sicura.",
    accuracy: "Precisione", noDocuments: "Nessun documento dichiarato", download: "Scarica", more: "Altri dettagli",
  },
};
