import type { Lang } from "./translations";

type WizardCopy = {
  steps: [string, string, string]; hints: [string, string, string];
  next: string; back: string; edit: string; progress: string; required: string;
  empty: string; ready: string; documents: string; gps: string;
};

export const patientWizardTranslations: Record<Lang, WizardCopy> = {
  en: {
    steps: ["Patient details", "Care & documents", "Review"],
    hints: ["Start with the patient's name and contact details.", "Add care needs, location and documents. These details are optional.", "Check the profile before creating it. You can still go back and edit."],
    next: "Continue", back: "Back", edit: "Edit", progress: "Patient creation progress",
    required: "Please complete this field.", empty: "Not provided", ready: "Ready to create",
    documents: "Attached documents", gps: "GPS location",
  },
  ro: {
    steps: ["Datele pacientului", "Îngrijire și documente", "Verificare"],
    hints: ["Începe cu numele și datele de contact ale pacientului.", "Adaugă nevoile de îngrijire, locația și documentele. Aceste detalii sunt opționale.", "Verifică fișa înainte de creare. Poți reveni pentru modificări."],
    next: "Continuă", back: "Înapoi", edit: "Modifică", progress: "Progresul adăugării pacientului",
    required: "Completează acest câmp.", empty: "Necompletat", ready: "Gata de adăugare",
    documents: "Documente atașate", gps: "Locație GPS",
  },
  sq: {
    steps: ["Të dhënat e pacientit", "Kujdesi dhe dokumentet", "Kontrollo"],
    hints: ["Filloni me emrin dhe kontaktet e pacientit.", "Shtoni nevojat e kujdesit, vendndodhjen dhe dokumentet. Këto janë opsionale.", "Kontrolloni profilin përpara krijimit. Mund të ktheheni për ndryshime."],
    next: "Vazhdo", back: "Prapa", edit: "Ndrysho", progress: "Progresi i krijimit të pacientit",
    required: "Plotësoni këtë fushë.", empty: "Nuk është dhënë", ready: "Gati për krijim",
    documents: "Dokumente të bashkëngjitura", gps: "Vendndodhja GPS",
  },
  it: {
    steps: ["Dati del paziente", "Cure e documenti", "Riepilogo"],
    hints: ["Inizia con il nome e i contatti del paziente.", "Aggiungi esigenze di cura, posizione e documenti. Questi dettagli sono facoltativi.", "Controlla il profilo prima di crearlo. Puoi tornare indietro e modificarlo."],
    next: "Continua", back: "Indietro", edit: "Modifica", progress: "Avanzamento creazione paziente",
    required: "Compila questo campo.", empty: "Non indicato", ready: "Pronto per la creazione",
    documents: "Documenti allegati", gps: "Posizione GPS",
  },
};
