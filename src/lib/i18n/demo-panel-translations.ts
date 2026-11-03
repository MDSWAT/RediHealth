import type { Lang } from "./translations";

export const demoPanelTranslations: Record<Lang, {
  title: string; notice: string; role: string; mediator: string; doctor: string; reset: string;
  resetConfirm: string; exit: string; loading: string; storageError: string; resetToContinue: string;
  notFound: string; back: string; video: string; transcript: string;
}> = {
  en: {
    title: "Interactive panel demo", notice: "Fictional data only. Changes stay in this browser. Emails, calls and video consultations are simulated; nothing is sent to the live database. Do not enter real patient information.",
    role: "Role", mediator: "Mediator", doctor: "Doctor", reset: "Reset demo", resetConfirm: "Delete your local demo changes and restore the sample data?",
    exit: "Back to website", loading: "Loading demo…", storageError: "Browser storage is unavailable, full or contains invalid demo data. Free some space or reset the demo. The change was not saved.",
    resetToContinue: "Reset the demo or enable browser storage to continue.", notFound: "This demo page or record is unavailable for the selected role.", back: "Back to demo",
    video: "Simulated video consultation. No camera, microphone or external meeting service is used.",
    transcript: "Demo patient: This is a simulated follow-up consultation.",
  },
  ro: {
    title: "Demonstrație interactivă a panoului", notice: "Doar date fictive. Modificările rămân în acest browser. Emailurile, apelurile și consultațiile video sunt simulate; nimic nu ajunge în baza de date reală. Nu introduce date reale ale pacienților.",
    role: "Rol", mediator: "Mediator", doctor: "Medic", reset: "Resetează demonstrația", resetConfirm: "Ștergi modificările locale și restaurezi datele fictive inițiale?",
    exit: "Înapoi la site", loading: "Se încarcă demonstrația…", storageError: "Stocarea browserului este indisponibilă, plină sau conține date demo invalide. Eliberează spațiu sau resetează demonstrația. Modificarea nu a fost salvată.",
    resetToContinue: "Resetează demonstrația sau permite stocarea în browser pentru a continua.", notFound: "Pagina sau înregistrarea demo nu este disponibilă pentru rolul selectat.", back: "Înapoi la demonstrație",
    video: "Consultație video simulată. Nu se folosește camera, microfonul sau un serviciu extern de întâlniri.",
    transcript: "Pacient demo: Aceasta este o consultație de urmărire simulată.",
  },
  sq: {
    title: "Demonstrim interaktiv i panelit", notice: "Vetëm të dhëna fiktive. Ndryshimet ruhen në këtë shfletues. Email-et, telefonatat dhe videot simulohen; asgjë nuk dërgohet në bazën reale. Mos shkruani të dhëna reale pacientësh.",
    role: "Roli", mediator: "Ndërmjetës", doctor: "Mjek", reset: "Rivendos demonstrimin", resetConfirm: "Të fshihen ndryshimet lokale dhe të rikthehen të dhënat fillestare?",
    exit: "Kthehu në faqe", loading: "Duke ngarkuar…", storageError: "Ruajtja e shfletuesit është e padisponueshme, plot ose ka të dhëna të pavlefshme. Lironi hapësirë ose rivendosni demonstrimin. Ndryshimi nuk u ruajt.",
    resetToContinue: "Rivendosni demonstrimin ose aktivizoni ruajtjen për të vazhduar.", notFound: "Faqja ose regjistrimi nuk është i disponueshëm për këtë rol.", back: "Kthehu te demonstrimi",
    video: "Konsultë video e simuluar. Nuk përdoret kamera, mikrofoni ose shërbim i jashtëm.",
    transcript: "Pacient demo: Kjo është një konsultë ndjekjeje e simuluar.",
  },
  it: {
    title: "Demo interattiva del pannello", notice: "Solo dati fittizi. Le modifiche restano in questo browser. Email, chiamate e video sono simulati; nulla viene inviato al database reale. Non inserire dati reali dei pazienti.",
    role: "Ruolo", mediator: "Mediatore", doctor: "Medico", reset: "Reimposta demo", resetConfirm: "Eliminare le modifiche locali e ripristinare i dati iniziali?",
    exit: "Torna al sito", loading: "Caricamento…", storageError: "La memoria del browser è indisponibile, piena o contiene dati demo non validi. Libera spazio o reimposta la demo. La modifica non è stata salvata.",
    resetToContinue: "Reimposta la demo o abilita la memoria del browser per continuare.", notFound: "Pagina o record demo non disponibile per il ruolo selezionato.", back: "Torna alla demo",
    video: "Consultazione video simulata. Nessuna fotocamera, microfono o servizio esterno viene utilizzato.",
    transcript: "Paziente demo: Questa è una visita di controllo simulata.",
  },
};
