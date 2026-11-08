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
    steps: ["Patient details", "Care and documents", "Review"],
    hints: ["Start with the name and contact details.", "Care needs, location and documents. All optional.", "Check the details. You can still go back and edit."],
    next: "Continue", back: "Back", edit: "Edit", progress: "Steps",
    required: "Fill in this field.", empty: "Not given", ready: "Ready to save",
    documents: "Documents", gps: "GPS location",
    personal: "Personal details", personalHint: "Optional.",
    care: "Care", careHint: "Priority and care status.",
    team: "Care team", teamHint: "Choose who looks after this patient. You can pick more than one.",
    searchTeam: "Search by name, role, email or county", emptyTeam: "No one chosen yet. Pick people below.",
    loadingTeam: "Loading team members…", teamError: "Team members could not be loaded.", retry: "Try again",
  },
  ro: {
    steps: ["Datele pacientului", "Îngrijire și documente", "Verificare"],
    hints: ["Începe cu numele și datele de contact.", "Nevoi de îngrijire, locație și documente. Toate sunt opționale.", "Verifică datele. Poți să te întorci să modifici."],
    next: "Continuă", back: "Înapoi", edit: "Modifică", progress: "Pași",
    required: "Completează acest câmp.", empty: "Necompletat", ready: "Gata de salvat",
    documents: "Documente", gps: "Locație GPS",
    personal: "Date personale", personalHint: "Opțional.",
    care: "Îngrijire", careHint: "Prioritatea și statusul îngrijirii.",
    team: "Echipa de îngrijire", teamHint: "Alege cine are grijă de acest pacient. Poți alege mai mulți.",
    searchTeam: "Caută după nume, rol, email sau județ", emptyTeam: "Nu ai ales pe nimeni. Alege mai jos.",
    loadingTeam: "Se încarcă echipa…", teamError: "Echipa nu s-a putut încărca.", retry: "Încearcă din nou",
  },
  sq: {
    steps: ["Të dhënat e pacientit", "Kujdesi dhe dokumentet", "Kontrollo"],
    hints: ["Fillo me emrin dhe kontaktet.", "Nevojat për kujdes, vendndodhja dhe dokumentet. Të gjitha janë opsionale.", "Kontrollo të dhënat. Mund të kthehesh për t'i ndryshuar."],
    next: "Vazhdo", back: "Kthehu", edit: "Ndrysho", progress: "Hapat",
    required: "Plotëso këtë fushë.", empty: "Pa plotësuar", ready: "Gati për ruajtje",
    documents: "Dokumentet", gps: "Vendndodhja GPS",
    personal: "Të dhëna personale", personalHint: "Opsionale.",
    care: "Kujdesi", careHint: "Prioriteti dhe statusi i kujdesit.",
    team: "Ekipi i kujdesit", teamHint: "Zgjidh kush kujdeset për këtë pacient. Mund të zgjedhësh disa.",
    searchTeam: "Kërko sipas emrit, rolit, emailit ose qarkut", emptyTeam: "Ende s'ke zgjedhur njeri. Zgjidh më poshtë.",
    loadingTeam: "Duke ngarkuar ekipin…", teamError: "Ekipi nuk u ngarkua.", retry: "Provo përsëri",
  },
  it: {
    steps: ["Dati del paziente", "Cure e documenti", "Riepilogo"],
    hints: ["Inizia con nome e contatti.", "Esigenze di cura, posizione e documenti. Tutto facoltativo.", "Controlla i dati. Puoi ancora tornare indietro e modificarli."],
    next: "Continua", back: "Indietro", edit: "Modifica", progress: "Passaggi",
    required: "Compila questo campo.", empty: "Non indicato", ready: "Pronto da salvare",
    documents: "Documenti", gps: "Posizione GPS",
    personal: "Dati personali", personalHint: "Facoltativo.",
    care: "Cure", careHint: "Priorità e stato delle cure.",
    team: "Équipe di cura", teamHint: "Scegli chi segue questo paziente. Puoi sceglierne più di uno.",
    searchTeam: "Cerca per nome, ruolo, email o provincia", emptyTeam: "Nessuno scelto. Scegli qui sotto.",
    loadingTeam: "Caricamento équipe…", teamError: "Impossibile caricare l'équipe.", retry: "Riprova",
  },
};
