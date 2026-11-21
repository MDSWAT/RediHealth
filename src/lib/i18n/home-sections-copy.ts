import type { Lang } from "@/lib/i18n/translations";

/**
 * Copy for the service sections of the homepage.
 * Wording reflects realistic health mediator scope across all 7 languages.
 * Every locale defines every key; strict sentence case, no ampersands.
 */

export type HomeStep = { title: string; text: string };

export type HomeSectionsCopy = {
  doctor: {
    title: string;
    lead: string;
    /** Live line under the lead, from the Bucharest on-call hours. Plain text, no dot. */
    onDuty: string;
    offDuty: string;
    steps: [HomeStep, HomeStep, HomeStep];
    talkNow: string;
    book: string;
    /** The note laid over the photo. */
    teamTitle: string;
    teamText: string;
  };
  mediators: {
    title: string;
    /** Second sentence of the heading, set quieter. */
    titleQuiet: string;
    lead: string;
    services: [HomeStep, HomeStep, HomeStep];
    /** Three plain facts, separated by hairlines. */
    facts: [string, string, string];
    ask: string;
    more: string;
  };
};

export const homeSectionsCopy: Record<Lang, HomeSectionsCopy> = {
  en: {
    doctor: {
      title: "Talk to a doctor from home",
      lead: "A free call with a licensed doctor, every day from 08:00 to 20:00. No card, app or account needed.",
      onDuty: "The on-call doctor is available now.",
      offDuty: "The waiting room opens at 08:00. You can book a call now.",
      steps: [
        { title: "Choose when to talk", text: "Talk to the on-call doctor now or book a time that suits you." },
        { title: "Get a link by SMS", text: "Tap the link. The call opens in your browser." },
        { title: "Get the advice in writing", text: "After the call, the doctor sends your next steps by SMS." },
      ],
      talkNow: "Talk to a doctor",
      book: "Book a call",
      teamTitle: "Licensed doctors",
      teamText: "Family doctors, paediatricians and internists who volunteer. Calls are encrypted.",
    },
    mediators: {
      title: "Support from a health mediator.",
      titleQuiet: "Trusted help to reach healthcare services.",
      lead: "They help you understand where to go, prepare papers, and contact health or social services, while keeping what you share private.",
      services: [
        {
          title: "Registration and appointments",
          text: "They help you find a family doctor, book visits, and prepare your questions for the clinic.",
        },
        {
          title: "Documents and health insurance",
          text: "They guide you through the identity papers and insurance steps needed for your family.",
        },
        {
          title: "Local health and social support",
          text: "They connect you with community nurses, clinics, and local social services when available.",
        },
      ],
      facts: ["Never asks for money", "Keeps it private", "Helps the whole family"],
      ask: "Ask a mediator",
      more: "How mediators help",
    },
  },
  ro: {
    doctor: {
      title: "Vorbește cu un medic de acasă",
      lead: "Un apel gratuit cu un medic cu drept de practică, zilnic între 08:00 și 20:00. Fără card, aplicație sau cont.",
      onDuty: "Medicul de gardă e disponibil acum.",
      offDuty: "Sala de așteptare se deschide la 08:00. Poți programa un apel acum.",
      steps: [
        { title: "Alegi când vorbești", text: "Intri acum la medicul de gardă sau îți alegi o oră potrivită." },
        { title: "Primești un link prin SMS", text: "Apeși pe link. Apelul se deschide în browser." },
        { title: "Primești sfaturile în scris", text: "După apel, medicul îți trimite prin SMS ce ai de făcut." },
      ],
      talkNow: "Vorbește cu un medic",
      book: "Programează un apel",
      teamTitle: "Medici cu drept de practică",
      teamText: "Medici de familie, pediatri și interniști voluntari. Apelurile sunt criptate.",
    },
    mediators: {
      title: "Sprijin de la un mediator sanitar.",
      titleQuiet: "Ajutor de încredere să ajungi la servicii medicale.",
      lead: "Te ajută să știi unde să mergi, ce acte să pregătești și cum să iei legătura cu serviciile medicale sau sociale, păstrând confidențialitatea.",
      services: [
        {
          title: "Înscriere și programări",
          text: "Te ajută să găsești un medic de familie, să faci programări și să îți pregătești întrebările pentru cabinet.",
        },
        {
          title: "Acte și asigurare medicală",
          text: "Te ghidează ce documente de identitate și pași pentru asigurarea CNAS sunt necesari pentru familie.",
        },
        {
          title: "Legătura cu îngrijirea locală",
          text: "Te pune în legătura cu asistenți comunitari, clinici și servicii sociale locale, acolo unde există.",
        },
      ],
      facts: ["Nu îți cere bani", "Păstrează secretul", "Ajută toată familia"],
      ask: "Cere un mediator",
      more: "Cum te ajută mediatorii",
    },
  },
  sq: {
    doctor: {
      title: "Fol me një mjek nga shtëpia",
      lead: "Një thirrje falas me një mjek me licencë, çdo ditë nga 08:00 deri në 20:00. Pa kartë, aplikacion apo llogari.",
      onDuty: "Mjeku kujdestar është në dispozicion tani.",
      offDuty: "Dhoma e pritjes hapet në 08:00. Mund të rezervosh një thirrje tani.",
      steps: [
        { title: "Zgjidh kur flet", text: "Fol tani me mjekun kujdestar ose zgjidh një orar që të përshtatet." },
        { title: "Merr një lidhje me SMS", text: "Shtyp lidhjen. Thirrja hapet në shfletues." },
        { title: "Merr këshillat me shkrim", text: "Pas thirrjes, mjeku të dërgon hapat e radhës me SMS." },
      ],
      talkNow: "Fol me një mjek",
      book: "Rezervo një thirrje",
      teamTitle: "Mjekë me licencë",
      teamText: "Mjekë familjeje, pediatër dhe internistë vullnetarë. Thirrjet janë të enkriptuara.",
    },
    mediators: {
      title: "Mbështetje nga një mediator shëndetësor.",
      titleQuiet: "Ndihmë e besueshme për të arritur shërbimet shëndetësore.",
      lead: "Të ndihmon të dish ku të shkosh, çfarë dokumentesh të përgatitësh dhe si të lidhesh me shërbimet shëndetësore ose sociale, duke ruajtur privatësinë.",
      services: [
        {
          title: "Regjistrimi dhe takimet",
          text: "Të ndihmon të gjesh një mjek familjeje, të caktosh takime dhe të përgatitësh pyetjet për klinikën.",
        },
        {
          title: "Dokumentet dhe sigurimi",
          text: "Të udhëzon për dokumentet e identitetit dhe hapat e sigurimit shëndetësor për familjen.",
        },
        {
          title: "Lidhja me kujdesin lokal",
          text: "Të lidh me infermierë të komunitetit, klinika dhe shërbime sociale vendore kur janë të disponueshme.",
        },
      ],
      facts: ["Nuk të kërkon para", "Ruan sekretin", "Ndihmon gjithë familjen"],
      ask: "Kërko një mediator",
      more: "Si ndihmojnë mediatorët",
    },
  },
  it: {
    doctor: {
      title: "Parla con un medico da casa",
      lead: "Una chiamata gratuita con un medico abilitato, ogni giorno dalle 08:00 alle 20:00. Senza tessera, app o account.",
      onDuty: "Il medico di guardia è disponibile ora.",
      offDuty: "La sala d'attesa apre alle 08:00. Puoi già prenotare una chiamata.",
      steps: [
        { title: "Scegli quando parlare", text: "Parla subito con il medico di guardia o prenota un orario che ti va bene." },
        { title: "Ricevi un link via SMS", text: "Tocca il link. La chiamata si apre nel browser." },
        { title: "Ricevi i consigli per iscritto", text: "Dopo la chiamata, il medico ti manda via SMS cosa fare." },
      ],
      talkNow: "Parla con un medico",
      book: "Prenota una chiamata",
      teamTitle: "Medici abilitati",
      teamText: "Medici di famiglia, pediatri e internisti volontari. Le chiamate sono criptate.",
    },
    mediators: {
      title: "Supporto da un mediatore sanitario.",
      titleQuiet: "Aiuto affidabile per accedere alle cure.",
      lead: "Ti aiuta a capire dove andare, quali documenti preparare e come contattare i servizi sanitari o sociali, rispettando la tua privacy.",
      services: [
        {
          title: "Iscrizione e appuntamenti",
          text: "Ti aiuta a trovare un medico di famiglia, prenotare visite e preparare le domande per la clinica.",
        },
        {
          title: "Documenti e tessera sanitaria",
          text: "Ti orienta sui documenti d'identità e sui passaggi per l'assistenza sanitaria della famiglia.",
        },
        {
          title: "Collegamento con i servizi locali",
          text: "Ti mette in contatto con infermieri di comunità, ambulatori e servizi sociali locali quando disponibili.",
        },
      ],
      facts: ["Non ti chiede soldi", "Mantiene il segreto", "Aiuta tutta la famiglia"],
      ask: "Chiedi un mediatore",
      more: "Come ti aiutano i mediatori",
    },
  },
  hr: {
    doctor: {
      title: "Razgovaraj s liječnikom od kuće",
      lead: "Besplatan poziv s licenciranim liječnikom, svaki dan od 08:00 do 20:00. Bez iskaznice, aplikacije ili računa.",
      onDuty: "Dežurni liječnik je dostupan sada.",
      offDuty: "Čekaonica se otvara u 08:00. Poziv možeš rezervirati već sada.",
      steps: [
        { title: "Odaberi kada želiš razgovarati", text: "Javi se odmah dežurnom liječniku ili rezerviraj termin koji ti odgovara." },
        { title: "Primi poveznicu SMS porukom", text: "Dodirni poveznicu. Poziv se otvara u tvojem pregledniku." },
        { title: "Primi pisane upute", text: "Nakon poziva liječnik ti SMS porukom šalje upute što dalje." },
      ],
      talkNow: "Razgovaraj s liječnikom",
      book: "Rezerviraj poziv",
      teamTitle: "Licencirani liječnici",
      teamText: "Obiteljski liječnici, pedijatri i internisti volonteri. Pozivi su šifrirani.",
    },
    mediators: {
      title: "Podrška zdravstvenog medijatora.",
      titleQuiet: "Pouzdana pomoć na putu do zdravstvene skrbi.",
      lead: "Pomaže ti saznati kamo ići, koje dokumente pripremiti i kako kontaktirati zdravstvene ili socijalne službe, uz čuvanje privatnosti.",
      services: [
        {
          title: "Upis i naručivanje",
          text: "Pomaže ti pronaći obiteljskog liječnika, dogovoriti termine i pripremiti pitanja za pregled.",
        },
        {
          title: "Dokumenti i zdravstveno osiguranje",
          text: "Upućuje te koji su osobni dokumenti i koraci za zdravstveno osiguranje potrebni za obitelj.",
        },
        {
          title: "Povezivanje s lokalnom skrbi",
          text: "Povezuje te s patronažnim sestrama, ambulantama i lokalnim socijalnim službama kada su dostupne.",
        },
      ],
      facts: ["Ne traži novac", "Čuva tajnu", "Pomaže cijeloj obitelji"],
      ask: "Zatraži medijatora",
      more: "Kako pomažu medijatori",
    },
  },
  rom: {
    doctor: {
      title: "De svato ekhe doktoresa katar khere",
      lead: "Jekh bi lovesko svato ekhe doktoresa licenciyasa, sako dives katar 08:00 zhi ko 20:00. Bi kartako, aplikaciyako vay kontosko.",
      onDuty: "O doktori kay si pe buchi si kathe akana.",
      offDuty: "E azhukeripnaski soba putrel pes ko 08:00. Shaj alosares vrama akana.",
      steps: [
        { title: "Alosar kana kames te des svato", text: "De svato akana e doktoresa kay si pe buchi vay alosar vrama kay avel tuke mishto." },
        { title: "Le ekh linko katar SMS", text: "Azba o linko. O svato putrel pes and-o brauzero." },
        { title: "Le e sikavimata lekhavde", text: "Palo svato, o doktori bichhalel tuke katar SMS so te keres may dur." },
      ],
      talkNow: "De svato e doktoresa",
      book: "Alosar vrama",
      teamTitle: "Doktorya licenciyasa",
      teamText: "Familiyake doktorya, chhavorenge doktorya thaj interniste, bi lovesko. E svaturya si garavde.",
    },
    mediators: {
      title: "Zhutimos katar ekh sastipnasko mediatori.",
      titleQuiet: "Pachivalo zhutimos te areses ko sastipnaske servisurya.",
      lead: "Zhutil tut te zhanes kay te zhas, save lila te keres thaj sar te akhares e sastipnaske vay socialone servisurya, garavindoy so phenes.",
      services: [
        {
          title: "Lekhavipe thaj vrame",
          text: "Zhutil tut te arakhes familiyako doktori, te keres vrama thaj te lashares che phuchimata.",
        },
        {
          title: "Lila thaj siguranciya",
          text: "Sikavel tut save lila thaj pasha trubun vash sastipnaski siguranciya chi familiyake.",
        },
        {
          title: "Phandipe lokalne zhutipnasa",
          text: "Phandel tut komunitetake asistentenca, klinikenca thaj socialone servisurenca kana si kathe.",
        },
      ],
      facts: ["Na mangel tutar love", "Garavel so phenes", "Zhutil sasti familiya"],
      ask: "Mang ekhe mediatore",
      more: "Sar zhutin e mediatorya",
    },
  },
  ru: {
    doctor: {
      title: "Поговорите с врачом из дома",
      lead: "Бесплатный звонок лицензированному врачу, каждый день с 08:00 до 20:00. Без полиса, приложения и аккаунта.",
      onDuty: "Дежурный врач доступен сейчас.",
      offDuty: "Зал ожидания открывается в 08:00. Записаться на звонок можно уже сейчас.",
      steps: [
        { title: "Выберите время звонка", text: "Поговорите с дежурным врачом сейчас или запишитесь на удобное время." },
        { title: "Получите ссылку по SMS", text: "Нажмите на ссылку, и звонок откроется в браузере." },
        { title: "Получите советы письменно", text: "После звонка врач пришлёт рекомендации по SMS." },
      ],
      talkNow: "Поговорить с врачом",
      book: "Записаться на звонок",
      teamTitle: "Лицензированные врачи",
      teamText: "Семейные врачи, педиатры и терапевты-волонтёры. Звонки шифруются.",
    },
    mediators: {
      title: "Поддержка медицинского медиатора.",
      titleQuiet: "Надёжная помощь на пути к медицинской помощи.",
      lead: "Помогает понять, куда обратиться, какие документы подготовить и как связаться с медицинскими или социальными службами, сохраняя конфиденциальность.",
      services: [
        {
          title: "Запись и прикрепление",
          text: "Помогает найти семейного врача, записаться на приём и подготовить вопросы для клиники.",
        },
        {
          title: "Документы и страховка",
          text: "Подсказывает, какие документы и шаги для медицинской страховки нужны вашей семье.",
        },
        {
          title: "Связь с местной помощью",
          text: "Связывает с общинными медсёстрами, клиниками и социальными службами там, где они работают.",
        },
      ],
      facts: ["Не просит денег", "Хранит тайну", "Помогает всей семье"],
      ask: "Обратиться к медиатору",
      more: "Как помогают медиаторы",
    },
  },
};
