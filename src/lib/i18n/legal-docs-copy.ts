import type { Lang } from "@/lib/i18n/languages";
import { LEGAL_OPERATOR, META_PIXEL_ID, getOperatorFullAddress } from "@/lib/legal-config";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type TermsDoc = {
  title: string;
  description: string;
  sections: LegalSection[];
};

export type PrivacyDoc = {
  title: string;
  description: string;
  controllerTitle: string;
  controllerBody: string;
  controllerContactLead: string;
  collectTitle: string;
  ordinaryTitle: string;
  ordinaryItems: string[];
  healthTitle: string;
  healthLead: string;
  healthItems: string[];
  purposesTitle: string;
  purposesColumns: [string, string, string];
  purposesRows: Array<[string, string, string]>;
  noSaleNote: string;
  accessTitle: string;
  accessItems: string[];
  processorsTitle: string;
  processorsIntro: string;
  processorsColumns: [string, string, string];
  processorsRows: Array<[string, string, string]>;
  processorsNotes: string[];
  locationTitle: string;
  locationItems: string[];
  cookiesTitle: string;
  cookiesItems: string[];
  cookiesLinkLabel: string;
  callsTitle: string;
  callsBody: string;
  retentionTitle: string;
  retentionColumns: [string, string];
  retentionRows: Array<[string, string]>;
  rightsTitle: string;
  rightsLead: string;
  rightsItems: string[];
  rightsContactBefore: string;
  rightsContactAfter: string;
  authoritiesBody: string;
  deletionTitle: string;
  deletionBody: string;
  childrenTitle: string;
  childrenBody: string;
  botTitle: string;
  botBody: string;
  changesTitle: string;
  changesBody: string;
};

export type CookieCategoryDoc = {
  title: string;
  legalBasis: string;
  body: string;
  items: string[];
};

export type CookiesDoc = {
  title: string;
  description: string;
  preferencesTitle: string;
  preferencesBody: string;
  categoriesTitle: string;
  categories: CookieCategoryDoc[];
  pixelTitle: string;
  pixelBody: string;
  pixelSafeguards: string[];
  manageTitle: string;
  manageBody: string;
  privacyLinkLabel: string;
  contactLinkLabel: string;
};

export function getTermsDoc(lang: Lang): TermsDoc {
  const address = getOperatorFullAddress(lang);
  const contact = LEGAL_OPERATOR.contactEmail;
  const domain = LEGAL_OPERATOR.platformDomain;

  const ro: TermsDoc = {
    title: "Termeni și condiții",
    description: "Regulile de folosire a aplicației RediHealth în faza de test.",
    sections: [
      {
        title: "Cine suntem",
        paragraphs: [
          `RediHealth este operat de ${LEGAL_OPERATOR.name}, cu sediul social la ${address}, număr BCE ${LEGAL_OPERATOR.bceNumber}.`,
          `Ne poți scrie la ${contact}. RediHealth face parte dintr-un proiect european REDI.`,
        ],
      },
      {
        title: "RediHealth este în fază de test",
        paragraphs: [
          "RediHealth este în dezvoltare și o folosim acum ca să testăm cum funcționează. Unele funcții se pot schimba, pot lipsi sau pot fi oprite temporar.",
          "Îți mulțumim dacă ne spui ce nu merge, folosind butonul Raportează o problemă.",
        ],
      },
      {
        title: "Ce îți oferă RediHealth",
        items: [
          "Informații de sănătate în limbaj simplu: ghiduri, mituri explicate și știri.",
          "Un asistent virtual care îți răspunde la întrebări generale și îți explică pe înțeles o rețetă.",
          "Căutare de farmacii, clinici și alte unități medicale.",
          "Discuție online cu un medic voluntar.",
          "Ajutor de la un mediator sanitar din comunitate.",
          "Contul meu: programările tale, pașii dați de medic și analizele pe care le încarci.",
        ],
        paragraphs: ["Toate serviciile sunt gratuite. Nu îți cerem niciodată bani sau date de card."],
      },
      {
        title: "Ce nu face RediHealth",
        items: [
          "Nu este un serviciu de urgență.",
          "Nu pune diagnostice prin asistentul virtual.",
          "Asistentul virtual nu prescrie medicamente și nu îți spune doze.",
          "Nu înlocuiește medicul de familie sau consultul la cabinet.",
        ],
      },
      {
        title: "Urgențe",
        paragraphs: [
          "Dacă ai o urgență medicală, sună tu acum la 112. RediHealth nu poate suna la 112 în locul tău.",
          "Medicul online nu este un serviciu de urgență.",
        ],
      },
      {
        title: "Informațiile medicale",
        paragraphs: [
          "Informațiile din RediHealth sunt generale. Te ajută să înțelegi și să știi unde să mergi, dar nu țin cont de situația ta exactă.",
          "Pentru o decizie despre sănătatea ta, vorbește cu un medic.",
        ],
      },
      {
        title: "Asistentul virtual",
        paragraphs: [
          "Asistentul virtual este un program automat, nu o persoană și nu un medic. Poate greși. Verifică informațiile importante cu un medic sau un farmacist.",
          "Nu îi scrie date de care nu are nevoie, cum ar fi CNP-ul sau adresa ta. Pentru rețete, nu schimba doza și nu opri un medicament fără să vorbești cu medicul sau cu farmacistul.",
        ],
      },
      {
        title: "Contul tău",
        items: [
          "Îți faci cont sau intri cu adresa ta de email și codul unic trimis pe email.",
          "Oferă date adevărate și nu lăsa pe altcineva să folosească emailul sau codul tău.",
          "Dacă ai sub 18 ani, folosești RediHealth doar împreună cu un părinte sau tutore.",
          "Un părinte poate cere consult pentru copilul lui din contul propriu.",
          "Poți cere ștergerea contului oricând.",
        ],
      },
      {
        title: "Medicul online și programările",
        items: [
          "Medicii sunt voluntari și au drept de practică.",
          "Medicul de gardă răspunde zilnic între 08:00 și 20:00. Poți cere și un apel programat.",
          "Apelul are loc prin Jitsi, direct în browser, fără să instalezi altă aplicație.",
          `Folosește doar linkurile primite de la RediHealth de pe domeniul oficial ${domain}.`,
          "Medicul îți poate oferi sfaturi și pașii următori în scris. Dacă apelul se întrerupe, intră din nou pe același link sau cere o nouă programare.",
          "Medicul poate opri discuția dacă situația ta are nevoie de consult la cabinet sau de 112.",
          "Dacă nu mai poți ajunge la o programare, anulează din timp ca locul să meargă la altcineva.",
        ],
      },
      {
        title: "Mediatorii sanitari",
        items: [
          "Mediatorii te însoțesc și te ajută cu acte, programări și drumul prin sistemul medical.",
          "Mediatorii nu sunt medici, nu pun diagnostice și nu recomandă tratamente.",
          "Mediatorul vede doar datele pe care alegi tu să i le arăți.",
        ],
      },
      {
        title: "Ce nu ai voie să faci",
        items: [
          "Să folosești contul altcuiva.",
          "Să dai informații false despre tine sau despre sănătatea ta.",
          "Să înregistrezi sau să publici apelul cu medicul fără acordul lui.",
          "Să jignești sau să ameninți medicii, mediatorii sau echipa.",
          "Să încerci să strici sau să accesezi fără drept aplicația.",
        ],
        paragraphs: ["Dacă nu respecți aceste reguli, putem suspenda sau închide contul."],
      },
      {
        title: "Răspunderea noastră",
        items: [
          "Facem tot ce putem ca RediHealth să funcționeze bine și informațiile să fie corecte.",
          "Nu răspundem pentru decizii luate doar pe baza informațiilor generale sau a asistentului virtual.",
          "Nu răspundem pentru întreruperi cauzate de internet, telefon sau furnizori externi.",
          "Nu ne limităm răspunderea acolo unde legea nu permite acest lucru.",
          "Medicii răspund pentru actul medical conform regulilor profesiei lor.",
        ],
      },
      {
        title: "Schimbări, legea aplicabilă și limba",
        paragraphs: [
          "Putem schimba acești termeni. Pe fiecare versiune scriem data și numărul versiunii, iar pentru schimbări importante te anunțăm înainte să intre în vigoare.",
          `Acești termeni sunt guvernați de legea belgiană. Dacă locuiești în altă țară din UE, păstrezi protecția oferită de legile obligatorii din țara ta. Încercăm întâi să rezolvăm orice problemă prin discuție la ${contact}.`,
          "Termenii există în mai multe limbi. Dacă există diferențe de interpretare, prevalează varianta în limba română.",
        ],
      },
    ],
  };

  const en: TermsDoc = {
    title: "Terms and conditions",
    description: "The rules for using RediHealth during its test phase.",
    sections: [
      {
        title: "Who we are",
        paragraphs: [
          `RediHealth is operated by ${LEGAL_OPERATOR.name}, registered office at ${address}, BCE number ${LEGAL_OPERATOR.bceNumber}.`,
          `You can write to us at ${contact}. RediHealth is part of a European REDI project.`,
        ],
      },
      {
        title: "RediHealth is in a test phase",
        paragraphs: [
          "RediHealth is under active development and currently used to test the service. Some features may change, be unavailable or pause temporarily.",
          "Thank you for letting us know if something does not work via Report an issue.",
        ],
      },
      {
        title: "What RediHealth offers",
        items: [
          "Plain-language health information: guides, myth explainers and health news.",
          "A virtual assistant that answers general questions and explains prescriptions clearly.",
          "A directory to find pharmacies, clinics and other medical facilities.",
          "Online consultations with a volunteer doctor.",
          "Support from a community health mediator.",
          "My account: your appointments, written next steps from the doctor and uploaded lab results.",
        ],
        paragraphs: ["All services are free. We never ask for money or bank card details."],
      },
      {
        title: "What RediHealth does not do",
        items: [
          "It is not an emergency service.",
          "The virtual assistant does not diagnose illness.",
          "The virtual assistant does not prescribe medication or set dosages.",
          "It does not replace your family doctor or an in-person examination.",
        ],
      },
      {
        title: "Emergencies",
        paragraphs: [
          "If you have a medical emergency, call 112 yourself right away. RediHealth cannot call 112 on your behalf.",
          "The online doctor is not an emergency service.",
        ],
      },
      {
        title: "Medical information",
        paragraphs: [
          "Information on RediHealth is general. It helps you understand options and find care, but does not account for your exact medical situation.",
          "Speak to a licensed doctor before making decisions about your health.",
        ],
      },
      {
        title: "Virtual assistant",
        paragraphs: [
          "The virtual assistant is automated software, not a person and not a doctor. It can make mistakes. Always verify important details with a doctor or pharmacist.",
          "Do not enter unnecessary personal identifiers such as your national ID number or home address. Never change a dose or stop taking a prescribed medicine without consulting your doctor or pharmacist.",
        ],
      },
      {
        title: "Your account",
        items: [
          "Sign in with your email address and a one-time code sent by email.",
          "Provide accurate information and do not let others use your email or verification code.",
          "If you are under 18, use RediHealth only together with a parent or legal guardian.",
          "A parent or guardian may request a consultation for their child from their own account.",
          "You may request deletion of your account at any time.",
        ],
      },
      {
        title: "Online doctor and appointments",
        items: [
          "Volunteer doctors are licensed medical practitioners.",
          "The on-call doctor responds daily between 08:00 and 20:00, and scheduled calls are also available.",
          "Calls take place via Jitsi in your browser with no extra app required.",
          `Use only official RediHealth links from the ${domain} domain.`,
          "The doctor can share written advice and next steps. If a call drops, rejoin via the same link or book another slot.",
          "The doctor may end a call if your situation requires an in-person clinic visit or emergency care (112).",
          "If you can no longer attend a booked appointment, cancel in advance so the slot can help someone else.",
        ],
      },
      {
        title: "Community health mediators",
        items: [
          "Mediators accompany you and help with paperwork, appointments and navigating healthcare services.",
          "Mediators are not doctors; they do not diagnose or recommend treatments.",
          "A mediator sees only the data you explicitly choose to share.",
        ],
      },
      {
        title: "Prohibited conduct",
        items: [
          "Using someone else's account.",
          "Providing false information about yourself or your health.",
          "Recording or publishing a doctor call without the doctor's consent.",
          "Abusing or threatening doctors, mediators or staff.",
          "Attempting to disrupt or gain unauthorised access to the platform.",
        ],
        paragraphs: ["We may suspend or close accounts that breach these rules."],
      },
      {
        title: "Liability",
        items: [
          "We take reasonable care to keep RediHealth reliable and accurate.",
          "We are not liable for decisions taken solely on the basis of general information or the virtual assistant.",
          "We are not liable for outages caused by internet connections, devices or external providers.",
          "Nothing in these terms limits liability where the law does not allow it.",
          "Volunteer doctors remain responsible for their medical advice under applicable professional rules.",
        ],
      },
      {
        title: "Changes, governing law and language",
        paragraphs: [
          "We may update these terms. Every version shows its version number and effective date, and we notify users before material changes take effect.",
          `These terms are governed by Belgian law. If you live in another EU member state, you retain the mandatory consumer protections of your country of residence. Please write to ${contact} first so we can resolve any issue amicably.`,
          "These terms are available in several languages. In case of discrepancy during the test phase, the Romanian version prevails.",
        ],
      },
    ],
  };

  if (lang === "ro") return ro;
  if (lang === "en") return en;

  const localizedHeaders: Record<Exclude<Lang, "ro" | "en">, { title: string; description: string; note: string }> = {
    sq: {
      title: "Kushtet dhe rregullat",
      description: "Rregullat e përdorimit të RediHealth në fazën e testimit.",
      note: `Operatori: ${LEGAL_OPERATOR.name}, ${address}, BCE ${LEGAL_OPERATOR.bceNumber}. Kontakt: ${contact}. RediHealth është falas, në fazë testimi, nuk zëvendëson mjekun dhe nuk është shërbim urgjence (telefono 112).`,
    },
    it: {
      title: "Termini e condizioni",
      description: "Regole di utilizzo di RediHealth durante la fase di test.",
      note: `Operatore: ${LEGAL_OPERATOR.name}, ${address}, BCE ${LEGAL_OPERATOR.bceNumber}. Contatto: ${contact}. RediHealth è gratuito, in fase di test, non sostituisce il medico e non è un servizio di emergenza (chiama il 112).`,
    },
    hr: {
      title: "Uvjeti korištenja",
      description: "Pravila korištenja platforme RediHealth u fazi testiranja.",
      note: `Voditelj: ${LEGAL_OPERATOR.name}, ${address}, BCE ${LEGAL_OPERATOR.bceNumber}. Kontakt: ${contact}. RediHealth je besplatan, u fazi testiranja, ne zamjenjuje liječnika i nije hitna služba (nazovi 112).`,
    },
    rom: {
      title: "Labaripnaske pravila",
      description: "Pravila vash o labaripe e RediHealth and-i testiripnaski faza.",
      note: `Organizaciya: ${LEGAL_OPERATOR.name}, ${address}, BCE ${LEGAL_OPERATOR.bceNumber}. Kontakto: ${contact}. RediHealth si bi lovesko, and-i testiripnaski faza, na achhel po than e doktoresko thaj nay sigardiari (akhar 112).`,
    },
    ru: {
      title: "Условия использования",
      description: "Правила использования RediHealth в тестовой фазе.",
      note: `Оператор: ${LEGAL_OPERATOR.name}, ${address}, BCE ${LEGAL_OPERATOR.bceNumber}. Контакт: ${contact}. RediHealth бесплатен, находится в тестовой фазе, не заменяет врача и не является службой экстренной помощи (звоните 112).`,
    },
  };

  const localized = localizedHeaders[lang];
  return {
    title: localized.title,
    description: localized.description,
    sections: [
      { title: en.sections[0].title, paragraphs: [localized.note, ...en.sections[0].paragraphs!] },
      ...en.sections.slice(1),
    ],
  };
}

export function getPrivacyDoc(lang: Lang): PrivacyDoc {
  const address = getOperatorFullAddress(lang);
  const pixelLabel = META_PIXEL_ID ? `Meta Pixel (ID ${META_PIXEL_ID})` : "Meta Pixel";

  const ro: PrivacyDoc = {
    title: "Politica de confidențialitate",
    description: "Cum colectăm, folosim și protejăm datele tale în RediHealth, conform GDPR.",
    controllerTitle: "Cine este operatorul datelor tale",
    controllerBody: `Operatorul datelor tale este ${LEGAL_OPERATOR.name}, cu sediul social la ${address}, număr BCE ${LEGAL_OPERATOR.bceNumber}.`,
    controllerContactLead: "Pentru orice întrebare despre datele tale personale, scrie-ne la",
    collectTitle: "Ce date colectăm",
    ordinaryTitle: "Date obișnuite",
    ordinaryItems: [
      "Adresa de email și, dacă ni-l spui, numele.",
      "Limba aleasă și setările de accesibilitate.",
      "Orașul sau adresa căutată la Farmacii și clinici.",
      "Programările: ziua, ora și tipul de medic.",
      "Date tehnice: tipul de browser, adresa IP și erori ale aplicației.",
      "Feedback-ul anonim, care nu este legat de contul tău.",
    ],
    healthTitle: "Date despre sănătate (date sensibile)",
    healthLead: "Le colectăm doar dacă ni le oferi tu și doar cu acordul tău explicit:",
    healthItems: [
      "Ce scrii în asistentul virtual despre sănătatea ta.",
      "Rețetele pe care le încarci ca să ți le explicăm.",
      "Ce discuți cu medicul în apel și sfaturile lui scrise.",
      "Planul de tratament și rețetele din Contul meu.",
      "Analizele pe care alegi să le încarci.",
      "Valorile măsurate de mediator acasă la tine (tensiune, oxigen, glicemie).",
    ],
    purposesTitle: "De ce folosim datele și pe ce temei legal (GDPR)",
    purposesColumns: ["Scop", "Date", "Temei legal (GDPR)"],
    purposesRows: [
      ["Contul tău și autentificarea", "Email, nume", "Art. 6(1)(b) – furnizarea serviciului cerut"],
      ["Răspunsurile asistentului virtual", "Ce scrii despre sănătate", "Art. 6(1)(a) și art. 9(2)(a) – acordul tău explicit"],
      ["Explicarea rețetei", "Rețeta încărcată", "Art. 6(1)(a) și art. 9(2)(a) – acordul tău explicit"],
      ["Consultul cu medicul", "Discuția, sfaturile, planul de tratament", "Art. 6(1)(a), art. 9(2)(a) și art. 9(2)(h) – îngrijire medicală cu obligație de secret profesional"],
      ["Programări și emailuri despre ele", "Email, ziua și ora", "Art. 6(1)(b) – executarea serviciului"],
      ["Ajutorul mediatorului", "Datele pe care alegi să i le arăți, valorile măsurate", "Art. 6(1)(a) și art. 9(2)(a) – acordul tău explicit"],
      ["Securitate și protecție anti-roboți", "Date tehnice, Google reCAPTCHA", "Art. 6(1)(f) – interes legitim de protecție a aplicației"],
      ["Măsurare campanii (pagini publice)", `Vizite pe pagini publice (${pixelLabel})`, "Art. 6(1)(a) – doar cu acordul tău explicit în bannerul de cookie-uri"],
    ],
    noSaleNote: "Nu vindem datele tale personale sau medicale. Nu trimitem niciodată date de sănătate către Meta sau alte servicii de publicitate.",
    accessTitle: "Cine vede datele tale",
    accessItems: [
      "Medicul cu care vorbești: doar datele de sănătate pe care alegi să i le arăți.",
      "Mediatorul care te ajută: doar ce alegi tu să îi arăți, separat de medic.",
      "Echipa tehnică RediHealth: doar când este necesar pentru funcționarea aplicației sau rezolvarea unei probleme.",
      "Accesul medicilor, mediatorilor și administratorilor la dosarele de sănătate este înregistrat în jurnal.",
    ],
    processorsTitle: "Furnizori și parteneri tehnici",
    processorsIntro: "Folosim furnizori care prelucrează date în numele nostru, pe bază de contract și garanții de securitate:",
    processorsColumns: ["Furnizor", "Pentru ce", "Ce date primește"],
    processorsRows: [
      ["Vercel și baza de date MySQL", "Găzduirea aplicației și stocarea datelor", "Datele aplicației, cu criptare pentru datele sensibile"],
      ["Jitsi (meet.jit.si)", "Apelul video cu medicul", "Sunetul și imaginea din timpul apelului (neînregistrate)"],
      ["Anthropic (Claude API)", "Răspunsurile asistentului și explicarea rețetelor", "Mesajele din asistent și rețetele încărcate; nu se folosesc pentru antrenarea modelelor"],
      ["Hostinger Mail", "Codurile de autentificare și emailurile despre programări", "Adresa de email și conținutul notificării"],
      ["Google reCAPTCHA", "Protecție împotriva roboților pe formulare publice", "Date tehnice din browser; nu primește date de sănătate"],
      [`Meta Platforms Ireland Ltd. (${pixelLabel})`, "Măsurarea campaniilor pe pagini publice", "Doar cu acordul tău explicit: vizite pe pagini publice generale; blocat complet pe paginile medicale și de cont"],
    ],
    processorsNotes: [
      "Dacă un furnizor prelucrează date în afara UE/SEE, aplicăm garanțiile prevăzute de GDPR (de exemplu, clauze contractuale standard).",
      "Transmitem date către autorități doar dacă legea ne obligă.",
    ],
    locationTitle: "Locația",
    locationItems: [
      "Când cauți farmacii sau clinici după oraș sau adresă, folosim textul doar pentru căutare și nu îl salvăm în cont.",
      "Dacă alegi să folosești locația telefonului (GPS), browserul îți cere acordul separat, iar coordonatele nu se salvează pe server.",
    ],
    cookiesTitle: "Cookie-uri și Meta Pixel",
    cookiesItems: [
      "Cookie-uri strict necesare: păstrează limba, sesiunea de autentificare și preferințele de accesibilitate. Nu necesită acord.",
      "Google reCAPTCHA: activ pe formularele publice pentru protecția împotriva abuzurilor automate.",
      `Măsurare campanii (${pixelLabel}): opțional și dezactivat implicit. Se încarcă numai dacă apeși Acceptă toate sau îl activezi din Setări cookie-uri, și nu rulează niciodată pe paginile de simptome, rețete, asistent, apel cu medicul sau contul tău.`,
    ],
    cookiesLinkLabel: "Citește Politica de cookie-uri",
    callsTitle: "Apelurile cu medicul",
    callsBody: "Apelurile video cu medicul nu sunt înregistrate. Medicul notează doar sfaturile și pașii următori, pe care îi poți consulta în contul tău.",
    retentionTitle: "Cât timp păstrăm datele",
    retentionColumns: ["Tip de date", "Durată de păstrare"],
    retentionRows: [
      ["Contul și adresa de email", "Pe durata existenței contului; se șterg în cel mult 30 de zile de la ștergerea contului"],
      ["Conversațiile cu asistentul virtual", "Nu sunt salvate persistent în faza de test"],
      ["Rețetele încărcate pentru explicare", "Procesate doar pentru generarea explicației; nu sunt păstrate ca arhive permanente"],
      ["Sfaturile medicului și planul de tratament", "Conform obligațiilor legale aplicabile documentelor medicale"],
      ["Analizele încărcate", "Până le ștergi tu sau până ștergi contul"],
      ["Datele tehnice și jurnalele de erori", "Cel mult 90 de zile"],
    ],
    rightsTitle: "Drepturile tale (GDPR)",
    rightsLead: "Ai dreptul oricând:",
    rightsItems: [
      "să afli ce date avem despre tine și să primești o copie (dreptul de acces);",
      "să corectezi datele greșite sau incomplete (rectificare);",
      "să ceri ștergerea datelor (dreptul de a fi uitat);",
      "să restrângi prelucrarea lor;",
      "să primești datele într-un format portabil;",
      "să te opui prelucrării bazate pe interes legitim;",
      "să îți retragi oricând acordul (inclusiv pentru cookie-uri), fără să afecteze prelucrarea anterioară.",
    ],
    rightsContactBefore: "Pentru exercitarea drepturilor, scrie-ne la",
    rightsContactAfter: "Îți răspundem în cel mult o lună.",
    authoritiesBody: "Poți depune o plângere la autoritatea de protecție a datelor din Belgia (Autoritatea pentru Protecția Datelor – APD/GBA) sau din țara în care locuiești. În România: Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).",
    deletionTitle: "Ștergerea contului",
    deletionBody: "Poți cere ștergerea contului oricând din setări sau scriindu-ne pe email. Ștergem datele tale în cel mult 30 de zile, cu excepția celor pe care legea ne obligă să le păstrăm, despre care te informăm înainte de confirmare.",
    childrenTitle: "Copiii",
    childrenBody: "Persoanele sub 18 ani folosesc RediHealth doar împreună cu un părinte sau tutore legal. Pentru consultul unui copil, acordul este oferit de părinte sau tutore.",
    botTitle: "Protecție împotriva roboților (reCAPTCHA)",
    botBody: "Când protecția este activă, folosim Google reCAPTCHA pe formularele publice pentru a opri abuzurile automate. Google verifică date tehnice despre browser după propria politică de confidențialitate. Noi trimitem doar un token CAPTCHA, niciodată date de sănătate sau textul introdus de tine.",
    changesTitle: "Schimbări ale acestei politici",
    changesBody: "Când actualizăm această politică, menționăm data și versiunea și te anunțăm în aplicație sau pe email dacă schimbarea este importantă.",
  };

  const en: PrivacyDoc = {
    title: "Privacy policy",
    description: "How RediHealth collects, uses and protects your personal and health data under GDPR.",
    controllerTitle: "Data controller",
    controllerBody: `The controller of your personal data is ${LEGAL_OPERATOR.name}, registered office at ${address}, BCE number ${LEGAL_OPERATOR.bceNumber}.`,
    controllerContactLead: "For any question about your personal data or GDPR rights, write to",
    collectTitle: "What data we collect",
    ordinaryTitle: "General personal data",
    ordinaryItems: [
      "Your email address and, if provided, your name.",
      "Selected language and accessibility preferences.",
      "City or address searched in Pharmacies and clinics.",
      "Appointments: date, time and doctor specialty.",
      "Technical data: browser type, IP address and application error logs.",
      "Anonymous feedback, which is not linked to your account.",
    ],
    healthTitle: "Health data (special category data)",
    healthLead: "Collected only when you choose to provide it and only with your explicit consent:",
    healthItems: [
      "What you write in the virtual assistant about your health.",
      "Prescriptions you upload for plain-language explanation.",
      "Information shared during an online doctor call and the doctor's written advice.",
      "Treatment plans and prescriptions stored in My account.",
      "Lab results you choose to upload.",
      "Home measurements recorded with a health mediator (blood pressure, oxygen, blood sugar).",
    ],
    purposesTitle: "Purposes and GDPR legal bases",
    purposesColumns: ["Purpose", "Data", "Legal basis (GDPR)"],
    purposesRows: [
      ["Account and sign-in", "Email, name", "Art. 6(1)(b) – providing the requested service"],
      ["Virtual assistant answers", "Health questions you submit", "Art. 6(1)(a) and Art. 9(2)(a) – explicit consent"],
      ["Prescription explanation", "Uploaded prescription", "Art. 6(1)(a) and Art. 9(2)(a) – explicit consent"],
      ["Online doctor consultation", "Discussion, advice, care plan", "Art. 6(1)(a), Art. 9(2)(a) and Art. 9(2)(h) – healthcare under professional secrecy"],
      ["Appointments and emails", "Email, date and time", "Art. 6(1)(b) – service performance"],
      ["Health mediator support", "Data you choose to share and home readings", "Art. 6(1)(a) and Art. 9(2)(a) – explicit consent"],
      ["Security and bot protection", "Technical data, Google reCAPTCHA", "Art. 6(1)(f) – legitimate interest in securing the service"],
      ["Campaign measurement (public pages)", `Public page visits (${pixelLabel})`, "Art. 6(1)(a) – only after your explicit consent in the cookie banner"],
    ],
    noSaleNote: "We never sell your personal or health data. We never send health information or form entries to Meta or any advertising network.",
    accessTitle: "Who can see your data",
    accessItems: [
      "The doctor you speak with: only the health information you choose to share.",
      "The health mediator helping you: only what you explicitly share, separate from the doctor.",
      "RediHealth technical team: only when required to operate or troubleshoot the platform.",
      "Staff access to patient health records is recorded in an audit log.",
    ],
    processorsTitle: "Service providers and processors",
    processorsIntro: "We rely on contracted processors with data protection safeguards:",
    processorsColumns: ["Provider", "Purpose", "Data received"],
    processorsRows: [
      ["Vercel and hosted MySQL", "Application hosting and database storage", "Platform data, with field-level encryption for sensitive medical records"],
      ["Jitsi (meet.jit.si)", "Online doctor video calls", "Live audio and video during the call (not recorded)"],
      ["Anthropic (Claude API)", "Virtual assistant and prescription explanation", "Assistant messages and uploaded prescriptions; API data is not used to train models"],
      ["Hostinger Mail", "Sign-in codes and appointment emails", "Email address and notification message"],
      ["Google reCAPTCHA", "Bot protection on public forms", "Technical browser signals only; never health data"],
      [`Meta Platforms Ireland Ltd. (${pixelLabel})`, "Campaign reach measurement on public pages", "Only with explicit consent: visits to general public pages; strictly disabled on medical, assistant, call and account routes"],
    ],
    processorsNotes: [
      "Where a provider processes data outside the EU/EEA, we apply GDPR transfer safeguards such as Standard Contractual Clauses.",
      "We disclose data to public authorities only when legally required.",
    ],
    locationTitle: "Location",
    locationItems: [
      "When you search by city or address, we use the text only to show nearby places and do not save it to your account.",
      "Optional device GPS location is requested separately by your browser and coordinates are never stored on our servers.",
    ],
    cookiesTitle: "Cookies and Meta Pixel",
    cookiesItems: [
      "Strictly necessary cookies: keep your language, sign-in session and accessibility settings working. No consent required.",
      "Google reCAPTCHA: protects public forms from automated abuse.",
      `Campaign measurement (${pixelLabel}): optional and off by default. Loads only if you accept optional cookies and never runs on symptom check, prescription review, assistant, doctor call or account pages.`,
    ],
    cookiesLinkLabel: "Read our Cookie policy",
    callsTitle: "Online doctor calls",
    callsBody: "Doctor video calls are not recorded. The doctor records only written advice and next steps so you can review them in your account.",
    retentionTitle: "How long we keep data",
    retentionColumns: ["Data category", "Retention period"],
    retentionRows: [
      ["Account and email address", "While your account is active; deleted within 30 days of account deletion"],
      ["Virtual assistant chats", "Not stored persistently during the test phase"],
      ["Uploaded prescriptions", "Processed only to generate the explanation; not retained as permanent archives"],
      ["Doctor advice and care plan", "Retained in line with applicable medical record legal obligations"],
      ["Uploaded lab results", "Until you delete them or delete your account"],
      ["Technical logs", "Up to 90 days"],
    ],
    rightsTitle: "Your GDPR rights",
    rightsLead: "You have the right at any time to:",
    rightsItems: [
      "know what data we hold about you and receive a copy (access);",
      "correct inaccurate or incomplete data (rectification);",
      "request deletion of your data (erasure);",
      "restrict processing of your data;",
      "receive your data in a portable format;",
      "object to processing based on legitimate interest;",
      "withdraw your consent at any time (including for cookies), without affecting prior lawful processing.",
    ],
    rightsContactBefore: "To exercise any of these rights, write to",
    rightsContactAfter: "We respond within one month.",
    authoritiesBody: "You may lodge a complaint with the Belgian Data Protection Authority (APD/GBA) or the supervisory authority in your country of residence (in Romania: ANSPDCP).",
    deletionTitle: "Account deletion",
    deletionBody: "You can request deletion of your account at any time. We delete your data within 30 days, except records we are legally obliged to retain, which we clearly explain before confirmation.",
    childrenTitle: "Children",
    childrenBody: "People under 18 may use RediHealth only with a parent or legal guardian. For a child's consultation, consent is given by the parent or guardian.",
    botTitle: "Bot protection (reCAPTCHA)",
    botBody: "When enabled, Google reCAPTCHA protects public forms against automated abuse. Google checks technical browser data under its own privacy policy. We send Google only a CAPTCHA token, never health information or form text.",
    changesTitle: "Changes to this policy",
    changesBody: "Whenever we update this policy, we show the new version number and effective date and notify you before material changes take effect.",
  };

  if (lang === "ro") return ro;
  if (lang === "en") return en;

  const localizedTitles: Record<Exclude<Lang, "ro" | "en">, { title: string; description: string }> = {
    sq: {
      title: "Politika e privatësisë (GDPR)",
      description: "Si mbledh, përdor dhe mbron RediHealth të dhënat e tua personale dhe shëndetësore sipas GDPR.",
    },
    it: {
      title: "Informativa sulla privacy (GDPR)",
      description: "Come RediHealth raccoglie, utilizza e protegge i tuoi dati personali e sanitari ai sensi del GDPR.",
    },
    hr: {
      title: "Pravila privatnosti (GDPR)",
      description: "Kako RediHealth prikuplja, koristi i štiti tvoje osobne i zdravstvene podatke u skladu s GDPR-om.",
    },
    rom: {
      title: "Garavipnaske pravila (GDPR)",
      description: "Sar chidel, labarel thaj arakhel RediHealth che manushikane thaj sastipnaske podatke palo GDPR.",
    },
    ru: {
      title: "Политика конфиденциальности (GDPR)",
      description: "Как RediHealth собирает, использует и защищает ваши персональные и медицинские данные в соответствии с GDPR.",
    },
  };

  return { ...en, ...localizedTitles[lang] };
}

export function getCookiesDoc(lang: Lang): CookiesDoc {
  const pixelId = META_PIXEL_ID || "2195130208072639";

  const ro: CookiesDoc = {
    title: "Politica de cookie-uri",
    description: "Ce cookie-uri și instrumente de măsurare folosește RediHealth și cum le poți controla.",
    preferencesTitle: "Controlează preferințele tale",
    preferencesBody:
      "Cookie-urile opționale sunt oprite implicit. Poți accepta, refuza sau retrage acordul oricând mai jos. Toate serviciile RediHealth funcționează normal chiar dacă alegi Doar necesare.",
    categoriesTitle: "Categorii de cookie-uri",
    categories: [
      {
        title: "1. Cookie-uri strict necesare",
        legalBasis: "Temei legal: Art. 6(1)(b) și Art. 6(1)(f) GDPR – nu necesită consimțământ",
        body: "Acestea sunt esențiale pentru funcționarea de bază a aplicației, securitate și păstrarea opțiunilor tale.",
        items: [
          "redihealth_lang și redihealth_lang_manual – păstrează limba aleasă (12 luni).",
          "redihealth_county – păstrează județul selectat pentru căutări locale și alerte.",
          "redihealth_emergency_dismissed – reține dacă ai ascuns banda 112 pe dispozitiv.",
          "redihealth_email_otp și cookie-uri de sesiune NextAuth – autentificare sigură cu cod unic pe email.",
          "redihealth_cookie_consent – salvează decizia ta privind cookie-urile (180 de zile).",
        ],
      },
      {
        title: "2. Securitate și protecție anti-roboți",
        legalBasis: "Temei legal: Art. 6(1)(f) GDPR – interes legitim de securitate",
        body: "Pe formularele publice folosim Google reCAPTCHA v3 pentru a bloca abuzurile automate.",
        items: [
          "Verifică exclusiv semnale tehnice din browser.",
          "Nu primește niciodată datele tale de sănătate sau textul introdus în formulare.",
        ],
      },
      {
        title: "3. Măsurare campanii (Meta Pixel – opțional)",
        legalBasis: "Temei legal: Art. 6(1)(a) GDPR – exclusiv cu acordul tău explicit",
        body: `Folosim Meta Pixel (ID ${pixelId}), oferit de Meta Platforms Ireland Ltd., pentru a înțelege câte persoane ajung la paginile publice RediHealth din campaniile noastre de informare.`,
        items: [
          "Dezactivat implicit până când îți exprimi acordul explicit.",
          "Poate seta cookie-uri de tip _fbp sau _fbc după activare.",
          "Dacă retragi acordul, apelăm revocarea consimțământului Meta și ștergem cookie-urile _fbp / _fbc.",
        ],
      },
    ],
    pixelTitle: "Protecție strictă pentru datele de sănătate",
    pixelBody:
      "Datele despre sănătate sunt date sensibile conform Art. 9 GDPR. Chiar și atunci când accepți cookie-urile opționale, Meta Pixel este blocat la nivel de cod pe toate paginile sensibile.",
    pixelSafeguards: [
      "Meta Pixel NU se încarcă și NU trimite evenimente pe paginile: Verifică simptomele, Asistent virtual, Explică-mi rețeta, Cere ajutor, Programare / Sală de așteptare / Apel video medic, Contul meu, Portalul pacientului, Autentificare și Panoul personalului.",
      "Nu trimitem către Meta simptome, mesaje din asistent, rețete, nume, emailuri sau alte date introduse în formulare.",
      "Pe paginile publice eligibile (pagina principală, ghiduri generale, farmacii și clinici, despre, contact, știri), se trimite exclusiv evenimentul tehnic PageView după consimțământ.",
    ],
    manageTitle: "Cum îți schimbi decizia",
    manageBody:
      "Poți modifica preferințele oricând folosind butonul Setări cookie-uri din subsolul fiecărei pagini, panoul de mai sus sau setările browserului tău.",
    privacyLinkLabel: "Politica de confidențialitate (GDPR)",
    contactLinkLabel: "Contact și protecția datelor",
  };

  const en: CookiesDoc = {
    title: "Cookie policy",
    description: "Which cookies and measurement tools RediHealth uses and how you can control them.",
    preferencesTitle: "Manage your preferences",
    preferencesBody:
      "Optional cookies are off by default. You can accept, reject or withdraw consent at any time below. All RediHealth features work normally if you choose Necessary only.",
    categoriesTitle: "Cookie categories",
    categories: [
      {
        title: "1. Strictly necessary cookies",
        legalBasis: "Legal basis: Art. 6(1)(b) and Art. 6(1)(f) GDPR – no consent required",
        body: "Essential for core platform functionality, security and remembering your interface preferences.",
        items: [
          "redihealth_lang and redihealth_lang_manual – remember your chosen language (12 months).",
          "redihealth_county – remembers your selected county for local care search and alerts.",
          "redihealth_emergency_dismissed – remembers if you dismissed the 112 bar on this device.",
          "redihealth_email_otp and NextAuth session cookies – secure email-code authentication.",
          "redihealth_cookie_consent – stores your cookie preference choice (180 days).",
        ],
      },
      {
        title: "2. Security and bot protection",
        legalBasis: "Legal basis: Art. 6(1)(f) GDPR – legitimate interest in platform security",
        body: "Public forms use Google reCAPTCHA v3 to prevent automated spam and abuse.",
        items: [
          "Checks technical browser signals only.",
          "Never receives your health data or the content you type into forms.",
        ],
      },
      {
        title: "3. Campaign measurement (Meta Pixel – optional)",
        legalBasis: "Legal basis: Art. 6(1)(a) GDPR – strictly with your explicit consent",
        body: `We use Meta Pixel (ID ${pixelId}), provided by Meta Platforms Ireland Ltd., to measure how many visitors reach RediHealth public information pages from awareness campaigns.`,
        items: [
          "Disabled by default until you explicitly opt in.",
          "May set _fbp or _fbc cookies once enabled.",
          "When you withdraw consent, we invoke Meta consent revocation and clear _fbp / _fbc cookies.",
        ],
      },
    ],
    pixelTitle: "Strict safeguards for health data",
    pixelBody:
      "Health information is special-category data under Art. 9 GDPR. Even when you accept optional cookies, Meta Pixel is blocked in code across every sensitive route.",
    pixelSafeguards: [
      "Meta Pixel NEVER loads or fires events on: Check my symptoms, Health assistant, Explain my prescription, Ask for help, Doctor booking / waiting room / video call, My account, Patient portal, Sign in and Worker panel.",
      "We never send symptoms, assistant prompts, prescriptions, names, emails or any form inputs to Meta.",
      "On eligible public informational pages (home, general health guides, pharmacies and clinics, about, contact, news), only a basic PageView event fires after consent.",
    ],
    manageTitle: "How to change your choice",
    manageBody:
      "You can update or withdraw your choice at any time using Cookie settings in the footer of any page, the controls above, or your browser settings.",
    privacyLinkLabel: "Privacy policy (GDPR)",
    contactLinkLabel: "Contact and data protection",
  };

  if (lang === "ro") return ro;
  if (lang === "en") return en;

  const localizedHeaders: Record<Exclude<Lang, "ro" | "en">, { title: string; description: string }> = {
    sq: {
      title: "Politika e cookie-ve",
      description: "Cilat cookie dhe mjete matjeje përdor RediHealth dhe si mund t'i kontrollosh.",
    },
    it: {
      title: "Politica sui cookie",
      description: "Quali cookie e strumenti di misurazione utilizza RediHealth e come controllarli.",
    },
    hr: {
      title: "Politika kolačića",
      description: "Koje kolačiće i alate za mjerenje RediHealth koristi i kako njima upravljati.",
    },
    rom: {
      title: "Cookie pravila",
      description: "Save cookie labarel RediHealth thaj sar shay te kontroline len.",
    },
    ru: {
      title: "Политика cookie",
      description: "Какие файлы cookie и инструменты измерения использует RediHealth и как ими управлять.",
    },
  };

  return { ...en, ...localizedHeaders[lang] };
}
