import type { Lang } from "@/lib/i18n/translations";

/** Interface copy for the health check that is not in health-check-translations (all 4 languages). */
export type Copy = {
  chosen: string;
  confirmReset: string;
  confirmYes: string;
  confirmNo: string;
  pickArea: string;
  pickSymptom: string;
  pickBoth: string;
  orList: string;
  area: string;
  change: string;
  left: string;
  right: string;
  doctorTitle: string;
  doctorBody: string;
  doctorBook: string;
  doctorNow: string;
  readAbout: string;
  selfCare: string;
  meaning: string;
  summaryFold: string;
  forWhom: string;
  forSelf: string;
  forChild: string;
  childNote: string;
  childRow: string;
  otherTitle: string;
  otherDescription: string;
  otherBody: string;
  otherAssistant: string;
  otherDoctor: string;
  alsoFeel: string;
  alsoFeelHint: string;
  listen: string;
  stopListening: string;
  largeText: string;
};

export const COPY: Record<Lang, Copy> = {
  ro: {
    chosen: "Ai ales",
    confirmReset: "Ștergi răspunsurile?",
    confirmYes: "Da, de la capăt",
    confirmNo: "Nu",
    pickArea: "Alege o zonă",
    pickSymptom: "Alege un simptom",
    pickBoth: "Alege cât de tare și de când",
    orList: "Sau alege din listă",
    area: "Zona",
    change: "Schimbă",
    left: "stânga",
    right: "dreapta",
    doctorTitle: "Vorbește cu un medic",
    doctorBody: "Gratuit, cu un medic voluntar, prin video sau telefon.",
    doctorBook: "Programează",
    doctorNow: "Medic de gardă acum",
    readAbout: "Citește mai mult",
    selfCare: "Acasă, poți încerca",
    meaning: "Ce poate însemna",
    summaryFold: "Rezumat pentru medic",
    forWhom: "Pentru cine verifici?",
    forSelf: "Pentru mine",
    forChild: "Pentru un copil",
    childNote:
      "La copii, sfaturile pentru acasă nu se potrivesc mereu. Nu aștepta. Sună medicul de familie sau pediatrul.",
    childRow: "Pentru un copil",
    otherTitle: "Altceva sau nu știu",
    otherDescription: "Nimic de aici nu se potrivește.",
    otherBody: "Spune-ne cu cuvintele tale sau vorbește cu un medic.",
    otherAssistant: "Scrie asistentului",
    otherDoctor: "Vorbește cu un medic",
    alsoFeel: "Mai ai și",
    alsoFeelHint: "Opțional. Bifează tot ce ai.",
    listen: "Ascultă",
    stopListening: "Oprește",
    largeText: "Text mai mare",
  },
  en: {
    chosen: "Selected",
    confirmReset: "Clear your answers?",
    confirmYes: "Yes, start over",
    confirmNo: "No",
    pickArea: "Choose an area",
    pickSymptom: "Choose a symptom",
    pickBoth: "Choose how bad and how long",
    orList: "Or choose from the list",
    area: "Area",
    change: "Change",
    left: "left",
    right: "right",
    doctorTitle: "Talk to a doctor",
    doctorBody: "Free, with a volunteer doctor, by video or phone.",
    doctorBook: "Book a call",
    doctorNow: "Doctor on call now",
    readAbout: "Read more",
    selfCare: "At home, you can try",
    meaning: "What it may mean",
    summaryFold: "Summary for the doctor",
    forWhom: "Who is this for?",
    forSelf: "For me",
    forChild: "For a child",
    childNote: "For children, home advice doesn't always fit. Don't wait. Call your family doctor or paediatrician.",
    childRow: "For a child",
    otherTitle: "Something else, or not sure",
    otherDescription: "Nothing here fits.",
    otherBody: "Tell us in your own words or talk to a doctor.",
    otherAssistant: "Write to the assistant",
    otherDoctor: "Talk to a doctor",
    alsoFeel: "Do you also have",
    alsoFeelHint: "Optional. Tick everything you have.",
    listen: "Listen",
    stopListening: "Stop",
    largeText: "Larger text",
  },
  sq: {
    chosen: "Zgjodhe",
    confirmReset: "Do t'i fshish përgjigjet?",
    confirmYes: "Po, nga e para",
    confirmNo: "Jo",
    pickArea: "Zgjidh një zonë",
    pickSymptom: "Zgjidh një simptomë",
    pickBoth: "Zgjidh sa fort dhe që kur",
    orList: "Ose zgjidh nga lista",
    area: "Zona",
    change: "Ndrysho",
    left: "majtas",
    right: "djathtas",
    doctorTitle: "Fol me një mjek",
    doctorBody: "Falas, me një mjek vullnetar, me video ose telefon.",
    doctorBook: "Rezervo",
    doctorNow: "Mjeku kujdestar tani",
    readAbout: "Lexo më shumë",
    selfCare: "Në shtëpi, mund të provosh",
    meaning: "Çfarë mund të jetë",
    summaryFold: "Përmbledhje për mjekun",
    forWhom: "Për kë po kontrollon?",
    forSelf: "Për mua",
    forChild: "Për një fëmijë",
    childNote:
      "Për fëmijët, këshillat për në shtëpi nuk vlejnë gjithmonë. Mos prit. Telefono mjekun e familjes ose pediatrin.",
    childRow: "Për një fëmijë",
    otherTitle: "Diçka tjetër ose nuk e di",
    otherDescription: "Asgjë këtu nuk më përshtatet.",
    otherBody: "Na e thuaj me fjalët e tua ose fol me një mjek.",
    otherAssistant: "Shkruaji asistentit",
    otherDoctor: "Fol me një mjek",
    alsoFeel: "Ke edhe",
    alsoFeelHint: "Opsionale. Shëno gjithçka që ke.",
    listen: "Dëgjo",
    stopListening: "Ndalo",
    largeText: "Tekst më i madh",
  },
  it: {
    chosen: "Hai scelto",
    confirmReset: "Vuoi cancellare le risposte?",
    confirmYes: "Sì, ricomincia",
    confirmNo: "No",
    pickArea: "Scegli una zona",
    pickSymptom: "Scegli un sintomo",
    pickBoth: "Scegli intensità e durata",
    orList: "Oppure scegli dall'elenco",
    area: "Zona",
    change: "Cambia",
    left: "sinistra",
    right: "destra",
    doctorTitle: "Parla con un medico",
    doctorBody: "Gratis, con un medico volontario, in video o al telefono.",
    doctorBook: "Prenota",
    doctorNow: "Medico di guardia ora",
    readAbout: "Leggi di più",
    selfCare: "A casa puoi provare",
    meaning: "Cosa può significare",
    summaryFold: "Riepilogo per il medico",
    forWhom: "Per chi è il controllo?",
    forSelf: "Per me",
    forChild: "Per un bambino",
    childNote:
      "Per i bambini i consigli per casa non vanno sempre bene. Non aspettare. Chiama il medico di famiglia o il pediatra.",
    childRow: "Per un bambino",
    otherTitle: "Altro, o non so",
    otherDescription: "Nessuna di queste descrizioni va bene.",
    otherBody: "Raccontalo con parole tue o parla con un medico.",
    otherAssistant: "Scrivi all'assistente",
    otherDoctor: "Parla con un medico",
    alsoFeel: "Hai anche",
    alsoFeelHint: "Facoltativo. Spunta tutto quello che hai.",
    listen: "Ascolta",
    stopListening: "Ferma",
    largeText: "Testo più grande",
  },
};
