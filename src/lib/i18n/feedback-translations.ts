import type { Lang } from "@/lib/i18n/translations";
import type {
  FeedbackAgeGroup,
  FeedbackGender,
  FeedbackMaritalStatus,
  RatingKey,
} from "@/lib/platform-feedback-shared";

export type FeedbackWidgetCopy = {
  inviteTitle: string;
  inviteBody: string;
  inviteOpenCta: string;
  inviteLaterCta: string;
  inviteCloseAria: string;
  inviteQuickScaleHint: string;
  footerLink: string;
  modalTitle: string;
  modalSubtitle: string;
  closeAria: string;
  stepIndicator: (current: number, total: number) => string;
  stepTitles: {
    ratings: string;
    openQuestion: string;
    demographics: string;
  };
  scaleLow: string;
  scaleHigh: string;
  scaleValueLabels: [string, string, string, string, string];
  questions: Record<RatingKey, { label: string; question: string }>;
  openQuestionLabel: string;
  openQuestionPlaceholder: string;
  openQuestionHint: string;
  demographicsIntro: string;
  privacyNote: string;
  genderLabel: string;
  genderOptions: Record<FeedbackGender, string>;
  ageGroupLabel: string;
  ageGroupPlaceholder: string;
  ageGroupOptions: Record<FeedbackAgeGroup, string>;
  maritalStatusLabel: string;
  maritalStatusPlaceholder: string;
  maritalStatusOptions: Record<FeedbackMaritalStatus, string>;
  localityLabel: string;
  localityPlaceholder: string;
  occupationLabel: string;
  occupationPlaceholder: string;
  backCta: string;
  nextCta: string;
  submitCta: string;
  submitting: string;
  doneCloseCta: string;
  thankYouTitle: string;
  thankYouBody: string;
  validationMissingRatings: string;
  errorTooMany: string;
  errorCaptcha: string;
  errorUnavailable: string;
  errorGeneric: string;
};

export type FeedbackAdminCopy = {
  navLabel: string;
  title: string;
  subtitle: string;
  privacyBadge: string;
  refresh: string;
  refreshing: string;
  exportCsv: string;
  noDatabase: string;
  emptyState: string;
  totalResponses: string;
  overallScore: string;
  openAnswersCount: string;
  anonymizedCount: string;
  outOfFive: string;
  evaluationHeading: string;
  demographicsHeading: string;
  responsesHeading: string;
  searchPlaceholder: string;
  allLanguages: string;
  allAgeGroups: string;
  unspecified: string;
  topLocalities: string;
  topOccupations: string;
  deleteEntry: string;
  deleteConfirm: string;
  tableWhen: string;
  tableScores: string;
  tableOpenAnswer: string;
  tableDemographics: string;
  tableActions: string;
  noOpenAnswer: string;
  redactedTag: string;
};

export const feedbackWidgetCopy: Record<Lang, FeedbackWidgetCopy> = {
"ru": {
"stepIndicator": (current, total) => `Шаг ${current} из ${total}`,
"inviteTitle":"Есть минута, чтобы оценить платформу?","inviteBody":"Ваш анонимный отзыв поможет сделать медицинскую информацию понятнее и доступнее.","inviteOpenCta":"Оставить отзыв","inviteLaterCta":"Позже","inviteCloseAria":"Закрыть приглашение","inviteQuickScaleHint":"Или оцените полезность от 1 до 5:","footerLink":"Оставить отзыв","modalTitle":"Ваше мнение о RediHealth","modalSubtitle":"Это займёт около минуты. Ответы анонимны.","closeAria":"Закрыть форму отзыва","stepTitles":{"ratings":"Оценки","openQuestion":"Что вы хотели бы видеть в приложении","demographics":"Необязательные сведения о себе"},"scaleLow":"1 · Совсем нет","scaleHigh":"5 · Очень","scaleValueLabels":["1 — Совсем нет","2 — Немного","3 — Умеренно","4 — Сильно","5 — Очень сильно"],"questions":{"rating_usefulness":{"label":"Полезность","question":"Насколько полезна для вас платформа?"},"rating_ease_of_use":{"label":"Удобство","question":"Насколько легко пользоваться платформой?"},"rating_visual_design":{"label":"Внешний вид","question":"Насколько вам нравится оформление платформы?"},"rating_content_clarity":{"label":"Понятность","question":"Насколько понятны информация и доступные действия?"},"rating_future_use":{"label":"Использование в будущем","question":"Насколько вероятно, что вы будете пользоваться платформой снова?"}},"openQuestionLabel":"Что вы хотели бы найти или делать в таком приложении?","openQuestionPlaceholder":"Напишите об идеях, функциях или медицинской информации, которые были бы вам полезны…","openQuestionHint":"Можно пропустить. Не указывайте имена, номера телефонов или личные идентификационные номера.","demographicsIntro":"Эти необязательные сведения помогают понять, кому доступна платформа.","privacyNote":"Мы не сохраняем ваше имя, электронную почту, телефон или IP-адрес.","genderLabel":"Пол","genderOptions":{"female":"Женский","male":"Мужской","other":"Другой вариант","prefer_not_to_say":"Предпочитаю не отвечать"},"ageGroupLabel":"Возрастная группа","ageGroupPlaceholder":"Выберите возрастную группу","ageGroupOptions":{
"prefer_not_to_say": "Предпочитаю не отвечать",
"under_18":"До 18 лет","18_24":"18–24 года","25_34":"25–34 года","35_44":"35–44 года","45_54":"45–54 года","55_64":"55–64 года","65_plus":"65 лет и старше"},"maritalStatusLabel":"Семейное положение","maritalStatusPlaceholder":"Выберите вариант","maritalStatusOptions":{
"married_or_partnered": "В браке или отношениях",
"divorced_or_separated": "В разводе или живу отдельно",
"single":"Не состою в браке","widowed":"Вдовец / вдова","prefer_not_to_say":"Предпочитаю не отвечать"},"localityLabel":"Населённый пункт","localityPlaceholder":"Например, город или село","occupationLabel":"Занятость","occupationPlaceholder":"Например, учитель, студент, пенсионер","backCta":"Назад","nextCta":"Далее","submitCta":"Отправить отзыв","submitting":"Отправка…","doneCloseCta":"Вернуться на платформу","thankYouTitle":"Спасибо за ваше время","thankYouBody":"Ваши анонимные ответы сохранены и помогут улучшить RediHealth.","validationMissingRatings":"Оцените все пять вопросов от 1 до 5.","errorTooMany":"Вы недавно уже отправили отзыв. Повторите позже.","errorCaptcha":"Не удалось пройти проверку безопасности. Повторите попытку.","errorUnavailable":"Отзывы временно недоступны. Повторите позже.","errorGeneric":"Не удалось сохранить ответ. Повторите попытку."},

  ro: {
    inviteTitle: "Ai un minut să ne spui cum ți se pare platforma?",
    inviteBody: "Părerea ta anonimă ne ajută să facem informațiile medicale mai clare pentru toată lumea.",
    inviteOpenCta: "Lasă feedback",
    inviteLaterCta: "Mai târziu",
    inviteCloseAria: "Închide invitația de feedback",
    inviteQuickScaleHint: "Sau alege direct o notă de la 1 la 5 pentru utilitate:",
    footerLink: "Lasă feedback",
    modalTitle: "Spune-ne părerea ta despre RediHealth",
    modalSubtitle: "Durează aproximativ un minut. Toate răspunsurile sunt complet anonime.",
    closeAria: "Închide formularul de feedback",
    stepIndicator: (current, total) => `Pasul ${current} din ${total}`,
    stepTitles: {
      ratings: "Întrebările de evaluare",
      openQuestion: "Ce ți-ai dori să găsești în aplicație",
      demographics: "Date demografice opționale",
    },
    scaleLow: "1 · Deloc",
    scaleHigh: "5 · Foarte mult",
    scaleValueLabels: ["1 - Deloc", "2 - Puțin", "3 - Moderat", "4 - Mult", "5 - Foarte mult"],
    questions: {
      rating_usefulness: {
        label: "Utilitate",
        question: "Cât de utilă ți se pare platforma?",
      },
      rating_ease_of_use: {
        label: "Ușurința în utilizare",
        question: "Cât de ușor ți-a fost să folosești platforma?",
      },
      rating_visual_design: {
        label: "Aspect vizual",
        question: "Cât de mult îți place cum arată platforma?",
      },
      rating_content_clarity: {
        label: "Înțelegerea conținutului",
        question: "Cât de ușor ai înțeles informațiile și opțiunile prezentate?",
      },
      rating_future_use: {
        label: "Utilizare viitoare",
        question: "Cât de probabil este să folosești platforma în viitor?",
      },
    },
    openQuestionLabel: "Ce ai vrea să găsești sau să poți face într-o astfel de aplicație?",
    openQuestionPlaceholder: "Scrie liber orice idee, funcționalitate sau informație medicală care ți-ar fi de folos…",
    openQuestionHint: "Poți trece la pasul următor și fără să completezi acest câmp. Nu include nume, număr de telefon sau CNP.",
    demographicsIntro: "Aceste date statistice sunt opționale și ne ajută să înțelegem dacă platforma ajunge la toate categoriile de vârstă și localități.",
    privacyNote: "Fără date de identificare: nu salvăm numele, adresa de email, numărul de telefon sau adresa IP.",
    genderLabel: "Gen",
    genderOptions: {
      female: "Feminin",
      male: "Masculin",
      other: "Altă opțiune",
      prefer_not_to_say: "Prefer să nu răspund",
    },
    ageGroupLabel: "Vârstă sau grupă de vârstă",
    ageGroupPlaceholder: "Alege grupa de vârstă",
    ageGroupOptions: {
      under_18: "Sub 18 ani",
      "18_24": "18–24 ani",
      "25_34": "25–34 ani",
      "35_44": "35–44 ani",
      "45_54": "45–54 ani",
      "55_64": "55–64 ani",
      "65_plus": "65 ani sau peste",
      prefer_not_to_say: "Prefer să nu răspund",
    },
    maritalStatusLabel: "Stare civilă",
    maritalStatusPlaceholder: "Alege starea civilă",
    maritalStatusOptions: {
      single: "Necăsătorit(ă)",
      married_or_partnered: "Căsătorit(ă) sau în parteneriat",
      divorced_or_separated: "Divorțat(ă) sau separat(ă)",
      widowed: "Văduv(ă)",
      prefer_not_to_say: "Prefer să nu răspund",
    },
    localityLabel: "Localitate",
    localityPlaceholder: "ex. Cluj-Napoca sau com. Florești",
    occupationLabel: "Ocupație",
    occupationPlaceholder: "ex. profesor, student, pensionar",
    backCta: "Înapoi",
    nextCta: "Continuă",
    submitCta: "Trimite feedbackul",
    submitting: "Se trimite…",
    doneCloseCta: "Înapoi la platformă",
    thankYouTitle: "Mulțumim pentru timpul acordat",
    thankYouBody: "Răspunsurile tale anonime au fost înregistrate și ne ajută să îmbunătățim RediHealth.",
    validationMissingRatings: "Alege o notă de la 1 la 5 pentru toate cele cinci întrebări înainte de a continua.",
    errorTooMany: "Ai trimis deja feedback recent. Încearcă din nou mai târziu.",
    errorCaptcha: "Verificarea de securitate nu a reușit. Încearcă din nou.",
    errorUnavailable: "Serviciul de feedback este momentan indisponibil. Încearcă mai târziu.",
    errorGeneric: "Nu am putut salva răspunsul. Încearcă din nou.",
  },
  en: {
    inviteTitle: "Have a minute to share how RediHealth feels to use?",
    inviteBody: "Your anonymous feedback helps us make health guidance clearer and easier to reach.",
    inviteOpenCta: "Leave feedback",
    inviteLaterCta: "Maybe later",
    inviteCloseAria: "Dismiss feedback invitation",
    inviteQuickScaleHint: "Or tap a score from 1 to 5 for usefulness to begin:",
    footerLink: "Leave feedback",
    modalTitle: "Share your thoughts on RediHealth",
    modalSubtitle: "Takes about one minute. Every response is stored anonymously.",
    closeAria: "Close feedback form",
    stepIndicator: (current, total) => `Step ${current} of ${total}`,
    stepTitles: {
      ratings: "Evaluation questions",
      openQuestion: "What you would like to do here",
      demographics: "Optional demographic details",
    },
    scaleLow: "1 · Not at all",
    scaleHigh: "5 · Very much",
    scaleValueLabels: ["1 - Not at all", "2 - Slightly", "3 - Moderately", "4 - Very", "5 - Extremely"],
    questions: {
      rating_usefulness: {
        label: "Usefulness",
        question: "How useful do you find the platform?",
      },
      rating_ease_of_use: {
        label: "Ease of use",
        question: "How easy was it for you to use the platform?",
      },
      rating_visual_design: {
        label: "Visual appearance",
        question: "How much do you like how the platform looks?",
      },
      rating_content_clarity: {
        label: "Understanding content",
        question: "How easily did you understand the information and options shown?",
      },
      rating_future_use: {
        label: "Future use",
        question: "How likely are you to use the platform in the future?",
      },
    },
    openQuestionLabel: "What would you like to find or be able to do in an application like this?",
    openQuestionPlaceholder: "Share any feature, health topic, or practical tool that would help you…",
    openQuestionHint: "Optional. Please leave out names, phone numbers, or national ID numbers.",
    demographicsIntro: "These optional statistical fields help us check whether the platform serves different age groups and communities.",
    privacyNote: "Anonymous by design: we never store your name, email, phone number, or IP address.",
    genderLabel: "Gender",
    genderOptions: {
      female: "Female",
      male: "Male",
      other: "Another option",
      prefer_not_to_say: "Prefer not to say",
    },
    ageGroupLabel: "Age or age group",
    ageGroupPlaceholder: "Select age group",
    ageGroupOptions: {
      under_18: "Under 18",
      "18_24": "18–24",
      "25_34": "25–34",
      "35_44": "35–44",
      "45_54": "45–54",
      "55_64": "55–64",
      "65_plus": "65 or older",
      prefer_not_to_say: "Prefer not to say",
    },
    maritalStatusLabel: "Marital status",
    maritalStatusPlaceholder: "Select marital status",
    maritalStatusOptions: {
      single: "Single",
      married_or_partnered: "Married or in a partnership",
      divorced_or_separated: "Divorced or separated",
      widowed: "Widowed",
      prefer_not_to_say: "Prefer not to say",
    },
    localityLabel: "Locality",
    localityPlaceholder: "e.g. Cluj-Napoca (city or commune only)",
    occupationLabel: "Occupation",
    occupationPlaceholder: "e.g. teacher, student, retiree, nurse",
    backCta: "Back",
    nextCta: "Continue",
    submitCta: "Send feedback",
    submitting: "Sending…",
    doneCloseCta: "Back to website",
    thankYouTitle: "Thank you for your feedback",
    thankYouBody: "Your anonymous answers have been saved and help us improve RediHealth.",
    validationMissingRatings: "Please choose a score from 1 to 5 for all five questions before continuing.",
    errorTooMany: "You recently submitted feedback. Please try again later.",
    errorCaptcha: "The security check did not pass. Please try again.",
    errorUnavailable: "Feedback storage is temporarily unavailable. Try again later.",
    errorGeneric: "Could not save your feedback. Please try again.",
  },
  sq: {
    inviteTitle: "Ke një minutë të na thuash si të duket platforma?",
    inviteBody: "Mendimi yt anonim na ndihmon t'i bëjmë udhëzimet shëndetësore më të qarta për të gjithë.",
    inviteOpenCta: "Lër përshtypje",
    inviteLaterCta: "Më vonë",
    inviteCloseAria: "Mbyll ftesën për përshtypje",
    inviteQuickScaleHint: "Ose zgjidh një vlerësim nga 1 në 5 për dobishmërinë:",
    footerLink: "Lër përshtypje",
    modalTitle: "Na trego mendimin tënd për RediHealth",
    modalSubtitle: "Zgjat rreth një minutë. Të gjitha përgjigjet ruhen në mënyrë anonime.",
    closeAria: "Mbyll formularin e përshtypjeve",
    stepIndicator: (current, total) => `Hapi ${current} nga ${total}`,
    stepTitles: {
      ratings: "Pyetjet e vlerësimit",
      openQuestion: "Çfarë do të doje të gjeje këtu",
      demographics: "Të dhëna demografike jo të detyrueshme",
    },
    scaleLow: "1 · Aspak",
    scaleHigh: "5 · Shumë",
    scaleValueLabels: ["1 - Aspak", "2 - Pak", "3 - Mesatarisht", "4 - Shumë", "5 - Jashtëzakonisht"],
    questions: {
      rating_usefulness: {
        label: "Dobishmëria",
        question: "Sa e dobishme të duket platforma?",
      },
      rating_ease_of_use: {
        label: "Lehtësia e përdorimit",
        question: "Sa e lehtë ishte për ty ta përdorje platformën?",
      },
      rating_visual_design: {
        label: "Pamja vizuale",
        question: "Sa të pëlqen mënyra si duket platforma?",
      },
      rating_content_clarity: {
        label: "Kuptimi i përmbajtjes",
        question: "Sa lehtë i kuptove informacionet dhe mundësitë e paraqitura?",
      },
      rating_future_use: {
        label: "Përdorimi në të ardhmen",
        question: "Sa ka gjasa ta përdorësh platformën në të ardhmen?",
      },
    },
    openQuestionLabel: "Çfarë do të doje të gjeje ose të mund të bëje në një aplikacion të tillë?",
    openQuestionPlaceholder: "Shkruaj çdo ide, funksion ose informacion shëndetësor që do të të ndihmonte…",
    openQuestionHint: "Jo e detyrueshme. Mos shkruaj emra, numra telefoni ose numra personalë identifikimi.",
    demographicsIntro: "Këto të dhëna statistikore janë opsionale dhe na ndihmojnë të kuptojmë cilat komunitete përdorin platformën.",
    privacyNote: "Plotësisht anonime: nuk ruajmë emrin, emailin, telefonin apo adresën IP.",
    genderLabel: "Gjinia",
    genderOptions: {
      female: "Femër",
      male: "Mashkull",
      other: "Mundësi tjetër",
      prefer_not_to_say: "Preferoj të mos përgjigjem",
    },
    ageGroupLabel: "Mosha ose grupmosha",
    ageGroupPlaceholder: "Zgjidh grupmoshën",
    ageGroupOptions: {
      under_18: "Nën 18 vjeç",
      "18_24": "18–24 vjeç",
      "25_34": "25–34 vjeç",
      "35_44": "35–44 vjeç",
      "45_54": "45–54 vjeç",
      "55_64": "55–64 vjeç",
      "65_plus": "65 vjeç e sipër",
      prefer_not_to_say: "Preferoj të mos përgjigjem",
    },
    maritalStatusLabel: "Gjendja civile",
    maritalStatusPlaceholder: "Zgjidh gjendjen civile",
    maritalStatusOptions: {
      single: "Beqar(e)",
      married_or_partnered: "I/e martuar ose në bashkëjetesë",
      divorced_or_separated: "I/e divorcuar ose i/e ndarë",
      widowed: "I/e ve",
      prefer_not_to_say: "Preferoj të mos përgjigjem",
    },
    localityLabel: "Vendbanimi",
    localityPlaceholder: "p.sh. Tiranë ose Shkodër (pa rrugë)",
    occupationLabel: "Profesioni",
    occupationPlaceholder: "p.sh. mësues, student, pensionist",
    backCta: "Kthehu",
    nextCta: "Vazhdo",
    submitCta: "Dërgo përshtypjet",
    submitting: "Po dërgohet…",
    doneCloseCta: "Kthehu te faqja",
    thankYouTitle: "Faleminderit për kohën tënde",
    thankYouBody: "Përgjigjet e tua anonime u ruajtën dhe na ndihmojnë të përmirësojmë RediHealth.",
    validationMissingRatings: "Zgjidh një vlerësim nga 1 në 5 për të pesta pyetjet para se të vazhdosh.",
    errorTooMany: "Ke dërguar përshtypje së fundmi. Provo përsëri më vonë.",
    errorCaptcha: "Kontrolli i sigurisë nuk kaloi. Provo përsëri.",
    errorUnavailable: "Shërbimi i përshtypjeve nuk është gati tani. Provo më vonë.",
    errorGeneric: "Nuk mundëm ta ruajmë përgjigjen. Provo përsëri.",
  },
  it: {
    inviteTitle: "Hai un minuto per dirci come ti trovi sulla piattaforma?",
    inviteBody: "Il tuo parere anonimo ci aiuta a rendere le informazioni sanitarie più chiare per tutti.",
    inviteOpenCta: "Lascia un parere",
    inviteLaterCta: "Più tardi",
    inviteCloseAria: "Chiudi l'invito al questionario",
    inviteQuickScaleHint: "Oppure scegli subito un voto da 1 a 5 per l'utilità:",
    footerLink: "Lascia un parere",
    modalTitle: "Raccontaci la tua esperienza su RediHealth",
    modalSubtitle: "Richiede circa un minuto. Tutte le risposte sono completamente anonime.",
    closeAria: "Chiudi il modulo di valutazione",
    stepIndicator: (current, total) => `Passaggio ${current} di ${total}`,
    stepTitles: {
      ratings: "Domande di valutazione",
      openQuestion: "Cosa vorresti trovare nell'applicazione",
      demographics: "Dati demografici facoltativi",
    },
    scaleLow: "1 · Per niente",
    scaleHigh: "5 · Moltissimo",
    scaleValueLabels: ["1 - Per niente", "2 - Poco", "3 - Abbastanza", "4 - Molto", "5 - Moltissimo"],
    questions: {
      rating_usefulness: {
        label: "Utilità",
        question: "Quanto ti sembra utile la piattaforma?",
      },
      rating_ease_of_use: {
        label: "Facilità d'uso",
        question: "Quanto è stato facile usare la piattaforma?",
      },
      rating_visual_design: {
        label: "Aspetto visivo",
        question: "Quanto ti piace l'aspetto della piattaforma?",
      },
      rating_content_clarity: {
        label: "Chiarezza dei contenuti",
        question: "Quanto facilmente hai capito le informazioni e le opzioni mostrate?",
      },
      rating_future_use: {
        label: "Utilizzo futuro",
        question: "Quanto è probabile che userai la piattaforma in futuro?",
      },
    },
    openQuestionLabel: "Cosa vorresti trovare o poter fare in un'applicazione come questa?",
    openQuestionPlaceholder: "Scrivi liberamente idee, funzioni o temi di salute che ti sarebbero utili…",
    openQuestionHint: "Facoltativo. Non inserire nomi, numeri di telefono o codici fiscali.",
    demographicsIntro: "Questi dati statistici sono facoltativi e ci aiutano a capire se il servizio raggiunge tutte le fasce d'età e località.",
    privacyNote: "Nessun dato identificativo: non salviamo nome, email, telefono o indirizzo IP.",
    genderLabel: "Genere",
    genderOptions: {
      female: "Femminile",
      male: "Maschile",
      other: "Altra opzione",
      prefer_not_to_say: "Preferisco non rispondere",
    },
    ageGroupLabel: "Età o fascia d'età",
    ageGroupPlaceholder: "Seleziona la fascia d'età",
    ageGroupOptions: {
      under_18: "Meno di 18 anni",
      "18_24": "18–24 anni",
      "25_34": "25–34 anni",
      "35_44": "35–44 anni",
      "45_54": "45–54 anni",
      "55_64": "55–64 anni",
      "65_plus": "65 anni o più",
      prefer_not_to_say: "Preferisco non rispondere",
    },
    maritalStatusLabel: "Stato civile",
    maritalStatusPlaceholder: "Seleziona lo stato civile",
    maritalStatusOptions: {
      single: "Celibe o nubile",
      married_or_partnered: "Coniugato(a) o convivente",
      divorced_or_separated: "Divorziato(a) o separato(a)",
      widowed: "Vedovo(a)",
      prefer_not_to_say: "Preferisco non rispondere",
    },
    localityLabel: "Località",
    localityPlaceholder: "es. Milano o Bari (solo comune)",
    occupationLabel: "Occupazione",
    occupationPlaceholder: "es. insegnante, studente, pensionato",
    backCta: "Indietro",
    nextCta: "Continua",
    submitCta: "Invia valutazione",
    submitting: "Invio in corso…",
    doneCloseCta: "Torna alla piattaforma",
    thankYouTitle: "Grazie per il tuo tempo",
    thankYouBody: "Le tue risposte anonime sono state registrate e ci aiutano a migliorare RediHealth.",
    validationMissingRatings: "Scegli un voto da 1 a 5 per tutte le cinque domande prima di continuare.",
    errorTooMany: "Hai già inviato un parere di recente. Riprova più tardi.",
    errorCaptcha: "Il controllo di sicurezza non è riuscito. Riprova.",
    errorUnavailable: "Il servizio di raccolta pareri non è disponibile ora. Riprova più tardi.",
    errorGeneric: "Non siamo riusciti a salvare la risposta. Riprova.",
  },
  hr: {
    inviteTitle: "Imaš li minutu da nam kažeš kako ti se čini platforma?",
    inviteBody: "Tvoje anonimno mišljenje pomaže nam učiniti zdravstvene upute jasnijima za sve.",
    inviteOpenCta: "Ostavi povratnu informaciju",
    inviteLaterCta: "Kasnije",
    inviteCloseAria: "Zatvori poziv za povratnu informaciju",
    inviteQuickScaleHint: "Ili odmah odaberi ocjenu od 1 do 5 za korisnost:",
    footerLink: "Ostavi povratnu informaciju",
    modalTitle: "Podijeli svoje mišljenje o RediHealthu",
    modalSubtitle: "Traje oko jednu minutu. Svi odgovori spremaju se potpuno anonimno.",
    closeAria: "Zatvori obrazac za povratne informacije",
    stepIndicator: (current, total) => `Korak ${current} od ${total}`,
    stepTitles: {
      ratings: "Pitanja za procjenu",
      openQuestion: "Što bi volio ili voljela pronaći u aplikaciji",
      demographics: "Neobavezni demografski podaci",
    },
    scaleLow: "1 · Uopće ne",
    scaleHigh: "5 · Izuzetno",
    scaleValueLabels: ["1 - Uopće ne", "2 - Malo", "3 - Umjereno", "4 - Mnogo", "5 - Izuzetno"],
    questions: {
      rating_usefulness: {
        label: "Korisnost",
        question: "Koliko ti se platforma čini korisnom?",
      },
      rating_ease_of_use: {
        label: "Jednostavnost korištenja",
        question: "Koliko ti je bilo lako koristiti platformu?",
      },
      rating_visual_design: {
        label: "Vizualni izgled",
        question: "Koliko ti se sviđa kako platforma izgleda?",
      },
      rating_content_clarity: {
        label: "Razumijevanje sadržaja",
        question: "Koliko si lako razumio ili razumjela prikazane informacije i opcije?",
      },
      rating_future_use: {
        label: "Buduće korištenje",
        question: "Koliko je vjerojatno da ćeš koristiti platformu u budućnosti?",
      },
    },
    openQuestionLabel: "Što bi volio ili voljela pronaći ili moći učiniti u ovakvoj aplikaciji?",
    openQuestionPlaceholder: "Slobodno napiši svaku ideju, značajku ili zdravstvenu temu koja bi ti pomogla…",
    openQuestionHint: "Neobavezno. Nemoj upisivati ime, broj telefona ili OIB.",
    demographicsIntro: "Ovi statistički podaci nisu obavezni i pomažu nam provjeriti dolazi li platforma do svih dobnih skupina i mjesta.",
    privacyNote: "Bez osobnih podataka: ne spremamo ime, email, telefonski broj ni IP adresu.",
    genderLabel: "Spol",
    genderOptions: {
      female: "Ženski",
      male: "Muški",
      other: "Druga opcija",
      prefer_not_to_say: "Ne želim odgovoriti",
    },
    ageGroupLabel: "Dob ili dobna skupina",
    ageGroupPlaceholder: "Odaberi dobnu skupinu",
    ageGroupOptions: {
      under_18: "Ispod 18 godina",
      "18_24": "18–24 godine",
      "25_34": "25–34 godine",
      "35_44": "35–44 godine",
      "45_54": "45–54 godine",
      "55_64": "55–64 godine",
      "65_plus": "65 ili više godina",
      prefer_not_to_say: "Ne želim odgovoriti",
    },
    maritalStatusLabel: "Bračni status",
    maritalStatusPlaceholder: "Odaberi bračni status",
    maritalStatusOptions: {
      single: "Neoženjen ili neudana",
      married_or_partnered: "U braku ili partnerstvu",
      divorced_or_separated: "Razveden(a) ili rastavljen(a)",
      widowed: "Udovac ili udovica",
      prefer_not_to_say: "Ne želim odgovoriti",
    },
    localityLabel: "Mjesto",
    localityPlaceholder: "npr. Zagreb ili Čakovec (bez ulice)",
    occupationLabel: "Zanimanje",
    occupationPlaceholder: "npr. učitelj, student, umirovljenik",
    backCta: "Natrag",
    nextCta: "Nastavi",
    submitCta: "Pošalji povratnu informaciju",
    submitting: "Šalje se…",
    doneCloseCta: "Natrag na stranicu",
    thankYouTitle: "Hvala na izdvojenom vremenu",
    thankYouBody: "Tvoji anonimni odgovori su spremljeni i pomažu nam unaprijediti RediHealth.",
    validationMissingRatings: "Odaberi ocjenu od 1 do 5 za svih pet pitanja prije nastavka.",
    errorTooMany: "Nedavno si već poslao ili poslala odgovor. Pokušaj ponovno kasnije.",
    errorCaptcha: "Sigurnosna provjera nije uspjela. Pokušaj ponovno.",
    errorUnavailable: "Sustav povratnih informacija trenutno nije dostupan. Pokušaj kasnije.",
    errorGeneric: "Nismo uspjeli spremiti odgovor. Pokušaj ponovno.",
  },
  rom: {
    inviteTitle: "Si tut ekh minuta te phenes amenge sar dikhljol tuke i platforma?",
    inviteBody: "Chiro anonimno gindo zhutil amen te keras le sastipnaske informaciye maj ashkare savorenge.",
    inviteOpenCta: "Mekh feedback",
    inviteLaterCta: "Maj palal",
    inviteCloseAria: "Phandav o akharipe vash feedback",
    inviteQuickScaleHint: "Vaj alosar sigo ekh nota katar 1 dji ko 5:",
    footerLink: "Mekh feedback",
    modalTitle: "Phen amenge chiro gindo vash RediHealth",
    modalSubtitle: "Lel karing ekh minuta. Savore palpale phenimata garaven pe anonimno.",
    closeAria: "Phandav o formularo",
    stepIndicator: (current, total) => `Paso ${current} katar ${total}`,
    stepTitles: {
      ratings: "Phuchimata vash evaluaciya",
      openQuestion: "So kamesas te arakhes ande aplikaciya",
      demographics: "Demografikane informaciye (te kames)",
    },
    scaleLow: "1 · Khanči",
    scaleHigh: "5 · But mishto",
    scaleValueLabels: ["1 - Khanči", "2 - Xantsi", "3 - Mashkarutno", "4 - Mishto", "5 - But mishto"],
    questions: {
      rating_usefulness: {
        label: "Lačhipen",
        question: "Sode lačhi thaj zhutitori dikhljol tuke i platforma?",
      },
      rating_ease_of_use: {
        label: "Lokhipen ando labaripe",
        question: "Sode lokho sas tuke te labares i platforma?",
      },
      rating_visual_design: {
        label: "Vizualno dikhipe",
        question: "Sode chaljol tuke sar dikhljol i platforma?",
      },
      rating_content_clarity: {
        label: "Haljaripe e teksturengo",
        question: "Sode lokhes haljardjan le informaciye thaj le opciye sikavde?",
      },
      rating_future_use: {
        label: "Labaripe ando avutno vrama",
        question: "Sode shaj te labares i platforma vi maj palal?",
      },
    },
    openQuestionLabel: "So kamesas te arakhes vaj te shaj keres ande kasavi aplikaciya?",
    openQuestionPlaceholder: "Ramov savi godi ideya vaj sastipnaski buchi so zhutilas tut…",
    openQuestionHint: "Te kames. Na ramov anav, telefono vaj personalno numero.",
    demographicsIntro: "Kadala informaciye si te kames thaj zhutin amen te dikhas kaste aresel i platforma.",
    privacyNote: "Bi personalne datengo: na garavas chiro anav, emailo, telefono vaj IP.",
    genderLabel: "Dzheno",
    genderOptions: {
      female: "Dzhuvel",
      male: "Mursh",
      other: "Aver opciya",
      prefer_not_to_say: "Kamav te na phenav",
    },
    ageGroupLabel: "Bersha vaj grupa bershengi",
    ageGroupPlaceholder: "Alosar grupa bershengi",
    ageGroupOptions: {
      under_18: "Telal 18 bersh",
      "18_24": "18–24 bersh",
      "25_34": "25–34 bersh",
      "35_44": "35–44 bersh",
      "45_54": "45–54 bersh",
      "55_64": "55–64 bersh",
      "65_plus": "65 bersh vaj maj but",
      prefer_not_to_say: "Kamav te na phenav",
    },
    maritalStatusLabel: "Familijaki starea",
    maritalStatusPlaceholder: "Alosar",
    maritalStatusOptions: {
      single: "Bi-prandime",
      married_or_partnered: "Prandime vaj ande khetanipe",
      divorced_or_separated: "Muklime",
      widowed: "Phivlo vaj phivli",
      prefer_not_to_say: "Kamav te na phenav",
    },
    localityLabel: "Foro vaj gav",
    localityPlaceholder: "misal: Craiova (bi dromesko)",
    occupationLabel: "Buchi",
    occupationPlaceholder: "misal: sikavno, studento, pensionaro",
    backCta: "Palpale",
    nextCta: "Maj dur",
    submitCta: "Bichav o feedback",
    submitting: "Bichavel pe…",
    doneCloseCta: "Palpale ki platforma",
    thankYouTitle: "Nais tuke vash chiro vrama",
    thankYouBody: "Chire anonimne palpale phenimata sas garavde thaj zhutin amen te lasharas RediHealth.",
    validationMissingRatings: "Alosar ekh nota katar 1 dji ko 5 vash savore pandzh phuchimata.",
    errorTooMany: "Bichaldjan feedback akana sigo. Zumav maj palal.",
    errorCaptcha: "I kontrola vash arakhimos na nakhlja. Zumav pale.",
    errorUnavailable: "O feedback nashti garavel pe akana. Zumav maj palal.",
    errorGeneric: "Nashti garavdam o palpale phenipe. Zumav pale.",
  },
};

export const feedbackAdminCopy: Record<Lang, FeedbackAdminCopy> = {
"ru": {"navLabel":"Отзывы","title":"Отзывы о платформе","subtitle":"Анонимные оценки и предложения пользователей.","privacyBadge":"Анонимные ответы","refresh":"Обновить","refreshing":"Обновление…","exportCsv":"Экспорт CSV","noDatabase":"База данных недоступна.","emptyState":"Пока нет отзывов.","totalResponses":"Всего ответов","overallScore":"Общая оценка","openAnswersCount":"Текстовые ответы","anonymizedCount":"Анонимизированные ответы","outOfFive":"из 5","evaluationHeading":"Оценки","demographicsHeading":"Сведения об участниках","responsesHeading":"Ответы","searchPlaceholder":"Поиск ответов","allLanguages":"Все языки","allAgeGroups":"Все возрастные группы","unspecified":"Не указано","topLocalities":"Населённые пункты","topOccupations":"Занятость участников","deleteEntry":"Удалить","deleteConfirm":"Удалить этот отзыв?","tableWhen":"Дата","tableScores":"Оценки","tableOpenAnswer":"Текстовый ответ","tableDemographics":"Сведения об участнике","tableActions":"Действия","noOpenAnswer":"Нет текстового ответа","redactedTag":"Личные данные скрыты"},

  ro: {
    navLabel: "Evaluări platformă",
    title: "Evaluări și feedback de la vizitatori",
    subtitle: "Răspunsuri colectate anonim pe scala 1–5, sugestii deschise și distribuție demografică.",
    privacyBadge: "Date anonimizate automat (fără IP, email sau telefon)",
    refresh: "Reîncarcă",
    refreshing: "Se încarcă…",
    exportCsv: "Exportă CSV",
    noDatabase: "Baza de date de control nu este configurată. Configurează conexiunea MySQL pentru a vedea evaluările.",
    emptyState: "Nu există încă evaluări înregistrate pentru filtrul selectat.",
    totalResponses: "Răspunsuri totale",
    overallScore: "Media generală",
    openAnswersCount: "Sugestii deschise",
    anonymizedCount: "Texte curățate de date personale",
    outOfFive: "din 5.00",
    evaluationHeading: "Scoruri medii pe cele cinci criterii",
    demographicsHeading: "Profil demografic agregat",
    responsesHeading: "Răspunsuri individuale anonimizate",
    searchPlaceholder: "Caută în sugestii, localitate sau ocupație…",
    allLanguages: "Toate limbile",
    allAgeGroups: "Toate grupele de vârstă",
    unspecified: "Nespecificat",
    topLocalities: "Localități frecvente",
    topOccupations: "Ocupații menționate",
    deleteEntry: "Șterge",
    deleteConfirm: "Ștergi definitiv această evaluare anonimă?",
    tableWhen: "Data",
    tableScores: "Note (1–5)",
    tableOpenAnswer: "Ce și-ar dori în aplicație",
    tableDemographics: "Date demografice",
    tableActions: "Acțiuni",
    noOpenAnswer: "Fără răspuns deschis",
    redactedTag: "PII eliminat automat",
  },
  en: {
    navLabel: "Platform feedback",
    title: "Visitor evaluations and feedback",
    subtitle: "Anonymized 1–5 platform ratings, open suggestions, and demographic distribution.",
    privacyBadge: "Automatically anonymized (no IP, email, or phone stored)",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    exportCsv: "Export CSV",
    noDatabase: "Control database is not configured. Connect MySQL to view platform feedback.",
    emptyState: "No feedback entries match the current filter yet.",
    totalResponses: "Total responses",
    overallScore: "Overall average",
    openAnswersCount: "Open suggestions",
    anonymizedCount: "Auto-redacted texts",
    outOfFive: "out of 5.00",
    evaluationHeading: "Average scores across the five criteria",
    demographicsHeading: "Aggregated demographic profile",
    responsesHeading: "Individual anonymized responses",
    searchPlaceholder: "Search suggestions, locality, or occupation…",
    allLanguages: "All languages",
    allAgeGroups: "All age groups",
    unspecified: "Not specified",
    topLocalities: "Top localities",
    topOccupations: "Reported occupations",
    deleteEntry: "Delete",
    deleteConfirm: "Permanently delete this anonymous feedback entry?",
    tableWhen: "Submitted",
    tableScores: "Ratings (1–5)",
    tableOpenAnswer: "Desired features and ideas",
    tableDemographics: "Demographics",
    tableActions: "Actions",
    noOpenAnswer: "No open comment",
    redactedTag: "PII scrubbed",
  },
  sq: {
    navLabel: "Vlerësimet e platformës",
    title: "Vlerësimet dhe përshtypjet e vizitorëve",
    subtitle: "Vlerësime anonime 1–5, sugjerime të hapura dhe shpërndarje demografike.",
    privacyBadge: "Anonimizuar automatikisht (pa IP, email ose telefon)",
    refresh: "Rifresko",
    refreshing: "Po ngarkohet…",
    exportCsv: "Eksporto CSV",
    noDatabase: "Baza e të dhënave nuk është konfiguruar.",
    emptyState: "Ende nuk ka përgjigje për filtrin e zgjedhur.",
    totalResponses: "Përgjigje gjithsej",
    overallScore: "Mesatarja e përgjithshme",
    openAnswersCount: "Sugjerime të hapura",
    anonymizedCount: "Tekste të pastruara",
    outOfFive: "nga 5.00",
    evaluationHeading: "Mesataret sipas pesë kritereve",
    demographicsHeading: "Profili demografik i përmbledhur",
    responsesHeading: "Përgjigjet individuale anonime",
    searchPlaceholder: "Kërko në sugjerime, vendbanim ose profesion…",
    allLanguages: "Të gjitha gjuhët",
    allAgeGroups: "Të gjitha grupmoshat",
    unspecified: "E papërcaktuar",
    topLocalities: "Vendbanimet kryesore",
    topOccupations: "Profesionet e përmendura",
    deleteEntry: "Fshi",
    deleteConfirm: "Ta fshijmë përgjithmonë këtë vlerësim anonim?",
    tableWhen: "Data",
    tableScores: "Vlerësimet (1–5)",
    tableOpenAnswer: "Çfarë dëshirojnë në aplikacion",
    tableDemographics: "Demografia",
    tableActions: "Veprime",
    noOpenAnswer: "Pa koment të hapur",
    redactedTag: "Të dhëna personale të hequra",
  },
  it: {
    navLabel: "Valutazioni piattaforma",
    title: "Valutazioni e pareri dei visitatori",
    subtitle: "Voti anonimi da 1 a 5, suggerimenti aperti e distribuzione demografica.",
    privacyBadge: "Anonimizzato automaticamente (nessun IP, email o telefono)",
    refresh: "Aggiorna",
    refreshing: "Aggiornamento…",
    exportCsv: "Esporta CSV",
    noDatabase: "Il database di controllo non è configurato.",
    emptyState: "Nessuna valutazione registrata per il filtro selezionato.",
    totalResponses: "Risposte totali",
    overallScore: "Media complessiva",
    openAnswersCount: "Suggerimenti aperti",
    anonymizedCount: "Testi anonimizzati",
    outOfFive: "su 5.00",
    evaluationHeading: "Punteggi medi sui cinque criteri",
    demographicsHeading: "Profilo demografico aggregato",
    responsesHeading: "Risposte individuali anonime",
    searchPlaceholder: "Cerca nei suggerimenti, località o occupazione…",
    allLanguages: "Tutte le lingue",
    allAgeGroups: "Tutte le fasce d'età",
    unspecified: "Non specificato",
    topLocalities: "Località principali",
    topOccupations: "Occupazioni indicate",
    deleteEntry: "Elimina",
    deleteConfirm: "Eliminare definitivamente questa valutazione anonima?",
    tableWhen: "Data",
    tableScores: "Voti (1–5)",
    tableOpenAnswer: "Funzioni desiderate",
    tableDemographics: "Dati demografici",
    tableActions: "Azioni",
    noOpenAnswer: "Nessun commento aperto",
    redactedTag: "Dati personali rimossi",
  },
  hr: {
    navLabel: "Ocjene platforme",
    title: "Ocjene i povratne informacije posjetitelja",
    subtitle: "Anonimne ocjene 1–5, otvoreni prijedlozi i demografska raspodjela.",
    privacyBadge: "Automatski anonimizirano (bez IP-a, emaila ili telefona)",
    refresh: "Osvježi",
    refreshing: "Učitavanje…",
    exportCsv: "Izvezi CSV",
    noDatabase: "Kontrolna baza podataka nije konfigurirana.",
    emptyState: "Još nema zapisa za odabrani filtar.",
    totalResponses: "Ukupno odgovora",
    overallScore: "Ukupni prosjek",
    openAnswersCount: "Otvoreni prijedlozi",
    anonymizedCount: "Anonimizirani tekstovi",
    outOfFive: "od 5.00",
    evaluationHeading: "Prosječne ocjene po pet kriterija",
    demographicsHeading: "Zbirni demografski profil",
    responsesHeading: "Pojedinačni anonimni odgovori",
    searchPlaceholder: "Pretraži prijedloge, mjesto ili zanimanje…",
    allLanguages: "Svi jezici",
    allAgeGroups: "Sve dobne skupine",
    unspecified: "Nije navedeno",
    topLocalities: "Najčešća mjesta",
    topOccupations: "Navedena zanimanja",
    deleteEntry: "Obriši",
    deleteConfirm: "Trajno obrisati ovaj anonimni unos?",
    tableWhen: "Datum",
    tableScores: "Ocjene (1–5)",
    tableOpenAnswer: "Željene mogućnosti",
    tableDemographics: "Demografija",
    tableActions: "Radnje",
    noOpenAnswer: "Bez otvorenog odgovora",
    redactedTag: "Osobni podaci uklonjeni",
  },
  rom: {
    navLabel: "Evaluaciye platformake",
    title: "Evaluaciye thaj feedback katar vizitatorya",
    subtitle: "Anonimne note 1–5, putarde ideye thaj demografikani distribuciya.",
    privacyBadge: "Anonimizirime korkori (bi IP, emailo vaj telefono)",
    refresh: "Nevjar",
    refreshing: "Pharel pe…",
    exportCsv: "Eksportisar CSV",
    noDatabase: "I baza e datengi naj lashardi.",
    emptyState: "Inke naj feedback vash kadava filtro.",
    totalResponses: "Savore palpale phenimata",
    overallScore: "Mashkarutni nota",
    openAnswersCount: "Putarde ideye",
    anonymizedCount: "Teksturya uzharde",
    outOfFive: "katar 5.00",
    evaluationHeading: "Mashkarutne note pe pandzh phuchimata",
    demographicsHeading: "Demografikano profilo",
    responsesHeading: "Anonimne palpale phenimata",
    searchPlaceholder: "Rod ande ideye, foro vaj buchi…",
    allLanguages: "Savore chhiba",
    allAgeGroups: "Savore grupe bershenge",
    unspecified: "Bi-phendo",
    topLocalities: "Maj but phende fora thaj gava",
    topOccupations: "Phende bucha",
    deleteEntry: "Khos",
    deleteConfirm: "Khoses kadava anonimno feedback?",
    tableWhen: "Data",
    tableScores: "Note (1–5)",
    tableOpenAnswer: "So kamen ande aplikaciya",
    tableDemographics: "Demografiya",
    tableActions: "Bucha",
    noOpenAnswer: "Bi putarde tekstosko",
    redactedTag: "Personalne date khosle",
  },
};
