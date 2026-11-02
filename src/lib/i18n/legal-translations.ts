import type { Lang } from "@/lib/i18n/translations";

type LegalCopy = {
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
  };
  accessibility: {
    title: string;
    description: string;
    paragraphs: string[];
    contact: string;
  };
};

const english: LegalCopy = {
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
