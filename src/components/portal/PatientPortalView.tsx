/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  EditIcon,
  ImageIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  PlusIcon,
  PrinterIcon,
  UserIcon,
} from "@/components/ui/icons";
import { FamilyShareButton } from "@/components/ui/FamilyShareButton";
import { Container } from "@/components/ui/Container";
import { getTreatmentEntries, sortTreatments } from "@/lib/treatments";
import { formatNewsDate } from "@/components/news/news-format";
import type { PatientItem, PatientPriority } from "@/lib/types/patient";
import { followupLabel, sortFollowups } from "@/lib/panel-dates";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { usePatientPortal } from "@/components/portal/usePatientPortal";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { TreatmentPlansView } from "@/components/panel/TreatmentPlansView";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import type { CountryCode } from "@/lib/countries";

interface PatientPortalViewProps {
  initialPatient: PatientItem;
  token: string;
  country: CountryCode;
}

type PortalTab = "home" | "actions" | "plan" | "photos" | "notes";
type PortalAction = "symptoms" | "followups";

const portalTranslations = {
  ru: {
    homeTitle: "Страница вашего здоровья",
    homeIntro: "Выберите, чем вы хотите заниматься.",
    actionSymptomsTitle: "Расскажи нам, как ты себя чувствуешь",
    actionSymptomsHint: "Сообщите своей команде по уходу о новом симптоме или изменении.",
    actionFollowupTitle: "Осмотры",
    actionFollowupHint: "Попросите вашу команду по уходу позвонить вам или записаться на осмотр.",
    actionPlanTitle: "Посмотрите свой план лечения",
    actionPlanHint: "Ваши лекарства и что делать дома.",
    actionPhotosTitle: "Добавить фотографии",
    actionPhotosHint: "Отправьте фотографии или документы вашей команде по уходу.",
    moreOptions: "Подробнее",
    backHome: "Назад",
    contactDetails: "Ваши данные и контакты",
    emergencyTitle: "В чрезвычайной ситуации:",
    emergencyBody:
      "Эта страница предназначена для повседневного общения с вашей командой по уходу. Если чья-то жизнь находится в опасности, позвоните по номеру 112 или обратитесь в ближайшее отделение неотложной помощи.",
    assignedStaff: "Ваша команда по уходу",
    fallbackTeam: "Команда RediHealth",
    phone: "Phone:",
    email: "Email:",
    location: "Место:",
    notSpecified: "Не дано",
    treatmentTitle: "План лечения",
    diagnosis: "Основной диагноз",
    goals: "На что направлено лечение",
    meds: "Лекарства и методы лечения",
    instructions: "Что делать дома",
    attached: "Результаты анализов и рецепты",
    noTreatment:
      "Плана лечения пока нет. Ваша команда по уходу добавит его сюда после того, как увидит вас.",
    symptomsTitle: "Расскажи нам, как ты себя чувствуешь",
    symptomsSaved: "Мы сохранили то, что вы нам сказали. Вашей группе по уходу сообщили об этом.",
    howFeeling: "Как вы себя чувствуете?",
    symptomsPlaceholder:
      "Напишите новые симптомы, насколько сильна боль, побочные эффекты или как вам становится лучше…",
    priorityLevel: "Насколько это срочно",
    priorityCritical: "Очень срочно",
    priorityHigh: "Срочно",
    priorityModerate: "Средний",
    priorityLow: "Могу подождать",
    saving: "Сохранение…",
    updateSymptoms: "Отправить",
    followupsTitle: "Приемы и осмотры",
    requestFollowup: "Попросите пройти обследование",
    followupTitle: "В чем заключается проверка",
    followupTitlePlaceholder: "Осмотр после лечения",
    preferredDate: "Дата, которую вы предпочитаете",
    notes: "Примечания",
    notesPlaceholder: "Когда ты свободен, или вопросы к команде",
    cancel: "Отмена",
    submitting: "Отправка…",
    submitRequest: "Отправить запрос",
    date: "Дата:",
    noFollowups: "Запросов на проверку пока нет. Используйте кнопку выше, чтобы запросить его.",
    photosTitle: "Фотографии и медицинские документы",
    selectImage: "Выберите фотографию",
    photoTitle: "Название фотографии",
    photoTitlePlaceholder: "Фото кожи, результаты анализа крови",
    photoNotesPlaceholder: "Напишите, что изображено на фото.",
    readyPhoto: "Фото готово к отправке",
    uploading: "Загрузка…",
    attachPhoto: "Отправить фото",
    noPhotos: "Фото пока нет.",
    statusScheduled: "Запланировано",
    statusCompleted: "Готово",
    statusCancelled: "Отменено",
    photoPreview: "Фотография, которую вы выбрали",
    actionHint: "Начните здесь, чтобы ваша группа по уходу быстро увидела, что является наиболее неотложным.",
    noNotes: "Никаких других примечаний",
    completeFollowup: "Закрыть проверку",
    completionNotes: "Заключительные замечания",
    completionNotesPlaceholder: "Что произошло на этом осмотре?",
    completionPhotoTitle: "Имя вложения",
    completionPhotoTitlePlaceholder: "Фото или документ с осмотра",
    completionPhotoNote: "Примечание к приложению",
    completionPhotoNotePlaceholder: "Опишите вложение",
    addAttachment: "Добавить вложение",
    attachments: "Вложения",
    markCompleted: "Отметить как выполненное",
    completing: "Закрытие…",
    completedOn: "Готово",
    notesTabTitle: "Ваши заметки",
    noNoteEntries: "Примечаний пока нет.",
    noteFromSymptoms: "Как я себя чувствую",
    noteFromPhoto: "Фото-заметка",
    noteFromFollowup: "Примечание к осмотру",
    noteFromFollowupCompletion: "Проверка закрыта",
    tabs: {
      actions: "Что я могу сделать",
      plan: "План лечения",
      photos: "Фотографии",
      notes: "Примечания",
    },
  },

  en: {
    homeTitle: "Your health page",
    homeIntro: "Choose what you want to do.",
    actionSymptomsTitle: "Tell us how you feel",
    actionSymptomsHint: "Tell your care team about a new symptom or a change.",
    actionFollowupTitle: "Check-ups",
    actionFollowupHint: "Ask your care team to call you or book a check-up.",
    actionPlanTitle: "See your treatment plan",
    actionPlanHint: "Your medicines and what to do at home.",
    actionPhotosTitle: "Add photos",
    actionPhotosHint: "Send photos or documents to your care team.",
    moreOptions: "More",
    backHome: "Back",
    contactDetails: "Your details and contacts",
    emergencyTitle: "In an emergency:",
    emergencyBody:
      "This page is for everyday contact with your care team. If someone's life is in danger, call 112 or go to the nearest A&E.",
    assignedStaff: "Your care team",
    fallbackTeam: "RediHealth care team",
    phone: "Phone:",
    email: "Email:",
    location: "Place:",
    notSpecified: "Not given",
    treatmentTitle: "Treatment plan",
    diagnosis: "Main diagnosis",
    goals: "What the treatment aims for",
    meds: "Medicines and therapies",
    instructions: "What to do at home",
    attached: "Test results and prescriptions",
    noTreatment:
      "There is no treatment plan yet. Your care team will add it here after they see you.",
    symptomsTitle: "Tell us how you feel",
    symptomsSaved: "We saved what you told us. Your care team has been told.",
    howFeeling: "How do you feel?",
    symptomsPlaceholder:
      "Write new symptoms, how bad the pain is, side effects, or how you are getting better…",
    priorityLevel: "How urgent is it",
    priorityCritical: "Very urgent",
    priorityHigh: "Urgent",
    priorityModerate: "Medium",
    priorityLow: "Can wait",
    saving: "Saving…",
    updateSymptoms: "Send",
    followupsTitle: "Appointments and check-ups",
    requestFollowup: "Ask for a check-up",
    followupTitle: "What the check-up is about",
    followupTitlePlaceholder: "Check-up after treatment",
    preferredDate: "Date you prefer",
    notes: "Notes",
    notesPlaceholder: "When you are free, or questions for the team",
    cancel: "Cancel",
    submitting: "Sending…",
    submitRequest: "Send request",
    date: "Date:",
    noFollowups: "No check-up requests yet. Use the button above to ask for one.",
    photosTitle: "Photos and medical documents",
    selectImage: "Choose a photo",
    photoTitle: "Photo name",
    photoTitlePlaceholder: "Skin photo, blood test results",
    photoNotesPlaceholder: "Write what the photo shows",
    readyPhoto: "Photo ready to send",
    uploading: "Uploading…",
    attachPhoto: "Send photo",
    noPhotos: "No photos yet.",
    statusScheduled: "Scheduled",
    statusCompleted: "Done",
    statusCancelled: "Cancelled",
    photoPreview: "Photo you chose",
    actionHint: "Start here so your care team quickly sees what is most urgent.",
    noNotes: "No other notes",
    completeFollowup: "Close check-up",
    completionNotes: "Closing notes",
    completionNotesPlaceholder: "What happened at this check-up?",
    completionPhotoTitle: "Attachment name",
    completionPhotoTitlePlaceholder: "Photo or document from the check-up",
    completionPhotoNote: "Attachment note",
    completionPhotoNotePlaceholder: "Describe the attachment",
    addAttachment: "Add attachment",
    attachments: "Attachments",
    markCompleted: "Mark as done",
    completing: "Closing…",
    completedOn: "Done on",
    notesTabTitle: "Your notes",
    noNoteEntries: "No notes yet.",
    noteFromSymptoms: "How I feel",
    noteFromPhoto: "Photo note",
    noteFromFollowup: "Check-up note",
    noteFromFollowupCompletion: "Check-up closed",
    tabs: {
      actions: "What I can do",
      plan: "Treatment plan",
      photos: "Photos",
      notes: "Notes",
    },
  },
  ro: {
    homeTitle: "Pagina ta de sănătate",
    homeIntro: "Alege ce vrei să faci.",
    actionSymptomsTitle: "Spune-ne cum te simți",
    actionSymptomsHint: "Spune-i echipei medicale dacă ai un simptom nou sau ce s-a schimbat.",
    actionFollowupTitle: "Controale",
    actionFollowupHint: "Cere echipei medicale să te sune sau să-ți facă o programare la control.",
    actionPlanTitle: "Vezi planul de tratament",
    actionPlanHint: "Medicamentele și ce ai de făcut acasă.",
    actionPhotosTitle: "Adaugă poze",
    actionPhotosHint: "Trimite poze sau acte echipei medicale.",
    moreOptions: "Mai mult",
    backHome: "Înapoi",
    contactDetails: "Datele tale și contacte",
    emergencyTitle: "Dacă e o urgență:",
    emergencyBody:
      "Pagina asta e pentru legătura obișnuită cu echipa medicală. Dacă viața cuiva e în pericol, sună la 112 sau mergi la cea mai apropiată Urgență.",
    assignedStaff: "Echipa ta medicală",
    fallbackTeam: "Echipa medicală RediHealth",
    phone: "Telefon:",
    email: "Email:",
    location: "Locul:",
    notSpecified: "Nu e trecut",
    treatmentTitle: "Planul de tratament",
    diagnosis: "Diagnostic principal",
    goals: "Ce urmărește tratamentul",
    meds: "Medicamente și terapii",
    instructions: "Ce ai de făcut acasă",
    attached: "Analize și rețete",
    noTreatment:
      "Încă nu ai un plan de tratament. Echipa medicală îl pune aici după ce te vede.",
    symptomsTitle: "Spune-ne cum te simți",
    symptomsSaved: "Am salvat ce ne-ai spus. Echipa medicală a aflat.",
    howFeeling: "Cum te simți?",
    symptomsPlaceholder:
      "Scrie simptomele noi, cât de tare te doare, ce efecte are tratamentul sau cum îți revii…",
    priorityLevel: "Cât de urgent e",
    priorityCritical: "Foarte urgent",
    priorityHigh: "Urgent",
    priorityModerate: "Mediu",
    priorityLow: "Poate aștepta",
    saving: "Se salvează…",
    updateSymptoms: "Trimite",
    followupsTitle: "Programări și controale",
    requestFollowup: "Cere un control",
    followupTitle: "Despre ce este controlul",
    followupTitlePlaceholder: "Control după tratament",
    preferredDate: "Data preferată",
    notes: "Note",
    notesPlaceholder: "Când ești disponibil sau ce întrebări ai pentru echipă",
    cancel: "Anulează",
    submitting: "Se trimite…",
    submitRequest: "Trimite cererea",
    date: "Data:",
    noFollowups: "Nu ai cerut încă un control. Apasă butonul de mai sus ca să ceri unul.",
    photosTitle: "Poze și acte medicale",
    selectImage: "Alege o poză",
    photoTitle: "Numele pozei",
    photoTitlePlaceholder: "Poză cu pielea, buletin de analize",
    photoNotesPlaceholder: "Scrie ce se vede în poză",
    readyPhoto: "Poza e gata de trimis",
    uploading: "Se încarcă…",
    attachPhoto: "Trimite poza",
    noPhotos: "Nu ai încărcat încă poze.",
    statusScheduled: "Programat",
    statusCompleted: "Făcut",
    statusCancelled: "Anulat",
    photoPreview: "Poza aleasă",
    actionHint: "Începe de aici, ca echipa medicală să vadă repede ce e mai urgent.",
    noNotes: "Fără alte note",
    completeFollowup: "Încheie controlul",
    completionNotes: "Note la încheiere",
    completionNotesPlaceholder: "Ce s-a întâmplat la acest control?",
    completionPhotoTitle: "Numele fișierului",
    completionPhotoTitlePlaceholder: "Poză sau act de la control",
    completionPhotoNote: "Notă la fișier",
    completionPhotoNotePlaceholder: "Ce e în fișier",
    addAttachment: "Adaugă un fișier",
    attachments: "Fișiere",
    markCompleted: "Gata, s-a făcut",
    completing: "Se salvează…",
    completedOn: "Făcut la",
    notesTabTitle: "Notele tale",
    noNoteEntries: "Încă nu ai note.",
    noteFromSymptoms: "Cum mă simt",
    noteFromPhoto: "Notă la poză",
    noteFromFollowup: "Notă la control",
    noteFromFollowupCompletion: "Control încheiat",
    tabs: {
      actions: "Ce pot face",
      plan: "Plan de tratament",
      photos: "Poze",
      notes: "Note",
    },
  },
  sq: {
    homeTitle: "Faqja jote e shëndetit",
    homeIntro: "Zgjidh çfarë do të bësh.",
    actionSymptomsTitle: "Na trego si ndihesh",
    actionSymptomsHint: "Tregoji ekipit mjekësor për një shqetësim të ri ose një ndryshim.",
    actionFollowupTitle: "Kontrollet",
    actionFollowupHint: "Kërko që ekipi mjekësor të të telefonojë ose të caktojë një kontroll.",
    actionPlanTitle: "Shiko planin e trajtimit",
    actionPlanHint: "Ilaçet dhe çfarë duhet të bësh në shtëpi.",
    actionPhotosTitle: "Shto foto",
    actionPhotosHint: "Dërgoji ekipit mjekësor foto ose dokumente.",
    moreOptions: "Më shumë",
    backHome: "Kthehu",
    contactDetails: "Të dhënat e tua dhe kontaktet",
    emergencyTitle: "Në rast urgjence:",
    emergencyBody:
      "Ky portal është për lidhjen e zakonshme me ekipin mjekësor. Nëse jeta e dikujt është në rrezik, telefono 112 ose shko te urgjenca më e afërt.",
    assignedStaff: "Ekipi yt mjekësor",
    fallbackTeam: "Ekipi mjekësor i RediHealth",
    phone: "Telefoni:",
    email: "Email:",
    location: "Vendndodhja:",
    notSpecified: "E pacaktuar",
    treatmentTitle: "Plani i trajtimit",
    diagnosis: "Diagnoza kryesore",
    goals: "Çfarë synon trajtimi",
    meds: "Ilaçe dhe terapi",
    instructions: "Çfarë të bësh në shtëpi",
    attached: "Analiza dhe receta",
    noTreatment:
      "Ende nuk ke plan trajtimi. Ekipi mjekësor do ta vendosë këtu pasi të të shohë.",
    symptomsTitle: "Na trego si ndihesh",
    symptomsSaved: "E ruajtëm atë që na tregove. Ekipi mjekësor u njoftua.",
    howFeeling: "Si ndihesh?",
    symptomsPlaceholder:
      "Shkruaj shqetësimet e reja, sa të dhemb, çfarë efekti ka trajtimi ose si po shërohesh…",
    priorityLevel: "Sa urgjente është",
    priorityCritical: "Shumë urgjente",
    priorityHigh: "Urgjente",
    priorityModerate: "Mesatare",
    priorityLow: "Mund të presë",
    saving: "Po ruhet…",
    updateSymptoms: "Dërgo",
    followupsTitle: "Takime dhe kontrolle",
    requestFollowup: "Kërko një kontroll",
    followupTitle: "Për çfarë është kontrolli",
    followupTitlePlaceholder: "Kontroll pas trajtimit",
    preferredDate: "Data që preferon",
    notes: "Shënime",
    notesPlaceholder: "Kur je i lirë ose çfarë pyetjesh ke për ekipin",
    cancel: "Anulo",
    submitting: "Po dërgohet…",
    submitRequest: "Dërgo kërkesën",
    date: "Data:",
    noFollowups: "Ende nuk ke kërkuar kontroll. Shtyp butonin më lart që të kërkosh një.",
    photosTitle: "Foto dhe dokumente mjekësore",
    selectImage: "Zgjidh një foto",
    photoTitle: "Titulli i fotos",
    photoTitlePlaceholder: "Foto e lëkurës, fletë analizash",
    photoNotesPlaceholder: "Shkruaj çfarë shihet në foto",
    readyPhoto: "Fotoja është gati për t'u dërguar",
    uploading: "Po ngarkohet…",
    attachPhoto: "Dërgo foton",
    noPhotos: "Ende nuk ke ngarkuar foto.",
    statusScheduled: "I caktuar",
    statusCompleted: "U bë",
    statusCancelled: "I anuluar",
    photoPreview: "Fotoja që zgjodhe",
    actionHint: "Fillo këtu, që ekipi mjekësor të shohë shpejt çfarë është më urgjente.",
    noNotes: "Pa shënime të tjera",
    completeFollowup: "Mbyll kontrollin",
    completionNotes: "Shënime në mbyllje",
    completionNotesPlaceholder: "Çfarë ndodhi në këtë kontroll?",
    completionPhotoTitle: "Emri i skedarit",
    completionPhotoTitlePlaceholder: "Foto ose dokument nga kontrolli",
    completionPhotoNote: "Shënim për skedarin",
    completionPhotoNotePlaceholder: "Çfarë ka në skedar",
    addAttachment: "Shto skedar",
    attachments: "Skedarë",
    markCompleted: "U bë",
    completing: "Po ruhet…",
    completedOn: "Bërë më",
    notesTabTitle: "Shënimet e tua",
    noNoteEntries: "Ende nuk ka shënime.",
    noteFromSymptoms: "Si ndihem",
    noteFromPhoto: "Shënim për foton",
    noteFromFollowup: "Shënim për kontrollin",
    noteFromFollowupCompletion: "Kontroll i mbyllur",
    tabs: {
      actions: "Çfarë mund të bëj",
      plan: "Plani i trajtimit",
      photos: "Foto",
      notes: "Shënime",
    },
  },
  it: {
    homeTitle: "La tua pagina della salute",
    homeIntro: "Scegli cosa vuoi fare.",
    actionSymptomsTitle: "Dicci come ti senti",
    actionSymptomsHint: "Racconta al team sanitario un sintomo nuovo o cosa è cambiato.",
    actionFollowupTitle: "Controlli",
    actionFollowupHint: "Chiedi al team sanitario di chiamarti o di fissare un controllo.",
    actionPlanTitle: "Vedi il piano di cura",
    actionPlanHint: "Le medicine e cosa fare a casa.",
    actionPhotosTitle: "Aggiungi foto",
    actionPhotosHint: "Manda foto o documenti al team sanitario.",
    moreOptions: "Altro",
    backHome: "Indietro",
    contactDetails: "I tuoi dati e i contatti",
    emergencyTitle: "In caso di emergenza:",
    emergencyBody:
      "Questo portale serve per il contatto abituale con il team sanitario. Se la vita di qualcuno è in pericolo, chiama il 112 o vai al pronto soccorso più vicino.",
    assignedStaff: "Il team sanitario che ti segue",
    fallbackTeam: "Team sanitario RediHealth",
    phone: "Telefono:",
    email: "Email:",
    location: "Luogo:",
    notSpecified: "Non indicato",
    treatmentTitle: "Piano di cura",
    diagnosis: "Diagnosi principale",
    goals: "A cosa serve la cura",
    meds: "Medicine e terapie",
    instructions: "Cosa fare a casa",
    attached: "Esami e ricette",
    noTreatment:
      "Non hai ancora un piano di cura. Il team sanitario lo metterà qui dopo averti visto.",
    symptomsTitle: "Dicci come ti senti",
    symptomsSaved: "Abbiamo salvato quello che ci hai scritto. Il team sanitario lo sa.",
    howFeeling: "Come ti senti?",
    symptomsPlaceholder:
      "Scrivi i nuovi sintomi, quanto è forte il dolore, effetti della cura o come procede la guarigione…",
    priorityLevel: "Quanto è urgente",
    priorityCritical: "Molto urgente",
    priorityHigh: "Urgente",
    priorityModerate: "Medio",
    priorityLow: "Può aspettare",
    saving: "Salvo…",
    updateSymptoms: "Invia",
    followupsTitle: "Appuntamenti e controlli",
    requestFollowup: "Chiedi un controllo",
    followupTitle: "Motivo del controllo",
    followupTitlePlaceholder: "Controllo dopo la cura",
    preferredDate: "Data preferita",
    notes: "Note",
    notesPlaceholder: "Quando sei disponibile o che domande hai per il team",
    cancel: "Annulla",
    submitting: "Invio…",
    submitRequest: "Invia la richiesta",
    date: "Data:",
    noFollowups: "Non hai ancora chiesto un controllo. Premi il pulsante qui sopra per chiederne uno.",
    photosTitle: "Foto e documenti medici",
    selectImage: "Scegli una foto",
    photoTitle: "Nome della foto",
    photoTitlePlaceholder: "Foto della pelle, risultati degli esami",
    photoNotesPlaceholder: "Scrivi cosa si vede nella foto",
    readyPhoto: "Foto pronta da inviare",
    uploading: "Caricamento…",
    attachPhoto: "Invia la foto",
    noPhotos: "Non hai ancora caricato foto.",
    statusScheduled: "In programma",
    statusCompleted: "Fatto",
    statusCancelled: "Annullato",
    photoPreview: "La foto che hai scelto",
    actionHint: "Inizia da qui, così il team sanitario vede subito cosa è più urgente.",
    noNotes: "Nessun'altra nota",
    completeFollowup: "Chiudi il controllo",
    completionNotes: "Note di chiusura",
    completionNotesPlaceholder: "Cosa è successo in questo controllo?",
    completionPhotoTitle: "Nome dell'allegato",
    completionPhotoTitlePlaceholder: "Foto o documento del controllo",
    completionPhotoNote: "Nota sull'allegato",
    completionPhotoNotePlaceholder: "Cosa c'è nell'allegato",
    addAttachment: "Aggiungi allegato",
    attachments: "Allegati",
    markCompleted: "Fatto",
    completing: "Salvo…",
    completedOn: "Fatto il",
    notesTabTitle: "Le tue note",
    noNoteEntries: "Ancora nessuna nota.",
    noteFromSymptoms: "Come mi sento",
    noteFromPhoto: "Nota sulla foto",
    noteFromFollowup: "Nota sul controllo",
    noteFromFollowupCompletion: "Controllo chiuso",
    tabs: {
      actions: "Cosa posso fare",
      plan: "Piano di cura",
      photos: "Foto",
      notes: "Note",
    },
  },
  hr: {
    homeTitle: "Tvoja zdravstvena stranica",
    homeIntro: "Odaberi što želiš učiniti.",
    actionSymptomsTitle: "Napiši nam kako se osjećaš",
    actionSymptomsHint: "Javi svojem zdravstvenom timu o novom simptomu ili promjeni.",
    actionFollowupTitle: "Kontrolni pregledi",
    actionFollowupHint: "Zatraži da te zdravstveni tim nazove ili dogovori kontrolni pregled.",
    actionPlanTitle: "Pogledaj plan liječenja",
    actionPlanHint: "Tvoji lijekovi i upute za oporavak kod kuće.",
    actionPhotosTitle: "Dodaj fotografije",
    actionPhotosHint: "Pošalji fotografije ili dokumente svojem zdravstvenom timu.",
    moreOptions: "Više",
    backHome: "Natrag",
    contactDetails: "Tvoji podatci i kontakti",
    emergencyTitle: "U hitnom slučaju:",
    emergencyBody:
      "Ova stranica služi za redoviti kontakt sa zdravstvenim timom. Ako je nečiji život u opasnosti, nazovi 112 ili otiđi na najbliži hitni prijem.",
    assignedStaff: "Tvoj zdravstveni tim",
    fallbackTeam: "Zdravstveni tim RediHealth",
    phone: "Telefon:",
    email: "E-pošta:",
    location: "Mjesto:",
    notSpecified: "Nije navedeno",
    treatmentTitle: "Plan liječenja",
    diagnosis: "Glavna dijagnoza",
    goals: "Ciljevi liječenja",
    meds: "Lijekovi i terapije",
    instructions: "Upute za kod kuće",
    attached: "Nalazi i recepti",
    noTreatment:
      "Još nema plana liječenja. Tvoj zdravstveni tim dodat će ga ovdje nakon pregleda.",
    symptomsTitle: "Napiši nam kako se osjećaš",
    symptomsSaved: "Spremili smo tvoju poruku. Zdravstveni tim je obaviješten.",
    howFeeling: "Kako se osjećaš?",
    symptomsPlaceholder:
      "Opiši nove simptome, jačinu boli, nuspojave lijekova ili tijek oporavka…",
    priorityLevel: "Koliko je hitno",
    priorityCritical: "Vrlo hitno",
    priorityHigh: "Hitno",
    priorityModerate: "Umjereno",
    priorityLow: "Može pričekati",
    saving: "Spremanje…",
    updateSymptoms: "Pošalji",
    followupsTitle: "Termini i kontrolni pregledi",
    requestFollowup: "Zatraži kontrolni pregled",
    followupTitle: "Razlog kontrolnog pregleda",
    followupTitlePlaceholder: "Kontrolni pregled nakon liječenja",
    preferredDate: "Željeni datum",
    notes: "Bilješke",
    notesPlaceholder: "Kada ti odgovara ili koja pitanja imaš za tim",
    cancel: "Odustani",
    submitting: "Slanje…",
    submitRequest: "Pošalji zahtjev",
    date: "Datum:",
    noFollowups: "Još nema zahtjeva za kontrolni pregled. Pritisni gumb iznad kako bi ga zatražio.",
    photosTitle: "Fotografije i medicinska dokumentacija",
    selectImage: "Odaberi fotografiju",
    photoTitle: "Naziv fotografije",
    photoTitlePlaceholder: "Fotografija kože, nalaz krvi",
    photoNotesPlaceholder: "Napiši što se vidi na fotografiji",
    readyPhoto: "Fotografija spremna za slanje",
    uploading: "Učitavanje…",
    attachPhoto: "Pošalji fotografiju",
    noPhotos: "Još nema učitanih fotografija.",
    statusScheduled: "Zakazano",
    statusCompleted: "Obavljeno",
    statusCancelled: "Otkazano",
    photoPreview: "Odabrana fotografija",
    actionHint: "Kreni odavde kako bi zdravstveni tim odmah vidio što je najhitnije.",
    noNotes: "Nema dodatnih bilješki",
    completeFollowup: "Zatvori kontrolni pregled",
    completionNotes: "Završne bilješke",
    completionNotesPlaceholder: "Što je dogovoreno na ovom kontrolnom pregledu?",
    completionPhotoTitle: "Naziv priloga",
    completionPhotoTitlePlaceholder: "Fotografija ili dokument s kontrolnog pregleda",
    completionPhotoNote: "Bilješka uz prilog",
    completionPhotoNotePlaceholder: "Opiši prilog",
    addAttachment: "Dodaj prilog",
    attachments: "Prilozi",
    markCompleted: "Označi obavljenim",
    completing: "Spremanje…",
    completedOn: "Obavljeno",
    notesTabTitle: "Tvoje bilješke",
    noNoteEntries: "Još nema bilješki.",
    noteFromSymptoms: "Kako se osjećam",
    noteFromPhoto: "Bilješka uz fotografiju",
    noteFromFollowup: "Bilješka uz kontrolni pregled",
    noteFromFollowupCompletion: "Kontrolni pregled zatvoren",
    tabs: {
      actions: "Što mogu učiniti",
      plan: "Plan liječenja",
      photos: "Fotografije",
      notes: "Bilješke",
    },
  },
  rom: {
    homeTitle: "Chi sastipnaski rig",
    homeIntro: "Alosar so kames te keres.",
    actionSymptomsTitle: "Phen amenge sar xatyarav tu",
    actionSymptomsHint: "Phen che sastipnaske timoske vash nevo simptomo vay paruvipe.",
    actionFollowupTitle: "Kontrole thaj vizite",
    actionFollowupHint: "Mang katar o sastipnasko timo te marel tuke telefono vay te thol kontrola.",
    actionPlanTitle: "Dikh o plano tratamentesko",
    actionPlanHint: "Che draba (medikamente) thaj e sikavimata vash khere.",
    actionPhotosTitle: "Tho poze",
    actionPhotosHint: "Bichhal poze vay dokumenturya che sastipnaske timoske.",
    moreOptions: "May but",
    backHome: "Palpale",
    contactDetails: "Che date thaj kontakturya",
    emergencyTitle: "Kana si sigo pharipe (urjenca):",
    emergencyBody:
      "Kadi rig si vash sakodivesko svato e sastipnaske timosa. Te si varekasko trajo ande dar, mar telefono pe 112 vay zha ko nay-pashutno sigo zhutipen.",
    assignedStaff: "Cho sastipnasko timo",
    fallbackTeam: "Sastipnasko timo RediHealth",
    phone: "Telefon:",
    email: "Emailo:",
    location: "Than:",
    notSpecified: "Nane phendo",
    treatmentTitle: "Plano tratamentesko",
    diagnosis: "Angluni diagnoza",
    goals: "So rodel o tratamento",
    meds: "Draba (medikamente) thaj terapiye",
    instructions: "Sikavimata vash khere",
    attached: "Analize thaj recepte",
    noTreatment:
      "Inke nane plano tratamentesko. Cho sastipnasko timo ka thol les kathe kana ka dikhel tut.",
    symptomsTitle: "Phen amenge sar xatyarav tu",
    symptomsSaved: "Arakhadyam so lekhavdyan. O sastipnasko timo zhanel.",
    howFeeling: "Sar xatyares tut?",
    symptomsPlaceholder:
      "Lekhav neve simptome, kobor zurali si e dukh, efekturya katar e draba vay sar sastyos…",
    priorityLevel: "Kobor sigo si",
    priorityCritical: "But sigo",
    priorityHigh: "Sigo",
    priorityModerate: "Mashkarutno",
    priorityLow: "Shay te azhukerel",
    saving: "Arakhel pes…",
    updateSymptoms: "Bichhal",
    followupsTitle: "Vrame thaj kontrole",
    requestFollowup: "Mang kontrola",
    followupTitle: "Soske manges e kontrola",
    followupTitlePlaceholder: "Kontrola palo tratamento",
    preferredDate: "Kamli data",
    notes: "Noturya",
    notesPlaceholder: "Kana si tut vrama vay so pučhimata si tut vash o timo",
    cancel: "Mekh",
    submitting: "Bichhalel pes…",
    submitRequest: "Bichhal o mangipe",
    date: "Data:",
    noFollowups: "Inke na manglyan kontrola. Dikh o butono opral te manges ekh.",
    photosTitle: "Poze thaj sastipnaske lila",
    selectImage: "Alosar poza",
    photoTitle: "Anav e pozako",
    photoTitlePlaceholder: "Poza e morchaki, rezultato e ratesko",
    photoNotesPlaceholder: "Lekhav so dikhlyol pe poza",
    readyPhoto: "Poza gata vash bichhalipe",
    uploading: "Vazdel pes…",
    attachPhoto: "Bichhal e poza",
    noPhotos: "Inke na vazdinyan poze.",
    statusScheduled: "Thodino",
    statusCompleted: "Kerdino",
    statusCancelled: "Mekhlo",
    photoPreview: "Alosardi poza",
    actionHint: "Nach kathe te dikhel o sastipnasko timo sigo so si nay-sigo.",
    noNotes: "Nane aver noturya",
    completeFollowup: "Phand e kontrola",
    completionNotes: "Agorutne noturya",
    completionNotesPlaceholder: "So kerdili pe kadi kontrola?",
    completionPhotoTitle: "Anav e dokumentesko",
    completionPhotoTitlePlaceholder: "Poza vay lil katar e kontrola",
    completionPhotoNote: "Nota vash o dokumento",
    completionPhotoNotePlaceholder: "Phen so si and-o dokumento",
    addAttachment: "Tho dokumento",
    attachments: "Dokumenturya",
    markCompleted: "Semnisar sar kerdino",
    completing: "Arakhel pes…",
    completedOn: "Kerdino pe",
    notesTabTitle: "Che noturya",
    noNoteEntries: "Inke nane noturya.",
    noteFromSymptoms: "Sar xatyarav man",
    noteFromPhoto: "Nota pe poza",
    noteFromFollowup: "Nota pe kontrola",
    noteFromFollowupCompletion: "Kontrola phandili",
    tabs: {
      actions: "So shay te kerav",
      plan: "Plano tratamentesko",
      photos: "Poze",
      notes: "Noturya",
    },
  },
} satisfies Record<Lang, Record<string, unknown>>;

const labelClass = "mb-1.5 block text-sm font-semibold text-foreground";
const fieldClass =
  "w-full rounded-lg border border-border-control bg-background text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";
const fileClass =
  "w-full text-sm text-foreground file:mr-3 file:min-h-[40px] file:rounded-lg file:border-0 file:bg-muted file:px-3 file:text-sm file:font-semibold file:text-foreground hover:file:bg-muted/70";
const primaryButton =
  "press-solid inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg bg-sapphire px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";
const secondaryButton =
  "press-row inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg border border-border-control bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground";

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <h2 className="mb-2 text-balance text-lg font-semibold text-foreground">
      {title}
      {count !== undefined ? <span className="ml-2 font-normal text-muted-foreground tabular-nums">{count}</span> : null}
    </h2>
  );
}

export function PatientPortalView({
  initialPatient,
  token,
  country,
}: PatientPortalViewProps) {
  const { lang } = useLanguage();
  const t = portalTranslations[lang];
  const [activeTab, setActiveTab] = useState<PortalTab>("home");
  const [activeAction, setActiveAction] = useState<PortalAction>("symptoms");
  const { patient, errorMessage, symptoms, followup, photo } =
    usePatientPortal({ initialPatient, token, country });
  const sortedFollowups = useMemo(
    () => sortFollowups(patient.followups || []),
    [patient.followups],
  );
  const notesLog = useMemo(() => {
    const entries: Array<{ id: string; date: string; title: string; text: string }> = [];

    if (patient.condition_notes?.trim()) {
      entries.push({
        id: `symptoms-${patient.id}`,
        date: new Date().toISOString().slice(0, 10),
        title: t.noteFromSymptoms,
        text: patient.condition_notes,
      });
    }

    for (const photoEntry of patient.photos || []) {
      if (photoEntry.notes?.trim()) {
        entries.push({
          id: `photo-${photoEntry.id}`,
          date: photoEntry.date,
          title: t.noteFromPhoto,
          text: photoEntry.notes,
        });
      }
    }

    for (const followupEntry of patient.followups || []) {
      if (followupEntry.notes?.trim()) {
        entries.push({
          id: `followup-${followupEntry.id}`,
          date: followupEntry.date,
          title: t.noteFromFollowup,
          text: followupEntry.notes,
        });
      }

      if (followupEntry.completion_notes?.trim()) {
        entries.push({
          id: `followup-complete-${followupEntry.id}`,
          date: followupEntry.completed_at || followupEntry.date,
          title: t.noteFromFollowupCompletion,
          text: followupEntry.completion_notes,
        });
      }

      for (const completionPhoto of followupEntry.completion_photos || []) {
        if (completionPhoto.notes?.trim()) {
          entries.push({
            id: `followup-photo-${completionPhoto.id}`,
            date: completionPhoto.date,
            title: t.noteFromFollowupCompletion,
            text: completionPhoto.notes,
          });
        }
      }
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [patient, t.noteFromFollowup, t.noteFromFollowupCompletion, t.noteFromPhoto, t.noteFromSymptoms]);

  const {
    text: symptomsText,
    setText: setSymptomsText,
    priority: selectedPriority,
    setPriority: setSelectedPriority,
    isSaving: isSavingSymptoms,
    savedMessage: symptomsSavedMsg,
    submit: handleUpdateSymptoms,
  } = symptoms;

  const {
    showForm: showAddFollowup,
    setShowForm: setShowAddFollowup,
    title: newFollowupTitle,
    setTitle: setNewFollowupTitle,
    date: newFollowupDate,
    setDate: setNewFollowupDate,
    notes: newFollowupNotes,
    setNotes: setNewFollowupNotes,
    isSaving: isSavingFollowup,
    submit: handleAddFollowup,
    completingId: completingFollowupId,
    completionNotes,
    setCompletionNotes,
    completionPhotoName,
    setCompletionPhotoName,
    completionPhotoNote,
    setCompletionPhotoNote,
    completionPhotoData,
    completionPhotos,
    openCompletionForm,
    closeCompletionForm,
    onCompletionPhotoFileChange: handleCompletionPhotoFileChange,
    addCompletionPhotoDraft,
    removeCompletionPhotoDraft,
    completeSubmit: handleCompleteFollowup,
    isSavingCompletion,
  } = followup;

  const {
    name: newPhotoName,
    setName: setNewPhotoName,
    note: newPhotoNote,
    setNote: setNewPhotoNote,
    data: newPhotoData,
    isSaving: isSavingPhoto,
    onFileChange: handlePhotoFileChange,
    submit: handleUploadPhoto,
  } = photo;

  const fmtDate = (value?: string | null) => (value ? formatNewsDate(value, lang) : "");
  const statusLabel = (status: string) =>
    status === "completed" ? t.statusCompleted : status === "cancelled" ? t.statusCancelled : t.statusScheduled;
  const homeActions = [
    { key: "symptoms", Icon: BellIcon, title: t.actionSymptomsTitle, hint: t.actionSymptomsHint, onClick: () => { setActiveAction("symptoms"); setActiveTab("actions"); } },
    { key: "followups", Icon: CalendarIcon, title: t.actionFollowupTitle, hint: t.actionFollowupHint, onClick: () => { setActiveAction("followups"); setShowAddFollowup(true); setActiveTab("actions"); } },
    { key: "plan", Icon: EditIcon, title: t.actionPlanTitle, hint: t.actionPlanHint, onClick: () => setActiveTab("plan") },
    { key: "photos", Icon: ImageIcon, title: t.actionPhotosTitle, hint: t.actionPhotosHint, onClick: () => setActiveTab("photos") },
    { key: "notes", Icon: EditIcon, title: t.tabs.notes, hint: t.notesTabTitle, onClick: () => setActiveTab("notes") },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-background py-6 sm:py-10">
      <Container>
        {/* Calm, always-visible reminder: this page is not for emergencies. */}
        <p className="mb-4 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          <PhoneIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <strong className="font-semibold text-foreground">{t.emergencyTitle}</strong> {t.emergencyBody}
          </span>
        </p>

        <article className="overflow-hidden rounded-xl border border-border bg-card">
          <header className="border-b border-border px-4 py-5 sm:px-8 sm:py-6">
            {activeTab !== "home" ? (
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className="press-row -ml-2 mb-3 inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeftIcon className="h-4 w-4 shrink-0" />
                {t.backHome}
              </button>
            ) : null}

            <h1 className="text-balance text-page text-foreground">{patient.full_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.homeTitle}</p>

            <details className="group mt-4 border-t border-border pt-3">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                <ChevronRightIcon aria-hidden="true" className="h-4 w-4 text-muted-foreground transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-open:rotate-90 motion-reduce:transition-none" />
                {t.contactDetails}
              </summary>
              <dl className="mt-2 grid gap-x-6 gap-y-2 pb-1 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <PhoneIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t.phone}</dt>
                  <dd className="font-medium text-foreground tabular-nums">{patient.phone}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t.email}</dt>
                  <dd className="break-all font-medium text-foreground">{patient.email}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <PinIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t.location}</dt>
                  <dd className="break-words font-medium text-foreground">{patient.address || t.notSpecified}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <dt className="text-muted-foreground">{t.assignedStaff}:</dt>
                  <dd className="font-medium text-foreground">{patient.assigned_worker_name || t.fallbackTeam}</dd>
                </div>
              </dl>
            </details>
          </header>

          {errorMessage ? (
            <p role="alert" className="flex items-start gap-2 border-b border-amber-care-border bg-amber-care-soft/40 px-4 py-3 text-sm font-medium text-foreground dark:bg-amber-care/10 sm:px-8">
              <AlertCircleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
              <span>{errorMessage}</span>
            </p>
          ) : null}

          {activeTab === "home" ? (
            <section aria-label={t.homeIntro} className="px-4 py-5 sm:px-8 sm:py-6">
              <p className="text-sm text-muted-foreground">{t.homeIntro}</p>
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {homeActions.map(({ key, Icon, title, hint, onClick }) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={onClick}
                      className="press-row group flex min-h-[64px] w-full items-center gap-4 px-1 py-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-sapphire" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-foreground">{title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{hint}</span>
                      </span>
                      <ChevronRightIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {activeTab === "actions" && activeAction === "symptoms" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <SectionTitle title={t.symptomsTitle} />
              <p className="mb-4 text-sm text-muted-foreground">{t.actionHint}</p>

              {symptomsSavedMsg ? (
                <p role="status" className="mb-4 flex items-center gap-2 text-sm text-foreground">
                  <CheckCircleIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-sapphire" />
                  <span>{t.symptomsSaved}</span>
                </p>
              ) : null}

              <form onSubmit={handleUpdateSymptoms} className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <label htmlFor="portal-symptoms" className={labelClass}>{t.howFeeling}</label>
                  <textarea
                    id="portal-symptoms"
                    rows={5}
                    value={symptomsText}
                    onChange={(e) => setSymptomsText(e.target.value)}
                    placeholder={t.symptomsPlaceholder}
                    className={`${fieldClass} p-3`}
                  />
                </div>

                <div>
                  <label htmlFor="portal-priority" className={labelClass}>{t.priorityLevel}</label>
                  <select
                    id="portal-priority"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as PatientPriority)}
                    className={`${fieldClass} min-h-[44px] px-3`}
                  >
                    <option value="critical">{t.priorityCritical}</option>
                    <option value="high">{t.priorityHigh}</option>
                    <option value="moderate">{t.priorityModerate}</option>
                    <option value="low">{t.priorityLow}</option>
                  </select>
                </div>

                <div>
                  <button type="submit" disabled={isSavingSymptoms} className={`${primaryButton} w-full sm:w-auto`}>
                    {isSavingSymptoms ? t.saving : t.updateSymptoms}
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {activeTab === "actions" && activeAction === "followups" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle title={t.followupsTitle} count={sortedFollowups.length} />
                <button
                  type="button"
                  aria-expanded={showAddFollowup}
                  onClick={() => setShowAddFollowup(!showAddFollowup)}
                  className={`${primaryButton} w-full gap-1.5 sm:w-auto`}
                >
                  <PlusIcon aria-hidden="true" className="h-4 w-4" />
                  <span>{t.requestFollowup}</span>
                </button>
              </div>

              {showAddFollowup ? (
                <form onSubmit={handleAddFollowup} className="mb-6 grid grid-cols-1 gap-4 border-y border-border py-5 text-sm">
                  <div>
                    <label htmlFor="portal-followup-title" className={labelClass}>{t.followupTitle}</label>
                    <input
                      id="portal-followup-title"
                      type="text"
                      required
                      value={newFollowupTitle}
                      onChange={(e) => setNewFollowupTitle(e.target.value)}
                      placeholder={t.followupTitlePlaceholder}
                      className={`${fieldClass} min-h-[44px] px-3`}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="portal-followup-date" className={labelClass}>{t.preferredDate}</label>
                      <input
                        id="portal-followup-date"
                        type="date"
                        required
                        value={newFollowupDate}
                        onChange={(e) => setNewFollowupDate(e.target.value)}
                        className={`${fieldClass} min-h-[44px] px-3`}
                      />
                    </div>
                    <div>
                      <label htmlFor="portal-followup-notes" className={labelClass}>{t.notes}</label>
                      <input
                        id="portal-followup-notes"
                        type="text"
                        value={newFollowupNotes}
                        onChange={(e) => setNewFollowupNotes(e.target.value)}
                        placeholder={t.notesPlaceholder}
                        className={`${fieldClass} min-h-[44px] px-3`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <button type="button" onClick={() => setShowAddFollowup(false)} className={secondaryButton}>
                      {t.cancel}
                    </button>
                    <button type="submit" disabled={isSavingFollowup} className={primaryButton}>
                      {isSavingFollowup ? t.submitting : t.submitRequest}
                    </button>
                  </div>
                </form>
              ) : null}

              {sortedFollowups.length > 0 ? (
                <ul className="divide-y divide-border border-y border-border">
                  {sortedFollowups.map((item) => (
                    <li key={item.id} className="py-4 text-sm">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <ClockIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{item.title}</p>
                            <p className="text-muted-foreground">
                              {t.date} <span className="font-medium text-foreground tabular-nums">{followupLabel(item, langToLocale[lang], crmTranslations[lang].allDay)}</span>
                            </p>
                            <p className="break-words text-muted-foreground">{item.notes || t.noNotes}</p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex w-fit shrink-0 text-xs font-semibold ${
                            item.status === "completed" ? "text-sapphire dark:text-sapphire-border" : "text-muted-foreground"
                          }`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </div>

                      {item.status !== "completed" ? (
                        <div className="mt-3 pl-7">
                          {completingFollowupId === item.id ? (
                            <form onSubmit={handleCompleteFollowup} className="grid grid-cols-1 gap-4">
                              <div>
                                <label htmlFor={`portal-complete-notes-${item.id}`} className={labelClass}>{t.completionNotes}</label>
                                <textarea
                                  id={`portal-complete-notes-${item.id}`}
                                  rows={3}
                                  value={completionNotes}
                                  onChange={(e) => setCompletionNotes(e.target.value)}
                                  placeholder={t.completionNotesPlaceholder}
                                  className={`${fieldClass} p-3`}
                                />
                              </div>

                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                  <label htmlFor={`portal-complete-name-${item.id}`} className={labelClass}>{t.completionPhotoTitle}</label>
                                  <input
                                    id={`portal-complete-name-${item.id}`}
                                    type="text"
                                    value={completionPhotoName}
                                    onChange={(e) => setCompletionPhotoName(e.target.value)}
                                    placeholder={t.completionPhotoTitlePlaceholder}
                                    className={`${fieldClass} min-h-[44px] px-3`}
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`portal-complete-note-${item.id}`} className={labelClass}>{t.completionPhotoNote}</label>
                                  <input
                                    id={`portal-complete-note-${item.id}`}
                                    type="text"
                                    value={completionPhotoNote}
                                    onChange={(e) => setCompletionPhotoNote(e.target.value)}
                                    placeholder={t.completionPhotoNotePlaceholder}
                                    className={`${fieldClass} min-h-[44px] px-3`}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  aria-label={t.completionPhotoTitle}
                                  onChange={handleCompletionPhotoFileChange}
                                  className={fileClass}
                                />
                                <button type="button" disabled={!completionPhotoData} onClick={addCompletionPhotoDraft} className={secondaryButton}>
                                  {t.addAttachment}
                                </button>
                              </div>

                              {completionPhotos.length > 0 ? (
                                <div>
                                  <p className="mb-1 text-sm font-semibold text-foreground">{t.attachments}</p>
                                  <ul className="divide-y divide-border rounded-lg border border-border">
                                    {completionPhotos.map((photoItem) => (
                                      <li key={photoItem.id} className="flex items-center justify-between gap-3 px-3 py-1 text-sm">
                                        <span className="truncate text-foreground">{photoItem.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => removeCompletionPhotoDraft(photoItem.id)}
                                          className="press-row min-h-[44px] shrink-0 whitespace-nowrap rounded-sm px-1 font-medium text-sapphire underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:underline dark:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                          {t.cancel}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}

                              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button type="button" onClick={closeCompletionForm} className={secondaryButton}>
                                  {t.cancel}
                                </button>
                                <button type="submit" disabled={isSavingCompletion} className={primaryButton}>
                                  {isSavingCompletion ? t.completing : t.markCompleted}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button type="button" onClick={() => openCompletionForm(item.id)} className={secondaryButton}>
                              {t.completeFollowup}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 pl-7 text-sm text-muted-foreground">
                          {item.completed_at ? <p className="tabular-nums">{`${t.completedOn} ${fmtDate(item.completed_at)}`}</p> : null}
                          {item.completion_notes ? <p className="mt-1 break-words text-foreground">{item.completion_notes}</p> : null}
                          {item.completion_photos && item.completion_photos.length > 0 ? (
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                              {item.completion_photos.map((photoItem) => (
                                <figure key={photoItem.id} className="overflow-hidden rounded-lg border border-border bg-card">
                                  <img src={photoItem.data_url} alt={photoItem.name} className="h-16 w-full object-cover" />
                                  <figcaption className="truncate px-2 py-1 text-xs text-foreground">{photoItem.name}</figcaption>
                                </figure>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noFollowups}</p>
              )}
            </section>
          ) : null}

          {activeTab === "plan" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <SectionTitle title={treatmentTranslations[lang].title} />
              {(() => {
                const planEntries = sortTreatments(getTreatmentEntries(patient.treatment_plan));
                if (planEntries.length === 0) return null;
                const planLabels: Record<Lang, { print: string }> = {
                  ro: { print: "Tipărește planul" },
                  en: { print: "Print plan" },
                  sq: { print: "Printo planin" },
                  it: { print: "Stampa il piano" },
                  hr: { print: "Ispiši plan" },
                  rom: { print: "Printirisar o plano" },
                  ru: { print: "Распечатать план" },
                };
                const planShareText = planEntries
                  .map((entry) =>
                    [
                      entry.title || treatmentTranslations[lang].legacy,
                      entry.medications,
                      entry.care_instructions,
                    ]
                      .filter(Boolean)
                      .join("\n")
                  )
                  .join("\n\n");
                return (
                  <div className="mb-4 flex flex-nowrap items-center gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="press-row inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-border-control bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <PrinterIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{planLabels[lang]?.print ?? planLabels.ro.print}</span>
                    </button>
                    <FamilyShareButton
                      iconOnly
                      align="right"
                      lang={lang}
                      title={treatmentTranslations[lang].title}
                      text={planShareText}
                    />
                  </div>
                );
              })()}
              <TreatmentPlansView plan={patient.treatment_plan} />
            </section>
          ) : null}

          {activeTab === "photos" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <SectionTitle title={t.photosTitle} count={patient.photos?.length || 0} />

              <form onSubmit={handleUploadPhoto} className="mb-6 grid grid-cols-1 gap-4 border-y border-border py-5 text-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="portal-photo-file" className={labelClass}>{t.selectImage}</label>
                    <input id="portal-photo-file" type="file" accept="image/*" onChange={handlePhotoFileChange} className={fileClass} />
                  </div>
                  <div>
                    <label htmlFor="portal-photo-name" className={labelClass}>{t.photoTitle}</label>
                    <input
                      id="portal-photo-name"
                      type="text"
                      value={newPhotoName}
                      onChange={(e) => setNewPhotoName(e.target.value)}
                      placeholder={t.photoTitlePlaceholder}
                      className={`${fieldClass} min-h-[44px] px-3`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="portal-photo-note" className={labelClass}>{t.notes}</label>
                  <input
                    id="portal-photo-note"
                    type="text"
                    value={newPhotoNote}
                    onChange={(e) => setNewPhotoNote(e.target.value)}
                    placeholder={t.photoNotesPlaceholder}
                    className={`${fieldClass} min-h-[44px] px-3`}
                  />
                </div>

                {newPhotoData ? (
                  <div className="flex items-center gap-3">
                    <img src={newPhotoData} alt={t.photoPreview} className="h-12 w-12 rounded-md border border-border object-cover" />
                    <span className="text-sm font-medium text-foreground">{t.readyPhoto}</span>
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button type="submit" disabled={!newPhotoData || isSavingPhoto} className={`${primaryButton} w-full sm:w-auto`}>
                    {isSavingPhoto ? t.uploading : t.attachPhoto}
                  </button>
                </div>
              </form>

              {patient.photos && patient.photos.length > 0 ? (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {patient.photos.map((item) => (
                    <li key={item.id} className="overflow-hidden rounded-lg border border-border bg-card">
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        <img src={item.data_url} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-2 text-xs">
                        <p className="truncate font-semibold text-foreground" title={item.name}>{item.name}</p>
                        <p className="text-muted-foreground tabular-nums">{fmtDate(item.date)}</p>
                        {item.notes ? <p className="mt-1 text-muted-foreground">{item.notes}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noPhotos}</p>
              )}
            </section>
          ) : null}

          {activeTab === "notes" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <SectionTitle title={t.notesTabTitle} />

              {notesLog.length > 0 ? (
                <ul className="divide-y divide-border border-y border-border">
                  {notesLog.map((entry) => (
                    <li key={entry.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                        <p className="shrink-0 text-xs text-muted-foreground tabular-nums">{fmtDate(entry.date)}</p>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{entry.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noNoteEntries}</p>
              )}
            </section>
          ) : null}
        </article>
      </Container>
    </main>
  );
}
