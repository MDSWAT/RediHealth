import type { Lang } from "@/lib/i18n/translations";

export type PwaCopy = {
  installButton: string;
  refreshApp: string;
  refreshingApp: string;
  bannerTitle: string;
  bannerBody: string;
  notNow: string;
  closeLabel: string;
  updateReadyTitle: string;
  updateReadyBody: string;
  updateNow: string;
  dialogTitle: string;
  dialogSubtitle: string;
  iosSafariSteps: [string, string, string];
  iosOtherSteps: [string, string, string];
  inAppSteps: [string, string];
  androidManualSteps: [string, string, string];
  macosSafariSteps: [string, string];
  desktopManualSteps: [string, string];
  copyLink: string;
  copiedLink: string;
  doneButton: string;
};

export const PWA_COPY: Record<Lang, PwaCopy> = {
  ro: {
    installButton: "Instalează aplicația",
    refreshApp: "Actualizează aplicația",
    refreshingApp: "Se actualizează…",
    bannerTitle: "Instalează RediHealth",
    bannerBody: "Accesează mai rapid ghidul de simptome și clinicile de pe ecranul principal.",
    notNow: "Nu acum",
    closeLabel: "Închide",
    updateReadyTitle: "Versiune nouă disponibilă",
    updateReadyBody: "O versiune actualizată RediHealth este gata de încărcare.",
    updateNow: "Actualizează acum",
    dialogTitle: "Instalează RediHealth",
    dialogSubtitle: "Adaugă RediHealth pe dispozitiv pentru acces rapid.",
    iosSafariSteps: [
      "Apasă butonul de partajare din Safari sau mai întâi meniul cu trei puncte pe versiunile noi de iPhone și iPad.",
      "Derulează și alege adaugă la ecranul principal.",
      "Apasă adaugă pentru ca RediHealth să apară pe ecranul principal și în biblioteca de aplicații.",
    ],
    iosOtherSteps: [
      "Deschide această pagină în Safari pe iPhone sau iPad, ori apasă pictograma de partajare din browser.",
      "Derulează și alege adaugă la ecranul principal.",
      "Apasă adaugă pentru ca RediHealth să apară pe ecranul principal și în biblioteca de aplicații.",
    ],
    inAppSteps: [
      "Copiază linkul de mai jos, deoarece acest browser integrat nu permite instalarea directă.",
      "Deschide Safari pe iPhone sau Chrome pe Android, lipește linkul și instalează din meniu.",
    ],
    androidManualSteps: [
      "Apasă meniul browserului din colțul de sus.",
      "Alege instalează aplicația sau adaugă pe ecranul principal.",
      "Confirmă instalarea ca RediHealth să apară în lista de aplicații.",
    ],
    macosSafariSteps: [
      "În Safari pe Mac, deschide meniul fișier din bara de sus.",
      "Alege adaugă în dock și confirmă pentru a păstra RediHealth pe Mac.",
    ],
    desktopManualSteps: [
      "Apasă pictograma de instalare din bara de adrese sau deschide meniul browserului.",
      "Selectează instalare RediHealth și confirmă pentru a o deschide separat.",
    ],
    copyLink: "Copiază linkul",
    copiedLink: "Link copiat",
    doneButton: "Gata",
  },
  en: {
    installButton: "Install app",
    refreshApp: "Refresh app",
    refreshingApp: "Refreshing…",
    bannerTitle: "Install RediHealth",
    bannerBody: "Open symptom guidance and clinic directions faster from your home screen.",
    notNow: "Not now",
    closeLabel: "Close",
    updateReadyTitle: "Update ready",
    updateReadyBody: "A newer version of RediHealth is ready to load.",
    updateNow: "Update now",
    dialogTitle: "Install RediHealth",
    dialogSubtitle: "Add RediHealth to your device for quick access.",
    iosSafariSteps: [
      "Tap the share button in Safari, or tap the three-dots menu first on newer iPhone and iPad versions.",
      "Scroll down and choose add to home screen.",
      "Tap add so RediHealth appears on your home screen and app library.",
    ],
    iosOtherSteps: [
      "Open this page in Safari on your iPhone or iPad, or tap the share icon in this browser.",
      "Scroll down and choose add to home screen.",
      "Tap add so RediHealth appears on your home screen and app library.",
    ],
    inAppSteps: [
      "Copy the page link below because this in-app browser blocks direct installation.",
      "Open Safari on iPhone or iPad, or Chrome on Android, paste the link, and install from the menu.",
    ],
    androidManualSteps: [
      "Tap the browser menu button in the top corner.",
      "Choose install app or add to home screen.",
      "Confirm installation so RediHealth appears in your app drawer and home screen.",
    ],
    macosSafariSteps: [
      "In Safari on Mac, open the file menu at the top of the screen.",
      "Choose add to dock and confirm to keep RediHealth on your Mac.",
    ],
    desktopManualSteps: [
      "Click the install button in the address bar or open the browser menu.",
      "Select install RediHealth and confirm to open it in its own window.",
    ],
    copyLink: "Copy link",
    copiedLink: "Link copied",
    doneButton: "Done",
  },
  sq: {
    installButton: "Instalo aplikacionin",
    refreshApp: "Rifresko aplikacionin",
    refreshingApp: "Po rifreskohet…",
    bannerTitle: "Instalo RediHealth",
    bannerBody: "Hap më shpejt udhëzimet për simptomat dhe klinikat nga ekrani kryesor.",
    notNow: "Jo tani",
    closeLabel: "Mbyll",
    updateReadyTitle: "Ka një version të ri",
    updateReadyBody: "Një version më i ri i RediHealth është gati për t'u hapur.",
    updateNow: "Përditëso tani",
    dialogTitle: "Instalo RediHealth",
    dialogSubtitle: "Shto RediHealth në pajisjen tënde për qasje të shpejtë.",
    iosSafariSteps: [
      "Prek butonin e ndarjes në Safari, ose së pari menunë me tre pika në versionet e reja të iPhone dhe iPad.",
      "Lëviz poshtë dhe zgjidh shto në ekranin kryesor.",
      "Prek shto që RediHealth të shfaqet në ekranin kryesor dhe në bibliotekën e aplikacioneve.",
    ],
    iosOtherSteps: [
      "Hape këtë faqe në Safari në iPhone ose iPad, ose prek ikonën e ndarjes në këtë shfletues.",
      "Lëviz poshtë dhe zgjidh shto në ekranin kryesor.",
      "Prek shto që RediHealth të shfaqet në ekranin kryesor dhe në bibliotekën e aplikacioneve.",
    ],
    inAppSteps: [
      "Kopjo lidhjen më poshtë sepse ky shfletues i brendshëm nuk lejon instalimin e drejtpërdrejtë.",
      "Hap Safari në iPhone ose Chrome në Android, ngjit lidhjen dhe instalo nga menuja.",
    ],
    androidManualSteps: [
      "Prek menunë e shfletuesit në këndin e sipërm.",
      "Zgjidh instalo aplikacionin ose shto në ekranin kryesor.",
      "Konfirmo instalimin që RediHealth të shfaqet te aplikacionet.",
    ],
    macosSafariSteps: [
      "Në Safari në Mac, hap menunë e skedarit në krye të ekranit.",
      "Zgjidh shto në dock dhe konfirmo për ta mbajtur RediHealth në Mac.",
    ],
    desktopManualSteps: [
      "Kliko ikonën e instalimit në shiritin e adresës ose hap menunë e shfletuesit.",
      "Zgjidh instalo RediHealth dhe konfirmo për ta hapur në dritare më vete.",
    ],
    copyLink: "Kopjo lidhjen",
    copiedLink: "Lidhja u kopjua",
    doneButton: "U krye",
  },
  it: {
    installButton: "Installa l'app",
    refreshApp: "Aggiorna l'app",
    refreshingApp: "Aggiornamento…",
    bannerTitle: "Installa RediHealth",
    bannerBody: "Apri più rapidamente sintomi e cliniche dalla schermata principale.",
    notNow: "Non ora",
    closeLabel: "Chiudi",
    updateReadyTitle: "Nuova versione pronta",
    updateReadyBody: "Una versione più recente di RediHealth è pronta per essere caricata.",
    updateNow: "Aggiorna ora",
    dialogTitle: "Installa RediHealth",
    dialogSubtitle: "Salva RediHealth sul dispositivo per un accesso rapido.",
    iosSafariSteps: [
      "Tocca il pulsante condividi in Safari, oppure prima il menu con tre punti sulle versioni recenti di iPhone e iPad.",
      "Scorri verso il basso e scegli aggiungi alla schermata home.",
      "Tocca aggiungi così RediHealth appare nella schermata home e nella libreria app.",
    ],
    iosOtherSteps: [
      "Apri questa pagina in Safari su iPhone o iPad, oppure tocca l'icona condividi in questo browser.",
      "Scorri verso il basso e scegli aggiungi alla schermata home.",
      "Tocca aggiungi così RediHealth appare nella schermata home e nella libreria app.",
    ],
    inAppSteps: [
      "Copia il link qui sotto perché questo browser interno impedisce l'installazione diretta.",
      "Apri Safari su iPhone o Chrome su Android, incolla il link e installa dal menu.",
    ],
    androidManualSteps: [
      "Tocca il menu del browser nell'angolo in alto.",
      "Scegli installa app oppure aggiungi a schermata home.",
      "Conferma l'installazione per trovare RediHealth nel cassetto delle app.",
    ],
    macosSafariSteps: [
      "In Safari su Mac, apri il menu file in alto sullo schermo.",
      "Scegli aggiungi al dock e conferma per tenere RediHealth sul Mac.",
    ],
    desktopManualSteps: [
      "Fai clic sull'icona di installazione nella barra degli indirizzi o apri il menu del browser.",
      "Seleziona installa RediHealth e conferma per aprirla in una finestra dedicata.",
    ],
    copyLink: "Copia link",
    copiedLink: "Link copiato",
    doneButton: "Fine",
  },
  hr: {
    installButton: "Instaliraj aplikaciju",
    refreshApp: "Osvježi aplikaciju",
    refreshingApp: "Osvježavanje…",
    bannerTitle: "Instaliraj RediHealth",
    bannerBody: "Brže otvori smjernice za simptome i klinike s početnog zaslona.",
    notNow: "Ne sada",
    closeLabel: "Zatvori",
    updateReadyTitle: "Dostupna je nova verzija",
    updateReadyBody: "Novija verzija aplikacije RediHealth spremna je za učitavanje.",
    updateNow: "Ažuriraj sada",
    dialogTitle: "Instaliraj RediHealth",
    dialogSubtitle: "Spremi RediHealth na svoj uređaj za brzi pristup.",
    iosSafariSteps: [
      "Dodirni gumb za dijeljenje u pregledniku Safari, ili najprije izbornik s tri točkice na novijim verzijama za iPhone i iPad.",
      "Pomakni prema dolje i odaberi dodaj na početni zaslon.",
      "Dodirni dodaj kako bi se RediHealth pojavio na početnom zaslonu i u biblioteci aplikacija.",
    ],
    iosOtherSteps: [
      "Otvori ovu stranicu u pregledniku Safari na uređaju iPhone ili iPad, ili dodirni ikonu dijeljenja.",
      "Pomakni prema dolje i odaberi dodaj na početni zaslon.",
      "Dodirni dodaj kako bi se RediHealth pojavio na početnom zaslonu i u biblioteci aplikacija.",
    ],
    inAppSteps: [
      "Kopiraj poveznicu u nastavku jer ovaj ugrađeni preglednik ne dopušta izravnu instalaciju.",
      "Otvori Safari na uređaju iPhone ili Chrome na sustavu Android, zalijepi poveznicu i instaliraj iz izbornika.",
    ],
    androidManualSteps: [
      "Dodirni izbornik preglednika u gornjem kutu.",
      "Odaberi instaliraj aplikaciju ili dodaj na početni zaslon.",
      "Potvrdi instalaciju kako bi se RediHealth pojavio u ladici aplikacija.",
    ],
    macosSafariSteps: [
      "U pregledniku Safari na računalu Mac otvori izbornik datoteka pri vrhu zaslona.",
      "Odaberi dodaj u dock i potvrdi kako bi RediHealth ostao na tvom Mac računalu.",
    ],
    desktopManualSteps: [
      "Klikni gumb za instalaciju u adresnoj traci ili otvori izbornik preglednika.",
      "Odaberi instaliraj RediHealth i potvrdi otvaranje u zasebnom prozoru.",
    ],
    copyLink: "Kopiraj poveznicu",
    copiedLink: "Poveznica kopirana",
    doneButton: "Gotovo",
  },
  rom: {
    installButton: "Thov e aplikacia",
    refreshApp: "Nevyar e aplikacia",
    refreshingApp: "Nevyarel pes…",
    bannerTitle: "Thov RediHealth",
    bannerBody: "Putar may sigo e simptomurya thaj e klinike katar cho angluno ekrano.",
    notNow: "Na akana",
    closeLabel: "Phandav",
    updateReadyTitle: "Si nevi verzia",
    updateReadyBody: "E nevi verzia katar RediHealth si gata te putrel pes.",
    updateNow: "Nevyar akana",
    dialogTitle: "Thov RediHealth",
    dialogSubtitle: "Arakh RediHealth pe cho aparati te putres les sigo.",
    iosSafariSteps: [
      "Klikisar o butono vash hulavipe ande Safari, vay anglal o meniu trin punktenca pe neve verzie vash iPhone thaj iPad.",
      "Zha tele thaj alosar te thos les po angluno ekrano.",
      "Klikisar thov te dikhel pes RediHealth po angluno ekrano thaj ande biblioteka e aplikaciengi.",
    ],
    iosOtherSteps: [
      "Putar kadi rig ande Safari pe iPhone vay iPad, vay klikisar o semno vash hulavipe ande kadava brauzero.",
      "Zha tele thaj alosar te thos les po angluno ekrano.",
      "Klikisar thov te dikhel pes RediHealth po angluno ekrano thaj ande biblioteka e aplikaciengi.",
    ],
    inAppSteps: [
      "Kopisar o linko tele sostar kadava andrutno brauzero na mukhel te thoves e aplikacia.",
      "Putar Safari pe iPhone vay Chrome pe Android, thov o linko thaj thov e aplikacia katar o meniu.",
    ],
    androidManualSteps: [
      "Klikisar o meniu e brauzeresko ko opruno agor.",
      "Alosar te thoves e aplikacia vay te thos po angluno ekrano.",
      "Phen chaches te avel RediHealth ande listya e aplikaciengi.",
    ],
    macosSafariSteps: [
      "Ande Safari pe Mac, putar o meniu e filengo opre po ekrano.",
      "Alosar te thoves ko dock thaj phen chaches te arakhes RediHealth pe cho Mac.",
    ],
    desktopManualSteps: [
      "Klikisar o semno vash instalacia ande adresa vay putar o meniu e brauzeresko.",
      "Alosar te thoves RediHealth thaj phen chaches te putrel pes ande korkori fereastra.",
    ],
    copyLink: "Kopisar o linko",
    copiedLink: "O linko kopisardilo",
    doneButton: "Gata",
  },
  ru: {
    installButton: "Установить приложение",
    refreshApp: "Обновить приложение",
    refreshingApp: "Обновление…",
    bannerTitle: "Установить RediHealth",
    bannerBody: "Быстрый доступ к проверке симптомов и клиникам с главного экрана.",
    notNow: "Не сейчас",
    closeLabel: "Закрыть",
    updateReadyTitle: "Доступна новая версия",
    updateReadyBody: "Новая версия RediHealth готова к загрузке.",
    updateNow: "Обновить сейчас",
    dialogTitle: "Установить RediHealth",
    dialogSubtitle: "Добавьте RediHealth на устройство для быстрого доступа.",
    iosSafariSteps: [
      "Нажмите кнопку поделиться в Safari или сначала откройте меню с тремя точками на новых версиях iPhone и iPad.",
      "Прокрутите вниз и выберите добавить на экран домой.",
      "Нажмите добавить, чтобы RediHealth появился на главном экране и в библиотеке приложений.",
    ],
    iosOtherSteps: [
      "Откройте эту страницу в Safari на iPhone или iPad либо нажмите значок поделиться в этом браузере.",
      "Прокрутите вниз и выберите добавить на экран домой.",
      "Нажмите добавить, чтобы RediHealth появился на главном экране и в библиотеке приложений.",
    ],
    inAppSteps: [
      "Скопируйте ссылку ниже, так как встроенный браузер не позволяет установить приложение напрямую.",
      "Откройте Safari на iPhone или Chrome на Android, вставьте ссылку и установите из меню.",
    ],
    androidManualSteps: [
      "Нажмите кнопку меню браузера в верхнем углу.",
      "Выберите установить приложение или добавить на главный экран.",
      "Подтвердите установку, чтобы RediHealth появился в списке приложений.",
    ],
    macosSafariSteps: [
      "В Safari на Mac откройте меню файл в верхней части экрана.",
      "Выберите добавить в dock и подтвердите, чтобы сохранить RediHealth на Mac.",
    ],
    desktopManualSteps: [
      "Нажмите значок установки в адресной строке или откройте меню браузера.",
      "Выберите установить RediHealth и подтвердите открытие в отдельном окне.",
    ],
    copyLink: "Копировать ссылку",
    copiedLink: "Ссылка скопирована",
    doneButton: "Готово",
  },
};

export function getPwaCopy(lang: Lang | string | null | undefined): PwaCopy {
  if (lang && Object.prototype.hasOwnProperty.call(PWA_COPY, lang)) {
    return PWA_COPY[lang as Lang];
  }
  return PWA_COPY.en;
}
