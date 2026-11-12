import type { Lang } from "./translations";
import { withLangPrefix } from "./routing";

export type ReplyTemplateId = "acknowledgment" | "consultation" | "referral";
type EmailCopy = {
  greeting: string; closing: string; team: string; defaultReason: string;
  code: { subject: string; badge: string; heading: string; intro: string; label: string; duration: string; expires: string; secret: string; ignored: string; reason: string };
  request: { subject: string; badge: string; heading: string; intro: string; summary: string; name: string; phone: string; email: string; description: string; missing: string; reason: string };
  reply: {
    reason: string; topic: string; phone: string; call: string; preferredTime: string; map: string;
    templates: Record<ReplyTemplateId, { subject: string; intro: string }>;
  };
};

export const emailTranslations: Record<Lang, EmailCopy> = {
"hr": {"greeting":"Pozdrav","closing":"Srdačan pozdrav,","team":"RediHealth tim","defaultReason":"Ovu poruku primate zbog aktivnosti na RediHealthu.","code":{"subject":"Vaš RediHealth kod za potvrdu","badge":"Kod za potvrdu","heading":"Prijava u RediHealth","intro":"Upotrijebite jednokratni kod u nastavku za siguran pristup računu.","label":"Kod za potvrdu","duration":"10 minuta","expires":"Istječe za","secret":"Nikome ne otkrivajte ovaj kod.","ignored":"Ako niste zatražili kod, zanemarite poruku. Vaš račun nije promijenjen.","reason":"Ovu poruku primate jer je pokrenuta prijava vašom adresom e-pošte."},"request":{"subject":"Potvrda: primljen zahtjev za medicinsku pomoć — RediHealth","badge":"Zahtjev primljen","heading":"Primili smo vaš zahtjev","intro":"Hvala što ste kontaktirali RediHealth. Naš zdravstveni tim primio je zahtjev i uskoro će ga pregledati.","summary":"Sažetak zahtjeva","name":"Ime","phone":"Telefon","email":"E-pošta","description":"Opis","missing":"Nije navedeno","reason":"Ovu poruku primate jer je ovom adresom poslan zahtjev za medicinsku pomoć."},"reply":{"reason":"Ovo je odgovor na vaš zahtjev za pomoć na RediHealthu.","topic":"Tema zahtjeva","phone":"Kontaktni telefon","call":"Član našeg zdravstvenog tima uskoro će vas nazvati na","preferredTime":"Odgovorite kada vam odgovara poziv.","map":"Otvorite kartu pomoći","templates":{"acknowledgment":{"subject":"Zahtjev za pomoć primljen","intro":"Primili smo vaš zahtjev za medicinsku pomoć i naš ga tim pregledava."},"consultation":{"subject":"Mogućnosti razgovora i podrške","intro":"Možemo dogovoriti kratak poziv ili vam pomoći pronaći zdravstvenu ustanovu u blizini."},"referral":{"subject":"Pomoć i sljedeći koraci","intro":"Za opisani problem javite se obiteljskom liječniku ili obližnjoj ambulanti. Na našoj karti možete pronaći klinike i ljekarne."}}}},
"rom": {"greeting":"Mishto avilyan","closing":"Sastipnasa,","team":"I ekipa RediHealth","defaultReason":"Akava email avel vash chi aktivita pe RediHealth.","code":{"subject":"Cho RediHealth kodo vash konfirmacia","badge":"Kodo vash konfirmacia","heading":"Anderav pe RediHealth","intro":"Lel o kodo telal vash jekhvarno sigurno anderavimos ande cho konto.","label":"Kodo vash konfirmacia","duration":"10 minuti","expires":"O kodo agorisarel ande","secret":"Ma de akava kodo khanikaske.","ignored":"Te na manglyan akava kodo, shaj te mukhes akava email. Cho konto na paruvdilo.","reason":"Akava email avel ke ekh anderavimos sas manglo vash chi email adresa."},"request":{"subject":"Konfirmacia: cho mangimos vash sastipnasko zhutimos si lino — RediHealth","badge":"Mangimos lino","heading":"Liyam cho mangimos","intro":"Nais tuke ke kontaktisardyan RediHealth. Amari sastipnaski ekipa liyas cho mangimos thaj sigo ka drabarel les.","summary":"Xarno mangimos","name":"Anav","phone":"Telefono","email":"Email","description":"Vakerimos","missing":"Naj dino","reason":"Akava email avel ke ekh mangimos vash sastipnasko zhutimos sas bichhaldo kadale adresasa."},"reply":{"reason":"Akava si amaro palpale vakerimos vash cho mangimos pe RediHealth.","topic":"Tema e mangimaski","phone":"Telefono vash kontakto","call":"Ekh manush katar amari sastipnaski ekipa sigo ka akharel tut pe","preferredTime":"Lekhar amenge kana shaj te des duma.","map":"Phuter i mapa vash zhutimos","templates":{"acknowledgment":{"subject":"Cho mangimos si lino","intro":"Liyam cho mangimos vash sastipnasko zhutimos thaj amari ekipa drabarel les akana."},"consultation":{"subject":"Vakerimos thaj zhutimos","intro":"Shaj te akharas tut vash ekh kharno vakerimos vay te zhutas tut te arakhes pashutni klinika."},"referral":{"subject":"Zhutimos thaj e avutne pasura","intro":"Vash kodya so lekhardyan amenge, dzha ko cho familijako doktori vay ki pashutni klinika. Arakhes klinike thaj farmaciye pe amari mapa."}}}},

  en: {
    greeting: "Hello", closing: "Best regards,", team: "The RediHealth Team",
    defaultReason: "You received this email regarding your RediHealth activity.",
    code: {
      subject: "Your RediHealth verification code", badge: "Verification Code", heading: "Sign in to RediHealth",
      intro: "Use the one-time verification code below to securely access your RediHealth account.",
      label: "Verification Code", duration: "10 minutes", expires: "Expires in", secret: "Never share this code with anyone.",
      ignored: "If you did not request this code, you can ignore this email. No changes have been made to your account.",
      reason: "You received this email because a sign-in attempt was initiated for your email address.",
    },
    request: {
      subject: "Confirmation: Medical Help Request Received - RediHealth", badge: "Request Received", heading: "We received your request",
      intro: "Thank you for reaching out to RediHealth. Our healthcare team has received your medical assistance request and will review it shortly.",
      summary: "Request Summary", name: "Name", phone: "Phone", email: "Email", description: "Description", missing: "Not provided",
      reason: "You received this email because a medical assistance request was submitted for this address.",
    },
    reply: {
      reason: "You received this email in response to your medical help request on RediHealth.",
      topic: "Request topic", phone: "Contact phone", call: "A member of our healthcare team will call you shortly at",
      preferredTime: "Please reply with your preferred time for a call.", map: "Open Find Help map",
      templates: {
        acknowledgment: { subject: "Medical request received", intro: "We received your medical help request and a member of our healthcare team is now reviewing it." },
        consultation: { subject: "Support consultation options", intro: "We can schedule a short call or help you find a nearby healthcare facility." },
        referral: { subject: "Help and next steps", intro: "For the concern you described, please contact your family doctor or a nearby clinic. Our map can help you find clinics and pharmacies near you." },
      },
    },
  },
  ro: {
    greeting: "Bună", closing: "Cu stimă,", team: "Echipa RediHealth",
    defaultReason: "Ai primit acest email în legătură cu activitatea ta pe RediHealth.",
    code: {
      subject: "Codul tău de verificare RediHealth", badge: "Cod de verificare", heading: "Autentificare în RediHealth",
      intro: "Folosește codul de unică folosință de mai jos pentru a accesa în siguranță contul tău RediHealth.",
      label: "Cod de verificare", duration: "10 minute", expires: "Expiră în", secret: "Nu comunica acest cod nimănui.",
      ignored: "Dacă nu ai solicitat acest cod, poți ignora emailul. Contul tău nu a fost modificat.",
      reason: "Ai primit acest email deoarece a fost inițiată o autentificare cu adresa ta de email.",
    },
    request: {
      subject: "Confirmare: cererea ta de ajutor medical a fost primită - RediHealth", badge: "Cerere primită", heading: "Am primit cererea ta",
      intro: "Îți mulțumim că ai contactat RediHealth. Echipa noastră medicală a primit cererea ta de ajutor și o va analiza în curând.",
      summary: "Rezumatul cererii", name: "Nume", phone: "Telefon", email: "Email", description: "Descriere", missing: "Nespecificat",
      reason: "Ai primit acest email deoarece a fost trimisă o cerere de ajutor medical folosind această adresă.",
    },
    reply: {
      reason: "Ai primit acest email ca răspuns la cererea ta de ajutor medical pe RediHealth.",
      topic: "Subiectul cererii", phone: "Telefon de contact", call: "Un membru al echipei medicale te va suna în curând la",
      preferredTime: "Răspunde la acest email și spune-ne când poți vorbi la telefon.", map: "Deschide harta cu servicii medicale",
      templates: {
        acknowledgment: { subject: "Am primit cererea de ajutor medical", intro: "Am primit cererea ta de ajutor medical. Un membru al echipei medicale o analizează acum." },
        consultation: { subject: "Opțiuni pentru o discuție cu echipa medicală", intro: "Putem programa o discuție scurtă la telefon sau te putem ajuta să găsești o instituție medicală apropiată." },
        referral: { subject: "Ajutor și pașii următori", intro: "Pentru problema descrisă, contactează medicul de familie sau o clinică din apropiere. Pe harta noastră găsești clinici și farmacii aproape de tine." },
      },
    },
  },
  sq: {
    greeting: "Përshëndetje", closing: "Me respekt,", team: "Ekipi RediHealth",
    defaultReason: "E more këtë email lidhur me aktivitetin tënd në RediHealth.",
    code: {
      subject: "Kodi yt i verifikimit RediHealth", badge: "Kod verifikimi", heading: "Hyr në RediHealth",
      intro: "Përdor kodin njëpërdorimësh më poshtë për të hyrë në mënyrë të sigurt në llogarinë tënde RediHealth.",
      label: "Kod verifikimi", duration: "10 minuta", expires: "Skadon pas", secret: "Mos ia trego këtë kod askujt.",
      ignored: "Nëse nuk e kërkove këtë kod, mund ta shpërfillësh këtë email. Llogaria jote nuk është ndryshuar.",
      reason: "E more këtë email sepse u nis një përpjekje hyrjeje me adresën tënde të emailit.",
    },
    request: {
      subject: "Konfirmim: kërkesa jote për ndihmë mjekësore u mor - RediHealth", badge: "Kërkesa u mor", heading: "E morëm kërkesën tënde",
      intro: "Faleminderit që kontaktove RediHealth. Ekipi ynë mjekësor e mori kërkesën tënde për ndihmë dhe do ta shqyrtojë së shpejti.",
      summary: "Përmbledhja e kërkesës", name: "Emri", phone: "Telefoni", email: "Emaili", description: "Përshkrimi", missing: "Nuk është dhënë",
      reason: "E more këtë email sepse u dërgua një kërkesë për ndihmë mjekësore me këtë adresë.",
    },
    reply: {
      reason: "E more këtë email si përgjigje ndaj kërkesës tënde për ndihmë mjekësore në RediHealth.",
      topic: "Tema e kërkesës", phone: "Telefoni i kontaktit", call: "Një anëtar i ekipit tonë mjekësor do të të telefonojë së shpejti në",
      preferredTime: "Përgjigju në këtë email dhe na trego kur mund të flasësh në telefon.", map: "Hap hartën e shërbimeve mjekësore",
      templates: {
        acknowledgment: { subject: "Kërkesa për ndihmë mjekësore u mor", intro: "E morëm kërkesën tënde për ndihmë mjekësore dhe një anëtar i ekipit tonë po e shqyrton." },
        consultation: { subject: "Mundësitë për një bisedë me ekipin mjekësor", intro: "Mund të caktojmë një telefonatë të shkurtër ose të të ndihmojmë të gjesh një institucion mjekësor afër teje." },
        referral: { subject: "Ndihma dhe hapat e ardhshëm", intro: "Për shqetësimin që përshkrove, kontakto mjekun e familjes ose një klinikë pranë teje. Harta jonë të ndihmon të gjesh klinika dhe farmaci afër." },
      },
    },
  },
  it: {
    greeting: "Ciao", closing: "Cordiali saluti,", team: "Il team RediHealth",
    defaultReason: "Hai ricevuto questa email in relazione alla tua attività su RediHealth.",
    code: {
      subject: "Il tuo codice di verifica RediHealth", badge: "Codice di verifica", heading: "Accedi a RediHealth",
      intro: "Usa il codice monouso qui sotto per accedere in modo sicuro al tuo account RediHealth.",
      label: "Codice di verifica", duration: "10 minuti", expires: "Scade tra", secret: "Non condividere questo codice con nessuno.",
      ignored: "Se non hai richiesto questo codice, puoi ignorare questa email. Il tuo account non è stato modificato.",
      reason: "Hai ricevuto questa email perché è stato avviato un tentativo di accesso con il tuo indirizzo email.",
    },
    request: {
      subject: "Conferma: richiesta di assistenza medica ricevuta - RediHealth", badge: "Richiesta ricevuta", heading: "Abbiamo ricevuto la tua richiesta",
      intro: "Grazie per aver contattato RediHealth. Il nostro team medico ha ricevuto la tua richiesta di assistenza e la esaminerà a breve.",
      summary: "Riepilogo della richiesta", name: "Nome", phone: "Telefono", email: "Email", description: "Descrizione", missing: "Non specificato",
      reason: "Hai ricevuto questa email perché è stata inviata una richiesta di assistenza medica con questo indirizzo.",
    },
    reply: {
      reason: "Hai ricevuto questa email in risposta alla tua richiesta di assistenza medica su RediHealth.",
      topic: "Oggetto della richiesta", phone: "Telefono di contatto", call: "Un membro del nostro team medico ti chiamerà a breve al numero",
      preferredTime: "Rispondi a questa email indicando quando puoi parlare al telefono.", map: "Apri la mappa dei servizi sanitari",
      templates: {
        acknowledgment: { subject: "Richiesta di assistenza medica ricevuta", intro: "Abbiamo ricevuto la tua richiesta di assistenza medica e un membro del nostro team la sta esaminando." },
        consultation: { subject: "Opzioni per un colloquio con il team medico", intro: "Possiamo fissare una breve telefonata o aiutarti a trovare una struttura sanitaria nelle vicinanze." },
        referral: { subject: "Assistenza e prossimi passi", intro: "Per il problema descritto, contatta il tuo medico di famiglia o una clinica vicina. La nostra mappa ti aiuta a trovare cliniche e farmacie nella tua zona." },
      },
    },
  },
  ru: {
    greeting: "Здравствуйте", closing: "С уважением,", team: "Команда RediHealth",
    defaultReason: "Вы получили это письмо в связи с вашей активностью в RediHealth.",
    code: {
      subject: "Ваш код подтверждения RediHealth", badge: "Код подтверждения", heading: "Вход в RediHealth",
      intro: "Используйте одноразовый код ниже для безопасного входа в свой аккаунт RediHealth.",
      label: "Код подтверждения", duration: "10 минут", expires: "Срок действия:", secret: "Никому не сообщайте этот код.",
      ignored: "Если вы не запрашивали этот код, проигнорируйте письмо. Ваш аккаунт не был изменён.",
      reason: "Вы получили это письмо, потому что была предпринята попытка входа с вашим адресом электронной почты.",
    },
    request: {
      subject: "Подтверждение: запрос медицинской помощи получен — RediHealth", badge: "Запрос получен", heading: "Мы получили ваш запрос",
      intro: "Спасибо за обращение в RediHealth. Наша медицинская команда получила ваш запрос о помощи и вскоре рассмотрит его.",
      summary: "Содержание запроса", name: "Имя", phone: "Телефон", email: "Электронная почта", description: "Описание", missing: "Не указано",
      reason: "Вы получили это письмо, потому что с этим адресом был отправлен запрос медицинской помощи.",
    },
    reply: {
      reason: "Вы получили это письмо в ответ на ваш запрос медицинской помощи в RediHealth.",
      topic: "Тема запроса", phone: "Контактный телефон", call: "Сотрудник нашей медицинской команды вскоре позвонит вам по номеру",
      preferredTime: "Ответьте на это письмо и укажите удобное время для звонка.", map: "Открыть карту медицинских учреждений",
      templates: {
        acknowledgment: { subject: "Запрос медицинской помощи получен", intro: "Мы получили ваш запрос медицинской помощи. Сотрудник нашей команды уже рассматривает его." },
        consultation: { subject: "Варианты консультации с медицинской командой", intro: "Мы можем договориться о коротком звонке или помочь найти медицинское учреждение поблизости." },
        referral: { subject: "Помощь и дальнейшие действия", intro: "По описанной проблеме обратитесь к семейному врачу или в ближайшую клинику. Наша карта поможет найти клиники и аптеки рядом с вами." },
      },
    },
  },
};

export type HelpReplyInput = { templateId: ReplyTemplateId; name: string; phone: string; description: string; lang: Lang };
export function helpReplyContent({ templateId, name, phone, description, lang }: HelpReplyInput) {
  const copy = emailTranslations[lang];
  const reply = copy.reply;
  const template = reply.templates[templateId];
  const trimmed = description.trim();
  const excerpt = trimmed.length > 100 ? `${trimmed.slice(0, 100).trimEnd()}…` : trimmed;
  const mapUrl = `https://redihealth.org${withLangPrefix("/find-help", lang)}`;
  const details = templateId === "acknowledgment"
    ? [`${reply.topic}: ${excerpt}`, `${reply.call} ${phone}`]
    : templateId === "consultation" ? [reply.preferredTime, `${reply.phone}: ${phone}`] : [];
  const paragraphs = [template.intro, ...details, ...(templateId === "referral" ? [`${reply.map}: ${mapUrl}`] : [])];
  return {
    subject: `RediHealth: ${template.subject}`, heading: template.subject, intro: template.intro, details, mapUrl,
    text: [`${copy.greeting}${name.trim() ? `, ${name.trim()}` : ""},`, ...paragraphs, `${copy.closing}\n${copy.team}`].join("\n\n"),
  };
}
