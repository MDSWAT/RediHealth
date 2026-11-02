import type { Lang } from "@/lib/i18n/translations";

type LegalCopy = {
  about: {
    title: string;
    description: string;
    paragraphs: string[];
  };
  contact: {
    title: string;
    description: string;
    enquiries: string;
    emergencies: string;
    emergencyBody: string;
    helpBefore: string;
    helpLink: string;
    helpAfter: string;
  };
  terms: {
    title: string;
    description: string;
    sections: Array<{ title: string; body: string }>;
  };
  privacy: {
    title: string;
    description: string;
    collectTitle: string;
    collectBody: string;
    useTitle: string;
    useBody: string;
    accessTitle: string;
    accessBody: string;
    choicesTitle: string;
    choicesBody: string;
    botTitle: string;
    botBody: string;
  };
  accessibility: {
    title: string;
    description: string;
    paragraphs: string[];
    contact: string;
  };
};

const english: LegalCopy = {
  about: {
    title: "About RediHealth",
    description: "RediHealth is a healthcare coordination platform that helps people understand their health, find medical assistance, and connect with the healthcare workers who can help.",
    paragraphs: [
      "We built RediHealth to make it easier for people to know what to do next when they have a health concern - whether that means checking symptoms, learning about a condition, or requesting help from a medical professional or mediator.",
      "Our platform combines plain-language health information with tools that connect patients to healthcare workers, track care plans and follow-ups, and give people a simple way to ask for help when they need it most.",
      "RediHealth is not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing a medical emergency, call your local emergency number immediately.",
    ],
  },
  contact: {
    title: "Contact us",
    description: "Have a question about RediHealth, or need help with your account? Reach out and we'll get back to you.",
    enquiries: "General enquiries",
    emergencies: "Medical emergencies",
    emergencyBody: "If you are experiencing a medical emergency, call your local emergency number (e.g. 112) immediately. Do not wait for an email response.",
    helpBefore: "For help requests and medical assistance, use the",
    helpLink: "Get Help",
    helpAfter: "page instead so your request reaches our care team directly.",
  },
  terms: {
    title: "Terms of Use",
    description: "By using RediHealth, you agree to the following terms.",
    sections: [
      { title: "Not a substitute for medical care", body: "RediHealth provides general health information and helps coordinate access to care. It does not provide medical diagnoses and is not a substitute for professional medical advice. In an emergency, call your local emergency number immediately." },
      { title: "Your account", body: "You are responsible for the accuracy of the information you provide and for keeping your account credentials secure." },
      { title: "Acceptable use", body: "You agree not to misuse the platform, including submitting false medical information, attempting to access accounts that are not yours, or interfering with the operation of the service." },
      { title: "Changes", body: "We may update these terms from time to time. Continued use of RediHealth after changes take effect means you accept the updated terms." },
    ],
  },
  privacy: {
    title: "Privacy Notice",
    description: "How RediHealth collects, uses, and protects your information.",
    collectTitle: "Information we collect",
    collectBody: "When you request help, create a patient profile, or sign in, we collect information such as your name, contact details, and the health information you choose to share with us, so that healthcare workers can assist you.",
    useTitle: "How we use it",
    useBody: "Your information is used to coordinate care, contact you about your requests, and improve the services we offer. We do not sell your personal or health information.",
    accessTitle: "Who can see it",
    accessBody: "Health information is only visible to the healthcare workers, mediators, and administrators involved in coordinating your care, and to you through the patient portal.",
    choicesTitle: "Your choices",
    choicesBody: "You can request access to, correction of, or deletion of your information by contacting us at",
    botTitle: "Bot protection",
    botBody: "When bot protection is enabled, we use Google reCAPTCHA to prevent automated abuse of public forms. Google processes technical browser and interaction data for this verification under its Privacy Policy and Terms of Service. Our verification request sends a CAPTCHA token, not your medical information or form content.",
  },
  accessibility: {
    title: "Accessibility",
    description: "RediHealth's commitment to an accessible experience for all users.",
    paragraphs: [
      "We aim to design RediHealth to be compatible with screen readers and keyboard navigation, with sufficient color contrast and clear focus states throughout the site.",
      "Accessibility is an ongoing effort. If you encounter a page or feature that is difficult to use with assistive technology, please let us know so we can improve it.",
    ],
    contact: "to report an accessibility issue or request information in an alternative format.",
  },
};

const romanian: LegalCopy = {
  about: {
    title: "Despre RediHealth",
    description: "RediHealth este o platformă de coordonare a îngrijirii medicale care îi ajută pe oameni să își înțeleagă sănătatea, să găsească asistență medicală și să ia legătura cu personalul medical care îi poate sprijini.",
    paragraphs: [
      "Am creat RediHealth pentru ca oamenilor să le fie mai ușor să afle ce pași pot urma când au o problemă de sănătate, fie că vor să își verifice simptomele, să afle despre o afecțiune sau să solicite ajutorul unui profesionist medical ori al unui mediator sanitar.",
      "Platforma noastră combină informații despre sănătate, explicate pe înțelesul tuturor, cu instrumente care conectează pacienții cu personalul medical, urmăresc planurile de îngrijire și controalele și oferă o modalitate simplă de a cere ajutor atunci când este nevoie.",
      "RediHealth nu înlocuiește sfatul medical de specialitate, diagnosticul sau tratamentul. Dacă te confrunți cu o urgență medicală, sună imediat la numărul local de urgență.",
    ],
  },
  contact: {
    title: "Contactează-ne",
    description: "Ai o întrebare despre RediHealth sau ai nevoie de ajutor cu contul tău? Scrie-ne și îți vom răspunde.",
    enquiries: "Întrebări generale",
    emergencies: "Urgențe medicale",
    emergencyBody: "Dacă te confrunți cu o urgență medicală, sună imediat la numărul local de urgență (de exemplu, 112). Nu aștepta un răspuns prin email.",
    helpBefore: "Pentru solicitări de ajutor și asistență medicală, folosește pagina",
    helpLink: "Solicită ajutor",
    helpAfter: "pentru ca cererea ta să ajungă direct la echipa noastră de îngrijire.",
  },
  terms: {
    title: "Termeni de utilizare",
    description: "Prin utilizarea RediHealth, ești de acord cu următorii termeni.",
    sections: [
      { title: "Nu înlocuiește îngrijirea medicală", body: "RediHealth oferă informații generale despre sănătate și sprijină coordonarea accesului la îngrijire. Platforma nu oferă diagnostice și nu înlocuiește sfatul medical de specialitate. În caz de urgență, sună imediat la numărul local de urgență." },
      { title: "Contul tău", body: "Ești responsabil pentru corectitudinea informațiilor pe care le furnizezi și pentru păstrarea în siguranță a datelor de autentificare ale contului." },
      { title: "Utilizare permisă", body: "Te angajezi să nu folosești platforma în mod abuziv, inclusiv prin transmiterea de informații medicale false, încercarea de a accesa conturi care nu îți aparțin sau perturbarea funcționării serviciului." },
      { title: "Modificări", body: "Putem actualiza acești termeni periodic. Continuarea utilizării RediHealth după intrarea în vigoare a modificărilor înseamnă că accepți termenii actualizați." },
    ],
  },
  privacy: {
    title: "Politica de confidențialitate",
    description: "Află cum colectează, utilizează și protejează RediHealth informațiile tale.",
    collectTitle: "Ce informații colectăm",
    collectBody: "Când soliciți ajutor, creezi un profil de pacient sau te autentifici, colectăm informații precum numele, datele de contact și informațiile medicale pe care alegi să ni le oferi, pentru ca personalul medical să te poată sprijini.",
    useTitle: "Cum folosim informațiile",
    useBody: "Folosim informațiile pentru a coordona îngrijirea, pentru a te contacta în legătură cu solicitările tale și pentru a îmbunătăți serviciile oferite. Nu vindem datele tale personale sau medicale.",
    accessTitle: "Cine poate vedea informațiile",
    accessBody: "Informațiile medicale sunt vizibile doar personalului medical, mediatorilor și administratorilor implicați în coordonarea îngrijirii tale și ție, prin portalul pacientului.",
    choicesTitle: "Drepturile și opțiunile tale",
    choicesBody: "Poți solicita accesul la informațiile tale, corectarea sau ștergerea acestora, contactându-ne la",
    botTitle: "Protecție anti-boți",
    botBody: "Când protecția anti-boți este activată, folosim Google reCAPTCHA pentru a preveni abuzul automat asupra formularelor publice. Google prelucrează date tehnice despre browser și interacțiuni pentru această verificare, conform Politicii de confidențialitate și Termenilor serviciului său. Cererea noastră de verificare transmite un token CAPTCHA, nu informațiile medicale sau conținutul formularului.",
  },
  accessibility: {
    title: "Accesibilitate",
    description: "Angajamentul RediHealth de a oferi o experiență accesibilă tuturor.",
    paragraphs: [
      "Ne propunem ca RediHealth să funcționeze cu cititoare de ecran și navigare cu tastatura, să ofere contrast suficient între culori și indicatori vizibili pentru elementul selectat.",
      "Îmbunătățirea accesibilității este un proces continuu. Dacă întâmpini dificultăți la utilizarea unei pagini sau funcții cu tehnologiile asistive, spune-ne, ca să o putem îmbunătăți.",
    ],
    contact: "pentru a raporta o problemă de accesibilitate sau pentru a solicita informații într-un format alternativ.",
  },
};

export function getLegalCopy(lang: Lang): LegalCopy {
  return lang === "ro" ? romanian : english;
}
