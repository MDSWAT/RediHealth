import type { Lang } from "@/lib/i18n/translations";

/** Meta description of /mediatori in each language. */
export const mediatorPageDescriptions: Record<Lang, string> = {
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
