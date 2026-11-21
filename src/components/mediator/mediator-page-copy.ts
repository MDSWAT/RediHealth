import type { Lang } from "@/lib/i18n/translations";

/** Meta description of /mediatori in each language. */
export const mediatorPageDescriptions: Record<Lang, string> = {
  ru: "Медицинские медиаторы RediHealth помогут вам записаться к семейному врачу, разобраться с документами и найти местные службы здравоохранения.",
  ro: "Mediatorii sanitari RediHealth te ajută să te înscrii la medicul de familie, să pregătești actele de asigurare și să găsești serviciile de sănătate din zona ta.",
  en: "RediHealth health mediators help you register with a family doctor, sort out paperwork and insurance steps, and connect with local health services.",
  sq: "Mediatorët shëndetësorë të RediHealth të ndihmojnë të regjistrohesh te mjeku i familjes, të rregullosh dokumentet dhe të lidhesh me shërbimet lokale.",
  it: "I mediatori sanitari di RediHealth ti aiutano a iscriverti dal medico di famiglia, a orientarti con documenti e tessera sanitaria e a trovare i servizi locali.",
  hr: "Zdravstveni medijatori RediHealth pomažu ti upisati se kod obiteljskog liječnika, pripremiti dokumente za osiguranje i povezati se s lokalnim službama.",
  rom: "E sastipnaske mediatorya RediHealth ažutin tut te lekhaves tut ko familiyako doktori, te lačhares che lila thaj te arakhes e thaneske službe.",
};

type MediatorPageCopy = { whoIsTitle: string; whoIsDesc: string; bullets: string[] };

/** "Who the health mediator is", below the callback form on /mediatori. */
export const mediatorPageCopy: Record<Lang, MediatorPageCopy> = {
  ru: {
    whoIsTitle: "Кто такой медицинский медиатор",
    whoIsDesc:
      "Медиатор по вопросам здоровья – это обученный специалист, связывающий жителей со службами здравоохранения, семейными врачами, органами социальной защиты и местной администрацией. При наличии говорит на языках сообщества и хранит ваши данные в тайне.",
    bullets: [
      "Хранит ваши личные и контактные данные в тайне",
      "Никогда не просит у вас денег или услуг",
      "Помогает с административными шагами без медицинских назначений",
      "Сотрудничает с семейными врачами и участковыми медсестрами",
    ],
  },
  ro: {
    whoIsTitle: "Cine este mediatorul sanitar",
    whoIsDesc:
      "Mediatorul sanitar este o persoană pregătită care face legătura între comunitate și serviciile de sănătate. Te ajută cu pașii administrativi pentru medicul de familie, primărie și asistența socială, vorbește limbile comunității acolo unde este posibil și respectă confidențialitatea datelor tale.",
    bullets: [
      "Păstrează confidențialitatea datelor tale personale",
      "Nu îți cere niciodată bani sau alte foloase",
      "Te ghidează cu actele și programările, fără să dea sfaturi medicale",
      "Colaborează cu asistenții comunitari și medicii de familie",
    ],
  },
  en: {
    whoIsTitle: "Who the health mediator is",
    whoIsDesc:
      "A health mediator is a trained link between local communities and health services. They guide administrative steps with family doctors, town halls, and social services, speak community languages where available, and keep your details confidential.",
    bullets: [
      "Keeps your personal and contact details confidential",
      "Never asks you for money or favours",
      "Helps with paperwork and bookings without giving medical advice",
      "Works alongside community nurses and family doctors",
    ],
  },
  sq: {
    whoIsTitle: "Kush është mediatori shëndetësor",
    whoIsDesc:
      "Mediatori shëndetësor është një person i trajnuar që lidh komunitetin me shërbimet shëndetësore. Të ndihmon me hapat administrativë për mjekun e familjes, bashkinë dhe shërbimet sociale, flet gjuhët e komunitetit kur është e mundur dhe ruan privatësinë tënde.",
    bullets: [
      "Ruan konfidencialitetin e të dhënave të tua personale",
      "Nuk të kërkon kurrë para apo favore",
      "Të orienton me dokumentet dhe takimet, pa dhënë këshilla mjekësore",
      "Bashkëpunon me infermierët e komunitetit dhe mjekët e familjes",
    ],
  },
  it: {
    whoIsTitle: "Chi è il mediatore sanitario",
    whoIsDesc:
      "Il mediatore sanitario è una figura formata che collega comunità e servizi sanitari. Ti orienta nei passaggi amministrativi con medico di famiglia, comune e servizi sociali, parla le lingue della comunità quando disponibile e tutela la tua riservatezza.",
    bullets: [
      "Mantiene riservati i tuoi dati personali",
      "Non ti chiede mai denaro o favori",
      "Ti aiuta con documenti e prenotazioni senza dare pareri clinici",
      "Collabora con infermieri di comunità e medici di famiglia",
    ],
  },
  hr: {
    whoIsTitle: "Tko je zdravstveni medijator",
    whoIsDesc:
      "Zdravstveni medijator je educirana osoba koja povezuje zajednicu i zdravstvene službe. Pomaže u administrativnim koracima kod obiteljskog liječnika, općine i socijalne službe, govori jezike zajednice kada je to dostupno i čuva povjerljivost tvojih podataka.",
    bullets: [
      "Čuva povjerljivost tvojih osobnih podataka",
      "Nikada od tebe ne traži novac ni protuusluge",
      "Pomaže oko papira i naručivanja bez davanja liječničkih savjeta",
      "Surađuje s patronažnim sestrama i obiteljskim liječnicima",
    ],
  },
  rom: {
    whoIsTitle: "Kon si o sastipnasko mediatori",
    whoIsDesc:
      "O sastipnasko mediatori si sikavdo manuš kaj phandel e komuniteta e sastipnaske službenca. Ažutil tut e administrativne pasenca ko familiyako doktori, primariya thaj sociyalno ažutipen, vakerel e komunitetake čhibya kana šaj, thaj garavel cho privatnost.",
    bullets: [
      "Arakhel o garavipe e che personale datengo",
      "Šoha na mangel tutar love vaj aver mishtimata",
      "Ažutil e lilensa thaj vramenca bi te del doktoresko sfato",
      "Kerel buchi khetane e asistentenca thaj e familiyake doktorenca",
    ],
  },
};

export type MediatorTimelineStep = {
  title: string;
  body: string;
};

export type MediatorTimelineCopy = {
  title: string;
  lead: string;
  steps: [MediatorTimelineStep, MediatorTimelineStep, MediatorTimelineStep];
};

/** 3-step explanation shown below the callback form on /mediatori. */
export const mediatorTimelineCopy: Record<Lang, MediatorTimelineCopy> = {
  ro: {
    title: "Cum funcționează sprijinul",
    lead: "După ce lași datele tale mai sus, echipa locală verifică cine te poate suna.",
    steps: [
      {
        title: "Ne lași județul și telefonul",
        body: "Completezi rapid formularul de mai sus, fără cont și fără documente pregătite.",
      },
      {
        title: "Te sună un mediator sau coordonator local",
        body: "Ascultă de ce sprijin administrativ ai nevoie și îți spune ce servicii sunt disponibile în zona ta.",
      },
      {
        title: "Primești ajutor concret pentru pașii următori",
        body: "Te ghidează la înscrierea la medicul de familie, pregătirea actelor CNAS sau programări, și te poate însoți când există disponibil local.",
      },
    ],
  },
  en: {
    title: "How mediator support works",
    lead: "Once you send the form above, a local team sees your request and calls you back.",
    steps: [
      {
        title: "Leave your county and phone number",
        body: "Fill in the short form above. You do not need an account or papers ready.",
      },
      {
        title: "A local team contacts you",
        body: "A mediator or local coordinator listens calmly to your practical needs and explains what help is available nearby.",
      },
      {
        title: "Guidance for the next steps",
        body: "They help you prepare ID or insurance documents and book family doctor visits, or join an appointment when locally available.",
      },
    ],
  },
  sq: {
    title: "Si funksionon mbështetja",
    lead: "Pasi të dërgosh formularin më lart, ekipi lokal e sheh kërkesën dhe të merr në telefon.",
    steps: [
      {
        title: "Lë qarkun dhe numrin e telefonit",
        body: "Plotëso formularin e shkurtër më lart, pa llogari dhe pa dokumente gati.",
      },
      {
        title: "Të kontakton ekipi lokal",
        body: "Një mediator ose koordinator dëgjon me qetësi nevojat e tua praktike dhe të tregon çfarë ndihme ka në zonën tënde.",
      },
      {
        title: "Udhëzim praktik për hapat e radhës",
        body: "Të ndihmon të përgatitësh dokumentet për sigurimin dhe takimet te mjeku i familjes, ose të shoqëron kur është e mundur në zonë.",
      },
    ],
  },
  it: {
    title: "Come funziona il supporto",
    lead: "Dopo aver inviato il modulo qui sopra, il team locale riceve la richiesta e ti richiama.",
    steps: [
      {
        title: "Lasci provincia e numero di telefono",
        body: "Compila il modulo breve qui sopra, senza account e senza documenti pronti.",
      },
      {
        title: "Ti contatta un riferimento locale",
        body: "Un mediatore ascolta le tue esigenze pratiche e ti spiega quali servizi sono disponibili nella tua zona.",
      },
      {
        title: "Aiuto pratico per i prossimi passi",
        body: "Ti aiuta a preparare documenti o tessera sanitaria e a prenotare dal medico di famiglia, con accompagnamento quando disponibile localmente.",
      },
    ],
  },
  hr: {
    title: "Kako podrška funkcionira",
    lead: "Nakon što pošalješ obrazac iznad, lokalni tim vidi tvoj zahtjev i zove te natrag.",
    steps: [
      {
        title: "Ostaviš okrug i broj telefona",
        body: "Ispuni kratki obrazac iznad, bez računa i bez pripremljenih papira.",
      },
      {
        title: "Javlja ti se lokalni tim",
        body: "Medijator sluša koje su ti praktične potrebe i objašnjava koja je pomoć dostupna u tvom kraju.",
      },
      {
        title: "Praktična pomoć za sljedeće korake",
        body: "Pomaže ti pripremiti dokumente za osiguranje i naručiti se kod obiteljskog liječnika, uz pratnju kada je to lokalno dostupno.",
      },
    ],
  },
  rom: {
    title: "Sar kerel buchi o ažutipen",
    lead: "Pala so bičhales o formularo opre, e lokalno ekipa dikhel o mangipen thaj akharel tut.",
    steps: [
      {
        title: "Mukhes chi rig thaj o telefono",
        body: "Lekhav ando xarno formularo opre, bi kontosko thaj bi lila getome.",
      },
      {
        title: "Akharel tut lokalno mediatori",
        body: "Ašunel tut lokhes thaj phenel tuke savo praktikano ažutipen si paše tute.",
      },
      {
        title: "Praktikano ažutipen ko anglune pasora",
        body: "Ažutil tut te lačhares lila vaš e siguranciya thaj te keres vrama ko doktori, vaj džal tusa kana si thanesko ažutipen.",
      },
    ],
  },
  ru: {
    title: "Как устроена поддержка",
    lead: "После отправки формы выше местная команда увидит заявку и свяжется с вами.",
    steps: [
      {
        title: "Оставьте округ и номер телефона",
        body: "Заполните короткую форму выше, без регистрации и готовых справок.",
      },
      {
        title: "С вами свяжется местная команда",
        body: "Медиатор спокойно выслушает, какая практическая помощь вам нужна, и расскажет о доступных возможностях рядом.",
      },
      {
        title: "Практическая помощь с шагами",
        body: "Поможет подготовить документы для страховки и записаться к семейному врачу или сопроводит на приём при наличии такой возможности на месте.",
      },
    ],
  },
};

export type MediatorStaffStripCopy = {
  regionLabel: string;
  prompt: string;
  signIn: string;
};

/** Quiet bottom strip for community health mediator staff sign-in, below patient actions. */
export const mediatorStaffStripCopy: Record<Lang, MediatorStaffStripCopy> = {
  ro: {
    regionLabel: "Acces pentru mediatori sanitari",
    prompt: "Lucrezi ca mediator sanitar în comunitate?",
    signIn: "Intră în contul de mediator",
  },
  en: {
    regionLabel: "Community health mediator access",
    prompt: "Are you a community health mediator?",
    signIn: "Mediator sign-in",
  },
  sq: {
    regionLabel: "Qasje për mediatorët shëndetësorë",
    prompt: "Punon si mediator shëndetësor në komunitet?",
    signIn: "Hyr si mediator",
  },
  it: {
    regionLabel: "Accesso per mediatori sanitari",
    prompt: "Lavori come mediatore sanitario nella comunità?",
    signIn: "Accesso mediatori",
  },
  hr: {
    regionLabel: "Pristup za zdravstvene medijatore",
    prompt: "Radiš kao zdravstveni medijator u zajednici?",
    signIn: "Prijava za medijatore",
  },
  rom: {
    regionLabel: "Dinipe vash sastipnaske mediatorya",
    prompt: "Keres buchi sar sastipnasko mediatori and-i komuniteta?",
    signIn: "Khuves andre sar mediatori",
  },
  ru: {
    regionLabel: "Вход для медицинских медиаторов",
    prompt: "Вы работаете медицинским медиатором?",
    signIn: "Вход для медиаторов",
  },
};
