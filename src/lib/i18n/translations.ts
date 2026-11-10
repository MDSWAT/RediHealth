export type Lang = "en" | "ro" | "sq" | "it" | "hr" | "rom";

export const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ro", label: "Română" },
  { code: "sq", label: "Shqip" },
  { code: "it", label: "Italiano" },
  { code: "hr", label: "Hrvatski" },
  { code: "rom", label: "Romani" },
];

export type Translations = {
  nav: {
    healthInformation: string;
    healthCheck: string;
    findHelp: string;
    about: string;
    reportIssue: string;
  };
  account: {
    signIn: string;
    panel: string;
  };
  header: {
    getHelp: string;
    demo: string;
    navAfla: string;
    navAflaSub: string;
    navCere: string;
    navCereSub: string;
    navMedic: string;
    navMedicSub: string;
    navStiri: string;
    navStiriSub: string;
    forMediators: string;
    myAccount: string;
    medicalPanel: string;
    startHere: string;
    closeMenu: string;
    openMenu: string;
    emergencyTitle: string;
    emergencyCallPrompt: string;
    call112: string;
    mediatorProfessionals: string;
    mediatorDrawerDescription: string;
    enterMediatorModule: string;
  };
  hero: {
    trustBadge: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    paragraph: string;
    cta: string;
    assistantCta: string;
    assistantHref: string;
    assistantAlwaysVisible: boolean;
    mediatorPill: string;
    mediatorHref: string;
    telemedicinePill: string;
    emergencyNoticeVerbatim: string;
    triage: {
      badge: string;
      question: string;
      subQuestion: string;
      options: {
        id: string;
        icon: string;
        title: string;
        desc: string;
        actionLabel: string;
        actionHref: string;
      }[];
      doctorPrompt: string;
      doctorOnDutyCta: string;
      backButton: string;
      reassurance: string;
    };
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
    brandDescription: string;
    mediatorPartnershipBadge: string;
    whoStandardBadge: string;
    col1Heading: string;
    col1Link1: string;
    col1Link2: string;
    col1Link3: string;
    col1Link4: string;
    col2Heading: string;
    col2Link1: string;
    col2Link2: string;
    col2Link3: string;
    col2Link4: string;
    col3Heading: string;
    col3Link1: string;
    col3Link2: string;
    col3Link3: string;
    col3Link4: string;
    col4Heading: string;
    col4Link1: string;
    col4Link2: string;
    col4Link3: string;
    col4Link4: string;
    col4Link5: string;
    emergency112Title: string;
    emergency112Text: string;
    seeAlarmSigns: string;
    call112Button: string;
    reportIssueFallback: string;
    copyrightLine: string;
    nonEmergencyWarning: string;
  };
  landing: {
    mythBuster: { title: string; subtitle: string; messageLabel: string };
    helpOptions: {
      title: string;
      subtitle: string;
      options: { title: string; description: string; cta: string; href: string }[];
      mediatorBand: { text: string; cta: string };
    };
    healthTopics: {
      title: string;
      subtitle: string;
      viewAll: string;
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
      builtWith: string;
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
      countyLabel: string;
      selectCounty: string;
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
      privacyConsent: string;
      privacyPolicyLabel: string;
      privacyConsentRequired: string;
      errorCounty: string;
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
    authUnavailable: string;
    form: {
      emailLabel: string;
      emailPlaceholder: string;
      emailHint: string;
      emailInvalid: string;
      sendingCode: string;
      emailMeCode: string;
      portalRecoveryTitle: string;
      portalRecoveryHint: string;
      portalRecoveryEmailLabel: string;
      portalRecoveryEmailPlaceholder: string;
      portalRecoveryButton: string;
      portalRecoverySending: string;
      portalRecoverySent: string;
      portalRecoveryError: string;
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
    menuTitle: string;
    menuSubtitle: string;
    tabs: {
      menu: string;
      topics: string;
      triage: string;
    };
    triageGateway: {
      badge: string;
      title: string;
      description: string;
      cta: string;
    };
    topicsGateway: {
      badge: string;
      title: string;
      description: string;
      cta: string;
    };
    quickTopicsTitle: string;
    backToMenu: string;
    doctorValidatedBadge: string;
    romanesGlossaryButton: string;
    topicGrid?: {
      eyebrow: string;
      searchPlaceholder: string;
      searchAriaLabel: string;
      clearSearchAriaLabel: string;
      filterListAriaLabel: string;
      countSingular: string;
      countPluralTemplate: string;
      countSearchSuffix: string;
      doctorValidatedBadge: string;
      featuredRecommendationEyebrow: string;
      featuredRecommendationBody: string;
      cardActionLabel: string;
      emptyTitle: string;
      emptyDescription: string;
      emptyResetButton: string;
      categories: {
        toate: string;
        inima: string;
        diabet: string;
        nutritie: string;
        miscare: string;
        minte: string;
        fumat: string;
        screening: string;
        femei: string;
      };
    };
  };
  notFoundPage: {
    title: string;
    subtitle: string;
    backHome: string;
    exploreHealth: string;
  };
  emergency: {
    bannerAriaLabel: string;
    bannerText: string;
    dismissBannerAria: string;
    seeAlarmSigns: string;
    call112: string;
    signsModalTitle: string;
    signsModalSubtitle: string;
    closeSignsModalAria: string;
    signPrefix: string;
    signs: {
      id: string;
      title: string;
      description: string;
      actionHint: string;
    }[];
    dispatcherGuideTitle: string;
    dispatcherGuideSubtitle: string;
    dispatcherSteps: {
      title: string;
      description: string;
    }[];
    dispatcherImportantNote: string;
    freeServiceNotice: string;
    understandButton: string;
    dialerGateTitle: string;
    closeWindowAria: string;
    dialerNotice: string;
    dialerFreeNote: string;
    openDialerButton: string;
    cancelButton: string;
    desktopDialTitle: string;
    desktopDialSubtitle: string;
    desktopFreeNote: string;
    desktopRuralNote: string;
  };
  newsRibbon: {
    ariaLabel: string;
    changeCountyTitle: string;
    changeLabel: string;
    noActiveAlerts: string;
    viewAllNews: string;
    modalTitle: string;
    modalSubtitle: string;
    searchPlaceholder: string;
    detectingLocation: string;
    useAutoLocation: string;
    currentLabel: string;
    allCountiesNational: string;
    noCountyFound: string;
    closeModal: string;
    geoUnsupported: string;
    geoSuccess: string;
    geoError: string;
  };
  quiz: {
    sectionTitle: string;
    sectionSubtitle: string;
    filterAriaLabel: string;
    audioNarratorLabel: string;
    trueButton: string;
    falseButton: string;
    yourSelectedAnswer: string;
    correctAnswerTag: string;
    verifiedClarification: string;
    stopAudioAria: string;
    listenAudioAria: string;
    stopAudioLabel: string;
    listenAudioLabel: string;
    sourcePrefix: string;
    askDoctorHandover: string;
    restartFirstMyth: string;
    nextMyth: string;
    mythProgressPrefix: string;
    mythProgressOf: string;
    prevMythAria: string;
    nextMythAria: string;
  };
  mediatorBand: {
    question: string;
    description: string;
    cta: string;
  };
  newsPage: {
    heroTitle: string;
    heroSubtitle: string;
    countyLabel: string;
    allCounties: string;
    categories: {
      all: string;
      epidemics: string;
      caravan: string;
      practicalAdvice: string;
      patientRights: string;
      childHealth: string;
      vaccinationCampaigns: string;
      seasonalAdvice: string;
    };
    emptyTitle: string;
    emptySubtitle: string;
    resetFilter: string;
    backToNews: string;
    listenNarration: string;
    playAudio: string;
    pauseAudio: string;
    handoverTitle: string;
    handoverSubtitle: string;
    handoverTelemed: string;
    handoverMediator: string;
    changeCounty: string;
    saveSelection: string;
  };
  medicOnlinePage: {
    heroTitle: string;
    heroSubtitle: string;
    cardOnCallTitle: string;
    cardOnCallSubtitle: string;
    cardOnCallAction: string;
    cardBookingTitle: string;
    cardBookingSubtitle: string;
    cardBookingAction: string;
    cardPortalTitle: string;
    cardPortalSubtitle: string;
    cardPortalAction: string;
    bookingTitle: string;
    bookingSubtitle: string;
    backToDoctorOnline: string;
    backToTelemed: string;
    stepDate: string;
    stepContact: string;
    familyForWhom: string;
    familySelf: string;
    familyOther: string;
    queueTitle: string;
    queueEstimated: string;
    queueWarning: string;
    bandwidthLow: string;
    bandwidthAudioOnly: string;
  };
  mediatorsPage: {
    heroTitle: string;
    heroSubtitle: string;
    requestHelpButton: string;
    modalTitle: string;
    nameLabel: string;
    phoneLabel: string;
    countyLabel: string;
    localityLabel: string;
    helpTypeLabel: string;
    submitButton: string;
  };
  countyMap: {
    title: string;
    subtitle: string;
    allCounties: string;
    mapAriaLabel: string;
    selectedCountyPrefix: string;
    activeAlertsTooltip: string;
    generalInfoTooltip: string;
    recentNewsLabel: string;
    recentRegionsLabel: string;
    countyAriaPrefix: string;
    hasAlertsSuffix: string;
    romania: string;
    italy: string;
    pickLabel: string;
    italyMapAriaLabel: string;
    selectedRegionPrefix: string;
    allItaly: string;
    italyTitle: string;
    italySubtitle: string;
  };
  accountAuthPage: {
    title: string;
    subtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    sendCode: string;
    codeLabel: string;
    verifyCode: string;
    invalidCode: string;
    backHome: string;
  };
};

export const translations: Record<Lang, Translations> = {
  en: {
    nav: {
      healthInformation: "Health information",
      healthCheck: "Health check",
      findHelp: "Find medical help",
      about: "About",
      reportIssue: "Report an issue",
    },
    account: {
      signIn: "Sign in",
      panel: "Panel",
    },
    header: {
      getHelp: "Get help",
      demo: "Demo",
      navAfla: "Learn",
      navAflaSub: "Health guides and myths explained",
      navCere: "Ask for guidance",
      navCereSub: "Assistant and symptom check",
      navMedic: "Online doctor",
      navMedicSub: "Appointments and on-call doctor",
      navStiri: "News",
      navStiriSub: "Local alerts and mobile clinics",
      forMediators: "For health mediators",
      myAccount: "My account",
      medicalPanel: "Medical panel",
      startHere: "Start here",
      closeMenu: "Close menu",
      openMenu: "Open menu",
      emergencyTitle: "Medical emergency?",
      emergencyCallPrompt: "Call 112 directly",
      call112: "Call 112",
      mediatorProfessionals: "For professionals",
      mediatorDrawerDescription: "Are you a health mediator? Your field module and family records are here.",
      enterMediatorModule: "Open the mediator module",
    },
    hero: {
      trustBadge: "Free public service, made together with communities",
      titleLine1: "Simple health information",
      titleLine2: "and help reaching",
      titleLine3: "the right doctor.",
      paragraph:
        "REDI Health helps you understand your health, find out where to go and talk to a doctor online. It is free, for Roma communities and anyone else who needs it.",
      cta: "Tell us what worries you",
      assistantCta: "Read the guides",
      assistantHref: "/health-information",
      assistantAlwaysVisible: true,
      mediatorPill: "Are you a health mediator? Open your panel",
      mediatorHref: "/panel",
      telemedicinePill: "Online doctor",
      emergencyNoticeVerbatim:
        "Call 112 yourself. The app does not call for you.",
      triage: {
        badge: "Help in 3 steps",
        question: "What worries you today?",
        subQuestion: "Pick what fits you:",
        options: [
          {
            id: "learn",
            icon: "BookIcon",
            title: "I want to learn about health",
            desc: "Short guides and health myths, explained simply.",
            actionLabel: "Read the guides",
            actionHref: "/health-information",
          },
          {
            id: "check",
            icon: "ClipboardCheckIcon",
            title: "I want to check my symptoms",
            desc: "Show where it hurts on the body, answer three questions and see what to do next.",
            actionLabel: "Start the check",
            actionHref: "/health-check",
          },
          {
            id: "symptoms",
            icon: "ActivityIcon",
            title: "I have a health problem",
            desc: "See the warning signs and talk to the on-call doctor online.",
            actionLabel: "Talk to a doctor",
            actionHref: "/get-help?mode=doctor",
          },
          {
            id: "prescription",
            icon: "PrescriptionIcon",
            title: "I want to understand my prescription",
            desc: "Learn how and when to take your pills and what to avoid.",
            actionLabel: "Explain my prescription",
            actionHref: "/health-assistant?tab=prescription",
          },
          {
            id: "navigation",
            icon: "HandHelpingIcon",
            title: "I don't know where to go (family doctor, CNAS)",
            desc: "Help registering with a family doctor, the emergency package and your papers.",
            actionLabel: "Ask a mediator",
            actionHref: "/get-help?mode=mediator",
          },
        ],
        doctorPrompt: "Do you want to talk to a doctor online?",
        doctorOnDutyCta: "Talk to the on-call doctor",
        backButton: "Back to choices",
        reassurance: "Confidential. No account needed.",
      },
      phone: {
        status: "online",
        messages: [
          "The flu vaccine causes the flu",
          "False.",
          "Flu vaccines cannot give you the flu.",
          "Don't trust rumours.",
          "Ask a doctor or a source you trust.",
        ],
        factcheckLine1: "Misleading message",
        factcheckLine2:
          "The flu vaccine has no live virus that could give you the flu.",
        source: "Source: WHO, Ministry of Health",
        button: "Ask a mediator",
      },
    },
    footer: {
      disclaimer:
        "The information here helps you understand. It does not replace a doctor's advice.",
      govPartner: "Government partner",
      healthcarePartners: "Healthcare partners",
      groups: {
        health: { heading: "Health", healthInformation: "Health information", findHelp: "Find medical help" },
        platform: { heading: "Platform", about: "About RediHealth", contact: "Contact", accessibility: "Accessibility" },
        legal: { heading: "Legal", privacy: "Privacy", terms: "Terms" },
      },
      brandDescription:
        "RediHealth helps people in vulnerable communities understand their health, know what to do next and reach a doctor.",
      mediatorPartnershipBadge: "Partnership with the health mediators network",
      whoStandardBadge: "Free public service according to WHO standards",
      col1Heading: "Health information",
      col1Link1: "Health guides",
      col1Link2: "Ask for guidance",
      col1Link3: "Check your symptoms",
      col1Link4: "Local news and health alerts",
      col2Heading: "Clinical services",
      col2Link1: "Talk to a doctor online",
      col2Link2: "On-call doctor appointments",
      col2Link3: "Find a clinic or hospital",
      col2Link4: "My account and prescriptions",
      col3Heading: "For mediators and doctors",
      col3Link1: "Health mediators module",
      col3Link2: "Field panel",
      col3Link3: "Portal for doctors",
      col3Link4: "How doctors and mediators work together",
      col4Heading: "About and legal",
      col4Link1: "About RediHealth",
      col4Link2: "Contact and feedback",
      col4Link3: "Accessibility statement",
      col4Link4: "Privacy and data protection (GDPR)",
      col4Link5: "Terms and conditions",
      emergency112Title: "Emergency? Call 112 from any phone.",
      emergency112Text:
        "The call is free, even without credit or a SIM card. RediHealth does not call 112 for you.",
      seeAlarmSigns: "See warning signs",
      call112Button: "Call 112",
      reportIssueFallback: "Report a technical issue",
      copyrightLine: "© 2026 RediHealth. Made for vulnerable communities.",
      nonEmergencyWarning:
        "The app gives you information and guidance. It does not replace emergency care.",
    },
    landing: {
      mythBuster: {
        title: "True or false",
        subtitle: "Health rumours spread fast. Check them before you decide anything.",
        messageLabel: "Message",
      },
      helpOptions: {
        title: "How can we help?",
        subtitle: "Choose what you need and we'll show you what comes next.",
        options: [
          {
            title: "Learn about your health",
            description: "Find out about common health risks and how to protect yourself.",
            cta: "Read the guides",
            href: "/health-information",
          },
          {
            title: "Check your health",
            description: "Answer a few short questions about how you feel.",
            cta: "Start the check",
            href: "/health-check",
          },
          {
            title: "Get medical help",
            description: "Find health services or ask for help getting an appointment.",
            cta: "Find help",
            href: "/find-help",
          },
        ],
        mediatorBand: { text: "Are you a health mediator?", cta: "Open the mediator module" },
      },
      healthTopics: {
        title: "Take care of your health",
        subtitle: "Small steps you take today can lower your health risks over time.",
        viewAll: "See all health guides",
      },
      medicalAssistance: {
        title: "We help you reach a doctor",
        subtitle:
          "Can't find a doctor or get an appointment? Someone from our team reads your request and contacts you.",
        requestHelp: "Ask for help",
        findServices: "Find health services",
        steps: [
          {
            title: "Tell us what you need",
            description: "Write briefly what you need. No complicated forms.",
          },
          {
            title: "Get a clear answer",
            description: "We tell you simply what you can do.",
          },
          {
            title: "Talk to a doctor online",
            description: "If needed, we put you in touch with a doctor.",
          },
        ],
      },
      trustSection: {
        title: "Public health service",
        subtitle: "It is for anyone who needs it. The information is checked and your data stays private.",
        builtWith: "Made together with communities",
        partnersLabel: "Government and healthcare partners",
        partnerLogo: "Partner logo",
        commitments: [
          { title: "Free for everyone", description: "You pay nothing. Anyone can use it." },
          { title: "Your data stays private", description: "We look after your information and do not make it public." },
          { title: "Plain language", description: "We keep it short and avoid hard words." },
        ],
      },
      emergencyNotice: {
        title: "In a medical emergency",
        description: "If you think it is an emergency, call 112 right away.",
      },
    },
    getHelpPage: {
      heroTitle: "Ask for help",
      heroParagraph:
        "Can't find a doctor or get an appointment? Write briefly what you need. Someone from our team will read your request and contact you.",
      form: {
        countyLabel: "County",
        selectCounty: "Choose your county",
        fullNameLabel: "Full name",
        fullNameOptional: "(optional)",
        fullNamePlaceholder: "Your name",
        phoneLabel: "Phone number",
        phonePlaceholder: "e.g. 0123 456 789",
        emailLabel: "Email address",
        emailPlaceholder: "you@example.com",
        descriptionLabel: "What's the problem?",
        descriptionPlaceholder: "For example: your symptoms, or which doctor you need to see.",
        descriptionHint: "Only share the personal details we need.",
        privacyNote: "We only use your details to answer you. They stay confidential.",
        privacyConsent: "I have read and agree to the",
        privacyPolicyLabel: "Privacy Policy",
        privacyConsentRequired: "Tick the box to agree to the Privacy Policy.",
        errorCounty: "Choose your county.",
        submitting: "Sending…",
        submit: "Send request",
        genericError: "Your request was not sent. Try again.",
        errorPhone: "Enter a phone number where we can reach you.",
        errorEmailRequired: "Enter your email address.",
        errorEmailInvalid: "This email address is not correct.",
        errorDescription: "Write a little more about the problem (at least 10 characters).",
        successTitle: "We got your request",
        successBody: "Someone from our team will read your message and contact you using the details you left.",
        successNotice: "This service is not for emergencies. If it is an emergency, call 112 right away.",
        backHome: "Back to home",
        submitAnother: "Send another request",
      },
      sidebar: {
        emergencyTitle: "In a medical emergency",
        emergencyBody: "This service is not for emergencies. If it is an emergency, call 112 right away.",
        whatsNextTitle: "What happens next",
        steps: [
          "We read your message.",
          "We contact you by phone or email.",
          "We help you get to the right place.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Sign in to RediHealth",
      heroParagraphWithGoogle: "Enter your email and we'll send you a code. You can also sign in with Google.",
      heroParagraphNoGoogle: "Enter your email and we'll send you a code.",
      terms: "By continuing, you agree to our Terms and confirm you have read our Privacy Notice.",
      unauthorizedGoogle: "This Google account does not have access to RediHealth.",
      authUnavailable: "You can't sign in right now. Try again in a little while.",
      form: {
        emailLabel: "Email address",
        emailPlaceholder: "you@example.com",
        emailHint: "We'll send a 6-digit code to this address.",
        emailInvalid: "This email address is not correct.",
        sendingCode: "Sending code...",
        emailMeCode: "Email me a code",
        portalRecoveryTitle: "Patient portal access",
        portalRecoveryHint: "Lost the link to your patient portal? Enter your email and we'll send a new one.",
        portalRecoveryEmailLabel: "Patient email address",
        portalRecoveryEmailPlaceholder: "you@example.com",
        portalRecoveryButton: "Email me a new link",
        portalRecoverySending: "Sending link...",
        portalRecoverySent: "If this email has a patient portal, you'll get a new link soon.",
        portalRecoveryError: "Something went wrong. Try again in a little while.",
        genericSendError: "We couldn't send the code. Try again.",
        checkEmailTitle: "Check your email",
        codeSentBody: (email: string) => `We sent a 6-digit code to ${email}. The code expires in 10 minutes.`,
        codeLabel: "6-digit code",
        codeInvalid: "Enter the 6-digit code from your email.",
        genericVerifyError: "We couldn't check that code. Try again.",
        signingIn: "Signing in...",
        continueLabel: "Continue",
        useDifferentEmail: "Use a different email",
        or: "or",
        continueWithGoogle: "Continue with Google",
      },
    },
    findHelpPage: {
      heroTitle: "Find medical help",
      heroParagraph: "See health services near you on the map. Tap a place to see its address and phone number.",
      listTitle: "Pharmacies, clinics and hospitals",
      listSubtitle: "Tap a place to see it on the map.",
      loadingMap: "Loading map…",
      mapAttribution: "Map data © OpenStreetMap contributors.",
      ctaTitle: "Not sure where to go?",
      ctaBody: "If you don't know which doctor to see or where to go, we can guide you. In an emergency, call 112 right away.",
      ctaButton: "Ask for help",
    },
    healthInfoPage: {
      eyebrow: "Health information",
      heroTitle: "Health guides",
      heroSubtitle: "Read about common illnesses, how to protect yourself and when to see a doctor.",
      browseTitle: "Pick a topic",
      browseSubtitle: "Each guide shows what you can do every day for your health.",
      readMore: "Read more",
      usingInfoTitle: "How to use the guides",
      usingInfoSubtitle: "The guides help you understand and choose better. They do not replace a doctor's advice.",
      usingInfoSteps: [
        { title: "Read the key points", description: "Pick a topic that matters to you and read the opening part." },
        { title: "Find out your risks", description: "Look at the habits that affect your health and what you can change." },
        { title: "Change one small thing", description: "Start with one small change. Or decide if you need to see a doctor." },
      ],
      ctaTitle: "We help you reach a doctor",
      ctaBody: "Questions after reading? Our team can tell you where to go.",
      ctaDisclaimer: "This information is not a medical diagnosis.",
      menuTitle: "Where to start",
      menuSubtitle: "Read a guide or check a symptom.",
      tabs: {
        menu: "Menu",
        topics: "Guides",
        triage: "Check a symptom",
      },
      triageGateway: {
        badge: "A few questions",
        title: "Check a symptom",
        description: "Answer a few questions about how you feel. Find out how urgent it is and what you can do.",
        cta: "Start the check",
      },
      topicsGateway: {
        badge: "8 checked guides",
        title: "Read a guide",
        description: "About the heart, diabetes, food, exercise and family health.",
        cta: "See the guides",
      },
      quickTopicsTitle: "Often searched",
      backToMenu: "Back to menu",
      doctorValidatedBadge: "Checked by a specialist doctor",
      romanesGlossaryButton: "Medical words in Romanes",
      topicGrid: {
        eyebrow: "Checked by doctors",
        searchPlaceholder: "Search for a guide or symptom",
        searchAriaLabel: "Search for a guide or symptom",
        clearSearchAriaLabel: "Clear search",
        filterListAriaLabel: "Filter guides",
        countSingular: "1 guide",
        countPluralTemplate: "{count} guides",
        countSearchSuffix: " for your search",
        doctorValidatedBadge: "Checked by a doctor",
        featuredRecommendationEyebrow: "Doctor's advice",
        featuredRecommendationBody: "Regular blood pressure checks and reducing salt intake prevent over 80% of major cardiovascular complications.",
        cardActionLabel: "Read or listen",
        emptyTitle: "No guides found",
        emptyDescription: "Try another word or see all guides.",
        emptyResetButton: "See all guides",
        categories: {
          toate: "All",
          inima: "Heart",
          diabet: "Diabetes",
          nutritie: "Food",
          miscare: "Physical activity",
          minte: "Mind and sleep",
          fumat: "Smoking",
          screening: "Check-ups",
          femei: "Women's health",
        },
      },
    },
    notFoundPage: {
      title: "We can't find that page",
      subtitle: "It may have moved or been deleted. Go back to the home page or read the health guides.",
      backHome: "Back to home",
      exploreHealth: "Read the guides",
    },
    emergency: {
      bannerAriaLabel: "112 emergency warning",
      bannerText: "For a medical emergency, call 112. The app can't call for you.",
      dismissBannerAria: "Hide the 112 message",
      seeAlarmSigns: "When to call 112",
      call112: "Call 112",
      signsModalTitle: "When to call 112",
      signsModalSubtitle: "Call right away if you notice any of these signs.",
      closeSignsModalAria: "Close warning signs window",
      signPrefix: "Sign",
      signs: [
        {
          id: "chest-pain",
          title: "Severe chest pain",
          description: "Pressure, tightness or burning that may spread to the left arm, neck or jaw.",
          actionHint: "Could be a heart attack",
        },
        {
          id: "breathing-difficulty",
          title: "Very hard to breathe",
          description: "Sudden choking, wheezing, or the person can't say a full sentence.",
          actionHint: "Could be fluid on the lungs (pulmonary edema) or a severe asthma attack",
        },
        {
          id: "facial-weakness",
          title: "Face drooping or sudden weakness (FAST)",
          description: "One side of the mouth droops, the person can't lift both arms, or their speech is slurred or confused.",
          actionHint: "Sign of a stroke",
        },
        {
          id: "unconsciousness",
          title: "Fainting or not responding",
          description: "The person does not respond when you call or touch them, or fell suddenly and is not moving.",
          actionHint: "Check breathing immediately",
        },
        {
          id: "heavy-bleeding",
          title: "Heavy bleeding",
          description: "Blood spurts or does not stop after 5 minutes of pressing directly on the wound.",
          actionHint: "Press hard with a clean cloth",
        },
        {
          id: "convulsions",
          title: "Seizures",
          description: "The body shakes hard, the eyes roll back, the person loses control of their muscles.",
          actionHint: "Protect their head from knocks. Do not put anything in their mouth.",
        },
      ],
      dispatcherGuideTitle: "What to tell the dispatcher",
      dispatcherGuideSubtitle: "The dispatcher will ask you questions. Be ready to say:",
      dispatcherSteps: [
        {
          title: "Where you are exactly",
          description: "Say the town or village and a clear landmark (near the church, the school, the old bridge, the shop in the centre).",
        },
        {
          title: "Who needs help",
          description: "Child, adult or older person. Say if the person is breathing, awake and answering you.",
        },
        {
          title: "What happened",
          description: "Describe briefly: chest pain, fall from height, sudden fainting or choking.",
        },
      ],
      dispatcherImportantNote: "Stay on the line until the dispatcher says you can hang up. The ambulance sets off while you are talking.",
      freeServiceNotice: "Free from any phone, even without credit",
      understandButton: "I understand",
      dialerGateTitle: "Call 112",
      closeWindowAria: "Close window",
      dialerNotice: "You are about to call 112. Your phone's keypad will open. The call does not start by itself. Press the green call button yourself.",
      dialerFreeNote: "The call is free on any mobile network.",
      openDialerButton: "Dial 112",
      cancelButton: "Cancel",
      desktopDialTitle: "Call 112 from a phone",
      desktopDialSubtitle: "Dial the number on your mobile or landline.",
      desktopFreeNote: "The call is free on any network, even without credit or a SIM card.",
      desktopRuralNote: "If you live in a remote village and the ambulance may be late, ask a neighbour with a car to take you to the nearest emergency department.",
    },
    newsRibbon: {
      ariaLabel: "Local news and health alerts",
      changeCountyTitle: "Change county",
      changeLabel: "(change)",
      noActiveAlerts: "No alerts right now",
      viewAllNews: "See all news",
      modalTitle: "Choose your county",
      modalSubtitle: "See health alerts and mobile clinics in your area.",
      searchPlaceholder: "Search county (e.g. Iași, Galați, Cluj)...",
      detectingLocation: "Finding your location...",
      useAutoLocation: "Use my location",
      currentLabel: "Now:",
      allCountiesNational: "All counties (national news)",
      noCountyFound: "No county found for",
      closeModal: "Close",
      geoUnsupported: "Your browser can't find your location.",
      geoSuccess: "We found your location.",
      geoError: "We couldn't find your location. Choose your county from the list.",
    },
    quiz: {
      sectionTitle: "True or false",
      sectionSubtitle: "Much health information spreads by word of mouth. Here is what is true and what is not.",
      filterAriaLabel: "Filter myths by category",
      audioNarratorLabel: "Listen to the question and explanation",
      trueButton: "True",
      falseButton: "False",
      yourSelectedAnswer: "Your answer:",
      correctAnswerTag: "You answered correctly",
      verifiedClarification: "Verified medical clarification",
      stopAudioAria: "Stop reading explanation",
      listenAudioAria: "Listen to the explanation",
      stopAudioLabel: "Stop reading",
      listenAudioLabel: "Listen to explanation",
      sourcePrefix: "Source:",
      askDoctorHandover: "Have doubts? Ask an online doctor about this topic",
      restartFirstMyth: "Start again from the first myth",
      nextMyth: "Next myth",
      mythProgressPrefix: "Myth",
      mythProgressOf: "of",
      prevMythAria: "Previous myth",
      nextMythAria: "Next myth",
    },
    mediatorBand: {
      question: "Are you a community health mediator?",
      description: "Tools for field visits, guided triage and records of the families you support.",
      cta: "Open the mediator module",
    },
    newsPage: {
      heroTitle: "Health news and local alerts",
      heroSubtitle: "Health alerts, mobile clinics and vaccination campaigns in your area.",
      countyLabel: "County:",
      allCounties: "All counties",
      categories: {
        all: "All",
        epidemics: "Epidemics and alerts",
        caravan: "Medical caravan",
        practicalAdvice: "Practical tips",
        patientRights: "Patient rights",
        childHealth: "Children's health",
        vaccinationCampaigns: "Vaccination campaigns",
        seasonalAdvice: "Seasonal advice",
      },
      emptyTitle: "No news for the selected county",
      emptySubtitle: "Choose another county or see news for the whole country.",
      resetFilter: "See all news",
      backToNews: "Back to news",
      listenNarration: "Listen to a simple summary",
      playAudio: "Listen",
      pauseAudio: "Pause",
      handoverTitle: "Need medical help?",
      handoverSubtitle: "Talk to a doctor online or ask a mediator for help.",
      handoverTelemed: "Talk to a doctor",
      handoverMediator: "Find a health mediator",
      changeCounty: "Change county",
      saveSelection: "Save",
    },
    medicOnlinePage: {
      heroTitle: "Talk to a doctor from home",
      heroSubtitle: "No queues and no long trips. The doctor listens to you on the phone and tells you what to do.",
      cardOnCallTitle: "Talk to the on-call doctor now",
      cardOnCallSubtitle: "You usually wait less than 10 minutes",
      cardOnCallAction: "Enter the waiting room",
      cardBookingTitle: "Book a call with a doctor",
      cardBookingSubtitle: "Pick a day and time",
      cardBookingAction: "Book now",
      cardPortalTitle: "My medical record",
      cardPortalSubtitle: "See prescriptions, visit notes and the doctor's advice",
      cardPortalAction: "Open my record",
      bookingTitle: "Book a call with a doctor",
      bookingSubtitle: "Pick a day and time, for you or someone in your family. It is free and you talk on your phone.",
      backToDoctorOnline: "Back to Online doctor",
      backToTelemed: "Back",
      stepDate: "Choose date and time",
      stepContact: "Patient details",
      familyForWhom: "Who is the appointment for?",
      familySelf: "For me",
      familyOther: "For someone in my family",
      queueTitle: "Waiting room",
      queueEstimated: "About 7 minutes left to wait",
      queueWarning: "Do not close this page. We will connect you as soon as the doctor is ready.",
      bandwidthLow: "Your internet is slow",
      bandwidthAudioOnly: "Switching to sound only so the call doesn't drop",
    },
    mediatorsPage: {
      heroTitle: "Health mediators",
      heroSubtitle: "A health mediator helps you with ID papers, registering with a family doctor, hospital appointments and free treatment.",
      requestHelpButton: "Ask for a mediator",
      modalTitle: "Ask for a mediator in your area",
      nameLabel: "Full name",
      phoneLabel: "Phone",
      countyLabel: "County",
      localityLabel: "Town or village",
      helpTypeLabel: "What do you need help with?",
      submitButton: "Send request",
    },
    countyMap: {
      title: "County map",
      subtitle: "Tap a county to see its alerts and mobile clinics.",
      allCounties: "All counties",
      mapAriaLabel: "County map of Romania",
      selectedCountyPrefix: "Chosen county:",
      activeAlertsTooltip: "● Active health alerts or mobile clinics",
      generalInfoTooltip: "General information only",
      recentNewsLabel: "Counties with recent updates:",
      recentRegionsLabel: "Regions with recent updates:",
      countyAriaPrefix: "County",
      hasAlertsSuffix: "has active alerts or mobile clinics",
      romania: "Romania",
      italy: "Italy",
      pickLabel: "Or choose from the list",
      italyMapAriaLabel: "Map of the regions of Italy",
      selectedRegionPrefix: "Chosen region:",
      allItaly: "All of Italy",
      italyTitle: "Region map",
      italySubtitle: "Tap a region or pick one from the list to see its news.",
    },
    accountAuthPage: {
      title: "Open your medical record",
      subtitle: "Enter the phone number you used to book. We'll text you a code.",
      phoneLabel: "Phone number",
      phonePlaceholder: "0721 000 000",
      sendCode: "Send code",
      codeLabel: "4-digit code from the text message",
      verifyCode: "Verify code",
      invalidCode: "The code is wrong or has expired.",
      backHome: "Back to home",
    },
  },
  ro: {
    nav: {
      healthInformation: "Informații medicale",
      healthCheck: "Verificare medicală",
      findHelp: "Găsește ajutor medical",
      about: "Despre noi",
      reportIssue: "Raportează o problemă",
    },
    account: {
      signIn: "Intră în cont",
      panel: "Panou",
    },
    header: {
      getHelp: "Cere ajutor",
      demo: "Demo",
      navAfla: "Află",
      navAflaSub: "Ghiduri de sănătate și mituri explicate",
      navCere: "Cere îndrumare",
      navCereSub: "Asistent și verificarea simptomelor",
      navMedic: "Medic online",
      navMedicSub: "Programări și medic de gardă",
      navStiri: "Știri",
      navStiriSub: "Alerte locale și caravane medicale",
      forMediators: "Pentru mediatori",
      myAccount: "Contul meu",
      medicalPanel: "Panou medical",
      startHere: "Începe aici",
      closeMenu: "Închide meniul",
      openMenu: "Deschide meniul",
      emergencyTitle: "Urgență medicală?",
      emergencyCallPrompt: "Sună direct la 112",
      call112: "Sună la 112",
      mediatorProfessionals: "Pentru profesioniști",
      mediatorDrawerDescription: "Ești mediator sanitar? Aici găsești modulul de teren și evidența familiilor.",
      enterMediatorModule: "Intră în modulul mediatorilor",
    },
    hero: {
      trustBadge: "Serviciu public gratuit, făcut împreună cu comunitățile",
      titleLine1: "Informații de sănătate simple",
      titleLine2: "și ajutor să ajungi",
      titleLine3: "la medicul potrivit.",
      paragraph:
        "REDI Health te ajută să înțelegi ce se întâmplă cu sănătatea ta, să afli unde să mergi și să vorbești cu un medic online. Este gratuit, pentru comunitățile rome și pentru oricine are nevoie.",
      cta: "Spune-ne ce te îngrijorează",
      assistantCta: "Citește ghidurile",
      assistantHref: "/health-information",
      assistantAlwaysVisible: true,
      mediatorPill: "Ești mediator sanitar? Deschide panoul tău",
      mediatorHref: "/panel",
      telemedicinePill: "Medic online",
      emergencyNoticeVerbatim:
        "Sună tu la 112. Aplicația nu sună în locul tău.",
      triage: {
        badge: "Ajutor în 3 pași",
        question: "Ce te îngrijorează astăzi?",
        subQuestion: "Alege ce ți se potrivește:",
        options: [
          {
            id: "learn",
            icon: "BookIcon",
            title: "Vreau să aflu despre sănătate",
            desc: "Ghiduri scurte și mituri despre sănătate, explicate simplu.",
            actionLabel: "Citește ghidurile",
            actionHref: "/health-information",
          },
          {
            id: "check",
            icon: "ClipboardCheckIcon",
            title: "Vreau să-mi evaluez simptomele",
            desc: "Arată pe corp unde te doare, răspunde la trei întrebări și afli ce poți face mai departe.",
            actionLabel: "Începe evaluarea",
            actionHref: "/health-check",
          },
          {
            id: "symptoms",
            icon: "ActivityIcon",
            title: "Am o problemă de sănătate",
            desc: "Vezi semnele de alarmă și vorbește online cu medicul de gardă.",
            actionLabel: "Vorbește cu medicul",
            actionHref: "/get-help?mode=doctor",
          },
          {
            id: "prescription",
            icon: "PrescriptionIcon",
            title: "Vreau să-mi înțeleg rețeta",
            desc: "Află cum și când iei pastilele și ce trebuie să eviți.",
            actionLabel: "Explică-mi rețeta",
            actionHref: "/health-assistant?tab=prescription",
          },
          {
            id: "navigation",
            icon: "HandHelpingIcon",
            title: "Nu știu unde să merg (medic de familie, CNAS)",
            desc: "Ajutor pentru înscrierea la medicul de familie, pachetul de urgență și acte.",
            actionLabel: "Cere ajutorul unui mediator",
            actionHref: "/get-help?mode=mediator",
          },
        ],
        doctorPrompt: "Vrei să vorbești cu un medic online?",
        doctorOnDutyCta: "Vorbește cu medicul de gardă",
        backButton: "Înapoi la opțiuni",
        reassurance: "Confidențial. Nu ai nevoie de cont.",
      },
      phone: {
        status: "online",
        messages: [
          "Vaccinul împotriva gripei provoacă gripă",
          "Fals.",
          "Vaccinurile antigripale nu pot provoca gripă.",
          "Nu te lua după zvonuri.",
          "Întreabă un medic sau o sursă de încredere.",
        ],
        factcheckLine1: "Mesaj înșelător",
        factcheckLine2:
          "Vaccinul gripal nu conține virus viu care să-ți poată da gripă.",
        source: "Sursa: OMS, Ministerul Sănătății",
        button: "Întreabă un mediator",
      },
    },
    footer: {
      disclaimer:
        "Informațiile de aici te ajută să înțelegi. Nu înlocuiesc sfatul medicului.",
      govPartner: "Partener guvernamental",
      healthcarePartners: "Parteneri medicali",
      groups: {
        health: { heading: "Sănătate", healthInformation: "Informații medicale", findHelp: "Găsește ajutor medical" },
        platform: { heading: "Platformă", about: "Despre platformă", contact: "Contact", accessibility: "Accesibilitate" },
        legal: { heading: "Legal", privacy: "Confidențialitate", terms: "Termeni" },
      },
      brandDescription:
        "RediHealth îi ajută pe oamenii din comunitățile vulnerabile să își înțeleagă sănătatea, să afle ce au de făcut și să ajungă la un medic.",
      mediatorPartnershipBadge: "Parteneriat cu rețeaua mediatorilor sanitari",
      whoStandardBadge: "Serviciu gratuit conform standardelor OMS",
      col1Heading: "Informații medicale",
      col1Link1: "Ghiduri de sănătate",
      col1Link2: "Cere îndrumare",
      col1Link3: "Verifică simptomele",
      col1Link4: "Știri locale și alerte de sănătate",
      col2Heading: "Servicii clinice",
      col2Link1: "Vorbește cu un medic online",
      col2Link2: "Programare la medic de gardă",
      col2Link3: "Găsește dispensar sau spital",
      col2Link4: "Contul meu și rețete",
      col3Heading: "Pentru mediatori și medici",
      col3Link1: "Modulul mediatorilor sanitari",
      col3Link2: "Panou pentru teren",
      col3Link3: "Portal pentru medici",
      col3Link4: "Cum lucrează medicul cu mediatorul",
      col4Heading: "Despre noi și termeni",
      col4Link1: "Despre RediHealth",
      col4Link2: "Contact și sesizări",
      col4Link3: "Declarație de accesibilitate",
      col4Link4: "Confidențialitate și protecția datelor (GDPR)",
      col4Link5: "Termeni și condiții",
      emergency112Title: "Urgență? Sună la 112 de pe orice telefon.",
      emergency112Text:
        "Apelul este gratuit, chiar fără credit sau cartelă SIM. RediHealth nu sună la 112 în locul tău.",
      seeAlarmSigns: "Vezi semnele de alarmă",
      call112Button: "Sună la 112",
      reportIssueFallback: "Raportează o problemă tehnică",
      copyrightLine: "© 2026 RediHealth. Făcut pentru comunitățile vulnerabile.",
      nonEmergencyWarning:
        "Aplicația îți dă informații și îndrumare. Nu înlocuiește ajutorul de urgență.",
    },
    landing: {
      mythBuster: {
        title: "Adevărat sau fals",
        subtitle: "Zvonurile despre sănătate circulă repede. Verifică-le înainte să hotărăști ceva.",
        messageLabel: "Mesaj",
      },
      helpOptions: {
        title: "Cu ce te putem ajuta?",
        subtitle: "Alege de ce ai nevoie și îți arătăm ce urmează.",
        options: [
          {
            title: "Află",
            description: "Află care sunt riscurile obișnuite pentru sănătate și cum te poți proteja.",
            cta: "Citește ghidurile",
            href: "/health-information",
          },
          {
            title: "Cere îndrumare",
            description: "Spune-ne ce te îngrijorează. Îți spunem simplu ce poți face.",
            cta: "Cere îndrumare",
            href: "/get-help",
          },
          {
            title: "Vorbește cu un medic",
            description: "Dacă e nevoie, vorbești cu un medic online.",
            cta: "Găsește ajutor",
            href: "/find-help",
          },
        ],
        mediatorBand: { text: "Ești mediator sanitar?", cta: "Deschide modulul mediatorilor" },
      },
      healthTopics: {
        title: "Ai grijă de sănătatea ta",
        subtitle: "Pașii mici pe care îi faci azi îți pot reduce riscurile de sănătate pe termen lung.",
        viewAll: "Vezi toate ghidurile de sănătate",
      },
      medicalAssistance: {
        title: "Te ajutăm să ajungi la medic",
        subtitle: "Cineva din echipa noastră îți citește cererea și te contactează.",
        requestHelp: "Cere ajutor",
        findServices: "Caută servicii medicale",
        steps: [
          {
            title: "Spune ce te îngrijorează",
            description: "Scrie pe scurt de ce ai nevoie. Fără formulare complicate.",
          },
          {
            title: "Primești un răspuns clar",
            description: "Îți spunem simplu ce poți face.",
          },
          {
            title: "Vorbești cu un medic online",
            description: "Dacă e nevoie, te punem în legătură cu un medic.",
          },
        ],
      },
      trustSection: {
        title: "Serviciu public de sănătate",
        subtitle: "Este pentru oricine are nevoie. Informațiile sunt verificate, iar datele tale rămân private.",
        builtWith: "Făcut împreună cu comunitățile",
        partnersLabel: "Parteneri guvernamentali și medicali",
        partnerLogo: "Logo partener",
        commitments: [
          { title: "Gratuit pentru toți", description: "Nu plătești nimic. Oricine îl poate folosi." },
          { title: "Datele tale sunt private", description: "Avem grijă de informațiile tale și nu le facem publice." },
          { title: "Limbaj simplu", description: "Scriem scurt și fără cuvinte grele." },
        ],
      },
      emergencyNotice: {
        title: "În caz de urgență medicală",
        description: "Dacă crezi că e o urgență, sună imediat la 112.",
      },
    },
    getHelpPage: {
      heroTitle: "Cere ajutor",
      heroParagraph:
        "Nu găsești un medic sau nu reușești să faci o programare? Scrie-ne pe scurt de ce ai nevoie. Cineva din echipă îți citește cererea și te contactează.",
      form: {
        countyLabel: "Județ",
        selectCounty: "Alege județul",
        fullNameLabel: "Nume complet",
        fullNameOptional: "(opțional)",
        fullNamePlaceholder: "Numele tău",
        phoneLabel: "Număr de telefon",
        phonePlaceholder: "ex. 0712 345 678",
        emailLabel: "Adresă de email",
        emailPlaceholder: "tu@exemplu.com",
        descriptionLabel: "Care e problema?",
        descriptionPlaceholder: "De exemplu: ce simptome ai sau la ce medic vrei să ajungi.",
        descriptionHint: "Scrie doar detaliile personale de care e nevoie.",
        privacyNote: "Folosim datele tale doar ca să-ți răspundem. Rămân confidențiale.",
        privacyConsent: "Am citit și sunt de acord cu",
        privacyPolicyLabel: "Politica de confidențialitate",
        privacyConsentRequired: "Bifează că ești de acord cu Politica de confidențialitate.",
        errorCounty: "Alege județul.",
        submitting: "Se trimite…",
        submit: "Trimite cererea",
        genericError: "Cererea nu s-a trimis. Încearcă din nou.",
        errorPhone: "Scrie un număr de telefon la care te putem găsi.",
        errorEmailRequired: "Scrie adresa ta de email.",
        errorEmailInvalid: "Adresa de email nu este corectă.",
        errorDescription: "Scrie puțin mai mult despre problemă (cel puțin 10 caractere).",
        successTitle: "Am primit cererea ta",
        successBody: "Cineva din echipă citește ce ne-ai scris și te contactează la datele lăsate.",
        successNotice: "Acest serviciu nu este pentru urgențe. Dacă e o urgență, sună imediat la 112.",
        backHome: "Înapoi la prima pagină",
        submitAnother: "Trimite o altă cerere",
      },
      sidebar: {
        emergencyTitle: "În caz de urgență medicală",
        emergencyBody: "Acest serviciu nu este pentru urgențe. Dacă e o urgență, sună imediat la 112.",
        whatsNextTitle: "Ce urmează",
        steps: [
          "Citim ce ne-ai scris.",
          "Te contactăm la telefonul sau emailul lăsat.",
          "Te ajutăm să ajungi unde trebuie.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Intră în contul RediHealth",
      heroParagraphWithGoogle: "Scrie adresa de email și îți trimitem un cod. Poți intra și cu contul Google.",
      heroParagraphNoGoogle: "Scrie adresa de email și îți trimitem un cod.",
      terms: "Dacă mergi mai departe, ești de acord cu Termenii noștri și confirmi că ai citit Politica de confidențialitate.",
      unauthorizedGoogle: "Acest cont Google nu are acces la RediHealth.",
      authUnavailable: "Nu poți intra acum. Încearcă din nou puțin mai târziu.",
      form: {
        emailLabel: "Adresă de email",
        emailPlaceholder: "tu@exemplu.com",
        emailHint: "Îți trimitem aici un cod din 6 cifre.",
        emailInvalid: "Adresa de email nu este corectă.",
        sendingCode: "Se trimite codul...",
        emailMeCode: "Trimite-mi un cod",
        portalRecoveryTitle: "Acces la portalul pacientului",
        portalRecoveryHint: "Ai pierdut linkul către portal? Scrie adresa de email și îți trimitem unul nou.",
        portalRecoveryEmailLabel: "Adresa de email a pacientului",
        portalRecoveryEmailPlaceholder: "tu@exemplu.com",
        portalRecoveryButton: "Trimite-mi un link nou",
        portalRecoverySending: "Se trimite linkul...",
        portalRecoverySent: "Dacă adresa are un portal de pacient, primești curând un link nou.",
        portalRecoveryError: "Ceva nu a mers. Încearcă din nou puțin mai târziu.",
        genericSendError: "Nu am putut trimite codul. Încearcă din nou.",
        checkEmailTitle: "Verifică-ți emailul",
        codeSentBody: (email: string) => `Am trimis un cod din 6 cifre la ${email}. Codul expiră în 10 minute.`,
        codeLabel: "Codul din 6 cifre",
        codeInvalid: "Scrie codul din 6 cifre primit pe email.",
        genericVerifyError: "Nu am putut verifica codul. Încearcă din nou.",
        signingIn: "Intri în cont...",
        continueLabel: "Continuă",
        useDifferentEmail: "Folosește o altă adresă de email",
        or: "sau",
        continueWithGoogle: "Continuă cu Google",
      },
    },
    findHelpPage: {
      heroTitle: "Găsește ajutor medical",
      heroParagraph: "Vezi pe hartă unitățile medicale din apropiere. Apasă pe un loc ca să vezi adresa și telefonul.",
      listTitle: "Farmacii, clinici și spitale",
      listSubtitle: "Apasă pe un loc ca să-l vezi pe hartă.",
      loadingMap: "Se încarcă harta…",
      mapAttribution: "Date hartă © contribuitori OpenStreetMap.",
      ctaTitle: "Nu știi unde să mergi?",
      ctaBody: "Dacă nu știi la ce medic sau unde să mergi, te putem îndruma noi. Pentru o urgență, sună imediat la 112.",
      ctaButton: "Cere ajutor",
    },
    healthInfoPage: {
      eyebrow: "Informații medicale",
      heroTitle: "Ghiduri de sănătate",
      heroSubtitle: "Citește despre bolile des întâlnite, cum te poți proteja și când trebuie să mergi la medic.",
      browseTitle: "Alege un subiect",
      browseSubtitle: "Fiecare ghid îți arată ce poți face zilnic pentru sănătatea ta.",
      readMore: "Citește mai mult",
      usingInfoTitle: "Cum folosești ghidurile",
      usingInfoSubtitle: "Ghidurile te ajută să înțelegi și să alegi mai bine. Nu înlocuiesc sfatul medicului.",
      usingInfoSteps: [
        { title: "Citește ce e important", description: "Alege un subiect care te privește și citește partea de început." },
        { title: "Află ce riscuri ai", description: "Uită-te la obiceiurile care îți afectează sănătatea și la ce poți schimba." },
        { title: "Schimbă un lucru mic", description: "Începe cu o schimbare mică. Sau hotărăște dacă trebuie să mergi la medic." },
      ],
      ctaTitle: "Te ajutăm să ajungi la medic",
      ctaBody: "Ai întrebări după ce ai citit? Echipa noastră îți spune unde să mergi.",
      ctaDisclaimer: "Aceste informații nu sunt un diagnostic medical.",
      menuTitle: "De unde începi",
      menuSubtitle: "Citește un ghid sau verifică un simptom.",
      tabs: {
        menu: "Meniu",
        topics: "Ghiduri",
        triage: "Verifică un simptom",
      },
      triageGateway: {
        badge: "Câteva întrebări",
        title: "Verifică un simptom",
        description: "Răspunde la câteva întrebări despre ce simți. Afli cât de urgent este și ce poți face.",
        cta: "Începe verificarea",
      },
      topicsGateway: {
        badge: "8 ghiduri verificate",
        title: "Citește un ghid",
        description: "Despre inimă, diabet, mâncare, mișcare și sănătatea familiei.",
        cta: "Vezi ghidurile",
      },
      quickTopicsTitle: "Căutate des",
      backToMenu: "Înapoi la meniu",
      doctorValidatedBadge: "Verificat de un medic specialist",
      romanesGlossaryButton: "Cuvinte medicale în Romanes",
      topicGrid: {
        eyebrow: "Verificate de medici",
        searchPlaceholder: "Caută un ghid sau un simptom",
        searchAriaLabel: "Caută un ghid sau un simptom",
        clearSearchAriaLabel: "Șterge căutarea",
        filterListAriaLabel: "Filtrează ghidurile",
        countSingular: "1 ghid",
        countPluralTemplate: "{count} ghiduri",
        countSearchSuffix: " pentru căutarea ta",
        doctorValidatedBadge: "Verificat de medic",
        featuredRecommendationEyebrow: "Sfatul medicului",
        featuredRecommendationBody: "Măsurarea periodică a tensiunii arteriale și reducerea sării previn peste 80% din complicațiile cardiovasculare majore.",
        cardActionLabel: "Citește sau ascultă ghidul",
        emptyTitle: "Nu am găsit niciun ghid",
        emptyDescription: "Încearcă alt cuvânt sau vezi toate ghidurile.",
        emptyResetButton: "Vezi toate ghidurile",
        categories: {
          toate: "Toate",
          inima: "Inimă",
          diabet: "Diabet",
          nutritie: "Mâncare",
          miscare: "Mișcare",
          minte: "Minte și somn",
          fumat: "Fumat",
          screening: "Controale",
          femei: "Sănătatea femeii",
        },
      },
    },
    notFoundPage: {
      title: "Nu am găsit această pagină",
      subtitle: "Poate a fost mutată sau ștearsă. Întoarce-te la prima pagină sau citește ghidurile de sănătate.",
      backHome: "Înapoi la prima pagină",
      exploreHealth: "Citește ghidurile",
    },
    emergency: {
      bannerAriaLabel: "Avertisment de urgență 112",
      bannerText: "Pentru o urgență medicală, sună la 112. Aplicația nu poate suna în locul tău.",
      dismissBannerAria: "Ascunde mesajul despre 112",
      seeAlarmSigns: "Când suni la 112",
      call112: "Sună la 112",
      signsModalTitle: "Când suni la 112",
      signsModalSubtitle: "Sună imediat dacă observi oricare dintre aceste semne.",
      closeSignsModalAria: "Închide fereastra semnelor de alarmă",
      signPrefix: "Semnul",
      signs: [
        {
          id: "chest-pain",
          title: "Dureri puternice în piept",
          description: "Apăsare, strângere sau arsură care poate merge spre brațul stâng, gât sau falcă.",
          actionHint: "Poate fi infarct",
        },
        {
          id: "breathing-difficulty",
          title: "Respirație foarte grea",
          description: "Se sufocă brusc, respiră șuierat sau nu poate spune o propoziție întreagă.",
          actionHint: "Poate fi apă la plămâni (edem pulmonar) sau o criză grea de astm",
        },
        {
          id: "facial-weakness",
          title: "Fața strâmbă sau slăbiciune bruscă",
          description: "Gura căzută pe o parte, nu poate ridica ambele brațe sau vorbește greu și încurcat.",
          actionHint: "Semn de accident vascular cerebral (AVC)",
        },
        {
          id: "unconsciousness",
          title: "Leșin sau nu mai răspunde",
          description: "Persoana nu răspunde când o strigi sau o atingi, sau a căzut brusc și nu se mișcă.",
          actionHint: "Verifică imediat dacă respiră",
        },
        {
          id: "heavy-bleeding",
          title: "Sângerare puternică",
          description: "Sângele țâșnește sau nu se oprește după 5 minute în care apeși direct pe rană.",
          actionHint: "Apasă puternic cu un prosop curat",
        },
        {
          id: "convulsions",
          title: "Convulsii",
          description: "Corpul tremură puternic, ochii se dau peste cap, persoana nu își mai controlează mușchii.",
          actionHint: "Ferește-i capul de lovituri. Nu-i pune nimic în gură.",
        },
      ],
      dispatcherGuideTitle: "Ce îi spui dispecerului",
      dispatcherGuideSubtitle: "Dispecerul îți pune întrebări. Fii gata să spui:",
      dispatcherSteps: [
        {
          title: "Unde te afli exact",
          description: "Spune localitatea, satul și un punct de reper clar (lângă biserică, lângă școală, podul vechi, magazinul din centru).",
        },
        {
          title: "Cine are nevoie de ajutor",
          description: "Copil, adult sau bătrân. Spune dacă persoana respiră, dacă e trează și dacă îți răspunde.",
        },
        {
          title: "Ce s-a întâmplat",
          description: "Descrie pe scurt: durere în piept, cădere de la înălțime, leșin brusc sau sufocare.",
        },
      ],
      dispatcherImportantNote: "Rămâi la telefon până când dispecerul îți spune că poți închide. Ambulanța pornește în timp ce vorbești.",
      freeServiceNotice: "Gratuit din orice telefon, chiar fără credit",
      understandButton: "Am înțeles",
      dialerGateTitle: "Apel la 112",
      closeWindowAria: "Închide fereastra",
      dialerNotice: "Urmează să suni la 112. Se deschide tastatura telefonului. Apelul nu pornește singur. Apasă tu butonul verde de apel.",
      dialerFreeNote: "Apelul este gratuit din orice rețea mobilă.",
      openDialerButton: "Formează 112",
      cancelButton: "Anulează",
      desktopDialTitle: "Sună la 112 de pe telefon",
      desktopDialSubtitle: "Formează numărul de pe mobil sau de pe telefonul fix.",
      desktopFreeNote: "Apelul este gratuit din orice rețea, chiar fără credit sau cartelă SIM.",
      desktopRuralNote: "Dacă stai într-un sat izolat și ambulanța poate întârzia, roagă un vecin cu mașină să te ducă la cea mai apropiată Unitate de Primiri Urgențe (UPU).",
    },
    newsRibbon: {
      ariaLabel: "Știri locale și alerte de sănătate",
      changeCountyTitle: "Schimbă județul",
      changeLabel: "(schimbă)",
      noActiveAlerts: "Nicio alertă acum",
      viewAllNews: "Vezi toate știrile",
      modalTitle: "Alege județul tău",
      modalSubtitle: "Vezi alertele și caravanele medicale din zona ta.",
      searchPlaceholder: "Caută județul (ex. Iași, Galați, Cluj)...",
      detectingLocation: "Căutăm locația...",
      useAutoLocation: "Folosește locația mea",
      currentLabel: "Acum:",
      allCountiesNational: "Toate județele (știri din toată țara)",
      noCountyFound: "Niciun județ găsit pentru",
      closeModal: "Închide",
      geoUnsupported: "Browserul tău nu poate afla locația.",
      geoSuccess: "Am găsit locația ta.",
      geoError: "Nu am putut afla locația. Alege județul din listă.",
    },
    quiz: {
      sectionTitle: "Adevărat sau fals",
      sectionSubtitle: "Multe informații despre sănătate se transmit din om în om. Aici afli ce e adevărat și ce nu.",
      filterAriaLabel: "Filtrează miturile după categorie",
      audioNarratorLabel: "Ascultă întrebarea și explicația",
      trueButton: "Adevărat",
      falseButton: "Fals",
      yourSelectedAnswer: "Răspunsul tău:",
      correctAnswerTag: "Ai răspuns corect",
      verifiedClarification: "Clarificare medicală verificată",
      stopAudioAria: "Oprește citirea explicației",
      listenAudioAria: "Ascultă explicația",
      stopAudioLabel: "Oprește citirea",
      listenAudioLabel: "Ascultă explicația",
      sourcePrefix: "Sursă:",
      askDoctorHandover: "Ai îndoieli? Întreabă un medic online despre acest subiect",
      restartFirstMyth: "Reia de la primul mit",
      nextMyth: "Treci la următorul mit",
      mythProgressPrefix: "Mitul",
      mythProgressOf: "din",
      prevMythAria: "Mitul anterior",
      nextMythAria: "Mitul următor",
    },
    mediatorBand: {
      question: "Ești mediator sanitar în comunitate?",
      description: "Instrumente pentru vizitele pe teren, triaj ghidat și evidența familiilor pe care le sprijini.",
      cta: "Deschide modulul mediatorilor",
    },
    newsPage: {
      heroTitle: "Știri de sănătate și alerte locale",
      heroSubtitle: "Alerte de sănătate, caravane medicale și campanii de vaccinare din zona ta.",
      countyLabel: "Județul:",
      allCounties: "Toate județele",
      categories: {
        all: "Toate",
        epidemics: "Epidemii și alerte",
        caravan: "Caravana medicală",
        practicalAdvice: "Sfaturi practice",
        patientRights: "Drepturile pacienților",
        childHealth: "Sănătatea copiilor",
        vaccinationCampaigns: "Campanii de vaccinare",
        seasonalAdvice: "Sfaturi de sezon",
      },
      emptyTitle: "Nu există știri pentru județul selectat",
      emptySubtitle: "Alege alt județ sau vezi știrile din toată țara.",
      resetFilter: "Vezi toate știrile",
      backToNews: "Înapoi la știri",
      listenNarration: "Ascultă știrea explicată simplu",
      playAudio: "Ascultă",
      pauseAudio: "Pauză",
      handoverTitle: "Ai nevoie de ajutor medical?",
      handoverSubtitle: "Vorbește cu un medic online sau cere ajutorul unui mediator.",
      handoverTelemed: "Vorbește cu un medic",
      handoverMediator: "Găsește un mediator sanitar",
      changeCounty: "Schimbă județul",
      saveSelection: "Salvează",
    },
    medicOnlinePage: {
      heroTitle: "Vorbește cu un medic de acasă",
      heroSubtitle: "Nu stai la coadă și nu faci drumuri. Medicul te ascultă la telefon și îți spune ce să faci.",
      cardOnCallTitle: "Vorbește acum cu medicul de gardă",
      cardOnCallSubtitle: "De obicei aștepți sub 10 minute",
      cardOnCallAction: "Intră în sala de așteptare",
      cardBookingTitle: "Programează un apel cu medicul",
      cardBookingSubtitle: "Alege ziua și ora",
      cardBookingAction: "Programează-te",
      cardPortalTitle: "Dosarul meu medical",
      cardPortalSubtitle: "Vezi rețetele, fișele de consultație și sfaturile medicului",
      cardPortalAction: "Deschide dosarul",
      bookingTitle: "Programează un apel cu medicul",
      bookingSubtitle: "Alege ziua și ora, pentru tine sau pentru cineva din familie. Este gratuit și vorbești de pe telefon.",
      backToDoctorOnline: "Înapoi la Medic online",
      backToTelemed: "Înapoi",
      stepDate: "Alege data și ora",
      stepContact: "Datele pacientului",
      familyForWhom: "Pentru cine este programarea?",
      familySelf: "Pentru mine",
      familyOther: "Pentru cineva din familie",
      queueTitle: "Sala de așteptare",
      queueEstimated: "Mai aștepți cam 7 minute",
      queueWarning: "Nu închide pagina. Te conectăm imediat ce medicul e gata.",
      bandwidthLow: "Internetul merge slab",
      bandwidthAudioOnly: "Trecem doar pe sunet, ca să nu se întrerupă",
    },
    mediatorsPage: {
      heroTitle: "Mediatori sanitari",
      heroSubtitle: "Un mediator sanitar te ajută cu actele de identitate, înscrierea la medicul de familie, programările la spital și tratamentele gratuite.",
      requestHelpButton: "Cere un mediator",
      modalTitle: "Cere un mediator în zona ta",
      nameLabel: "Nume și prenume",
      phoneLabel: "Telefon",
      countyLabel: "Județ",
      localityLabel: "Localitate sau sat",
      helpTypeLabel: "Cu ce ai nevoie de ajutor?",
      submitButton: "Trimite cererea",
    },
    countyMap: {
      title: "Harta județelor",
      subtitle: "Apasă pe un județ ca să vezi alertele și caravanele de acolo.",
      allCounties: "Toate județele",
      mapAriaLabel: "Harta județelor din România",
      selectedCountyPrefix: "Județul ales:",
      activeAlertsTooltip: "● Alerte sau caravane medicale active",
      generalInfoTooltip: "Doar informații generale",
      recentNewsLabel: "Județe cu noutăți recente:",
      recentRegionsLabel: "Regiuni cu noutăți recente:",
      countyAriaPrefix: "Județul",
      hasAlertsSuffix: "are alerte sau caravane active",
      romania: "România",
      italy: "Italia",
      pickLabel: "Sau alege din listă",
      italyMapAriaLabel: "Harta regiunilor din Italia",
      selectedRegionPrefix: "Regiunea aleasă:",
      allItaly: "Toată Italia",
      italyTitle: "Harta regiunilor",
      italySubtitle: "Apasă pe o regiune sau alege din listă ca să vezi știrile.",
    },
    accountAuthPage: {
      title: "Intră în dosarul medical",
      subtitle: "Scrie numărul de telefon de la programare. Îți trimitem un cod prin SMS.",
      phoneLabel: "Număr de telefon",
      phonePlaceholder: "0721 000 000",
      sendCode: "Trimite codul",
      codeLabel: "Codul primit prin SMS (4 cifre)",
      verifyCode: "Verifică codul",
      invalidCode: "Codul e greșit sau a expirat.",
      backHome: "Înapoi la prima pagină",
    },
  },
  sq: {
    nav: {
      healthInformation: "Informacion shëndetësor",
      healthCheck: "Kontroll shëndetësor",
      findHelp: "Gjej ndihmë mjekësore",
      about: "Rreth nesh",
      reportIssue: "Raporto një problem",
    },
    account: {
      signIn: "Hyr në llogari",
      panel: "Paneli",
    },
    header: {
      getHelp: "Kërko ndihmë",
      demo: "Demo",
      navAfla: "Mëso",
      navAflaSub: "Udhëzues shëndetësorë dhe mite të shpjeguara",
      navCere: "Kërko udhëzim",
      navCereSub: "Asistenti dhe kontrolli i simptomave",
      navMedic: "Mjek online",
      navMedicSub: "Takime dhe mjeku kujdestar",
      navStiri: "Lajme",
      navStiriSub: "Njoftime lokale dhe karvane mjekësore",
      forMediators: "Për mediatorët",
      myAccount: "Llogaria ime",
      medicalPanel: "Paneli mjekësor",
      startHere: "Fillo këtu",
      closeMenu: "Mbyll menunë",
      openMenu: "Hap menunë",
      emergencyTitle: "Urgjencë mjekësore?",
      emergencyCallPrompt: "Telefono menjëherë 112",
      call112: "Telefono 112",
      mediatorProfessionals: "Për profesionistët",
      mediatorDrawerDescription: "Je mediator shëndetësor? Këtu gjen modulin e terrenit dhe regjistrin e familjeve.",
      enterMediatorModule: "Hap modulin e mediatorëve",
    },
    hero: {
      trustBadge: "Shërbim publik falas, i bërë së bashku me komunitetet",
      titleLine1: "Informacion i thjeshtë për shëndetin",
      titleLine2: "dhe ndihmë për të arritur",
      titleLine3: "te mjeku i duhur.",
      paragraph:
        "REDI Health të ndihmon të kuptosh shëndetin tënd, të dish ku të shkosh dhe të flasësh me një mjek online. Është falas, për komunitetet rome dhe për këdo që ka nevojë.",
      cta: "Na trego çfarë të shqetëson",
      assistantCta: "Lexo udhëzuesit",
      assistantHref: "/health-information",
      assistantAlwaysVisible: true,
      mediatorPill: "Je ndërmjetës shëndetësor? Hap panelin tënd",
      mediatorHref: "/panel",
      telemedicinePill: "Mjek online",
      emergencyNoticeVerbatim:
        "Telefono vetë 112. Aplikacioni nuk telefonon për ty.",
      triage: {
        badge: "Ndihmë në 3 hapa",
        question: "Çfarë të shqetëson sot?",
        subQuestion: "Zgjidh atë që të përshtatet:",
        options: [
          {
            id: "learn",
            icon: "BookIcon",
            title: "Dua të mësoj rreth shëndetit",
            desc: "Udhëzues të shkurtër dhe mite për shëndetin, të shpjeguara thjesht.",
            actionLabel: "Lexo udhëzuesit",
            actionHref: "/health-information",
          },
          {
            id: "check",
            icon: "ClipboardCheckIcon",
            title: "Dua të vlerësoj simptomat e mia",
            desc: "Trego në trup ku të dhemb, përgjigju tri pyetjeve dhe shiko çfarë të bësh më pas.",
            actionLabel: "Fillo vlerësimin",
            actionHref: "/health-check",
          },
          {
            id: "symptoms",
            icon: "ActivityIcon",
            title: "Kam një problem shëndetësor",
            desc: "Shiko shenjat e alarmit dhe fol online me mjekun kujdestar.",
            actionLabel: "Fol me mjekun",
            actionHref: "/get-help?mode=doctor",
          },
          {
            id: "prescription",
            icon: "PrescriptionIcon",
            title: "Dua ta kuptoj recetën time",
            desc: "Mëso si dhe kur t'i marrësh ilaçet dhe çfarë duhet të shmangësh.",
            actionLabel: "Më shpjego recetën",
            actionHref: "/health-assistant?tab=prescription",
          },
          {
            id: "navigation",
            icon: "HandHelpingIcon",
            title: "Nuk di ku të shkoj (mjeku i familjes, sigurimet)",
            desc: "Ndihmë për regjistrimin te mjeku i familjes, paketën e urgjencës dhe dokumentet.",
            actionLabel: "Kërko një ndërmjetës",
            actionHref: "/get-help?mode=mediator",
          },
        ],
        doctorPrompt: "Do të flasësh me një mjek online?",
        doctorOnDutyCta: "Fol me mjekun kujdestar",
        backButton: "Kthehu te mundësitë",
        reassurance: "Konfidenciale. Nuk të duhet llogari.",
      },
      phone: {
        status: "online",
        messages: [
          "Vaksina e gripit shkakton grip",
          "E rreme.",
          "Vaksinat e gripit nuk mund të shkaktojnë grip.",
          "Mos u beso thashethemeve.",
          "Pyet një mjek ose një burim që i beson.",
        ],
        factcheckLine1: "Mesazh mashtrues",
        factcheckLine2:
          "Vaksina e gripit nuk ka virus të gjallë që mund të të japë grip.",
        source: "Burimi: OBSH, Ministria e Shëndetësisë",
        button: "Pyet një ndërmjetës",
      },
    },
    footer: {
      disclaimer:
        "Informacioni këtu të ndihmon të kuptosh. Nuk zëvendëson këshillën e mjekut.",
      govPartner: "Partner qeveritar",
      healthcarePartners: "Partnerë shëndetësorë",
      groups: {
        health: { heading: "Shëndeti", healthInformation: "Informacion shëndetësor", findHelp: "Gjej ndihmë mjekësore" },
        platform: { heading: "Platforma", about: "Rreth platformës", contact: "Kontakt", accessibility: "Aksesueshmëria" },
        legal: { heading: "Ligjore", privacy: "Privatësia", terms: "Kushtet" },
      },
      brandDescription:
        "RediHealth i ndihmon njerëzit në komunitetet në nevojë të kuptojnë shëndetin e tyre, të dinë çfarë të bëjnë dhe të arrijnë te një mjek.",
      mediatorPartnershipBadge: "Partneritet me rrjetin e mediatorëve shëndetësorë",
      whoStandardBadge: "Shërbim falas sipas standardeve të OBSH-së",
      col1Heading: "Informacion mjekësor",
      col1Link1: "Udhëzues shëndetësorë",
      col1Link2: "Kërko udhëzim",
      col1Link3: "Kontrollo simptomat",
      col1Link4: "Lajme lokale dhe njoftime shëndetësore",
      col2Heading: "Shërbime klinike",
      col2Link1: "Fol me një mjek online",
      col2Link2: "Takim me mjekun kujdestar",
      col2Link3: "Gjej qendër shëndetësore ose spital",
      col2Link4: "Llogaria ime dhe recetat",
      col3Heading: "Për mediatorët dhe mjekët",
      col3Link1: "Moduli i mediatorëve shëndetësorë",
      col3Link2: "Paneli i terrenit",
      col3Link3: "Portali për mjekët",
      col3Link4: "Si punojnë bashkë mjeku dhe mediatori",
      col4Heading: "Rreth nesh dhe kushtet",
      col4Link1: "Rreth RediHealth",
      col4Link2: "Kontakt dhe raportime",
      col4Link3: "Deklarata e aksesueshmërisë",
      col4Link4: "Privatësia dhe mbrojtja e të dhënave (GDPR)",
      col4Link5: "Kushtet e përdorimit",
      emergency112Title: "Urgjencë? Telefono 112 nga çdo telefon.",
      emergency112Text:
        "Telefonata është falas, edhe pa kredit ose kartë SIM. RediHealth nuk telefonon 112 për ty.",
      seeAlarmSigns: "Shiko shenjat e alarmit",
      call112Button: "Telefono 112",
      reportIssueFallback: "Raporto një problem teknik",
      copyrightLine: "© 2026 RediHealth. Bërë për komunitetet në nevojë.",
      nonEmergencyWarning:
        "Aplikacioni të jep informacion dhe udhëzime. Nuk zëvendëson ndihmën urgjente.",
    },
    landing: {
      mythBuster: {
        title: "E vërtetë apo e rreme",
        subtitle: "Thashethemet për shëndetin përhapen shpejt. Kontrolloji para se të vendosësh diçka.",
        messageLabel: "Mesazh",
      },
      helpOptions: {
        title: "Si mund të të ndihmojmë?",
        subtitle: "Zgjidh çfarë të duhet dhe të tregojmë çfarë vjen më pas.",
        options: [
          {
            title: "Mëso rreth shëndetit tënd",
            description: "Mëso cilat janë rreziqet e zakonshme dhe si të mbrohesh.",
            cta: "Lexo udhëzuesit",
            href: "/health-information",
          },
          {
            title: "Kontrollo shëndetin tënd",
            description: "Përgjigju disa pyetjeve të shkurtra për si ndihesh.",
            cta: "Fillo kontrollin",
            href: "/health-check",
          },
          {
            title: "Merr ndihmë mjekësore",
            description: "Gjej shërbime shëndetësore ose kërko ndihmë për të marrë një takim.",
            cta: "Gjej ndihmë",
            href: "/find-help",
          },
        ],
        mediatorBand: { text: "Je mediator shëndetësor?", cta: "Hap modulin e mediatorëve" },
      },
      healthTopics: {
        title: "Kujdesu për shëndetin tënd",
        subtitle: "Hapat e vegjël që bën sot mund të ulin rreziqet për shëndetin tënd me kalimin e kohës.",
        viewAll: "Shiko të gjithë udhëzuesit shëndetësorë",
      },
      medicalAssistance: {
        title: "Të ndihmojmë të arrish te mjeku",
        subtitle:
          "Nuk gjen mjek ose nuk merr dot takim? Dikush nga ekipi ynë lexon kërkesën tënde dhe të kontakton.",
        requestHelp: "Kërko ndihmë",
        findServices: "Gjej shërbime shëndetësore",
        steps: [
          {
            title: "Na thuaj çfarë të duhet",
            description: "Shkruaj shkurt çfarë të duhet. Pa formularë të ndërlikuar.",
          },
          {
            title: "Merr një përgjigje të qartë",
            description: "Të themi thjesht çfarë mund të bësh.",
          },
          {
            title: "Fol me një mjek online",
            description: "Nëse duhet, të lidhim me një mjek.",
          },
        ],
      },
      trustSection: {
        title: "Shërbim publik shëndetësor",
        subtitle: "Është për këdo që ka nevojë. Informacioni kontrollohet dhe të dhënat e tua mbeten private.",
        builtWith: "Bërë së bashku me komunitetet",
        partnersLabel: "Partnerë qeveritarë dhe shëndetësorë",
        partnerLogo: "Logo partneri",
        commitments: [
          { title: "Falas për të gjithë", description: "Nuk paguan asgjë. Çdokush mund ta përdorë." },
          { title: "Të dhënat e tua mbeten private", description: "Kujdesemi për informacionin tënd dhe nuk e bëjmë publik." },
          { title: "Gjuhë e thjeshtë", description: "Shkruajmë shkurt dhe pa fjalë të vështira." },
        ],
      },
      emergencyNotice: {
        title: "Në rast urgjence mjekësore",
        description: "Nëse mendon se është urgjencë, telefono menjëherë 112.",
      },
    },
    getHelpPage: {
      heroTitle: "Kërko ndihmë",
      heroParagraph:
        "Nuk gjen mjek ose nuk merr dot takim? Na shkruaj shkurt çfarë të duhet. Dikush nga ekipi ynë lexon kërkesën tënde dhe të kontakton.",
      form: {
        countyLabel: "Qarku",
        selectCounty: "Zgjidh qarkun",
        fullNameLabel: "Emri i plotë",
        fullNameOptional: "(sipas dëshirës)",
        fullNamePlaceholder: "Emri yt",
        phoneLabel: "Numri i telefonit",
        phonePlaceholder: "p.sh. 067 123 4567",
        emailLabel: "Adresa e emailit",
        emailPlaceholder: "ti@shembull.com",
        descriptionLabel: "Cili është problemi?",
        descriptionPlaceholder: "Për shembull: çfarë simptomash ke ose te cili mjek do të shkosh.",
        descriptionHint: "Shkruaj vetëm të dhënat personale që duhen.",
        privacyNote: "Të dhënat e tua i përdorim vetëm për të të përgjigjur. Mbeten konfidenciale.",
        privacyConsent: "E kam lexuar dhe pranoj",
        privacyPolicyLabel: "Politikën e Privatësisë",
        privacyConsentRequired: "Shëno kutinë që pranon Politikën e Privatësisë.",
        errorCounty: "Zgjidh qarkun.",
        submitting: "Po dërgohet…",
        submit: "Dërgo kërkesën",
        genericError: "Kërkesa nuk u dërgua. Provo përsëri.",
        errorPhone: "Shkruaj një numër telefoni ku mund të të gjejmë.",
        errorEmailRequired: "Shkruaj adresën tënde të emailit.",
        errorEmailInvalid: "Kjo adresë emaili nuk është e saktë.",
        errorDescription: "Shkruaj pak më shumë për problemin (të paktën 10 karaktere).",
        successTitle: "E morëm kërkesën tënde",
        successBody: "Dikush nga ekipi ynë lexon atë që na shkrove dhe të kontakton me të dhënat që na le.",
        successNotice: "Ky shërbim nuk është për urgjenca. Nëse është urgjencë, telefono menjëherë 112.",
        backHome: "Kthehu në faqen kryesore",
        submitAnother: "Dërgo një kërkesë tjetër",
      },
      sidebar: {
        emergencyTitle: "Në rast urgjence mjekësore",
        emergencyBody: "Ky shërbim nuk është për urgjenca. Nëse është urgjencë, telefono menjëherë 112.",
        whatsNextTitle: "Çfarë ndodh më pas",
        steps: [
          "Lexojmë atë që na shkrove.",
          "Të kontaktojmë me telefon ose email.",
          "Të ndihmojmë të arrish aty ku duhet.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Hyr në RediHealth",
      heroParagraphWithGoogle: "Shkruaj emailin dhe të dërgojmë një kod. Mund të hysh edhe me llogarinë Google.",
      heroParagraphNoGoogle: "Shkruaj emailin dhe të dërgojmë një kod.",
      terms: "Duke vazhduar, pranon Kushtet tona dhe konfirmon se ke lexuar Njoftimin e Privatësisë.",
      unauthorizedGoogle: "Kjo llogari Google nuk ka qasje në RediHealth.",
      authUnavailable: "Nuk mund të hysh tani. Provo përsëri pak më vonë.",
      form: {
        emailLabel: "Adresa e emailit",
        emailPlaceholder: "ti@shembull.com",
        emailHint: "Do të dërgojmë një kod me 6 shifra në këtë adresë.",
        emailInvalid: "Kjo adresë emaili nuk është e saktë.",
        sendingCode: "Duke dërguar kodin...",
        emailMeCode: "Më dërgo një kod",
        portalRecoveryTitle: "Qasja në portalin e pacientit",
        portalRecoveryHint: "E ke humbur lidhjen e portalit? Shkruaj emailin dhe të dërgojmë një të re.",
        portalRecoveryEmailLabel: "Adresa e emailit të pacientit",
        portalRecoveryEmailPlaceholder: "ti@shembull.com",
        portalRecoveryButton: "Më dërgo një lidhje të re",
        portalRecoverySending: "Duke dërguar lidhjen...",
        portalRecoverySent: "Nëse ky email ka një portal pacienti, së shpejti merr një lidhje të re.",
        portalRecoveryError: "Diçka nuk shkoi. Provo përsëri pak më vonë.",
        genericSendError: "Nuk mundëm ta dërgojmë kodin. Provo përsëri.",
        checkEmailTitle: "Kontrollo emailin tënd",
        codeSentBody: (email: string) => `Dërguam një kod me 6 shifra në ${email}. Kodi skadon pas 10 minutash.`,
        codeLabel: "Kodi me 6 shifra",
        codeInvalid: "Shkruaj kodin me 6 shifra nga emaili yt.",
        genericVerifyError: "Nuk mundëm ta kontrollojmë kodin. Provo përsëri.",
        signingIn: "Duke hyrë...",
        continueLabel: "Vazhdo",
        useDifferentEmail: "Përdor një email tjetër",
        or: "ose",
        continueWithGoogle: "Vazhdo me Google",
      },
    },
    findHelpPage: {
      heroTitle: "Gjej ndihmë mjekësore",
      heroParagraph: "Shiko në hartë shërbimet shëndetësore pranë teje. Prek një vend për të parë adresën dhe telefonin.",
      listTitle: "Farmaci, klinika dhe spitale",
      listSubtitle: "Prek një vend për ta parë në hartë.",
      loadingMap: "Duke ngarkuar hartën…",
      mapAttribution: "Të dhënat e hartës © kontribuesit e OpenStreetMap.",
      ctaTitle: "Nuk di ku të shkosh?",
      ctaBody: "Nëse nuk di te cili mjek të shkosh, të udhëzojmë ne. Për një urgjencë, telefono menjëherë 112.",
      ctaButton: "Kërko ndihmë",
    },
    healthInfoPage: {
      eyebrow: "Informacion shëndetësor",
      heroTitle: "Udhëzues për shëndetin",
      heroSubtitle: "Lexo për sëmundjet e zakonshme, si të mbrohesh dhe kur duhet të shkosh te mjeku.",
      browseTitle: "Zgjidh një temë",
      browseSubtitle: "Çdo udhëzues të tregon çfarë mund të bësh çdo ditë për shëndetin tënd.",
      readMore: "Lexo më shumë",
      usingInfoTitle: "Si t'i përdorësh udhëzuesit",
      usingInfoSubtitle: "Udhëzuesit të ndihmojnë të kuptosh dhe të zgjedhësh më mirë. Nuk zëvendësojnë këshillën e mjekut.",
      usingInfoSteps: [
        { title: "Lexo pikat kryesore", description: "Zgjidh një temë që të intereson dhe lexo pjesën e parë." },
        { title: "Mëso cilat janë rreziqet e tua", description: "Shiko zakonet që ndikojnë në shëndetin tënd dhe çfarë mund të ndryshosh." },
        { title: "Ndrysho një gjë të vogël", description: "Fillo me një ndryshim të vogël. Ose vendos nëse duhet të shkosh te mjeku." },
      ],
      ctaTitle: "Të ndihmojmë të arrish te mjeku",
      ctaBody: "Ke pyetje pasi lexove? Ekipi ynë të thotë ku të shkosh.",
      ctaDisclaimer: "Ky informacion nuk është diagnozë mjekësore.",
      menuTitle: "Ku të fillosh",
      menuSubtitle: "Lexo një udhëzues ose kontrollo një simptomë.",
      tabs: {
        menu: "Menyja",
        topics: "Udhëzuesit",
        triage: "Kontrollo një simptomë",
      },
      triageGateway: {
        badge: "Disa pyetje",
        title: "Kontrollo një simptomë",
        description: "Përgjigju disa pyetjeve për si ndihesh. Mëso sa urgjente është dhe çfarë mund të bësh.",
        cta: "Fillo kontrollin",
      },
      topicsGateway: {
        badge: "8 udhëzues të kontrolluar",
        title: "Lexo një udhëzues",
        description: "Për zemrën, diabetin, ushqimin, lëvizjen dhe shëndetin e familjes.",
        cta: "Shiko udhëzuesit",
      },
      quickTopicsTitle: "Kërkohen shpesh",
      backToMenu: "Kthehu te menyja",
      doctorValidatedBadge: "Kontrolluar nga një mjek specialist",
      romanesGlossaryButton: "Fjalë mjekësore në Romanes",
      topicGrid: {
        eyebrow: "Kontrolluar nga mjekët",
        searchPlaceholder: "Kërko një udhëzues",
        searchAriaLabel: "Kërko një udhëzues ose simptomë",
        clearSearchAriaLabel: "Pastro kërkimin",
        filterListAriaLabel: "Filtro udhëzuesit",
        countSingular: "1 udhëzues",
        countPluralTemplate: "{count} udhëzues",
        countSearchSuffix: " për kërkimin tënd",
        doctorValidatedBadge: "Kontrolluar nga mjeku",
        featuredRecommendationEyebrow: "Këshilla e mjekut",
        featuredRecommendationBody: "Matja periodike e tensionit dhe ulja e kripës parandalojnë mbi 80% të komplikimeve madhore kardiovaskulare.",
        cardActionLabel: "Lexo udhëzuesin",
        emptyTitle: "Nuk gjetëm asnjë udhëzues",
        emptyDescription: "Provo një fjalë tjetër ose shiko të gjithë udhëzuesit.",
        emptyResetButton: "Shiko të gjithë udhëzuesit",
        categories: {
          toate: "Të gjitha",
          inima: "Zemra",
          diabet: "Diabeti",
          nutritie: "Ushqimi",
          miscare: "Lëvizja",
          minte: "Mendja dhe gjumi",
          fumat: "Duhani",
          screening: "Kontrollet",
          femei: "Shëndeti i gruas",
        },
      },
    },
    notFoundPage: {
      title: "Nuk e gjetëm këtë faqe",
      subtitle: "Mund të jetë zhvendosur ose fshirë. Kthehu në faqen kryesore ose lexo udhëzuesit për shëndetin.",
      backHome: "Kthehu në faqen kryesore",
      exploreHealth: "Lexo udhëzuesit",
    },
    emergency: {
      bannerAriaLabel: "Paralajmërim urgjence 112",
      bannerText: "Për një urgjencë mjekësore, telefono 112. Aplikacioni nuk mund të telefonojë për ty.",
      dismissBannerAria: "Fshih mesazhin për 112",
      seeAlarmSigns: "Kur të telefonosh 112",
      call112: "Telefono 112",
      signsModalTitle: "Kur të telefonosh 112",
      signsModalSubtitle: "Telefono menjëherë nëse vëren ndonjë nga këto shenja.",
      closeSignsModalAria: "Mbyll dritaren e shenjave të alarmit",
      signPrefix: "Shenja",
      signs: [
        {
          id: "chest-pain",
          title: "Dhimbje të forta në kraharor",
          description: "Shtrëngim, presion ose djegie që mund të shkojë drejt krahut të majtë, qafës ose nofullës.",
          actionHint: "Mund të jetë infarkt",
        },
        {
          id: "breathing-difficulty",
          title: "Merr frymë me shumë vështirësi",
          description: "Mbytet papritur, fishkëllen kur merr frymë ose nuk mund të thotë një fjali të plotë.",
          actionHint: "Mund të jetë ujë në mushkëri (edemë pulmonare) ose krizë e rëndë astme",
        },
        {
          id: "facial-weakness",
          title: "Fytyrë e shtrembër ose dobësi e papritur",
          description: "Goja bie në njërën anë, nuk mund të ngrejë të dy krahët ose flet me vështirësi dhe ngatërruar.",
          actionHint: "Shenjë e goditjes në tru (aksident vaskular cerebral)",
        },
        {
          id: "unconsciousness",
          title: "Të fikët ose nuk përgjigjet",
          description: "Personi nuk përgjigjet kur e thërret ose e prek, ose ra papritur dhe nuk lëviz.",
          actionHint: "Kontrollo menjëherë nëse merr frymë",
        },
        {
          id: "heavy-bleeding",
          title: "Gjakderdhje e madhe",
          description: "Gjaku shpërthen ose nuk ndalet pas 5 minutash që shtyp drejtpërdrejt mbi plagë.",
          actionHint: "Shtyp fort me një leckë të pastër",
        },
        {
          id: "convulsions",
          title: "Konvulsione",
          description: "Trupi dridhet fort, sytë kthehen sipër, personi nuk i kontrollon dot muskujt.",
          actionHint: "Mbroje kokën nga goditjet. Mos i fut asgjë në gojë.",
        },
      ],
      dispatcherGuideTitle: "Çfarë t'i thuash dispeçerit",
      dispatcherGuideSubtitle: "Dispeçeri të bën pyetje. Ji gati të thuash:",
      dispatcherSteps: [
        {
          title: "Ku ndodhesh saktësisht",
          description: "Thuaj vendbanimin, fshatin dhe një pikë referimi të qartë (pranë kishës/xhamisë, pranë shkollës, te ura e vjetër, te dyqani në qendër).",
        },
        {
          title: "Kush ka nevojë për ndihmë",
          description: "Fëmijë, i rritur apo i moshuar. Thuaj nëse personi merr frymë, është zgjuar dhe të përgjigjet.",
        },
        {
          title: "Çfarë ka ndodhur",
          description: "Përshkruaj shkurt: dhimbje kraharori, rënie nga lartësia, të fikët të papritur apo mbytje.",
        },
      ],
      dispatcherImportantNote: "Qëndro në telefon derisa dispeçeri të thotë se mund ta mbyllësh. Ambulanca niset ndërkohë që flet.",
      freeServiceNotice: "Falas nga çdo telefon, edhe pa kredit",
      understandButton: "E kuptova",
      dialerGateTitle: "Thirrje në 112",
      closeWindowAria: "Mbyll dritaren",
      dialerNotice: "Do të telefonosh 112. Hapet tastiera e telefonit. Thirrja nuk fillon vetë. Shtyp ti butonin e gjelbër.",
      dialerFreeNote: "Telefonata është falas në çdo rrjet celular.",
      openDialerButton: "Telefono 112",
      cancelButton: "Anulo",
      desktopDialTitle: "Telefono 112 nga telefoni",
      desktopDialSubtitle: "Formo numrin nga celulari ose telefoni fiks.",
      desktopFreeNote: "Telefonata është falas në çdo rrjet, edhe pa kredit ose kartë SIM.",
      desktopRuralNote: "Nëse jeton në një fshat të largët dhe ambulanca mund të vonohet, kërko nga një fqinj me makinë të të çojë në urgjencën më të afërt.",
    },
    newsRibbon: {
      ariaLabel: "Lajme lokale dhe paralajmërime shëndetësore",
      changeCountyTitle: "Ndrysho qarkun",
      changeLabel: "(ndrysho)",
      noActiveAlerts: "Nuk ka paralajmërime tani",
      viewAllNews: "Shiko të gjitha lajmet",
      modalTitle: "Zgjidh qarkun tënd",
      modalSubtitle: "Shiko njoftimet dhe karvanet mjekësore në zonën tënde.",
      searchPlaceholder: "Kërko qarkun (p.sh. Iași, Galați, Cluj)...",
      detectingLocation: "Po kërkojmë vendndodhjen...",
      useAutoLocation: "Përdor vendndodhjen time",
      currentLabel: "Tani:",
      allCountiesNational: "Të gjitha qarqet (lajme kombëtare)",
      noCountyFound: "Nuk u gjet asnjë qark për",
      closeModal: "Mbyll",
      geoUnsupported: "Shfletuesi yt nuk mund ta gjejë vendndodhjen.",
      geoSuccess: "E gjetëm vendndodhjen tënde.",
      geoError: "Nuk e gjetëm dot vendndodhjen. Zgjidh qarkun nga lista.",
    },
    quiz: {
      sectionTitle: "E vërtetë apo e rreme",
      sectionSubtitle: "Shumë informacione shëndetësore kalojnë nga goja në gojë. Këtu mëson çfarë është e vërtetë dhe çfarë jo.",
      filterAriaLabel: "Filtro mitet sipas kategorisë",
      audioNarratorLabel: "Dëgjo pyetjen dhe shpjegimin",
      trueButton: "E vërtetë",
      falseButton: "E rreme",
      yourSelectedAnswer: "Përgjigjja jote:",
      correctAnswerTag: "Përgjigjja jote është e saktë",
      verifiedClarification: "Sqarim mjekësor i verifikuar",
      stopAudioAria: "Ndalo leximin e shpjegimit",
      listenAudioAria: "Dëgjo shpjegimin",
      stopAudioLabel: "Ndalo leximin",
      listenAudioLabel: "Dëgjo shpjegimin",
      sourcePrefix: "Burimi:",
      askDoctorHandover: "Ke dyshime? Pyet një mjek online për këtë temë",
      restartFirstMyth: "Rifillo nga miti i parë",
      nextMyth: "Kalo te miti tjetër",
      mythProgressPrefix: "Miti",
      mythProgressOf: "nga",
      prevMythAria: "Miti i mëparshëm",
      nextMythAria: "Miti tjetër",
    },
    mediatorBand: {
      question: "Je mediator shëndetësor në komunitet?",
      description: "Mjete për vizitat në terren, triazhin e udhëhequr dhe regjistrin e familjeve që mbështet.",
      cta: "Hap modulin e mediatorëve",
    },
    newsPage: {
      heroTitle: "Lajme për shëndetin dhe njoftime lokale",
      heroSubtitle: "Njoftime shëndetësore, karvane mjekësore dhe fushata vaksinimi në zonën tënde.",
      countyLabel: "Qarku:",
      allCounties: "Të gjitha qarqet",
      categories: {
        all: "Të gjitha",
        epidemics: "Epidemitë dhe njoftimet",
        caravan: "Karvani mjekësor",
        practicalAdvice: "Këshilla praktike",
        patientRights: "Të drejtat e pacientëve",
        childHealth: "Shëndeti i fëmijëve",
        vaccinationCampaigns: "Fushata vaksinimi",
        seasonalAdvice: "Këshilla stinore",
      },
      emptyTitle: "Nuk ka lajme për qarkun e zgjedhur",
      emptySubtitle: "Zgjidh një qark tjetër ose shiko lajmet për gjithë vendin.",
      resetFilter: "Shiko të gjitha lajmet",
      backToNews: "Kthehu te lajmet",
      listenNarration: "Dëgjo një përmbledhje të thjeshtë",
      playAudio: "Dëgjo",
      pauseAudio: "Ndalo",
      handoverTitle: "Ke nevojë për ndihmë mjekësore?",
      handoverSubtitle: "Fol me një mjek online ose kërko ndihmë nga një mediator shëndetësor.",
      handoverTelemed: "Fol me një mjek",
      handoverMediator: "Gjej një mediator shëndetësor",
      changeCounty: "Ndrysho qarkun",
      saveSelection: "Ruaj",
    },
    medicOnlinePage: {
      heroTitle: "Fol me një mjek nga shtëpia",
      heroSubtitle: "Pa radhë dhe pa udhëtime të gjata. Mjeku të dëgjon në telefon dhe të thotë çfarë të bësh.",
      cardOnCallTitle: "Fol tani me mjekun kujdestar",
      cardOnCallSubtitle: "Zakonisht pret më pak se 10 minuta",
      cardOnCallAction: "Hyr në dhomën e pritjes",
      cardBookingTitle: "Cakto një thirrje me mjekun",
      cardBookingSubtitle: "Zgjidh ditën dhe orën",
      cardBookingAction: "Cakto thirrjen",
      cardPortalTitle: "Dosja ime mjekësore",
      cardPortalSubtitle: "Shiko recetat, shënimet e vizitave dhe këshillat e mjekut",
      cardPortalAction: "Hap dosjen",
      bookingTitle: "Cakto një thirrje me mjekun",
      bookingSubtitle: "Zgjidh ditën dhe orën, për veten ose për dikë nga familja. Është falas dhe flet nga telefoni.",
      backToDoctorOnline: "Kthehu te Mjek online",
      backToTelemed: "Kthehu",
      stepDate: "Zgjidh datën dhe orën",
      stepContact: "Të dhënat e pacientit",
      familyForWhom: "Për kë është takimi?",
      familySelf: "Për veten",
      familyOther: "Për dikë nga familja",
      queueTitle: "Dhoma e pritjes",
      queueEstimated: "Pret edhe rreth 7 minuta",
      queueWarning: "Mos e mbyll këtë faqe. Të lidhim sapo mjeku të jetë gati.",
      bandwidthLow: "Interneti është i dobët",
      bandwidthAudioOnly: "Kalojmë vetëm me zë që të mos ndërpritet",
    },
    mediatorsPage: {
      heroTitle: "Mediatorët shëndetësorë",
      heroSubtitle: "Një mediator shëndetësor të ndihmon me dokumentet e identitetit, regjistrimin te mjeku i familjes, vizitat në spital dhe trajtimet falas.",
      requestHelpButton: "Kërko një mediator",
      modalTitle: "Kërko një mediator në zonën tënde",
      nameLabel: "Emri dhe mbiemri",
      phoneLabel: "Telefoni",
      countyLabel: "Qarku",
      localityLabel: "Qyteti ose fshati",
      helpTypeLabel: "Për çfarë të duhet ndihmë?",
      submitButton: "Dërgo kërkesën",
    },
    countyMap: {
      title: "Harta e qarqeve",
      subtitle: "Prek një qark për të parë njoftimet dhe karvanet atje.",
      allCounties: "Të gjitha qarqet",
      mapAriaLabel: "Harta e qarqeve të Rumanisë",
      selectedCountyPrefix: "Qarku i zgjedhur:",
      activeAlertsTooltip: "● Njoftime shëndetësore ose karvanë aktivë",
      generalInfoTooltip: "Vetëm informacion i përgjithshëm",
      recentNewsLabel: "Qarqet me lajme të reja:",
      recentRegionsLabel: "Rajonet me lajme të reja:",
      countyAriaPrefix: "Qarku",
      hasAlertsSuffix: "ka njoftime ose karvanë aktivë",
      romania: "Rumania",
      italy: "Italia",
      pickLabel: "Ose zgjidh nga lista",
      italyMapAriaLabel: "Harta e rajoneve të Italisë",
      selectedRegionPrefix: "Rajoni i zgjedhur:",
      allItaly: "E gjithë Italia",
      italyTitle: "Harta e rajoneve",
      italySubtitle: "Prek një rajon ose zgjidh nga lista për të parë lajmet.",
    },
    accountAuthPage: {
      title: "Hyr në dosjen mjekësore",
      subtitle: "Shkruaj numrin e telefonit që përdore për takimin. Të dërgojmë një kod me SMS.",
      phoneLabel: "Numri i telefonit",
      phonePlaceholder: "0721 000 000",
      sendCode: "Dërgo kodin",
      codeLabel: "Kodi me 4 shifra nga SMS-ja",
      verifyCode: "Kontrollo kodin",
      invalidCode: "Kodi është gabim ose ka skaduar.",
      backHome: "Kthehu në faqen kryesore",
    },
  },
  it: {
    nav: {
      healthInformation: "Informazioni sanitarie",
      healthCheck: "Controllo sanitario",
      findHelp: "Trova assistenza medica",
      about: "Chi siamo",
      reportIssue: "Segnala un problema",
    },
    account: {
      signIn: "Accedi",
      panel: "Pannello",
    },
    header: {
      getHelp: "Richiedi aiuto",
      demo: "Demo",
      navAfla: "Scopri",
      navAflaSub: "Guide sulla salute e miti spiegati",
      navCere: "Chiedi orientamento",
      navCereSub: "Assistente e controllo dei sintomi",
      navMedic: "Medico online",
      navMedicSub: "Appuntamenti e medico di guardia",
      navStiri: "Notizie",
      navStiriSub: "Avvisi locali e carovane sanitarie",
      forMediators: "Per mediatori",
      myAccount: "Il mio account",
      medicalPanel: "Pannello medico",
      startHere: "Inizia qui",
      closeMenu: "Chiudi menu",
      openMenu: "Apri menu",
      emergencyTitle: "Emergenza medica?",
      emergencyCallPrompt: "Chiama subito il 112",
      call112: "Chiama il 112",
      mediatorProfessionals: "Per professionisti",
      mediatorDrawerDescription: "Sei un mediatore sanitario? Qui trovi il modulo per il lavoro sul territorio e il registro delle famiglie.",
      enterMediatorModule: "Apri il modulo mediatori",
    },
    hero: {
      trustBadge: "Servizio pubblico gratuito, fatto insieme alle comunità",
      titleLine1: "Informazioni semplici sulla salute",
      titleLine2: "e aiuto per arrivare",
      titleLine3: "dal medico giusto.",
      paragraph:
        "REDI Health ti aiuta a capire la tua salute, a sapere dove andare e a parlare con un medico online. È gratuito, per le comunità rom e per chiunque ne abbia bisogno.",
      cta: "Dicci cosa ti preoccupa",
      assistantCta: "Leggi le guide",
      assistantHref: "/health-information",
      assistantAlwaysVisible: true,
      mediatorPill: "Sei un mediatore sanitario? Apri il tuo pannello",
      mediatorHref: "/panel",
      telemedicinePill: "Medico online",
      emergencyNoticeVerbatim:
        "Chiama tu il 112. L'app non chiama al posto tuo.",
      triage: {
        badge: "Aiuto in 3 passi",
        question: "Cosa ti preoccupa oggi?",
        subQuestion: "Scegli quello che fa per te:",
        options: [
          {
            id: "learn",
            icon: "BookIcon",
            title: "Voglio sapere di più sulla salute",
            desc: "Guide brevi e miti sulla salute, spiegati in modo semplice.",
            actionLabel: "Leggi le guide",
            actionHref: "/health-information",
          },
          {
            id: "check",
            icon: "ClipboardCheckIcon",
            title: "Voglio controllare i miei sintomi",
            desc: "Indica sul corpo dove fa male, rispondi a tre domande e scopri cosa fare dopo.",
            actionLabel: "Inizia il controllo",
            actionHref: "/health-check",
          },
          {
            id: "symptoms",
            icon: "ActivityIcon",
            title: "Ho un problema di salute",
            desc: "Guarda i segnali di allarme e parla online con il medico di guardia.",
            actionLabel: "Parla con il medico",
            actionHref: "/get-help?mode=doctor",
          },
          {
            id: "prescription",
            icon: "PrescriptionIcon",
            title: "Voglio capire la mia ricetta",
            desc: "Scopri come e quando prendere le pastiglie e cosa evitare.",
            actionLabel: "Spiegami la ricetta",
            actionHref: "/health-assistant?tab=prescription",
          },
          {
            id: "navigation",
            icon: "HandHelpingIcon",
            title: "Non so dove andare (medico di base, SSN)",
            desc: "Aiuto per iscriverti dal medico di base, per le cure urgenti e per i documenti.",
            actionLabel: "Chiedi a un mediatore",
            actionHref: "/get-help?mode=mediator",
          },
        ],
        doctorPrompt: "Vuoi parlare con un medico online?",
        doctorOnDutyCta: "Parla con il medico di guardia",
        backButton: "Torna alle opzioni",
        reassurance: "Riservato. Non serve un account.",
      },
      phone: {
        status: "online",
        messages: [
          "Il vaccino antinfluenzale causa l'influenza",
          "Falso.",
          "I vaccini antinfluenzali non possono causare l'influenza.",
          "Non fidarti delle voci.",
          "Chiedi a un medico o a una fonte di cui ti fidi.",
        ],
        factcheckLine1: "Messaggio ingannevole",
        factcheckLine2:
          "Il vaccino antinfluenzale non contiene virus vivo che possa farti venire l'influenza.",
        source: "Fonte: OMS, Ministero della Salute",
        button: "Chiedi a un mediatore",
      },
    },
    footer: {
      disclaimer:
        "Queste informazioni ti aiutano a capire. Non sostituiscono il parere del medico.",
      govPartner: "Partner governativo",
      healthcarePartners: "Partner sanitari",
      groups: {
        health: { heading: "Salute", healthInformation: "Informazioni sanitarie", findHelp: "Trova assistenza medica" },
        platform: { heading: "Piattaforma", about: "Chi siamo", contact: "Contatti", accessibility: "Accessibilità" },
        legal: { heading: "Legale", privacy: "Privacy", terms: "Termini" },
      },
      brandDescription:
        "RediHealth aiuta le persone delle comunità vulnerabili a capire la propria salute, a sapere cosa fare e a raggiungere un medico.",
      mediatorPartnershipBadge: "In collaborazione con la rete dei mediatori sanitari",
      whoStandardBadge: "Servizio gratuito conforme agli standard OMS",
      col1Heading: "Informazioni mediche",
      col1Link1: "Guide sulla salute",
      col1Link2: "Chiedi orientamento",
      col1Link3: "Controlla i sintomi",
      col1Link4: "Notizie locali e avvisi di salute",
      col2Heading: "Servizi clinici",
      col2Link1: "Parla con un medico online",
      col2Link2: "Prenotazione medico di guardia",
      col2Link3: "Trova ambulatorio o ospedale",
      col2Link4: "Il mio account e ricette",
      col3Heading: "Per mediatori e medici",
      col3Link1: "Modulo per mediatori sanitari",
      col3Link2: "Pannello per il territorio",
      col3Link3: "Portale per medici",
      col3Link4: "Come lavorano insieme medico e mediatore",
      col4Heading: "Chi siamo e termini",
      col4Link1: "Chi è RediHealth",
      col4Link2: "Contatti e segnalazioni",
      col4Link3: "Dichiarazione di accessibilità",
      col4Link4: "Privacy e protezione dei dati (GDPR)",
      col4Link5: "Termini e condizioni",
      emergency112Title: "Emergenza? Chiama il 112 da qualsiasi telefono.",
      emergency112Text:
        "La chiamata è gratuita, anche senza credito o scheda SIM. RediHealth non chiama il 112 al posto tuo.",
      seeAlarmSigns: "Vedi i segnali d'allarme",
      call112Button: "Chiama il 112",
      reportIssueFallback: "Segnala un problema tecnico",
      copyrightLine: "© 2026 RediHealth. Fatto per le comunità vulnerabili.",
      nonEmergencyWarning:
        "L'app ti dà informazioni e orientamento. Non sostituisce il soccorso d'urgenza.",
    },
    landing: {
      mythBuster: {
        title: "Vero o falso",
        subtitle: "Le voci sulla salute girano in fretta. Controllale prima di decidere qualcosa.",
        messageLabel: "Messaggio",
      },
      helpOptions: {
        title: "Come possiamo aiutarti?",
        subtitle: "Scegli di cosa hai bisogno e ti mostriamo cosa fare dopo.",
        options: [
          {
            title: "Informati sulla tua salute",
            description: "Scopri quali sono i rischi più comuni e come proteggerti.",
            cta: "Leggi le guide",
            href: "/health-information",
          },
          {
            title: "Controlla la tua salute",
            description: "Rispondi a poche domande brevi su come ti senti.",
            cta: "Inizia il controllo",
            href: "/health-check",
          },
          {
            title: "Trova assistenza medica",
            description: "Trova servizi sanitari o chiedi aiuto per avere un appuntamento.",
            cta: "Trova aiuto",
            href: "/find-help",
          },
        ],
        mediatorBand: { text: "Sei un mediatore sanitario?", cta: "Apri il modulo mediatori" },
      },
      healthTopics: {
        title: "Prenditi cura della tua salute",
        subtitle: "I piccoli passi che fai oggi possono ridurre nel tempo i rischi per la tua salute.",
        viewAll: "Vedi tutte le guide alla salute",
      },
      medicalAssistance: {
        title: "Ti aiutiamo ad arrivare dal medico",
        subtitle:
          "Non trovi un medico o non riesci a prendere un appuntamento? Qualcuno del nostro team legge la tua richiesta e ti contatta.",
        requestHelp: "Chiedi aiuto",
        findServices: "Trova servizi sanitari",
        steps: [
          {
            title: "Dicci di cosa hai bisogno",
            description: "Scrivi in breve di cosa hai bisogno. Niente moduli complicati.",
          },
          {
            title: "Ricevi una risposta chiara",
            description: "Ti diciamo in modo semplice cosa puoi fare.",
          },
          {
            title: "Parla con un medico online",
            description: "Se serve, ti mettiamo in contatto con un medico.",
          },
        ],
      },
      trustSection: {
        title: "Servizio sanitario pubblico",
        subtitle: "È per chiunque ne abbia bisogno. Le informazioni sono controllate e i tuoi dati restano privati.",
        builtWith: "Fatto insieme alle comunità",
        partnersLabel: "Partner governativi e sanitari",
        partnerLogo: "Logo partner",
        commitments: [
          { title: "Gratis per tutti", description: "Non paghi niente. Chiunque può usarlo." },
          { title: "I tuoi dati restano privati", description: "Abbiamo cura delle tue informazioni e non le rendiamo pubbliche." },
          { title: "Parole semplici", description: "Frasi brevi, senza parole difficili." },
        ],
      },
      emergencyNotice: {
        title: "In caso di emergenza medica",
        description: "Se pensi che sia un'emergenza, chiama subito il 112.",
      },
    },
    getHelpPage: {
      heroTitle: "Chiedi aiuto",
      heroParagraph:
        "Non trovi un medico o non riesci a prendere un appuntamento? Scrivici in breve di cosa hai bisogno. Qualcuno del nostro team legge la tua richiesta e ti contatta.",
      form: {
        countyLabel: "Provincia",
        selectCounty: "Scegli la provincia",
        fullNameLabel: "Nome completo",
        fullNameOptional: "(facoltativo)",
        fullNamePlaceholder: "Il tuo nome",
        phoneLabel: "Numero di telefono",
        phonePlaceholder: "es. 333 123 4567",
        emailLabel: "Indirizzo email",
        emailPlaceholder: "tu@esempio.com",
        descriptionLabel: "Qual è il problema?",
        descriptionPlaceholder: "Per esempio: che sintomi hai o da quale medico devi andare.",
        descriptionHint: "Scrivi solo i dati personali che servono.",
        privacyNote: "Usiamo i tuoi dati solo per risponderti. Restano riservati.",
        privacyConsent: "Ho letto e accetto",
        privacyPolicyLabel: "l'Informativa sulla privacy",
        privacyConsentRequired: "Spunta la casella per accettare l'Informativa sulla privacy.",
        errorCounty: "Scegli la provincia.",
        submitting: "Invio in corso…",
        submit: "Invia richiesta",
        genericError: "La richiesta non è partita. Riprova.",
        errorPhone: "Scrivi un numero di telefono a cui possiamo trovarti.",
        errorEmailRequired: "Scrivi il tuo indirizzo email.",
        errorEmailInvalid: "Questo indirizzo email non è corretto.",
        errorDescription: "Scrivi qualcosa in più sul problema (almeno 10 caratteri).",
        successTitle: "Abbiamo ricevuto la tua richiesta",
        successBody: "Qualcuno del nostro team legge il tuo messaggio e ti contatta con i dati che ci hai lasciato.",
        successNotice: "Questo servizio non è per le emergenze. Se è un'emergenza, chiama subito il 112.",
        backHome: "Torna alla home",
        submitAnother: "Invia un'altra richiesta",
      },
      sidebar: {
        emergencyTitle: "In caso di emergenza medica",
        emergencyBody: "Questo servizio non è per le emergenze. Se è un'emergenza, chiama subito il 112.",
        whatsNextTitle: "Cosa succede dopo",
        steps: [
          "Leggiamo il tuo messaggio.",
          "Ti contattiamo per telefono o email.",
          "Ti aiutiamo ad arrivare nel posto giusto.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Accedi a RediHealth",
      heroParagraphWithGoogle: "Scrivi la tua email e ti mandiamo un codice. Puoi entrare anche con Google.",
      heroParagraphNoGoogle: "Scrivi la tua email e ti mandiamo un codice.",
      terms: "Se continui, accetti i nostri Termini e confermi di aver letto l'Informativa sulla privacy.",
      unauthorizedGoogle: "Questo account Google non ha accesso a RediHealth.",
      authUnavailable: "Ora non puoi accedere. Riprova tra poco.",
      form: {
        emailLabel: "Indirizzo email",
        emailPlaceholder: "tu@esempio.com",
        emailHint: "Ti mandiamo a questo indirizzo un codice di 6 cifre.",
        emailInvalid: "Questo indirizzo email non è corretto.",
        sendingCode: "Invio del codice...",
        emailMeCode: "Inviami un codice",
        portalRecoveryTitle: "Accesso al portale paziente",
        portalRecoveryHint: "Hai perso il link al portale? Scrivi la tua email e te ne mandiamo uno nuovo.",
        portalRecoveryEmailLabel: "Indirizzo email del paziente",
        portalRecoveryEmailPlaceholder: "tu@esempio.com",
        portalRecoveryButton: "Inviami un nuovo link",
        portalRecoverySending: "Invio del link...",
        portalRecoverySent: "Se questa email ha un portale paziente, riceverai presto un nuovo link.",
        portalRecoveryError: "Qualcosa non ha funzionato. Riprova tra poco.",
        genericSendError: "Non siamo riusciti a inviare il codice. Riprova.",
        checkEmailTitle: "Controlla la tua email",
        codeSentBody: (email: string) => `Abbiamo inviato un codice di 6 cifre a ${email}. Il codice scade tra 10 minuti.`,
        codeLabel: "Codice di 6 cifre",
        codeInvalid: "Scrivi il codice di 6 cifre ricevuto via email.",
        genericVerifyError: "Non siamo riusciti a controllare il codice. Riprova.",
        signingIn: "Accesso in corso...",
        continueLabel: "Continua",
        useDifferentEmail: "Usa un'altra email",
        or: "oppure",
        continueWithGoogle: "Continua con Google",
      },
    },
    findHelpPage: {
      heroTitle: "Trova assistenza medica",
      heroParagraph: "Guarda sulla mappa i servizi sanitari vicino a te. Tocca un luogo per vedere indirizzo e telefono.",
      listTitle: "Farmacie, ambulatori e ospedali",
      listSubtitle: "Tocca un luogo per vederlo sulla mappa.",
      loadingMap: "Caricamento mappa…",
      mapAttribution: "Dati mappa © collaboratori di OpenStreetMap.",
      ctaTitle: "Non sai dove andare?",
      ctaBody: "Se non sai da quale medico andare, ti aiutiamo noi. In caso di emergenza, chiama subito il 112.",
      ctaButton: "Chiedi aiuto",
    },
    healthInfoPage: {
      eyebrow: "Informazioni sanitarie",
      heroTitle: "Guide sulla salute",
      heroSubtitle: "Leggi delle malattie più comuni, di come proteggerti e di quando andare dal medico.",
      browseTitle: "Scegli un argomento",
      browseSubtitle: "Ogni guida ti mostra cosa puoi fare ogni giorno per la tua salute.",
      readMore: "Leggi di più",
      usingInfoTitle: "Come usare le guide",
      usingInfoSubtitle: "Le guide ti aiutano a capire e a scegliere meglio. Non sostituiscono il parere del medico.",
      usingInfoSteps: [
        { title: "Leggi i punti chiave", description: "Scegli un argomento che ti riguarda e leggi la parte iniziale." },
        { title: "Scopri i tuoi rischi", description: "Guarda le abitudini che pesano sulla tua salute e cosa puoi cambiare." },
        { title: "Cambia una piccola cosa", description: "Inizia con un piccolo cambiamento. Oppure decidi se devi andare dal medico." },
      ],
      ctaTitle: "Ti aiutiamo ad arrivare dal medico",
      ctaBody: "Hai domande dopo aver letto? Il nostro team ti dice dove andare.",
      ctaDisclaimer: "Queste informazioni non sono una diagnosi medica.",
      menuTitle: "Da dove iniziare",
      menuSubtitle: "Leggi una guida o controlla un sintomo.",
      tabs: {
        menu: "Menu",
        topics: "Guide",
        triage: "Controlla un sintomo",
      },
      triageGateway: {
        badge: "Poche domande",
        title: "Controlla un sintomo",
        description: "Rispondi a poche domande su come ti senti. Scopri quanto è urgente e cosa puoi fare.",
        cta: "Inizia il controllo",
      },
      topicsGateway: {
        badge: "8 guide controllate",
        title: "Leggi una guida",
        description: "Su cuore, diabete, cibo, movimento e salute della famiglia.",
        cta: "Vedi le guide",
      },
      quickTopicsTitle: "Cercati spesso",
      backToMenu: "Torna al menu",
      doctorValidatedBadge: "Controllato da un medico specialista",
      romanesGlossaryButton: "Parole mediche in Romanes",
      topicGrid: {
        eyebrow: "Controllate dai medici",
        searchPlaceholder: "Cerca una guida o un sintomo",
        searchAriaLabel: "Cerca una guida o un sintomo",
        clearSearchAriaLabel: "Cancella ricerca",
        filterListAriaLabel: "Filtra le guide",
        countSingular: "1 guida",
        countPluralTemplate: "{count} guide",
        countSearchSuffix: " per la tua ricerca",
        doctorValidatedBadge: "Controllato da un medico",
        featuredRecommendationEyebrow: "Il consiglio del medico",
        featuredRecommendationBody: "Il controllo regolare della pressione arteriosa e la riduzione del sale prevengono oltre l'80% delle principali complicanze cardiovascolari.",
        cardActionLabel: "Leggi o ascolta",
        emptyTitle: "Nessuna guida trovata",
        emptyDescription: "Prova un'altra parola o guarda tutte le guide.",
        emptyResetButton: "Vedi tutte le guide",
        categories: {
          toate: "Tutte",
          inima: "Cuore",
          diabet: "Diabete",
          nutritie: "Cibo",
          miscare: "Attività fisica",
          minte: "Mente e sonno",
          fumat: "Fumo",
          screening: "Controlli",
          femei: "Salute della donna",
        },
      },
    },
    notFoundPage: {
      title: "Non troviamo questa pagina",
      subtitle: "Forse è stata spostata o cancellata. Torna alla home o leggi le guide sulla salute.",
      backHome: "Torna alla home",
      exploreHealth: "Leggi le guide",
    },
    emergency: {
      bannerAriaLabel: "Avviso di emergenza 112",
      bannerText: "Per un'emergenza medica, chiama il 112. L'app non può chiamare al posto tuo.",
      dismissBannerAria: "Nascondi il messaggio sul 112",
      seeAlarmSigns: "Quando chiamare il 112",
      call112: "Chiama il 112",
      signsModalTitle: "Quando chiamare il 112",
      signsModalSubtitle: "Chiama subito se noti uno di questi segnali.",
      closeSignsModalAria: "Chiudi la finestra dei segnali di allarme",
      signPrefix: "Segnale",
      signs: [
        {
          id: "chest-pain",
          title: "Forti dolori al petto",
          description: "Peso, stretta o bruciore che può arrivare al braccio sinistro, al collo o alla mandibola.",
          actionHint: "Può essere un infarto",
        },
        {
          id: "breathing-difficulty",
          title: "Respira con grande fatica",
          description: "Soffoca all'improvviso, respira fischiando o non riesce a dire una frase intera.",
          actionHint: "Può essere acqua nei polmoni (edema polmonare) o un attacco grave di asma",
        },
        {
          id: "facial-weakness",
          title: "Viso storto o debolezza improvvisa",
          description: "Bocca storta da un lato, non riesce ad alzare entrambe le braccia o parla in modo confuso.",
          actionHint: "Segnale di ictus",
        },
        {
          id: "unconsciousness",
          title: "Svenimento o non risponde",
          description: "La persona non risponde se la chiami o la tocchi, oppure è caduta all'improvviso e non si muove.",
          actionHint: "Controlla subito se respira",
        },
        {
          id: "heavy-bleeding",
          title: "Emorragia forte",
          description: "Il sangue esce a fiotti o non si ferma dopo 5 minuti che premi direttamente sulla ferita.",
          actionHint: "Premi forte con un panno pulito",
        },
        {
          id: "convulsions",
          title: "Convulsioni",
          description: "Il corpo trema forte, gli occhi si rovesciano, la persona non controlla più i muscoli.",
          actionHint: "Proteggi la testa dai colpi. Non mettere niente in bocca.",
        },
      ],
      dispatcherGuideTitle: "Cosa dire all'operatore",
      dispatcherGuideSubtitle: "L'operatore ti fa delle domande. Preparati a dire:",
      dispatcherSteps: [
        {
          title: "Dove ti trovi esattamente",
          description: "Di' il paese o la città e un punto di riferimento chiaro (vicino alla chiesa, alla scuola, al vecchio ponte, al negozio in centro).",
        },
        {
          title: "Chi ha bisogno di aiuto",
          description: "Bambino, adulto o anziano. Di' se la persona respira, è sveglia e ti risponde.",
        },
        {
          title: "Cosa è successo",
          description: "Descrivi in breve: dolore al petto, caduta dall'alto, svenimento improvviso o soffocamento.",
        },
      ],
      dispatcherImportantNote: "Resta al telefono finché l'operatore non ti dice che puoi riagganciare. L'ambulanza parte mentre parli.",
      freeServiceNotice: "Gratuito da qualsiasi telefono, anche senza credito",
      understandButton: "Ho capito",
      dialerGateTitle: "Chiamata al 112",
      closeWindowAria: "Chiudi finestra",
      dialerNotice: "Stai per chiamare il 112. Si apre la tastiera del telefono. La chiamata non parte da sola. Premi tu il tasto verde.",
      dialerFreeNote: "La chiamata è gratuita su qualsiasi rete.",
      openDialerButton: "Componi il 112",
      cancelButton: "Annulla",
      desktopDialTitle: "Chiama il 112 dal telefono",
      desktopDialSubtitle: "Componi il numero dal cellulare o dal telefono fisso.",
      desktopFreeNote: "La chiamata è gratuita su qualsiasi rete, anche senza credito o scheda SIM.",
      desktopRuralNote: "Se vivi in un paese isolato e l'ambulanza può tardare, chiedi a un vicino con l'auto di portarti al Pronto Soccorso più vicino.",
    },
    newsRibbon: {
      ariaLabel: "Notizie locali e avvisi di salute",
      changeCountyTitle: "Cambia provincia",
      changeLabel: "(cambia)",
      noActiveAlerts: "Nessun avviso adesso",
      viewAllNews: "Vedi tutte le notizie",
      modalTitle: "Scegli la tua provincia",
      modalSubtitle: "Guarda gli avvisi e le carovane mediche nella tua zona.",
      searchPlaceholder: "Cerca provincia (es. Iași, Galați, Cluj)...",
      detectingLocation: "Cerchiamo la tua posizione...",
      useAutoLocation: "Usa la mia posizione",
      currentLabel: "Ora:",
      allCountiesNational: "Tutte le province (notizie nazionali)",
      noCountyFound: "Nessuna provincia trovata per",
      closeModal: "Chiudi",
      geoUnsupported: "Il tuo browser non riesce a trovare la posizione.",
      geoSuccess: "Abbiamo trovato la tua posizione.",
      geoError: "Non riusciamo a trovare la tua posizione. Scegli la provincia dall'elenco.",
    },
    quiz: {
      sectionTitle: "Vero o falso",
      sectionSubtitle: "Molte informazioni sulla salute passano di bocca in bocca. Qui scopri cosa è vero e cosa no.",
      filterAriaLabel: "Filtra i miti per categoria",
      audioNarratorLabel: "Ascolta la domanda e la spiegazione",
      trueButton: "Vero",
      falseButton: "Falso",
      yourSelectedAnswer: "La tua risposta:",
      correctAnswerTag: "Hai risposto correttamente",
      verifiedClarification: "Chiarimento medico verificato",
      stopAudioAria: "Interrompi la lettura della spiegazione",
      listenAudioAria: "Ascolta la spiegazione",
      stopAudioLabel: "Interrompi la lettura",
      listenAudioLabel: "Ascolta la spiegazione",
      sourcePrefix: "Fonte:",
      askDoctorHandover: "Hai dubbi? Chiedi a un medico online su questo argomento",
      restartFirstMyth: "Ricomincia dal primo mito",
      nextMyth: "Passa al mito successivo",
      mythProgressPrefix: "Mito",
      mythProgressOf: "di",
      prevMythAria: "Mito precedente",
      nextMythAria: "Mito successivo",
    },
    mediatorBand: {
      question: "Sei un mediatore sanitario nella comunità?",
      description: "Strumenti per le visite sul campo, il triage guidato e il registro delle famiglie che segui.",
      cta: "Apri il modulo per i mediatori",
    },
    newsPage: {
      heroTitle: "Notizie sulla salute e avvisi locali",
      heroSubtitle: "Avvisi sanitari, ambulatori mobili e campagne di vaccinazione nella tua zona.",
      countyLabel: "Provincia:",
      allCounties: "Tutte le province",
      categories: {
        all: "Tutte",
        epidemics: "Epidemie e avvisi",
        caravan: "Carovana medica",
        practicalAdvice: "Consigli pratici",
        patientRights: "Diritti dei pazienti",
        childHealth: "Salute dei bambini",
        vaccinationCampaigns: "Campagne vaccinali",
        seasonalAdvice: "Consigli stagionali",
      },
      emptyTitle: "Nessuna notizia per questa provincia",
      emptySubtitle: "Scegli un'altra provincia o guarda le notizie di tutto il paese.",
      resetFilter: "Vedi tutte le notizie",
      backToNews: "Torna alle notizie",
      listenNarration: "Ascolta un riassunto semplice",
      playAudio: "Ascolta",
      pauseAudio: "Pausa",
      handoverTitle: "Hai bisogno di aiuto medico?",
      handoverSubtitle: "Parla con un medico online o chiedi aiuto a un mediatore.",
      handoverTelemed: "Parla con un medico",
      handoverMediator: "Trova un mediatore sanitario",
      changeCounty: "Cambia provincia",
      saveSelection: "Salva",
    },
    medicOnlinePage: {
      heroTitle: "Parla con un medico da casa",
      heroSubtitle: "Niente code e niente viaggi lunghi. Il medico ti ascolta al telefono e ti dice cosa fare.",
      cardOnCallTitle: "Parla ora con il medico di guardia",
      cardOnCallSubtitle: "Di solito aspetti meno di 10 minuti",
      cardOnCallAction: "Entra nella sala d'attesa",
      cardBookingTitle: "Prenota una chiamata con il medico",
      cardBookingSubtitle: "Scegli giorno e ora",
      cardBookingAction: "Prenota ora",
      cardPortalTitle: "Il mio fascicolo sanitario",
      cardPortalSubtitle: "Guarda ricette, referti delle visite e consigli del medico",
      cardPortalAction: "Apri il fascicolo",
      bookingTitle: "Prenota una chiamata con il medico",
      bookingSubtitle: "Scegli giorno e ora, per te o per qualcuno della tua famiglia. È gratis e parli dal telefono.",
      backToDoctorOnline: "Torna a Medico online",
      backToTelemed: "Indietro",
      stepDate: "Scegli data e ora",
      stepContact: "Dati del paziente",
      familyForWhom: "Per chi è l'appuntamento?",
      familySelf: "Per me",
      familyOther: "Per un familiare",
      queueTitle: "Sala d'attesa",
      queueEstimated: "Mancano circa 7 minuti",
      queueWarning: "Non chiudere questa pagina. Ti colleghiamo appena il medico è pronto.",
      bandwidthLow: "Internet è lento",
      bandwidthAudioOnly: "Passiamo solo all'audio per non far cadere la chiamata",
    },
    mediatorsPage: {
      heroTitle: "Mediatori sanitari",
      heroSubtitle: "Un mediatore sanitario ti aiuta con i documenti di identità, l'iscrizione dal medico di base, le visite in ospedale e le cure gratuite.",
      requestHelpButton: "Chiedi un mediatore",
      modalTitle: "Chiedi un mediatore nella tua zona",
      nameLabel: "Nome e cognome",
      phoneLabel: "Telefono",
      countyLabel: "Provincia",
      localityLabel: "Località o paese",
      helpTypeLabel: "Per cosa ti serve aiuto?",
      submitButton: "Invia richiesta",
    },
    countyMap: {
      title: "Mappa delle province",
      subtitle: "Tocca una provincia per vedere avvisi e carovane in quella zona.",
      allCounties: "Tutte le province",
      mapAriaLabel: "Mappa delle province della Romania",
      selectedCountyPrefix: "Provincia scelta:",
      activeAlertsTooltip: "● Avvisi sanitari o carovane attive",
      generalInfoTooltip: "Solo informazioni generali",
      recentNewsLabel: "Province con aggiornamenti recenti:",
      recentRegionsLabel: "Regioni con aggiornamenti recenti:",
      countyAriaPrefix: "Provincia di",
      hasAlertsSuffix: "ha avvisi o carovane attive",
      romania: "Romania",
      italy: "Italia",
      pickLabel: "Oppure scegli dall'elenco",
      italyMapAriaLabel: "Mappa delle regioni d'Italia",
      selectedRegionPrefix: "Regione scelta:",
      allItaly: "Tutta Italia",
      italyTitle: "Mappa delle regioni",
      italySubtitle: "Tocca una regione o sceglila dall'elenco per vedere le notizie.",
    },
    accountAuthPage: {
      title: "Apri il tuo fascicolo sanitario",
      subtitle: "Scrivi il numero di telefono che hai usato per prenotare. Ti mandiamo un codice via SMS.",
      phoneLabel: "Numero di telefono",
      phonePlaceholder: "0721 000 000",
      sendCode: "Invia il codice",
      codeLabel: "Codice di 4 cifre ricevuto via SMS",
      verifyCode: "Controlla il codice",
      invalidCode: "Il codice è sbagliato o è scaduto.",
      backHome: "Torna alla home",
    },
  },
  hr: {
    nav: {
      healthInformation: "Informacije o zdravlju",
      healthCheck: "Provjera simptoma",
      findHelp: "Pronađi liječničku pomoć",
      about: "O nama",
      reportIssue: "Prijavi problem",
    },
    account: {
      signIn: "Prijava",
      panel: "Panel",
    },
    header: {
      getHelp: "Potraži pomoć",
      demo: "Demo",
      navAfla: "Saznaj",
      navAflaSub: "Zdravstveni vodiči i objašnjeni mitovi",
      navCere: "Zatraži uputu",
      navCereSub: "Asistent i provjera simptoma",
      navMedic: "Liječnik online",
      navMedicSub: "Termini i dežurni liječnik",
      navStiri: "Vijesti",
      navStiriSub: "Lokalna upozorenja i mobilne ambulante",
      forMediators: "Za zdravstvene medijatore",
      myAccount: "Moj račun",
      medicalPanel: "Medicinski panel",
      startHere: "Kreni ovdje",
      closeMenu: "Zatvori izbornik",
      openMenu: "Otvori izbornik",
      emergencyTitle: "Hitni medicinski slučaj?",
      emergencyCallPrompt: "Izravno nazovi 112",
      call112: "Nazovi 112",
      mediatorProfessionals: "Za stručnjake",
      mediatorDrawerDescription: "Jesi li zdravstveni medijator? Ovdje se nalazi terenski modul i evidencija obitelji.",
      enterMediatorModule: "Otvori modul za medijatore",
    },
    hero: {
      trustBadge: "Besplatna javna usluga, izrađena zajedno sa zajednicama",
      titleLine1: "Jednostavne informacije o zdravlju",
      titleLine2: "i pomoć da dođeš",
      titleLine3: "do pravog liječnika.",
      paragraph:
        "REDI Health ti pomaže razumjeti svoje zdravlje, saznati kamo ići i razgovarati s liječnikom online. Usluga je besplatna za romske zajednice i za svakoga kome je potrebna.",
      cta: "Reci nam što te brine",
      assistantCta: "Pročitaj vodiče",
      assistantHref: "/health-information",
      assistantAlwaysVisible: true,
      mediatorPill: "Jesi li zdravstveni medijator? Otvori svoj panel",
      mediatorHref: "/panel",
      telemedicinePill: "Liječnik online",
      emergencyNoticeVerbatim:
        "Nazovi 112 osobno. Aplikacija ne zove umjesto tebe.",
      triage: {
        badge: "Pomoć u 3 koraka",
        question: "Što te danas brine?",
        subQuestion: "Odaberi ono što ti odgovara:",
        options: [
          {
            id: "learn",
            icon: "BookIcon",
            title: "Želim saznati više o zdravlju",
            desc: "Kratki vodiči i zdravstveni mitovi, objašnjeni jednostavno.",
            actionLabel: "Pročitaj vodiče",
            actionHref: "/health-information",
          },
          {
            id: "check",
            icon: "ClipboardCheckIcon",
            title: "Želim provjeriti svoje simptome",
            desc: "Pokaži na tijelu gdje te boli, odgovori na tri pitanja i saznaj što učiniti dalje.",
            actionLabel: "Pokreni provjeru",
            actionHref: "/health-check",
          },
          {
            id: "symptoms",
            icon: "ActivityIcon",
            title: "Imam zdravstveni problem",
            desc: "Pogledaj znakove uzbune i razgovaraj online s dežurnim liječnikom.",
            actionLabel: "Razgovaraj s liječnikom",
            actionHref: "/get-help?mode=doctor",
          },
          {
            id: "prescription",
            icon: "PrescriptionIcon",
            title: "Želim razumjeti svoj recept",
            desc: "Saznaj kako i kada uzimati lijekove te što treba izbjegavati.",
            actionLabel: "Objasni mi recept",
            actionHref: "/health-assistant?tab=prescription",
          },
          {
            id: "navigation",
            icon: "HandHelpingIcon",
            title: "Ne znam kamo ići (obiteljski liječnik, HZZO)",
            desc: "Pomoć oko upisa kod obiteljskog liječnika, hitne skrbi, uputnice i dokumenata.",
            actionLabel: "Pitaj zdravstvenog medijatora",
            actionHref: "/get-help?mode=mediator",
          },
        ],
        doctorPrompt: "Želiš li razgovarati s liječnikom online?",
        doctorOnDutyCta: "Razgovaraj s dežurnim liječnikom",
        backButton: "Natrag na odabir",
        reassurance: "Povjerljivo. Nije potreban račun.",
      },
      phone: {
        status: "online",
        messages: [
          "Cjepivo protiv gripe izaziva gripu",
          "Netočno.",
          "Cjepiva protiv gripe ne mogu izazvati gripu.",
          "Ne vjeruj glasinama.",
          "Pitaj liječnika ili provjereni izvor.",
        ],
        factcheckLine1: "Zavaravajuća poruka",
        factcheckLine2:
          "Cjepivo protiv gripe ne sadrži živi virus koji bi ti mogao prenijeti gripu.",
        source: "Izvor: WHO, Ministarstvo zdravstva",
        button: "Pitaj medijatora",
      },
    },
    footer: {
      disclaimer:
        "Ove ti informacije pomažu razumjeti zdravlje. Ne zamjenjuju savjet liječnika.",
      govPartner: "Državni partner",
      healthcarePartners: "Zdravstveni partneri",
      groups: {
        health: { heading: "Zdravlje", healthInformation: "Informacije o zdravlju", findHelp: "Pronađi liječničku pomoć" },
        platform: { heading: "Platforma", about: "O platformi RediHealth", contact: "Kontakt", accessibility: "Pristupačnost" },
        legal: { heading: "Pravno", privacy: "Privatnost", terms: "Uvjeti" },
      },
      brandDescription:
        "RediHealth pomaže ljudima u ranjivim zajednicama razumjeti svoje zdravlje, znati što učiniti dalje i doći do liječnika.",
      mediatorPartnershipBadge: "U suradnji s mrežom zdravstvenih medijatora",
      whoStandardBadge: "Besplatna javna usluga prema standardima WHO-a",
      col1Heading: "Informacije o zdravlju",
      col1Link1: "Zdravstveni vodiči",
      col1Link2: "Zatraži uputu",
      col1Link3: "Provjeri simptome",
      col1Link4: "Lokalne vijesti i zdravstvena upozorenja",
      col2Heading: "Zdravstvene usluge",
      col2Link1: "Razgovaraj s liječnikom online",
      col2Link2: "Termin kod dežurnog liječnika",
      col2Link3: "Pronađi ljekarnu, kliniku ili bolnicu",
      col2Link4: "Moj račun i recepti",
      col3Heading: "Za medijatore i liječnike",
      col3Link1: "Modul za zdravstvene medijatore",
      col3Link2: "Terenski panel",
      col3Link3: "Portal za liječnike",
      col3Link4: "Kako surađuju liječnik i zdravstveni medijator",
      col4Heading: "O nama i pravila",
      col4Link1: "O RediHealthu",
      col4Link2: "Kontakt i povratne informacije",
      col4Link3: "Izjava o pristupačnosti",
      col4Link4: "Privatnost i zaštita podataka (GDPR)",
      col4Link5: "Uvjeti korištenja",
      emergency112Title: "Hitni slučaj? Nazovi 112 s bilo kojeg telefona.",
      emergency112Text:
        "Poziv hitnoj medicinskoj službi 112 besplatan je, čak i bez bona ili SIM kartice. RediHealth ne zove 112 umjesto tebe.",
      seeAlarmSigns: "Pogledaj znakove uzbune",
      call112Button: "Nazovi 112",
      reportIssueFallback: "Prijavi tehnički problem",
      copyrightLine: "© 2026 RediHealth. Izrađeno za ranjive zajednice.",
      nonEmergencyWarning:
        "Aplikacija pruža informacije i upute. Ne zamjenjuje hitnu medicinsku službu.",
    },
    landing: {
      mythBuster: {
        title: "Točno ili netočno",
        subtitle: "Glasine o zdravlju brzo se šire. Provjeri ih prije nego što doneseš odluku.",
        messageLabel: "Poruka",
      },
      helpOptions: {
        title: "Kako ti možemo pomoći?",
        subtitle: "Odaberi što ti treba i pokazat ćemo ti sljedeći korak.",
        options: [
          {
            title: "Saznaj o svom zdravlju",
            description: "Upoznaj najčešće zdravstvene rizike i načine kako se zaštititi.",
            cta: "Pročitaj vodiče",
            href: "/health-information",
          },
          {
            title: "Provjeri simptom",
            description: "Odgovori na nekoliko kratkih pitanja o tome kako se osjećaš.",
            cta: "Pokreni provjeru",
            href: "/health-check",
          },
          {
            title: "Potraži liječničku pomoć",
            description: "Pronađi ljekarne i klinike ili zatraži pomoć pri naručivanju.",
            cta: "Potraži pomoć",
            href: "/find-help",
          },
        ],
        mediatorBand: { text: "Jesi li zdravstveni medijator?", cta: "Otvori modul za medijatore" },
      },
      healthTopics: {
        title: "Brini o svom zdravlju",
        subtitle: "Mali koraci koje učiniš danas mogu dugoročno smanjiti rizike za tvoje zdravlje.",
        viewAll: "Pogledaj sve zdravstvene vodiče",
      },
      medicalAssistance: {
        title: "Pomažemo ti doći do liječnika",
        subtitle:
          "Ne možeš pronaći obiteljskog liječnika ili dogovoriti termin? Netko iz našeg tima čita tvoj zahtjev i javlja ti se.",
        requestHelp: "Potraži pomoć",
        findServices: "Ljekarne i klinike",
        steps: [
          {
            title: "Reci što ti treba",
            description: "Kratko napiši što te muči. Bez složenih obrazaca.",
          },
          {
            title: "Dobij jasan odgovor",
            description: "Jednostavnim riječima kažemo ti što možeš učiniti.",
          },
          {
            title: "Razgovaraj s liječnikom online",
            description: "Po potrebi te povezujemo s liječnikom.",
          },
        ],
      },
      trustSection: {
        title: "Javnozdravstvena usluga",
        subtitle: "Namijenjena je svakome kome treba. Informacije su provjerene, a tvoji podaci ostaju privatni.",
        builtWith: "Izrađeno zajedno sa zajednicama",
        partnersLabel: "Državni i zdravstveni partneri",
        partnerLogo: "Logotip partnera",
        commitments: [
          { title: "Besplatno za sve", description: "Ne plaćaš ništa. Svatko je može koristiti." },
          { title: "Tvoji podaci ostaju privatni", description: "Čuvamo tvoje podatke i ne objavljujemo ih javno." },
          { title: "Jednostavan jezik", description: "Pišemo kratko i bez teških stručnih riječi." },
        ],
      },
      emergencyNotice: {
        title: "U hitnom medicinskom slučaju",
        description: "Ako misliš da je hitan slučaj, odmah nazovi 112.",
      },
    },
    getHelpPage: {
      heroTitle: "Potraži pomoć",
      heroParagraph:
        "Ne možeš pronaći liječnika ili dogovoriti pregled? Kratko napiši što ti treba. Netko iz našeg tima pročitat će tvoj zahtjev i javiti ti se.",
      form: {
        countyLabel: "Županija",
        selectCounty: "Odaberi županiju",
        fullNameLabel: "Ime i prezime",
        fullNameOptional: "(nije obavezno)",
        fullNamePlaceholder: "Tvoje ime",
        phoneLabel: "Broj telefona",
        phonePlaceholder: "npr. 091 234 5678",
        emailLabel: "Adresa e-pošte",
        emailPlaceholder: "ti@primjer.hr",
        descriptionLabel: "U čemu je problem?",
        descriptionPlaceholder: "Na primjer: koje simptome imaš ili kojem liječniku trebaš ići.",
        descriptionHint: "Napiši samo osobne podatke koji su doista potrebni.",
        privacyNote: "Tvoje podatke koristimo samo kako bismo ti odgovorili. Ostaju povjerljivi.",
        privacyConsent: "Pročitao sam i prihvaćam",
        privacyPolicyLabel: "pravila privatnosti",
        privacyConsentRequired: "Označi kućicu da prihvaćaš pravila privatnosti.",
        errorCounty: "Odaberi svoju županiju.",
        submitting: "Slanje…",
        submit: "Pošalji zahtjev",
        genericError: "Zahtjev nije poslan. Pokušaj ponovno.",
        errorPhone: "Upiši broj telefona na koji te možemo dobiti.",
        errorEmailRequired: "Upiši svoju adresu e-pošte.",
        errorEmailInvalid: "Ova adresa e-pošte nije ispravna.",
        errorDescription: "Napiši malo više o problemu (najmanje 10 znakova).",
        successTitle: "Primili smo tvoj zahtjev",
        successBody: "Netko iz našeg tima pročitat će tvoju poruku i javiti ti se putem podataka koje si ostavio.",
        successNotice: "Ova usluga nije za hitne slučajeve. Ako je hitno, odmah nazovi 112.",
        backHome: "Natrag na početnu stranicu",
        submitAnother: "Pošalji novi zahtjev",
      },
      sidebar: {
        emergencyTitle: "U hitnom medicinskom slučaju",
        emergencyBody: "Ova usluga nije za hitne slučajeve. Ako je hitno, odmah nazovi 112.",
        whatsNextTitle: "Što slijedi",
        steps: [
          "Čitamo tvoju poruku.",
          "Javljamo ti se telefonom ili e-poštom.",
          "Pomažemo ti doći na pravo mjesto.",
        ],
      },
    },
    signInPage: {
      heroTitle: "Prijava u RediHealth",
      heroParagraphWithGoogle: "Upiši adresu e-pošte i poslat ćemo ti kod. Možeš se prijaviti i putem Googlea.",
      heroParagraphNoGoogle: "Upiši adresu e-pošte i poslat ćemo ti kod.",
      terms: "Nastavkom prihvaćaš naše uvjete korištenja i potvrđuješ da si pročitao pravila privatnosti.",
      unauthorizedGoogle: "Ovaj Google račun nema pristup sustavu RediHealth.",
      authUnavailable: "Trenutačno se ne možeš prijaviti. Pokušaj ponovno malo kasnije.",
      form: {
        emailLabel: "Adresa e-pošte",
        emailPlaceholder: "ti@primjer.hr",
        emailHint: "Na ovu ćemo adresu poslati šesteroznamenkasti kod.",
        emailInvalid: "Ova adresa e-pošte nije ispravna.",
        sendingCode: "Slanje koda...",
        emailMeCode: "Pošalji mi kod",
        portalRecoveryTitle: "Pristup portalu za pacijente",
        portalRecoveryHint: "Izgubio si poveznicu za portal za pacijente? Upiši adresu e-pošte i poslat ćemo ti novu.",
        portalRecoveryEmailLabel: "Adresa e-pošte pacijenta",
        portalRecoveryEmailPlaceholder: "ti@primjer.hr",
        portalRecoveryButton: "Pošalji mi novu poveznicu",
        portalRecoverySending: "Slanje poveznice...",
        portalRecoverySent: "Ako ova adresa ima portal za pacijente, uskoro ćeš dobiti novu poveznicu.",
        portalRecoveryError: "Nešto je pošlo po zlu. Pokušaj ponovno malo kasnije.",
        genericSendError: "Nismo uspjeli poslati kod. Pokušaj ponovno.",
        checkEmailTitle: "Provjeri svoju e-poštu",
        codeSentBody: (email: string) => `Poslali smo 6-znamenkasti kod na adresu ${email}. Kod vrijedi 10 minuta.`,
        codeLabel: "6-znamenkasti kod",
        codeInvalid: "Upiši 6-znamenkasti kod iz poruke e-pošte.",
        genericVerifyError: "Nismo uspjeli provjeriti kod. Pokušaj ponovno.",
        signingIn: "Prijava u tijeku...",
        continueLabel: "Nastavi",
        useDifferentEmail: "Koristi drugu adresu e-pošte",
        or: "ili",
        continueWithGoogle: "Nastavi putem Googlea",
      },
    },
    findHelpPage: {
      heroTitle: "Ljekarne i klinike",
      heroParagraph: "Pogledaj zdravstvene ustanove u svojoj blizini na karti. Dodirni mjesto za adresu i broj telefona.",
      listTitle: "Ljekarne, ambulante i bolnice",
      listSubtitle: "Dodirni mjesto kako bi ga vidio na karti.",
      loadingMap: "Učitavanje karte…",
      mapAttribution: "Podaci karte © suradnici OpenStreetMapa.",
      ctaTitle: "Ne znaš kamo ići?",
      ctaBody: "Ako ne znaš kojem se liječniku javiti ili kamo otići, možemo te uputiti. U hitnom slučaju odmah nazovi 112.",
      ctaButton: "Potraži pomoć",
    },
    healthInfoPage: {
      eyebrow: "Informacije o zdravlju",
      heroTitle: "Zdravstveni vodiči",
      heroSubtitle: "Čitaj o čestim bolestima, poput povišenog krvnog tlaka i šećerne bolesti, kako se zaštititi i kada otići obiteljskom liječniku.",
      browseTitle: "Odaberi temu",
      browseSubtitle: "Svaki vodič pokazuje što svakodnevno možeš učiniti za svoje zdravlje.",
      readMore: "Pročitaj više",
      usingInfoTitle: "Kako koristiti vodiče",
      usingInfoSubtitle: "Vodiči ti pomažu razumjeti i lakše odlučiti. Ne zamjenjuju savjet liječnika.",
      usingInfoSteps: [
        { title: "Pročitaj najvažnije", description: "Odaberi temu koja te zanima i pročitaj uvodni dio." },
        { title: "Prepoznaj svoje rizike", description: "Pogledaj navike koje utječu na krvni tlak, šećer u krvi i zdravlje." },
        { title: "Uvedi jednu malu promjenu", description: "Kreni s jednom malom navikom ili provjeri trebaš li otići liječniku." },
      ],
      ctaTitle: "Pomažemo ti doći do liječnika",
      ctaBody: "Imaš pitanja nakon čitanja? Naš ti tim može reći kamo se obratiti.",
      ctaDisclaimer: "Ove informacije nisu liječnička dijagnoza.",
      menuTitle: "Odakle krenuti",
      menuSubtitle: "Pročitaj vodič ili provjeri simptom.",
      tabs: {
        menu: "Izbornik",
        topics: "Vodiči",
        triage: "Provjeri simptom",
      },
      triageGateway: {
        badge: "Nekoliko pitanja",
        title: "Provjeri simptom",
        description: "Odgovori na nekoliko pitanja o tome kako se osjećaš, imaš li vrućicu ili bol. Saznaj koliko je hitno i što učiniti.",
        cta: "Pokreni provjeru",
      },
      topicsGateway: {
        badge: "8 provjerenih vodiča",
        title: "Pročitaj vodič",
        description: "O srcu, povišenom krvnom tlaku, šećernoj bolesti, prehrani, kretanju, cjepivima i zdravlju obitelji.",
        cta: "Pogledaj vodiče",
      },
      quickTopicsTitle: "Često traženo",
      backToMenu: "Natrag na izbornik",
      doctorValidatedBadge: "Provjerio liječnik specijalist",
      romanesGlossaryButton: "Medicinski pojmovi na romskom",
      topicGrid: {
        eyebrow: "Provjerili liječnici",
        searchPlaceholder: "Pretraži vodič ili simptom",
        searchAriaLabel: "Pretraži vodič ili simptom",
        clearSearchAriaLabel: "Obriši pretragu",
        filterListAriaLabel: "Filtriraj vodiče",
        countSingular: "1 vodič",
        countPluralTemplate: "{count} vodiča",
        countSearchSuffix: " za tvoju pretragu",
        doctorValidatedBadge: "Provjerio liječnik",
        featuredRecommendationEyebrow: "Savjet liječnika",
        featuredRecommendationBody: "Redovito mjerenje krvnog tlaka i manji unos soli sprječavaju više od 80% teških komplikacija poput srčanog i moždanog udara.",
        cardActionLabel: "Čitaj ili slušaj",
        emptyTitle: "Nema pronađenih vodiča",
        emptyDescription: "Pokušaj drugu riječ ili pogledaj sve vodiče.",
        emptyResetButton: "Pogledaj sve vodiče",
        categories: {
          toate: "Sve",
          inima: "Srce",
          diabet: "Šećerna bolest",
          nutritie: "Prehrana",
          miscare: "Kretanje",
          minte: "Um i san",
          fumat: "Pušenje",
          screening: "Preventivni pregledi",
          femei: "Zdravlje žena",
        },
      },
    },
    notFoundPage: {
      title: "Ne možemo pronaći tu stranicu",
      subtitle: "Možda je premještena ili obrisana. Vrati se na početnu stranicu ili pročitaj zdravstvene vodiče.",
      backHome: "Natrag na početnu",
      exploreHealth: "Pročitaj vodiče",
    },
    emergency: {
      bannerAriaLabel: "Hitno upozorenje 112",
      bannerText: "U hitnom medicinskom slučaju nazovi 112. Aplikacija ne može nazvati umjesto tebe.",
      dismissBannerAria: "Sakrij poruku o broju 112",
      seeAlarmSigns: "Kada nazvati 112",
      call112: "Nazovi 112",
      signsModalTitle: "Kada nazvati 112",
      signsModalSubtitle: "Odmah nazovi hitnu medicinsku službu 112 ako primijetiš bilo koji od ovih znakova.",
      closeSignsModalAria: "Zatvori prozor sa znakovima uzbune",
      signPrefix: "Znak",
      signs: [
        {
          id: "chest-pain",
          title: "Jaka bol u prsima",
          description: "Pritisak, stezanje ili pečenje koje se može širiti u lijevu ruku, vrat ili čeljust.",
          actionHint: "Može biti srčani udar",
        },
        {
          id: "breathing-difficulty",
          title: "Nedostatak zraka (zaduha)",
          description: "Naglo gušenje, piskanje u prsima ili osoba ne može izgovoriti cijelu rečenicu.",
          actionHint: "Može biti nakupljanje tekućine u plućima ili težak napadaj astme",
        },
        {
          id: "facial-weakness",
          title: "Iskrivljeno lice ili nagla slabost",
          description: "Jedan kut usana pada, osoba ne može podići obje ruke ili govori nerazgovijetno i zbunjeno.",
          actionHint: "Znak moždanog udara",
        },
        {
          id: "unconsciousness",
          title: "Nesvjestica ili osoba ne reagira",
          description: "Osoba ne odgovara kad je zoveš ili dodirneš, ili se naglo srušila i ne miče se.",
          actionHint: "Odmah provjeri diše li",
        },
        {
          id: "heavy-bleeding",
          title: "Jako krvarenje",
          description: "Krv šiklja ili se ne zaustavlja nakon 5 minuta izravnog pritiska na ranu.",
          actionHint: "Čvrsto pritisni čistom tkaninom",
        },
        {
          id: "convulsions",
          title: "Grčevi cijelog tijela (konvulzije)",
          description: "Tijelo se snažno trese, oči se okreću prema gore, osoba gubi kontrolu nad mišićima.",
          actionHint: "Zaštiti glavu od udaraca. Ne stavljaj ništa u usta.",
        },
      ],
      dispatcherGuideTitle: "Što reći dispečeru na 112",
      dispatcherGuideSubtitle: "Dispečer će ti postaviti pitanja. Budi spreman reći:",
      dispatcherSteps: [
        {
          title: "Gdje se točno nalaziš",
          description: "Reci grad ili selo, ulicu i jasan orijentir (pokraj crkve, škole, starog mosta ili trgovine u centru).",
        },
        {
          title: "Kome treba pomoć",
          description: "Dijete, odrasla ili starija osoba. Reci diše li osoba, je li pri svijesti i odgovara li ti.",
        },
        {
          title: "Što se dogodilo",
          description: "Kratko opiši: bol u prsima, pad s visine, nagla nesvjestica ili gušenje.",
        },
      ],
      dispatcherImportantNote: "Ostani na liniji dok ti dispečer ne kaže da možeš poklopiti. Vozilo hitne pomoći kreće dok još razgovarate.",
      freeServiceNotice: "Besplatno s bilo kojeg telefona, čak i bez bona",
      understandButton: "Razumijem",
      dialerGateTitle: "Nazovi 112",
      closeWindowAria: "Zatvori prozor",
      dialerNotice: "Upravo ćeš nazvati 112. Otvorit će se brojčanik tvog telefona. Poziv ne kreće sam. Osobno pritisni zelenu tipku za poziv.",
      dialerFreeNote: "Poziv je besplatan u svakoj mobilnoj mreži.",
      openDialerButton: "Biraj 112",
      cancelButton: "Odustani",
      desktopDialTitle: "Nazovi 112 s telefona",
      desktopDialSubtitle: "Utipkaj broj na mobitelu ili fiksnom telefonu.",
      desktopFreeNote: "Poziv je besplatan u svakoj mreži, čak i bez bona ili SIM kartice.",
      desktopRuralNote: "Ako živiš u udaljenom selu i hitna pomoć može kasniti, zamoli susjeda s automobilom da te odveze na najbliži hitni bolnički prijem.",
    },
    newsRibbon: {
      ariaLabel: "Lokalne vijesti i zdravstvena upozorenja",
      changeCountyTitle: "Promijeni županiju",
      changeLabel: "(promijeni)",
      noActiveAlerts: "Trenutačno nema upozorenja",
      viewAllNews: "Pogledaj sve vijesti",
      modalTitle: "Odaberi svoju županiju",
      modalSubtitle: "Pogledaj zdravstvena upozorenja i mobilne ambulante u svom kraju.",
      searchPlaceholder: "Pretraži županiju (npr. Zagreb, Split, Osijek, Međimurska)...",
      detectingLocation: "Tražimo tvoju lokaciju...",
      useAutoLocation: "Koristi moju lokaciju",
      currentLabel: "Sada:",
      allCountiesNational: "Sve županije (nacionalne vijesti)",
      noCountyFound: "Nije pronađena županija za",
      closeModal: "Zatvori",
      geoUnsupported: "Tvoj preglednik ne može odrediti lokaciju.",
      geoSuccess: "Pronašli smo tvoju lokaciju.",
      geoError: "Nismo uspjeli odrediti lokaciju. Odaberi županiju s popisa.",
    },
    quiz: {
      sectionTitle: "Točno ili netočno",
      sectionSubtitle: "Mnoge priče o zdravlju prenose se usmeno. Ovdje saznaj što je točno, a što nije.",
      filterAriaLabel: "Filtriraj mitove po kategoriji",
      audioNarratorLabel: "Poslušaj pitanje i objašnjenje",
      trueButton: "Točno",
      falseButton: "Netočno",
      yourSelectedAnswer: "Tvoj odgovor:",
      correctAnswerTag: "Odgovorio si točno",
      verifiedClarification: "Provjereno medicinsko objašnjenje",
      stopAudioAria: "Zaustavi čitanje objašnjenja",
      listenAudioAria: "Poslušaj objašnjenje",
      stopAudioLabel: "Zaustavi čitanje",
      listenAudioLabel: "Poslušaj objašnjenje",
      sourcePrefix: "Izvor:",
      askDoctorHandover: "Imaš nedoumica? Pitaj liječnika online o ovoj temi",
      restartFirstMyth: "Kreni ispočetka od prvog mita",
      nextMyth: "Sljedeći mit",
      mythProgressPrefix: "Mit",
      mythProgressOf: "od",
      prevMythAria: "Prethodni mit",
      nextMythAria: "Sljedeći mit",
    },
    mediatorBand: {
      question: "Jesi li zdravstveni medijator u zajednici?",
      description: "Alati za terenske posjete, vođenu trijažu i evidenciju obitelji kojima pomažeš.",
      cta: "Otvori modul za medijatore",
    },
    newsPage: {
      heroTitle: "Zdravstvene vijesti i lokalna upozorenja",
      heroSubtitle: "Zdravstvena upozorenja, mobilne ambulante, cjepiva i akcije preventivnih pregleda u tvom kraju.",
      countyLabel: "Županija:",
      allCounties: "Sve županije",
      categories: {
        all: "Sve",
        epidemics: "Epidemije i upozorenja",
        caravan: "Mobilna ambulanta",
        practicalAdvice: "Praktični savjeti",
        patientRights: "Prava pacijenata i HZZO",
        childHealth: "Zdravlje djece",
        vaccinationCampaigns: "Akcije cijepljenja",
        seasonalAdvice: "Sezonski savjeti",
      },
      emptyTitle: "Nema vijesti za odabranu županiju",
      emptySubtitle: "Odaberi drugu županiju ili pogledaj vijesti za cijelu državu.",
      resetFilter: "Pogledaj sve vijesti",
      backToNews: "Natrag na vijesti",
      listenNarration: "Poslušaj jednostavan sažetak",
      playAudio: "Poslušaj",
      pauseAudio: "Pauza",
      handoverTitle: "Trebaš liječničku pomoć?",
      handoverSubtitle: "Razgovaraj s liječnikom online ili zatraži pomoć zdravstvenog medijatora.",
      handoverTelemed: "Razgovaraj s liječnikom",
      handoverMediator: "Pronađi zdravstvenog medijatora",
      changeCounty: "Promijeni županiju",
      saveSelection: "Spremi",
    },
    medicOnlinePage: {
      heroTitle: "Razgovaraj s liječnikom od kuće",
      heroSubtitle: "Bez čekanja u redovima i dugog putovanja. Liječnik te sasluša telefonom i kaže ti što učiniti.",
      cardOnCallTitle: "Razgovaraj odmah s dežurnim liječnikom",
      cardOnCallSubtitle: "Obično se čeka manje od 10 minuta",
      cardOnCallAction: "Uđi u čekaonicu",
      cardBookingTitle: "Dogovori poziv s liječnikom",
      cardBookingSubtitle: "Odaberi dan i vrijeme",
      cardBookingAction: "Dogovori termin",
      cardPortalTitle: "Moj zdravstveni karton",
      cardPortalSubtitle: "Pogledaj recepte, uputnice, nalaze i savjete liječnika",
      cardPortalAction: "Otvori karton",
      bookingTitle: "Dogovori poziv s liječnikom",
      bookingSubtitle: "Odaberi dan i vrijeme, za sebe ili člana obitelji. Besplatno je i razgovaraš putem telefona.",
      backToDoctorOnline: "Natrag na liječnika online",
      backToTelemed: "Natrag",
      stepDate: "Odaberi datum i vrijeme",
      stepContact: "Podaci o pacijentu",
      familyForWhom: "Za koga je termin?",
      familySelf: "Za mene",
      familyOther: "Za člana obitelji",
      queueTitle: "Čekaonica",
      queueEstimated: "Preostalo vrijeme čekanja oko 7 minuta",
      queueWarning: "Nemoj zatvarati ovu stranicu. Spojit ćemo te čim liječnik bude spreman.",
      bandwidthLow: "Internetska veza je spora",
      bandwidthAudioOnly: "Prebacujemo samo na zvuk kako se poziv ne bi prekinuo",
    },
    mediatorsPage: {
      heroTitle: "Zdravstveni medijatori",
      heroSubtitle: "Zdravstveni medijator pomaže ti oko osobnih dokumenata, HZZO osiguranja, upisa kod obiteljskog liječnika, uputnica i bolničkih termina.",
      requestHelpButton: "Zatraži medijatora",
      modalTitle: "Zatraži zdravstvenog medijatora u svom kraju",
      nameLabel: "Ime i prezime",
      phoneLabel: "Telefon",
      countyLabel: "Županija",
      localityLabel: "Grad ili naselje",
      helpTypeLabel: "Oko čega ti treba pomoć?",
      submitButton: "Pošalji zahtjev",
    },
    countyMap: {
      title: "Karta županija",
      subtitle: "Dodirni županiju kako bi vidio upozorenja i mobilne ambulante u tom području.",
      allCounties: "Sve županije",
      mapAriaLabel: "Karta županija",
      selectedCountyPrefix: "Odabrana županija:",
      activeAlertsTooltip: "● Aktivna zdravstvena upozorenja ili mobilne ambulante",
      generalInfoTooltip: "Samo opće informacije",
      recentNewsLabel: "Županije s novim obavijestima:",
      recentRegionsLabel: "Regije s novim obavijestima:",
      countyAriaPrefix: "Županija",
      hasAlertsSuffix: "ima aktivna upozorenja ili mobilne ambulante",
      romania: "Rumunjska",
      italy: "Italija",
      pickLabel: "Ili odaberi s popisa",
      italyMapAriaLabel: "Karta regija Italije",
      selectedRegionPrefix: "Odabrana regija:",
      allItaly: "Cijela Italija",
      italyTitle: "Karta regija",
      italySubtitle: "Dodirni regiju ili je odaberi s popisa za pregled vijesti.",
    },
    accountAuthPage: {
      title: "Otvori svoj zdravstveni karton",
      subtitle: "Upiši broj telefona s kojim si dogovorio termin. Poslat ćemo ti kod SMS porukom.",
      phoneLabel: "Broj telefona",
      phonePlaceholder: "091 000 0000",
      sendCode: "Pošalji kod",
      codeLabel: "4-znamenkasti kod iz SMS poruke",
      verifyCode: "Potvrdi kod",
      invalidCode: "Kod je pogrešan ili je istekao.",
      backHome: "Natrag na početnu stranicu",
    },
  },
  rom: {
    nav: {
      healthInformation: "Sastipnaske informaciye",
      healthCheck: "Dikh e simptome",
      findHelp: "Rod zhutimos",
      about: "Vash amende",
      reportIssue: "Phen varesavi problema",
    },
    account: {
      signIn: "De andre",
      panel: "Panelo",
    },
    header: {
      getHelp: "Rod zhutimos",
      demo: "Demo",
      navAfla: "Sikljov",
      navAflaSub: "Sastipnaske sikavimata thaj xoxamne vorbi ashkarde",
      navCere: "Mang sikavipe",
      navCereSub: "Asistento thaj dikhiben pe simptome",
      navMedic: "Doktori online",
      navMedicSub: "Programiripnata thaj doktori pe straja",
      navStiri: "Nevimata",
      navStiriSub: "Thanuno avizo thaj sastipnaske karavane",
      forMediators: "Vash e sastipnaske mediatorya",
      myAccount: "Miro konto",
      medicalPanel: "Sastipnasko panelo",
      startHere: "Shird kathe",
      closeMenu: "Phandav o meniu",
      openMenu: "Putar o meniu",
      emergencyTitle: "Sigardiari 112?",
      emergencyCallPrompt: "Akhar rigate ko 112",
      call112: "Akhar ko 112",
      mediatorProfessionals: "Vash e bucharya",
      mediatorDrawerDescription: "San sastipnasko mediatori? Kathe arakhes o terenesko modulo thaj o familiyango lekhavipe.",
      enterMediatorModule: "Putar o mediatoresko modulo",
    },
    hero: {
      trustBadge: "Putardo servisi bi lovesko, kerdo khetane e komunitetenca",
      titleLine1: "Lokhe sastipnaske informaciye",
      titleLine2: "thaj zhutimos te areses",
      titleLine3: "ko lacho doktori.",
      paragraph:
        "REDI Health zhutil tut te xatyares cho sastipen, te zhanes kay te zhas thaj te vakeres ekhe doktoreya online. Si bi lovesko, vash e romane komunitetya thaj sako manusheske kay trubul leske.",
      cta: "Phen amenge so daravel tut",
      assistantCta: "Gin e sikavimata",
      assistantHref: "/health-information",
      assistantAlwaysVisible: true,
      mediatorPill: "San sastipnasko mediatori? Putar cho panelo",
      mediatorHref: "/panel",
      telemedicinePill: "Doktori online",
      emergencyNoticeVerbatim:
        "Akhar tu ko 112. I aplikaciya na akharel pe cho than.",
      triage: {
        badge: "Zhutimos ande 3 pasha",
        question: "So daravel tut adyes?",
        subQuestion: "Alosar so maladyol tuke:",
        options: [
          {
            id: "learn",
            icon: "BookIcon",
            title: "Kamav te sikljovav vash o sastipen",
            desc: "Khurdeline sikavimata thaj xoxamne vorbi vash o sastipen, ashkarde lokhes.",
            actionLabel: "Gin e sikavimata",
            actionHref: "/health-information",
          },
          {
            id: "check",
            icon: "ClipboardCheckIcon",
            title: "Kamav te dikhav mire simptome",
            desc: "Sikav po trupo kay si tut dukh, de palpale pe trin phuchimata thaj dikh so te keres may dur.",
            actionLabel: "Shird o dikhiben",
            actionHref: "/health-check",
          },
          {
            id: "symptoms",
            icon: "ActivityIcon",
            title: "Si man sastipnaski problema",
            desc: "Dikh e daravne semnya thaj vaker online e doktoreya.",
            actionLabel: "Vaker e doktoreya",
            actionHref: "/get-help?mode=doctor",
          },
          {
            id: "prescription",
            icon: "PrescriptionIcon",
            title: "Kamav te xatyarav miri receta",
            desc: "Sikljov sar thaj kana te les i drab thaj so trubul te na keres.",
            actionLabel: "Ashkar miri receta",
            actionHref: "/health-assistant?tab=prescription",
          },
          {
            id: "navigation",
            icon: "HandHelpingIcon",
            title: "Na zhanav kay te zhav (familiyako doktori, CNAS, HZZO)",
            desc: "Zhutimos te lekhaves tut ko familiyako doktori, vash i sigardiari ki bolnitsa thaj e lila.",
            actionLabel: "Phuch ekhe sastipnaske mediatore",
            actionHref: "/get-help?mode=mediator",
          },
        ],
        doctorPrompt: "Kames te vakeres ekhe doktoreya online?",
        doctorOnDutyCta: "Vaker e doktoreya pe straja",
        backButton: "Palpale ko alosaripe",
        reassurance: "Garavdo. Na trubul tuke konto.",
      },
      phone: {
        status: "online",
        messages: [
          "O chikat vash o gripo anel o gripo",
          "Xoxamno.",
          "O chikat vash o gripo nashti te del tut gripo.",
          "Ma pakya xoxamne vorbenge.",
          "Phuch ekhe doktore vay ekh chacho than.",
        ],
        factcheckLine1: "Xoxavno mesazho",
        factcheckLine2:
          "Ando chikat vash o gripo nane zhuvindo viruso kay shay te del tut gripo.",
        source: "Katar avel: WHO, sastipnasko ministeriumo",
        button: "Phuch ekhe mediatore",
      },
    },
    footer: {
      disclaimer:
        "E informaciye kathe zhutin tut te xatyares. Na achhen po than e doktoreske godyako.",
      govPartner: "Themesko partneri",
      healthcarePartners: "Sastipnaske partnerya",
      groups: {
        health: { heading: "Sastipen", healthInformation: "Sastipnaske informaciye", findHelp: "Rod zhutimos" },
        platform: { heading: "Platforma", about: "Vash RediHealth", contact: "Kontakto", accessibility: "Shayipe te labares" },
        legal: { heading: "Zakono", privacy: "Garavipe", terms: "Pravila" },
      },
      brandDescription:
        "RediHealth zhutil e manushen ande kovle komunitetya te xatyaren piro sastipen, te zhanen so te keren may dur thaj te aresen ko doktori.",
      mediatorPartnershipBadge: "Khetanipe e sastipnaske mediatorenge mrezhasa",
      whoStandardBadge: "Putardo servisi bi lovesko palo WHO standardurya",
      col1Heading: "Sastipnaske informaciye",
      col1Link1: "Sastipnaske sikavimata",
      col1Link2: "Mang sikavipe",
      col1Link3: "Dikh e simptome",
      col1Link4: "Thanune nevimata thaj sastipnaske avizurya",
      col2Heading: "Sastipnaske servisurya",
      col2Link1: "Vaker ekhe doktoreya online",
      col2Link2: "Programiripe ko doktori pe straja",
      col2Link3: "Farmaciye thaj klinike",
      col2Link4: "Miro konto thaj recete",
      col3Heading: "Vash e mediatorya thaj e doktorya",
      col3Link1: "Modulo vash e sastipnaske mediatorya",
      col3Link2: "Terenesko panelo",
      col3Link3: "Portalo vash e doktorya",
      col3Link4: "Sar keren buchi khetane o doktori thaj o mediatori",
      col4Heading: "Vash amende thaj pravila",
      col4Link1: "Vash RediHealth",
      col4Link2: "Kontakto thaj phendimata",
      col4Link3: "Phenipe vash o shayipe te labares",
      col4Link4: "Garavipe thaj arakhipe e podatkengo (GDPR)",
      col4Link5: "Labaripnaske pravila",
      emergency112Title: "Sigardiari? Akhar ko 112 katar sarsavo telefono.",
      emergency112Text:
        "O akharipe ko 112 si bi lovesko, vi bi kreditesko vay bi SIM kartelako. RediHealth na akharel ko 112 pe cho than.",
      seeAlarmSigns: "Dikh e daravne semnya",
      call112Button: "Akhar ko 112",
      reportIssueFallback: "Phen ekh tehnikani problema",
      copyrightLine: "© 2026 RediHealth. Kerdo vash e kovle komunitetya.",
      nonEmergencyWarning:
        "I aplikaciya del tut informaciye thaj sikavipe. Na paravel i sigardiari 112.",
    },
    landing: {
      mythBuster: {
        title: "Chacho vay xoxamno",
        subtitle: "E xoxamne vorbi vash o sastipen phiren sigo. Dikh len anglal te alosares vareso.",
        messageLabel: "Mesazho",
      },
      helpOptions: {
        title: "Sar shay te zhutinas tut?",
        subtitle: "Alosar so trubul tuke thaj ka sikavas tuke so avel may dur.",
        options: [
          {
            title: "Sikljov vash cho sastipen",
            description: "Sikljov vash e rizikurya pe o ilo, gudlo rat thaj sar te arakhes tut.",
            cta: "Gin e sikavimata",
            href: "/health-information",
          },
          {
            title: "Dikh e simptome",
            description: "De palpale pe nekobor khurdeline phuchimata sar xatyares tut.",
            cta: "Shird o dikhiben",
            href: "/health-check",
          },
          {
            title: "Rod zhutimos",
            description: "Arakh farmaciye thaj klinike vay mang zhutimos vash ekh programiripe.",
            cta: "Rod zhutimos",
            href: "/find-help",
          },
        ],
        mediatorBand: { text: "San sastipnasko mediatori?", cta: "Putar o mediatoresko modulo" },
      },
      healthTopics: {
        title: "Arakh cho sastipen",
        subtitle: "E tikne pasha kay keres adyes shay te tiknyaren e sastipnaske rizikurya.",
        viewAll: "Dikh savore sastipnaske sikavimata",
      },
      medicalAssistance: {
        title: "Zhutinas tut te areses ko doktori",
        subtitle:
          "Nashti arakhes familiyako doktori vay programiripe? Varekon katar amaro timo ginel cho mangipe thaj akharel tut.",
        requestHelp: "Rod zhutimos",
        findServices: "Farmaciye thaj klinike",
        steps: [
          {
            title: "Phen so trubul tuke",
            description: "Lekhav khurdeles so dukhal tut vay so trubul tuke. Bi phare formularengo.",
          },
          {
            title: "Le ashkardo palpale",
            description: "Phenas tuke lokhes so shay te keres.",
          },
          {
            title: "Vaker ekhe doktoreya online",
            description: "Te trubul, phandas tut ekhe doktoreya.",
          },
        ],
      },
      trustSection: {
        title: "Putardo sastipnasko servisi",
        subtitle: "Si sako manusheske kay trubul leske. E informaciye si dikhle thaj che podatke achhen garavde.",
        builtWith: "Kerdo khetane e komunitetenca",
        partnersLabel: "Themeske thaj sastipnaske partnerya",
        partnerLogo: "Partneresko semno",
        commitments: [
          { title: "Bi lovesko savorenge", description: "Na pokines khanch. Sako manush shay te labarel les." },
          { title: "Che podatke achhen garavde", description: "Arakhas che informaciye thaj na chivas len avri." },
          { title: "Lokhi chhib", description: "Lekhavas khurdeles thaj bi phare alavengo." },
        ],
      },
      emergencyNotice: {
        title: "Ki sastipnaski sigardiari",
        description: "Te gindisares kay si sigardiari, akhar sigo ko 112.",
      },
    },
    getHelpPage: {
      heroTitle: "Rod zhutimos",
      heroParagraph:
        "Nashti arakhes doktori vay programiripe? Lekhav khurdeles so trubul tuke. Varekon katar amaro timo ka ginel cho mangipe thaj ka akharel tut.",
      form: {
        countyLabel: "Rig (zhudeco)",
        selectCounty: "Alosar chi rig",
        fullNameLabel: "Sasto anav",
        fullNameOptional: "(te kames)",
        fullNamePlaceholder: "Cho anav",
        phoneLabel: "Telefonesko gin",
        phonePlaceholder: "misal 0712 345 678",
        emailLabel: "Email adresa",
        emailPlaceholder: "tu@misal.com",
        descriptionLabel: "Savi si i problema?",
        descriptionPlaceholder: "Misalake: save simptome si tut, tatipen vay dukh, vay ko savo doktori trubul te zhas.",
        descriptionHint: "Lekhav numay e podatke kay trubun.",
        privacyNote: "Labaras che podatke numay te das tut palpale. Achhen garavde.",
        privacyConsent: "Gindem thaj kamav e",
        privacyPolicyLabel: "garavipnaske pravila",
        privacyConsentRequired: "Chiv semno ando kvadrato te kames e garavipnaske pravila.",
        errorCounty: "Alosar chi rig.",
        submitting: "Bichhalel pes…",
        submit: "Bichhal o mangipe",
        genericError: "O mangipe na bichhaldilo. Zumav palem.",
        errorPhone: "Lekhav ekh telefonesko gin kay shay te arakhas tut.",
        errorEmailRequired: "Lekhav chi email adresa.",
        errorEmailInvalid: "Kadi email adresa nane chachi.",
        errorDescription: "Lekhav zalag may but vash i problema (nayhari 10 semnya).",
        successTitle: "Liyam cho mangipe",
        successBody: "Varekon katar amaro timo ka ginel cho mesazho thaj ka akharel tut pe podatke kay mukhlyan.",
        successNotice: "Kadava servisi nane vash i sigardiari. Te si sigardiari, akhar sigo ko 112.",
        backHome: "Palpale ki angluni rig",
        submitAnother: "Bichhal aver mangipe",
      },
      sidebar: {
        emergencyTitle: "Ki sastipnaski sigardiari",
        emergencyBody: "Kadava servisi nane vash i sigardiari. Te si sigardiari, akhar sigo ko 112.",
        whatsNextTitle: "So avel akana",
        steps: [
          "Ginas cho mesazho.",
          "Akharas tut pe telefono vay emailo.",
          "Zhutinas tut te areses ko chacho than.",
        ],
      },
    },
    signInPage: {
      heroTitle: "De andre ko RediHealth",
      heroParagraphWithGoogle: "Lekhav cho emailo thaj ka bichhalas tuke ekh kodo. Shay te des andre vi e Google kontosa.",
      heroParagraphNoGoogle: "Lekhav cho emailo thaj ka bichhalas tuke ekh kodo.",
      terms: "Te zhas may dur, kames amare labaripnaske pravila thaj phenes kay gindyan e garavipnaske pravila.",
      unauthorizedGoogle: "Kadava Google konto nane les shayipe ko RediHealth.",
      authUnavailable: "Nashti te des andre akana. Zumav palem palo zalag vrama.",
      form: {
        emailLabel: "Email adresa",
        emailPlaceholder: "tu@misal.com",
        emailHint: "Ka bichhalas kodo katar 6 gina pe kadi adresa.",
        emailInvalid: "Kadi email adresa nane chachi.",
        sendingCode: "Bichhalel pes o kodo...",
        emailMeCode: "Bichhal mange kodo",
        portalRecoveryTitle: "Dinipe ko paciyentesko portalo",
        portalRecoveryHint: "Xasardyan o linko vash o paciyentesko portalo? Lekhav cho emailo thaj ka bichhalas nevo.",
        portalRecoveryEmailLabel: "Paciyenteski email adresa",
        portalRecoveryEmailPlaceholder: "tu@misal.com",
        portalRecoveryButton: "Bichhal mange nevo linko",
        portalRecoverySending: "Bichhalel pes o linko...",
        portalRecoverySent: "Te si kadale emailes paciyentesko portalo, sigo ka les nevo linko.",
        portalRecoveryError: "Vareso na gelo mishto. Zumav palem palo zalag vrama.",
        genericSendError: "Nashti bichhaldam o kodo. Zumav palem.",
        checkEmailTitle: "Dikh cho emailo",
        codeSentBody: (email: string) => `Bichhaldam kodo katar 6 gina pe ${email}. O kodo nakhavel piro vrama ande 10 minute.`,
        codeLabel: "Kodo katar 6 gina",
        codeInvalid: "Lekhav o kodo katar 6 gina anda cho emailo.",
        genericVerifyError: "Nashti dikhlam kova kodo. Zumav palem.",
        signingIn: "Des andre...",
        continueLabel: "Zha may dur",
        useDifferentEmail: "Labar aver email adresa",
        or: "vay",
        continueWithGoogle: "Zha may dur e Googlesa",
      },
    },
    findHelpPage: {
      heroTitle: "Farmaciye thaj klinike",
      heroParagraph: "Dikh pi mapa e farmaciye, familiyake doktorya thaj bolnitse pashal tute. Azba ekh than te dikhes i adresa thaj o telefono.",
      listTitle: "Farmaciye, klinike thaj bolnitse",
      listSubtitle: "Azba ekh than te dikhes les pi mapa.",
      loadingMap: "Phardel pes i mapa…",
      mapAttribution: "Mapake podatke © OpenStreetMap zhutitorya.",
      ctaTitle: "Na zhanes kay te zhas?",
      ctaBody: "Te na zhanes ko savo doktori te zhas, ame shay te sikavas tuke o drom. Ki sigardiari, akhar sigo ko 112.",
      ctaButton: "Rod zhutimos",
    },
    healthInfoPage: {
      eyebrow: "Sastipnaske informaciye",
      heroTitle: "Sastipnaske sikavimata",
      heroSubtitle: "Gin vash e nasvalimata sar kana o rat phurdel zurales thaj o gudlo rat, sar te arakhes tut thaj kana te zhas ko doktori.",
      browseTitle: "Alosar ekh tema",
      browseSubtitle: "Sako sikavipe sikavel so shay te keres sako dives vash cho sastipen.",
      readMore: "Gin may but",
      usingInfoTitle: "Sar te labares e sikavimata",
      usingInfoSubtitle: "E sikavimata zhutin tut te xatyares thaj te alosares may mishto. Na paraven e doktoreski godi.",
      usingInfoSteps: [
        { title: "Gin e sherutne buchya", description: "Alosar ekh tema kay trubul tuke thaj gin o angluno kotor." },
        { title: "Sikljov che rizikurya", description: "Dikh save tabiyetya dukhaven o ilo thaj o rat thaj so shay te paruves." },
        { title: "Paruv ekh tikni buchi", description: "Shird ekhe tikne paruvipnasa vay dikh te trubul te zhas ko familiyako doktori." },
      ],
      ctaTitle: "Zhutinas tut te areses ko doktori",
      ctaBody: "Si tut phuchimata palo ginipe? Amaro timo shay te phenel tuke kay te zhas.",
      ctaDisclaimer: "Kadala informaciye nane doktoreski diagnoza.",
      menuTitle: "Katar te shirdes",
      menuSubtitle: "Gin ekh sikavipe vay dikh e simptome.",
      tabs: {
        menu: "Meniu",
        topics: "Sikavimata",
        triage: "Dikh e simptome",
      },
      triageGateway: {
        badge: "Nekobor phuchimata",
        title: "Dikh e simptome",
        description: "De palpale pe nekobor phuchimata vash i dukh, tatipen vay kana o shero phirel. Sikljov kobor sigo trubul zhutimos.",
        cta: "Shird o dikhiben",
      },
      topicsGateway: {
        badge: "8 dikhle sikavimata",
        title: "Gin ekh sikavipe",
        description: "Vash o ilo, gudlo rat, xabe, phiripe, rengro dikhiben, o chikat thaj i khabni romni.",
        cta: "Dikh e sikavimata",
      },
      quickTopicsTitle: "Butivar rodino",
      backToMenu: "Palpale ko meniu",
      doctorValidatedBadge: "Dikhlo katar doktori speciyalisto",
      romanesGlossaryButton: "Sastipnaske alava pe romani chib",
      topicGrid: {
        eyebrow: "Dikhle katar doktorya",
        searchPlaceholder: "Rod ekh sikavipe vay simptom",
        searchAriaLabel: "Rod ekh sikavipe vay simptom",
        clearSearchAriaLabel: "Chos o rodipe",
        filterListAriaLabel: "Alosar e sikavimata",
        countSingular: "1 sikavipe",
        countPluralTemplate: "{count} sikavimata",
        countSearchSuffix: " vash cho rodipe",
        doctorValidatedBadge: "Dikhlo katar doktori",
        featuredRecommendationEyebrow: "Doktoreski godi",
        featuredRecommendationBody: "Te dikhes vrama pe vrama sar phurdel o rat thaj te xas may zalag lon arakhen o ilo katar may but sar 80% phare nasvalimata.",
        cardActionLabel: "Gin vay ashun",
        emptyTitle: "Na arakhlam nijekh sikavipe",
        emptyDescription: "Zumav aver alav vay dikh savore sikavimata.",
        emptyResetButton: "Dikh savore sikavimata",
        categories: {
          toate: "Savore",
          inima: "O ilo",
          diabet: "Gudlo rat",
          nutritie: "Xabe",
          miscare: "Phiripe",
          minte: "Godi thaj suto",
          fumat: "Thuvyarel",
          screening: "Preventivno dikhiben",
          femei: "Romnyango sastipen",
        },
      },
    },
    notFoundPage: {
      title: "Nashti arakhas kodi rig",
      subtitle: "Shay sas ingardi po aver than vay chosli. Zha palpale ki angluni rig vay gin e sastipnaske sikavimata.",
      backHome: "Palpale ki angluni rig",
      exploreHealth: "Gin e sikavimata",
    },
    emergency: {
      bannerAriaLabel: "Avizo vash sigardiari 112",
      bannerText: "Ki sastipnaski sigardiari, akhar ko 112. I aplikaciya nashti te akharel pe cho than.",
      dismissBannerAria: "Garav o mesazho vash 112",
      seeAlarmSigns: "Kana te akhares ko 112",
      call112: "Akhar ko 112",
      signsModalTitle: "Kana te akhares ko 112",
      signsModalSubtitle: "Akhar sigo ko 112 te dikhes varesavo katar kadala semnya.",
      closeSignsModalAria: "Phandav i feryastra e daravne semnenca",
      signPrefix: "Semno",
      signs: [
        {
          id: "chest-pain",
          title: "Zurali dukh ando kolin",
          description: "Tasavipe, pharipe vay phabaripe kay shay te zhal ki stingo vast, kor vay pashal o muy.",
          actionHint: "Shay te avel dab pe o ilo",
        },
        {
          id: "breathing-difficulty",
          title: "Phari phurdinimos",
          description: "Tasadyol sigo, sholyarel kana phurdel vay o manush nashti te phenel sasti vorba.",
          actionHint: "Shay te avel pani ko phiko vay pharo astmako atako",
        },
        {
          id: "facial-weakness",
          title: "Bango muy vay sigo kovlipe",
          description: "Ekh rig e muyeski perel tele, o manush nashti te vazdel liduy vasta vay vakerel phares thaj bisterdes.",
          actionHint: "Semno katar dab andi godi",
        },
        {
          id: "unconsciousness",
          title: "Peripe vay na del palpale",
          description: "O manush na del palpale kana akhares les vay azbas les, vay pelo sigo thaj na mishtol.",
          actionHint: "Dikh sigo te phurdel",
        },
        {
          id: "heavy-bleeding",
          title: "Zuralo thavdipe e ratesko",
          description: "O rat chhorel pes zurales vay na achhel palo 5 minute kana tasaves rigate pi rana.",
          actionHint: "Tasav zurales uzhe poxtanasa",
        },
        {
          id: "convulsions",
          title: "Izdravipe e saste truposko",
          description: "O trupo izdravel zurales, e yakha bolden pes opre, o manush nashti inkrel pire muskulurya.",
          actionHint: "Arakh o shero katar o dab. Ma chiv khanch ando muy.",
        },
      ],
      dispatcherGuideTitle: "So te phenes ko 112",
      dispatcherGuideSubtitle: "O manush ko 112 ka phuchel tut. Avel gata te phenes:",
      dispatcherSteps: [
        {
          title: "Kay san chaches",
          description: "Phen o foro vay o gav thaj ekh ashkardo than (pashal i khangeri, i shkola, o phurano podo vay i dyganya ando mashkar).",
        },
        {
          title: "Kaske trubul zhutimos",
          description: "Chavoro, baro manush vay phuro manush. Phen te phurdel o manush, te si zhangado thaj te del palpale.",
        },
        {
          title: "So kerdilo",
          description: "Phen khurdeles: dukh ando kolin, peripe katar ucho than, sigo peripe vay phari phurdinimos.",
        },
      ],
      dispatcherImportantNote: "Achh po telefono zhi kana o manush ko 112 phenel kay shay te phandaves. I ambulanta ninklel zhi kana vakeres.",
      freeServiceNotice: "Bi lovesko katar sarsavo telefono, vi bi kreditesko",
      understandButton: "Xatyardem",
      dialerGateTitle: "Akhar ko 112",
      closeWindowAria: "Phandav i feryastra",
      dialerNotice: "Akana ka akhares ko 112. Ka putardyol o gindari che telefonesko. O akharipe na shirdel korkoro. Tasav tu o zeleno butono.",
      dialerFreeNote: "O akharipe si bi lovesko ande sarsavi mobilni mrezha.",
      openDialerButton: "Akhar 112",
      cancelButton: "Mukh",
      desktopDialTitle: "Akhar ko 112 katar o telefono",
      desktopDialSubtitle: "Lekhav o gin po mobilno vay kheresko telefono.",
      desktopFreeNote: "O akharipe si bi lovesko ande sarsavi mrezha, vi bi kreditesko vay SIM kartelako.",
      desktopRuralNote: "Te beshes ando dur gav thaj i ambulanta shay te avel palal, mang ekhe pashutnes vurdonesa te ingarel tut ki may pashutni bolnitsa.",
    },
    newsRibbon: {
      ariaLabel: "Thanune nevimata thaj sastipnaske avizurya",
      changeCountyTitle: "Paruv i rig",
      changeLabel: "(paruv)",
      noActiveAlerts: "Nane avizo akana",
      viewAllNews: "Dikh savore nevimata",
      modalTitle: "Alosar chi rig",
      modalSubtitle: "Dikh e sastipnaske avizurya thaj mobilne kabinetya ando cho than.",
      searchPlaceholder: "Rod i rig (misal Cluj, Iași, Zagreb)...",
      detectingLocation: "Rodas cho than...",
      useAutoLocation: "Labar miro than",
      currentLabel: "Akana:",
      allCountiesNational: "Savore riga (themeske nevimata)",
      noCountyFound: "Na arakhlam rig vash",
      closeModal: "Phandav",
      geoUnsupported: "Cho browsero nashti te arakhel cho than.",
      geoSuccess: "Arakhlam cho than.",
      geoError: "Nashti arakhlam cho than. Alosar i rig katar i lista.",
    },
    quiz: {
      sectionTitle: "Chacho vay xoxamno",
      sectionSubtitle: "But sastipnaske vorbi zhan muy katar muy. Kathe sikljoves so si chacho thaj so nane.",
      filterAriaLabel: "Alosar e xoxamne vorbi palo felo",
      audioNarratorLabel: "Ashun o phuchipe thaj o ashkaripe",
      trueButton: "Chacho",
      falseButton: "Xoxamno",
      yourSelectedAnswer: "Cho palpale:",
      correctAnswerTag: "Dinyan chacho palpale",
      verifiedClarification: "Dikhlo doktoresko ashkaripe",
      stopAudioAria: "Astav o ginipe e ashkaripnasko",
      listenAudioAria: "Ashun o ashkaripe",
      stopAudioLabel: "Astav o ginipe",
      listenAudioLabel: "Ashun o ashkaripe",
      sourcePrefix: "Katar avel:",
      askDoctorHandover: "Si tut phuchimata? Phuch ekhe doktore online vash kadi tema",
      restartFirstMyth: "Shird palem katar o angluno",
      nextMyth: "Zha may dur",
      mythProgressPrefix: "Phuchipe",
      mythProgressOf: "katar",
      prevMythAria: "Angluno phuchipe",
      nextMythAria: "Aver phuchipe",
    },
    mediatorBand: {
      question: "San sastipnasko mediatori andi komuniteta?",
      description: "Alaturya vash tereneske vizite, sikavdo triyazho thaj lekhavipe e familiyango kolen zhutis.",
      cta: "Putar o mediatoresko modulo",
    },
    newsPage: {
      heroTitle: "Sastipnaske nevimata thaj thanune avizurya",
      heroSubtitle: "Sastipnaske avizurya, mobilne klinike thaj kampaniye vash o chikat ando cho than.",
      countyLabel: "Rig:",
      allCounties: "Savore riga",
      categories: {
        all: "Savore",
        epidemics: "Nasvalimata thaj avizurya",
        caravan: "Sastipnaski karavana",
        practicalAdvice: "Lache godya",
        patientRights: "Paciyenteske xakaya",
        childHealth: "Chavorengo sastipen",
        vaccinationCampaigns: "Kampaniye vash o chikat",
        seasonalAdvice: "Vramake godya",
      },
      emptyTitle: "Nane nevimata vash i alosardi rig",
      emptySubtitle: "Alosar aver rig vay dikh e nevimata vash sasto them.",
      resetFilter: "Dikh savore nevimata",
      backToNews: "Palpale ko nevimata",
      listenNarration: "Ashun lokho ashkaripe",
      playAudio: "Ashun",
      pauseAudio: "Astav",
      handoverTitle: "Trubul tuke sastipnasko zhutimos?",
      handoverSubtitle: "Vaker ekhe doktoreya online vay mang zhutimos katar ekh sastipnasko mediatori.",
      handoverTelemed: "Vaker ekhe doktoreya",
      handoverMediator: "Arakh sastipnasko mediatori",
      changeCounty: "Paruv i rig",
      saveSelection: "Garav",
    },
    medicOnlinePage: {
      heroTitle: "Vaker ekhe doktoreya kheral",
      heroSubtitle: "Bi azhukeripnasko thaj bi lunge dromengo. O doktori ashunel tut po telefono thaj phenel tuke so te keres.",
      cardOnCallTitle: "Vaker akana e doktoreya pe straja",
      cardOnCallSubtitle: "May butivar azhukeres may zalag sar 10 minute",
      cardOnCallAction: "De andre ki azhukeripnaski soba",
      cardBookingTitle: "Programisar akharipe e doktoreya",
      cardBookingSubtitle: "Alosar o dives thaj o chaso",
      cardBookingAction: "Programisar akana",
      cardPortalTitle: "Miro sastipnasko dosyaro",
      cardPortalSubtitle: "Dikh e recete, rengro dikhiben thaj e doktoreske godya",
      cardPortalAction: "Putar miro dosyaro",
      bookingTitle: "Programisar akharipe e doktoreya",
      bookingSubtitle: "Alosar o dives thaj o chaso, vash tuke vay varekaske anda chi familiya. Si bi lovesko thaj vakeres po telefono.",
      backToDoctorOnline: "Palpale ko doktori online",
      backToTelemed: "Palpale",
      stepDate: "Alosar o dives thaj o chaso",
      stepContact: "Paciyenteske podatke",
      familyForWhom: "Kaske si o programiripe?",
      familySelf: "Vash mange",
      familyOther: "Vash varekon anda miri familiya",
      queueTitle: "Azhukeripnaski soba",
      queueEstimated: "Inke karing 7 minute azhukeripe",
      queueWarning: "Ma phandav kadi rig. Ka phandas tut sigo kana o doktori si gata.",
      bandwidthLow: "Cho interneto phirel lokhes",
      bandwidthAudioOnly: "Nakhas numay pe glaso te na chhinadyol o akharipe",
    },
    mediatorsPage: {
      heroTitle: "Sastipnaske mediatorya",
      heroSubtitle: "Ekh sastipnasko mediatori zhutil tut e buletinasa, te lekhaves tut ko familiyako doktori, programiripnasa ki bolnitsa thaj e drabasa bi lovesko.",
      requestHelpButton: "Mang ekhe mediatore",
      modalTitle: "Mang sastipnasko mediatori ando cho than",
      nameLabel: "Sasto anav",
      phoneLabel: "Telefono",
      countyLabel: "Rig",
      localityLabel: "Foro vay gav",
      helpTypeLabel: "Sosa trubul tuke zhutimos?",
      submitButton: "Bichhal o mangipe",
    },
    countyMap: {
      title: "Rigengi mapa",
      subtitle: "Azba ekh rig te dikhes lake avizurya thaj mobilne klinike.",
      allCounties: "Savore riga",
      mapAriaLabel: "Rigengi mapa",
      selectedCountyPrefix: "Alosardi rig:",
      activeAlertsTooltip: "● Aktivne sastipnaske avizurya vay mobilne klinike",
      generalInfoTooltip: "Numay savore informaciye",
      recentNewsLabel: "Riga neve avizenca:",
      recentRegionsLabel: "Regiyone neve avizenca:",
      countyAriaPrefix: "Rig",
      hasAlertsSuffix: "si la aktivne avizurya vay mobilne klinike",
      romania: "Rumuniya",
      italy: "Italiya",
      pickLabel: "Vay alosar katar i lista",
      italyMapAriaLabel: "Mapa e regiyonengi andi Italiya",
      selectedRegionPrefix: "Alosardi regiyona:",
      allItaly: "Sasti Italiya",
      italyTitle: "Regiyonengi mapa",
      italySubtitle: "Azba ekh regiyona vay alosar la katar i lista te dikhes e nevimata.",
    },
    accountAuthPage: {
      title: "Putar cho sastipnasko dosyaro",
      subtitle: "Lekhav o telefonesko gin kay labardyan vash o programiripe. Ka bichhalas tuke kodo pe SMS.",
      phoneLabel: "Telefonesko gin",
      phonePlaceholder: "0721 000 000",
      sendCode: "Bichhal o kodo",
      codeLabel: "Kodo katar 4 gina anda SMS",
      verifyCode: "Dikh o kodo",
      invalidCode: "O kodo nane chacho vay nakhavdya piro vrama.",
      backHome: "Palpale ki angluni rig",
    },
  },
};
