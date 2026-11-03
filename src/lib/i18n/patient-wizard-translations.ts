import type { Lang } from "./translations";

type WizardCopy = {
  steps: [string, string, string]; hints: [string, string, string];
  next: string; back: string; edit: string; progress: string; required: string;
  empty: string; ready: string; documents: string; gps: string;
  personal: string; personalHint: string; care: string; careHint: string;
  team: string; teamHint: string; searchTeam: string; emptyTeam: string;
  loadingTeam: string; teamError: string; retry: string;
};

export const patientWizardTranslations: Record<Lang, WizardCopy> = {
  en: {
    steps: ["Patient details", "Care & documents", "Review"],
    hints: ["Start with the patient's name and contact details.", "Add care needs, location and documents. These details are optional.", "Check the profile before creating it. You can still go back and edit."],
    next: "Continue", back: "Back", edit: "Edit", progress: "Patient creation progress",
    required: "Please complete this field.", empty: "Not provided", ready: "Ready to create",
    documents: "Attached documents", gps: "GPS location",
    personal: "Personal information", personalHint: "Optional details to complete the patient's profile.",
    care: "Care settings", careHint: "Set the priority and current care status.",
    team: "Care team", teamHint: "Select the people caring for this patient. You can choose more than one.",
    searchTeam: "Search by name, role, email or county", emptyTeam: "No one selected yet. Choose team members below.",
    loadingTeam: "Loading team members…", teamError: "Team members could not be loaded.", retry: "Try again",
  },
  ro: {
    steps: ["Datele pacientului", "Îngrijire și documente", "Verificare"],
    hints: ["Începe cu numele și datele de contact ale pacientului.", "Adaugă nevoile de îngrijire, locația și documentele. Aceste detalii sunt opționale.", "Verifică fișa înainte de creare. Poți reveni pentru modificări."],
    next: "Continuă", back: "Înapoi", edit: "Modifică", progress: "Progresul adăugării pacientului",
    required: "Completează acest câmp.", empty: "Necompletat", ready: "Gata de adăugare",
    documents: "Documente atașate", gps: "Locație GPS",
    personal: "Informații personale", personalHint: "Detalii opționale pentru completarea fișei pacientului.",
    care: "Setări de îngrijire", careHint: "Stabilește prioritatea și starea actuală a îngrijirii.",
    team: "Echipa de îngrijire", teamHint: "Selectează persoanele care îngrijesc acest pacient. Poți alege mai multe.",
    searchTeam: "Caută după nume, rol, email sau județ", emptyTeam: "Nicio persoană selectată. Alege membrii echipei mai jos.",
    loadingTeam: "Se încarcă membrii echipei…", teamError: "Membrii echipei nu au putut fi încărcați.", retry: "Încearcă din nou",
  },
  sq: {
    steps: ["Të dhënat e pacientit", "Kujdesi dhe dokumentet", "Kontrollo"],
    hints: ["Filloni me emrin dhe kontaktet e pacientit.", "Shtoni nevojat e kujdesit, vendndodhjen dhe dokumentet. Këto janë opsionale.", "Kontrolloni profilin përpara krijimit. Mund të ktheheni për ndryshime."],
    next: "Vazhdo", back: "Prapa", edit: "Ndrysho", progress: "Progresi i krijimit të pacientit",
    required: "Plotësoni këtë fushë.", empty: "Nuk është dhënë", ready: "Gati për krijim",
    documents: "Dokumente të bashkëngjitura", gps: "Vendndodhja GPS",
    personal: "Informacione personale", personalHint: "Të dhëna opsionale për të plotësuar profilin e pacientit.",
    care: "Cilësimet e kujdesit", careHint: "Përcaktoni përparësinë dhe gjendjen aktuale të kujdesit.",
    team: "Ekipi i kujdesit", teamHint: "Zgjidhni personat që kujdesen për këtë pacient. Mund të zgjidhni disa.",
    searchTeam: "Kërko sipas emrit, rolit, emailit ose qarkut", emptyTeam: "Ende asnjë person i zgjedhur. Zgjidhni anëtarët më poshtë.",
    loadingTeam: "Duke ngarkuar anëtarët…", teamError: "Anëtarët e ekipit nuk mund të ngarkoheshin.", retry: "Provo përsëri",
  },
  it: {
    steps: ["Dati del paziente", "Cure e documenti", "Riepilogo"],
    hints: ["Inizia con il nome e i contatti del paziente.", "Aggiungi esigenze di cura, posizione e documenti. Questi dettagli sono facoltativi.", "Controlla il profilo prima di crearlo. Puoi tornare indietro e modificarlo."],
    next: "Continua", back: "Indietro", edit: "Modifica", progress: "Avanzamento creazione paziente",
    required: "Compila questo campo.", empty: "Non indicato", ready: "Pronto per la creazione",
    documents: "Documenti allegati", gps: "Posizione GPS",
    personal: "Informazioni personali", personalHint: "Dati facoltativi per completare il profilo del paziente.",
    care: "Impostazioni di cura", careHint: "Imposta la priorità e lo stato attuale delle cure.",
    team: "Équipe di cura", teamHint: "Seleziona le persone che assistono questo paziente. Puoi sceglierne più di una.",
    searchTeam: "Cerca per nome, ruolo, email o provincia", emptyTeam: "Nessuna persona selezionata. Scegli i membri qui sotto.",
    loadingTeam: "Caricamento dei membri…", teamError: "Impossibile caricare i membri dell'équipe.", retry: "Riprova",
  },
};
