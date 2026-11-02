import type { Lang } from "@/lib/i18n/translations";

export type SettingsCopy = {
  navLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  noDatabase: string;
  alertSectionTitle: string;
  alertSectionHelp: string;
  alertEmailLabel: string;
  alertEmailPlaceholder: string;
  sourcePanel: string;
  sourceEnv: string;
  sourceNone: string;
  save: string;
  saving: string;
  saved: string;
  invalidEmail: string;
  saveFailed: string;
};

export const settingsTranslations: Record<Lang, SettingsCopy> = {
  en: {
    navLabel: "Settings",
    eyebrow: "Super admin",
    title: "Settings",
    subtitle: "Configuration that only super admins can see and change.",
    noDatabase: "The database is not available. Check the MySQL configuration and apply migration 009.",
    alertSectionTitle: "Alerts and issue reports",
    alertSectionHelp: "Website issue reports and operational alerts (service errors, AI provider failures) are emailed to this address. Leave it empty to fall back to the server configuration.",
    alertEmailLabel: "Recipient email",
    alertEmailPlaceholder: "ops@example.com",
    sourcePanel: "Using the address saved here.",
    sourceEnv: "Using the address from the server configuration.",
    sourceNone: "No address configured: reports and alerts are not delivered.",
    save: "Save",
    saving: "Saving...",
    saved: "Settings saved.",
    invalidEmail: "Enter a valid email address.",
    saveFailed: "The settings could not be saved. Please try again.",
  },
  ro: {
    navLabel: "Setari",
    eyebrow: "Super administrator",
    title: "Setari",
    subtitle: "Configurari vizibile si modificabile doar de super administratori.",
    noDatabase: "Baza de date nu este disponibila. Verifica configurarea MySQL si aplica migrarea 009.",
    alertSectionTitle: "Alerte si rapoarte de probleme",
    alertSectionHelp: "Rapoartele de probleme de pe site si alertele operationale (erori de serviciu, defectiuni ale furnizorului AI) sunt trimise pe aceasta adresa. Lasa campul gol pentru a folosi configurarea serverului.",
    alertEmailLabel: "Email destinatar",
    alertEmailPlaceholder: "ops@exemplu.com",
    sourcePanel: "Se foloseste adresa salvata aici.",
    sourceEnv: "Se foloseste adresa din configurarea serverului.",
    sourceNone: "Nicio adresa configurata: rapoartele si alertele nu sunt livrate.",
    save: "Salveaza",
    saving: "Se salveaza...",
    saved: "Setarile au fost salvate.",
    invalidEmail: "Introdu o adresa de email valida.",
    saveFailed: "Setarile nu au putut fi salvate. Incearca din nou.",
  },
  sq: {
    navLabel: "Cilesimet",
    eyebrow: "Super administrator",
    title: "Cilesimet",
    subtitle: "Konfigurime qe i shohin dhe i ndryshojne vetem super administratoret.",
    noDatabase: "Baza e te dhenave nuk eshte e disponueshme. Kontrollo konfigurimin e MySQL dhe apliko migrimin 009.",
    alertSectionTitle: "Alarmet dhe raportimet e problemeve",
    alertSectionHelp: "Raportimet e problemeve nga faqja dhe alarmet operative (gabime sherbimi, defekte te ofruesit AI) dergohen ne kete adrese. Lere bosh per te perdorur konfigurimin e serverit.",
    alertEmailLabel: "Email i marresit",
    alertEmailPlaceholder: "ops@shembull.com",
    sourcePanel: "Po perdoret adresa e ruajtur ketu.",
    sourceEnv: "Po perdoret adresa nga konfigurimi i serverit.",
    sourceNone: "Asnje adrese e konfiguruar: raportimet dhe alarmet nuk dorezohen.",
    save: "Ruaj",
    saving: "Po ruhet...",
    saved: "Cilesimet u ruajten.",
    invalidEmail: "Shkruaj nje adrese emaili te vlefshme.",
    saveFailed: "Cilesimet nuk mund te ruheshin. Provo perseri.",
  },
  it: {
    navLabel: "Impostazioni",
    eyebrow: "Super amministratore",
    title: "Impostazioni",
    subtitle: "Configurazioni visibili e modificabili solo dai super amministratori.",
    noDatabase: "Il database non e disponibile. Controlla la configurazione MySQL e applica la migrazione 009.",
    alertSectionTitle: "Avvisi e segnalazioni di problemi",
    alertSectionHelp: "Le segnalazioni di problemi dal sito e gli avvisi operativi (errori di servizio, guasti del fornitore AI) vengono inviati a questo indirizzo. Lascia vuoto per usare la configurazione del server.",
    alertEmailLabel: "Email del destinatario",
    alertEmailPlaceholder: "ops@esempio.com",
    sourcePanel: "Viene usato l'indirizzo salvato qui.",
    sourceEnv: "Viene usato l'indirizzo della configurazione del server.",
    sourceNone: "Nessun indirizzo configurato: segnalazioni e avvisi non vengono recapitati.",
    save: "Salva",
    saving: "Salvataggio...",
    saved: "Impostazioni salvate.",
    invalidEmail: "Inserisci un indirizzo email valido.",
    saveFailed: "Impossibile salvare le impostazioni. Riprova.",
  },
};
