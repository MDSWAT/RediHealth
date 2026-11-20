import type { Lang } from "@/lib/i18n/translations";

export type AiChatCopy = {
  navLabel: string;
  shortLabel: string;
  title: string;
  lead: string;
  metaDescription: string;
  welcome: string;
  inputLabel: string;
  placeholder: string;
  send: string;
  thinking: string;
  newChat: string;
  you: string;
  assistant: string;
  careLevelLabel: string;
  careLevels: Record<"emergency" | "urgent" | "soon" | "routine", string>;
  possibleCause: string;
  questionsHeading: string;
  call112: string;
  emergencyNote: string;
  disclaimer: string;
  tooLong: string;
  voiceOn: string;
  voiceOff: string;
  voiceSpeaking: string;
  stopVoice: string;
  listenReply: string;
  micStart: string;
  micStop: string;
  micListening: string;
  statusReady: string;
  quickPrompts: [string, string, string];
  errors: { generic: string; busy: string; unavailable: string };
};

export const AI_CHAT_MAX_LENGTH = 4000;

export type AiChatChromeCopy = {
  faqButton: string;
  infoButton: string;
  fullscreenEnter: string;
  fullscreenExit: string;
  micDenied: string;
  micNoSpeech: string;
  micUnsupported: string;
  micHint: string;
  extraPrompts: [string, string];
};

export const AI_CHAT_CHROME_COPY: Record<Lang, AiChatChromeCopy> = {
  ro: {
    faqButton: "Întrebări frecvente",
    infoButton: "Informații și siguranță",
    fullscreenEnter: "Ecran complet",
    fullscreenExit: "Ieși din ecran complet",
    micDenied: "Accesul la microfon a fost respins. Permite microfonul din setările browserului.",
    micNoSpeech: "Nu s-a auzit nimic. Apasă microfonul și vorbește clar.",
    micUnsupported: "Dictarea vocală nu este disponibilă în acest browser. Poți scrie mesajul mai jos.",
    micHint: "Vorbește acum… mesajul se trimite automat când te oprești.",
    extraPrompts: [
      "Am tensiunea mare și mă doare capul de azi dimineață",
      "Mă doare stomacul și am greață după masă",
    ],
  },
  en: {
    faqButton: "Common questions",
    infoButton: "Info and safety",
    fullscreenEnter: "Full screen",
    fullscreenExit: "Exit full screen",
    micDenied: "Microphone access was denied. Allow microphone access in your browser settings.",
    micNoSpeech: "No speech was heard. Tap the microphone and speak clearly.",
    micUnsupported: "Voice input is not available in this browser. You can type your message below.",
    micHint: "Speak now… your message sends automatically when you pause.",
    extraPrompts: [
      "My blood pressure is high and I have had a headache since morning",
      "I have stomach pain and nausea after eating",
    ],
  },
  sq: {
    faqButton: "Pyetje të shpeshta",
    infoButton: "Informacion dhe siguri",
    fullscreenEnter: "Ekran i plotë",
    fullscreenExit: "Dil nga ekrani i plotë",
    micDenied: "Qasja në mikrofon u refuzua. Lejo mikrofonin te cilësimet e shfletuesit.",
    micNoSpeech: "Nuk u dëgjua zë. Shtyp mikrofonin dhe fol qartë.",
    micUnsupported: "Shkrimi me zë nuk ofrohet në këtë shfletues. Mund ta shkruash mesazhin më poshtë.",
    micHint: "Fol tani… mesazhi dërgohet automatikisht kur ndalon.",
    extraPrompts: [
      "Kam tension të lartë dhe dhimbje koke që nga mëngjesi",
      "Më dhemb stomaku dhe kam të përziera pas ushqimit",
    ],
  },
  it: {
    faqButton: "Domande frequenti",
    infoButton: "Informazioni e sicurezza",
    fullscreenEnter: "Schermo intero",
    fullscreenExit: "Esci da schermo intero",
    micDenied: "Accesso al microfono negato. Consenti il microfono nelle impostazioni del browser.",
    micNoSpeech: "Non si è sentito nulla. Tocca il microfono e parla chiaramente.",
    micUnsupported: "La dettatura vocale non è disponibile in questo browser. Puoi scrivere qui sotto.",
    micHint: "Parla ora… il messaggio viene inviato automaticamente quando ti fermi.",
    extraPrompts: [
      "Ho la pressione alta e mal di testa da stamattina",
      "Ho mal di stomaco e nausea dopo i pasti",
    ],
  },
  hr: {
    faqButton: "Česta pitanja",
    infoButton: "Informacije i sigurnost",
    fullscreenEnter: "Cijeli zaslon",
    fullscreenExit: "Izađi iz cijelog zaslona",
    micDenied: "Pristup mikrofonu je odbijen. Dopusti mikrofon u postavkama preglednika.",
    micNoSpeech: "Glas nije prepoznat. Dodirni mikrofon i govori jasno.",
    micUnsupported: "Glasovni unos nije dostupan u ovom pregledniku. Možeš upisati poruku ispod.",
    micHint: "Govori sada… poruka se šalje automatski kad staneš.",
    extraPrompts: [
      "Imam visok tlak i glavobolju od jutros",
      "Boli me želudac i imam mučninu nakon jela",
    ],
  },
  rom: {
    faqButton: "Butivar phuchimata",
    infoButton: "Informacia thaj siguripe",
    fullscreenEnter: "Phirdo ekrano",
    fullscreenExit: "Phandav o phirdo ekrano",
    micDenied: "O mikrofono na sas mukhlo. Mukh o mikrofono ande browseroske setimata.",
    micNoSpeech: "Khanchi na ashundilo. Spide o mikrofono thaj vaker lokhes.",
    micUnsupported: "O glasosko lekhavipe nane ande kadava browsero. Shaj te lekhaves tele.",
    micHint: "Vaker akana… o mesazho bichhalel pes korkoro kana achhes.",
    extraPrompts: [
      "Si man baro rat thaj dukhal man o shero de tehara",
      "Dukhal man o per thaj si man gindipe pala xabe",
    ],
  },
  ru: {
    faqButton: "Частые вопросы",
    infoButton: "Информация и безопасность",
    fullscreenEnter: "На весь экран",
    fullscreenExit: "Выйти из полноэкранного режима",
    micDenied: "Доступ к микрофону запрещён. Разрешите микрофон в настройках браузера.",
    micNoSpeech: "Речь не распознана. Нажмите на микрофон и говорите чётко.",
    micUnsupported: "Голосовой ввод недоступен в этом браузере. Вы можете написать сообщение ниже.",
    micHint: "Говорите сейчас… сообщение отправится автоматически, когда вы закончите.",
    extraPrompts: [
      "У меня высокое давление и с утра болит голова",
      "Болит желудок и тошнит после еды",
    ],
  },
};

export const AI_CHAT_COPY: Record<Lang, AiChatCopy> = {
  ro: {
    navLabel: "Asistent AI",
    shortLabel: "IA",
    title: "Asistent AI de sănătate",
    lead: "Scrie ce simți, cu cuvintele tale. Asistentul te ajută să înțelegi cât de grabnic ai nevoie de un medic și ce să-l întrebi.",
    metaDescription: "Scrie ce simți. Asistentul AI te ajută să înțelegi cât de grabnic ai nevoie de un medic și ce să-l întrebi.",
    welcome: "Bună. Spune-mi ce simți și de când. Te ajut să înțelegi cât de grabnic ai nevoie de un medic, dar nu pun diagnostic și nu înlocuiesc medicul.",
    inputLabel: "Scrie ce simți",
    placeholder: "De exemplu: Mă doare gâtul de trei zile și am febră 38",
    send: "Trimite",
    thinking: "Se gândește…",
    newChat: "Conversație nouă",
    you: "Tu",
    assistant: "Asistentul",
    careLevelLabel: "Cât de grabnic",
    careLevels: {
      emergency: "Urgență: sună acum la 112",
      urgent: "Mergi la un medic chiar azi",
      soon: "Mergi la medic în 1-2 zile",
      routine: "Poți face o programare obișnuită",
    },
    possibleCause: "Ce ar putea fi",
    questionsHeading: "Ce să spui sau să întrebi medicul",
    call112: "Sună la 112",
    emergencyNote: "Dacă ai durere în piept, nu poți respira, ai semne de AVC, sângerezi mult sau ești în pericol, sună acum la 112.",
    disclaimer: "Răspunsurile sunt generate de inteligența artificială și pot greși. Nu sunt un diagnostic. Nu scrie numele tău, CNP-ul sau alte date de identificare.",
    tooLong: "Mesajul este prea lung. Scrie mai pe scurt.",
    voiceOn: "Voce pornită",
    voiceOff: "Voce oprită",
    voiceSpeaking: "Asistentul vorbește…",
    stopVoice: "Oprește",
    listenReply: "Ascultă",
    micStart: "Vorbește la microfon",
    micStop: "Oprește microfonul",
    micListening: "Te ascultă…",
    statusReady: "Disponibil acum",
    quickPrompts: [
      "Mă doare gâtul și am febră de 2 zile",
      "Copilul meu tușește noaptea și are nasul înfundat",
      "Mă simt foarte stresat și nu pot dormi",
    ],
    errors: {
      generic: "Nu am putut răspunde acum. Încearcă din nou.",
      busy: "Asistentul este ocupat. Încearcă din nou peste câteva minute.",
      unavailable: "Asistentul nu funcționează acum. Încearcă mai târziu.",
    },
  },
  en: {
    navLabel: "AI assistant",
    shortLabel: "AI",
    title: "AI health assistant",
    lead: "Write what you feel, in your own words. The assistant helps you understand how soon you need a doctor and what to ask.",
    metaDescription: "Write what you feel. The AI assistant helps you understand how soon you need a doctor and what to ask.",
    welcome: "Hello. Tell me what you feel and since when. I can help you understand how soon you need a doctor, but I do not diagnose and I do not replace a doctor.",
    inputLabel: "Write what you feel",
    placeholder: "For example: My throat has hurt for three days and I have a 38 degree fever",
    send: "Send",
    thinking: "Thinking…",
    newChat: "New conversation",
    you: "You",
    assistant: "Assistant",
    careLevelLabel: "How soon",
    careLevels: {
      emergency: "Emergency: call 112 now",
      urgent: "See a doctor today",
      soon: "See a doctor within 1 to 2 days",
      routine: "You can book a regular appointment",
    },
    possibleCause: "What it might be",
    questionsHeading: "What to tell or ask the doctor",
    call112: "Call 112",
    emergencyNote: "If you have chest pain, cannot breathe, have stroke signs, are bleeding heavily or are in danger, call 112 now.",
    disclaimer: "Answers are generated by artificial intelligence and can be wrong. They are not a diagnosis. Do not write your name, ID number or other identifying details.",
    tooLong: "The message is too long. Please write it more briefly.",
    voiceOn: "Voice on",
    voiceOff: "Voice off",
    voiceSpeaking: "Assistant is speaking…",
    stopVoice: "Stop",
    listenReply: "Listen",
    micStart: "Speak with microphone",
    micStop: "Stop microphone",
    micListening: "Listening…",
    statusReady: "Available now",
    quickPrompts: [
      "My throat hurts and I have had a fever for 2 days",
      "My child is coughing at night with a blocked nose",
      "I feel very stressed and cannot sleep",
    ],
    errors: {
      generic: "We could not answer right now. Please try again.",
      busy: "The assistant is busy. Try again in a few minutes.",
      unavailable: "The assistant is not working right now. Try again later.",
    },
  },
  sq: {
    navLabel: "Asistenti AI",
    shortLabel: "AI",
    title: "Asistenti shëndetësor AI",
    lead: "Shkruaj çfarë ndjen, me fjalët e tua. Asistenti të ndihmon të kuptosh sa shpejt të duhet një mjek dhe çfarë ta pyesësh.",
    metaDescription: "Shkruaj çfarë ndjen. Asistenti AI të ndihmon të kuptosh sa shpejt të duhet një mjek dhe çfarë ta pyesësh.",
    welcome: "Përshëndetje. Më trego çfarë ndjen dhe që kur. Të ndihmoj të kuptosh sa shpejt të duhet një mjek, por nuk vendos diagnozë dhe nuk zëvendësoj mjekun.",
    inputLabel: "Shkruaj çfarë ndjen",
    placeholder: "Për shembull: Më dhemb fyti prej tri ditësh dhe kam temperaturë 38",
    send: "Dërgo",
    thinking: "Po mendon…",
    newChat: "Bisedë e re",
    you: "Ti",
    assistant: "Asistenti",
    careLevelLabel: "Sa shpejt",
    careLevels: {
      emergency: "Urgjencë: telefono tani 112",
      urgent: "Shko te mjeku sot",
      soon: "Shko te mjeku brenda 1 deri 2 ditëve",
      routine: "Mund të caktosh një takim të zakonshëm",
    },
    possibleCause: "Çfarë mund të jetë",
    questionsHeading: "Çfarë t'i thuash ose t'i kërkosh mjekut",
    call112: "Telefono 112",
    emergencyNote: "Nëse ke dhimbje gjoksi, nuk merr dot frymë, ke shenja të goditjes në tru, gjakderdhje të fortë ose je në rrezik, telefono tani 112.",
    disclaimer: "Përgjigjet krijohen nga inteligjenca artificiale dhe mund të gabojnë. Nuk janë diagnozë. Mos shkruaj emrin, numrin personal ose të dhëna të tjera identifikuese.",
    tooLong: "Mesazhi është shumë i gjatë. Shkruaje më shkurt.",
    voiceOn: "Zëri i ndezur",
    voiceOff: "Zëri i fikur",
    voiceSpeaking: "Asistenti po flet…",
    stopVoice: "Ndalo",
    listenReply: "Dëgjo",
    micStart: "Fol në mikrofon",
    micStop: "Ndalo mikrofonin",
    micListening: "Po të dëgjon…",
    statusReady: "I disponueshëm tani",
    quickPrompts: [
      "Më dhemb fyti dhe kam temperaturë prej 2 ditësh",
      "Fëmija im kollitet natën dhe ka hundën e zënë",
      "Ndihem shumë i stresuar dhe nuk fle dot",
    ],
    errors: {
      generic: "Nuk mundëm të përgjigjemi tani. Provo përsëri.",
      busy: "Asistenti është i zënë. Provo përsëri pas pak minutash.",
      unavailable: "Asistenti nuk funksionon tani. Provo më vonë.",
    },
  },
  it: {
    navLabel: "Assistente AI",
    shortLabel: "IA",
    title: "Assistente sanitario AI",
    lead: "Scrivi cosa senti, con parole tue. L'assistente ti aiuta a capire quanto presto ti serve un medico e cosa chiedergli.",
    metaDescription: "Scrivi cosa senti. L'assistente AI ti aiuta a capire quanto presto ti serve un medico e cosa chiedergli.",
    welcome: "Ciao. Dimmi cosa senti e da quando. Ti aiuto a capire quanto presto ti serve un medico, ma non faccio diagnosi e non sostituisco il medico.",
    inputLabel: "Scrivi cosa senti",
    placeholder: "Per esempio: Ho mal di gola da tre giorni e ho 38 di febbre",
    send: "Invia",
    thinking: "Sto pensando…",
    newChat: "Nuova conversazione",
    you: "Tu",
    assistant: "Assistente",
    careLevelLabel: "Quanto presto",
    careLevels: {
      emergency: "Emergenza: chiama subito il 112",
      urgent: "Vai da un medico oggi",
      soon: "Vai dal medico entro 1 o 2 giorni",
      routine: "Puoi prenotare una visita normale",
    },
    possibleCause: "Cosa potrebbe essere",
    questionsHeading: "Cosa dire o chiedere al medico",
    call112: "Chiama il 112",
    emergencyNote: "Se hai dolore al petto, non riesci a respirare, hai segni di ictus, sanguini molto o sei in pericolo, chiama subito il 112.",
    disclaimer: "Le risposte sono generate dall'intelligenza artificiale e possono sbagliare. Non sono una diagnosi. Non scrivere il tuo nome, codice fiscale o altri dati identificativi.",
    tooLong: "Il messaggio è troppo lungo. Scrivilo in modo più breve.",
    voiceOn: "Voce attiva",
    voiceOff: "Voce spenta",
    voiceSpeaking: "L'assistente sta parlando…",
    stopVoice: "Ferma",
    listenReply: "Ascolta",
    micStart: "Parla al microfono",
    micStop: "Ferma il microfono",
    micListening: "In ascolto…",
    statusReady: "Disponibile ora",
    quickPrompts: [
      "Ho mal di gola e febbre da 2 giorni",
      "Mio figlio tossisce di notte e ha il naso chiuso",
      "Mi sento molto stressato e non riesco a dormire",
    ],
    errors: {
      generic: "Non siamo riusciti a rispondere ora. Riprova.",
      busy: "L'assistente è occupato. Riprova tra qualche minuto.",
      unavailable: "L'assistente non funziona in questo momento. Riprova più tardi.",
    },
  },
  hr: {
    navLabel: "AI asistent",
    shortLabel: "AI",
    title: "AI zdravstveni asistent",
    lead: "Napiši što osjećaš, svojim riječima. Asistent ti pomaže razumjeti koliko brzo trebaš liječnika i što ga pitati.",
    metaDescription: "Napiši što osjećaš. AI asistent ti pomaže razumjeti koliko brzo trebaš liječnika i što ga pitati.",
    welcome: "Bok. Reci mi što osjećaš i od kada. Pomoći ću ti razumjeti koliko brzo trebaš liječnika, ali ne postavljam dijagnozu i ne zamjenjujem liječnika.",
    inputLabel: "Napiši što osjećaš",
    placeholder: "Na primjer: Grlo me boli tri dana i imam temperaturu 38",
    send: "Pošalji",
    thinking: "Razmišlja…",
    newChat: "Novi razgovor",
    you: "Ti",
    assistant: "Asistent",
    careLevelLabel: "Koliko brzo",
    careLevels: {
      emergency: "Hitno: odmah nazovi 112",
      urgent: "Javi se liječniku danas",
      soon: "Javi se liječniku u 1 do 2 dana",
      routine: "Možeš se naručiti na redovni pregled",
    },
    possibleCause: "Što bi moglo biti",
    questionsHeading: "Što reći ili pitati liječnika",
    call112: "Nazovi 112",
    emergencyNote: "Ako imaš bol u prsima, ne možeš disati, imaš znakove moždanog udara, jako krvariš ili si u opasnosti, odmah nazovi 112.",
    disclaimer: "Odgovore stvara umjetna inteligencija i mogu biti pogrešni. Nisu dijagnoza. Ne upisuj svoje ime, OIB ni druge podatke po kojima te se može prepoznati.",
    tooLong: "Poruka je preduga. Napiši je kraće.",
    voiceOn: "Glas uključen",
    voiceOff: "Glas isključen",
    voiceSpeaking: "Asistent govori…",
    stopVoice: "Zaustavi",
    listenReply: "Poslušaj",
    micStart: "Govori na mikrofon",
    micStop: "Zaustavi mikrofon",
    micListening: "Sluša…",
    statusReady: "Dostupan sada",
    quickPrompts: [
      "Boli me grlo i imam temperaturu 2 dana",
      "Dijete kašlje noću i ima začepljen nos",
      "Osjećam veliki stres i ne mogu spavati",
    ],
    errors: {
      generic: "Trenutno nismo mogli odgovoriti. Pokušaj ponovno.",
      busy: "Asistent je zauzet. Pokušaj ponovno za nekoliko minuta.",
      unavailable: "Asistent trenutno ne radi. Pokušaj kasnije.",
    },
  },
  rom: {
    navLabel: "AI azhutitori",
    shortLabel: "AI",
    title: "AI sastipnasko azhutitori",
    lead: "Lekh so hatyares, tire lavenca. O azhutitori azhutil tut te haljares sar sigo trebul tuke doktori thaj so te puches les.",
    metaDescription: "Lekh so hatyares. O AI azhutitori azhutil tut te haljares sar sigo trebul tuke doktori thaj so te puches les.",
    welcome: "Lashe dyes. Phen mange so hatyares thaj katar kana. Azhutiv tut te haljares sar sigo trebul tuke doktori, numa na thav diagnoza thaj na parudav e doktores.",
    inputLabel: "Lekh so hatyares",
    placeholder: "Sar misal: Dukhal man o kurlo trin dyes thaj si man tatipen 38",
    send: "Bichhal",
    thinking: "Gindil…",
    newChat: "Nevo vorbipen",
    you: "Tu",
    assistant: "O azhutitori",
    careLevelLabel: "Sar sigo",
    careLevels: {
      emergency: "Sigardiari: akhar akana ko 112",
      urgent: "Ja ko doktori adyes",
      soon: "Ja ko doktori ande 1-2 dyes",
      routine: "Shaj keres jekh obishnuime programare",
    },
    possibleCause: "So shaj te avel",
    questionsHeading: "So te phenes vaj te puches e doktores",
    call112: "Akhar ko 112",
    emergencyNote: "Te dukhal tut o kolin, na shaj les phurd, si tut semnura AVC-eske, but rat zhal tutar vaj san ande dandzhera, akhar akana ko 112.",
    disclaimer: "E anglipena keren pe katar i artificialno godyaver buti thaj shaj te aven xohavne. Na si diagnoza. Na lekh tiro anav, CNP vaj aver informacie pala savende shaj te prinzharen tut.",
    tooLong: "O mesazho si but lungo. Lekh les maj skurto.",
    voiceOn: "Glaso puterdo",
    voiceOff: "Glaso achavdo",
    voiceSpeaking: "O azhutitori vakerel…",
    stopVoice: "Achav",
    listenReply: "Ashun",
    micStart: "Vaker ko mikrofono",
    micStop: "Achav o mikrofono",
    micListening: "Ashunel tut…",
    statusReady: "Gata akana",
    quickPrompts: [
      "Dukhal man o kurlo thaj si man tatipen 2 dyes",
      "Miro chavoro khasel ratyate",
      "Hatyarav but streso thaj nashti sovav",
    ],
    errors: {
      generic: "Na dashtiam te anglipenas akana. Zumav palem.",
      busy: "O azhutitori si ande buti. Zumav palem pale nesave minutura.",
      unavailable: "O azhutitori na kerel buti akana. Zumav maj palal.",
    },
  },
  ru: {
    navLabel: "ИИ-помощник",
    shortLabel: "ИИ",
    title: "ИИ-помощник по здоровью",
    lead: "Напишите своими словами, что вы чувствуете. Помощник подскажет, насколько срочно нужен врач и что у него спросить.",
    metaDescription: "Напишите, что вы чувствуете. ИИ-помощник подскажет, насколько срочно нужен врач и что у него спросить.",
    welcome: "Здравствуйте. Расскажите, что вы чувствуете и с какого времени. Я помогу понять, насколько срочно нужен врач, но не ставлю диагноз и не заменяю врача.",
    inputLabel: "Напишите, что вы чувствуете",
    placeholder: "Например: У меня три дня болит горло и температура 38",
    send: "Отправить",
    thinking: "Думает…",
    newChat: "Новый разговор",
    you: "Вы",
    assistant: "Помощник",
    careLevelLabel: "Насколько срочно",
    careLevels: {
      emergency: "Срочно: звоните 112 сейчас",
      urgent: "Обратитесь к врачу сегодня",
      soon: "Обратитесь к врачу в течение 1–2 дней",
      routine: "Можно записаться на обычный приём",
    },
    possibleCause: "Что это может быть",
    questionsHeading: "Что сказать или спросить у врача",
    call112: "Позвонить 112",
    emergencyNote: "Если у вас боль в груди, вам трудно дышать, есть признаки инсульта, сильное кровотечение или вы в опасности, звоните 112 сейчас.",
    disclaimer: "Ответы создаёт искусственный интеллект, и они могут быть ошибочными. Это не диагноз. Не пишите своё имя, номер документа и другие личные данные.",
    tooLong: "Сообщение слишком длинное. Напишите короче.",
    voiceOn: "Голос включён",
    voiceOff: "Голос выключен",
    voiceSpeaking: "Помощник говорит…",
    stopVoice: "Стоп",
    listenReply: "Слушать",
    micStart: "Сказать в микрофон",
    micStop: "Остановить микрофон",
    micListening: "Слушает…",
    statusReady: "Доступен сейчас",
    quickPrompts: [
      "У меня болит горло и температура 2 дня",
      "Ребёнок кашляет ночью и заложен нос",
      "Я сильно нервничаю и не могу уснуть",
    ],
    errors: {
      generic: "Сейчас не удалось ответить. Попробуйте ещё раз.",
      busy: "Помощник занят. Попробуйте через несколько минут.",
      unavailable: "Помощник сейчас не работает. Попробуйте позже.",
    },
  },
};
