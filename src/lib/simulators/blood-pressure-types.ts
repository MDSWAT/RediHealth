import type { FHIRObservation } from "@/lib/fhir/types/core";
import type { Lang } from "@/lib/i18n/translations";

export type BloodPressureTier =
  | "hypotension"
  | "optimal"
  | "normal"
  | "high_normal"
  | "grade_1_hypertension"
  | "grade_2_hypertension"
  | "grade_3_hypertension"
  | "hypertensive_crisis"
  | "grade1_mild"
  | "grade2_moderate"
  | "grade3_severe"
  | "isolated_systolic";

export interface BloodPressureTierContent {
  label: string;
  physiologicEffect: string;
  actionProtocol: string;
}

export const BLOOD_PRESSURE_TIER_STRINGS: Record<
  | "hypotension"
  | "optimal"
  | "normal"
  | "high_normal"
  | "grade_1_hypertension"
  | "grade_2_hypertension"
  | "grade_3_hypertension"
  | "hypertensive_crisis",
  Record<Lang, BloodPressureTierContent>
> = {
  hypotension: {
    ro: {
      label: "Tensiune mică (hipotensiune)",
      physiologicEffect:
        "Tensiunea ta e mică. Când te ridici repede, creierul poate primi pentru scurt timp mai puțin oxigen.",
      actionProtocol:
        "Dacă te simți bine, de obicei nu e o problemă. Dacă ai amețeli sau slăbiciune, bea apă și ridică-te încet din pat sau de pe scaun. Mergi la medic dacă se repetă.",
    },
    en: {
      label: "Low blood pressure (hypotension)",
      physiologicEffect:
        "Your blood pressure is low. If you stand up fast, your brain can get less oxygen for a moment.",
      actionProtocol:
        "If you feel fine, this is usually not a problem. If you feel dizzy or weak, drink water and stand up slowly. See a doctor if it keeps happening.",
    },
    sq: {
      label: "Tension i ulët (hipotension)",
      physiologicEffect:
        "Tensioni yt është i ulët. Kur ngrihesh shpejt, truri mund të marrë për pak çaste më pak oksigjen.",
      actionProtocol:
        "Nëse ndihesh mirë, zakonisht nuk është problem. Nëse të merren mendtë ose ndihesh i dobët, pi ujë dhe ngrihu ngadalë. Shko te mjeku nëse ndodh shpesh.",
    },
    it: {
      label: "Pressione bassa (ipotensione)",
      physiologicEffect:
        "La tua pressione è bassa. Se ti alzi in fretta, il cervello può ricevere per un attimo meno ossigeno.",
      actionProtocol:
        "Se ti senti bene, di solito non è un problema. Se hai capogiri o ti senti debole, bevi acqua e alzati piano. Vai dal medico se succede spesso.",
    },
    hr: {
      label: "Niski tlak (hipotenzija)",
      physiologicEffect:
        "Tvoj je krvni tlak nizak. Ako naglo ustaneš, mozak na trenutak može dobiti manje kisika.",
      actionProtocol:
        "Ako se osjećaš dobro, to obično nije problem. Ako imaš vrtoglavicu ili slabost, popij vode i ustani polako. Javi se liječniku ako se ponavlja.",
    },
    rom: {
      label: "Cikni tensija (hipotenzija)",
      physiologicEffect:
        "Tiri tensija si cikni. Kana ushtes sigo opre, i godi shaj vash xanci vrjama te lel maj xanci oksigeno.",
      actionProtocol:
        "Te hatjares tut mishto, akava obicno naj problemo. Te phirel tiro shero vaj san slabo, pi pani thaj ushti lokhes. Dzha ko doktori te kerel pes butivar.",
    },
  },

  optimal: {
    ro: {
      label: "Tensiune optimă",
      physiologicEffect:
        "Inima și arterele lucrează fără efort în plus. Riscul de boli de inimă pe termen lung e foarte mic.",
      actionProtocol:
        "Rămâi activ, mănâncă puțină sare și puțină grăsime și măsoară-ți tensiunea o dată pe an.",
    },
    en: {
      label: "Optimal blood pressure",
      physiologicEffect:
        "Your heart and arteries work without extra strain. Your long-term risk of heart disease is very low.",
      actionProtocol:
        "Stay active, eat less salt and fatty food, and check your blood pressure once a year.",
    },
    sq: {
      label: "Tension optimal",
      physiologicEffect:
        "Zemra dhe arteriet punojnë pa lodhje të tepërt. Rreziku për sëmundje të zemrës në të ardhmen është shumë i ulët.",
      actionProtocol:
        "Qëndro aktiv, ha më pak kripë dhe yndyrë dhe mate tensionin një herë në vit.",
    },
    it: {
      label: "Pressione ottimale",
      physiologicEffect:
        "Cuore e arterie lavorano senza sforzo in più. Il rischio di malattie del cuore nel tempo è molto basso.",
      actionProtocol:
        "Resta attivo, mangia meno sale e meno grassi e misura la pressione una volta all'anno.",
    },
    hr: {
      label: "Optimalni tlak",
      physiologicEffect:
        "Tvoje srce i arterije rade bez dodatnog napora. Dugoročni rizik od bolesti srca vrlo je nizak.",
      actionProtocol:
        "Ostani aktivan, jedi manje soli i masne hrane te izmjeri krvni tlak jednom godišnje.",
    },
    rom: {
      label: "Optimalno tensija",
      physiologicEffect:
        "Tiro ilo thaj e arterije keren buchi bi maj bare pharipnasko. O riziko vash nasvalipena e ileske si but cikno.",
      actionProtocol:
        "Ačhov aktivno, xa maj xanci lon thaj khil, thaj dikh tiri tensija jekhvar ko bersh.",
    },
  },

  normal: {
    ro: {
      label: "Tensiune normală",
      physiologicEffect:
        "Tensiunea ta e în limite normale.",
      actionProtocol:
        "Mănâncă sub 5 grame de sare pe zi și mișcă-te în fiecare zi.",
    },
    en: {
      label: "Normal blood pressure",
      physiologicEffect:
        "Your blood pressure is in the normal range.",
      actionProtocol:
        "Eat less than 5 grams of salt a day and move every day.",
    },
    sq: {
      label: "Tension normal",
      physiologicEffect:
        "Tensioni yt është brenda kufijve normalë.",
      actionProtocol:
        "Ha më pak se 5 gram kripë në ditë dhe lëviz çdo ditë.",
    },
    it: {
      label: "Pressione normale",
      physiologicEffect:
        "La tua pressione è nei limiti normali.",
      actionProtocol:
        "Mangia meno di 5 grammi di sale al giorno e muoviti ogni giorno.",
    },
    hr: {
      label: "Normalni tlak",
      physiologicEffect:
        "Tvoj je krvni tlak u granicama normale.",
      actionProtocol:
        "Jedi manje od 5 grama soli dnevno i kreći se svaki dan.",
    },
    rom: {
      label: "Normalno tensija",
      physiologicEffect:
        "Tiri tensija si ande normalne granice.",
      actionProtocol:
        "Xa maj xanci katar 5 grama lon ko dives thaj phir sako dives.",
    },
  },

  high_normal: {
    ro: {
      label: "Tensiune normal-înaltă",
      physiologicEffect:
        "Arterele tale suportă o presiune mai mare, iar inima muncește mai mult.",
      actionProtocol:
        "Mănâncă mai puțină sare, renunță la fumat dacă fumezi și bea mai puțin alcool. Măsoară-ți tensiunea o dată pe lună, la dispensar sau la farmacie.",
    },
    en: {
      label: "High-normal blood pressure",
      physiologicEffect:
        "Your artery walls are under more pressure, so your heart works harder.",
      actionProtocol:
        "Eat less salt, stop smoking if you smoke, and drink less alcohol. Check your blood pressure once a month at a pharmacy or clinic.",
    },
    sq: {
      label: "Tension normal i lartë",
      physiologicEffect:
        "Muret e arterieve janë nën më shumë presion dhe zemra punon më shumë.",
      actionProtocol:
        "Ha më pak kripë, lëre duhanin nëse pi dhe pi më pak alkool. Mate tensionin një herë në muaj në farmaci ose në ambulancë.",
    },
    it: {
      label: "Pressione normale-alta",
      physiologicEffect:
        "Le pareti delle arterie sono sotto più pressione e il cuore fa più fatica.",
      actionProtocol:
        "Mangia meno sale, smetti di fumare se fumi e bevi meno alcol. Misura la pressione una volta al mese, in farmacia o dal medico.",
    },
    hr: {
      label: "Visoko normalni tlak",
      physiologicEffect:
        "Stijenke tvojih arterija pod većim su pritiskom pa srce radi teže.",
      actionProtocol:
        "Jedi manje soli, prestani pušiti ako pušiš i pij manje alkohola. Izmjeri tlak jednom mjesečno u ljekarni ili ordinaciji.",
    },
    rom: {
      label: "Uchi-normalno tensija",
      physiologicEffect:
        "E zidura tire arterijenge si tela maj baro tasavimos, thaj o ilo kerel maj phari buchi.",
      actionProtocol:
        "Xa maj xanci lon, mukh o thuvjarimos te thuvjares thaj pi maj xanci alkoholi. Dikh tiri tensija jekhvar ko chon ki farmacija vaj ko doktori.",
    },
  },

  grade_1_hypertension: {
    ro: {
      label: "Tensiune mare (hipertensiune) gradul 1",
      physiologicEffect:
        "Vasele de sânge sunt mereu sub presiune. Așa se depun mai ușor grăsimi pe pereții arterelor.",
      actionProtocol:
        "Fă o programare la medicul de familie. Ca să confirme, îți poate cere să măsori tensiunea acasă 7 zile sau să porți un aparat Holter de tensiune.",
    },
    en: {
      label: "High blood pressure (hypertension) grade 1",
      physiologicEffect:
        "Your blood vessels are under constant strain. This helps fatty plaque build up in the arteries.",
      actionProtocol:
        "Make an appointment with your family doctor. To confirm it, they may ask you to measure at home for 7 days or wear a 24-hour Holter monitor.",
    },
    sq: {
      label: "Tension i lartë (hipertension) shkalla 1",
      physiologicEffect:
        "Enët e gjakut janë vazhdimisht nën presion. Kështu yndyra ngjitet më lehtë në muret e arterieve.",
      actionProtocol:
        "Cakto një vizitë te mjeku i familjes. Për ta konfirmuar, mund të të kërkojë ta masësh tensionin në shtëpi 7 ditë ose të mbash një aparat Holter.",
    },
    it: {
      label: "Pressione alta (ipertensione) grado 1",
      physiologicEffect:
        "I vasi sanguigni sono sempre sotto sforzo. Così si formano più facilmente placche di grasso nelle arterie.",
      actionProtocol:
        "Prenota una visita dal medico di famiglia. Per confermarlo, può chiederti di misurare la pressione a casa per 7 giorni o di portare un Holter pressorio.",
    },
    hr: {
      label: "Visoki tlak (hipertenzija) 1. stupnja",
      physiologicEffect:
        "Tvoje su krvne žile stalno pod pritiskom. Tako se masne naslage lakše nakupljaju na stijenkama arterija.",
      actionProtocol:
        "Naruči se kod obiteljskog liječnika. Za potvrdu ti može predložiti mjerenje tlaka kod kuće 7 dana ili 24-satni Holter tlaka.",
    },
    rom: {
      label: "Uchi tensija (hipertenzija) 1. stepeni",
      physiologicEffect:
        "E rateske droma si sajekh tela tasavimos. Kadja o khil ačhel maj lokhes pe arterije.",
      actionProtocol:
        "Ker termin ko familijako doktori. Te dikhel sigurno, shaj te mangel te merisares i tensija khere 7 dive vaj te phiraves 24-orengo Holter.",
    },
  },

  grade_2_hypertension: {
    ro: {
      label: "Tensiune mare (hipertensiune) gradul 2",
      physiologicEffect:
        "Crește mult riscul de a-ți afecta inima, creierul, rinichii și ochii.",
      actionProtocol:
        "Mergi curând la medicul de familie sau la cardiolog. De obicei e nevoie de tratament cu medicamente.",
    },
    en: {
      label: "High blood pressure (hypertension) grade 2",
      physiologicEffect:
        "There is a real risk of damage to your heart, brain, kidneys and eyes.",
      actionProtocol:
        "See your family doctor or a cardiologist soon. You will usually need medicine.",
    },
    sq: {
      label: "Tension i lartë (hipertension) shkalla 2",
      physiologicEffect:
        "Rritet shumë rreziku për dëmtim të zemrës, trurit, veshkave dhe syve.",
      actionProtocol:
        "Shko shpejt te mjeku i familjes ose te kardiologu. Zakonisht duhen ilaçe.",
    },
    it: {
      label: "Pressione alta (ipertensione) grado 2",
      physiologicEffect:
        "C'è un rischio concreto di danni a cuore, cervello, reni e occhi.",
      actionProtocol:
        "Vai presto dal medico di famiglia o dal cardiologo. Di solito servono farmaci.",
    },
    hr: {
      label: "Visoki tlak (hipertenzija) 2. stupnja",
      physiologicEffect:
        "Postoji znatan rizik od oštećenja srca, mozga, bubrega i očiju.",
      actionProtocol:
        "Uskoro posjeti obiteljskog liječnika ili kardiologa. Obično je potrebno liječenje lijekovima.",
    },
    rom: {
      label: "Uchi tensija (hipertenzija) 2. stepeni",
      physiologicEffect:
        "Barjol but o riziko te dukhavel tiro ilo, i godi, e bobrege thaj e jakha.",
      actionProtocol:
        "Dzha sigo ko familijako doktori vaj ko kardiologo. Obicno trubul sastjarimos drabenca.",
    },
  },

  grade_3_hypertension: {
    ro: {
      label: "Tensiune foarte mare (hipertensiune) gradul 3",
      physiologicEffect:
        "Tensiunea foarte mare pune în pericol vasele de sânge din creier și din inimă.",
      actionProtocol:
        "Valoarea e foarte mare (180/120 mmHg sau mai mult). Stai liniștit 5 minute și măsoară din nou. Dacă rămâne la 180/120 mmHg sau mai mult, sună imediat la medicul de familie sau la centrul de permanență, ori mergi la camera de gardă.",
    },
    en: {
      label: "Very high blood pressure (hypertension) grade 3",
      physiologicEffect:
        "Pressure this high puts the blood vessels in your brain and heart in danger.",
      actionProtocol:
        "This is very high (180/120 mmHg or more). Sit quietly for 5 minutes and measure again. If it is still 180/120 mmHg or more, call your doctor or an out-of-hours clinic now, or go to the emergency department.",
    },
    sq: {
      label: "Tension shumë i lartë (hipertension) shkalla 3",
      physiologicEffect:
        "Tensioni kaq i lartë rrezikon enët e gjakut në tru dhe në zemër.",
      actionProtocol:
        "Vlera është shumë e lartë (180/120 mmHg ose më shumë). Rri ulur i qetë 5 minuta dhe mate përsëri. Nëse mbetet 180/120 mmHg ose më shumë, lajmëro menjëherë mjekun ose shko në urgjencë.",
    },
    it: {
      label: "Pressione molto alta (ipertensione) grado 3",
      physiologicEffect:
        "Una pressione così alta mette in pericolo i vasi del cervello e del cuore.",
      actionProtocol:
        "Il valore è molto alto (180/120 mmHg o più). Stai seduto tranquillo 5 minuti e misura di nuovo. Se resta a 180/120 mmHg o più, chiama subito la guardia medica o vai al pronto soccorso.",
    },
    hr: {
      label: "Vrlo visoki tlak (hipertenzija) 3. stupnja",
      physiologicEffect:
        "Ovako visok tlak ugrožava krvne žile u tvom mozgu i srcu.",
      actionProtocol:
        "Vrijednost je vrlo visoka (180/120 mmHg ili više). Sjedni mirno 5 minuta i ponovno izmjeri. Ako ostane 180/120 mmHg ili više, odmah nazovi obiteljskog liječnika ili dežurnu ambulantu, ili idi na hitni prijem.",
    },
    rom: {
      label: "But uchi tensija (hipertenzija) 3. stepeni",
      physiologicEffect:
        "Kadja uchi tensija čhivel ando riziko e rateske droma andi godi thaj ando ilo.",
      actionProtocol:
        "O numero si but baro (180/120 mmHg vaj maj but). Besh mirno 5 minute thaj merisar pale. Te ačhel 180/120 mmHg vaj maj but, akhar sigo tire doktores vaj dzha ki bolnitsaki sigardiari.",
    },
  },

  hypertensive_crisis: {
    ro: {
      label: "Criză hipertensivă (urgență)",
      physiologicEffect:
        "Tensiunea atât de mare poate da apă la plămâni, sângerare în creier sau o ruptură în peretele aortei.",
      actionProtocol:
        "Sună acum la 112 de pe telefonul tău. Stai jos și încearcă să rămâi calm. Nu lua doze duble de medicamente dacă nu îți spune operatorul de la 112.",
    },
    en: {
      label: "Hypertensive crisis (emergency)",
      physiologicEffect:
        "Pressure this high can cause fluid in the lungs, bleeding in the brain or a tear in the aorta.",
      actionProtocol:
        "Call 112 from your phone now. Sit down and try to stay calm. Do not take a double dose of your medicine unless the 112 operator tells you to.",
    },
    sq: {
      label: "Krizë hipertensive (urgjencë)",
      physiologicEffect:
        "Tensioni kaq i lartë mund të shkaktojë ujë në mushkëri, gjakderdhje në tru ose çarje të aortës.",
      actionProtocol:
        "Telefono tani 112 nga telefoni yt. Rri ulur dhe përpiqu të qëndrosh i qetë. Mos merr doza të dyfishta ilaçesh nëse nuk ta thotë operatori i 112.",
    },
    it: {
      label: "Crisi ipertensiva (emergenza)",
      physiologicEffect:
        "Una pressione così alta può causare acqua nei polmoni, emorragia nel cervello o una lacerazione dell'aorta.",
      actionProtocol:
        "Chiama subito il 112 dal tuo telefono. Stai seduto e cerca di restare calmo. Non prendere dosi doppie di farmaci se non te lo dice l'operatore del 112.",
    },
    hr: {
      label: "Hipertenzivna kriza (hitno stanje)",
      physiologicEffect:
        "Ovako visok tlak može izazvati vodu u plućima, krvarenje u mozgu ili puknuće stijenke aorte.",
      actionProtocol:
        "Odmah nazovi 112 sa svog telefona. Sjedni i pokušaj ostati miran. Ne uzimaj dvostruku dozu lijeka osim ako ti to ne kaže operater na 112.",
    },
    rom: {
      label: "Hipertenzivno kriza (sigardiari)",
      physiologicEffect:
        "Kadja uchi tensija shaj te anel pani ko phuka, ratjarimos andi godi vaj pharavimos ki aorta.",
      actionProtocol:
        "Akhar akana 112 katar tiro telefono. Besh tele thaj ačhov mirno. Ma le dujvar maj bari doza katar i drab te na phenel tuke o operatori katar 112.",
    },
  },
};

export const BP_PRESET_STRINGS: Record<
  "optimal" | "high_normal" | "grade_1" | "grade_2" | "crisis",
  Record<Lang, string>
> = {
  optimal: {
    ro: "Optim (115/75)",
    en: "Optimal (115/75)",
    sq: "Optimal (115/75)",
    it: "Ottimale (115/75)",
    hr: "Optimalni (115/75)",
    rom: "Optimalno (115/75)",
  },
  high_normal: {
    ro: "Normal-înalt (135/85)",
    en: "High-normal (135/85)",
    sq: "Normal i lartë (135/85)",
    it: "Normale-alta (135/85)",
    hr: "Visoko normalni (135/85)",
    rom: "Ucho-normalno (135/85)",
  },
  grade_1: {
    ro: "Gradul 1 (148/94)",
    en: "Grade 1 (148/94)",
    sq: "Shkalla 1 (148/94)",
    it: "Grado 1 (148/94)",
    hr: "1. stupanj (148/94)",
    rom: "1. stepeni (148/94)",
  },
  grade_2: {
    ro: "Gradul 2 (165/102)",
    en: "Grade 2 (165/102)",
    sq: "Shkalla 2 (165/102)",
    it: "Grado 2 (165/102)",
    hr: "2. stupanj (165/102)",
    rom: "2. stepeni (165/102)",
  },
  crisis: {
    ro: "Urgență (185/122)",
    en: "Emergency (185/122)",
    sq: "Urgjencë (185/122)",
    it: "Emergenza (185/122)",
    hr: "Hitno stanje (185/122)",
    rom: "Sigardiari (185/122)",
  },
};

export const BP_SIMULATOR_UI_STRINGS = {
  guidelineBadge: {
    ro: "Grupele de tensiune urmează ghidul european ESC 2024, folosit și de Societatea Română de Cardiologie.",
    en: "The blood pressure groups follow the 2024 guidelines of the European Society of Cardiology (ESC).",
    sq: "Grupet e tensionit ndjekin udhëzuesin e vitit 2024 të Shoqatës Evropiane të Kardiologjisë (ESC).",
    it: "I gruppi di pressione seguono le linee guida 2024 della Società Europea di Cardiologia (ESC).",
    hr: "Skupine krvnog tlaka prate smjernice Europskog kardiološkog društva (ESC) iz 2024. godine.",
    rom: "E grupe e tensijake dzhan pala o 2024 sikavimos e Evropake Kardiologikane Amalipnasko (ESC).",
  },
  title: {
    ro: "Ce înseamnă tensiunea ta",
    en: "What your blood pressure means",
    sq: "Çfarë do të thotë tensioni yt",
    it: "Cosa significa la tua pressione",
    hr: "Što znači tvoj krvni tlak",
    rom: "So znachil tiri tensija",
  },
  subtitle: {
    ro: "Mută cele două bare la valorile tale. Vezi ce înseamnă și ce să faci. Dacă cele două numere sunt în grupe diferite, contează grupa mai gravă.",
    en: "Move the two sliders to your numbers. You will see what they mean and what to do. If the two numbers fall in different groups, the more serious one counts.",
    sq: "Lëviz dy shiritat te vlerat e tua. Do të shohësh çfarë do të thonë dhe çfarë të bësh. Nëse dy numrat bien në grupe të ndryshme, vlen grupi më i rëndë.",
    it: "Sposta le due barre sui tuoi valori. Vedrai cosa significano e cosa fare. Se i due numeri sono in gruppi diversi, conta quello più grave.",
    hr: "Pomakni obje trake na svoje vrijednosti. Vidjet ćeš što znače i što učiniti. Ako su dva broja u različitim skupinama, vrijedi ozbiljnija skupina.",
    rom: "Phirav e duj linije ko tire numere. Ka dikhes so znachinen thaj so te keres. Te si e duj numere ande aver grupe, ginavel pes i maj phari grupa.",
  },
  quickExamples: {
    ro: "Exemple:",
    en: "Examples:",
    sq: "Shembuj:",
    it: "Esempi:",
    hr: "Primjeri:",
    rom: "Primerura:",
  },
  systolicLabel: {
    ro: "Numărul mare (sistolică)",
    en: "Top number (systolic)",
    sq: "Numri i madh (sistolik)",
    it: "Numero alto (sistolica)",
    hr: "Gornji broj (sistolički)",
    rom: "Baro numero (sistolikano)",
  },
  systolicSubtext: {
    ro: "Presiunea din artere când inima se strânge.",
    en: "The pressure in your arteries when your heart squeezes.",
    sq: "Presioni në arterie kur zemra shtrëngohet.",
    it: "La pressione nelle arterie quando il cuore si contrae.",
    hr: "Tlak u arterijama kada se srce stisne.",
    rom: "O tasavimos ande arterije kana o ilo kidel pes.",
  },
  diastolicLabel: {
    ro: "Numărul mic (diastolică)",
    en: "Bottom number (diastolic)",
    sq: "Numri i vogël (diastolik)",
    it: "Numero basso (diastolica)",
    hr: "Donji broj (dijastolički)",
    rom: "Cikno numero (dijastolikano)",
  },
  diastolicSubtext: {
    ro: "Presiunea din artere când inima se odihnește între bătăi.",
    en: "The pressure in your arteries when your heart rests between beats.",
    sq: "Presioni në arterie kur zemra pushon mes rrahjeve.",
    it: "La pressione nelle arterie quando il cuore riposa tra un battito e l'altro.",
    hr: "Tlak u arterijama dok se srce odmara između otkucaja.",
    rom: "O tasavimos ande arterije kana o ilo hodinisarel mashkar o marimos.",
  },
  redFlagCheckbox: {
    ro: "Bifează dacă ai și: durere sau apăsare în piept, lipsă bruscă de aer, vedere încețoșată, amorțeală pe o parte a corpului sau durere de cap foarte puternică.",
    en: "Tick this if you also have chest pain or tightness, sudden shortness of breath, blurred vision, numbness on one side of the body, or a very bad headache.",
    sq: "Shëno nëse ke edhe: dhimbje ose shtrëngim në gjoks, mungesë të papritur ajri, shikim të turbullt, mpirje në njërën anë të trupit ose dhimbje shumë të fortë koke.",
    it: "Spunta se hai anche: dolore o peso al petto, fiato corto all'improvviso, vista annebbiata, intorpidimento su un lato del corpo o un mal di testa molto forte.",
    hr: "Označi ako uz to imaš bol ili pritisak u prsima, nagli nedostatak zraka, zamućen vid, utrnulost jedne strane tijela ili jako snažnu glavobolju.",
    rom: "Semnisar te si tut vi: dukh vaj tasavimos ko kolin, sigo phari phurdinimos, kalo dikhiben, pamortimos pe jekh rig e truposki vaj but zurali dukh ko shero.",
  },
  physiologicLabel: {
    ro: "Ce se întâmplă în corp:",
    en: "What happens in your body:",
    sq: "Çfarë ndodh në trup:",
    it: "Cosa succede nel corpo:",
    hr: "Što se događa u tijelu:",
    rom: "So kerel pes ando trupo:",
  },
  actionProtocolLabel: {
    ro: "Ce să faci:",
    en: "What to do:",
    sq: "Çfarë të bësh:",
    it: "Cosa fare:",
    hr: "Što učiniti:",
    rom: "So te keres:",
  },
  emergencyNotice: {
    ro: "Sună tu la 112. Aplicația nu sună în locul tău.",
    en: "Call 112 yourself. The app does not call for you.",
    sq: "Telefono vetë në 112. Aplikacioni nuk telefonon për ty.",
    it: "Chiama tu il 112. L'app non chiama al posto tuo.",
    hr: "Sam nazovi 112. Aplikacija ne zove umjesto tebe.",
    rom: "Akhar tu 112. I aplikacija na akharel namesto tute.",
  },
  call112Btn: {
    ro: "Sună la 112",
    en: "Call 112",
    sq: "Telefono 112",
    it: "Chiama il 112",
    hr: "Nazovi 112",
    rom: "Akhar 112",
  },
};

export const ESH_STEPPER_STRINGS = {
  headerEyebrow: {
    ro: "După ghidul ESH (Societatea Europeană de Hipertensiune)",
    en: "Based on the European Society of Hypertension (ESH)",
    sq: "Sipas Shoqatës Evropiane të Hipertensionit (ESH)",
    it: "Secondo la Società Europea dell'Ipertensione (ESH)",
    hr: "Prema smjernicama Europskog društva za hipertenziju (ESH)",
    rom: "Pala o sikavimos e Evropake Amalipnasko vash Hipertenzija (ESH)",
  },
  headerTitle: {
    ro: "Cum îți măsori corect tensiunea acasă",
    en: "How to measure your blood pressure at home",
    sq: "Si ta masësh saktë tensionin në shtëpi",
    it: "Come misurare bene la pressione a casa",
    hr: "Kako pravilno izmjeriti krvni tlak kod kuće",
    rom: "Sar te merisares čačes tiri tensija khere",
  },
  prevStep: {
    ro: "Înapoi",
    en: "Back",
    sq: "Kthehu",
    it: "Indietro",
    hr: "Natrag",
    rom: "Palpale",
  },
  nextStep: {
    ro: "Pasul următor",
    en: "Next step",
    sq: "Hapi tjetër",
    it: "Passo successivo",
    hr: "Sljedeći korak",
    rom: "Aver drom",
  },
  stepPrefix: {
    ro: "Pasul",
    en: "Step",
    sq: "Hapi",
    it: "Passo",
    hr: "Korak",
    rom: "Drom",
  },
  actionLabel: {
    ro: "Ce faci:",
    en: "What to do:",
    sq: "Çfarë të bësh:",
    it: "Cosa fare:",
    hr: "Što činiš:",
    rom: "So keres:",
  },
  goodToKnowLabel: {
    ro: "Bine de știut",
    en: "Good to know",
    sq: "Mirë ta dish",
    it: "Da sapere",
    hr: "Dobro je znati",
    rom: "Mishto te dzhanes",
  },
  mistakeLabel: {
    ro: "Greșeală frecventă",
    en: "Common mistake",
    sq: "Gabim i shpeshtë",
    it: "Errore comune",
    hr: "Česta pogreška",
    rom: "Butivar dosh",
  },
  steps: [
    {
      number: 1,
      title: {
        ro: "Odihnește-te 5 minute înainte",
        en: "Rest for 5 minutes first",
        sq: "Pusho 5 minuta më parë",
        it: "Riposa 5 minuti prima",
        hr: "Najprije se odmori 5 minuta",
        rom: "Anglal hodinisar 5 minute",
      },
      action: {
        ro: "Cu 30 de minute înainte, nu bea cafea, nu fuma și nu face efort. Mergi la toaletă. Apoi stai pe scaun 5 minute, liniștit și fără să vorbești.",
        en: "For 30 minutes before, skip coffee, smoking and exercise. Go to the toilet. Then sit quietly in a chair for 5 minutes without talking.",
        sq: "30 minuta para matjes, mos pi kafe, mos pi duhan dhe mos bëj sforcime. Shko në tualet. Pastaj rri ulur i qetë 5 minuta pa folur.",
        it: "Nei 30 minuti prima, niente caffè, fumo o sforzi. Vai in bagno. Poi siediti tranquillo per 5 minuti senza parlare.",
        hr: "30 minuta prije mjerenja nemoj piti kavu, pušiti ni vježbati. Idi na toalet. Zatim mirno sjedni na stolac 5 minuta bez razgovora.",
        rom: "30 minute anglal, ma pi kafava, ma thuvjar thaj ma ker phari buchi. Dzha ko toaleto. Porme besh mirno pe skamin 5 minute bi te des duma.",
      },
      doctorTip: {
        ro: "Vezica plină sau o discuție aprinsă pot crește tensiunea cu 10–15 mmHg.",
        en: "A full bladder or a lively chat can push your reading up by 10–15 mmHg.",
        sq: "Fshikëza e mbushur ose një bisedë e gjallë mund ta rrisin tensionin me 10–15 mmHg.",
        it: "La vescica piena o una conversazione animata possono alzare la pressione di 10–15 mmHg.",
        hr: "Pun mjehur ili živahan razgovor mogu povisiti tlak za 10–15 mmHg.",
        rom: "Phpherdo murtheruno vaj zurali duma shaj te vazden i tensija vash 10–15 mmHg.",
      },
      mistakeToAvoid: {
        ro: "Nu măsura imediat după ce ai urcat scări, ai cărat sacoșe sau te-ai certat cu cineva.",
        en: "Do not measure right after climbing stairs, carrying heavy bags or an argument.",
        sq: "Mos e mat menjëherë pasi ke ngjitur shkallë, ke mbajtur çanta të rënda ose je zënë me dikë.",
        it: "Non misurare subito dopo aver fatto le scale, portato borse pesanti o litigato.",
        hr: "Nemoj mjeriti odmah nakon penjanja uz stepenice, nošenja teških vrećica ili svađe.",
        rom: "Ma merisar sigo pala so inkliljan pe skale, ingerdjan phare gono vaj xingjardjan tut varekasaja.",
      },
    },
    {
      number: 2,
      title: {
        ro: "Cum stai pe scaun",
        en: "How to sit",
        sq: "Si të ulesh",
        it: "Come sederti",
        hr: "Kako sjediti",
        rom: "Sar te beshes",
      },
      action: {
        ro: "Stai pe un scaun cu spătar, cu spatele drept și tălpile pe podea. Sprijină brațul pe masă. Mijlocul manșetei trebuie să fie la nivelul inimii.",
        en: "Sit on a chair with a backrest, back straight, feet flat on the floor. Rest your arm on a table. The middle of the cuff should be level with your heart.",
        sq: "Ulu në një karrige me mbështetëse, me shpinën drejt dhe këmbët në dysheme. Mbështet krahun në tavolinë. Mesi i manshetës duhet të jetë në nivelin e zemrës.",
        it: "Siediti su una sedia con lo schienale, schiena dritta e piedi a terra. Appoggia il braccio sul tavolo. Il centro del bracciale deve essere all'altezza del cuore.",
        hr: "Sjedni na stolac s naslonom, uspravnih leđa i stopala ravno na podu. Osloni ruku na stol. Sredina manžete treba biti u razini srca.",
        rom: "Besh pe skamin, o dumo vorta thaj e pindre tele pe phuv. Čhiv o vast pe skafidi. O mashkar e manshetako musaj te avel ko nivelo e ilesko.",
      },
      doctorTip: {
        ro: "Dacă brațul atârnă pe lângă corp, aparatul arată o valoare mai mare decât cea reală.",
        en: "If your arm hangs down by your side, the monitor shows a higher number than your real one.",
        sq: "Nëse krahu varet poshtë, aparati tregon një vlerë më të lartë se e vërteta.",
        it: "Se il braccio pende lungo il corpo, l'apparecchio segna un valore più alto di quello vero.",
        hr: "Ako ti ruka visi uz tijelo, tlakomjer pokazuje višu vrijednost od stvarne.",
        rom: "Te mukhes o vast te umbladjol pasha o trupo, o aparato sikavel maj baro numero katar o čačuno.",
      },
      mistakeToAvoid: {
        ro: "Nu ține picioarele încrucișate. Așa se strâng venele și tensiunea crește.",
        en: "Do not cross your legs. It squeezes the veins and raises your blood pressure.",
        sq: "Mos i kryqëzo këmbët. Kjo shtrëngon venat dhe rrit tensionin.",
        it: "Non accavallare le gambe. Schiaccia le vene e alza la pressione.",
        hr: "Nemoj prekrižiti noge. To stišće vene i povisuje krvni tlak.",
        rom: "Ma čhiv jekh punro upral o aver. Kadja tasaven pes e vene thaj barjol i tensija.",
      },
    },
    {
      number: 3,
      title: {
        ro: "Pune manșeta pe piele",
        en: "Put the cuff on bare skin",
        sq: "Vendose manshetën mbi lëkurë",
        it: "Metti il bracciale sulla pelle",
        hr: "Stavi manžetu na golu kožu",
        rom: "Čhiv i mansheta pe nangi morti",
      },
      action: {
        ro: "Pune manșeta direct pe piele, la 2–3 cm deasupra cotului. Furtunul trebuie să fie pe mijlocul brațului. Strânge-o cât să încapă un deget sub ea.",
        en: "Put the cuff straight on your skin, 2–3 cm above the elbow. The tube should run down the middle of your arm. Fasten it so one finger fits underneath.",
        sq: "Vendose manshetën drejt mbi lëkurë, 2–3 cm mbi bërryl. Tubi duhet të jetë në mes të krahut. Shtrëngoje sa të futet një gisht poshtë saj.",
        it: "Metti il bracciale direttamente sulla pelle, 2–3 cm sopra il gomito. Il tubo deve stare al centro del braccio. Stringilo in modo che sotto passi un dito.",
        hr: "Stavi manžetu izravno na kožu, 2–3 cm iznad lakta. Cjevčica treba ići sredinom ruke. Zategni je toliko da ispod nje stane jedan prst.",
        rom: "Čhiv i mansheta vorta pe morti, 2–3 cm opral o kohni. O cjevo musaj te dzhal ko mashkar e vastesko. Phand la kadja te del jekh naj telal.",
      },
      doctorTip: {
        ro: "Folosește un tensiometru electronic de braț, verificat clinic. Nu unul de încheietură.",
        en: "Use a clinically tested upper-arm monitor, not a wrist one.",
        sq: "Përdor një aparat elektronik për krah, të testuar klinikisht. Jo për kyçin e dorës.",
        it: "Usa un misuratore elettronico da braccio, validato clinicamente. Non da polso.",
        hr: "Koristi klinički provjeren digitalni tlakomjer za nadlakticu, a ne za zapešće.",
        rom: "Labyar klinikano dikhlo digitalno tensiometro vash o vast, na vash o globi e vastesko.",
      },
      mistakeToAvoid: {
        ro: "Nu sufleca o mânecă strâmtă care îți strânge brațul. Nu pune manșeta peste haine groase.",
        en: "Do not roll up a tight sleeve that squeezes your arm. Never put the cuff over thick clothes.",
        sq: "Mos e përvish një mëngë të ngushtë që të shtrëngon krahun. Mos e vendos manshetën mbi rroba të trasha.",
        it: "Non arrotolare una manica stretta che ti stringe il braccio. Non mettere il bracciale sopra vestiti spessi.",
        hr: "Nemoj podvrnuti uski rukav koji ti stišće ruku. Nikada ne stavljaj manžetu preko debele odjeće.",
        rom: "Ma vazde opre tang baj savo tasavel tiro vast. Shoha ma čhiv i mansheta upral thule gada.",
      },
    },
    {
      number: 4,
      title: {
        ro: "Măsoară de 2 ori și notează",
        en: "Measure twice and write it down",
        sq: "Mate 2 herë dhe shëno",
        it: "Misura 2 volte e scrivi",
        hr: "Izmjeri 2 puta i zapiši",
        rom: "Merisar 2 droma thaj ramosar",
      },
      action: {
        ro: "Pornește aparatul. Nu te mișca și nu vorbi până se dezumflă manșeta. Așteaptă 1–2 minute și măsoară din nou. Notează ambele valori și pulsul.",
        en: "Start the monitor. Stay still and quiet until the cuff goes down. Wait 1–2 minutes and measure again. Write down both readings and your pulse.",
        sq: "Ndize aparatin. Mos lëviz dhe mos fol derisa manshetja të shfryhet. Prit 1–2 minuta dhe mate përsëri. Shëno të dyja vlerat dhe pulsin.",
        it: "Accendi l'apparecchio. Resta fermo e in silenzio finché il bracciale si sgonfia. Aspetta 1–2 minuti e misura di nuovo. Scrivi i due valori e il battito.",
        hr: "Uključi tlakomjer. Budi miran i tih dok se manžeta ne ispuše. Pričekaj 1–2 minute i ponovno izmjeri. Zapiši obje vrijednosti i puls.",
        rom: "Muk o aparato. Ma phir thaj ma de duma dzhi kaj i mansheta na mukhel i balval. Azhuker 1–2 minute thaj merisar pale. Ramosar solduj numere thaj o pulso.",
      },
      doctorTip: {
        ro: "Prima valoare iese des puțin mai mare, din emoție. A doua arată mai bine tensiunea ta reală.",
        en: "The first reading is often a bit higher because you are tense. The second one shows your real pressure better.",
        sq: "Vlera e parë shpesh del pak më e lartë nga emocioni. E dyta tregon më mirë tensionin tënd të vërtetë.",
        it: "Il primo valore spesso è un po' più alto per l'emozione. Il secondo mostra meglio la tua pressione reale.",
        hr: "Prva je vrijednost često malo viša zbog napetosti. Druga bolje pokazuje tvoj stvarni tlak.",
        rom: "O angluno numero butivar ikljol zalog maj baro katar i dar. O dujto sikavel maj mishto tiri čačuni tensija.",
      },
      mistakeToAvoid: {
        ro: "Nu lua o doză în plus de medicament după o singură valoare mare. Întreabă întâi medicul.",
        en: "Never take an extra dose of your medicine after one high reading. Ask your doctor first.",
        sq: "Mos merr kurrë një dozë shtesë ilaçi pas një vlere të vetme të lartë. Pyet më parë mjekun.",
        it: "Non prendere mai una dose in più di farmaco dopo un solo valore alto. Chiedi prima al medico.",
        hr: "Nikada ne uzimaj dodatnu dozu lijeka nakon samo jednog visokog mjerenja. Najprije pitaj liječnika.",
        rom: "Shoha ma le maj bari doza katar i drab pala samo jekh ucho merimos. Phuch anglal tire doktores.",
      },
    },
  ],
};

export interface BloodPressureEvaluation {
  systolic: number;
  diastolic: number;
  pulse?: number;
  tier: BloodPressureTier;
  label: Record<Lang, string>;
  labelRo: string;
  badgeTone: "ruby" | "sage" | "amber";
  physiologicEffect: Record<Lang, string>;
  physiologicEffectRo: string;
  actionProtocol: Record<Lang, string>;
  actionProtocolRo: string;
  isEmergency112: boolean;
  isIsolatedSystolic?: boolean;
  loincCode: "85354-9";
}

export interface EvaluateBloodPressureOptions {
  hasRedFlags?: boolean;
  lang?: Lang;
}

/**
 * Evaluates systolic and diastolic blood pressure according to ESC/SRC 2024 guidelines:
 * - Isolated systolic hypertension (e.g. 160/55 mm[Hg]) is classified by its systolic load,
 *   never masked as hypotension.
 * - Higher-tier precedence rule: when systolic and diastolic ranks differ, the higher rank wins.
 * - Hypertensive crisis: >= 180 systolic or >= 120 diastolic accompanied by red-flag symptoms.
 * - Multilingual support across ro, en, sq, it while retaining labelRo, physiologicEffectRo,
 *   and actionProtocolRo for full backward compatibility.
 */
export function evaluateBloodPressure(
  systolic: number,
  diastolic: number,
  options?: boolean | EvaluateBloodPressureOptions
): BloodPressureEvaluation {
  const hasRedFlags =
    typeof options === "boolean" ? options : Boolean(options?.hasRedFlags);
  const isIsolatedSystolic = systolic >= 140 && diastolic < 90;

  // Check hypotension only when systolic is NOT hypertensive (systolic < 140)
  if ((systolic < 90 || diastolic < 60) && systolic < 140) {
    const tierData = BLOOD_PRESSURE_TIER_STRINGS.hypotension;
    return {
      systolic,
      diastolic,
      tier: "hypotension",
      label: {
        ro: tierData.ro.label,
        en: tierData.en.label,
        sq: tierData.sq.label,
        it: tierData.it.label,
        hr: tierData.hr.label,
        rom: tierData.rom.label,
      },
      labelRo: tierData.ro.label,
      badgeTone: "amber",
      physiologicEffect: {
        ro: tierData.ro.physiologicEffect,
        en: tierData.en.physiologicEffect,
        sq: tierData.sq.physiologicEffect,
        it: tierData.it.physiologicEffect,
        hr: tierData.hr.physiologicEffect,
        rom: tierData.rom.physiologicEffect,
      },
      physiologicEffectRo: tierData.ro.physiologicEffect,
      actionProtocol: {
        ro: tierData.ro.actionProtocol,
        en: tierData.en.actionProtocol,
        sq: tierData.sq.actionProtocol,
        it: tierData.it.actionProtocol,
        hr: tierData.hr.actionProtocol,
        rom: tierData.rom.actionProtocol,
      },
      actionProtocolRo: tierData.ro.actionProtocol,
      isEmergency112: false,
      isIsolatedSystolic: false,
      loincCode: "85354-9",
    };
  }

  let sysRank = 1;
  if (systolic < 120) sysRank = 1;
  else if (systolic <= 129) sysRank = 2;
  else if (systolic <= 139) sysRank = 3;
  else if (systolic <= 159) sysRank = 4;
  else if (systolic <= 179) sysRank = 5;
  else sysRank = 6;

  let diaRank = 1;
  if (diastolic < 80) diaRank = 1;
  else if (diastolic <= 84) diaRank = 2;
  else if (diastolic <= 89) diaRank = 3;
  else if (diastolic <= 99) diaRank = 4;
  else if (diastolic <= 109) diaRank = 5;
  else diaRank = 6;

  const effectiveRank = Math.max(sysRank, diaRank);

  // ESC/SRC 2024 Hypertensive crisis / severe grade 3 boundary (>= 180 or >= 120)
  if (systolic >= 180 || diastolic >= 120) {
    if (hasRedFlags) {
      const tierData = BLOOD_PRESSURE_TIER_STRINGS.hypertensive_crisis;
      return {
        systolic,
        diastolic,
        tier: "hypertensive_crisis",
        label: {
          ro: tierData.ro.label,
          en: tierData.en.label,
          sq: tierData.sq.label,
          it: tierData.it.label,
          hr: tierData.hr.label,
          rom: tierData.rom.label,
        },
        labelRo: tierData.ro.label,
        badgeTone: "ruby",
        physiologicEffect: {
          ro: tierData.ro.physiologicEffect,
          en: tierData.en.physiologicEffect,
          sq: tierData.sq.physiologicEffect,
          it: tierData.it.physiologicEffect,
          hr: tierData.hr.physiologicEffect,
          rom: tierData.rom.physiologicEffect,
        },
        physiologicEffectRo: tierData.ro.physiologicEffect,
        actionProtocol: {
          ro: tierData.ro.actionProtocol,
          en: tierData.en.actionProtocol,
          sq: tierData.sq.actionProtocol,
          it: tierData.it.actionProtocol,
          hr: tierData.hr.actionProtocol,
          rom: tierData.rom.actionProtocol,
        },
        actionProtocolRo: tierData.ro.actionProtocol,
        isEmergency112: true,
        isIsolatedSystolic,
        loincCode: "85354-9",
      };
    }

    const tierData = BLOOD_PRESSURE_TIER_STRINGS.grade_3_hypertension;
    return {
      systolic,
      diastolic,
      tier: "grade_3_hypertension",
      label: {
        ro: tierData.ro.label,
        en: tierData.en.label,
        sq: tierData.sq.label,
        it: tierData.it.label,
        hr: tierData.hr.label,
        rom: tierData.rom.label,
      },
      labelRo: tierData.ro.label,
      badgeTone: "ruby",
      physiologicEffect: {
        ro: tierData.ro.physiologicEffect,
        en: tierData.en.physiologicEffect,
        sq: tierData.sq.physiologicEffect,
        it: tierData.it.physiologicEffect,
        hr: tierData.hr.physiologicEffect,
        rom: tierData.rom.physiologicEffect,
      },
      physiologicEffectRo: tierData.ro.physiologicEffect,
      actionProtocol: {
        ro: tierData.ro.actionProtocol,
        en: tierData.en.actionProtocol,
        sq: tierData.sq.actionProtocol,
        it: tierData.it.actionProtocol,
        hr: tierData.hr.actionProtocol,
        rom: tierData.rom.actionProtocol,
      },
      actionProtocolRo: tierData.ro.actionProtocol,
      isEmergency112: false,
      isIsolatedSystolic,
      loincCode: "85354-9",
    };
  }

  let selectedTier:
    | "optimal"
    | "normal"
    | "high_normal"
    | "grade_1_hypertension"
    | "grade_2_hypertension";
  let badgeTone: "sage" | "amber" | "ruby";

  switch (effectiveRank) {
    case 1:
      selectedTier = "optimal";
      badgeTone = "sage";
      break;
    case 2:
      selectedTier = "normal";
      badgeTone = "sage";
      break;
    case 3:
      selectedTier = "high_normal";
      badgeTone = "amber";
      break;
    case 4:
      selectedTier = "grade_1_hypertension";
      badgeTone = "amber";
      break;
    case 5:
    default:
      selectedTier = "grade_2_hypertension";
      badgeTone = "ruby";
      break;
  }

  const tierData = BLOOD_PRESSURE_TIER_STRINGS[selectedTier];
  return {
    systolic,
    diastolic,
    tier: selectedTier,
    label: {
      ro: tierData.ro.label,
      en: tierData.en.label,
      sq: tierData.sq.label,
      it: tierData.it.label,
      hr: tierData.hr.label,
      rom: tierData.rom.label,
    },
    labelRo: tierData.ro.label,
    badgeTone,
    physiologicEffect: {
      ro: tierData.ro.physiologicEffect,
      en: tierData.en.physiologicEffect,
      sq: tierData.sq.physiologicEffect,
      it: tierData.it.physiologicEffect,
      hr: tierData.hr.physiologicEffect,
      rom: tierData.rom.physiologicEffect,
    },
    physiologicEffectRo: tierData.ro.physiologicEffect,
    actionProtocol: {
      ro: tierData.ro.actionProtocol,
      en: tierData.en.actionProtocol,
      sq: tierData.sq.actionProtocol,
      it: tierData.it.actionProtocol,
      hr: tierData.hr.actionProtocol,
      rom: tierData.rom.actionProtocol,
    },
    actionProtocolRo: tierData.ro.actionProtocol,
    isEmergency112: false,
    isIsolatedSystolic,
    loincCode: "85354-9",
  };
}

export function mapBloodPressureToFHIR(
  evaluation: BloodPressureEvaluation,
  lang: Lang = "ro"
): FHIRObservation {
  const localizedLabel = evaluation.label[lang] ?? evaluation.labelRo;
  const localizedAction =
    evaluation.actionProtocol[lang] ?? evaluation.actionProtocolRo;

  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "85354-9",
          display: "Blood pressure panel with all children optional",
        },
      ],
      text: lang === "en"
        ? "Blood pressure panel"
        : lang === "sq"
        ? "Paneli i tensionit të gjakut"
        : lang === "it"
        ? "Pannello pressione arteriosa"
        : lang === "hr"
        ? "Panel krvnog tlaka"
        : lang === "rom"
        ? "Panelo vash i tensija e rateski"
        : "Tensiune arterială",
    },
    effectiveDateTime: new Date().toISOString(),
    component: [
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8480-6",
              display: "Systolic blood pressure",
            },
          ],
          text: lang === "en"
            ? "Systolic blood pressure"
            : lang === "sq"
            ? "Tensioni sistolik"
            : lang === "it"
            ? "Pressione sistolica"
            : lang === "hr"
            ? "Sistolički krvni tlak"
            : lang === "rom"
            ? "Sistolikani tensija e rateski"
            : "Tensiune sistolică",
        },
        valueQuantity: {
          value: evaluation.systolic,
          unit: "mm[Hg]",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]",
        },
      },
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8462-4",
              display: "Diastolic blood pressure",
            },
          ],
          text: lang === "en"
            ? "Diastolic blood pressure"
            : lang === "sq"
            ? "Tensioni diastolik"
            : lang === "it"
            ? "Pressione diastolica"
            : lang === "hr"
            ? "Dijastolički krvni tlak"
            : lang === "rom"
            ? "Dijastolikani tensija e rateski"
            : "Tensiune diastolică",
        },
        valueQuantity: {
          value: evaluation.diastolic,
          unit: "mm[Hg]",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]",
        },
      },
    ],
    interpretation: [
      {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
            code:
              evaluation.tier === "optimal" || evaluation.tier === "normal"
                ? "N"
                : evaluation.tier === "hypotension"
                ? "L"
                : "H",
          },
        ],
        text: localizedLabel,
      },
    ],
    note: [{ text: localizedAction }],
  };
}
