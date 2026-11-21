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
    analyticsTitle: string;
    analyticsBody: string;
  };
  accessibility: {
    title: string;
    description: string;
    paragraphs: string[];
    /** Words before the support email address, e.g. "Write to us at". */
    contactLead: string;
    contact: string;
  };
};

const english: LegalCopy = {
  about: {
    title: "About RediHealth",
    description: "RediHealth helps you understand your health, find medical help and reach health workers who can help you.",
    paragraphs: [
      "We made RediHealth so you know what to do when you have a health worry. You can check your symptoms, read about an illness, or ask a doctor or a health mediator for help.",
      "The site explains medical topics clearly and directly. It also connects patients with health workers, keeps track of care plans and check-ups, and gives you a direct way to ask for help.",
      "RediHealth does not replace a doctor. It does not diagnose or treat illness. In an emergency, call your local emergency number now.",
    ],
  },
  contact: {
    title: "Contact us",
    description: "Questions about RediHealth or your account? Write to us and we will reply.",
    enquiries: "General questions",
    emergencies: "Medical emergencies",
    emergencyBody: "In a medical emergency, call 112 now. Do not wait for an email reply.",
    helpBefore: "To ask for medical help, use the",
    helpLink: "Ask for help",
    helpAfter: "page. Your request goes straight to our care team.",
  },
  terms: {
    title: "Terms of use",
    description: "If you use RediHealth, you agree to these terms.",
    sections: [
      { title: "Not a replacement for a doctor", body: "RediHealth gives general health information and helps you reach care. It does not diagnose illness and does not replace a doctor's advice. In an emergency, call your local emergency number now." },
      { title: "Your account", body: "You must give correct information. Keep your sign-in details safe." },
      { title: "Fair use", body: "Do not misuse the site. For example, do not send false medical information, do not try to open other people's accounts and do not disrupt the service." },
      { title: "Changes", body: "We may change these terms. If you keep using RediHealth after a change, you accept the new terms." },
    ],
  },
  privacy: {
    title: "Privacy notice",
    description: "What RediHealth collects, how we use it and how we protect it.",
    collectTitle: "What we collect",
    collectBody: "When you ask for help, create a patient profile or sign in, we collect your name, your contact details and the health information you choose to share. Health workers need this to help you.",
    useTitle: "How we use it",
    useBody: "We use your information to organise your care, contact you about your requests and improve our services. We do not sell your personal or health data.",
    accessTitle: "Who can see it",
    accessBody: "Only the health workers, mediators and administrators who organise your care can see your health information. You can see it too, in the patient portal.",
    choicesTitle: "Your rights",
    choicesBody: "You can ask to see, correct or delete your information. Write to us at",
    botTitle: "Protection against bots",
    botBody: "When bot protection is on, we use Google reCAPTCHA to stop automated abuse of public forms. Google checks technical data about your browser and how you use the page, under its own Privacy Policy and Terms of Service. We send Google only a CAPTCHA token, not your health information or what you wrote in the form.",
    analyticsTitle: "Visit statistics",
    analyticsBody: "To learn which pages help people and which of our announcements bring visitors, our own server counts visits. Nothing is sent to an outside analytics company and no cookies are used. For each page we record its address, the website you came from, campaign tags in the link, your browser and type of device, language and country. Your country is worked out from your IP address, which is not stored. To count a visitor only once per day, we keep a code made from your IP address and browser with a secret key that changes every day, so it cannot identify you or connect your visits on different days. We never record what you type, your health information, the patient portal or staff pages, and we do not share these statistics with advertisers. If your browser sends a Do Not Track or Global Privacy Control signal, your visit is not counted at all. Statistics are deleted after 13 months.",
  },
  accessibility: {
    title: "Accessibility",
    description: "We want everyone to be able to use RediHealth.",
    paragraphs: [
      "RediHealth should work with screen readers and with a keyboard alone. Colours should have enough contrast, and you should always see where you are on the page.",
      "We keep improving this. If a page is hard to use with a screen reader or another assistive tool, tell us and we will fix it.",
    ],
    contactLead: "Write to us at",
    contact: "to report an accessibility problem or to get information in another format.",
  },
};

const romanian: LegalCopy = {
  about: {
    title: "Despre RediHealth",
    description: "RediHealth te ajută să-ți înțelegi sănătatea, să găsești ajutor medical și să ajungi la oamenii care te pot ajuta.",
    paragraphs: [
      "Am făcut RediHealth ca să știi ce să faci când ai o problemă de sănătate. Poți să-ți verifici simptomele, să citești despre o boală sau să ceri ajutor unui medic sau unui mediator sanitar.",
      "Site-ul explică subiectele medicale clar și direct. Te pune în legătură cu personalul medical, ține evidența planului de îngrijire și a controalelor și îți arată cum să ceri ajutor.",
      "RediHealth nu ține locul medicului. Nu pune diagnostice și nu tratează boli. Dacă ai o urgență, sună acum la numărul de urgență din țara ta.",
    ],
  },
  contact: {
    title: "Contact",
    description: "Ai o întrebare despre RediHealth sau despre contul tău? Scrie-ne și îți răspundem.",
    enquiries: "Întrebări generale",
    emergencies: "Urgențe medicale",
    emergencyBody: "Dacă ai o urgență medicală, sună acum la 112. Nu aștepta răspuns pe email.",
    helpBefore: "Ca să ceri ajutor medical, folosește pagina",
    helpLink: "Cere ajutor",
    helpAfter: "ca cererea ta să ajungă direct la echipa noastră.",
  },
  terms: {
    title: "Termeni de utilizare",
    description: "Dacă folosești RediHealth, ești de acord cu acești termeni.",
    sections: [
      { title: "Nu ține locul medicului", body: "RediHealth îți dă informații generale despre sănătate și te ajută să ajungi la îngrijire. Nu pune diagnostice și nu înlocuiește sfatul medicului. Dacă ai o urgență, sună acum la numărul de urgență din țara ta." },
      { title: "Contul tău", body: "Trebuie să dai informații corecte. Păstrează în siguranță datele cu care intri în cont." },
      { title: "Ce nu ai voie să faci", body: "Nu folosi site-ul în mod abuziv. De exemplu, nu trimite informații medicale false, nu încerca să intri în conturile altora și nu încurca funcționarea site-ului." },
      { title: "Schimbări", body: "Putem schimba acești termeni. Dacă folosești RediHealth și după o schimbare, accepți termenii noi." },
    ],
  },
  privacy: {
    title: "Politica de confidențialitate",
    description: "Ce date strânge RediHealth, cum le folosim și cum le protejăm.",
    collectTitle: "Ce date strângem",
    collectBody: "Când ceri ajutor, îți faci un profil de pacient sau intri în cont, strângem numele tău, datele de contact și informațiile medicale pe care alegi să ni le dai. Personalul medical are nevoie de ele ca să te ajute.",
    useTitle: "Cum folosim datele",
    useBody: "Le folosim ca să-ți organizăm îngrijirea, să te contactăm despre cererile tale și să ne îmbunătățim serviciile. Nu vindem datele tale personale sau medicale.",
    accessTitle: "Cine vede datele",
    accessBody: "Datele medicale le văd doar personalul medical, mediatorii și administratorii care se ocupă de îngrijirea ta. Le vezi și tu, în portalul pacientului.",
    choicesTitle: "Drepturile tale",
    choicesBody: "Poți cere să-ți vezi datele, să le corectezi sau să le ștergem. Scrie-ne la",
    botTitle: "Protecție împotriva roboților",
    botBody: "Când protecția este pornită, folosim Google reCAPTCHA ca să oprim abuzurile automate pe formularele publice. Google verifică date tehnice despre browser și despre cum folosești pagina, după propriile reguli de confidențialitate și termeni. Noi îi trimitem doar un cod CAPTCHA, nu datele tale medicale și nici ce ai scris în formular.",
    analyticsTitle: "Statistici despre vizite",
    analyticsBody: "Ca să aflăm ce pagini îi ajută pe oameni și ce anunțuri ale noastre aduc vizitatori, serverul nostru numără vizitele. Nu trimitem nimic unei firme externe de statistici și nu folosim cookie-uri. Pentru fiecare pagină înregistrăm adresa ei, site-ul de pe care ai venit, etichetele de campanie din link, browserul și tipul de dispozitiv, limba și țara. Țara este dedusă din adresa ta IP, care nu este păstrată. Ca să numărăm un vizitator o singură dată pe zi, păstrăm un cod obținut din adresa IP și browser cu o cheie secretă care se schimbă zilnic, așa că nu te poate identifica și nu poate lega vizitele tale din zile diferite. Nu înregistrăm niciodată ce scrii, informațiile tale medicale, portalul pacientului sau paginile personalului și nu împărțim aceste statistici cu cei care fac reclame. Dacă browserul tău trimite semnalul „Do Not Track” sau „Global Privacy Control”, vizita ta nu este numărată deloc. Statisticile sunt șterse după 13 luni.",
  },
  accessibility: {
    title: "Accesibilitate",
    description: "Vrem ca oricine să poată folosi RediHealth.",
    paragraphs: [
      "RediHealth trebuie să poată fi folosit cu un cititor de ecran sau doar cu tastatura. Culorile au contrast suficient și vezi mereu unde te afli pe pagină.",
      "Lucrăm mereu la asta. Dacă o pagină e greu de folosit cu un cititor de ecran sau cu alt ajutor tehnic, spune-ne și o reparăm.",
    ],
    contactLead: "Scrie-ne la",
    contact: "ca să ne spui de o problemă de accesibilitate sau să primești informațiile în alt format.",
  },
};

const albanian: LegalCopy = {
  about: {
    title: "Rreth RediHealth",
    description: "RediHealth të ndihmon të kuptosh shëndetin tënd, të gjesh ndihmë mjekësore dhe të arrish te njerëzit që mund të të ndihmojnë.",
    paragraphs: [
      "E bëmë RediHealth që të dish çfarë të bësh kur ke një shqetësim për shëndetin. Mund të kontrollosh simptomat, të lexosh për një sëmundje ose t'i kërkosh ndihmë një mjeku ose një mediatori shëndetësor.",
      "Faqja i shpjegon temat mjekësore qartë dhe drejtpërdrejt. Të lidh me punonjësit shëndetësorë, mban shënim planin e kujdesit dhe kontrollet dhe të tregon si të kërkosh ndihmë.",
      "RediHealth nuk e zëvendëson mjekun. Nuk vë diagnoza dhe nuk trajton sëmundje. Nëse ke një urgjencë, telefono tani numrin e urgjencës në vendin tënd.",
    ],
  },
  contact: {
    title: "Na kontakto",
    description: "Ke një pyetje për RediHealth ose për llogarinë tënde? Na shkruaj dhe do të të përgjigjemi.",
    enquiries: "Pyetje të përgjithshme",
    emergencies: "Urgjenca mjekësore",
    emergencyBody: "Nëse ke një urgjencë mjekësore, telefono tani 112. Mos prit përgjigje me email.",
    helpBefore: "Për të kërkuar ndihmë mjekësore, përdor faqen",
    helpLink: "Kërko ndihmë",
    helpAfter: "që kërkesa jote të shkojë drejt te ekipi ynë.",
  },
  terms: {
    title: "Kushtet e përdorimit",
    description: "Nëse përdor RediHealth, pranon këto kushte.",
    sections: [
      { title: "Nuk e zëvendëson mjekun", body: "RediHealth të jep informacion të përgjithshëm për shëndetin dhe të ndihmon të arrish te kujdesi. Nuk vë diagnoza dhe nuk e zëvendëson këshillën e mjekut. Nëse ke një urgjencë, telefono tani numrin e urgjencës në vendin tënd." },
      { title: "Llogaria jote", body: "Duhet të japësh të dhëna të sakta. Ruaji mirë të dhënat me të cilat hyn në llogari." },
      { title: "Çfarë nuk lejohet", body: "Mos e keqpërdor faqen. Për shembull, mos dërgo informacion mjekësor të rremë, mos provo të hysh në llogaritë e të tjerëve dhe mos e pengo funksionimin e faqes." },
      { title: "Ndryshimet", body: "Mund t'i ndryshojmë këto kushte. Nëse vazhdon të përdorësh RediHealth pas një ndryshimi, pranon kushtet e reja." },
    ],
  },
  privacy: {
    title: "Njoftimi për privatësinë",
    description: "Çfarë të dhënash mbledh RediHealth, si i përdorim dhe si i mbrojmë.",
    collectTitle: "Çfarë mbledhim",
    collectBody: "Kur kërkon ndihmë, krijon një profil pacienti ose hyn në llogari, mbledhim emrin tënd, të dhënat e kontaktit dhe informacionin shëndetësor që zgjedh të na japësh. Punonjësit shëndetësorë kanë nevojë për to që të të ndihmojnë.",
    useTitle: "Si i përdorim",
    useBody: "I përdorim për të organizuar kujdesin tënd, për të të kontaktuar për kërkesat e tua dhe për të përmirësuar shërbimet tona. Nuk i shesim të dhënat e tua personale ose shëndetësore.",
    accessTitle: "Kush i sheh",
    accessBody: "Të dhënat shëndetësore i shohin vetëm punonjësit shëndetësorë, mediatorët dhe administratorët që merren me kujdesin tënd. I sheh edhe ti, te portali i pacientit.",
    choicesTitle: "Të drejtat e tua",
    choicesBody: "Mund të kërkosh t'i shohësh të dhënat e tua, t'i korrigjosh ose t'i fshijmë. Na shkruaj te",
    botTitle: "Mbrojtja nga robotët",
    botBody: "Kur mbrojtja është e ndezur, përdorim Google reCAPTCHA për të ndaluar abuzimet automatike në formularët publikë. Google kontrollon të dhëna teknike për shfletuesin dhe për mënyrën si e përdor faqen, sipas rregullave të veta të privatësisë dhe kushteve të shërbimit. Ne i dërgojmë vetëm një kod CAPTCHA, jo të dhënat e tua shëndetësore ose atë që shkrove në formular.",
    analyticsTitle: "Statistikat e vizitave",
    analyticsBody: "Për të kuptuar cilat faqe i ndihmojnë njerëzit dhe cilat njoftime tona sjellin vizitorë, serveri ynë i numëron vizitat. Nuk i dërgojmë asgjë një kompanie të jashtme statistikash dhe nuk përdorim cookie. Për çdo faqe regjistrojmë adresën e saj, faqen nga erdhe, etiketat e fushatës në lidhje, shfletuesin dhe llojin e pajisjes, gjuhën dhe vendin. Vendi nxirret nga adresa jote IP, e cila nuk ruhet. Për ta numëruar një vizitor vetëm një herë në ditë, ruajmë një kod të krijuar nga adresa IP dhe shfletuesi me një çelës sekret që ndryshon çdo ditë, prandaj nuk të identifikon dhe nuk i lidh vizitat e tua në ditë të ndryshme. Nuk regjistrojmë kurrë atë që shkruan, të dhënat e tua shëndetësore, portalin e pacientit ose faqet e stafit, dhe nuk ua japim këto statistika reklamuesve. Nëse shfletuesi yt dërgon sinjalin Do Not Track ose Global Privacy Control, vizita jote nuk numërohet fare. Statistikat fshihen pas 13 muajsh.",
  },
  accessibility: {
    title: "Aksesueshmëria",
    description: "Duam që çdokush të mund ta përdorë RediHealth.",
    paragraphs: [
      "RediHealth duhet të punojë me lexues ekrani dhe vetëm me tastierë. Ngjyrat kanë kontrast të mjaftueshëm dhe sheh gjithmonë ku ndodhesh në faqe.",
      "Vazhdojmë të punojmë për këtë. Nëse një faqe është e vështirë për t'u përdorur me lexues ekrani ose me një mjet tjetër ndihmës, na trego dhe do ta rregullojmë.",
    ],
    contactLead: "Na shkruaj te",
    contact: "për të na treguar një problem aksesueshmërie ose për të marrë informacionin në një format tjetër.",
  },
};

const italian: LegalCopy = {
  about: {
    title: "Cos'è RediHealth",
    description: "RediHealth ti aiuta a capire la tua salute, a trovare aiuto medico e a raggiungere chi può aiutarti.",
    paragraphs: [
      "Abbiamo creato RediHealth perché tu sappia cosa fare quando hai un problema di salute. Puoi controllare i sintomi, leggere di una malattia o chiedere aiuto a un medico o a un mediatore sanitario.",
      "Il sito spiega i temi medici con chiarezza e senza giri di parole. Ti mette in contatto con gli operatori sanitari, tiene traccia del piano di cura e dei controlli e ti mostra come chiedere aiuto.",
      "RediHealth non sostituisce il medico. Non fa diagnosi e non cura malattie. Se hai un'emergenza, chiama subito il numero di emergenza del tuo paese.",
    ],
  },
  contact: {
    title: "Contatti",
    description: "Hai una domanda su RediHealth o sul tuo account? Scrivici e ti risponderemo.",
    enquiries: "Domande generali",
    emergencies: "Emergenze mediche",
    emergencyBody: "Se hai un'emergenza medica, chiama subito il 112. Non aspettare una risposta via email.",
    helpBefore: "Per chiedere aiuto medico, usa la pagina",
    helpLink: "Chiedi aiuto",
    helpAfter: "così la tua richiesta arriva subito al nostro team.",
  },
  terms: {
    title: "Termini di utilizzo",
    description: "Se usi RediHealth, accetti questi termini.",
    sections: [
      { title: "Non sostituisce il medico", body: "RediHealth ti dà informazioni generali sulla salute e ti aiuta a raggiungere le cure. Non fa diagnosi e non sostituisce il parere del medico. Se hai un'emergenza, chiama subito il numero di emergenza del tuo paese." },
      { title: "Il tuo account", body: "Devi dare informazioni corrette. Tieni al sicuro i dati con cui accedi." },
      { title: "Cosa non puoi fare", body: "Non usare il sito in modo scorretto. Per esempio, non inviare informazioni mediche false, non provare a entrare negli account di altri e non disturbare il funzionamento del sito." },
      { title: "Modifiche", body: "Possiamo cambiare questi termini. Se continui a usare RediHealth dopo una modifica, accetti i nuovi termini." },
    ],
  },
  privacy: {
    title: "Informativa sulla privacy",
    description: "Quali dati raccoglie RediHealth, come li usiamo e come li proteggiamo.",
    collectTitle: "Cosa raccogliamo",
    collectBody: "Quando chiedi aiuto, crei un profilo paziente o accedi, raccogliamo il tuo nome, i tuoi contatti e le informazioni sulla salute che scegli di darci. Gli operatori sanitari ne hanno bisogno per aiutarti.",
    useTitle: "Come li usiamo",
    useBody: "Li usiamo per organizzare le tue cure, contattarti per le tue richieste e migliorare i nostri servizi. Non vendiamo i tuoi dati personali o sanitari.",
    accessTitle: "Chi li vede",
    accessBody: "I dati sanitari li vedono solo gli operatori sanitari, i mediatori e gli amministratori che seguono le tue cure. Li vedi anche tu, nel portale paziente.",
    choicesTitle: "I tuoi diritti",
    choicesBody: "Puoi chiedere di vedere i tuoi dati, correggerli o cancellarli. Scrivici a",
    botTitle: "Protezione dai bot",
    botBody: "Quando la protezione è attiva, usiamo Google reCAPTCHA per fermare gli abusi automatici sui moduli pubblici. Google controlla dati tecnici sul browser e su come usi la pagina, secondo le sue regole sulla privacy e i suoi termini di servizio. Noi gli inviamo solo un codice CAPTCHA, non i tuoi dati sanitari né quello che hai scritto nel modulo.",
    analyticsTitle: "Statistiche sulle visite",
    analyticsBody: "Per capire quali pagine aiutano le persone e quali nostri annunci portano visitatori, il nostro server conta le visite. Non inviamo nulla a società esterne di statistica e non usiamo cookie. Per ogni pagina registriamo il suo indirizzo, il sito da cui arrivi, le etichette di campagna nel link, il browser e il tipo di dispositivo, la lingua e il paese. Il paese viene ricavato dal tuo indirizzo IP, che non viene conservato. Per contare un visitatore una sola volta al giorno conserviamo un codice ottenuto dall'indirizzo IP e dal browser con una chiave segreta che cambia ogni giorno, quindi non può identificarti né collegare le tue visite di giorni diversi. Non registriamo mai ciò che scrivi, i tuoi dati sanitari, il portale del paziente o le pagine del personale, e non condividiamo queste statistiche con gli inserzionisti. Se il tuo browser invia il segnale Do Not Track o Global Privacy Control, la tua visita non viene contata. Le statistiche vengono cancellate dopo 13 mesi.",
  },
  accessibility: {
    title: "Accessibilità",
    description: "Vogliamo che tutti possano usare RediHealth.",
    paragraphs: [
      "RediHealth dovrebbe funzionare con i lettori di schermo e con la sola tastiera. I colori hanno un contrasto sufficiente e vedi sempre dove ti trovi nella pagina.",
      "Ci lavoriamo di continuo. Se una pagina è difficile da usare con un lettore di schermo o un altro strumento di aiuto, diccelo e la sistemiamo.",
    ],
    contactLead: "Scrivici a",
    contact: "per segnalare un problema di accessibilità o per ricevere le informazioni in un altro formato.",
  },
};

const croatian: LegalCopy = {
  about: {
    title: "O RediHealthu",
    description: "RediHealth ti pomaže razumjeti svoje zdravlje, pronaći liječničku pomoć i doći do zdravstvenih radnika koji ti mogu pomoći.",
    paragraphs: [
      "Napravili smo RediHealth kako bi znao što učiniti kad te brine zdravlje. Možeš provjeriti simptome, pročitati o nekoj bolesti ili zatražiti pomoć liječnika ili zdravstvenog medijatora.",
      "Stranica objašnjava zdravstvene teme jasno i izravno. Povezuje pacijente sa zdravstvenim radnicima, prati plan skrbi i kontrole te ti nudi izravan način da zatražiš pomoć.",
      "RediHealth ne zamjenjuje liječnika. Ne postavlja dijagnoze i ne liječi bolesti. U hitnom slučaju odmah nazovi hitnu medicinsku službu 112.",
    ],
  },
  contact: {
    title: "Kontaktiraj nas",
    description: "Imaš pitanje o RediHealthu ili svom računu? Piši nam i odgovorit ćemo ti.",
    enquiries: "Opća pitanja",
    emergencies: "Hitni medicinski slučajevi",
    emergencyBody: "U hitnom medicinskom slučaju odmah nazovi 112. Nemoj čekati odgovor e-poštom.",
    helpBefore: "Ako želiš zatražiti liječničku pomoć, otvori stranicu",
    helpLink: "Potraži pomoć",
    helpAfter: "kako bi tvoj zahtjev stigao izravno našem timu.",
  },
  terms: {
    title: "Uvjeti korištenja",
    description: "Ako koristiš RediHealth, prihvaćaš ove uvjete.",
    sections: [
      { title: "Ne zamjenjuje liječnika", body: "RediHealth pruža opće informacije o zdravlju i pomaže ti doći do skrbi. Ne postavlja dijagnoze i ne zamjenjuje savjet liječnika. U hitnom slučaju odmah nazovi 112." },
      { title: "Tvoj račun", body: "Moraš unijeti točne podatke. Čuvaj podatke kojima se prijavljuješ na račun." },
      { title: "Pravilno korištenje", body: "Nemoj zloupotrebljavati stranicu. Na primjer, nemoj slati lažne medicinske podatke, nemoj pokušavati ući u tuđe račune i nemoj ometati rad usluge." },
      { title: "Promjene", body: "Možemo promijeniti ove uvjete. Ako nastaviš koristiti RediHealth nakon promjene, prihvaćaš nove uvjete." },
    ],
  },
  privacy: {
    title: "Pravila privatnosti",
    description: "Koje podatke RediHealth prikuplja, kako ih koristimo i kako ih štitimo.",
    collectTitle: "Što prikupljamo",
    collectBody: "Kad zatražiš pomoć, izradiš profil pacijenta ili se prijaviš, prikupljamo tvoje ime, kontaktne podatke i zdravstvene podatke koje nam odlučiš podijeliti. Zdravstveni radnici ih trebaju kako bi ti pomogli.",
    useTitle: "Kako ih koristimo",
    useBody: "Koristimo tvoje podatke za organizaciju tvoje skrbi, kontaktiranje u vezi s tvojim zahtjevima i poboljšanje naših usluga. Ne prodajemo tvoje osobne ni zdravstvene podatke.",
    accessTitle: "Tko ih vidi",
    accessBody: "Tvoje zdravstvene podatke vide samo zdravstveni radnici, zdravstveni medijatori i administratori koji organiziraju tvoju skrb. Vidiš ih i ti na portalu za pacijente.",
    choicesTitle: "Tvoja prava",
    choicesBody: "Možeš zatražiti uvid, ispravak ili brisanje svojih podataka. Piši nam na",
    botTitle: "Zaštita od automatizirane zloupotrebe",
    botBody: "Kad je zaštita uključena, koristimo Google reCAPTCHA kako bismo spriječili automatiziranu zloupotrebu javnih obrazaca. Google provjerava tehničke podatke o tvom pregledniku i načinu korištenja stranice prema vlastitim pravilima privatnosti i uvjetima pružanja usluge. Googleu šaljemo samo CAPTCHA oznaku, a ne tvoje zdravstvene podatke ni ono što si napisao u obrascu.",
    analyticsTitle: "Statistika posjeta",
    analyticsBody: "Kako bismo saznali koje stranice pomažu ljudima i koje naše objave dovode posjetitelje, naš poslužitelj broji posjete. Ništa ne šaljemo vanjskoj tvrtki za statistiku i ne koristimo kolačiće. Za svaku stranicu bilježimo njezinu adresu, stranicu s koje si došao, oznake kampanje u poveznici, preglednik i vrstu uređaja, jezik i zemlju. Zemlja se određuje iz tvoje IP adrese, koja se ne pohranjuje. Kako bismo posjetitelja brojali samo jednom dnevno, čuvamo kôd izrađen iz IP adrese i preglednika tajnim ključem koji se mijenja svaki dan, pa te ne može identificirati ni povezati tvoje posjete u različitim danima. Nikad ne bilježimo ono što upišeš, tvoje zdravstvene podatke, portal za pacijente ni stranice za osoblje i ne dijelimo ovu statistiku s oglašivačima. Ako tvoj preglednik šalje signal Do Not Track ili Global Privacy Control, tvoj se posjet uopće ne broji. Statistika se briše nakon 13 mjeseci.",
  },
  accessibility: {
    title: "Pristupačnost",
    description: "Želimo da svatko može koristiti RediHealth.",
    paragraphs: [
      "RediHealth treba raditi s čitačima zaslona i samo pomoću tipkovnice. Boje imaju dovoljan kontrast i uvijek vidiš gdje se nalaziš na stranici.",
      "Stalno radimo na tome. Ako je neku stranicu teško koristiti s čitačem zaslona ili drugim pomagalom, javi nam i popravit ćemo je.",
    ],
    contactLead: "Piši nam na",
    contact: "kako bi prijavio poteškoću s pristupačnošću ili zatražio informacije u drugom obliku.",
  },
};

const romani: LegalCopy = {
  about: {
    title: "Vash RediHealth",
    description: "RediHealth zhutil tut te xatyares cho sastipen, te arakhes sastipnasko zhutimos thaj te areses ko manusha kay shay te zhutin tut.",
    paragraphs: [
      "Kerdam RediHealth te zhanes so te keres kana si tut grija vash o sastipen. Shay te dikhes che simptome, te gines vash ekh nasvalipe vay te manges zhutimos katar ekh doktori vay sastipnasko mediatori.",
      "I rig ashkarel o sastipen chaches thaj vorta. Phandel e paciyenturen e sastipnaske bucharyenca, inkrel o plano vash o dikhiben thaj e kontrolya thaj sikavel tuke sar te manges zhutimos.",
      "RediHealth na achhel po than e doktoresko. Na chivel diagnoze thaj na sastyarel nasvalimata. Ki sigardiari, akhar akana ko 112.",
    ],
  },
  contact: {
    title: "Kontakto",
    description: "Si tut phuchipe vash RediHealth vay vash cho konto? Lekhav amenge thaj ka das tut palpale.",
    enquiries: "Savore phuchimata",
    emergencies: "Sastipnaski sigardiari",
    emergencyBody: "Ki sastipnaski sigardiari, akhar akana ko 112. Ma azhuker palpale pe emailo.",
    helpBefore: "Te manges sastipnasko zhutimos, labar i rig",
    helpLink: "Rod zhutimos",
    helpAfter: "te aresel cho mangipe rigate ko amaro timo.",
  },
  terms: {
    title: "Labaripnaske pravila",
    description: "Te labares RediHealth, kames kadala pravila.",
    sections: [
      { title: "Na achhel po than e doktoresko", body: "RediHealth del tut informaciye vash o sastipen thaj zhutil tut te areses ko dikhiben. Na chivel diagnoze thaj na paravel e doktoreski godi. Ki sigardiari, akhar akana ko 112." },
      { title: "Cho konto", body: "Trubul te des chache informaciye. Arakh mishto e podatke kolenca des andre ko konto." },
      { title: "Chacho labaripe", body: "Ma labar i rig bilačhes. Misalake, ma bichhal xoxamne sastipnaske informaciye, ma zumav te des andre ko avrengo konto thaj ma phag i buchi e rigaki." },
      { title: "Paruvimata", body: "Shay te paruvas kadala pravila. Te labares RediHealth vi palo paruvipe, kames e neve pravila." },
    ],
  },
  privacy: {
    title: "Garavipnaske pravila",
    description: "Save podatke chidel RediHealth, sar labaras len thaj sar arakhas len.",
    collectTitle: "So chidas",
    collectBody: "Kana manges zhutimos, keres paciyentesko profilo vay des andre ko konto, chidas cho anav, che kontaktoske podatke thaj e sastipnaske informaciye kay alosares te des amen. E sastipnaske bucharya trubun len te zhutin tut.",
    useTitle: "Sar labaras len",
    useBody: "Labaras che informaciye te lasharas cho dikhiben, te vakeras tusa vash che mangimata thaj te keras may lache amare buchya. Na bikinas che manushikane vay sastipnaske podatke.",
    accessTitle: "Kon dikhel len",
    accessBody: "Che sastipnaske informaciye dikhen numay e sastipnaske bucharya, e sastipnaske mediatorya thaj e administratorya kay keren buchi vash cho dikhiben. Dikhes len vi tu ko paciyentesko portalo.",
    choicesTitle: "Che xakaya",
    choicesBody: "Shay te manges te dikhes, te lashares vay te chosas che podatke. Lekhav amenge pe",
    botTitle: "Arakhipe katar e roboturya",
    botBody: "Kana o arakhipe si putardo, labaras Google reCAPTCHA te astavas avtomatikano bilačho labaripe pe putarde formularya. Google dikhel tehnikane podatke vash o browsero thaj sar labares i rig, palo piro garavipnasko zakono. Ame bichhalas ko Google numay ekh CAPTCHA kodo, na che sastipnaske informaciye thaj na so lekhavdyan ando formularo.",
    analyticsTitle: "Statistike vash o avipe",
    analyticsBody: "Te zhanas savi rig zhutil e manushen thaj save amare anunsurya anen vizitatoren, amaro serveri ginel le avipe. Na bichhalas khanchi ekhe avere firmake statistikengi thaj na labaras cookie. Vash sako rig ramosaras lako adresa, o sait kotar avilyan, le kampanyake etikete ando link, o browsero thaj sar si o aparato, i chhib thaj o them. O them arakhel pe andar chi IP adresa, savi na garavel pe. Te ginas ekhe vizitatores numa jekhvar pe dives, garavas ekh kodo kerdo andar i IP adresa thaj o browsero ekhe garadi klidyasa savi parudel pe sako dives, gadya na shaj prinzharel tut thaj na shaj phandel che avipe ande aver divesa. Nikana na ramosaras so lekhaves, che sastipnaske informaciye, o portalo e pacientosko vay le rigi e butyarengi, thaj na das kadala statistike kodolen kai keren reklame. Te cho browsero bichhalel o semno Do Not Track vay Global Privacy Control, cho avipe chi ginel pe. Le statistike khosen pe pala 13 masek.",
  },
  accessibility: {
    title: "Shayipe te labares",
    description: "Kamas sako manush te shay labarel RediHealth.",
    paragraphs: [
      "RediHealth trubul te kerel buchi ekraneske ginatorenca thaj numay tastaturasa. E rangurya si len dosta kontrasto thaj sako drom dikhes kay san pi rig.",
      "Sako drom keras buchi pe kava. Te si ekh rig phari te labares ekraneske ginatoresa vay avere zhutimaske alatesa, phen amenge thaj ka lasharas la.",
    ],
    contactLead: "Lekhav amenge pe",
    contact: "te phenes varesavi problema vay te les e informaciye ando aver formato.",
  },
};

const legalCopyByLang: Record<Lang, LegalCopy> = {
  ru: {
  about: {
    title: "О RediHealth",
    description: "RediHealth помогает вам понять свое здоровье, найти медицинскую помощь и связаться с медицинскими работниками, которые могут вам помочь.",
    paragraphs: [
      "Мы создали RediHealth, чтобы вы знали, что делать, если у вас возникли проблемы со здоровьем. Вы можете проверить свои симптомы, прочитать о болезни или обратиться за помощью к врачу или медицинскому посреднику.",
      "Сайт объясняет здоровье простыми словами. Оно также связывает пациентов с медицинскими работниками, отслеживает планы ухода и осмотров, а также дает вам простой способ обратиться за помощью.",
      "RediHealth не заменяет врача. Он не диагностирует и не лечит болезни. В случае возникновения чрезвычайной ситуации позвоните по местному номеру службы экстренной помощи прямо сейчас.",
    ],
  },
  contact: {
    title: "Свяжитесь с нами",
    description: "Есть вопросы о RediHealth или вашей учетной записи? Напишите нам и мы ответим.",
    enquiries: "Общие вопросы",
    emergencies: "Неотложная медицинская помощь",
    emergencyBody: "В случае неотложной медицинской помощи звоните по номеру 112 прямо сейчас. Не ждите ответа по электронной почте.",
    helpBefore: "Для обращения за медицинской помощью воспользуйтесь",
    helpLink: "Попросите помощи",
    helpAfter: "страница. Ваш запрос направляется прямо в нашу команду по уходу.",
  },
  terms: {
    title: "Условия использования",
    description: "Если вы используете RediHealth, вы соглашаетесь с этими условиями.",
    sections: [
      { title: "Не замена врачу", body: "RediHealth предоставляет общую информацию о состоянии здоровья и помогает вам обратиться за медицинской помощью. Он не диагностирует заболевание и не заменяет консультацию врача. В случае возникновения чрезвычайной ситуации позвоните по местному номеру службы экстренной помощи прямо сейчас." },
      { title: "Ваш аккаунт", body: "Вы должны предоставить правильную информацию. Храните свои данные для входа в безопасности." },
      { title: "Добросовестное использование", body: "Не злоупотребляйте сайтом. Например, не отправляйте ложную медицинскую информацию, не пытайтесь открыть чужие аккаунты и не нарушайте работу сервиса." },
      { title: "Изменения", body: "Мы можем изменить эти условия. Если вы продолжите использовать RediHealth после внесения изменений, вы принимаете новые условия." },
    ],
  },
  privacy: {
    title: "Уведомление о конфиденциальности",
    description: "Что собирает RediHealth, как мы это используем и как защищаем.",
    collectTitle: "Что мы собираем",
    collectBody: "Когда вы обращаетесь за помощью, создаете профиль пациента или входите в систему, мы собираем ваше имя, ваши контактные данные и медицинскую информацию, которой вы решили поделиться. Медицинским работникам это нужно, чтобы помочь вам.",
    useTitle: "Как мы это используем",
    useBody: "Мы используем вашу информацию для организации вашего ухода, связи с вами по поводу ваших запросов и улучшения наших услуг. Мы не продаем ваши личные данные или данные о здоровье.",
    accessTitle: "Кто может это увидеть",
    accessBody: "Только медицинские работники, посредники и администраторы, которые организуют ваше лечение, могут видеть вашу медицинскую информацию. Вы тоже можете это увидеть на портале для пациентов.",
    choicesTitle: "Ваши права",
    choicesBody: "Вы можете попросить просмотреть, исправить или удалить вашу информацию. Напишите нам по адресу",
    botTitle: "Защита от ботов",
    botBody: "Когда защита от ботов включена, мы используем Google reCAPTCHA, чтобы предотвратить автоматическое злоупотребление общедоступными формами. Google проверяет технические данные о вашем браузере и о том, как вы используете страницу, в соответствии со своей Политикой конфиденциальности и Условиями обслуживания. Мы отправляем Google только токен CAPTCHA, а не информацию о вашем здоровье или то, что вы написали в форме.",
    analyticsTitle: "Статистика посещений",
    analyticsBody: "Чтобы понимать, какие страницы помогают людям и какие наши объявления приводят посетителей, посещения считает наш собственный сервер. Мы ничего не передаем сторонним компаниям веб-аналитики и не используем cookie. Для каждой страницы мы записываем ее адрес, сайт, с которого вы пришли, метки кампании в ссылке, браузер и тип устройства, язык и страну. Страна определяется по вашему IP-адресу, который не сохраняется. Чтобы считать посетителя только один раз в день, мы храним код, полученный из IP-адреса и браузера с помощью секретного ключа, который меняется каждый день, поэтому он не позволяет вас идентифицировать или связать ваши посещения в разные дни. Мы никогда не записываем то, что вы вводите, сведения о вашем здоровье, портал пациента или страницы для персонала и не передаем эту статистику рекламодателям. Если ваш браузер отправляет сигнал Do Not Track или Global Privacy Control, ваше посещение вообще не учитывается. Статистика удаляется через 13 месяцев.",
  },
  accessibility: {
    title: "Доступность",
    description: "Мы хотим, чтобы каждый мог использовать RediHealth.",
    paragraphs: [
      "RediHealth должен работать только с программами чтения с экрана и только с клавиатурой. Цвета должны быть достаточно контрастными, и вы всегда должны видеть, где находитесь на странице.",
      "Мы продолжаем улучшать это. Если страницу сложно использовать с помощью программы чтения с экрана или другого вспомогательного инструмента, сообщите нам, и мы это исправим.",
    ],
    contactLead: "Напишите нам по адресу",
    contact: "чтобы сообщить о проблеме доступности или получить информацию в другом формате.",
  },
},

  en: english,
  ro: romanian,
  sq: albanian,
  it: italian,
  hr: croatian,
  rom: romani,
};

export function getLegalCopy(lang: Lang): LegalCopy {
  return legalCopyByLang[lang] ?? english;
}
