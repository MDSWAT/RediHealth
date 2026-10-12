import type { Lang } from "@/lib/i18n/translations";

export type InstitutesAdminCopy = {
  navLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  noDatabase: string;
  searchPlaceholder: string;
  allCountries: string;
  allCategories: string;
  statusAll: string;
  statusActive: string;
  statusHidden: string;
  add: string;
  importTitle: string;
  importHelp: string;
  importButton: (country: string) => string;
  importing: string;
  importConfirm: (country: string) => string;
  importDone: (count: number, country: string) => string;
  importFailed: string;
  total: (count: number) => string;
  activeOf: (active: number, total: number) => string;
  colName: string;
  colType: string;
  colLocation: string;
  colPhone: string;
  colSource: string;
  colStatus: string;
  colActions: string;
  sourceManual: string;
  sourceOsm: string;
  editedBadge: string;
  active: string;
  hidden: string;
  edit: string;
  hide: string;
  show: string;
  delete: string;
  deleteConfirm: (name: string) => string;
  deleteOsmConfirm: (name: string) => string;
  noEntries: string;
  loading: string;
  previous: string;
  next: string;
  pageOf: (page: number, pages: number) => string;
  formAddTitle: string;
  formEditTitle: string;
  fieldName: string;
  fieldCountry: string;
  fieldCategory: string;
  fieldCity: string;
  fieldAddress: string;
  fieldPhone: string;
  fieldWebsite: string;
  fieldHours: string;
  fieldHoursHint: string;
  fieldEmergency: string;
  fieldActive: string;
  fieldLat: string;
  fieldLng: string;
  mapPickHint: string;
  save: string;
  saving: string;
  cancel: string;
  saveFailed: string;
};

export const institutesAdminTranslations: Record<Lang, InstitutesAdminCopy> = {
  en: {
    navLabel: "Medical institutes",
    eyebrow: "Super admin",
    title: "Medical institutes",
    subtitle: "Manage the places shown on the public Find help map for Romania, Albania and Italy.",
    noDatabase: "The database is not available. Check the MySQL configuration and apply migration 007.",
    searchPlaceholder: "Search name, city, address, phone",
    allCountries: "All countries",
    allCategories: "All types",
    statusAll: "All statuses",
    statusActive: "Visible",
    statusHidden: "Hidden",
    add: "Add institute",
    importTitle: "Import from OpenStreetMap",
    importHelp: "Downloads every hospital, clinic, doctor, dentist and pharmacy for a country from OpenStreetMap (free). Entries you edited by hand are never overwritten. It can take a few minutes.",
    importButton: (country) => `Import ${country}`,
    importing: "Importing…",
    importConfirm: (country) => `Import or refresh all medical institutes in ${country} from OpenStreetMap? This can take a few minutes.`,
    importDone: (count, country) => `${count} institutes imported for ${country}.`,
    importFailed: "The import failed. The OpenStreetMap server may be busy, please try again later.",
    total: (count) => `${count} results`,
    activeOf: (active, total) => `${active} visible / ${total}`,
    colName: "Name",
    colType: "Type",
    colLocation: "Location",
    colPhone: "Phone",
    colSource: "Source",
    colStatus: "Status",
    colActions: "Actions",
    sourceManual: "Manual",
    sourceOsm: "OpenStreetMap",
    editedBadge: "edited",
    active: "Visible",
    hidden: "Hidden",
    edit: "Edit",
    hide: "Hide",
    show: "Show",
    delete: "Delete",
    deleteConfirm: (name) => `Delete “${name}” permanently?`,
    deleteOsmConfirm: (name) => `“${name}” was imported from OpenStreetMap. It will be hidden (not deleted) so a re-import does not bring it back. Continue?`,
    noEntries: "No medical institutes found.",
    loading: "Loading…",
    previous: "Previous",
    next: "Next",
    pageOf: (page, pages) => `Page ${page} of ${pages}`,
    formAddTitle: "Add medical institute",
    formEditTitle: "Edit medical institute",
    fieldName: "Name",
    fieldCountry: "Country",
    fieldCategory: "Type",
    fieldCity: "City",
    fieldAddress: "Address",
    fieldPhone: "Phone",
    fieldWebsite: "Website",
    fieldHours: "Opening hours",
    fieldHoursHint: "e.g. 24/7 or Mo-Fr 08:00-20:00",
    fieldEmergency: "Has an emergency department",
    fieldActive: "Visible on the public map",
    fieldLat: "Latitude",
    fieldLng: "Longitude",
    mapPickHint: "Click on the map to set the exact location.",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    saveFailed: "Could not save. Please check the fields and try again.",
  },
  ro: {
    navLabel: "Instituții medicale",
    eyebrow: "Super admin",
    title: "Instituții medicale",
    subtitle: "Gestionează locurile afișate pe harta publică „Găsește ajutor” pentru România, Albania și Italia.",
    noDatabase: "Baza de date nu este disponibilă. Verifică configurarea MySQL și aplică migrarea 007.",
    searchPlaceholder: "Caută nume, oraș, adresă, telefon",
    allCountries: "Toate țările",
    allCategories: "Toate tipurile",
    statusAll: "Toate statusurile",
    statusActive: "Vizibile",
    statusHidden: "Ascunse",
    add: "Adaugă instituție",
    importTitle: "Import din OpenStreetMap",
    importHelp: "Descarcă toate spitalele, clinicile, medicii, stomatologii și farmaciile dintr-o țară din OpenStreetMap (gratuit). Intrările editate manual nu sunt suprascrise. Poate dura câteva minute.",
    importButton: (country) => `Importă ${country}`,
    importing: "Se importă…",
    importConfirm: (country) => `Imporți sau actualizezi toate instituțiile medicale din ${country} din OpenStreetMap? Poate dura câteva minute.`,
    importDone: (count, country) => `${count} instituții importate pentru ${country}.`,
    importFailed: "Importul a eșuat. Serverul OpenStreetMap poate fi ocupat, încearcă din nou mai târziu.",
    total: (count) => `${count} rezultate`,
    activeOf: (active, total) => `${active} vizibile / ${total}`,
    colName: "Nume",
    colType: "Tip",
    colLocation: "Locație",
    colPhone: "Telefon",
    colSource: "Sursă",
    colStatus: "Status",
    colActions: "Acțiuni",
    sourceManual: "Manual",
    sourceOsm: "OpenStreetMap",
    editedBadge: "editat",
    active: "Vizibil",
    hidden: "Ascuns",
    edit: "Editează",
    hide: "Ascunde",
    show: "Afișează",
    delete: "Șterge",
    deleteConfirm: (name) => `Ștergi definitiv „${name}”?`,
    deleteOsmConfirm: (name) => `„${name}” a fost importat din OpenStreetMap. Va fi ascuns (nu șters), ca un nou import să nu îl readucă. Continui?`,
    noEntries: "Nu s-au găsit instituții medicale.",
    loading: "Se încarcă…",
    previous: "Înapoi",
    next: "Înainte",
    pageOf: (page, pages) => `Pagina ${page} din ${pages}`,
    formAddTitle: "Adaugă instituție medicală",
    formEditTitle: "Editează instituția medicală",
    fieldName: "Nume",
    fieldCountry: "Țară",
    fieldCategory: "Tip",
    fieldCity: "Oraș",
    fieldAddress: "Adresă",
    fieldPhone: "Telefon",
    fieldWebsite: "Site web",
    fieldHours: "Program",
    fieldHoursHint: "ex. 24/7 sau Mo-Fr 08:00-20:00",
    fieldEmergency: "Are secție de urgențe",
    fieldActive: "Vizibil pe harta publică",
    fieldLat: "Latitudine",
    fieldLng: "Longitudine",
    mapPickHint: "Fă clic pe hartă pentru a seta locația exactă.",
    save: "Salvează",
    saving: "Se salvează…",
    cancel: "Anulează",
    saveFailed: "Nu s-a putut salva. Verifică câmpurile și încearcă din nou.",
  },
  sq: {
    navLabel: "Institucionet shëndetësore",
    eyebrow: "Super admin",
    title: "Institucionet shëndetësore",
    subtitle: "Menaxho vendet që shfaqen në hartën publike për Rumaninë, Shqipërinë dhe Italinë.",
    noDatabase: "Baza e të dhënave nuk është e disponueshme. Kontrollo konfigurimin MySQL dhe apliko migrimin 007.",
    searchPlaceholder: "Kërko emër, qytet, adresë, telefon",
    allCountries: "Të gjitha shtetet",
    allCategories: "Të gjitha llojet",
    statusAll: "Të gjitha statuset",
    statusActive: "Të dukshme",
    statusHidden: "Të fshehura",
    add: "Shto institucion",
    importTitle: "Importo nga OpenStreetMap",
    importHelp: "Shkarkon të gjitha spitalet, klinikat, mjekët, dentistët dhe farmacitë e një shteti nga OpenStreetMap (falas). Hyrjet e ndryshuara manualisht nuk mbishkruhen. Mund të zgjasë disa minuta.",
    importButton: (country) => `Importo ${country}`,
    importing: "Duke importuar…",
    importConfirm: (country) => `Të importohen ose përditësohen të gjitha institucionet shëndetësore në ${country} nga OpenStreetMap? Mund të zgjasë disa minuta.`,
    importDone: (count, country) => `${count} institucione u importuan për ${country}.`,
    importFailed: "Importi dështoi. Serveri i OpenStreetMap mund të jetë i zënë, provo më vonë.",
    total: (count) => `${count} rezultate`,
    activeOf: (active, total) => `${active} të dukshme / ${total}`,
    colName: "Emri",
    colType: "Lloji",
    colLocation: "Vendndodhja",
    colPhone: "Telefoni",
    colSource: "Burimi",
    colStatus: "Statusi",
    colActions: "Veprime",
    sourceManual: "Manual",
    sourceOsm: "OpenStreetMap",
    editedBadge: "ndryshuar",
    active: "I dukshëm",
    hidden: "I fshehur",
    edit: "Ndrysho",
    hide: "Fshih",
    show: "Shfaq",
    delete: "Fshi",
    deleteConfirm: (name) => `Të fshihet përgjithmonë “${name}”?`,
    deleteOsmConfirm: (name) => `“${name}” u importua nga OpenStreetMap. Do të fshihet nga harta (jo nga baza), që një import i ri të mos e rikthejë. Vazhdo?`,
    noEntries: "Nuk u gjetën institucione shëndetësore.",
    loading: "Duke ngarkuar…",
    previous: "Mbrapa",
    next: "Para",
    pageOf: (page, pages) => `Faqja ${page} nga ${pages}`,
    formAddTitle: "Shto institucion shëndetësor",
    formEditTitle: "Ndrysho institucionin shëndetësor",
    fieldName: "Emri",
    fieldCountry: "Shteti",
    fieldCategory: "Lloji",
    fieldCity: "Qyteti",
    fieldAddress: "Adresa",
    fieldPhone: "Telefoni",
    fieldWebsite: "Faqja web",
    fieldHours: "Orari",
    fieldHoursHint: "p.sh. 24/7 ose Mo-Fr 08:00-20:00",
    fieldEmergency: "Ka repart urgjence",
    fieldActive: "I dukshëm në hartën publike",
    fieldLat: "Gjerësia gjeografike",
    fieldLng: "Gjatësia gjeografike",
    mapPickHint: "Kliko në hartë për të vendosur vendndodhjen e saktë.",
    save: "Ruaj",
    saving: "Duke ruajtur…",
    cancel: "Anulo",
    saveFailed: "Nuk u ruajt. Kontrollo fushat dhe provo përsëri.",
  },
  it: {
    navLabel: "Strutture sanitarie",
    eyebrow: "Super admin",
    title: "Strutture sanitarie",
    subtitle: "Gestisci le strutture mostrate sulla mappa pubblica per Romania, Albania e Italia.",
    noDatabase: "Il database non è disponibile. Controlla la configurazione MySQL e applica la migrazione 007.",
    searchPlaceholder: "Cerca nome, città, indirizzo, telefono",
    allCountries: "Tutti i paesi",
    allCategories: "Tutti i tipi",
    statusAll: "Tutti gli stati",
    statusActive: "Visibili",
    statusHidden: "Nascoste",
    add: "Aggiungi struttura",
    importTitle: "Importa da OpenStreetMap",
    importHelp: "Scarica tutti gli ospedali, cliniche, medici, dentisti e farmacie di un paese da OpenStreetMap (gratuito). Le voci modificate manualmente non vengono sovrascritte. Può richiedere alcuni minuti.",
    importButton: (country) => `Importa ${country}`,
    importing: "Importazione…",
    importConfirm: (country) => `Importare o aggiornare tutte le strutture sanitarie in ${country} da OpenStreetMap? Può richiedere alcuni minuti.`,
    importDone: (count, country) => `${count} strutture importate per ${country}.`,
    importFailed: "Importazione non riuscita. Il server OpenStreetMap potrebbe essere occupato, riprova più tardi.",
    total: (count) => `${count} risultati`,
    activeOf: (active, total) => `${active} visibili / ${total}`,
    colName: "Nome",
    colType: "Tipo",
    colLocation: "Posizione",
    colPhone: "Telefono",
    colSource: "Fonte",
    colStatus: "Stato",
    colActions: "Azioni",
    sourceManual: "Manuale",
    sourceOsm: "OpenStreetMap",
    editedBadge: "modificata",
    active: "Visibile",
    hidden: "Nascosta",
    edit: "Modifica",
    hide: "Nascondi",
    show: "Mostra",
    delete: "Elimina",
    deleteConfirm: (name) => `Eliminare definitivamente “${name}”?`,
    deleteOsmConfirm: (name) => `“${name}” è stata importata da OpenStreetMap. Verrà nascosta (non eliminata) così una nuova importazione non la ripristina. Continuare?`,
    noEntries: "Nessuna struttura sanitaria trovata.",
    loading: "Caricamento…",
    previous: "Precedente",
    next: "Successiva",
    pageOf: (page, pages) => `Pagina ${page} di ${pages}`,
    formAddTitle: "Aggiungi struttura sanitaria",
    formEditTitle: "Modifica struttura sanitaria",
    fieldName: "Nome",
    fieldCountry: "Paese",
    fieldCategory: "Tipo",
    fieldCity: "Città",
    fieldAddress: "Indirizzo",
    fieldPhone: "Telefono",
    fieldWebsite: "Sito web",
    fieldHours: "Orari",
    fieldHoursHint: "es. 24/7 oppure Mo-Fr 08:00-20:00",
    fieldEmergency: "Ha il pronto soccorso",
    fieldActive: "Visibile sulla mappa pubblica",
    fieldLat: "Latitudine",
    fieldLng: "Longitudine",
    mapPickHint: "Clicca sulla mappa per impostare la posizione esatta.",
    save: "Salva",
    saving: "Salvataggio…",
    cancel: "Annulla",
    saveFailed: "Impossibile salvare. Controlla i campi e riprova.",
  },
};
