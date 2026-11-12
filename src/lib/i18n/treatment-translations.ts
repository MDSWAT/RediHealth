import type { Lang } from "./translations";

type TreatmentCopy = {
  title: string;
  subtitle: string;
  add: string;
  name: string;
  start: string;
  end: string;
  legacy: string;
  newPlan: string;
  empty: string;
  discardPhoto: string;
  delete: string;
  deleteConfirm: string;
  save: string;
  saving: string;
  saved: string;
  invalid: string;
  active: string;
  upcoming: string;
  ended: string;
  undated: string;
  diagnosis: string;
  goals: string;
  medications: string;
  instructions: string;
  photos: string;
  imageError: string;
  uploadError: string;
  pendingPhoto: string;
  clear: string;
};

export const treatmentTranslations: Record<Lang, TreatmentCopy> = {
ru: {
    title: "Планы лечения", subtitle: "Один план на каждый курс лечения. Даты могут пересекаться.",
    add: "Добавить план лечения", name: "Название плана", start: "Дата начала", end: "Дата окончания",
    legacy: "Более ранний план лечения", newPlan: "Новый план лечения", empty: "Планов лечения пока нет.",
    discardPhoto: "Удалить выбранную фотографию? Он еще не прикреплен.",
    delete: "Удалить план", deleteConfirm: "Удалить этот план? Он удаляется при сохранении.",
    save: "Сохранить планы", saving: "Сохранение...", saved: "Планы сохранены.",
    invalid: "Каждому новому плану необходимо имя, дата начала и дата окончания. Дата окончания не может быть раньше даты начала.",
    active: "Активный", upcoming: "Предстоящие", ended: "Закончено", undated: "Нет дат",
    diagnosis: "Диагностика", goals: "Цели ухода", medications: "Лекарства и методы лечения",
    instructions: "Инструкция по уходу", photos: "Вложения", imageError: "Выберите изображение размером до 5 МБ.",
    uploadError: "Не удалось прочитать изображение. Попробуйте еще раз.", pendingPhoto: "Прикрепите или удалите выбранную фотографию перед сохранением.", clear: "Удалить фото",
  },

  en: {
    title: "Treatment plans", subtitle: "One plan for each course of treatment. Dates can overlap.",
    add: "Add treatment plan", name: "Plan name", start: "Start date", end: "End date",
    legacy: "Earlier treatment plan", newPlan: "New treatment plan", empty: "No treatment plans yet.",
    discardPhoto: "Discard the photo you chose? It is not attached yet.",
    delete: "Delete plan", deleteConfirm: "Delete this plan? It is removed when you save.",
    save: "Save plans", saving: "Saving...", saved: "Plans saved.",
    invalid: "Each new plan needs a name, a start date and an end date. The end date cannot be before the start date.",
    active: "Active", upcoming: "Upcoming", ended: "Ended", undated: "No dates",
    diagnosis: "Diagnosis", goals: "Care goals", medications: "Medicines and therapies",
    instructions: "Care instructions", photos: "Attachments", imageError: "Choose an image up to 5 MB.",
    uploadError: "Could not read the image. Try again.", pendingPhoto: "Attach or remove the chosen photo before saving.", clear: "Remove photo",
  },
  ro: {
    title: "Planuri de tratament", subtitle: "Câte un plan pentru fiecare tratament. Perioadele se pot suprapune.",
    add: "Adaugă plan de tratament", name: "Numele planului", start: "Data de început", end: "Data de sfârșit",
    legacy: "Plan de tratament anterior", newPlan: "Plan nou de tratament", empty: "Nu există planuri de tratament încă.",
    discardPhoto: "Renunți la imaginea aleasă? Nu e atașată încă.",
    delete: "Șterge planul", deleteConfirm: "Ștergi acest plan? Se șterge când salvezi.",
    save: "Salvează planurile", saving: "Se salvează...", saved: "Planurile au fost salvate.",
    invalid: "Fiecare plan nou are nevoie de nume, dată de început și dată de sfârșit. Sfârșitul nu poate fi înainte de început.",
    active: "Activ", upcoming: "Urmează", ended: "Încheiat", undated: "Fără date",
    diagnosis: "Diagnostic", goals: "Obiective", medications: "Medicamente și terapii",
    instructions: "Instrucțiuni de îngrijire", photos: "Atașamente", imageError: "Alege o imagine de maximum 5 MB.",
    uploadError: "Imaginea nu a putut fi citită. Încearcă din nou.", pendingPhoto: "Atașează sau șterge imaginea aleasă înainte să salvezi.", clear: "Șterge imaginea",
  },
  sq: {
    title: "Planet e trajtimit", subtitle: "Një plan për çdo trajtim. Datat mund të mbivendosen.",
    add: "Shto plan trajtimi", name: "Emri i planit", start: "Data e fillimit", end: "Data e mbarimit",
    legacy: "Plani i mëparshëm", newPlan: "Plan i ri trajtimi", empty: "Ende nuk ka plane trajtimi.",
    discardPhoto: "Ta heqësh imazhin që zgjodhe? Ende nuk është bashkëngjitur.",
    delete: "Fshi planin", deleteConfirm: "Ta fshish këtë plan? Fshihet kur ruan.",
    save: "Ruaj planet", saving: "Duke ruajtur...", saved: "Planet u ruajtën.",
    invalid: "Çdo plan i ri ka nevojë për emër, datë fillimi dhe datë mbarimi. Mbarimi nuk mund të jetë para fillimit.",
    active: "Aktiv", upcoming: "Në vijim", ended: "Përfunduar", undated: "Pa data",
    diagnosis: "Diagnoza", goals: "Qëllimet", medications: "Ilaçe dhe terapi",
    instructions: "Udhëzimet e kujdesit", photos: "Bashkëngjitje", imageError: "Zgjidh një imazh deri në 5 MB.",
    uploadError: "Imazhi nuk u lexua. Provo përsëri.", pendingPhoto: "Bashkëngjit ose hiq imazhin e zgjedhur para ruajtjes.", clear: "Hiq imazhin",
  },
  it: {
    title: "Piani di trattamento", subtitle: "Un piano per ogni trattamento. Le date possono sovrapporsi.",
    add: "Aggiungi piano", name: "Nome del piano", start: "Data di inizio", end: "Data di fine",
    legacy: "Piano precedente", newPlan: "Nuovo piano", empty: "Ancora nessun piano di trattamento.",
    discardPhoto: "Scartare l'immagine scelta? Non è ancora allegata.",
    delete: "Elimina piano", deleteConfirm: "Eliminare questo piano? Verrà eliminato quando salvi.",
    save: "Salva piani", saving: "Salvataggio...", saved: "Piani salvati.",
    invalid: "Ogni nuovo piano richiede nome, data di inizio e data di fine. La fine non può essere prima dell'inizio.",
    active: "Attivo", upcoming: "In programma", ended: "Terminato", undated: "Senza date",
    diagnosis: "Diagnosi", goals: "Obiettivi", medications: "Farmaci e terapie",
    instructions: "Istruzioni di cura", photos: "Allegati", imageError: "Scegli un'immagine non superiore a 5 MB.",
    uploadError: "Impossibile leggere l'immagine. Riprova.", pendingPhoto: "Allega o rimuovi l'immagine selezionata prima di salvare.", clear: "Rimuovi immagine",
  },
  hr: {
    title: "Planovi liječenja", subtitle: "Jedan plan za svaki ciklus liječenja. Datumi se mogu preklapati.",
    add: "Dodaj plan liječenja", name: "Naziv plana", start: "Datum početka", end: "Datum završetka",
    legacy: "Raniji plan liječenja", newPlan: "Novi plan liječenja", empty: "Još nema planova liječenja.",
    discardPhoto: "Odbaciti odabranu fotografiju? Još nije priložena.",
    delete: "Izbriši plan", deleteConfirm: "Izbrisati ovaj plan? Uklanja se kad spremiš promjene.",
    save: "Spremi planove", saving: "Spremanje...", saved: "Planovi su spremljeni.",
    invalid: "Svaki novi plan mora imati naziv, datum početka i datum završetka. Datum završetka ne može biti prije datuma početka.",
    active: "Aktivan", upcoming: "Nadolazeći", ended: "Završen", undated: "Bez datuma",
    diagnosis: "Dijagnoza", goals: "Ciljevi skrbi", medications: "Lijekovi i terapije",
    instructions: "Upute za njegu", photos: "Privitci", imageError: "Odaberi sliku do 5 MB.",
    uploadError: "Čitanje slike nije uspjelo. Pokušaj ponovno.", pendingPhoto: "Priloži ili ukloni odabranu fotografiju prije spremanja.", clear: "Ukloni fotografiju",
  },
  rom: {
    title: "Planurya tratamenteske", subtitle: "Po ekh plano vash svako tratamento. Le dyesa shaj te nakhen ekh avres.",
    add: "Tho plano tratamentesko", name: "Anav e planosko", start: "Dyes astaripnasko", end: "Dyes agoripnasko",
    legacy: "Angluno plano tratamentesko", newPlan: "Nevo plano tratamentesko", empty: "Inke nay planurya tratamenteske.",
    discardPhoto: "Mekhes o alosardo tasviri? Inke nay phanglo.",
    delete: "Kos o plano", deleteConfirm: "Koses kadava plano? Kosel pes kana arakhes.",
    save: "Arakh le planurya", saving: "Arakhel...", saved: "Le planurya sas arakhle.",
    invalid: "Svako nevo plano mangel anav, dyes astaripnasko thaj dyes agoripnasko. O agor nashti te avel angla o astarimos.",
    active: "Aktivno", upcoming: "Avutno", ended: "Agorime", undated: "Bi dyesengo",
    diagnosis: "Diagnoza", goals: "Resa sastipnaske", medications: "Draba thaj terapiye",
    instructions: "Sikavimata sastipnaske", photos: "Phangle lila", imageError: "Alosar ekh tasviri zhi ko 5 MB.",
    uploadError: "Nashti drabarilo o tasviri. Zumav pale.", pendingPhoto: "Phande vay chude o alosardo tasviri angla te arakhes.", clear: "Chude o tasviri",
  },
};
