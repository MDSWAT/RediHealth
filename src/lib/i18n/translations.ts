export type Lang = "en" | "ro" | "sq" | "it";

export const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ro", label: "Română" },
  { code: "sq", label: "Shqip" },
  { code: "it", label: "Italiano" },
];

export type Translations = {
  nav: {
    healthInformation: string;
    healthCheck: string;
    findHelp: string;
    about: string;
  };
  account: {
    signIn: string;
    panel: string;
  };
  header: {
    getHelp: string;
    demo: string;
  };
  hero: {
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    paragraph: string;
    cta: string;
    phone: {
      status: string;
      messages: string[];
      factcheckLine1: string;
      factcheckLine2: string;
      source: string;
      button: string;
    };
  };
  footer: {
    disclaimer: string;
    govPartner: string;
    healthcarePartners: string;
    groups: {
      health: { heading: string; healthInformation: string; findHelp: string };
      platform: { heading: string; about: string; contact: string; accessibility: string };
      legal: { heading: string; privacy: string; terms: string };
    };
  };
  landing: {
    mythBuster: { title: string; subtitle: string; messageLabel: string };
    helpOptions: {
      title: string;
      subtitle: string;
      options: { title: string; description: string; cta: string }[];
    };
    healthTopics: {
      title: string;
      subtitle: string;
      viewAll: string;
      topics: { title: string; description: string }[];
    };
    medicalAssistance: {
      title: string;
      subtitle: string;
      requestHelp: string;
      findServices: string;
      steps: { title: string; description: string }[];
    };
    trustSection: {
      title: string;
      subtitle: string;
      partnersLabel: string;
      partnerLogo: string;
      commitments: { title: string; description: string }[];
    };
    emergencyNotice: { title: string; description: string };
  };
  getHelpPage: {
    heroTitle: string;
    heroParagraph: string;
    form: {
      fullNameLabel: string;
      fullNameOptional: string;
      fullNamePlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      descriptionHint: string;
      privacyNote: string;
      submitting: string;
      submit: string;
      genericError: string;
      errorPhone: string;
      errorEmailRequired: string;
      errorEmailInvalid: string;
      errorDescription: string;
      successTitle: string;
      successBody: string;
      successNotice: string;
      backHome: string;
      submitAnother: string;
    };
    sidebar: {
      emergencyTitle: string;
      emergencyBody: string;
      whatsNextTitle: string;
      steps: string[];
    };
  };
  signInPage: {
    heroTitle: string;
    heroParagraphWithGoogle: string;
    heroParagraphNoGoogle: string;
    terms: string;
    unauthorizedGoogle: string;
    form: {
      emailLabel: string;
      emailPlaceholder: string;
      emailHint: string;
      emailInvalid: string;
      sendingCode: string;
      emailMeCode: string;
      genericSendError: string;
      checkEmailTitle: string;
      codeSentBody: (email: string) => string;
      codeLabel: string;
      codeInvalid: string;
      genericVerifyError: string;
      signingIn: string;
      continueLabel: string;
      useDifferentEmail: string;
      or: string;
      continueWithGoogle: string;
    };
  };
  findHelpPage: {
    heroTitle: string;
    heroParagraph: string;
    listTitle: string;
    listSubtitle: string;
    loadingMap: string;
    mapAttribution: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
  };
  healthInfoPage: {
    eyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    browseTitle: string;
    browseSubtitle: string;
    readMore: string;
    usingInfoTitle: string;
    usingInfoSubtitle: string;
    usingInfoSteps: { title: string; description: string }[];
    ctaTitle: string;
    ctaBody: string;
    ctaDisclaimer: string;
  };
  notFoundPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    backHome: string;
    exploreHealth: string;
  };
};

export const translations: Record<Lang, Translations> = {
  en: {
    nav: {
      healthInformation: "Health Information",
      healthCheck: "Health Check",
      findHelp: "Find Medical Help",
      about: "About",
    },
    account: {
      signIn: "Sign In",
      panel: "Panel",
    },
    header: {
      getHelp: "Get Help",
      demo: "Demo",
    },
    hero: {
      titleLine1: "Better Health",
      titleLine2: "starts with you.",
      titleLine3: "Health mediators better supported.",
      paragraph:
        "REDI Health helps families, including Roma communities, understand health information and equips mediators with digital tools to educate, guide, refer, and follow up.",
      cta: "Request Medical Help",
      phone: {
        status: "online",
        messages: [
          "The flu vaccine causes the flu",
          "False.",
          "Flu vaccines cannot give you the flu.",
          "Your life is more important than made-up stories.",
          "Get health advice from trusted medical sources.",
        ],
        factcheckLine1: "This statement can be misleading",
        factcheckLine2:
          "The flu vaccine does not contain a live virus capable of causing the flu in the form presented in the message.",
        source: "Source: WHO, Ministry of Health",
        button: "Request Mediators help",
      },
    },
    footer: {
      disclaimer:
        "Health information on this platform is educational and does not replace professional medical advice.",
      govPartner: "Government Partner",
      healthcarePartners: "Healthcare Partners",
      groups: {
        health: { heading: "Health", healthInformation: "Health Information", findHelp: "Find Medical Help" },
        platform: { heading: "Platform", about: "About the Platform", contact: "Contact", accessibility: "Accessibility" },
        legal: { heading: "Legal", privacy: "Privacy", terms: "Terms" },
      },
    },
    landing: {
      mythBuster: {
        title: "Bust a viral myth",
        subtitle: "False health claims spread fast. Check the facts before making a decision about your health.",
        messageLabel: "Message",
      },
      helpOptions: {
        title: "How can we help?",
        subtitle: "Choose what you need and we'll guide you through the next steps.",
        options: [
          {
            title: "Learn About Your Health",
            description: "Understand common health risks and learn practical ways to protect your health.",
            cta: "Explore Health Topics",
          },
          {
            title: "Check Your Health Risks",
            description: "Answer a few simple questions to better understand potential health risks.",
            cta: "Start Health Check",
          },
          {
            title: "Get Medical Help",
            description: "Find healthcare services or ask for help arranging an appointment.",
            cta: "Find Help",
          },
        ],
      },
      healthTopics: {
        title: "Take care of your health",
        subtitle: "Small, preventive actions taken today can meaningfully reduce your health risks over time.",
        viewAll: "View all health topics",
        topics: [
          { title: "Heart Health", description: "Simple habits that support a healthy heart and blood pressure." },
          { title: "Diabetes", description: "Understand risk factors and everyday ways to stay in balance." },
          { title: "Healthy Eating", description: "Practical, affordable food choices for better wellbeing." },
          { title: "Physical Activity", description: "Easy ways to move more, whatever your starting point." },
          { title: "Mental Wellbeing", description: "Care for your mind and know when to reach out for support." },
          { title: "Smoking", description: "Benefits of quitting and steps that make it more achievable." },
          { title: "Preventive Screening", description: "Check-ups that can catch problems early, before symptoms." },
          { title: "Women's Health", description: "Guidance across different life stages and health needs." },
        ],
      },
      medicalAssistance: {
        title: "Need help getting medical care?",
        subtitle:
          "If you're having difficulty finding a doctor or arranging an appointment, our support team can help guide you through the process.",
        requestHelp: "Request Help",
        findServices: "Find Healthcare Services",
        steps: [
          {
            title: "Tell us what you need",
            description: "Share a few details about the help you're looking for. Plain language, no forms full of jargon.",
          },
          {
            title: "A support worker reviews your request",
            description: "A healthcare support worker reads your request and works out how best to help.",
          },
          {
            title: "We help you find the right service",
            description: "We guide you toward the appropriate service and support you along the way.",
          },
        ],
      },
      trustSection: {
        title: "A trusted public health service",
        subtitle: "Built to support everyone, with care taken over accuracy, privacy, and accessibility.",
        partnersLabel: "Government and healthcare partners",
        partnerLogo: "Partner logo",
        commitments: [
          { title: "Free public service", description: "A public service available to everyone at no cost." },
          { title: "Privacy and data protection", description: "Your information is handled carefully and kept confidential." },
          { title: "Accessible health information", description: "Clear, plain-language guidance designed to be easy to use." },
          { title: "Reviewed by professionals", description: "Information reviewed by qualified healthcare professionals." },
        ],
      },
      emergencyNotice: {
        title: "In a medical emergency",
        description: "If you think you may be experiencing a medical emergency, contact your local emergency service immediately.",
      },
    },
    getHelpPage: {
      heroTitle: "Request medical help",
      heroParagraph:
        "If you're having difficulty finding a doctor or arranging an appointment, tell us a little about what you need. A healthcare support worker will review your request and get in touch.",
      form: {
        fullNameLabel: "Full name",
        fullNameOptional: "(optional)",
        fullNamePlaceholder: "Your name",
        phoneLabel: "Phone number",
        phonePlaceholder: "e.g. 0123 456 789",
        emailLabel: "Email address",
        emailPlaceholder: "you@example.com",
        descriptionLabel: "Briefly, what's wrong?",
        descriptionPlaceholder: "Tell us what you need help with, such as your symptoms or the kind of care you're trying to arrange.",
        descriptionHint: "Please don't include more personal detail than you need to.",
        privacyNote: "Your details are used only to respond to your request and are handled confidentially.",
        submitting: "Sending request...",
        submit: "Send request",
        genericError: "We could not save your request. Please try again.",
        errorPhone: "Please enter a phone number we can reach you on.",
        errorEmailRequired: "Please enter your email address.",
        errorEmailInvalid: "Please enter a valid email address.",
        errorDescription: "Please describe what's wrong in a little more detail (at least 10 characters).",
        successTitle: "Your request has been received",
        successBody: "We have sent a confirmation email to your address. A healthcare support worker will review what you've shared and get in touch using the contact details you provided.",
        successNotice: "This service does not provide emergency care. If you think you may be experiencing a medical emergency, contact your local emergency service immediately.",
        backHome: "Back to home",
        submitAnother: "Submit another request",
      },
      sidebar: {
        emergencyTitle: "In a medical emergency",
        emergencyBody: "This service is not for emergencies. If you think you may be experiencing a medical emergency, contact your local emergency service immediately.",
        whatsNextTitle: "What happens next",
        steps: [
          "We review the details you share.",
          "A support worker gets in touch using your contact details.",
          "We help guide you toward the right service.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Sign in to RediHealth",
      heroParagraphWithGoogle: "Use your email address to receive a one-time sign-in code, or continue securely with your Google account.",
      heroParagraphNoGoogle: "Use your email address to receive a one-time sign-in code.",
      terms: "By continuing, you agree to our Terms and acknowledge our Privacy Notice.",
      unauthorizedGoogle: "This Google account is not authorized to access RediHealth.",
      form: {
        emailLabel: "Email address",
        emailPlaceholder: "you@example.com",
        emailHint: "We'll send a six-digit code to this address.",
        emailInvalid: "Enter a valid email address.",
        sendingCode: "Sending code...",
        emailMeCode: "Email me a code",
        genericSendError: "We could not send a code. Please try again.",
        checkEmailTitle: "Check your email",
        codeSentBody: (email: string) => `We sent a six-digit code to ${email}. It expires in 10 minutes.`,
        codeLabel: "Six-digit code",
        codeInvalid: "Enter the six-digit code from your email.",
        genericVerifyError: "We could not verify that code. Please try again.",
        signingIn: "Signing in...",
        continueLabel: "Continue",
        useDifferentEmail: "Use a different email",
        or: "or",
        continueWithGoogle: "Continue with Google",
      },
    },
    findHelpPage: {
      heroTitle: "Find medical help",
      heroParagraph: "Browse medical institutes near you and see where they are on the map. Select a place to view its address and contact details.",
      listTitle: "Medical institutes",
      listSubtitle: "Select a place to highlight it on the map.",
      loadingMap: "Loading map…",
      mapAttribution: "Map data © OpenStreetMap contributors © CARTO.",
      ctaTitle: "Not sure where to go?",
      ctaBody: "If you need help choosing or arranging care, our support team can guide you. In a medical emergency, contact your local emergency service immediately.",
      ctaButton: "Request Medical Help",
    },
    healthInfoPage: {
      eyebrow: "Health Information",
      heroTitle: "Understand your health, one topic at a time",
      heroSubtitle: "Reliable, plain-language health information to help you understand common conditions, protect your health, and know when to seek medical care.",
      browseTitle: "Browse health topics",
      browseSubtitle: "Choose a topic to learn practical, everyday ways to look after your health.",
      readMore: "Read more",
      usingInfoTitle: "How to use this information",
      usingInfoSubtitle: "Health information here is educational. It can help you make informed choices, but it does not replace advice from a qualified professional.",
      usingInfoSteps: [
        { title: "Learn the basics", description: "Start with a topic that matters to you and read the plain-language overview." },
        { title: "Understand your risks", description: "Notice the everyday factors that affect your health and what you can change." },
        { title: "Take a next step", description: "Use the guidance to make a small change or decide when to seek care." },
      ],
      ctaTitle: "Need help getting medical care?",
      ctaBody: "If reading about your health raises questions or concerns, our support team can help guide you toward the right service.",
      ctaDisclaimer: "This information is educational and does not provide a medical diagnosis.",
    },
    notFoundPage: {
      eyebrow: "404",
      title: "We can't find that page",
      subtitle: "The page you're looking for may have been moved or no longer exists. Let's get you back on track.",
      backHome: "Back to home",
      exploreHealth: "Explore health information",
    },
  },
  ro: {
    nav: {
      healthInformation: "Informații medicale",
      healthCheck: "Verificare medicală",
      findHelp: "Găsește ajutor medical",
      about: "Despre noi",
    },
    account: {
      signIn: "Autentificare",
      panel: "Panou",
    },
    header: {
      getHelp: "Cere ajutor",
      demo: "Demo",
    },
    hero: {
      titleLine1: "O sănătate mai bună",
      titleLine2: "începe cu tine.",
      titleLine3: "Mediatorii sanitari, mai bine sprijiniți.",
      paragraph:
        "REDI Health ajută familiile, inclusiv comunitățile de romi, să înțeleagă informațiile medicale și oferă mediatorilor instrumente digitale pentru a educa, ghida, îndruma și urmări cazurile.",
      cta: "Solicită ajutor medical",
      phone: {
        status: "online",
        messages: [
          "Vaccinul împotriva gripei provoacă gripă",
          "Fals.",
          "Vaccinurile antigripale nu pot provoca gripă.",
          "Viața ta este mai importantă decât poveștile inventate.",
          "Cere sfaturi medicale de la surse de încredere.",
        ],
        factcheckLine1: "Afirmația poate induce în eroare",
        factcheckLine2:
          "Vaccinul gripal nu conține virus viu capabil să provoace gripă în forma prezentă în mesaj.",
        source: "Sursa: OMS, Ministerul Sănătății",
        button: "Solicită ajutorul mediatorilor",
      },
    },
    footer: {
      disclaimer:
        "Informațiile medicale de pe această platformă au scop educativ și nu înlocuiesc sfatul medical de specialitate.",
      govPartner: "Partener guvernamental",
      healthcarePartners: "Parteneri medicali",
      groups: {
        health: { heading: "Sănătate", healthInformation: "Informații medicale", findHelp: "Găsește ajutor medical" },
        platform: { heading: "Platformă", about: "Despre platformă", contact: "Contact", accessibility: "Accesibilitate" },
        legal: { heading: "Legal", privacy: "Confidențialitate", terms: "Termeni" },
      },
    },
    landing: {
      mythBuster: {
        title: "Demontează un mit viral",
        subtitle: "Informațiile medicale false se răspândesc rapid. Verifică faptele înainte de a lua o decizie despre sănătatea ta.",
        messageLabel: "Mesaj",
      },
      helpOptions: {
        title: "Cu ce te putem ajuta?",
        subtitle: "Alege de ce ai nevoie și te vom ghida spre următorii pași.",
        options: [
          {
            title: "Află despre sănătatea ta",
            description: "Înțelege riscurile comune pentru sănătate și învață modalități practice de a te proteja.",
            cta: "Explorează informații medicale",
          },
          {
            title: "Verifică-ți riscurile de sănătate",
            description: "Răspunde la câteva întrebări simple pentru a înțelege mai bine riscurile posibile.",
            cta: "Începe verificarea",
          },
          {
            title: "Obține ajutor medical",
            description: "Găsește servicii medicale sau cere ajutor pentru a programa o consultație.",
            cta: "Găsește ajutor",
          },
        ],
      },
      healthTopics: {
        title: "Ai grijă de sănătatea ta",
        subtitle: "Acțiuni preventive mici, luate astăzi, pot reduce semnificativ riscurile tale de sănătate pe termen lung.",
        viewAll: "Vezi toate subiectele medicale",
        topics: [
          { title: "Sănătatea inimii", description: "Obiceiuri simple care susțin o inimă și o tensiune arterială sănătoase." },
          { title: "Diabet", description: "Înțelege factorii de risc și modalitățile zilnice de a rămâne echilibrat." },
          { title: "Alimentație sănătoasă", description: "Alegeri alimentare practice și accesibile pentru o stare de bine mai bună." },
          { title: "Activitate fizică", description: "Modalități simple de a te mișca mai mult, indiferent de punctul de plecare." },
          { title: "Bunăstare mentală", description: "Ai grijă de mintea ta și știi când să ceri sprijin." },
          { title: "Fumatul", description: "Beneficiile renunțării și pașii care fac acest lucru mai realizabil." },
          { title: "Screening preventiv", description: "Controale care pot depista probleme din timp, înainte de apariția simptomelor." },
          { title: "Sănătatea femeii", description: "Îndrumări pentru diferite etape de viață și nevoi de sănătate." },
        ],
      },
      medicalAssistance: {
        title: "Ai nevoie de ajutor pentru a obține îngrijire medicală?",
        subtitle:
          "Dacă întâmpini dificultăți în a găsi un medic sau a programa o consultație, echipa noastră de suport te poate ghida în acest proces.",
        requestHelp: "Solicită ajutor",
        findServices: "Găsește servicii medicale",
        steps: [
          {
            title: "Spune-ne de ce ai nevoie",
            description: "Oferă câteva detalii despre ajutorul pe care îl cauți. Limbaj simplu, fără formulare pline de termeni tehnici.",
          },
          {
            title: "Un lucrător de sprijin îți analizează cererea",
            description: "Un lucrător medical de sprijin îți citește cererea și stabilește cum te poate ajuta cel mai bine.",
          },
          {
            title: "Te ajutăm să găsești serviciul potrivit",
            description: "Te îndrumăm către serviciul potrivit și te sprijinim pe tot parcursul procesului.",
          },
        ],
      },
      trustSection: {
        title: "Un serviciu public de sănătate de încredere",
        subtitle: "Construit pentru a sprijini pe toată lumea, cu atenție la acuratețe, confidențialitate și accesibilitate.",
        partnersLabel: "Parteneri guvernamentali și medicali",
        partnerLogo: "Logo partener",
        commitments: [
          { title: "Serviciu public gratuit", description: "Un serviciu public disponibil tuturor, fără costuri." },
          { title: "Confidențialitate și protecția datelor", description: "Informațiile tale sunt gestionate cu grijă și păstrate confidențiale." },
          { title: "Informații medicale accesibile", description: "Îndrumări clare, în limbaj simplu, concepute pentru a fi ușor de utilizat." },
          { title: "Revizuit de profesioniști", description: "Informații revizuite de profesioniști medicali calificați." },
        ],
      },
      emergencyNotice: {
        title: "În caz de urgență medicală",
        description: "Dacă crezi că te confrunți cu o urgență medicală, contactează imediat serviciul local de urgență.",
      },
    },
    getHelpPage: {
      heroTitle: "Solicită ajutor medical",
      heroParagraph:
        "Dacă întâmpini dificultăți în a găsi un medic sau a programa o consultație, spune-ne pe scurt de ce ai nevoie. Un lucrător medical de sprijin îți va analiza cererea și te va contacta.",
      form: {
        fullNameLabel: "Nume complet",
        fullNameOptional: "(opțional)",
        fullNamePlaceholder: "Numele tău",
        phoneLabel: "Număr de telefon",
        phonePlaceholder: "ex. 0712 345 678",
        emailLabel: "Adresă de email",
        emailPlaceholder: "tu@exemplu.com",
        descriptionLabel: "Pe scurt, ce nu este în regulă?",
        descriptionPlaceholder: "Spune-ne cu ce ai nevoie de ajutor, precum simptomele tale sau tipul de îngrijire pe care încerci să o organizezi.",
        descriptionHint: "Te rugăm să nu incluzi mai multe detalii personale decât este necesar.",
        privacyNote: "Detaliile tale sunt folosite doar pentru a răspunde cererii tale și sunt tratate confidențial.",
        submitting: "Se trimite cererea...",
        submit: "Trimite cererea",
        genericError: "Nu am putut salva cererea ta. Te rugăm să încerci din nou.",
        errorPhone: "Te rugăm să introduci un număr de telefon la care te putem contacta.",
        errorEmailRequired: "Te rugăm să introduci adresa ta de email.",
        errorEmailInvalid: "Te rugăm să introduci o adresă de email validă.",
        errorDescription: "Te rugăm să descrii mai detaliat ce nu este în regulă (cel puțin 10 caractere).",
        successTitle: "Cererea ta a fost primită",
        successBody: "Am trimis un email de confirmare la adresa ta. Un lucrător medical de sprijin va analiza ce ai trimis și te va contacta folosind detaliile de contact furnizate.",
        successNotice: "Acest serviciu nu oferă îngrijire de urgență. Dacă crezi că te confrunți cu o urgență medicală, contactează imediat serviciul local de urgență.",
        backHome: "Înapoi la pagina principală",
        submitAnother: "Trimite o altă cerere",
      },
      sidebar: {
        emergencyTitle: "În caz de urgență medicală",
        emergencyBody: "Acest serviciu nu este pentru urgențe. Dacă crezi că te confrunți cu o urgență medicală, contactează imediat serviciul local de urgență.",
        whatsNextTitle: "Ce urmează",
        steps: [
          "Analizăm detaliile pe care le-ai trimis.",
          "Un lucrător de sprijin te contactează folosind detaliile tale de contact.",
          "Te ajutăm să găsești serviciul potrivit.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Autentifică-te în RediHealth",
      heroParagraphWithGoogle: "Folosește adresa ta de email pentru a primi un cod de autentificare unic, sau continuă în siguranță cu contul tău Google.",
      heroParagraphNoGoogle: "Folosește adresa ta de email pentru a primi un cod de autentificare unic.",
      terms: "Continuând, ești de acord cu Termenii noștri și confirmi Politica de confidențialitate.",
      unauthorizedGoogle: "Acest cont Google nu este autorizat să acceseze RediHealth.",
      form: {
        emailLabel: "Adresă de email",
        emailPlaceholder: "tu@exemplu.com",
        emailHint: "Îți vom trimite un cod din șase cifre la această adresă.",
        emailInvalid: "Introdu o adresă de email validă.",
        sendingCode: "Se trimite codul...",
        emailMeCode: "Trimite-mi un cod",
        genericSendError: "Nu am putut trimite un cod. Te rugăm să încerci din nou.",
        checkEmailTitle: "Verifică-ți emailul",
        codeSentBody: (email: string) => `Am trimis un cod din șase cifre la ${email}. Expiră în 10 minute.`,
        codeLabel: "Cod din șase cifre",
        codeInvalid: "Introdu codul din șase cifre primit pe email.",
        genericVerifyError: "Nu am putut verifica acel cod. Te rugăm să încerci din nou.",
        signingIn: "Se autentifică...",
        continueLabel: "Continuă",
        useDifferentEmail: "Folosește o altă adresă de email",
        or: "sau",
        continueWithGoogle: "Continuă cu Google",
      },
    },
    findHelpPage: {
      heroTitle: "Găsește ajutor medical",
      heroParagraph: "Explorează instituțiile medicale din apropiere și vezi unde se află pe hartă. Selectează un loc pentru a-i vedea adresa și datele de contact.",
      listTitle: "Instituții medicale",
      listSubtitle: "Selectează un loc pentru a-l evidenția pe hartă.",
      loadingMap: "Se încarcă harta…",
      mapAttribution: "Date hartă © contribuitori OpenStreetMap © CARTO.",
      ctaTitle: "Nu știi unde să mergi?",
      ctaBody: "Dacă ai nevoie de ajutor pentru a alege sau a organiza îngrijirea, echipa noastră de sprijin te poate ghida. În caz de urgență medicală, contactează imediat serviciul local de urgență.",
      ctaButton: "Solicită ajutor medical",
    },
    healthInfoPage: {
      eyebrow: "Informații medicale",
      heroTitle: "Înțelege-ți sănătatea, un subiect pe rând",
      heroSubtitle: "Informații medicale de încredere, în limbaj simplu, pentru a te ajuta să înțelegi afecțiunile comune, să îți protejezi sănătatea și să știi când să ceri îngrijire medicală.",
      browseTitle: "Explorează subiectele medicale",
      browseSubtitle: "Alege un subiect pentru a afla modalități practice și zilnice de a avea grijă de sănătatea ta.",
      readMore: "Citește mai mult",
      usingInfoTitle: "Cum să folosești aceste informații",
      usingInfoSubtitle: "Informațiile de aici au scop educativ. Te pot ajuta să iei decizii informate, dar nu înlocuiesc sfatul unui profesionist calificat.",
      usingInfoSteps: [
        { title: "Învață elementele de bază", description: "Începe cu un subiect care contează pentru tine și citește prezentarea în limbaj simplu." },
        { title: "Înțelege-ți riscurile", description: "Observă factorii zilnici care îți afectează sănătatea și ce poți schimba." },
        { title: "Fă un pas următor", description: "Folosește îndrumările pentru a face o schimbare mică sau pentru a decide când să ceri îngrijire." },
      ],
      ctaTitle: "Ai nevoie de ajutor pentru a obține îngrijire medicală?",
      ctaBody: "Dacă citirea despre sănătatea ta ridică întrebări sau îngrijorări, echipa noastră de sprijin te poate ghida către serviciul potrivit.",
      ctaDisclaimer: "Aceste informații au scop educativ și nu oferă un diagnostic medical.",
    },
    notFoundPage: {
      eyebrow: "404",
      title: "Nu am putut găsi acea pagină",
      subtitle: "Este posibil ca pagina căutată să fi fost mutată sau să nu mai existe. Hai să te readucem pe drumul cel bun.",
      backHome: "Înapoi la pagina principală",
      exploreHealth: "Explorează informații medicale",
    },
  },
  sq: {
    nav: {
      healthInformation: "Informacion shëndetësor",
      healthCheck: "Kontroll shëndetësor",
      findHelp: "Gjej ndihmë mjekësore",
      about: "Rreth nesh",
    },
    account: {
      signIn: "Identifikohu",
      panel: "Paneli",
    },
    header: {
      getHelp: "Kërko ndihmë",
      demo: "Demo",
    },
    hero: {
      titleLine1: "Shëndet më i mirë",
      titleLine2: "fillon me ty.",
      titleLine3: "Ndërmjetësit shëndetësorë, të mbështetur më mirë.",
      paragraph:
        "REDI Health ndihmon familjet, përfshirë komunitetet rome, të kuptojnë informacionin shëndetësor dhe u ofron ndërmjetësve mjete digjitale për të edukuar, udhëzuar, referuar dhe ndjekur rastet.",
      cta: "Kërko ndihmë mjekësore",
      phone: {
        status: "online",
        messages: [
          "Vaksina e gripit shkakton grip",
          "E rreme.",
          "Vaksinat e gripit nuk mund të shkaktojnë grip.",
          "Jeta jote është më e rëndësishme sesa tregimet e trilluara.",
          "Kërko këshilla shëndetësore nga burime të besueshme.",
        ],
        factcheckLine1: "Ky pohim mund të jetë çorientues",
        factcheckLine2:
          "Vaksina e gripit nuk përmban virus të gjallë të aftë të shkaktojë grip në formën e paraqitur në mesazh.",
        source: "Burimi: OBSH, Ministria e Shëndetësisë",
        button: "Kërko ndihmën e ndërmjetësve",
      },
    },
    footer: {
      disclaimer:
        "Informacioni shëndetësor në këtë platformë është edukativ dhe nuk zëvendëson këshillën profesionale mjekësore.",
      govPartner: "Partner qeveritar",
      healthcarePartners: "Partnerë shëndetësorë",
      groups: {
        health: { heading: "Shëndeti", healthInformation: "Informacion shëndetësor", findHelp: "Gjej ndihmë mjekësore" },
        platform: { heading: "Platforma", about: "Rreth platformës", contact: "Kontakt", accessibility: "Aksesueshmëria" },
        legal: { heading: "Ligjore", privacy: "Privatësia", terms: "Kushtet" },
      },
    },
    landing: {
      mythBuster: {
        title: "Zbulo një mit viral",
        subtitle: "Pretendimet e rreme shëndetësore përhapen shpejt. Kontrollo faktet para se të vendosësh diçka për shëndetin tënd.",
        messageLabel: "Mesazh",
      },
      helpOptions: {
        title: "Si mund të të ndihmojmë?",
        subtitle: "Zgjidh çfarë të duhet dhe ne do të të udhëzojmë për hapat e mëtejshëm.",
        options: [
          {
            title: "Mëso rreth shëndetit tënd",
            description: "Kupto rreziqet e zakonshme shëndetësore dhe mëso mënyra praktike për të mbrojtur shëndetin tënd.",
            cta: "Eksploro temat shëndetësore",
          },
          {
            title: "Kontrollo rreziqet e tua shëndetësore",
            description: "Përgjigju disa pyetjeve të thjeshta për të kuptuar më mirë rreziqet e mundshme.",
            cta: "Fillo kontrollin shëndetësor",
          },
          {
            title: "Merr ndihmë mjekësore",
            description: "Gjej shërbime shëndetësore ose kërko ndihmë për të organizuar një takim.",
            cta: "Gjej ndihmë",
          },
        ],
      },
      healthTopics: {
        title: "Kujdesu për shëndetin tënd",
        subtitle: "Veprimet e vogla parandaluese sot mund të reduktojnë ndjeshëm rreziqet e tua shëndetësore me kalimin e kohës.",
        viewAll: "Shiko të gjitha temat shëndetësore",
        topics: [
          { title: "Shëndeti i zemrës", description: "Zakone të thjeshta që mbështesin një zemër dhe presion gjaku të shëndetshëm." },
          { title: "Diabeti", description: "Kupto faktorët e rrezikut dhe mënyrat e përditshme për të ruajtur ekuilibrin." },
          { title: "Ushqyerja e shëndetshme", description: "Zgjedhje ushqimore praktike dhe të përballueshme për mirëqenie më të mirë." },
          { title: "Aktiviteti fizik", description: "Mënyra të thjeshta për t'u lëvizur më shumë, pavarësisht pikënisjes tënde." },
          { title: "Mirëqenia mendore", description: "Kujdesu për mendjen tënde dhe di kur të kërkosh mbështetje." },
          { title: "Duhani", description: "Përfitimet e lënies dhe hapat që e bëjnë atë më të arritshme." },
          { title: "Kontrollet parandaluese", description: "Kontrolle që mund të zbulojnë problemet herët, para simptomave." },
          { title: "Shëndeti i gruas", description: "Udhëzime për faza të ndryshme jetësore dhe nevoja shëndetësore." },
        ],
      },
      medicalAssistance: {
        title: "Ke nevojë për ndihmë për të marrë kujdes mjekësor?",
        subtitle:
          "Nëse po has vështirësi në gjetjen e një mjeku ose organizimin e një takimi, ekipi ynë i mbështetjes mund të të udhëzojë gjatë procesit.",
        requestHelp: "Kërko ndihmë",
        findServices: "Gjej shërbime shëndetësore",
        steps: [
          {
            title: "Na thuaj çfarë të duhet",
            description: "Ndaj disa detaje rreth ndihmës që kërkon. Gjuhë e thjeshtë, pa formularë plot me terma teknikë.",
          },
          {
            title: "Një punonjës mbështetës e shqyrton kërkesën tënde",
            description: "Një punonjës mbështetës shëndetësor lexon kërkesën tënde dhe përcakton mënyrën më të mirë për të ndihmuar.",
          },
          {
            title: "Të ndihmojmë të gjesh shërbimin e duhur",
            description: "Të udhëzojmë drejt shërbimit të përshtatshëm dhe të mbështesim gjatë gjithë procesit.",
          },
        ],
      },
      trustSection: {
        title: "Një shërbim shëndetësor publik i besueshëm",
        subtitle: "Ndërtuar për të mbështetur të gjithë, me kujdes ndaj saktësisë, privatësisë dhe aksesueshmërisë.",
        partnersLabel: "Partnerë qeveritarë dhe shëndetësorë",
        partnerLogo: "Logo partneri",
        commitments: [
          { title: "Shërbim publik falas", description: "Një shërbim publik i disponueshëm për këdo pa kosto." },
          { title: "Privatësia dhe mbrojtja e të dhënave", description: "Informacioni yt trajtohet me kujdes dhe mbahet konfidencial." },
          { title: "Informacion shëndetësor i aksesueshëm", description: "Udhëzime të qarta, në gjuhë të thjeshtë, të krijuara për t'u përdorur lehtësisht." },
          { title: "Rishikuar nga profesionistë", description: "Informacion i rishikuar nga profesionistë të kualifikuar të shëndetësisë." },
        ],
      },
      emergencyNotice: {
        title: "Në rast urgjence mjekësore",
        description: "Nëse mendon se je duke përjetuar një urgjencë mjekësore, kontakto menjëherë shërbimin lokal të urgjencës.",
      },
    },
    getHelpPage: {
      heroTitle: "Kërko ndihmë mjekësore",
      heroParagraph:
        "Nëse po has vështirësi në gjetjen e një mjeku ose organizimin e një takimi, na thuaj shkurtimisht çfarë të duhet. Një punonjës mbështetës shëndetësor do ta shqyrtojë kërkesën tënde dhe do të të kontaktojë.",
      form: {
        fullNameLabel: "Emri i plotë",
        fullNameOptional: "(opsionale)",
        fullNamePlaceholder: "Emri yt",
        phoneLabel: "Numri i telefonit",
        phonePlaceholder: "p.sh. 067 123 4567",
        emailLabel: "Adresa e emailit",
        emailPlaceholder: "ti@shembull.com",
        descriptionLabel: "Shkurtimisht, çfarë nuk shkon?",
        descriptionPlaceholder: "Na thuaj për çfarë ke nevojë për ndihmë, si simptomat e tua ose llojin e kujdesit që po përpiqesh të organizosh.",
        descriptionHint: "Të lutemi mos përfshi më shumë detaje personale sesa të nevojshme.",
        privacyNote: "Detajet e tua përdoren vetëm për t'iu përgjigjur kërkesës tënde dhe trajtohen në mënyrë konfidenciale.",
        submitting: "Duke dërguar kërkesën...",
        submit: "Dërgo kërkesën",
        genericError: "Nuk mundëm ta ruajmë kërkesën tënde. Të lutemi provo përsëri.",
        errorPhone: "Të lutemi shkruaj një numër telefoni ku mund të të kontaktojmë.",
        errorEmailRequired: "Të lutemi shkruaj adresën tënde të emailit.",
        errorEmailInvalid: "Të lutemi shkruaj një adresë emaili të vlefshme.",
        errorDescription: "Të lutemi përshkruaj më në detaje çfarë nuk shkon (të paktën 10 karaktere).",
        successTitle: "Kërkesa jote u pranua",
        successBody: "Kemi dërguar një email konfirmimi në adresën tënde. Një punonjës mbështetës shëndetësor do ta shqyrtojë atë që ke ndarë dhe do të të kontaktojë duke përdorur detajet e kontaktit që ke dhënë.",
        successNotice: "Ky shërbim nuk ofron kujdes urgjent. Nëse mendon se je duke përjetuar një urgjencë mjekësore, kontakto menjëherë shërbimin lokal të urgjencës.",
        backHome: "Kthehu në faqen kryesore",
        submitAnother: "Dërgo një kërkesë tjetër",
      },
      sidebar: {
        emergencyTitle: "Në rast urgjence mjekësore",
        emergencyBody: "Ky shërbim nuk është për urgjenca. Nëse mendon se je duke përjetuar një urgjencë mjekësore, kontakto menjëherë shërbimin lokal të urgjencës.",
        whatsNextTitle: "Çfarë ndodh më pas",
        steps: [
          "Shqyrtojmë detajet që ke ndarë.",
          "Një punonjës mbështetës të kontakton duke përdorur detajet e tua të kontaktit.",
          "Të ndihmojmë të gjesh shërbimin e duhur.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Identifikohu në RediHealth",
      heroParagraphWithGoogle: "Përdor adresën tënde të emailit për të marrë një kod identifikimi një-përdorimësh, ose vazhdo në mënyrë të sigurt me llogarinë tënde Google.",
      heroParagraphNoGoogle: "Përdor adresën tënde të emailit për të marrë një kod identifikimi një-përdorimësh.",
      terms: "Duke vazhduar, pranon Kushtet tona dhe konfirmon Njoftimin tonë të Privatësisë.",
      unauthorizedGoogle: "Kjo llogari Google nuk është e autorizuar të aksesojë RediHealth.",
      form: {
        emailLabel: "Adresa e emailit",
        emailPlaceholder: "ti@shembull.com",
        emailHint: "Do të dërgojmë një kod gjashtë-shifror në këtë adresë.",
        emailInvalid: "Shkruaj një adresë emaili të vlefshme.",
        sendingCode: "Duke dërguar kodin...",
        emailMeCode: "Më dërgo një kod",
        genericSendError: "Nuk mundëm të dërgojmë një kod. Të lutemi provo përsëri.",
        checkEmailTitle: "Kontrollo emailin tënd",
        codeSentBody: (email: string) => `Dërguam një kod gjashtë-shifror në ${email}. Skadon pas 10 minutash.`,
        codeLabel: "Kodi gjashtë-shifror",
        codeInvalid: "Shkruaj kodin gjashtë-shifror nga emaili yt.",
        genericVerifyError: "Nuk mundëm ta verifikojmë atë kod. Të lutemi provo përsëri.",
        signingIn: "Duke u identifikuar...",
        continueLabel: "Vazhdo",
        useDifferentEmail: "Përdor një email tjetër",
        or: "ose",
        continueWithGoogle: "Vazhdo me Google",
      },
    },
    findHelpPage: {
      heroTitle: "Gjej ndihmë mjekësore",
      heroParagraph: "Shfleto institucionet shëndetësore pranë teje dhe shiko ku ndodhen në hartë. Zgjidh një vend për të parë adresën dhe detajet e kontaktit.",
      listTitle: "Institucionet shëndetësore",
      listSubtitle: "Zgjidh një vend për ta theksuar në hartë.",
      loadingMap: "Duke ngarkuar hartën…",
      mapAttribution: "Të dhënat e hartës © kontribuesit e OpenStreetMap © CARTO.",
      ctaTitle: "Nuk je i sigurt ku të shkosh?",
      ctaBody: "Nëse ke nevojë për ndihmë në zgjedhjen ose organizimin e kujdesit, ekipi ynë i mbështetjes mund të të udhëzojë. Në rast urgjence mjekësore, kontakto menjëherë shërbimin lokal të urgjencës.",
      ctaButton: "Kërko ndihmë mjekësore",
    },
    healthInfoPage: {
      eyebrow: "Informacion shëndetësor",
      heroTitle: "Kupto shëndetin tënd, një temë në herë",
      heroSubtitle: "Informacion shëndetësor i besueshëm, në gjuhë të thjeshtë, që të ndihmon të kuptosh gjendjet e zakonshme, të mbrosh shëndetin tënd dhe të dish kur të kërkosh kujdes mjekësor.",
      browseTitle: "Shfleto temat shëndetësore",
      browseSubtitle: "Zgjidh një temë për të mësuar mënyra praktike dhe të përditshme për t'u kujdesur për shëndetin tënd.",
      readMore: "Lexo më shumë",
      usingInfoTitle: "Si të përdorësh këtë informacion",
      usingInfoSubtitle: "Informacioni këtu është edukativ. Mund të të ndihmojë të bësh zgjedhje të informuara, por nuk zëvendëson këshillën e një profesionisti të kualifikuar.",
      usingInfoSteps: [
        { title: "Mëso bazat", description: "Fillo me një temë që ka rëndësi për ty dhe lexo përmbledhjen në gjuhë të thjeshtë." },
        { title: "Kupto rreziqet e tua", description: "Vër re faktorët e përditshëm që ndikojnë në shëndetin tënd dhe çfarë mund të ndryshosh." },
        { title: "Bëj një hap tjetër", description: "Përdor udhëzimet për të bërë një ndryshim të vogël ose për të vendosur kur të kërkosh kujdes." },
      ],
      ctaTitle: "Ke nevojë për ndihmë për të marrë kujdes mjekësor?",
      ctaBody: "Nëse leximi rreth shëndetit tënd ngre pyetje ose shqetësime, ekipi ynë i mbështetjes mund të të udhëzojë drejt shërbimit të duhur.",
      ctaDisclaimer: "Ky informacion është edukativ dhe nuk ofron një diagnozë mjekësore.",
    },
    notFoundPage: {
      eyebrow: "404",
      title: "Nuk mundëm ta gjejmë atë faqe",
      subtitle: "Faqja që po kërkon mund të jetë zhvendosur ose të mos ekzistojë më. Të ndihmojmë të rikthehesh në rrugën e duhur.",
      backHome: "Kthehu në faqen kryesore",
      exploreHealth: "Eksploro informacionin shëndetësor",
    },
  },
  it: {
    nav: {
      healthInformation: "Informazioni sanitarie",
      healthCheck: "Controllo sanitario",
      findHelp: "Trova assistenza medica",
      about: "Chi siamo",
    },
    account: {
      signIn: "Accedi",
      panel: "Pannello",
    },
    header: {
      getHelp: "Richiedi aiuto",
      demo: "Demo",
    },
    hero: {
      titleLine1: "Una salute migliore",
      titleLine2: "inizia da te.",
      titleLine3: "Mediatori sanitari meglio supportati.",
      paragraph:
        "REDI Health aiuta le famiglie, comprese le comunità rom, a comprendere le informazioni sanitarie e fornisce ai mediatori strumenti digitali per educare, guidare, indirizzare e seguire i casi.",
      cta: "Richiedi assistenza medica",
      phone: {
        status: "online",
        messages: [
          "Il vaccino antinfluenzale causa l'influenza",
          "Falso.",
          "I vaccini antinfluenzali non possono causare l'influenza.",
          "La tua vita è più importante delle storie inventate.",
          "Chiedi consigli sanitari a fonti attendibili.",
        ],
        factcheckLine1: "Questa affermazione può essere fuorviante",
        factcheckLine2:
          "Il vaccino antinfluenzale non contiene virus vivo in grado di causare l'influenza nella forma presentata nel messaggio.",
        source: "Fonte: OMS, Ministero della Salute",
        button: "Richiedi l'aiuto dei mediatori",
      },
    },
    footer: {
      disclaimer:
        "Le informazioni sanitarie su questa piattaforma sono a scopo educativo e non sostituiscono il parere medico professionale.",
      govPartner: "Partner governativo",
      healthcarePartners: "Partner sanitari",
      groups: {
        health: { heading: "Salute", healthInformation: "Informazioni sanitarie", findHelp: "Trova assistenza medica" },
        platform: { heading: "Piattaforma", about: "Informazioni sulla piattaforma", contact: "Contatti", accessibility: "Accessibilità" },
        legal: { heading: "Legale", privacy: "Privacy", terms: "Termini" },
      },
    },
    landing: {
      mythBuster: {
        title: "Smonta un mito virale",
        subtitle: "Le false affermazioni sanitarie si diffondono rapidamente. Verifica i fatti prima di prendere una decisione sulla tua salute.",
        messageLabel: "Messaggio",
      },
      helpOptions: {
        title: "Come possiamo aiutarti?",
        subtitle: "Scegli di cosa hai bisogno e ti guideremo nei prossimi passi.",
        options: [
          {
            title: "Scopri di più sulla tua salute",
            description: "Comprendi i rischi sanitari comuni e impara modi pratici per proteggere la tua salute.",
            cta: "Esplora gli argomenti sanitari",
          },
          {
            title: "Controlla i tuoi rischi sanitari",
            description: "Rispondi ad alcune semplici domande per comprendere meglio i possibili rischi per la salute.",
            cta: "Avvia il controllo sanitario",
          },
          {
            title: "Ottieni assistenza medica",
            description: "Trova servizi sanitari o chiedi aiuto per organizzare un appuntamento.",
            cta: "Trova assistenza",
          },
        ],
      },
      healthTopics: {
        title: "Prenditi cura della tua salute",
        subtitle: "Piccole azioni preventive intraprese oggi possono ridurre significativamente i tuoi rischi per la salute nel tempo.",
        viewAll: "Vedi tutti gli argomenti sanitari",
        topics: [
          { title: "Salute del cuore", description: "Abitudini semplici che favoriscono un cuore e una pressione sanguigna sani." },
          { title: "Diabete", description: "Comprendi i fattori di rischio e i modi quotidiani per mantenere l'equilibrio." },
          { title: "Alimentazione sana", description: "Scelte alimentari pratiche ed economiche per un benessere migliore." },
          { title: "Attività fisica", description: "Modi semplici per muoverti di più, qualunque sia il tuo punto di partenza." },
          { title: "Benessere mentale", description: "Prenditi cura della tua mente e sappi quando chiedere supporto." },
          { title: "Fumo", description: "I benefici dello smettere e i passi che lo rendono più realizzabile." },
          { title: "Screening preventivo", description: "Controlli che possono individuare i problemi precocemente, prima dei sintomi." },
          { title: "Salute della donna", description: "Indicazioni per le diverse fasi della vita e i bisogni di salute." },
        ],
      },
      medicalAssistance: {
        title: "Hai bisogno di aiuto per ottenere assistenza medica?",
        subtitle:
          "Se hai difficoltà a trovare un medico o a organizzare un appuntamento, il nostro team di supporto può guidarti nel processo.",
        requestHelp: "Richiedi aiuto",
        findServices: "Trova servizi sanitari",
        steps: [
          {
            title: "Dicci di cosa hai bisogno",
            description: "Condividi alcuni dettagli sull'aiuto che stai cercando. Linguaggio semplice, senza moduli pieni di termini tecnici.",
          },
          {
            title: "Un operatore di supporto esamina la tua richiesta",
            description: "Un operatore sanitario di supporto legge la tua richiesta e stabilisce come aiutarti al meglio.",
          },
          {
            title: "Ti aiutiamo a trovare il servizio giusto",
            description: "Ti guidiamo verso il servizio appropriato e ti supportiamo lungo il percorso.",
          },
        ],
      },
      trustSection: {
        title: "Un servizio sanitario pubblico affidabile",
        subtitle: "Costruito per supportare tutti, con attenzione all'accuratezza, alla privacy e all'accessibilità.",
        partnersLabel: "Partner governativi e sanitari",
        partnerLogo: "Logo partner",
        commitments: [
          { title: "Servizio pubblico gratuito", description: "Un servizio pubblico disponibile a tutti senza costi." },
          { title: "Privacy e protezione dei dati", description: "Le tue informazioni sono gestite con cura e mantenute riservate." },
          { title: "Informazioni sanitarie accessibili", description: "Indicazioni chiare, in linguaggio semplice, pensate per essere facili da usare." },
          { title: "Verificato da professionisti", description: "Informazioni verificate da professionisti sanitari qualificati." },
        ],
      },
      emergencyNotice: {
        title: "In caso di emergenza medica",
        description: "Se pensi di trovarti in un'emergenza medica, contatta immediatamente il servizio di emergenza locale.",
      },
    },
    getHelpPage: {
      heroTitle: "Richiedi assistenza medica",
      heroParagraph:
        "Se hai difficoltà a trovare un medico o a organizzare un appuntamento, raccontaci brevemente di cosa hai bisogno. Un operatore sanitario di supporto esaminerà la tua richiesta e ti contatterà.",
      form: {
        fullNameLabel: "Nome completo",
        fullNameOptional: "(facoltativo)",
        fullNamePlaceholder: "Il tuo nome",
        phoneLabel: "Numero di telefono",
        phonePlaceholder: "es. 0123 456 789",
        emailLabel: "Indirizzo email",
        emailPlaceholder: "tu@esempio.com",
        descriptionLabel: "Brevemente, qual è il problema?",
        descriptionPlaceholder: "Raccontaci di cosa hai bisogno, ad esempio i tuoi sintomi o il tipo di assistenza che stai cercando di organizzare.",
        descriptionHint: "Ti preghiamo di non includere più dettagli personali del necessario.",
        privacyNote: "I tuoi dati vengono utilizzati solo per rispondere alla tua richiesta e sono trattati in modo riservato.",
        submitting: "Invio della richiesta...",
        submit: "Invia richiesta",
        genericError: "Non siamo riusciti a salvare la tua richiesta. Riprova.",
        errorPhone: "Inserisci un numero di telefono a cui possiamo contattarti.",
        errorEmailRequired: "Inserisci il tuo indirizzo email.",
        errorEmailInvalid: "Inserisci un indirizzo email valido.",
        errorDescription: "Descrivi il problema in modo più dettagliato (almeno 10 caratteri).",
        successTitle: "La tua richiesta è stata ricevuta",
        successBody: "Abbiamo inviato un'email di conferma al tuo indirizzo. Un operatore sanitario di supporto esaminerà quanto condiviso e ti contatterà utilizzando i dati di contatto forniti.",
        successNotice: "Questo servizio non fornisce assistenza di emergenza. Se pensi di trovarti in un'emergenza medica, contatta immediatamente il servizio di emergenza locale.",
        backHome: "Torna alla home",
        submitAnother: "Invia un'altra richiesta",
      },
      sidebar: {
        emergencyTitle: "In caso di emergenza medica",
        emergencyBody: "Questo servizio non è per le emergenze. Se pensi di trovarti in un'emergenza medica, contatta immediatamente il servizio di emergenza locale.",
        whatsNextTitle: "Cosa succede dopo",
        steps: [
          "Esaminiamo i dettagli che hai condiviso.",
          "Un operatore di supporto ti contatta utilizzando i tuoi dati di contatto.",
          "Ti aiutiamo a trovare il servizio giusto.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Accedi a RediHealth",
      heroParagraphWithGoogle: "Usa il tuo indirizzo email per ricevere un codice di accesso monouso, oppure continua in modo sicuro con il tuo account Google.",
      heroParagraphNoGoogle: "Usa il tuo indirizzo email per ricevere un codice di accesso monouso.",
      terms: "Continuando, accetti i nostri Termini e prendi atto della nostra Informativa sulla Privacy.",
      unauthorizedGoogle: "Questo account Google non è autorizzato ad accedere a RediHealth.",
      form: {
        emailLabel: "Indirizzo email",
        emailPlaceholder: "tu@esempio.com",
        emailHint: "Invieremo un codice di sei cifre a questo indirizzo.",
        emailInvalid: "Inserisci un indirizzo email valido.",
        sendingCode: "Invio del codice...",
        emailMeCode: "Inviami un codice",
        genericSendError: "Non siamo riusciti a inviare un codice. Riprova.",
        checkEmailTitle: "Controlla la tua email",
        codeSentBody: (email: string) => `Abbiamo inviato un codice di sei cifre a ${email}. Scade tra 10 minuti.`,
        codeLabel: "Codice di sei cifre",
        codeInvalid: "Inserisci il codice di sei cifre ricevuto via email.",
        genericVerifyError: "Non siamo riusciti a verificare quel codice. Riprova.",
        signingIn: "Accesso in corso...",
        continueLabel: "Continua",
        useDifferentEmail: "Usa un'altra email",
        or: "oppure",
        continueWithGoogle: "Continua con Google",
      },
    },
    findHelpPage: {
      heroTitle: "Trova assistenza medica",
      heroParagraph: "Sfoglia le strutture sanitarie vicino a te e scopri dove si trovano sulla mappa. Seleziona un luogo per vederne l'indirizzo e i contatti.",
      listTitle: "Strutture sanitarie",
      listSubtitle: "Seleziona un luogo per evidenziarlo sulla mappa.",
      loadingMap: "Caricamento mappa…",
      mapAttribution: "Dati mappa © collaboratori di OpenStreetMap © CARTO.",
      ctaTitle: "Non sai dove andare?",
      ctaBody: "Se hai bisogno di aiuto per scegliere o organizzare l'assistenza, il nostro team di supporto può guidarti. In caso di emergenza medica, contatta immediatamente il servizio di emergenza locale.",
      ctaButton: "Richiedi assistenza medica",
    },
    healthInfoPage: {
      eyebrow: "Informazioni sanitarie",
      heroTitle: "Comprendi la tua salute, un argomento alla volta",
      heroSubtitle: "Informazioni sanitarie affidabili, in linguaggio semplice, per aiutarti a comprendere le condizioni comuni, proteggere la tua salute e sapere quando cercare assistenza medica.",
      browseTitle: "Sfoglia gli argomenti sanitari",
      browseSubtitle: "Scegli un argomento per scoprire modi pratici e quotidiani per prenderti cura della tua salute.",
      readMore: "Leggi di più",
      usingInfoTitle: "Come usare queste informazioni",
      usingInfoSubtitle: "Le informazioni qui presenti sono a scopo educativo. Possono aiutarti a fare scelte informate, ma non sostituiscono il parere di un professionista qualificato.",
      usingInfoSteps: [
        { title: "Impara le basi", description: "Inizia con un argomento che ti interessa e leggi la panoramica in linguaggio semplice." },
        { title: "Comprendi i tuoi rischi", description: "Nota i fattori quotidiani che influenzano la tua salute e cosa puoi cambiare." },
        { title: "Fai il passo successivo", description: "Usa le indicazioni per fare un piccolo cambiamento o decidere quando cercare assistenza." },
      ],
      ctaTitle: "Hai bisogno di aiuto per ottenere assistenza medica?",
      ctaBody: "Se la lettura sulla tua salute solleva domande o preoccupazioni, il nostro team di supporto può aiutarti a orientarti verso il servizio giusto.",
      ctaDisclaimer: "Queste informazioni sono a scopo educativo e non forniscono una diagnosi medica.",
    },
    notFoundPage: {
      eyebrow: "404",
      title: "Non riusciamo a trovare questa pagina",
      subtitle: "La pagina che cerchi potrebbe essere stata spostata o non esistere più. Ti aiutiamo a tornare sulla strada giusta.",
      backHome: "Torna alla home",
      exploreHealth: "Esplora le informazioni sanitarie",
    },
  },
};
