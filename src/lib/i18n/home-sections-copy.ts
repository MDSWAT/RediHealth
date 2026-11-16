import type { Lang } from "@/lib/i18n/translations";

/**
 * Copy for the two service sections of the homepage: the online doctor and the health mediators.
 * Each brings forward a page that was only one link deep (/medic-online, /mediatori), so the
 * wording follows those pages: the steps are the ones on /medic-online, the mediator's work the
 * one on /mediatori. Every locale defines every key; sentence case, no ampersands.
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
      title: "A health mediator goes with you.",
      titleQuiet: "Someone from your community who speaks your language.",
      lead: "They help with the family doctor, the hospital, social services and the town hall, and keep what you tell them private.",
      services: [
        { title: "Registering and doctor visits", text: "They go with you to the family doctor, help with appointments and explain your prescriptions." },
        { title: "Documents and insurance", text: "They help with birth certificates, ID cards and health insurance for the whole family." },
        { title: "Check-ups at home", text: "They bring a tablet and devices for blood pressure, oxygen and blood sugar. You talk to a doctor by phone." },
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
      title: "Un mediator sanitar merge cu tine.",
      titleQuiet: "Un om din comunitatea ta, care îți vorbește limba.",
      lead: "Te ajută cu medicul de familie, spitalul, asistența socială și primăria și nu spune nimănui ce îi povestești.",
      services: [
        { title: "Înscriere și vizite la medic", text: "Merge cu tine la medicul de familie, te ajută cu programările și îți explică rețetele." },
        { title: "Acte și asigurare", text: "Te ajută cu certificatul de naștere, buletinul și asigurarea CNAS pentru toată familia." },
        { title: "Controale acasă", text: "Vine cu o tabletă și aparate pentru tensiune, oxigen și zahăr în sânge. Vorbești cu un medic la telefon." },
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
      title: "Një mediator shëndetësor vjen me ty.",
      titleQuiet: "Dikush nga komuniteti yt që flet gjuhën tënde.",
      lead: "Të ndihmon me mjekun e familjes, spitalin, shërbimet sociale dhe bashkinë, dhe nuk ia tregon askujt atë që i thua.",
      services: [
        { title: "Regjistrimi dhe vizitat te mjeku", text: "Vjen me ty te mjeku i familjes, të ndihmon me takimet dhe të shpjegon recetat." },
        { title: "Dokumentet dhe sigurimi", text: "Të ndihmon me certifikatën e lindjes, letërnjoftimin dhe sigurimin shëndetësor për gjithë familjen." },
        { title: "Kontrolle në shtëpi", text: "Vjen me një tabletë dhe aparate për tensionin, oksigjenin dhe sheqerin në gjak. Flet me një mjek në telefon." },
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
      title: "Un mediatore sanitario ti accompagna.",
      titleQuiet: "Una persona della tua comunità che parla la tua lingua.",
      lead: "Ti aiuta con il medico di famiglia, l'ospedale, i servizi sociali e il comune, e non racconta a nessuno quello che gli dici.",
      services: [
        { title: "Iscrizione e visite dal medico", text: "Viene con te dal medico di famiglia, ti aiuta con gli appuntamenti e ti spiega le ricette." },
        { title: "Documenti e tessera sanitaria", text: "Ti aiuta con certificato di nascita, carta d'identità e iscrizione al servizio sanitario per tutta la famiglia." },
        { title: "Controlli a casa", text: "Porta un tablet e gli apparecchi per pressione, ossigeno e zucchero nel sangue. Parli con un medico al telefono." },
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
      title: "Zdravstveni medijator ide s tobom.",
      titleQuiet: "Osoba iz tvoje zajednice koja govori tvoj jezik.",
      lead: "Pomaže ti s obiteljskim liječnikom, bolnicom, socijalnom službom i općinom te čuva tajnost svega što mu povjeriš.",
      services: [
        { title: "Upis i posjeti liječniku", text: "Ide s tobom obiteljskom liječniku, pomaže oko naručivanja i objašnjava ti recepte." },
        { title: "Dokumenti i osiguranje", text: "Pomaže oko rodnog lista, osobne iskaznice i zdravstvenog osiguranja za cijelu obitelj." },
        { title: "Pregledi kod kuće", text: "Dolazi s tabletom i uređajima za krvni tlak, kisik i šećer u krvi. S liječnikom razgovaraš telefonom." },
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
      title: "O sastipnasko mediatori zhal tusa.",
      titleQuiet: "Jekh manush katar chi komuniteta kay vakerel chi chhib.",
      lead: "Zhutil tut e familiyake doktoresa, e bolnitsasa, e socialone servisurenca thaj e primariyasa, thaj na phenel khanikaske so phenes leske.",
      services: [
        { title: "Lekhavipe thaj vizite ko doktori", text: "Zhal tusa ko familiyako doktori, zhutil tut e vramenca thaj phenel tuke lokhes e recepte." },
        { title: "Lila thaj siguranciya", text: "Zhutil tut e bijandipnaske lilesa, buletinesa thaj sastipnaske siguranciyasa vash sasti familiya." },
        { title: "Dikhiben khere", text: "Avel tabletesa thaj aparatenca vash e tensiyona, o oksigeno thaj o zaharo and-o rat. Des svato e doktoresa ko telefono." },
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
      title: "Медиатор по здоровью пойдёт с вами.",
      titleQuiet: "Человек из вашего сообщества, который говорит на вашем языке.",
      lead: "Помогает с семейным врачом, больницей, социальными службами и мэрией и никому не рассказывает то, что вы ему доверили.",
      services: [
        { title: "Запись и визиты к врачу", text: "Идёт с вами к семейному врачу, помогает записаться на приём и объясняет рецепты." },
        { title: "Документы и страховка", text: "Помогает со свидетельством о рождении, удостоверением личности и медицинской страховкой для всей семьи." },
        { title: "Осмотр на дому", text: "Приносит планшет и приборы для давления, кислорода и сахара в крови. Вы говорите с врачом по телефону." },
      ],
      facts: ["Не просит денег", "Хранит тайну", "Помогает всей семье"],
      ask: "Обратиться к медиатору",
      more: "Как помогают медиаторы",
    },
  },
};
