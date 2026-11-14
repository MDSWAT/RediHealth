import {
  SMART_SEARCH_TOOLS,
  getSmartSearchCopy,
  type Lang,
  type SmartSearchSynonymGroup,
} from "@/lib/i18n/smart-search-copy";
import type {
  SmartSearchReadingLevel,
  SmartSearchRelatedQuestion,
  SmartSearchResult,
} from "@/lib/search/smart-search-engine";

export const CONVERSATIONAL_COMPLETIONS_BY_LANG: Record<Lang, string[]> = {
  ro: [
    "Mă doare capul",
    "Mă doare în gât",
    "Mă doare burta",
    "Mă doare măseaua",
    "Durere de cap și amețeală",
    "Febră la copil",
    "Farmacie deschisă acum",
    "Nu am card CNAS",
    "Cum mă înscriu la medicul de familie",
    "Explică-mi rețeta medicală",
    "Caut un mediator sanitar",
    "Tensiune arterială mare",
    "Control glicemie și diabet",
    "Tuse și răceală",
    "Usturime la urinare",
  ],
  en: [
    "My head hurts",
    "My throat hurts and cough",
    "My stomach hurts",
    "My tooth hurts",
    "Headache and dizziness",
    "Fever in children",
    "Open pharmacy near me",
    "See a doctor without insurance",
    "How to register with a family doctor",
    "Explain my prescription",
    "Find a health mediator",
    "High blood pressure care",
    "Diabetes and blood glucose",
    "Urinary infection symptoms",
  ],
  sq: [
    "Më dhemb koka",
    "Më dhemb fyti dhe kollë",
    "Më dhemb barku",
    "Më dhemb dhëmbi",
    "Dhimbje koke dhe marramendje",
    "Ethe te fëmijët",
    "Farmaci e hapur tani",
    "Si të shkoj te mjeku pa sigurim",
    "Shpjego recetën time",
    "Gjej një mediator shëndetësor",
    "Tensioni i lartë i gjakut",
    "Diabeti dhe glukoza",
  ],
  it: [
    "Mi fa male la testa",
    "Mal di gola e tosse",
    "Mal di pancia e nausea",
    "Mal di denti",
    "Mal di testa e vertigini",
    "Febbre nei bambini",
    "Farmacia aperta adesso",
    "Cure mediche senza tessera sanitaria",
    "Spiega la mia ricetta",
    "Trova un mediatore sanitario",
    "Pressione alta e cuore",
    "Diabete e glicemia",
  ],
  hr: [
    "Boli me glava",
    "Grlobolja i kašalj",
    "Boli me trbuh",
    "Boli me zub",
    "Glavobolja i vrtoglavica",
    "Vrućica kod djece",
    "Dežurna ljekarna u blizini",
    "Kako liječniku bez osiguranja",
    "Objasni moj recept",
    "Zdravstveni medijator u blizini",
    "Visoki krvni tlak",
    "Dijabetes i glukoza",
  ],
  rom: [
    "Dukhal man o shero",
    "Dukhal man o krlo",
    "Dukhal man o per",
    "Tatipen ko chavoro",
    "Farmaciya putardi akana",
    "Sar zhav ko doktori bi asigurimasko",
    "Sikav mange miro receto",
    "Arakh sastipnasko mediatori",
    "Bari rateski tensia",
    "Diabeto thaj glukoza",
  ],
  ru: [
    "Болит голова",
    "Болит горло и кашель",
    "Болит живот и тошнота",
    "Болит зуб",
    "Головная боль и головокружение",
    "Температура у ребенка",
    "Дежурная аптека рядом",
    "К врачу без страховки",
    "Объясните мой рецепт",
    "Найти медицинского медиатора",
    "Высокое артериальное давление",
    "Диабет и уровень глюкозы",
  ],
};

/**
 * Spoken colloquial variants mapped to their normalized standard stems so
 * everyday speech ("ma doare capu", "masea", "copilu") matches formal entries.
 */
export const COLLOQUIAL_TOKEN_EXPANSIONS: Record<string, string[]> = {
  capu: ["capul", "cap", "cefalee"],
  capul: ["cap", "cefalee"],
  gatu: ["gatul", "gat"],
  gatul: ["gat"],
  pieptu: ["pieptul", "piept"],
  stomacu: ["stomacul", "stomac", "burta"],
  burta: ["stomac", "abdomen"],
  masea: ["maseaua", "dinte", "dinti"],
  maseaua: ["masea", "dinte", "dinti"],
  copilu: ["copilul", "copil", "copii"],
  bebelusu: ["bebelusul", "bebe", "copil"],
};

export const GENERIC_SYMPTOM_TOKENS = new Set([
  "doare",
  "durere",
  "dureri",
  "hurts",
  "hurt",
  "pain",
  "ache",
  "dhemb",
  "dhimbje",
  "male",
  "mal",
  "dolore",
  "boli",
  "bol",
  "dukhal",
  "dukh",
  "болит",
  "боль",
]);

export const SEARCH_STOPWORDS = new Set([
  "ma",
  "mi",
  "me",
  "my",
  "am",
  "ai",
  "au",
  "un",
  "la",
  "in",
  "de",
  "cu",
  "pe",
  "si",
  "sa",
  "ce",
  "ca",
  "nu",
  "te",
  "se",
  "va",
  "le",
  "ii",
  "din",
  "pentru",
  "fara",
  "cum",
  "unde",
  "cand",
  "the",
  "is",
  "are",
  "to",
  "of",
  "on",
  "at",
  "for",
  "and",
  "or",
  "how",
  "what",
  "where",
  "when",
  "can",
  "with",
  "without",
  "che",
  "di",
  "da",
  "il",
  "lo",
  "la",
  "un",
  "una",
  "per",
  "con",
  "non",
  "come",
  "dove",
  "je",
  "su",
  "od",
  "do",
  "na",
  "za",
  "uz",
  "kako",
  "gdje",
  "ko",
  "so",
  "bi",
  "man",
  "tut",
  "не",
  "на",
  "за",
  "по",
  "от",
  "до",
  "из",
  "что",
  "как",
  "где",
  "при",
  "без",
]);

interface CanonicalClinicalBrief {
  standard: Record<Lang, string>;
  simple: Record<Lang, string>;
  followups: Record<Lang, [string, string, string]>;
}

export const CLINICAL_SYNTHESIS_BY_CANONICAL: Record<string, CanonicalClinicalBrief> = {
  headache: {
    standard: {
      ro: "Durerea de cap obișnuită este adesea legată de oboseală, deshidratare, stres sau viroze și se poate liniști cu apă și odihnă într-o cameră aerisită. Mergi la medic sau sună la 112 dacă durerea apare brusc și foarte intens, ori este însoțită de febră mare, gât înțepenit, confuzie sau tulburări de vedere.",
      en: "Most everyday headaches relate to dehydration, tiredness, tension, or mild viral illness and ease with water and rest in a quiet room. Seek urgent care or call 112 if a headache starts suddenly and severely, or comes with high fever, a stiff neck, confusion, or vision changes.",
      sq: "Dhimbja e zakonshme e kokës lidhet shpesh me lodhjen, mungesën e ujit ose stresin dhe lehtësohet me pushim e hidratim. Kërko ndihmë mjekësore ose telefono 112 nëse dhimbja fillon papritur dhe fort, ose shoqërohet me ethe të larta, qafë të ngurtësuar apo turbullim shikimi.",
      it: "Il mal di testa comune è spesso legato a stanchezza, disidratazione o tensione e migliora con acqua e riposo in una stanza tranquilla. Rivolgiti subito al medico o chiama il 112 se il dolore compare all'improvviso ed è molto forte, o si accompagna a febbre alta, collo rigido o vista offuscata.",
      hr: "Uobičajena glavobolja najčešće je povezana s umorom, dehidracijom ili napetošću te popušta uz vodu i odmor u mirnoj prostoriji. Odmah potraži liječnika ili nazovi 112 ako bol nastupi naglo i snažno ili uz visoku temperaturu, ukočen vrat i smetnje vida.",
      rom: "O dukhipe e sheresko avel butivar katar khino, bi-panyesko vaj streso thaj lokhyol panyesa thaj hodinipe. Zha sig ko doktori vaj akhar 112 te avela o dukhipe but zurales pe jekhvar, bare tatipnasa, pharo korr vaj te na dikhes mishto.",
      ru: "Обычная головная боль часто связана с усталостью, нехваткой воды или напряжением и уменьшается после отдыха и питья. Обратитесь к врачу или позвоните 112, если боль возникла внезапно и очень сильно либо сопровождается высокой температурой, скованностью шеи или нарушением зрения.",
    },
    simple: {
      ro: "Bea apă, odihnește-te la liniște și urmărește cum te simți. Sună la 112 dacă durerea de cap este bruscă, foarte tare sau vine cu febră mare și vedere încețoșată.",
      en: "Drink water, rest in a quiet room, and watch your symptoms. Call 112 if the headache is sudden and severe or comes with high fever or vision trouble.",
      sq: "Pi ujë, pusho në qetësi dhe vëzhgo simptomat. Telefono 112 nëse dhimbja është e menjëhershme, shumë e fortë ose me ethe të larta.",
      it: "Bevi acqua e riposa al tranquillo. Chiama il 112 se il mal di testa è improvviso, fortissimo o con febbre alta e disturbi alla vista.",
      hr: "Popij vode i odmori u tišini. Nazovi 112 ako je glavobolja nagla i jaka ili uz visoku temperaturu i zamućen vid.",
      rom: "Pi pani thaj hodinisar ande tichinipe. Akhar 112 te si o dukhipe but zuralo vaj bare tatipnasa.",
      ru: "Выпейте воды и отдохните в тишине. Звоните 112, если боль резкая, очень сильная или с высокой температурой.",
    },
    followups: {
      ro: ["Verificare simptome pe corp", "Farmacie deschisă acum", "Tensiune arterială mare"],
      en: ["Body symptom check", "Open pharmacy near me", "High blood pressure care"],
      sq: ["Kontrolli i simptomave në trup", "Farmaci e hapur tani", "Tensioni i lartë i gjakut"],
      it: ["Controllo sintomi sul corpo", "Farmacia aperta adesso", "Pressione alta e cuore"],
      hr: ["Provjera simptoma na tijelu", "Dežurna ljekarna u blizini", "Visoki krvni tlak"],
      rom: ["Dikh e simptome pe trupo", "Farmaciya putardi akana", "Bari rateski tensia"],
      ru: ["Проверка симптомов по телу", "Дежурная аптека рядом", "Высокое артериальное давление"],
    },
  },
  fever: {
    standard: {
      ro: "Febra arată de obicei că organismul luptă cu o infecție; oferă lichide dese, haine lejere și urmărește starea generală. Cere consult medical rapid pentru sugari, dacă febra depășește trei zile sau apar respirație grea, somnolență accentuată ori erupții pe piele.",
      en: "Fever is usually a sign that the body is fighting an infection; offer frequent fluids, light clothing, and rest. Contact a doctor promptly for babies, if fever lasts more than three days, or if breathing trouble, extreme drowsiness, or a rash appears.",
      sq: "Ethet tregojnë zakonisht se trupi po lufton një infeksion; jep lëngje shpesh, veshje të lehta dhe pushim. Kërko mjek menjëherë për foshnjat, nëse ethet zgjasin mbi tri ditë ose shfaqet frymëmarrje e vështirë.",
      it: "La febbre indica di solito che il corpo sta combattendo un'infezione; offri liquidi frequenti, abiti leggeri e riposo. Contatta subito il medico per i neonati, se dura oltre tre giorni o se compaiono respiro corto o forte sonnolenza.",
      hr: "Povišena temperatura obično znači da se tijelo bori protiv infekcije; osiguraj dovoljno tekućine, laganu odjeću i odmor. Javi se liječniku odmah za dojenčad, ako traje dulje od tri dana ili uz otežano disanje.",
      rom: "O tatipen sikavel ke o trupo marel pes jekhe nasvalipnasa; de pani butivar thaj lokhe gada. Akhar doktores sig vash tikne chavorre, te achel trin divesa vaj te phares phurdel.",
      ru: "Температура обычно означает, что организм борется с инфекцией; обеспечьте частое питье, легкую одежду и покой. Срочно обратитесь к врачу для младенцев, если жар держится дольше трех дней или появилось тяжелое дыхание.",
    },
    simple: {
      ro: "Bea lichide dese și odihnește-te în haine subțiri. Mergi urgent la medic dacă este vorba de un bebe mic, dacă febra ține peste trei zile sau respirația devine grea.",
      en: "Drink plenty of fluids and wear light clothes. See a doctor urgently for a young baby, fever over three days, or hard breathing.",
      sq: "Pi lëngje shpesh dhe mbaj rroba të lehta. Shko te mjeku urgjent për foshnjat ose nëse ethet zgjasin mbi tri ditë.",
      it: "Bevi spesso e indossa abiti leggeri. Vai subito dal medico per un neonato o se la febbre dura più di tre giorni.",
      hr: "Pij puno tekućine i nosi laganu odjeću. Odmah se javi liječniku za malu bebu ili ako temperatura traje dulje od tri dana.",
      rom: "Pi but pani thaj labyar lokhe gada. Zha sig ko doktori vash tikno bebe vaj te achel o tatipen trin divesa.",
      ru: "Чаще пейте воду и носите легкую одежду. Срочно обратитесь к врачу, если жар у младенца или длится больше трех дней.",
    },
    followups: {
      ro: ["Sănătatea copilului", "Verificare simptome pe corp", "Farmacie deschisă acum"],
      en: ["Children's health", "Body symptom check", "Open pharmacy near me"],
      sq: ["Shëndeti i fëmijëve", "Kontrolli i simptomave në trup", "Farmaci e hapur tani"],
      it: ["Salute dei bambini", "Controllo sintomi sul corpo", "Farmacia aperta adesso"],
      hr: ["Zdravlje djece", "Provjera simptoma na tijelu", "Dežurna ljekarna u blizini"],
      rom: ["Chavorrengo sastipen", "Dikh e simptome pe trupo", "Farmaciya putardi akana"],
      ru: ["Детское здоровье", "Проверка симптомов по телу", "Дежурная аптека рядом"],
    },
  },
  toothache: {
    standard: {
      ro: "Durerea de măsea sau de dinte are nevoie de evaluare stomatologică; până ajungi la cabinet, clătește ușor gura cu apă călduță și evită alimentele foarte reci, fierbinți sau dulci. Mergi de urgență la medic dacă obrazul se umflă, ai febră sau înghiți greu.",
      en: "Tooth pain needs a dental check; until your visit, rinse gently with lukewarm water and avoid very hot, cold, or sugary foods. Seek urgent care if your cheek swells, you develop a fever, or swallowing becomes difficult.",
      sq: "Dhimbja e dhëmbit kërkon kontroll dentar; ndërkohë shpëlaje gojën lehtë me ujë të vakët dhe shmang ushqimet shumë të ftohta ose të nxehta. Kërko ndihmë urgjente nëse të ënjtet faqja ose ke ethe.",
      it: "Il mal di denti richiede una visita odontoiatrica; nell'attesa sciacqua delicatamente con acqua tiepida ed evita cibi molto caldi o freddi. Vai subito in guardia medica se la guancia si gonfia o compare febbre.",
      hr: "Zubobolja zahtijeva pregled stomatologa; do pregleda nježno ispiri usta mlakom vodom i izbjegavaj vruću ili hladnu hranu. Potraži hitnu skrb ako otekne obraz, imaš temperaturu ili teško gutaš.",
      rom: "O dukhipe e dandesko mangel dikhiben ko dantisto; zhi atunchi xalav lokhes o muj tate panyesa. Zha sig ko doktori te shuvlyol cho cham vaj te avel tut tatipen.",
      ru: "При зубной боли нужен осмотр стоматолога; до визита аккуратно прополощите рот теплой водой и избегайте горячей или холодной пищи. Срочно обратитесь к врачу при отеке щеки, температуре или трудности глотания.",
    },
    simple: {
      ro: "Clătește gura cu apă călduță și caută un cabinet stomatologic sau o farmacie aproape. Mergi la urgențe dacă se umflă fața sau ai febră.",
      en: "Rinse gently with warm water and find a nearby dentist or pharmacy. Go to urgent care if your face swells or you have a fever.",
      sq: "Shpëlaje gojën me ujë të vakët dhe gjej një dentist ose farmaci afër. Shko në urgjencë nëse ënjtet fytyra.",
      it: "Sciacqua con acqua tiepida e cerca una farmacia o un dentista vicino. Vai in urgenza se il viso si gonfia.",
      hr: "Ispiri mlakom vodom i potraži ljekarnu ili zubara u blizini. Idi na hitnu ako lice otekne ili imaš vrućicu.",
      rom: "Xalav o muj tate panyesa thaj rod farmaciya pashe. Zha sig ko doktori te shuvlyol o muj.",
      ru: "Прополощите рот теплой водой и найдите аптеку или стоматолога рядом. При отеке лица обратитесь за неотложной помощью.",
    },
    followups: {
      ro: ["Farmacie deschisă acum", "Asistent de sănătate", "Nu am card CNAS"],
      en: ["Open pharmacy near me", "Health assistant", "See a doctor without insurance"],
      sq: ["Farmaci e hapur tani", "Asistenti shëndetësor", "Si të shkoj te mjeku pa sigurim"],
      it: ["Farmacia aperta adesso", "Assistente sanitario", "Cure mediche senza tessera sanitaria"],
      hr: ["Dežurna ljekarna u blizini", "Zdravstveni asistent", "Kako liječniku bez osiguranja"],
      rom: ["Farmaciya putardi akana", "Sastipnasko asistento", "Sar zhav ko doktori bi asigurimasko"],
      ru: ["Дежурная аптека рядом", "Медицинский ассистент", "К врачу без страховки"],
    },
  },
  "sore-throat-cough": {
    standard: {
      ro: "Durerea în gât și tusea pornesc cel mai des de la o răceală virală, unde antibioticele nu ajută, iar lichidele calde și repausul vocal aduc alinare. Consultă medicul dacă nu poți înghiți lichide, ai febră mare persistentă sau respiri greu.",
      en: "A sore throat and cough are most often caused by viral colds where antibiotics do not help; warm fluids and rest ease discomfort. See a doctor if swallowing liquids is hard, high fever persists, or breathing feels short.",
      sq: "Dhimbja e fytit dhe kolla shkaktohen zakonisht nga ftohjet virale ku antibiotikët nuk ndihmojnë; lëngjet e ngrohta lehtësojnë gjendjen. Shko te mjeku nëse gëlltit me vështirësi, ke ethe të larta ose frymëmarrje të rënduar.",
      it: "Mal di gola e tosse dipendono spesso da infezioni virali in cui gli antibiotici non servono; bevande tiepide e riposo danno sollievo. Contatta il medico se fatichi a deglutire, hai febbre alta persistente o respiro corto.",
      hr: "Grlobolja i kašalj najčešće su posljedica virusne prehlade kod koje antibiotici ne pomažu; topli napitci i odmor ublažavaju tegobe. Posjeti liječnika ako teško gutaš, imaš visoku temperaturu ili otežano dišeš.",
      rom: "O dukhipe ando krlo thaj o khas aven butivar katar shil, kaj antibiotikurya na zhutin; tate piba lokhyaren. Zha ko doktori te si pharo te nakaves pani vaj te phurdes.",
      ru: "Боль в горле и кашель чаще вызваны вирусной простудой, при которой антибиотики не действуют; помогают теплое питье и покой. Обратитесь к врачу, если трудно глотать, держится высокая температура или появилась одышка.",
    },
    simple: {
      ro: "Bea ceai sau apă caldă și nu lua antibiotice fără rețetă. Mergi la medic dacă înghiți foarte greu sau respiri cu efort.",
      en: "Drink warm fluids and avoid taking leftover antibiotics. See a doctor if swallowing or breathing becomes difficult.",
      sq: "Pi lëngje të ngrohta dhe mos merr antibiotikë pa recetë. Shko te mjeku nëse gëlltit ose merr frymë me vështirësi.",
      it: "Bevi liquidi tiepidi e non prendere antibiotici senza ricetta. Vai dal medico se fatichi a deglutire o respirare.",
      hr: "Pij tople napitke i ne uzimaj antibiotike bez recepta. Javi se liječniku ako teško gutaš ili dišeš.",
      rom: "Pi tato pani thaj na le antibiotikurya bi recetosko. Zha ko doktori te phares phurdes.",
      ru: "Пейте теплую жидкость и не принимайте антибиотики без рецепта. Обратитесь к врачу при трудном глотании или дыхании.",
    },
    followups: {
      ro: ["Febră la copil", "Farmacie deschisă acum", "Explică-mi rețeta medicală"],
      en: ["Fever in children", "Open pharmacy near me", "Explain my prescription"],
      sq: ["Ethe te fëmijët", "Farmaci e hapur tani", "Shpjego recetën time"],
      it: ["Febbre nei bambini", "Farmacia aperta adesso", "Spiega la mia ricetta"],
      hr: ["Vrućica kod djece", "Dežurna ljekarna u blizini", "Objasni moj recept"],
      rom: ["Tatipen ko chavoro", "Farmaciya putardi akana", "Sikav mange miro receto"],
      ru: ["Температура у ребенка", "Дежурная аптека рядом", "Объясните мой рецепт"],
    },
  },
  "stomach-digestion": {
    standard: {
      ro: "Durerea de burtă ușoară, greața sau diareea necesită hidratare treptată cu înghițituri mici de apă sau săruri de rehidratare și mese ușoare. Mergi de urgență la medic dacă durerea devine ascuțită și continuă, abdomenul este tare sau apar vărsături repetate.",
      en: "Mild stomach pain, nausea, or diarrhea call for steady hydration with small sips of water or oral rehydration salts and light meals. Seek urgent medical care if pain becomes sharp and constant, the belly feels rigid, or vomiting continues.",
      sq: "Dhimbja e lehtë e barkut, të përzierat ose diarreja kërkojnë hidratim me gllënjka të vogla uji dhe ushqim të lehtë. Shko urgjent te mjeku nëse dhimbja bëhet e fortë e e vazhdueshme ose të vjellat nuk ndalojnë.",
      it: "Mal di pancia lieve, nausea o diarrea richiedono idratazione a piccoli sorsi e pasti leggeri. Rivolgiti subito al medico se il dolore diventa acuto e continuo, l'addome è rigido o il vomito non si ferma.",
      hr: "Blaga bol u trbuhu, mučnina ili proljev traže postupnu hidraciju malim gutljajima vode i laganu prehranu. Odmah potraži liječnika ako bol postane oštra i stalna ili uz neprestano povraćanje.",
      rom: "Lokho dukhipe ando per mangel te pibes po zalag pani thaj lokho xaben. Zha sig ko doktori te avela o dukhipe but zuralo vaj te chudes upre sakana.",
      ru: "При умеренной боли в животе, тошноте или диарее важно пить воду маленькими глотками и соблюдать щадящее питание. Срочно обратитесь к врачу при острой постоянной боли, твердом животе или неукротимой рвоте.",
    },
    simple: {
      ro: "Bea apă cu înghițituri mici și mănâncă ușor. Mergi imediat la medic dacă durerea de burtă este puternică sau nu poți opri vărsăturile.",
      en: "Sip water slowly and eat light foods. Get urgent medical help if belly pain is severe or you cannot keep fluids down.",
      sq: "Pi ujë ngadalë me gllënjka të vogla. Kërko mjek urgjent nëse dhimbja e barkut është e fortë.",
      it: "Bevi acqua a piccoli sorsi. Vai subito dal medico se il dolore alla pancia è forte o continuo.",
      hr: "Pij vodu u malim gutljajima. Odmah idi liječniku ako je bol u trbuhu jaka i stalna.",
      rom: "Pi pani po tikno. Zha sig ko doktori te dukhal o per but zurales.",
      ru: "Пейте воду маленькими глотками. Срочно обратитесь к врачу при сильной постоянной боли в животе.",
    },
    followups: {
      ro: ["Verificare simptome pe corp", "Farmacie deschisă acum", "Asistent de sănătate"],
      en: ["Body symptom check", "Open pharmacy near me", "Health assistant"],
      sq: ["Kontrolli i simptomave në trup", "Farmaci e hapur tani", "Asistenti shëndetësor"],
      it: ["Controllo sintomi sul corpo", "Farmacia aperta adesso", "Assistente sanitario"],
      hr: ["Provjera simptoma na tijelu", "Dežurna ljekarna u blizini", "Zdravstveni asistent"],
      rom: ["Dikh e simptome pe trupo", "Farmaciya putardi akana", "Sastipnasko asistento"],
      ru: ["Проверка симптомов по телу", "Дежурная аптека рядом", "Медицинский ассистент"],
    },
  },
  "open-pharmacy": {
    standard: {
      ro: "Poți vedea imediat pe harta RediHealth farmaciile deschise acum, farmaciile de gardă, cabinetele medicilor de familie și spitalele din apropierea ta. Pentru simptome ușoare, farmacistul îți poate recomanda îngrijire fără rețetă sau îți poate spune dacă ai nevoie de medic.",
      en: "You can check the RediHealth care map right away to find open pharmacies, 24-hour duty pharmacies, family doctors, and hospitals near you. For mild symptoms, a pharmacist can advise over-the-counter care or tell you when to see a doctor.",
      sq: "Mund të shikosh menjëherë në hartën RediHealth farmacitë e hapura tani, mjekët e familjes dhe spitalet pranë teje. Për shqetësime të lehta, farmacisti të orienton me kujdes bazë ose kur duhet mjeku.",
      it: "Puoi consultare subito la mappa RediHealth per trovare farmacie aperte, farmacie di turno, medici di base e ospedali vicini. Per disturbi lievi il farmacista può consigliarti o indicarti quando andare dal medico.",
      hr: "Na RediHealth karti možeš odmah pronaći otvorene i dežurne ljekarne, obiteljske liječnike te bolnice u blizini. Kod blažih tegoba ljekarnik može dati savjet ili uputiti kada posjetiti liječnika.",
      rom: "Shaj dikhes akana pe RediHealth mapa e putarde farmaciye, familiyake doktorya thaj bolnitse pashe tute. Vash lokhe simptome o farmacisto shaj phenel tuke so te keres.",
      ru: "На карте RediHealth можно сразу найти открытые и дежурные аптеки, семейных врачей и больницы рядом с вами. При легких симптомах фармацевт подскажет базовый уход или направит к врачу.",
    },
    simple: {
      ro: "Deschide harta ca să vezi cea mai apropiată farmacie deschisă acum, programul și drumul până acolo.",
      en: "Open the care map to see the nearest open pharmacy, hours, and directions right now.",
      sq: "Hap hartën për të parë farmacinë më të afërt të hapur tani dhe adresën.",
      it: "Apri la mappa per vedere la farmacia aperta più vicina, gli orari e il percorso.",
      hr: "Otvori kartu za najbližu otvorenu ljekarnu, radno vrijeme i upute.",
      rom: "Putar e mapa te dikhes savi farmaciya si putardi akana pashe tute.",
      ru: "Откройте карту, чтобы увидеть ближайшую открытую аптеку, часы работы и маршрут.",
    },
    followups: {
      ro: ["Explică-mi rețeta medicală", "Cum mă înscriu la medicul de familie", "Nu am card CNAS"],
      en: ["Explain my prescription", "How to register with a family doctor", "See a doctor without insurance"],
      sq: ["Shpjego recetën time", "Gjej një mediator shëndetësor", "Si të shkoj te mjeku pa sigurim"],
      it: ["Spiega la mia ricetta", "Trova un mediatore sanitario", "Cure mediche senza tessera sanitaria"],
      hr: ["Objasni moj recept", "Zdravstveni medijator u blizini", "Kako liječniku bez osiguranja"],
      rom: ["Sikav mange miro receto", "Arakh sastipnasko mediatori", "Sar zhav ko doktori bi asigurimasko"],
      ru: ["Объясните мой рецепт", "Найти медицинского медиатора", "К врачу без страховки"],
    },
  },
  "insurance-rights": {
    standard: {
      ro: "Chiar dacă nu ai card CNAS, asigurare activă sau toate actele, ai dreptul gratuit la urgențe medico-chirurgicale, supravegherea sarcinii, imunizări și pachetul minimal de bază. Un mediator sanitar comunitar te poate ajuta pas cu pas cu actele și înscrierea la medicul de familie.",
      en: "Even without active health insurance or full paperwork, you have the right to free emergency care, pregnancy checkups, vaccinations, and essential primary services. A community health mediator can help step by step with documents and family doctor registration.",
      sq: "Edhe pa sigurim aktiv ose pa të gjitha dokumentet, ke të drejtë për kujdes urgjent falas, ndjekje të shtatzënisë dhe shërbime bazë. Një mediator shëndetësor të ndihmon hap pas hapi me dokumentet dhe regjistrimin te mjeku.",
      it: "Anche senza assicurazione attiva o documenti completi hai diritto alle cure urgenti gratuite, ai controlli in gravidanza e alle prestazioni essenziali. Un mediatore sanitario può aiutarti passo dopo passo con i moduli e il medico di base.",
      hr: "Čak i bez aktivnog osiguranja ili svih dokumenata imaš pravo na besplatnu hitnu skrb, praćenje trudnoće i osnovne preglede. Zdravstveni medijator pomaže korak po korak oko papira i upisa obiteljskom liječniku.",
      rom: "Vi bi kartelako CNAS vaj bi asigurimasko si tut chachipen pe bi-lovesko sigardiari, dikhiben kana san khamni thaj bazikane shere. Jekh sastipnasko mediatori zhutil tut e lilenca thaj ko familiyako doktori.",
      ru: "Даже без активной страховки или полного пакета документов вы имеете право на бесплатную экстренную помощь, ведение беременности и базовый пакет услуг. Медицинский медиатор поможет с документами и записью к семейному врачу.",
    },
    simple: {
      ro: "Urgențele, sarcina și consultațiile din pachetul minimal sunt gratuite și fără asigurare. Poți cere gratuit sprijinul unui mediator sanitar pentru acte.",
      en: "Emergencies, pregnancy care, and basic checkups are available even without insurance. You can request free help from a health mediator.",
      sq: "Urgjencat dhe kujdesi bazë ofrohen edhe pa sigurim. Mund të kërkosh ndihmë falas nga një mediator shëndetësor.",
      it: "Le urgenze e le cure essenziali sono garantite anche senza tessera. Puoi chiedere aiuto gratuito a un mediatore sanitario.",
      hr: "Hitna skrb i osnovni pregledi dostupni su i bez osiguranja. Možeš zatražiti besplatnu pomoć zdravstvenog medijatora.",
      rom: "Sigardiari thaj bazikane dikhimata si bi-lovesko vi bi asigurimasko. Mang zhutimos katar jekh mediatori.",
      ru: "Экстренная помощь и базовые осмотры доступны даже без страховки. Медиатор бесплатно поможет с документами.",
    },
    followups: {
      ro: ["Caut un mediator sanitar", "Cum mă înscriu la medicul de familie", "Farmacie deschisă acum"],
      en: ["Find a health mediator", "How to register with a family doctor", "Open pharmacy near me"],
      sq: ["Gjej një mediator shëndetësor", "Farmaci e hapur tani", "Asistenti shëndetësor"],
      it: ["Trova un mediatore sanitario", "Farmacia aperta adesso", "Assistente sanitario"],
      hr: ["Zdravstveni medijator u blizini", "Dežurna ljekarna u blizini", "Zdravstveni asistent"],
      rom: ["Arakh sastipnasko mediatori", "Farmaciya putardi akana", "Sastipnasko asistento"],
      ru: ["Найти медицинского медиатора", "Дежурная аптека рядом", "Медицинский ассистент"],
    },
  },
  "antibiotics-prescription": {
    standard: {
      ro: "Poți fotografia rețeta sau scrie numele medicamentelor în instrumentul de rețete pentru a vedea simplu rolul fiecărei pastile și când se ia. Nu întrerupe și nu lua antibiotice fără recomandarea medicului, iar la farmacie poți întreba de variante compensate.",
      en: "You can upload a photo of your prescription or enter medicine names to get a clear morning, midday, and evening schedule. Never start or stop antibiotics without medical advice, and ask your pharmacist about covered generic options.",
      sq: "Mund të ngarkosh foton e recetës ose emrat e barnave për të parë qartë orarin e marrjes. Mos fillo dhe mos ndërprit antibiotikët pa këshillën e mjekut.",
      it: "Puoi caricare una foto della ricetta o inserire i nomi dei farmaci per vedere uno schema chiaro di assunzione. Non iniziare né sospendere antibiotici senza il parere del medico.",
      hr: "Možeš učitati sliku recepta ili nazive lijekova za jasan raspored uzimanja ujutro, u podne i navečer. Ne uzimaj i ne prekidaj antibiotike bez savjeta liječnika.",
      rom: "Shaj des slika e recetoski te dikhes lokhes kana te les sako drab. Na le thaj na mukh antibiotikurya bi doktoresko.",
      ru: "Сфотографируйте рецепт или введите названия лекарств, чтобы получить понятную схему приема. Не начинайте и не прекращайте прием антибиотиков без назначения врача.",
    },
    simple: {
      ro: "Încarcă o poză cu rețeta ca să vezi pe înțelesul tău cum iei fiecare medicament dimineața, la prânz și seara.",
      en: "Take a photo of your prescription to see clearly what each medicine does and when to take it.",
      sq: "Bëj foto recetës për të parë thjesht kur merret secili ilaç.",
      it: "Scatta una foto alla ricetta per capire in modo semplice quando prendere ogni farmaco.",
      hr: "Slikaj recept i pogledaj jednostavan raspored uzimanja svakog lijeka.",
      rom: "Ker slika pe receto te dikhes lokhes kana te les e draba.",
      ru: "Загрузите фото рецепта, чтобы просто понять назначение и время приема каждого лекарства.",
    },
    followups: {
      ro: ["Farmacie deschisă acum", "Asistent de sănătate", "Nu am card CNAS"],
      en: ["Open pharmacy near me", "Health assistant", "See a doctor without insurance"],
      sq: ["Farmaci e hapur tani", "Asistenti shëndetësor", "Si të shkoj te mjeku pa sigurim"],
      it: ["Farmacia aperta adesso", "Assistente sanitario", "Cure mediche senza tessera sanitaria"],
      hr: ["Dežurna ljekarna u blizini", "Zdravstveni asistent", "Kako liječniku bez osiguranja"],
      rom: ["Farmaciya putardi akana", "Sastipnasko asistento", "Sar zhav ko doktori bi asigurimasko"],
      ru: ["Дежурная аптека рядом", "Медицинский ассистент", "К врачу без страховки"],
    },
  },
  diabetes: {
    standard: {
      ro: "Controlul diabetului se bazează pe mese regulate cu mai puțin zahăr adăugat, mișcare zilnică, monitorizarea glicemiei și administrarea constantă a tratamentului. Mergi la medic dacă observi sete intensă, urinare frecventă, vedere încețoșată sau răni la picioare care se vindecă greu.",
      en: "Managing diabetes relies on balanced meals, daily movement, regular blood glucose checks, and consistent treatment. Contact a doctor if you notice strong thirst, frequent urination, blurred vision, or slow-healing foot sores.",
      sq: "Kontrolli i diabetit mbështetet te vaktet e rregullta, lëvizja e përditshme, matja e glukozës dhe marrja e rregullt e terapisë. Kërko mjekun nëse ke etje të fortë, shikim të mjegulluar ose plagë në këmbë.",
      it: "La gestione del diabete si basa su pasti equilibrati, movimento quotidiano, controllo della glicemia e terapia costante. Rivolgiti al medico in caso di sete intensa, vista offuscata o ferite ai piedi che guariscono lentamente.",
      hr: "Kontrola dijabetesa temelji se na uravnoteženim obrocima, svakodnevnom kretanju, praćenju glukoze i redovitoj terapiji. Javi se liječniku kod jake žeđi, zamućenog vida ili ranica na stopalima.",
      rom: "O dikhiben e diabetosko mangel lacho xaben, phiripen, meripen e glukozako thaj drab sako dives. Zha ko doktori te si tut baro trush, na dikhes mishto vaj pharimata pe punre.",
      ru: "Контроль диабета строится на регулярном питании, ежедневном движении, измерении глюкозы и постоянном приеме терапии. Обратитесь к врачу при сильной жажде, нечетком зрении или долго не заживающих ранках на стопах.",
    },
    simple: {
      ro: "Urmărește glicemia regulat, mănâncă echilibrat și nu opri tratamentul fără sfatul medicului.",
      en: "Check blood glucose regularly, eat balanced meals, and keep taking your prescribed treatment.",
      sq: "Mat glukozën rregullisht, ushqehu shëndetshëm dhe mos e ndërprit terapinë pa mjekun.",
      it: "Controlla regolarmente la glicemia, segui pasti equilibrati e continua la terapia prescritta.",
      hr: "Redovito prati glukozu, jedi uravnoteženo i ne prekidaj propisanu terapiju.",
      rom: "Dikh e glukoza sako dives thaj na mukh o drab bi doktoresko.",
      ru: "Регулярно проверяйте уровень глюкозы, питайтесь сбалансированно и не прерывайте лечение.",
    },
    followups: {
      ro: ["Inimă și tensiune arterială", "Explică-mi rețeta medicală", "Cum mă înscriu la medicul de familie"],
      en: ["Heart health and blood pressure", "Explain my prescription", "How to register with a family doctor"],
      sq: ["Zemra dhe presioni i gjakut", "Shpjego recetën time", "Gjej një mediator shëndetësor"],
      it: ["Salute del cuore e pressione", "Spiega la mia ricetta", "Trova un mediatore sanitario"],
      hr: ["Zdravlje srca i krvni tlak", "Objasni moj recept", "Zdravstveni medijator u blizini"],
      rom: ["O ilo thaj e rateski tensia", "Sikav mange miro receto", "Arakh sastipnasko mediatori"],
      ru: ["Сердце и артериальное давление", "Объясните мой рецепт", "Найти медицинского медиатора"],
    },
  },
  "blood-pressure": {
    standard: {
      ro: "Tensiunea arterială se măsoară după cinci minute de repaus, în poziție așezată, iar pastilele de tensiune se iau zilnic chiar și când te simți bine. Sună la 112 dacă tensiunea foarte mare este însoțită de durere în piept, lipsă de aer, amorțeală sau tulburări de vorbire.",
      en: "Measure blood pressure seated after five minutes of quiet rest, and continue daily blood pressure medicine even when you feel well. Call 112 if very high readings come with chest pain, shortness of breath, numbness, or trouble speaking.",
      sq: "Mate tensionin ulur pas pesë minutash pushim dhe vazhdo barnat e përditshme edhe kur ndihesh mirë. Telefono 112 nëse tensioni shumë i lartë shoqërohet me dhimbje gjoksi, mungesë fryme ose mpirje.",
      it: "Misura la pressione da seduto dopo cinque minuti di riposo e prosegui la terapia quotidiana anche quando ti senti bene. Chiama il 112 se valori molto alti si associano a dolore al petto, fiato corto o difficoltà a parlare.",
      hr: "Krvni tlak mjeri sjedeći nakon pet minuta mirovanja i uzimaj propisanu terapiju svaki dan čak i kad se osjećaš dobro. Nazovi 112 ako se uz vrlo visok tlak javi bol u prsima, zaduha ili utrnulost.",
      rom: "Merisar e tensia beshindoj palal panzh minute hodinipe thaj le o drab sako dives. Akhar 112 te avela dukh ando kolin vaj pharo phurdinimos.",
      ru: "Измеряйте давление сидя после пяти минут покоя и принимайте ежедневные таблетки, даже когда чувствуете себя хорошо. Звоните 112, если высокое давление сопровождается болью в груди, одышкой или онемением.",
    },
    simple: {
      ro: "Măsoară tensiunea la liniște și ia tratamentul în fiecare zi. Sună la 112 dacă ai durere în piept sau nu poți respira bine.",
      en: "Measure blood pressure after resting and take your daily medicine. Call 112 for chest pain or trouble breathing.",
      sq: "Mat tensionin në qetësi dhe merr ilaçet çdo ditë. Telefono 112 nëse ke dhimbje gjoksi.",
      it: "Misura la pressione a riposo e prendi i farmaci ogni giorno. Chiama il 112 per dolore al petto o fiato corto.",
      hr: "Mjeri tlak nakon odmora i uzimaj lijekove svaki dan. Nazovi 112 kod boli u prsima ili teškog disanja.",
      rom: "Merisar e tensia lokhes thaj le o drab sako dives. Akhar 112 vash dukh ando kolin.",
      ru: "Измеряйте давление в покое и принимайте лекарства каждый день. При боли в груди звоните 112.",
    },
    followups: {
      ro: ["Control glicemie și diabet", "Explică-mi rețeta medicală", "Farmacie deschisă acum"],
      en: ["Diabetes and blood glucose", "Explain my prescription", "Open pharmacy near me"],
      sq: ["Diabeti dhe glukoza", "Shpjego recetën time", "Farmaci e hapur tani"],
      it: ["Diabete e glicemia", "Spiega la mia ricetta", "Farmacia aperta adesso"],
      hr: ["Dijabetes i glukoza", "Objasni moj recept", "Dežurna ljekarna u blizini"],
      rom: ["Diabeto thaj glukoza", "Sikav mange miro receto", "Farmaciya putardi akana"],
      ru: ["Диабет и уровень глюкозы", "Объясните мой рецепт", "Дежурная аптека рядом"],
    },
  },
};

export function resolveToolActionLabel(resultId: string, lang: Lang): string | null {
  if (!resultId.startsWith("tool:")) return null;
  const rawId = resultId.slice("tool:".length);
  const tool = SMART_SEARCH_TOOLS.find((item) => item.id === rawId);
  return tool?.actionLabel[lang] ?? null;
}

export function synthesizeGroundedOverview(params: {
  trimmedQuery: string;
  normQuery: string;
  scored: SmartSearchResult[];
  limitedResults: SmartSearchResult[];
  synonyms: SmartSearchSynonymGroup[];
  relatedQuestions: SmartSearchRelatedQuestion[];
  readingLevel: SmartSearchReadingLevel;
  isEmergency: boolean;
  fallbackIntentLead: string;
  cleanText: (value: string) => string;
  normalizeText: (value: string) => string;
  lang: Lang;
}): {
  lead: string;
  steps: string[];
  primaryAction: { label: string; href: string };
  followups: string[];
} | null {
  const {
    normQuery,
    scored,
    limitedResults,
    synonyms,
    relatedQuestions,
    readingLevel,
    fallbackIntentLead,
    cleanText,
    normalizeText,
    lang,
  } = params;

  const copy = getSmartSearchCopy(lang);
  const topOverviewResult = limitedResults[0] ?? scored[0];
  if (!topOverviewResult) return null;

  // 1. Choose the richest grounded lead: canonical clinical synthesis first, then substantive catalog synthesis
  let synthesizedLead = "";
  let matchedBrief: CanonicalClinicalBrief | undefined;

  for (const group of synonyms) {
    const brief = CLINICAL_SYNTHESIS_BY_CANONICAL[group.canonical];
    if (brief) {
      matchedBrief = brief;
      synthesizedLead =
        readingLevel === "simple" ? brief.simple[lang] : brief.standard[lang];
      break;
    }
  }

  if (!synthesizedLead) {
    const contentHit =
      scored.find((item) => item.kind !== "tools" && item.score >= topOverviewResult.score - 24) ??
      topOverviewResult;

    const baseSummary = cleanText(contentHit.summary);
    const distinctStep = contentHit.nextSteps
      .map((s) => cleanText(s))
      .find((s) => s.length >= 18 && s.length <= 140 && !baseSummary.includes(s));

    if (readingLevel === "simple") {
      synthesizedLead = baseSummary;
    } else if (distinctStep && baseSummary.length + distinctStep.length <= 290) {
      const punctuatedBase = /[.!?]$/.test(baseSummary) ? baseSummary : `${baseSummary}.`;
      const punctuatedStep = /[.!?]$/.test(distinctStep) ? distinctStep : `${distinctStep}.`;
      synthesizedLead = `${punctuatedBase} ${punctuatedStep}`;
    } else {
      synthesizedLead = baseSummary || fallbackIntentLead;
    }
  }

  const lead = cleanText(synthesizedLead || fallbackIntentLead);

  // 2. Collect deduplicated, concrete next steps from top matching entries
  const overviewSteps: string[] = [];
  const seenSteps = new Set<string>([normalizeText(lead)]);
  for (const res of scored.slice(0, 5)) {
    if (res.id.startsWith("glossary-romanes:")) continue;
    for (const step of res.nextSteps) {
      const cleanedStep = cleanText(step);
      const normStep = normalizeText(cleanedStep);
      if (cleanedStep && normStep && !seenSteps.has(normStep)) {
        seenSteps.add(normStep);
        overviewSteps.push(cleanedStep);
      }
      if (overviewSteps.length >= 3) break;
    }
    if (overviewSteps.length >= 3) break;
  }

  // 3. Specific, clear primary CTA label preferring interactive tools & guides over myth entries
  const actionTarget =
    scored.slice(0, 3).find((item) => item.kind === "tools" || item.kind === "guides") ??
    topOverviewResult;
  const toolActionLabel = resolveToolActionLabel(actionTarget.id, lang);
  const primaryLabel =
    toolActionLabel && toolActionLabel.length <= 28
      ? toolActionLabel
      : actionTarget.title.length <= 28
        ? actionTarget.title
        : copy.openPageLabel;

  // 4. Context-aware follow-up queries tailored to the active search
  const followups: string[] = [];
  const seenFollowups = new Set<string>([normQuery]);
  const pushFollowup = (candidate: string) => {
    const cleaned = cleanText(candidate);
    const norm = normalizeText(cleaned);
    if (!cleaned || !norm || seenFollowups.has(norm) || cleaned.length > 44) return;
    seenFollowups.add(norm);
    followups.push(cleaned);
  };

  if (matchedBrief) {
    for (const item of matchedBrief.followups[lang]) {
      pushFollowup(item);
      if (followups.length >= 3) break;
    }
  }

  if (followups.length < 3) {
    for (const rq of relatedQuestions) {
      if (rq.question.length <= 42) {
        pushFollowup(rq.question);
      }
      if (followups.length >= 3) break;
    }
  }

  if (followups.length < 3) {
    for (const sibling of scored.slice(1, 5)) {
      if (sibling.title.length <= 36) {
        pushFollowup(sibling.title);
      }
      if (followups.length >= 3) break;
    }
  }

  if (followups.length < 3) {
    for (const pq of copy.popularQueries) {
      pushFollowup(pq);
      if (followups.length >= 3) break;
    }
  }

  return {
    lead,
    steps: overviewSteps,
    primaryAction: {
      label: cleanText(primaryLabel),
      href: actionTarget.href,
    },
    followups: followups.slice(0, 3),
  };
}
