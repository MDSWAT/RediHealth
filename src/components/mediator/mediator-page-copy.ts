import type { Lang } from "@/lib/i18n/translations";

/** Meta description of /mediatori in each language. */
export const mediatorPageDescriptions: Record<Lang, string> = {
  ru: "Медицинские медиаторы RediHealth помогут вам записаться к врачу, разобраться с документами и поговорить с врачом по телефону из дома.",

  ro: "Mediatorii sanitari RediHealth te ajută să te înscrii la medic, să faci actele și să vorbești cu un medic la telefon, de acasă.",
  en: "RediHealth health mediators help you register with a doctor, sort out documents and talk to a doctor by phone from home.",
  sq: "Mediatorët shëndetësorë të RediHealth të ndihmojnë të regjistrohesh te mjeku, të rregullosh dokumentet dhe të flasësh me mjekun në telefon nga shtëpia.",
  it: "I mediatori sanitari di RediHealth ti aiutano a iscriverti dal medico, a sistemare i documenti e a parlare con un medico al telefono da casa.",
  hr: "Zdravstveni medijatori RediHealth pomažu ti upisati se kod liječnika, riješiti dokumente i razgovarati s liječnikom telefonom od kuće.",
  rom: "E sastipnaske mediatorya RediHealth zhutin tut te lekhaves tut ko doktori, te lačhares che lila thaj te des svato ekhe doktoresa ko telefono katar khere.",
};

type MediatorPageCopy = { whoIsTitle: string; whoIsDesc: string; bullets: string[] };

/** "Who the health mediator is", below the hero on /mediatori. */
export const mediatorPageCopy: Record<Lang, MediatorPageCopy> = {
  ru: {
    whoIsTitle: "Кто является посредником в сфере здравоохранения",
    whoIsDesc: "Медиатор по вопросам здоровья – это человек из вашего сообщества, прошедший обучение и сертифицированный для выполнения этой работы. Они помогут вам справиться с вашим семейным врачом, больницами, социальными службами и мэрией. Они говорят на вашем языке и сохраняют конфиденциальность того, что вы им говорите.",
    bullets: [
      "Сохраняет ваши медицинские и личные данные в тайне",
      "Никогда не просит у вас денег или услуг",
      "Помогает детям, взрослым и пожилым людям",
      "Работает с общественными медсестрами и врачами",
    ],
  },

  ro: {
    whoIsTitle: "Cine este mediatorul sanitar",
    whoIsDesc: "Mediatorul sanitar este un om din comunitatea ta, pregătit și atestat pentru această muncă. Te ajută cu medicul de familie, spitalul, asistența socială și primăria. Îți vorbește limba și nu spune nimănui ce afli de la tine.",
    bullets: [
      "Păstrează secretul medical și datele tale",
      "Nu îți cere niciodată bani sau alte foloase",
      "Ajută copii, adulți și vârstnici",
      "Lucrează împreună cu asistenții comunitari și cu medicii",
    ],
  },
  en: {
    whoIsTitle: "Who the health mediator is",
    whoIsDesc: "A health mediator is someone from your community, trained and certified for this work. They help you deal with your family doctor, hospitals, social services and the town hall. They speak your language and keep what you tell them private.",
    bullets: [
      "Keeps your medical and personal details private",
      "Never asks you for money or favours",
      "Helps children, adults and older people",
      "Works with community nurses and doctors",
    ],
  },
  sq: {
    whoIsTitle: "Kush është mediatori shëndetësor",
    whoIsDesc: "Mediatori shëndetësor është dikush nga komuniteti yt, i trajnuar dhe i certifikuar për këtë punë. Të ndihmon me mjekun e familjes, spitalin, shërbimet sociale dhe bashkinë. Flet gjuhën tënde dhe nuk ia tregon askujt atë që i thua.",
    bullets: [
      "Ruan sekretin mjekësor dhe të dhënat e tua",
      "Nuk të kërkon kurrë para apo favore",
      "Ndihmon fëmijë, të rritur dhe të moshuar",
      "Punon bashkë me infermierët e komunitetit dhe me mjekët",
    ],
  },
  it: {
    whoIsTitle: "Chi è il mediatore sanitario",
    whoIsDesc: "Il mediatore sanitario è una persona della tua comunità, formata e abilitata per questo lavoro. Ti aiuta con il medico di famiglia, l'ospedale, i servizi sociali e il comune. Parla la tua lingua e non racconta a nessuno quello che gli dici.",
    bullets: [
      "Tiene riservati i tuoi dati medici e personali",
      "Non ti chiede mai soldi o favori",
      "Aiuta bambini, adulti e anziani",
      "Lavora insieme agli infermieri di comunità e ai medici",
    ],
  },
  hr: {
    whoIsTitle: "Tko je zdravstveni medijator",
    whoIsDesc: "Zdravstveni medijator je osoba iz tvoje zajednice, educirana i ovlaštena za ovaj posao. Pomaže ti u komunikaciji s obiteljskim liječnikom, bolnicom, socijalnom službom i općinom ili gradom. Govori tvoj jezik i čuva tajnost svega što mu povjeriš.",
    bullets: [
      "Čuva liječničku tajnu i tvoje osobne podatke",
      "Nikada od tebe ne traži novac ni protuusluge",
      "Pomaže djeci, odraslima i starijim osobama",
      "Surađuje s patronažnim sestrama i liječnicima",
    ],
  },
  rom: {
    whoIsTitle: "Kon si o sastipnasko mediatori",
    whoIsDesc: "O sastipnasko mediatori si manush katar chi komuniteta, sikavdo thaj atestisardo vash kadi buchi. Zhutil tut ko familiyako doktori, shpitalo, sociyalno zhutipen thaj primariya. Del svato pe chi chhib thaj na phenel nikaske so phenes leske.",
    bullets: [
      "Arakhel o sastipnasko garavipe thaj che date",
      "Shoha na mangel tutar love vay aver mishtimata",
      "Zhutil chhavoren, bare manushen thaj phuren",
      "Kerel buchi khetane e komunitetake asistentenca thaj e doktorenca",
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

/** 3-step accompaniment timeline explaining how a health mediator walks with the patient. */
export const mediatorTimelineCopy: Record<Lang, MediatorTimelineCopy> = {
  ro: {
    title: "Cum merge mediatorul sanitar alături de tine",
    lead: "Din clipa în care ne lași numărul tău, nu rămâi singur pe drumul spre medic.",
    steps: [
      {
        title: "Ne lași județul și telefonul",
        body: "Completezi rapid mai jos sau ceri ajutor prin formular, fără cont și fără documente pregătite.",
      },
      {
        title: "Te sună un mediator din zona ta",
        body: "Îți vorbește limba, ascultă de ce ai nevoie și stabilește împreună cu tine următorul pas.",
      },
      {
        title: "Merge cu tine până rezolvi",
        body: "Te însoțește la medicul de familie, te ajută cu actele și asigurarea CNAS sau aduce tableta pentru un apel cu medicul de acasă.",
      },
    ],
  },
  en: {
    title: "How a health mediator walks with you",
    lead: "From the moment you leave your number, you do not have to sort out care on your own.",
    steps: [
      {
        title: "Leave your county and phone number",
        body: "Use the short form below or the full request page. You do not need an account or papers ready.",
      },
      {
        title: "A local mediator calls you back",
        body: "Someone from your community calls in your language, listens calmly and agrees on the next step with you.",
      },
      {
        title: "They stay with you to the end",
        body: "They go with you to the family doctor, help with ID papers and insurance, or bring a tablet for a doctor call at home.",
      },
    ],
  },
  sq: {
    title: "Si ecën mediatori shëndetësor krah teje",
    lead: "Që nga momenti kur lë numrin tënd, nuk mbetesh vetëm rrugës për te mjeku.",
    steps: [
      {
        title: "Lë qarkun dhe numrin e telefonit",
        body: "Plotëso shpejt më poshtë ose përdor formularin e plotë, pa llogari dhe pa dokumente gati.",
      },
      {
        title: "Të telefonon një mediator nga zona jote",
        body: "Flet gjuhën tënde, të dëgjon me qetësi dhe vendos bashkë me ty hapin e radhës.",
      },
      {
        title: "Të shoqëron derisa të zgjidhet",
        body: "Vjen me ty te mjeku i familjes, të ndihmon me dokumentet dhe sigurimin ose sjell tabletën për thirrje me mjekun nga shtëpia.",
      },
    ],
  },
  it: {
    title: "Come ti accompagna il mediatore sanitario",
    lead: "Dal momento in cui lasci il tuo numero, non resti solo nel percorso verso le cure.",
    steps: [
      {
        title: "Lasci provincia e numero di telefono",
        body: "Compila in un attimo qui sotto oppure usa il modulo completo, senza account e senza documenti pronti.",
      },
      {
        title: "Ti richiama un mediatore della tua zona",
        body: "Parla la tua lingua, ti ascolta con calma e concorda insieme a te il passo successivo.",
      },
      {
        title: "Resta al tuo fianco fino in fondo",
        body: "Viene con te dal medico di famiglia, ti aiuta con documenti e tessera sanitaria o porta il tablet per parlare con un medico da casa.",
      },
    ],
  },
  hr: {
    title: "Kako te zdravstveni medijator prati korak po korak",
    lead: "Od trenutka kada ostaviš svoj broj, nisi sam na putu do liječnika.",
    steps: [
      {
        title: "Ostaviš okrug i broj telefona",
        body: "Ispuni brzo obrazac niže ili zatraži pomoć putem punog obrasca, bez računa i bez pripremljenih papira.",
      },
      {
        title: "Nazove te medijator iz tvog kraja",
        body: "Govori tvoj jezik, sluša te bez žurbe i s tobom dogovara sljedeći korak.",
      },
      {
        title: "Ostaje uz tebe dok sve ne riješiš",
        body: "Ide s tobom obiteljskom liječniku, pomaže s dokumentima i zdravstvenim osiguranjem ili donosi tablet za poziv liječniku od kuće.",
      },
    ],
  },
  rom: {
    title: "Sar phirel tusa o sastipnasko mediatori",
    lead: "Katar o momento kana mukhes cho telefonesko gin, na achhes korkoro po drom ko doktori.",
    steps: [
      {
        title: "Mukhes chi rig thaj o telefono",
        body: "Lekhav sigo tele vay mang zhutimos katar o baro formularo, bi kontosko thaj bi lila getome.",
      },
      {
        title: "Akharel tut ekh mediatori katar cho than",
        body: "Vakerel pe chi chhib, ashunel tut lokhes thaj khetane tusa alosarel o angluno drom.",
      },
      {
        title: "Achhel pasha tute zhi ko agor",
        body: "Zhal tusa ko familiyako doktori, zhutil tut e lilensa thaj e siguranciyasa vay anel o tableto te des svato e doktoresa khere.",
      },
    ],
  },
  ru: {
    title: "Как медицинский медиатор сопровождает вас",
    lead: "С того момента, как вы оставите номер телефона, вам не придётся разбираться в одиночку.",
    steps: [
      {
        title: "Оставьте округ и номер телефона",
        body: "Заполните короткую форму ниже или откройте полную заявку, без аккаунта и готовых справок.",
      },
      {
        title: "Вам перезвонит медиатор из вашего района",
        body: "Он говорит на вашем языке, спокойно выслушает и договорится с вами о следующем шаге.",
      },
      {
        title: "Идёт рядом до результата",
        body: "Сопровождает к семейному врачу, помогает с документами и страховкой или приносит планшет для звонка врачу из дома.",
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
