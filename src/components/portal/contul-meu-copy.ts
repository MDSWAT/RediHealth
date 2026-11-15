import type { Lang } from "@/lib/i18n/translations";

export type PortalPreviewFeatureId = "plan" | "appointments" | "family";

export type PortalPreviewFeature = {
  id: PortalPreviewFeatureId;
  title: string;
  body: string;
};

export type ContulMeuCopy = {
  backHome: string;
  eyebrow: string;
  lead: string;
  previewRegionLabel: string;
  features: [PortalPreviewFeature, PortalPreviewFeature, PortalPreviewFeature];
  privacyNote: string;
  card: {
    badge: string;
    step: (current: number, total: number) => string;
    step1Heading: string;
    step2Heading: string;
    phoneReadyHint: string;
    phoneInputHint: string;
  };
};

export const contulMeuCopy: Record<Lang, ContulMeuCopy> = {
  ro: {
    backHome: "Înapoi la prima pagină",
    eyebrow: "Acces gratuit prin SMS, fără parolă sau email",
    lead: "Găsești într-un singur loc recomandările medicului, planul de tratament și programările tale. Intri simplu cu numărul de telefon folosit la programare.",
    previewRegionLabel: "Ce găsești în dosarul tău medical",
    features: [
      {
        id: "plan",
        title: "Planul de tratament și rețeta",
        body: "Vezi medicamentele prescrise, schema zilnică pe ore și recomandările de acasă, gata de tipărit.",
      },
      {
        id: "appointments",
        title: "Programări și mesaje către echipă",
        body: "Verifici controalele viitoare, ceri un apel de urmărire sau spui rapid cum te simți.",
      },
      {
        id: "family",
        title: "Analize încărcate și partajare simplă",
        body: "Adaugi fotografii cu rețete sau analize și trimiți rezumatul cu un singur gest unui membru al familiei.",
      },
    ],
    privacyNote: "Accesul este protejat printr-un cod SMS valabil o singură dată. Datele tale rămân confidențiale și nu pot fi văzute de altcineva.",
    card: {
      badge: "Verificare prin SMS",
      step: (current, total) => `Pasul ${current} din ${total}`,
      step1Heading: "Confirmă numărul tău",
      step2Heading: "Introdu codul primit",
      phoneReadyHint: "Numărul arată bine. Apasă pe buton ca să primești codul din 4 cifre prin SMS.",
      phoneInputHint: "Folosește numărul de mobil lăsat la consultație.",
    },
  },
  en: {
    backHome: "Back to home page",
    eyebrow: "Free SMS access, no password or email needed",
    lead: "Find your doctor's advice, treatment plan and appointments in one place. Sign in simply with the phone number you used when booking.",
    previewRegionLabel: "What you find inside your medical record",
    features: [
      {
        id: "plan",
        title: "Treatment plan and prescription",
        body: "See prescribed medicines, your daily schedule and care instructions at home, ready to print.",
      },
      {
        id: "appointments",
        title: "Check-ups and care team messages",
        body: "Check upcoming visits, ask for a follow-up call or share how you are feeling.",
      },
      {
        id: "family",
        title: "Document uploads and family sharing",
        body: "Add photos of lab results or prescriptions and send a clear summary to a family member.",
      },
    ],
    privacyNote: "Your record is protected by a single-use SMS code. Your information stays private and confidential.",
    card: {
      badge: "SMS verification",
      step: (current, total) => `Step ${current} of ${total}`,
      step1Heading: "Confirm your phone number",
      step2Heading: "Enter your code",
      phoneReadyHint: "Your number looks ready. Press the button below to get your 4-digit SMS code.",
      phoneInputHint: "Use the mobile number from your appointment.",
    },
  },
  sq: {
    backHome: "Kthehu te faqja kryesore",
    eyebrow: "Hyrje falas me SMS, pa fjalëkalim ose email",
    lead: "Gjej në një vend të vetëm këshillat e mjekut, planin e mjekimit dhe takimet e tua. Hyr thjesht me numrin e telefonit që përdore për takim.",
    previewRegionLabel: "Çfarë gjen në dosjen tënde mjekësore",
    features: [
      {
        id: "plan",
        title: "Plani i mjekimit dhe receta",
        body: "Shiko barnat e përshkruara, orarin ditor dhe udhëzimet për në shtëpi, gati për shtypje.",
      },
      {
        id: "appointments",
        title: "Kontrollet dhe mesazhet për ekipin",
        body: "Kontrollo vizitat e ardhshme, kërko një telefonatë ose trego shpejt si ndihesh.",
      },
      {
        id: "family",
        title: "Fotot e analizave dhe ndarja me familjen",
        body: "Ngarko foto të analizave ose recetave dhe dërgoja përmbledhjen një familjari.",
      },
    ],
    privacyNote: "Hyrja mbrohet me një kod SMS që përdoret vetëm një herë. Të dhënat e tua mbeten konfidenciale.",
    card: {
      badge: "Verifikim me SMS",
      step: (current, total) => `Hapi ${current} nga ${total}`,
      step1Heading: "Konfirmo numrin tënd",
      step2Heading: "Shkruaj kodin e marrë",
      phoneReadyHint: "Numri është gati. Shtyp butonin për të marrë kodin me 4 shifra në SMS.",
      phoneInputHint: "Përdor numrin e telefonit nga takimi mjekësor.",
    },
  },
  it: {
    backHome: "Torna all'inizio",
    eyebrow: "Accesso gratuito via SMS, senza password né email",
    lead: "Trova in un unico posto i consigli del medico, il piano di cura e i tuoi appuntamenti. Accedi facilmente con il numero di telefono usato per la prenotazione.",
    previewRegionLabel: "Cosa trovi nella tua cartella clinica",
    features: [
      {
        id: "plan",
        title: "Piano di cura e ricetta",
        body: "Consulta i farmaci prescritti, gli orari giornalieri e le indicazioni per casa, pronte da stampare.",
      },
      {
        id: "appointments",
        title: "Controlli e messaggi al team",
        body: "Controlla le prossime visite, chiedi una chiamata o aggiorna su come ti senti.",
      },
      {
        id: "family",
        title: "Esami caricati e condivisione rapida",
        body: "Allega foto di ricette o referti e invia il riepilogo a un familiare con un tocco.",
      },
    ],
    privacyNote: "L'accesso è protetto da un codice SMS monouso. I tuoi dati sanitari restano riservati.",
    card: {
      badge: "Verifica via SMS",
      step: (current, total) => `Passo ${current} di ${total}`,
      step1Heading: "Conferma il tuo numero",
      step2Heading: "Inserisci il codice ricevuto",
      phoneReadyHint: "Il numero è pronto. Premi il pulsante per ricevere il codice a 4 cifre via SMS.",
      phoneInputHint: "Usa il numero di cellulare indicato alla visita.",
    },
  },
  hr: {
    backHome: "Natrag na početnu",
    eyebrow: "Besplatan pristup putem SMS poruke, bez lozinke ili e-pošte",
    lead: "Na jednom mjestu pronađi liječničke upute, plan liječenja i svoje termine. Prijavi se jednostavno brojem telefona s narudžbe.",
    previewRegionLabel: "Što se nalazi u tvom zdravstvenom kartonu",
    features: [
      {
        id: "plan",
        title: "Plan liječenja i recepti",
        body: "Pregledaj propisane lijekove, dnevni raspored uzimanja i upute za oporavak kod kuće.",
      },
      {
        id: "appointments",
        title: "Pregledi i poruke timu",
        body: "Provjeri nadolazeće termine, zatraži kontrolni poziv ili javi kako se osjećaš.",
      },
      {
        id: "family",
        title: "Nalazi i dijeljenje s obitelji",
        body: "Dodaj fotografije nalaza ili recepata i pošalji sažetak članu obitelji jednim dodirom.",
      },
    ],
    privacyNote: "Pristup je zaštićen jednokratnim SMS kodom. Tvoji zdravstveni podaci ostaju povjerljivi.",
    card: {
      badge: "Provjera putem SMS poruke",
      step: (current, total) => `Korak ${current} od ${total}`,
      step1Heading: "Potvrdi svoj broj",
      step2Heading: "Upiši primljeni kod",
      phoneReadyHint: "Broj je spreman. Pritisni gumb kako bi primio četveroznamenkasti kod putem SMS poruke.",
      phoneInputHint: "Upotrijebi broj mobitela s rezervacije pregleda.",
    },
  },
  rom: {
    backHome: "Palpale pe angluni rig",
    eyebrow: "Bi lovesko khuvipe katar SMS, bi parolako vay emailosko",
    lead: "Arakh and-ekh than e doktoreske sikavimata, o plano vash o sastyaripe thaj che vrame. Khuves lokhes e telefoneske ginesa katar e programacia.",
    previewRegionLabel: "So arakhes and-o cho sastipnasko dosyaro",
    features: [
      {
        id: "plan",
        title: "Plano vash sastyaripe thaj recepte",
        body: "Dikh e drabenge rekomandacie, e divesesko programo thaj so te keres khere.",
      },
      {
        id: "appointments",
        title: "Vizite thaj mesažurya ko timo",
        body: "Dikh e vrame kana si te zhas ko doktori vay phen sar simtyoves tut.",
      },
      {
        id: "family",
        title: "Fotografie katar analize thaj familiya",
        body: "Chhiv patreta e analizenca vay receptenca thaj bichhal o rezume e familiyake.",
      },
    ],
    privacyNote: "O khuvipe si garavdo ekh-data SMS kodosa. Che date achhon garavde.",
    card: {
      badge: "Chacharipe katar SMS",
      step: (current, total) => `Kadam ${current} katar ${total}`,
      step1Heading: "Chachar cho telefonesko gin",
      step2Heading: "Chhiv o kodo so lyan",
      phoneReadyHint: "Cho gin si gata. Pisar pe kopche te les o kodo katar 4 gina pe SMS.",
      phoneInputHint: "Labar o telefonesko gin katar e programacia.",
    },
  },
  ru: {
    backHome: "На главную страницу",
    eyebrow: "Бесплатный вход по SMS, без пароля и электронной почты",
    lead: "В одном месте собраны рекомендации врача, план лечения и ваши записи на прием. Войдите просто по номеру телефона, указанному при записи.",
    previewRegionLabel: "Что находится в вашей медицинской карте",
    features: [
      {
        id: "plan",
        title: "План лечения и рецепты",
        body: "Просматривайте назначенные лекарства, расписание приема по часам и домашние рекомендации.",
      },
      {
        id: "appointments",
        title: "Осмотры и связь с командой",
        body: "Проверяйте будущие приемы, запрашивайте звонок и сообщайте о своем самочувствии.",
      },
      {
        id: "family",
        title: "Загрузка анализов и помощь близких",
        body: "Добавляйте фото рецептов или результатов анализов и делитесь сводкой с родными.",
      },
    ],
    privacyNote: "Вход защищен одноразовым кодом из SMS. Ваши медицинские данные остаются конфиденциальными.",
    card: {
      badge: "Проверка по SMS",
      step: (current, total) => `Шаг ${current} из ${total}`,
      step1Heading: "Подтвердите номер телефона",
      step2Heading: "Введите полученный код",
      phoneReadyHint: "Номер готов. Нажмите кнопку ниже, чтобы получить 4-значный код по SMS.",
      phoneInputHint: "Укажите номер мобильного телефона, с которым вы записывались.",
    },
  },
};
