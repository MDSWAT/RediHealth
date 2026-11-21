import type { Lang } from "@/lib/i18n/translations";

export type OfflineUiCopy = {
  barMessage: string;
  dismissLabel: string;
  aiOfflineTitle: string;
  aiOfflineBody: string;
  openSymptomCheck: string;
  openGuides: string;
  doctorOfflineNotice: string;
  formOfflineError: string;
};

export const OFFLINE_UI_COPY: Record<Lang, OfflineUiCopy> = {
  ro: {
    barMessage:
      "Ești offline. Ghidurile, verificarea simptomelor, căutarea și clinicile salvate funcționează. Medicul online, asistentul inteligent și vocea de pe server au nevoie de internet.",
    dismissLabel: "Închide",
    aiOfflineTitle: "Asistentul inteligent are nevoie de internet",
    aiOfflineBody:
      "Fără conexiune nu poți trimite întrebări noi și vocea de pe server nu este disponibilă. Poți folosi offline verificarea simptomelor și ghidurile de sănătate.",
    openSymptomCheck: "Verifică simptomele",
    openGuides: "Ghiduri de sănătate",
    doctorOfflineNotice:
      "Ești offline. Apelul video și programarea cu un medic au nevoie de internet. Testul de sunet, ghidurile și farmaciile salvate rămân disponibile.",
    formOfflineError:
      "Ești offline, deci cererea nu poate fi trimisă acum. Datele scrise rămân aici ca să încerci din nou când revine semnalul.",
  },
  en: {
    barMessage:
      "You are offline. Health guides, symptom check, search and saved clinics work offline. Online doctor, chat assistant and server voice need internet.",
    dismissLabel: "Close",
    aiOfflineTitle: "The chat assistant needs an internet connection",
    aiOfflineBody:
      "New questions and server voice playback cannot run without internet. You can still use the symptom check and health guides offline.",
    openSymptomCheck: "Check symptoms",
    openGuides: "Health guides",
    doctorOfflineNotice:
      "You are offline. Video calls and doctor booking require internet access. Your sound test, guides and saved pharmacies remain available.",
    formOfflineError:
      "You are offline, so this form cannot be sent right now. Your details stay on screen so you can try again when your connection returns.",
  },
  sq: {
    barMessage:
      "Je jashtë linje. Udhëzuesit, kontrolli i simptomave, kërkimi dhe klinikat e ruajtura punojnë pa internet. Mjeku online, biseda inteligjente dhe zëri i serverit kërkojnë internet.",
    dismissLabel: "Mbyll",
    aiOfflineTitle: "Asistenti i bisedës ka nevojë për internet",
    aiOfflineBody:
      "Pa lidhje interneti nuk mund të dërgosh pyetje të reja dhe zëri i serverit nuk punon. Mund të përdorësh pa internet kontrollin e simptomave dhe udhëzuesit.",
    openSymptomCheck: "Kontrollo simptomat",
    openGuides: "Udhëzues shëndeti",
    doctorOfflineNotice:
      "Je jashtë linje. Thirrjet me video dhe rezervimi te mjeku kërkojnë internet. Prova e zërit, udhëzuesit dhe farmacitë e ruajtura mbeten të hapura.",
    formOfflineError:
      "Je jashtë linje, ndaj kërkesa nuk dërgohet dot tani. Të dhënat e shkruara mbeten këtu që të provosh përsëri kur të kthehet sinjali.",
  },
  it: {
    barMessage:
      "Sei offline. Guide, controllo dei sintomi, ricerca e cliniche salvate funzionano senza rete. Medico online, chat intelligente e voce dal server richiedono internet.",
    dismissLabel: "Chiudi",
    aiOfflineTitle: "La chat di supporto richiede internet",
    aiOfflineBody:
      "Senza connessione non puoi inviare nuove domande e la voce del server non è disponibile. Puoi usare offline il controllo dei sintomi e le guide.",
    openSymptomCheck: "Controlla i sintomi",
    openGuides: "Guide alla salute",
    doctorOfflineNotice:
      "Sei offline. Le videochiamate e la prenotazione con il medico richiedono internet. Il test audio, le guide e le farmacie salvate restano disponibili.",
    formOfflineError:
      "Sei offline, quindi la richiesta non può essere inviata ora. I dati inseriti restano qui per riprovare quando torna il segnale.",
  },
  hr: {
    barMessage:
      "Izvan mreže si. Vodiči, provjera simptoma, pretraga i spremljene klinike rade bez interneta. Liječnik na mreži, razgovor za pomoć i glas poslužitelja trebaju internet.",
    dismissLabel: "Zatvori",
    aiOfflineTitle: "Razgovor za pomoć treba internetsku vezu",
    aiOfflineBody:
      "Bez interneta nije moguće slati nova pitanja niti koristiti glas poslužitelja. Izvan mreže možeš koristiti provjeru simptoma i zdravstvene vodiče.",
    openSymptomCheck: "Provjeri simptome",
    openGuides: "Zdravstveni vodiči",
    doctorOfflineNotice:
      "Izvan mreže si. Video pozivi i naručivanje kod liječnika zahtijevaju internet. Provjera zvuka, vodiči i spremljene ljekarne i dalje su dostupni.",
    formOfflineError:
      "Izvan mreže si, pa se obrazac trenutačno ne može poslati. Uneseni podaci ostaju na zaslonu kako bi mogao pokušati ponovno kad se vrati signal.",
  },
  rom: {
    barMessage:
      "San bi-internetesko. E gidurya, o dikhipe e simptomengo, o rodipe thaj e garavde klinike keren buchi bi internetesko. O doktori online, o chat thaj o glaso katar o serveri mangen interneto.",
    dismissLabel: "Phandav",
    aiOfflineTitle: "O chat azhutitori mangel interneto",
    aiOfflineBody:
      "Bi internetesko nashtis te bichhales neve pushimata thaj o glaso katar o serveri na kerel buchi. Shaj labares bi internetesko o dikhipe e simptomengo thaj e gidurya.",
    openSymptomCheck: "Dikh che simptome",
    openGuides: "Sastipnaske gidurya",
    doctorOfflineNotice:
      "San bi-internetesko. O video akharipen thaj o programiripe e doktoresa mangen interneto. O zumavipen e avazesko, e gidurya thaj e garavde farmaciye ačhen putarde.",
    formOfflineError:
      "San bi-internetesko, kadaleske o formi nashtil te bichhalel pes akana. Te lava ačhen kathe te zumaves palem kana avel o signalo.",
  },
  ru: {
    barMessage:
      "Вы офлайн. Памятки, проверка симптомов, поиск и сохранённые клиники работают без сети. Врач онлайн, чат-помощник и голос сервера требуют интернет.",
    dismissLabel: "Закрыть",
    aiOfflineTitle: "Чат-помощнику нужен доступ к интернету",
    aiOfflineBody:
      "Без интернета нельзя отправить новые вопросы и недоступен голос сервера. Офлайн вы по-прежнему можете проверить симптомы и открыть памятки.",
    openSymptomCheck: "Проверить симптомы",
    openGuides: "Памятки о здоровье",
    doctorOfflineNotice:
      "Вы офлайн. Видеозвонки и запись к врачу требуют интернет. Проверка звука, памятки и сохранённые аптеки остаются доступными.",
    formOfflineError:
      "Вы офлайн, поэтому форму сейчас нельзя отправить. Введённые данные сохранены на экране, чтобы попробовать снова при появлении связи.",
  },
};

export function getOfflineUiCopy(lang: Lang | string | null | undefined): OfflineUiCopy {
  if (lang && Object.prototype.hasOwnProperty.call(OFFLINE_UI_COPY, lang)) {
    return OFFLINE_UI_COPY[lang as Lang];
  }
  return OFFLINE_UI_COPY.en;
}
