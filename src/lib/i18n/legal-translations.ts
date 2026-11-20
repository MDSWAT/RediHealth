import type { Lang } from "@/lib/i18n/languages";
import { LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR, LEGAL_VERSION, getOperatorFullAddress } from "@/lib/legal-config";

export type LegalSectionBlock = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalCopy = {
  versionMeta: string;
  about: {
    title: string;
    description: string;
    paragraphs: string[];
    operatorHeading: string;
    operatorBody: string;
  };
  contact: {
    title: string;
    description: string;
    operatorHeading: string;
    operatorNameLabel: string;
    addressLabel: string;
    registrationLabel: string;
    websiteLabel: string;
    enquiries: string;
    enquiriesHint: string;
    dataProtectionHeading: string;
    dataProtectionBody: string;
    supervisoryNote: string;
    emergencies: string;
    emergencyBody: string;
    helpBefore: string;
    helpLink: string;
    helpAfter: string;
    legalLinksHeading: string;
    privacyLink: string;
    cookiesLink: string;
    termsLink: string;
  };
  accessibility: {
    title: string;
    description: string;
    paragraphs: string[];
    contactLead: string;
    contact: string;
  };
};

function versionMetaFor(lang: Lang): string {
  const date = LEGAL_EFFECTIVE_DATE[lang] ?? LEGAL_EFFECTIVE_DATE.en;
  switch (lang) {
    case "ro":
      return `Versiunea ${LEGAL_VERSION} · În vigoare din ${date} · Faza de test`;
    case "en":
      return `Version ${LEGAL_VERSION} · Effective ${date} · Test phase`;
    case "sq":
      return `Versioni ${LEGAL_VERSION} · Në fuqi nga ${date} · Faza e testimit`;
    case "it":
      return `Versione ${LEGAL_VERSION} · In vigore dal ${date} · Fase di test`;
    case "hr":
      return `Verzija ${LEGAL_VERSION} · Na snazi od ${date} · Faza testiranja`;
    case "rom":
      return `Versiya ${LEGAL_VERSION} · Katar ${date} · Testiripnaski faza`;
    case "ru":
      return `Версия ${LEGAL_VERSION} · Действует с ${date} · Тестовая фаза`;
  }
}

export function getLegalCopy(lang: Lang): LegalCopy {
  const address = getOperatorFullAddress(lang);
  const meta = versionMetaFor(lang);

  const byLang: Record<Lang, LegalCopy> = {
    ro: {
      versionMeta: meta,
      about: {
        title: "Despre RediHealth",
        description:
          "RediHealth te ajută să îți înțelegi sănătatea, să găsești ajutor medical și să ajungi la medici și mediatori sanitari.",
        paragraphs: [
          "Am creat RediHealth ca să știi ce ai de făcut atunci când ai o grijă de sănătate. Poți citi ghiduri în limbaj simplu, poți verifica simptomele, îți poți explica o rețetă sau poți cere ajutor unui medic voluntar ori unui mediator sanitar.",
          "Toate serviciile sunt gratuite. Nu îți cerem niciodată bani sau date de card. Aplicația se află în fază de testare și o îmbunătățim continuu împreună cu comunitățile și profesioniștii din sănătate.",
          "RediHealth nu înlocuiește medicul de familie și nu este un serviciu de urgență. Dacă ai o urgență medicală, sună tu acum la 112.",
        ],
        operatorHeading: "Cine operează RediHealth",
        operatorBody: `RediHealth face parte dintr-un proiect european REDI și este operat de ${LEGAL_OPERATOR.name}, cu sediul social la ${address}, număr BCE ${LEGAL_OPERATOR.bceNumber}.`,
      },
      contact: {
        title: "Contact",
        description: "Ai o întrebare despre RediHealth, contul tău sau datele personale? Scrie-ne și îți răspundem.",
        operatorHeading: "Operatorul platformei",
        operatorNameLabel: "Organizație",
        addressLabel: "Sediu social",
        registrationLabel: "Număr de înregistrare (BCE)",
        websiteLabel: "Site oficial REDI",
        enquiries: "Întrebări generale și suport",
        enquiriesHint: "Pentru întrebări despre aplicație, programări sau colaborare.",
        dataProtectionHeading: "Protecția datelor (GDPR)",
        dataProtectionBody:
          "Pentru acces la datele tale, corectare, ștergere, portabilitate sau retragerea acordului, scrie-ne la adresa dedicată de mai jos. Îți răspundem în cel mult o lună.",
        supervisoryNote:
          "Poți depune o plângere la Autoritatea pentru Protecția Datelor din Belgia (APD/GBA) sau la autoritatea din țara ta (în România: ANSPDCP).",
        emergencies: "Urgențe medicale",
        emergencyBody:
          "Dacă ai o urgență medicală, sună tu acum la 112. RediHealth nu poate suna la 112 în locul tău și nu aștepta răspuns pe email.",
        helpBefore: "Ca să ceri ajutor medical de la echipa noastră, folosește pagina",
        helpLink: "Cere ajutor",
        helpAfter: "ca solicitarea ta să ajungă direct la echipa de suport.",
        legalLinksHeading: "Documente legale și confidențialitate",
        privacyLink: "Politica de confidențialitate (GDPR)",
        cookiesLink: "Politica de cookie-uri",
        termsLink: "Termeni și condiții",
      },
      accessibility: {
        title: "Accesibilitate",
        description: "Vrem ca oricine să poată folosi RediHealth.",
        paragraphs: [
          "RediHealth trebuie să poată fi folosit cu un cititor de ecran sau doar cu tastatura. Culorile au contrast suficient și vezi mereu unde te afli pe pagină.",
          "Lucrăm mereu la asta. Dacă o pagină este greu de folosit cu un cititor de ecran sau cu alt ajutor tehnic, spune-ne și o reparăm.",
        ],
        contactLead: "Scrie-ne la",
        contact: "ca să ne spui de o problemă de accesibilitate sau să primești informațiile în alt format.",
      },
    },
    en: {
      versionMeta: meta,
      about: {
        title: "About RediHealth",
        description:
          "RediHealth helps you understand your health, find medical care and reach volunteer doctors and health mediators.",
        paragraphs: [
          "We built RediHealth so you know what to do when you have a health worry. You can read plain-language guides, check symptoms, understand a prescription or ask a volunteer doctor or community health mediator for help.",
          "All services are free. We never ask for money or bank card details. The application is currently in its test phase and is continuously improved with communities and health professionals.",
          "RediHealth does not replace a family doctor and is not an emergency service. In a medical emergency, call 112 yourself right away.",
        ],
        operatorHeading: "Who operates RediHealth",
        operatorBody: `RediHealth is part of a European REDI project and is operated by ${LEGAL_OPERATOR.name}, registered office at ${address}, BCE number ${LEGAL_OPERATOR.bceNumber}.`,
      },
      contact: {
        title: "Contact us",
        description: "Questions about RediHealth, your account or your personal data? Write to us and we will reply.",
        operatorHeading: "Platform operator",
        operatorNameLabel: "Organisation",
        addressLabel: "Registered office",
        registrationLabel: "Registration number (BCE)",
        websiteLabel: "Official REDI website",
        enquiries: "General enquiries and support",
        enquiriesHint: "For questions about the platform, appointments or partnerships.",
        dataProtectionHeading: "Data protection (GDPR)",
        dataProtectionBody:
          "To access, correct, delete or export your data, or to withdraw consent, write to our dedicated data protection address below. We reply within one month.",
        supervisoryNote:
          "You also have the right to lodge a complaint with the Belgian Data Protection Authority (APD/GBA) or your national authority (in Romania: ANSPDCP).",
        emergencies: "Medical emergencies",
        emergencyBody:
          "In a medical emergency, call 112 yourself right away. RediHealth cannot call 112 for you. Do not wait for an email reply.",
        helpBefore: "To ask for medical help from our care team, use the",
        helpLink: "Ask for help",
        helpAfter: "page so your request reaches our team directly.",
        legalLinksHeading: "Legal and privacy documents",
        privacyLink: "Privacy policy (GDPR)",
        cookiesLink: "Cookie policy",
        termsLink: "Terms and conditions",
      },
      accessibility: {
        title: "Accessibility",
        description: "We want everyone to be able to use RediHealth.",
        paragraphs: [
          "RediHealth should work with screen readers and with a keyboard alone. Colours have sufficient contrast, and you can always see where you are on the page.",
          "We keep improving this. If a page is hard to use with a screen reader or another assistive tool, tell us and we will fix it.",
        ],
        contactLead: "Write to us at",
        contact: "to report an accessibility problem or to get information in another format.",
      },
    },
    sq: {
      versionMeta: meta,
      about: {
        title: "Rreth RediHealth",
        description:
          "RediHealth të ndihmon të kuptosh shëndetin tënd, të gjesh kujdes mjekësor dhe të arrish te mjekët vullnetarë dhe mediatorët shëndetësorë.",
        paragraphs: [
          "E krijuam RediHealth që të dish çfarë të bësh kur ke një shqetësim shëndetësor. Mund të lexosh udhëzues me gjuhë të thjeshtë, të kontrollosh simptomat, të kuptosh një recetë ose t'i kërkosh ndihmë një mjeku vullnetar ose mediatori shëndetësor.",
          "Të gjitha shërbimet janë falas. Nuk kërkojmë kurrë para apo të dhëna karte bankare. Aplikacioni është në fazën e testimit dhe përmirësohet vazhdimisht.",
          "RediHealth nuk e zëvendëson mjekun e familjes dhe nuk është shërbim urgjence. Nëse ke një urgjencë mjekësore, telefono vetë 112 tani.",
        ],
        operatorHeading: "Kush e operon RediHealth",
        operatorBody: `RediHealth është pjesë e një projekti evropian REDI dhe operohet nga ${LEGAL_OPERATOR.name}, me seli në ${address}, numër BCE ${LEGAL_OPERATOR.bceNumber}.`,
      },
      contact: {
        title: "Na kontakto",
        description: "Ke një pyetje për RediHealth, llogarinë tënde apo të dhënat personale? Na shkruaj dhe do të të përgjigjemi.",
        operatorHeading: "Operatori i platformës",
        operatorNameLabel: "Organizata",
        addressLabel: "Selia ligjore",
        registrationLabel: "Numri i regjistrimit (BCE)",
        websiteLabel: "Faqja zyrtare e REDI",
        enquiries: "Pyetje të përgjithshme dhe mbështetje",
        enquiriesHint: "Për pyetje rreth aplikacionit, takimeve ose bashkëpunimit.",
        dataProtectionHeading: "Mbrojtja e të dhënave (GDPR)",
        dataProtectionBody:
          "Për të parë, korrigjuar, fshirë ose eksportuar të dhënat e tua, ose për të tërhequr pëlqimin, na shkruaj në adresën më poshtë. Përgjigjemi brenda një muaji.",
        supervisoryNote:
          "Mund të paraqesësh ankesë pranë Autoritetit Belg për Mbrojtjen e të Dhënave (APD/GBA) ose autoritetit të vendit tënd.",
        emergencies: "Urgjenca mjekësore",
        emergencyBody:
          "Nëse ke një urgjencë mjekësore, telefono vetë 112 tani. RediHealth nuk mund të telefonojë 112 në vendin tënd.",
        helpBefore: "Për të kërkuar ndihmë mjekësore, përdor faqen",
        helpLink: "Kërko ndihmë",
        helpAfter: "që kërkesa jote të shkojë drejt te ekipi ynë.",
        legalLinksHeading: "Dokumentet ligjore dhe privatësia",
        privacyLink: "Politika e privatësisë (GDPR)",
        cookiesLink: "Politika e cookie-ve",
        termsLink: "Kushtet dhe rregullat",
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
    },
    it: {
      versionMeta: meta,
      about: {
        title: "Cos'è RediHealth",
        description:
          "RediHealth ti aiuta a capire la tua salute, trovare cure mediche e raggiungere medici volontari e mediatori sanitari.",
        paragraphs: [
          "Abbiamo creato RediHealth perché tu sappia cosa fare quando hai un dubbio sulla salute. Puoi leggere guide in linguaggio semplice, controllare i sintomi, capire una ricetta o chiedere aiuto a un medico volontario o a un mediatore sanitario.",
          "Tutti i servizi sono gratuiti. Non chiediamo mai denaro o dati della carta. L'app è attualmente in fase di test e viene migliorata continuamente.",
          "RediHealth non sostituisce il medico di famiglia e non è un servizio di emergenza. In caso di emergenza medica, chiama subito il 112.",
        ],
        operatorHeading: "Chi gestisce RediHealth",
        operatorBody: `RediHealth fa parte di un progetto europeo REDI ed è gestito da ${LEGAL_OPERATOR.name}, sede legale in ${address}, numero BCE ${LEGAL_OPERATOR.bceNumber}.`,
      },
      contact: {
        title: "Contatti",
        description: "Hai una domanda su RediHealth, sul tuo account o sui tuoi dati personali? Scrivici e ti risponderemo.",
        operatorHeading: "Operatore della piattaforma",
        operatorNameLabel: "Organizzazione",
        addressLabel: "Sede legale",
        registrationLabel: "Numero di registrazione (BCE)",
        websiteLabel: "Sito ufficiale REDI",
        enquiries: "Domande generali e supporto",
        enquiriesHint: "Per domande sull'app, sugli appuntamenti o su collaborazioni.",
        dataProtectionHeading: "Protezione dei dati (GDPR)",
        dataProtectionBody:
          "Per accedere ai tuoi dati, correggerli, cancellarli, esportarli o revocare il consenso, scrivici all'indirizzo dedicato qui sotto. Rispondiamo entro un mese.",
        supervisoryNote:
          "Puoi presentare un reclamo all'Autorità belga per la protezione dei dati (APD/GBA) o all'autorità del tuo paese.",
        emergencies: "Emergenze mediche",
        emergencyBody:
          "In caso di emergenza medica, chiama tu stesso il 112 adesso. RediHealth non può chiamare il 112 al posto tuo.",
        helpBefore: "Per chiedere aiuto medico al nostro team, usa la pagina",
        helpLink: "Chiedi aiuto",
        helpAfter: "così la tua richiesta arriva direttamente alla nostra squadra.",
        legalLinksHeading: "Documenti legali e privacy",
        privacyLink: "Informativa sulla privacy (GDPR)",
        cookiesLink: "Politica sui cookie",
        termsLink: "Termini e condizioni",
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
    },
    hr: {
      versionMeta: meta,
      about: {
        title: "O RediHealthu",
        description:
          "RediHealth ti pomaže razumjeti svoje zdravlje, pronaći zdravstvenu skrb i doći do liječnika volontera i zdravstvenih medijatora.",
        paragraphs: [
          "Napravili smo RediHealth kako bi znao što učiniti kad imaš zdravstvenu brigu. Možeš čitati jednostavne vodiče, provjeriti simptome, razumjeti recept ili zatražiti pomoć liječnika volontera ili zdravstvenog medijatora.",
          "Sve usluge su besplatne. Nikada ne tražimo novac niti podatke o bankovnoj kartici. Aplikacija je u fazi testiranja i stalno je unaprjeđujemo.",
          "RediHealth ne zamjenjuje obiteljskog liječnika i nije hitna služba. U hitnom medicinskom slučaju odmah sam nazovi 112.",
        ],
        operatorHeading: "Tko upravlja platformom RediHealth",
        operatorBody: `RediHealth je dio europskog projekta REDI i njime upravlja ${LEGAL_OPERATOR.name}, sa sjedištem na adresi ${address}, broj BCE ${LEGAL_OPERATOR.bceNumber}.`,
      },
      contact: {
        title: "Kontaktiraj nas",
        description: "Imaš pitanje o RediHealthu, svom računu ili osobnim podacima? Piši nam i odgovorit ćemo ti.",
        operatorHeading: "Voditelj platforme",
        operatorNameLabel: "Organizacija",
        addressLabel: "Sjedište",
        registrationLabel: "Matični broj (BCE)",
        websiteLabel: "Službena stranica REDI",
        enquiries: "Opća pitanja i podrška",
        enquiriesHint: "Za pitanja o aplikaciji, terminima ili suradnji.",
        dataProtectionHeading: "Zaštita podataka (GDPR)",
        dataProtectionBody:
          "Za uvid, ispravak, brisanje, prijenos podataka ili povlačenje privole piši nam na donju adresu. Odgovaramo najkasnije u roku od mjesec dana.",
        supervisoryNote:
          "Možeš podnijeti pritužbu Belgijskom tijelu za zaštitu podataka (APD/GBA) ili nadzornom tijelu u svojoj državi.",
        emergencies: "Hitni medicinski slučajevi",
        emergencyBody:
          "U hitnom medicinskom slučaju odmah nazovi 112. RediHealth ne može nazvati 112 umjesto tebe.",
        helpBefore: "Ako želiš zatražiti liječničku pomoć, otvori stranicu",
        helpLink: "Potraži pomoć",
        helpAfter: "kako bi tvoj zahtjev stigao izravno našem timu.",
        legalLinksHeading: "Pravni dokumenti i privatnost",
        privacyLink: "Pravila privatnosti (GDPR)",
        cookiesLink: "Politika kolačića",
        termsLink: "Uvjeti korištenja",
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
    },
    rom: {
      versionMeta: meta,
      about: {
        title: "Vash RediHealth",
        description:
          "RediHealth zhutil tut te xatyares cho sastipen, te arakhes doktoresko zhutimos thaj te areses ko doktorya thaj sastipnaske mediatorya.",
        paragraphs: [
          "Kerdam RediHealth te zhanes so te keres kana si tut grija vash o sastipen. Shay te gines lokhe sikavimata, te dikhes che simptome, te xatyares ekh receta vay te manges zhutimos katar ekh doktori vay sastipnasko mediatori.",
          "Savore sluzhbe si bi lovesko. Shukar na mangas love vay bankake karte. I aplikaciya si and-i testiripnaski faza thaj lasharas la sako dives.",
          "RediHealth na achhel po than e doktoresko thaj nay sigardiari sluzhba. Ki sigardiari, akhar akana ko 112.",
        ],
        operatorHeading: "Kon kerel buchi e RediHealth-esa",
        operatorBody: `RediHealth si kotor katar evropako proyekto REDI thaj kerel buchi lestar ${LEGAL_OPERATOR.name}, adresa ${address}, BCE gino ${LEGAL_OPERATOR.bceNumber}.`,
      },
      contact: {
        title: "Kontakto",
        description: "Si tut phuchipe vash RediHealth, cho konto vay che podatke? Lekhav amenge thaj ka das tut palpale.",
        operatorHeading: "Organizaciya",
        operatorNameLabel: "Organizaciya",
        addressLabel: "Adresa",
        registrationLabel: "Registraciyako gino (BCE)",
        websiteLabel: "Oficialno rig REDI",
        enquiries: "Savore phuchimata thaj zhutimos",
        enquiriesHint: "Vash phuchimata vash i aplikaciya, vrame vay buchi khetane.",
        dataProtectionHeading: "Podatkengo arakhipe (GDPR)",
        dataProtectionBody:
          "Te dikhes, te lashares, te choses che podatke vay te les palpale cho mangipe, lekhav amenge ko emailo tele. Das palpale and-o ekh chhon.",
        supervisoryNote:
          "Shay te keres jalba ko Belgiyako autoriteto vash podatkengo arakhipe (APD/GBA) vay ande cho them (Rumuniya: ANSPDCP).",
        emergencies: "Sastipnaski sigardiari",
        emergencyBody:
          "Ki sastipnaski sigardiari, akhar tu akana ko 112. RediHealth nashti te akharel 112 pe cho than.",
        helpBefore: "Te manges sastipnasko zhutimos, labar i rig",
        helpLink: "Rod zhutimos",
        helpAfter: "te aresel cho mangipe rigate ko amaro timo.",
        legalLinksHeading: "Zakoneske lila thaj garavipe",
        privacyLink: "Garavipnaske pravila (GDPR)",
        cookiesLink: "Cookie pravila",
        termsLink: "Labaripnaske pravila",
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
    },
    ru: {
      versionMeta: meta,
      about: {
        title: "О RediHealth",
        description:
          "RediHealth помогает понять своё здоровье, найти медицинскую помощь и связаться с врачами-волонтёрами и медицинскими медиаторами.",
        paragraphs: [
          "Мы создали RediHealth, чтобы вы знали, что делать при беспокойстве о здоровье. Вы можете читать понятные руководства, проверять симптомы, разбирать рецепты или обращаться к врачу-волонтёру либо медицинскому медиатору.",
          "Все услуги бесплатны. Мы никогда не просим деньги или данные банковской карты. Приложение находится в тестовой фазе и постоянно развивается.",
          "RediHealth не заменяет семейного врача и не является службой экстренной помощи. В экстренной ситуации немедленно позвоните по номеру 112.",
        ],
        operatorHeading: "Кто управляет RediHealth",
        operatorBody: `RediHealth является частью европейского проекта REDI и управляется организацией ${LEGAL_OPERATOR.name}, юридический адрес: ${address}, номер BCE ${LEGAL_OPERATOR.bceNumber}.`,
      },
      contact: {
        title: "Контакты",
        description: "Есть вопросы о RediHealth, вашем аккаунте или персональных данных? Напишите нам, и мы ответим.",
        operatorHeading: "Оператор платформы",
        operatorNameLabel: "Организация",
        addressLabel: "Юридический адрес",
        registrationLabel: "Регистрационный номер (BCE)",
        websiteLabel: "Официальный сайт REDI",
        enquiries: "Общие вопросы и поддержка",
        enquiriesHint: "По вопросам работы приложения, записей или сотрудничества.",
        dataProtectionHeading: "Защита данных (GDPR)",
        dataProtectionBody:
          "Чтобы получить доступ к своим данным, исправить, удалить или перенести их, либо отозвать согласие, напишите на указанный ниже адрес. Мы отвечаем в течение одного месяца.",
        supervisoryNote:
          "Вы также вправе подать жалобу в Бельгийский орган по защите данных (APD/GBA) или в надзорный орган вашей страны (в Румынии: ANSPDCP).",
        emergencies: "Неотложная медицинская помощь",
        emergencyBody:
          "В экстренной медицинской ситуации немедленно позвоните по номеру 112 сами. RediHealth не может позвонить в 112 вместо вас.",
        helpBefore: "Чтобы обратиться за медицинской помощью к нашей команде, откройте страницу",
        helpLink: "Попросить помощь",
        helpAfter: "чтобы ваш запрос поступил напрямую нашим специалистам.",
        legalLinksHeading: "Юридические документы и конфиденциальность",
        privacyLink: "Политика конфиденциальности (GDPR)",
        cookiesLink: "Политика cookie",
        termsLink: "Условия использования",
      },
      accessibility: {
        title: "Доступность",
        description: "Мы хотим, чтобы каждый мог пользоваться RediHealth.",
        paragraphs: [
          "RediHealth должен корректно работать с программами чтения с экрана и при управлении только с клавиатуры. Цвета имеют достаточный контраст, а фокус всегда виден.",
          "Мы постоянно улучшаем доступность. Если какой-либо раздел неудобен при использовании вспомогательных технологий, напишите нам, и мы исправим это.",
        ],
        contactLead: "Напишите нам на",
        contact: "чтобы сообщить о проблеме доступности или запросить информацию в другом формате.",
      },
    },
  };

  return byLang[lang] ?? byLang.en;
}
