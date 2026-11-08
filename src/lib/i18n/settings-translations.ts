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
    subtitle: "Only super admins can see and change these.",
    noDatabase: "Database not available. Check the MySQL settings and run migration 009.",
    alertSectionTitle: "Alerts and problem reports",
    alertSectionHelp: "Problem reports from the website and system alerts (service errors, AI provider failures) go to this address. Leave it empty to use the server setting.",
    alertEmailLabel: "Recipient email",
    alertEmailPlaceholder: "ops@example.com",
    sourcePanel: "Using the address saved here.",
    sourceEnv: "Using the address from the server setting.",
    sourceNone: "No address set. Reports and alerts are not sent.",
    save: "Save",
    saving: "Saving...",
    saved: "Settings saved.",
    invalidEmail: "Enter a valid email address.",
    saveFailed: "Could not save the settings. Try again.",
  },
  ro: {
    navLabel: "Setări",
    eyebrow: "Super administrator",
    title: "Setări",
    subtitle: "Doar super administratorii văd și schimbă aceste setări.",
    noDatabase: "Baza de date nu e disponibilă. Verifică setările MySQL și rulează migrarea 009.",
    alertSectionTitle: "Alerte și probleme raportate",
    alertSectionHelp: "Problemele raportate pe site și alertele de sistem (erori de serviciu, căderi ale furnizorului AI) ajung la această adresă. Lasă gol ca să folosești setarea serverului.",
    alertEmailLabel: "Email destinatar",
    alertEmailPlaceholder: "ops@exemplu.com",
    sourcePanel: "Se folosește adresa salvată aici.",
    sourceEnv: "Se folosește adresa din configurarea serverului.",
    sourceNone: "Nu e setată nicio adresă. Rapoartele și alertele nu se trimit.",
    save: "Salvează",
    saving: "Se salvează...",
    saved: "Setările au fost salvate.",
    invalidEmail: "Introdu o adresă de email validă.",
    saveFailed: "Setările nu au putut fi salvate. Încearcă din nou.",
  },
  sq: {
    navLabel: "Cilësimet",
    eyebrow: "Super administrator",
    title: "Cilësimet",
    subtitle: "Këto i shohin dhe i ndryshojnë vetëm super administratorët.",
    noDatabase: "Baza e të dhënave nuk është e disponueshme. Kontrollo konfigurimin e MySQL dhe apliko migrimin 009.",
    alertSectionTitle: "Alarmet dhe raportimet e problemeve",
    alertSectionHelp: "Problemet e raportuara në faqe dhe alarmet e sistemit (gabime shërbimi, defekte të ofruesit AI) shkojnë në këtë adresë. Lëre bosh për të përdorur cilësimin e serverit.",
    alertEmailLabel: "Email i marrësit",
    alertEmailPlaceholder: "ops@shembull.com",
    sourcePanel: "Po përdoret adresa e ruajtur këtu.",
    sourceEnv: "Po përdoret adresa nga konfigurimi i serverit.",
    sourceNone: "Nuk ka adresë. Raportimet dhe alarmet nuk dërgohen.",
    save: "Ruaj",
    saving: "Po ruhet...",
    saved: "Cilësimet u ruajtën.",
    invalidEmail: "Shkruaj një adresë emaili të vlefshme.",
    saveFailed: "Cilësimet nuk u ruajtën. Provo përsëri.",
  },
  it: {
    navLabel: "Impostazioni",
    eyebrow: "Super amministratore",
    title: "Impostazioni",
    subtitle: "Solo i super amministratori possono vederle e cambiarle.",
    noDatabase: "Il database non è disponibile. Controlla la configurazione MySQL e applica la migrazione 009.",
    alertSectionTitle: "Avvisi e segnalazioni di problemi",
    alertSectionHelp: "Le segnalazioni dal sito e gli avvisi di sistema (errori di servizio, guasti del fornitore AI) arrivano a questo indirizzo. Lascia vuoto per usare l'impostazione del server.",
    alertEmailLabel: "Email del destinatario",
    alertEmailPlaceholder: "ops@esempio.com",
    sourcePanel: "Viene usato l'indirizzo salvato qui.",
    sourceEnv: "Viene usato l'indirizzo della configurazione del server.",
    sourceNone: "Nessun indirizzo impostato. Segnalazioni e avvisi non vengono inviati.",
    save: "Salva",
    saving: "Salvataggio...",
    saved: "Impostazioni salvate.",
    invalidEmail: "Inserisci un indirizzo email valido.",
    saveFailed: "Impossibile salvare le impostazioni. Riprova.",
  },
};
