import type { Lang } from "./translations";

type WorkspaceCopy = {
  title: string;
  subtitle: string;
  tools: string;
  inboxHint: string;
  emptyHint: string;
  selectionHint: string;
  meetingsHint: string;
  teamHint: string;
};

export const panelWorkspaceTranslations: Record<Lang, WorkspaceCopy> = {
  en: {
    title: "Your care workspace",
    subtitle: "Manage requests, support patients, and keep care moving.",
    tools: "Care tools",
    inboxHint: "Review requests and plan the next step.",
    emptyHint: "Try another folder or clear your filters to find a request.",
    selectionHint: "Choose a request from the list to view the details, add notes, or plan the next step.",
    meetingsHint: "Open your video consultation workspace.",
    teamHint: "Manage staff and care responsibilities.",
  },
  ro: {
    title: "Spațiul tău de îngrijire",
    subtitle: "Gestionează solicitările, sprijină pacienții și coordonează îngrijirea.",
    tools: "Instrumente de îngrijire",
    inboxHint: "Verifică solicitările și planifică pasul următor.",
    emptyHint: "Încearcă alt dosar sau șterge filtrele pentru a găsi o solicitare.",
    selectionHint: "Alege o solicitare din listă pentru a vedea detaliile, a adăuga notițe sau a planifica pasul următor.",
    meetingsHint: "Deschide spațiul pentru consultații video.",
    teamHint: "Gestionează personalul și responsabilitățile de îngrijire.",
  },
  sq: {
    title: "Hapësira jote e kujdesit",
    subtitle: "Menaxho kërkesat, mbështet pacientët dhe koordino kujdesin.",
    tools: "Mjetet e kujdesit",
    inboxHint: "Shqyrto kërkesat dhe planifiko hapin tjetër.",
    emptyHint: "Provo një dosje tjetër ose pastro filtrat për të gjetur një kërkesë.",
    selectionHint: "Zgjidh një kërkesë nga lista për të parë hollësitë, për të shtuar shënime ose për të planifikuar hapin tjetër.",
    meetingsHint: "Hap hapësirën e konsultave me video.",
    teamHint: "Menaxho stafin dhe përgjegjësitë e kujdesit.",
  },
  it: {
    title: "Il tuo spazio di cura",
    subtitle: "Gestisci le richieste, sostieni i pazienti e coordina le cure.",
    tools: "Strumenti di cura",
    inboxHint: "Esamina le richieste e pianifica il prossimo passo.",
    emptyHint: "Prova un'altra cartella o cancella i filtri per trovare una richiesta.",
    selectionHint: "Scegli una richiesta dall'elenco per vedere i dettagli, aggiungere note o pianificare il prossimo passo.",
    meetingsHint: "Apri lo spazio per le visite video.",
    teamHint: "Gestisci il personale e le responsabilità di cura.",
  },
  hr: {
    title: "Tvoj prostor za skrb",
    subtitle: "Upravljaj zahtjevima, podrži pacijente i koordiniraj skrb.",
    tools: "Alati za skrb",
    inboxHint: "Pregledaj zahtjeve i planiraj sljedeći korak.",
    emptyHint: "Pokušaj drugu mapu ili ukloni filtre za pronalazak zahtjeva.",
    selectionHint: "Odaberi zahtjev s popisa za pregled detalja, dodavanje bilješki ili planiranje sljedećeg koraka.",
    meetingsHint: "Otvori prostor za videokonzultacije.",
    teamHint: "Upravljaj osobljem i odgovornostima za skrb.",
  },
  rom: {
    title: "Tiro than e grizhako",
    subtitle: "Rakh le mangimata, azhutis le pacienturen thaj organizisar i grizha.",
    tools: "Instrumentura e grizhake",
    inboxHint: "Dikh le mangimata thaj planisar o avutno paso.",
    emptyHint: "Zumav aver dosaro vay kos le filtre te arakhes ekh mangipen.",
    selectionHint: "Alosar ekh mangipen andar i lista te dikhes le detalyura, te thos noticye vay te planisares o avutno paso.",
    meetingsHint: "Putar o than e video-dikhipnasko.",
    teamHint: "Organizisar le bukyarnen thaj le grizhake responsabilitetura.",
  },
  ru: {
    title: "Ваше рабочее пространство",
    subtitle: "Управляйте запросами, помогайте пациентам и координируйте помощь.",
    tools: "Инструменты помощи",
    inboxHint: "Просматривайте запросы и планируйте следующий шаг.",
    emptyHint: "Выберите другую папку или сбросьте фильтры, чтобы найти запрос.",
    selectionHint: "Выберите запрос в списке, чтобы просмотреть детали, добавить заметки или запланировать следующий шаг.",
    meetingsHint: "Откройте рабочее пространство видеоконсультаций.",
    teamHint: "Управляйте сотрудниками и обязанностями по уходу.",
  },
};
