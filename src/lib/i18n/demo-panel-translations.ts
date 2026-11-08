import type { Lang } from "./translations";

export const demoPanelTranslations: Record<Lang, {
  title: string; notice: string; role: string; mediator: string; doctor: string; reset: string;
  resetConfirm: string; exit: string; loading: string; storageError: string; resetToContinue: string;
  notFound: string; back: string; video: string; transcript: string;
}> = {
  en: {
    title: "Panel demo", notice: "All data here is made up. Changes stay in this browser. Emails, calls and video are simulated and nothing reaches the real database. Do not enter real patient details.",
    role: "Role", mediator: "Mediator", doctor: "Doctor", reset: "Reset demo", resetConfirm: "Delete your changes and restore the sample data?",
    exit: "Back to website", loading: "Loading demo…", storageError: "The change was not saved. Browser storage is off, full or broken. Free some space or reset the demo.",
    resetToContinue: "Reset the demo or turn on browser storage to continue.", notFound: "This page is not available for this role.", back: "Back to demo",
    video: "Simulated video call. No camera, microphone or outside service is used.",
    transcript: "Demo patient: This is a simulated follow-up consultation.",
  },
  ro: {
    title: "Demo panou", notice: "Toate datele de aici sunt inventate. Modificările rămân în acest browser. Emailurile, apelurile și video sunt simulate și nimic nu ajunge în baza de date reală. Nu introduce date reale ale pacienților.",
    role: "Rol", mediator: "Mediator", doctor: "Medic", reset: "Resetează demo-ul", resetConfirm: "Ștergi modificările și revii la datele de exemplu?",
    exit: "Înapoi la site", loading: "Se încarcă demo-ul…", storageError: "Modificarea nu a fost salvată. Stocarea browserului e oprită, plină sau stricată. Eliberează spațiu sau resetează demo-ul.",
    resetToContinue: "Resetează demo-ul sau pornește stocarea în browser ca să continui.", notFound: "Pagina nu este disponibilă pentru acest rol.", back: "Înapoi la demo",
    video: "Apel video simulat. Nu se folosește camera, microfonul sau alt serviciu.",
    transcript: "Pacient demo: Aceasta este o consultație de control simulată.",
  },
  sq: {
    title: "Demo e panelit", notice: "Të gjitha të dhënat këtu janë të sajuara. Ndryshimet mbeten në këtë shfletues. Emailet, telefonatat dhe videoja janë simulime dhe asgjë nuk shkon në bazën e vërtetë. Mos shkruaj të dhëna të vërteta pacientësh.",
    role: "Roli", mediator: "Ndërmjetës", doctor: "Mjek", reset: "Rinis demon", resetConfirm: "Të fshihen ndryshimet e tua dhe të kthehen të dhënat shembull?",
    exit: "Kthehu te faqja", loading: "Duke ngarkuar demon…", storageError: "Ndryshimi nuk u ruajt. Hapësira e shfletuesit është e fikur, plot ose e dëmtuar. Liro hapësirë ose rinis demon.",
    resetToContinue: "Rinis demon ose aktivizo hapësirën e shfletuesit për të vazhduar.", notFound: "Kjo faqe nuk është e disponueshme për këtë rol.", back: "Kthehu te demoja",
    video: "Thirrje video e simuluar. Nuk përdoret kamera, mikrofoni ose shërbim tjetër.",
    transcript: "Pacient demo: Kjo është një konsultë kontrolli e simuluar.",
  },
  it: {
    title: "Demo del pannello", notice: "Tutti i dati qui sono inventati. Le modifiche restano in questo browser. Email, chiamate e video sono simulati e nulla arriva al database reale. Non inserire dati reali dei pazienti.",
    role: "Ruolo", mediator: "Mediatore", doctor: "Medico", reset: "Ripristina demo", resetConfirm: "Eliminare le tue modifiche e tornare ai dati di esempio?",
    exit: "Torna al sito", loading: "Caricamento demo…", storageError: "La modifica non è stata salvata. La memoria del browser è disattivata, piena o danneggiata. Libera spazio o ripristina la demo.",
    resetToContinue: "Ripristina la demo o attiva la memoria del browser per continuare.", notFound: "Questa pagina non è disponibile per questo ruolo.", back: "Torna alla demo",
    video: "Videochiamata simulata. Non si usano fotocamera, microfono o servizi esterni.",
    transcript: "Paziente demo: Questa è una visita di controllo simulata.",
  },
};
