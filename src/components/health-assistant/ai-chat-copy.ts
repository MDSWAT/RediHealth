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
  safety: {
    abuseWarning: string;
    blockedTitle: string;
    blockedBody: string;
    blockedUntilPrefix: string;
    dailyLimitTitle: string;
    dailyLimitBody: string;
    dailyLimitResetPrefix: string;
    useOtherTools: string;
    symptomCheckerLink: string;
    healthGuidesLink: string;
  };
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
    navLabel: "Asistent IA",
    shortLabel: "IA",
    title: "Asistent medical IA",
    lead: "Întreabă despre termeni medicali, simptome sau informațiile de pe RediHealth. Asistentul te ajută să înțelegi cât de grabnic ai nevoie de un medic și ce să-l întrebi.",
    metaDescription: "Întreabă despre termeni medicali, simptome sau platforma RediHealth. Asistentul IA răspunde doar la întrebări medicale și despre platformă.",
    welcome: "Bună. Răspund doar la întrebări despre termeni medicali, sănătate și informațiile de pe RediHealth. Întreabă-mă despre un simptom, un termen medical sau cum folosești platforma. Nu pun diagnostic și nu înlocuiesc medicul.",
    inputLabel: "Întreabă despre sănătate, termeni medicali sau RediHealth",
    placeholder: "De exemplu: Ce înseamnă hemoglobină? Sau: Mă doare gâtul și am febră 38",
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
    disclaimer: "Asistentul răspunde doar la întrebări despre termeni medicali, sănătate și platforma RediHealth. Răspunsurile sunt generate de inteligența artificială și nu sunt un diagnostic. Nu scrie numele tău, CNP-ul sau alte date personale.",
    tooLong: "Mesajul este prea lung. Scrie mai pe scurt.",
    voiceOn: "Voce pornită",
    voiceOff: "Voce oprită",
    voiceSpeaking: "Asistentul vorbește…",
    stopVoice: "Oprește",
    listenReply: "Ascultă",
    micStart: "Vorbește la microfon",
    micStop: "Oprește microfonul",
    micListening: "Te ascultă…",
    statusReady: "Termeni medicali și RediHealth",
    quickPrompts: [
      "Ce înseamnă tensiune arterială mare?",
      "Mă doare gâtul și am febră de 2 zile",
      "Cum cer ajutorul unui mediator sanitar pe RediHealth?",
    ],
    errors: {
      generic: "Nu am putut răspunde acum. Încearcă din nou.",
      busy: "Asistentul este ocupat. Încearcă din nou peste câteva minute.",
      unavailable: "Asistentul nu funcționează acum. Încearcă mai târziu.",
    },
    safety: {
      abuseWarning:
        "Mesajul a fost oprit. Păstrează un limbaj respectuos și folosește asistentul doar pentru întrebări medicale. Repetarea blochează asistentul pe acest dispozitiv timp de 72 de ore.",
      blockedTitle: "Asistentul IA este blocat temporar pe acest dispozitiv",
      blockedBody:
        "Conversația a fost oprită și asistentul IA a fost dezactivat timp de 72 de ore din cauza limbajului nepotrivit sau a utilizării abuzive.",
      blockedUntilPrefix: "Disponibil din nou după:",
      dailyLimitTitle: "Limita zilnică pentru asistentul IA a fost atinsă",
      dailyLimitBody:
        "Acest dispozitiv a atins limita zilnică de utilizare pentru asistentul IA.",
      dailyLimitResetPrefix: "Se resetează după:",
      useOtherTools:
        "Poți folosi în continuare verificarea simptomelor și ghidurile medicale fără restricții.",
      symptomCheckerLink: "Verifică simptomele",
      healthGuidesLink: "Ghiduri de sănătate",
    },
  },
  en: {
    navLabel: "AI assistant",
    shortLabel: "AI",
    title: "Medical AI assistant",
    lead: "Ask about medical terms, symptoms, or information on RediHealth. The assistant helps you understand health terms, platform tools, and how soon to see a doctor.",
    metaDescription: "Ask about medical terms, symptoms, or RediHealth information. The AI assistant only answers medical and platform questions.",
    welcome: "Hello. I only answer questions about medical terms, health, and information on RediHealth. Ask me about a symptom, a medical term, or how to use the platform. I do not diagnose and I do not replace a doctor.",
    inputLabel: "Ask about health, medical terms, or RediHealth",
    placeholder: "For example: What does hemoglobin mean? Or: My throat hurts and I have a fever",
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
    disclaimer: "This assistant only answers questions about medical terms, health, and RediHealth information. Answers are generated by artificial intelligence and are not a diagnosis. Do not share your name, ID number, or personal details.",
    tooLong: "The message is too long. Please write it more briefly.",
    voiceOn: "Voice on",
    voiceOff: "Voice off",
    voiceSpeaking: "Assistant is speaking…",
    stopVoice: "Stop",
    listenReply: "Listen",
    micStart: "Speak with microphone",
    micStop: "Stop microphone",
    micListening: "Listening…",
    statusReady: "Medical terms and RediHealth",
    quickPrompts: [
      "What does high blood pressure mean?",
      "My throat hurts and I have had a fever for 2 days",
      "How can a health mediator on RediHealth help me?",
    ],
    errors: {
      generic: "We could not answer right now. Please try again.",
      busy: "The assistant is busy. Try again in a few minutes.",
      unavailable: "The assistant is not working right now. Try again later.",
    },
    safety: {
      abuseWarning:
        "Message interrupted. Please keep your language respectful and use the assistant only for health questions. Repeated abuse disables the assistant on this device for 72 hours.",
      blockedTitle: "AI assistant disabled on this device",
      blockedBody:
        "This conversation was interrupted and the AI assistant has been blocked for 72 hours due to abusive language or misuse.",
      blockedUntilPrefix: "Available again after:",
      dailyLimitTitle: "Daily AI assistant limit reached",
      dailyLimitBody:
        "This device has reached its daily token allowance for the AI assistant.",
      dailyLimitResetPrefix: "Resets after:",
      useOtherTools:
        "You can still use the symptom checker and health guides normally.",
      symptomCheckerLink: "Check symptoms",
      healthGuidesLink: "Health guides",
    },
  },
  sq: {
    navLabel: "Asistenti IA",
    shortLabel: "IA",
    title: "Asistenti mjekësor IA",
    lead: "Pyet për terma mjekësorë, simptoma ose informacionet në RediHealth. Asistenti të ndihmon të kuptosh termat shëndetësorë, mjetet e platformës dhe sa shpejt të duhet një mjek.",
    metaDescription: "Pyet për terma mjekësorë, simptoma ose platformën RediHealth. Asistenti IA përgjigjet vetëm për shëndetin dhe platformën.",
    welcome: "Përshëndetje. Përgjigjem vetëm për pyetje mbi terma mjekësorë, shëndetin dhe informacionet në RediHealth. Më pyet për një simptomë, një term mjekësor ose si ta përdorësh platformën. Nuk vendos diagnozë dhe nuk zëvendësoj mjekun.",
    inputLabel: "Pyet për shëndetin, terma mjekësorë ose RediHealth",
    placeholder: "Për shembull: Çfarë do të thotë hemoglobinë? Ose: Më dhemb fyti dhe kam temperaturë",
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
    disclaimer: "Asistenti përgjigjet vetëm për pyetje mbi terma mjekësorë, shëndetin dhe platformën RediHealth. Përgjigjet krijohen nga inteligjenca artificiale dhe nuk janë diagnozë. Mos shkruaj emrin ose të dhëna personale.",
    tooLong: "Mesazhi është shumë i gjatë. Shkruaje më shkurt.",
    voiceOn: "Zëri i ndezur",
    voiceOff: "Zëri i fikur",
    voiceSpeaking: "Asistenti po flet…",
    stopVoice: "Ndalo",
    listenReply: "Dëgjo",
    micStart: "Fol në mikrofon",
    micStop: "Ndalo mikrofonin",
    micListening: "Po të dëgjon…",
    statusReady: "Terma mjekësorë dhe RediHealth",
    quickPrompts: [
      "Çfarë do të thotë tension i lartë i gjakut?",
      "Më dhemb fyti dhe kam temperaturë prej 2 ditësh",
      "Si mund të më ndihmojë një mediator shëndetësor në RediHealth?",
    ],
    errors: {
      generic: "Nuk mundëm të përgjigjemi tani. Provo përsëri.",
      busy: "Asistenti është i zënë. Provo përsëri pas pak minutash.",
      unavailable: "Asistenti nuk funksionon tani. Provo më vonë.",
    },
    safety: {
      abuseWarning:
        "Mesazhi u ndalua. Mbaj gjuhë të respektueshme dhe përdor asistentin vetëm për pyetje shëndetësore. Përsëritja e bllokon asistentin në këtë pajisje për 72 orë.",
      blockedTitle: "Asistenti IA është bllokuar përkohësisht në këtë pajisje",
      blockedBody:
        "Biseda u ndërpre dhe asistenti IA u çaktivizua për 72 orë për shkak të gjuhës fyese ose keqpërdorimit.",
      blockedUntilPrefix: "Disponohet sërish pas:",
      dailyLimitTitle: "Limiti ditor për asistentin IA u arrit",
      dailyLimitBody:
        "Kjo pajisje ka arritur kufirin ditor të përdorimit për asistentin IA.",
      dailyLimitResetPrefix: "Rikthehet pas:",
      useOtherTools:
        "Mund të vazhdosh të përdorësh kontrollin e simptomave dhe udhëzuesit shëndetësorë normalisht.",
      symptomCheckerLink: "Kontrollo simptomat",
      healthGuidesLink: "Udhëzues shëndetësorë",
    },
  },
  it: {
    navLabel: "Assistente IA",
    shortLabel: "IA",
    title: "Assistente medico IA",
    lead: "Chiedi informazioni su termini medici, sintomi o sulla piattaforma RediHealth. L'assistente ti aiuta a capire i termini sanitari, gli strumenti del sito e quanto presto sentire un medico.",
    metaDescription: "Chiedi su termini medici, sintomi o sulla piattaforma RediHealth. L'assistente IA risponde solo a domande mediche e sulla piattaforma.",
    welcome: "Ciao. Rispondo solo a domande su termini medici, salute e informazioni presenti su RediHealth. Chiedimi di un sintomo, un termine medico o come usare la piattaforma. Non faccio diagnosi e non sostituisco il medico.",
    inputLabel: "Chiedi su salute, termini medici o RediHealth",
    placeholder: "Per esempio: Cosa significa emoglobina? Oppure: Ho mal di gola e febbre da 2 giorni",
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
    disclaimer: "L'assistente risponde solo a domande su termini medici, salute e piattaforma RediHealth. Le risposte sono generate dall'intelligenza artificiale e non sono una diagnosi. Non scrivere nome, codice fiscale o altri dati personali.",
    tooLong: "Il messaggio è troppo lungo. Scrivilo in modo più breve.",
    voiceOn: "Voce attiva",
    voiceOff: "Voce spenta",
    voiceSpeaking: "L'assistente sta parlando…",
    stopVoice: "Ferma",
    listenReply: "Ascolta",
    micStart: "Parla al microfono",
    micStop: "Ferma il microfono",
    micListening: "In ascolto…",
    statusReady: "Termini medici e RediHealth",
    quickPrompts: [
      "Cosa significa pressione alta?",
      "Ho mal di gola e febbre da 2 giorni",
      "Come posso chiedere aiuto a un mediatore su RediHealth?",
    ],
    errors: {
      generic: "Non siamo riusciti a rispondere ora. Riprova.",
      busy: "L'assistente è occupato. Riprova tra qualche minuto.",
      unavailable: "L'assistente non funziona in questo momento. Riprova più tardi.",
    },
    safety: {
      abuseWarning:
        "Messaggio interrotto. Usa un linguaggio rispettoso e utilizza l'assistente solo per domande sulla salute. Il ripetersi blocca l'assistente su questo dispositivo per 72 ore.",
      blockedTitle: "Assistente IA disabilitato su questo dispositivo",
      blockedBody:
        "La conversazione è stata interrotta e l'assistente IA è stato bloccato per 72 ore a causa di linguaggio offensivo o uso improprio.",
      blockedUntilPrefix: "Di nuovo disponibile dopo:",
      dailyLimitTitle: "Limite giornaliero dell'assistente IA raggiunto",
      dailyLimitBody:
        "Questo dispositivo ha raggiunto il limite giornaliero di utilizzo per l'assistente IA.",
      dailyLimitResetPrefix: "Si reimposta dopo:",
      useOtherTools:
        "Puoi comunque usare il controllo sintomi e le guide sulla salute senza limitazioni.",
      symptomCheckerLink: "Controlla i sintomi",
      healthGuidesLink: "Guide alla salute",
    },
  },
  hr: {
    navLabel: "AI asistent",
    shortLabel: "AI",
    title: "Medicinski AI asistent",
    lead: "Pitaj o medicinskim pojmovima, simptomima ili informacijama na RediHealthu. Asistent ti pomaže razumjeti zdravstvene pojmove, alate platforme i koliko brzo trebaš liječnika.",
    metaDescription: "Pitaj o medicinskim pojmovima, simptomima ili platformi RediHealth. AI asistent odgovara samo na medicinska i pitanja o platformi.",
    welcome: "Bok. Odgovaram samo na pitanja o medicinskim pojmovima, zdravlju i informacijama na RediHealthu. Pitaj me o simptomu, medicinskom pojmu ili kako koristiti platformu. Ne postavljam dijagnozu i ne zamjenjujem liječnika.",
    inputLabel: "Pitaj o zdravlju, medicinskim pojmovima ili RediHealthu",
    placeholder: "Na primjer: Što znači hemoglobin? Ili: Boli me grlo i imam temperaturu",
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
    disclaimer: "Asistent odgovara samo na pitanja o medicinskim pojmovima, zdravlju i platformi RediHealth. Odgovore stvara umjetna inteligencija i nisu dijagnoza. Ne upisuj svoje ime, OIB ni druge osobne podatke.",
    tooLong: "Poruka je preduga. Napiši je kraće.",
    voiceOn: "Glas uključen",
    voiceOff: "Glas isključen",
    voiceSpeaking: "Asistent govori…",
    stopVoice: "Zaustavi",
    listenReply: "Poslušaj",
    micStart: "Govori na mikrofon",
    micStop: "Zaustavi mikrofon",
    micListening: "Sluša…",
    statusReady: "Medicinski pojmovi i RediHealth",
    quickPrompts: [
      "Što znači povišen krvni tlak?",
      "Boli me grlo i imam temperaturu 2 dana",
      "Kako mi može pomoći zdravstveni medijator na RediHealthu?",
    ],
    errors: {
      generic: "Trenutno nismo mogli odgovoriti. Pokušaj ponovno.",
      busy: "Asistent je zauzet. Pokušaj ponovno za nekoliko minuta.",
      unavailable: "Asistent trenutno ne radi. Pokušaj kasnije.",
    },
    safety: {
      abuseWarning:
        "Poruka je prekinuta. Zadrži pristojan ton i koristi asistenta samo za zdravstvena pitanja. Ponavljanje blokira asistenta na ovom uređaju na 72 sata.",
      blockedTitle: "AI asistent je privremeno onemogućen na ovom uređaju",
      blockedBody:
        "Razgovor je prekinut i AI asistent je blokiran na 72 sata zbog neprimjerenog jezika ili zlouporabe.",
      blockedUntilPrefix: "Ponovno dostupno nakon:",
      dailyLimitTitle: "Dosegnuto je dnevno ograničenje AI asistenta",
      dailyLimitBody:
        "Ovaj je uređaj dosegnuo dnevno dopuštenje korištenja za AI asistenta.",
      dailyLimitResetPrefix: "Resetira se nakon:",
      useOtherTools:
        "I dalje možeš normalno koristiti provjeru simptoma i zdravstvene vodiče.",
      symptomCheckerLink: "Provjeri simptome",
      healthGuidesLink: "Zdravstveni vodiči",
    },
  },
  rom: {
    navLabel: "AI azhutitori",
    shortLabel: "AI",
    title: "Sastipnasko AI azhutitori",
    lead: "Phuch pala doktoroske lava, simptome vaj informacie pe RediHealth. O azhutitori azhutil tut te haljares sastipnaske lava, e platforma thaj sar sigo trebul tuke doktori.",
    metaDescription: "Phuch pala doktoroske lava, simptome vaj RediHealth. O AI azhutitori del anglipen numa pala sastipen thaj e platforma.",
    welcome: "Lashe dyes. Dav anglipen numa pe phuchimata pala doktoroske lava, sastipen thaj informacie pe RediHealth. Phuch man pala jekh simptomo, jekh doktorosko lav vaj sar te loshanes e platforma. Na thav diagnoza thaj na parudav e doktores.",
    inputLabel: "Phuch pala sastipen, doktoroske lava vaj RediHealth",
    placeholder: "Sar misal: So zanel o baro rat? Vaj: Dukhal man o kurlo thaj si man tatipen",
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
    disclaimer: "O azhutitori del anglipen numa pala doktoroske lava, sastipen thaj platforma RediHealth. E anglipena keren pe katar i artificialno godyaver buti thaj na si diagnoza. Na lekh tiro anav, CNP vaj aver personalno informacie.",
    tooLong: "O mesazho si but lungo. Lekh les maj skurto.",
    voiceOn: "Glaso puterdo",
    voiceOff: "Glaso achavdo",
    voiceSpeaking: "O azhutitori vakerel…",
    stopVoice: "Achav",
    listenReply: "Ashun",
    micStart: "Vaker ko mikrofono",
    micStop: "Achav o mikrofono",
    micListening: "Ashunel tut…",
    statusReady: "Doktoroske lava thaj RediHealth",
    quickPrompts: [
      "So zanel o baro rat?",
      "Dukhal man o kurlo thaj si man tatipen 2 dyes",
      "Sar shaj azhutil man jekh sastipnasko mediatori pe RediHealth?",
    ],
    errors: {
      generic: "Na dashtiam te anglipenas akana. Zumav palem.",
      busy: "O azhutitori si ande buti. Zumav palem pale nesave minutura.",
      unavailable: "O azhutitori na kerel buti akana. Zumav maj palal.",
    },
    safety: {
      abuseWarning:
        "O mesazho achavdilo. Vaker pakivasa thaj loshan o azhutitori numa vash sastipnaske phuchimata. Te avla palem, o azhutitori phandavel pe pe kadava telefono 72 chasurya.",
      blockedTitle: "O AI azhutitori si phandavdo pe kadava telefono",
      blockedBody:
        "O vorbipen achavdilo thaj o AI azhutitori si phandavdo 72 chasurya sebepi bilaćhe lava vaj nasul loshanipe.",
      blockedUntilPrefix: "Puterdo palem pala:",
      dailyLimitTitle: "E dyeseski limita vash o AI azhutitori resli",
      dailyLimitBody:
        "Kadava telefono reslya e dyeseski limita vash o AI azhutitori.",
      dailyLimitResetPrefix: "Neviola pala:",
      useOtherTools:
        "Shaj te loshanes inke o dikhipe e simptomengo thaj le sastipnaske gidura.",
      symptomCheckerLink: "Dikh che simptome",
      healthGuidesLink: "Sastipnaske gidura",
    },
  },
  ru: {
    navLabel: "ИИ-помощник",
    shortLabel: "ИИ",
    title: "Медицинский ИИ-помощник",
    lead: "Спросите о медицинских терминах, симптомах или информации на RediHealth. Помощник объяснит термины, разделы платформы и подскажет, насколько срочно нужен врач.",
    metaDescription: "Спросите о медицинских терминах, симптомах или платформе RediHealth. ИИ-помощник отвечает только на медицинские вопросы и вопросы о платформе.",
    welcome: "Здравствуйте. Я отвечаю только на вопросы о медицинских терминах, здоровье и информации на RediHealth. Спросите меня о симптоме, медицинском термине или о том, как пользоваться платформой. Я не ставлю диагноз и не заменяю врача.",
    inputLabel: "Спросите о здоровье, медицинских терминах или RediHealth",
    placeholder: "Например: Что означает гемоглобин? Или: У меня болит горло и температура 38",
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
    disclaimer: "Помощник отвечает только на вопросы о медицинских терминах, здоровье и платформе RediHealth. Ответы создаёт искусственный интеллект, и они не являются диагнозом. Не пишите имя, номер документа и другие личные данные.",
    tooLong: "Сообщение слишком длинное. Напишите короче.",
    voiceOn: "Голос включён",
    voiceOff: "Голос выключен",
    voiceSpeaking: "Помощник говорит…",
    stopVoice: "Стоп",
    listenReply: "Слушать",
    micStart: "Сказать в микрофон",
    micStop: "Остановить микрофон",
    micListening: "Слушает…",
    statusReady: "Медицинские термины и RediHealth",
    quickPrompts: [
      "Что означает повышенное давление?",
      "У меня болит горло и температура 2 дня",
      "Как связаться с медицинским медиатором на RediHealth?",
    ],
    errors: {
      generic: "Сейчас не удалось ответить. Попробуйте ещё раз.",
      busy: "Помощник занят. Попробуйте через несколько минут.",
      unavailable: "Помощник сейчас не работает. Попробуйте позже.",
    },
    safety: {
      abuseWarning:
        "Сообщение остановлено. Соблюдайте уважительный тон и используйте помощника только для вопросов о здоровье. При повторении доступ на этом устройстве будет заблокирован на 72 часа.",
      blockedTitle: "ИИ-помощник временно отключён на этом устройстве",
      blockedBody:
        "Разговор был прерван, а ИИ-помощник заблокирован на 72 часа из-за оскорбительной лексики или злоупотребления.",
      blockedUntilPrefix: "Снова будет доступен после:",
      dailyLimitTitle: "Дневной лимит ИИ-помощника исчерпан",
      dailyLimitBody:
        "На этом устройстве достигнут дневной лимит токенов для ИИ-помощника.",
      dailyLimitResetPrefix: "Сбросится после:",
      useOtherTools:
        "Вы можете и дальше пользоваться проверкой симптомов и медицинскими памятками.",
      symptomCheckerLink: "Проверить симптомы",
      healthGuidesLink: "Медицинские памятки",
    },
  },
};
