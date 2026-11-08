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
    contact: "Patient details", care: "Care needs", location: "Address and location", documents: "Patient documents",
    hasDocuments: "The patient has documents", documentHint: "Attach medical or ID documents now or later. Only what is needed for care. PDF, JPEG, PNG or WebP, up to 5 files, 5 MB each, 10 MB in total.",
    medical: "Medical document", identity: "Identity document", upload: "Choose documents", reading: "Reading files…",
    remove: "Remove", fileError: "Use valid PDF, JPEG, PNG or WebP files: up to 5 files, 5 MB each and 10 MB total.",
    readError: "Could not read the file. Try again.", useGps: "Use my location", locating: "Finding location…",
    gpsHint: "Use this only when you are with the patient. GPS is saved on its own. The address you typed stays as it is.",
    gpsDenied: "Location access is blocked. Allow it in the browser or type the address.",
    gpsUnavailable: "Could not find your location. Try again or type the address.",
    gpsTimeout: "Location took too long. Try again outside or type the address.",
    gpsUnsupported: "GPS needs a supported browser and a secure (HTTPS) connection.",
    accuracy: "Accuracy", noDocuments: "No documents", download: "Download", more: "More details",
  },
  ro: {
    contact: "Datele pacientului", care: "Nevoi de îngrijire", location: "Adresă și locație", documents: "Documentele pacientului",
    hasDocuments: "Pacientul are documente", documentHint: "Atașează acte medicale sau de identitate acum sau mai târziu. Doar ce trebuie pentru îngrijire. PDF, JPEG, PNG sau WebP, maximum 5 fișiere, 5 MB fiecare, 10 MB în total.",
    medical: "Document medical", identity: "Document de identitate", upload: "Alege documentele", reading: "Se citesc fișierele…",
    remove: "Șterge", fileError: "Folosește fișiere PDF, JPEG, PNG sau WebP. Maximum 5 fișiere, 5 MB fiecare și 10 MB în total.",
    readError: "Fișierul nu a putut fi citit. Încearcă din nou.", useGps: "Folosește locația mea", locating: "Se caută locația…",
    gpsHint: "Folosește asta doar când ești la pacient. GPS-ul se salvează separat. Adresa scrisă rămâne la fel.",
    gpsDenied: "Accesul la locație e blocat. Permite-l în browser sau scrie adresa.",
    gpsUnavailable: "Locația nu a putut fi găsită. Încearcă din nou sau scrie adresa.",
    gpsTimeout: "Locația a durat prea mult. Încearcă afară sau scrie adresa.",
    gpsUnsupported: "GPS-ul cere un browser compatibil și o conexiune sigură (HTTPS).",
    accuracy: "Precizie", noDocuments: "Fără documente", download: "Descarcă", more: "Alte detalii",
  },
  sq: {
    contact: "Të dhënat e pacientit", care: "Nevojat për kujdes", location: "Adresa dhe vendndodhja", documents: "Dokumentet e pacientit",
    hasDocuments: "Pacienti ka dokumente", documentHint: "Bashkëngjit dokumente mjekësore ose identiteti tani ose më vonë. Vetëm ato që duhen për kujdesin. PDF, JPEG, PNG ose WebP, deri në 5 skedarë, 5 MB secili, 10 MB gjithsej.",
    medical: "Dokument mjekësor", identity: "Dokument identiteti", upload: "Zgjidh dokumentet", reading: "Duke lexuar skedarët…",
    remove: "Hiq", fileError: "Përdor skedarë PDF, JPEG, PNG ose WebP. Deri në 5 skedarë, 5 MB secili dhe 10 MB gjithsej.",
    readError: "Skedari nuk u lexua. Provo përsëri.", useGps: "Përdor vendndodhjen time", locating: "Duke gjetur vendndodhjen…",
    gpsHint: "Përdore vetëm kur je te pacienti. GPS ruhet veçmas. Adresa që shkrove nuk ndryshon.",
    gpsDenied: "Vendndodhja është e bllokuar. Lejoje në shfletues ose shkruaj adresën.",
    gpsUnavailable: "Vendndodhja nuk u gjet. Provo përsëri ose shkruaj adresën.",
    gpsTimeout: "Vendndodhja vonoi shumë. Provo jashtë ose shkruaj adresën.",
    gpsUnsupported: "GPS kërkon një shfletues që e mbështet dhe lidhje të sigurt (HTTPS).",
    accuracy: "Saktësia", noDocuments: "Pa dokumente", download: "Shkarko", more: "Të dhëna të tjera",
  },
  it: {
    contact: "Dati del paziente", care: "Esigenze di assistenza", location: "Indirizzo e posizione", documents: "Documenti del paziente",
    hasDocuments: "Il paziente ha documenti", documentHint: "Allega documenti medici o d'identità ora o dopo. Solo quelli utili alle cure. PDF, JPEG, PNG o WebP, massimo 5 file, 5 MB ciascuno, 10 MB in totale.",
    medical: "Documento medico", identity: "Documento d'identità", upload: "Scegli documenti", reading: "Lettura dei file…",
    remove: "Rimuovi", fileError: "Usa file PDF, JPEG, PNG o WebP. Massimo 5 file, 5 MB ciascuno e 10 MB in totale.",
    readError: "Impossibile leggere il file. Riprova.", useGps: "Usa la mia posizione", locating: "Ricerca posizione…",
    gpsHint: "Usalo solo quando sei dal paziente. Il GPS si salva a parte. L'indirizzo scritto resta com'è.",
    gpsDenied: "Accesso alla posizione bloccato. Consentilo nel browser o scrivi l'indirizzo.",
    gpsUnavailable: "Posizione non trovata. Riprova o scrivi l'indirizzo.",
    gpsTimeout: "La posizione ci mette troppo. Riprova all'aperto o scrivi l'indirizzo.",
    gpsUnsupported: "Il GPS richiede un browser compatibile e una connessione sicura (HTTPS).",
    accuracy: "Precisione", noDocuments: "Nessun documento", download: "Scarica", more: "Altri dettagli",
  },
};
