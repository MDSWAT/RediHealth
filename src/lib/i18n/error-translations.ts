import type { Lang } from "@/lib/i18n/translations";

type ErrorCopy = {
  title: string;
  body: string;
  /** Shown instead of `body` when the device reports it is offline. */
  offlineBody: string;
  retry: string;
  home: string;
};

export const errorTranslations: Record<Lang, ErrorCopy> = {
  ru: {
    title: "Что-то пошло не так",
    body: "Эта страница не загрузилась. Попробуйте еще раз. Если это по-прежнему не работает, вернитесь через несколько минут.",
    offlineBody: "Сейчас нет интернета. Сохранённые памятки можно читать. Попробуйте ещё раз, когда появится связь.",
    retry: "Попробуйте еще раз",
    home: "Перейти на домашнюю страницу",
  },

  en: {
    title: "Something went wrong",
    body: "This page did not load. Try again. If it still does not work, come back in a few minutes.",
    offlineBody: "You have no internet right now. Guides you saved can still be read. Try again when you are connected.",
    retry: "Try again",
    home: "Go to home page",
  },
  ro: {
    title: "Ceva n-a mers",
    body: "Pagina nu s-a încărcat. Încearcă din nou. Dacă tot nu merge, revino peste câteva minute.",
    offlineBody: "Nu ai internet acum. Ghidurile salvate se pot citi în continuare. Încearcă din nou când ai conexiune.",
    retry: "Încearcă din nou",
    home: "Mergi la prima pagină",
  },
  sq: {
    title: "Diçka shkoi keq",
    body: "Faqja nuk u hap. Provo përsëri. Nëse ende nuk funksionon, kthehu pas disa minutash.",
    offlineBody: "Nuk ke internet tani. Udhëzuesit që ke ruajtur mund t'i lexosh ende. Provo përsëri kur të kesh internet.",
    retry: "Provo përsëri",
    home: "Shko te faqja kryesore",
  },
  it: {
    title: "Qualcosa è andato storto",
    body: "La pagina non si è caricata. Riprova. Se ancora non funziona, torna tra qualche minuto.",
    offlineBody: "Ora non hai internet. Le guide salvate si possono ancora leggere. Riprova quando torna la connessione.",
    retry: "Riprova",
    home: "Vai alla pagina iniziale",
  },
  hr: {
    title: "Nešto je pošlo po zlu",
    body: "Stranica se nije učitala. Pokušaj ponovno. Ako i dalje ne radi, vrati se za nekoliko minuta.",
    offlineBody: "Trenutno nemaš internet. Spremljene vodiče i dalje možeš čitati. Pokušaj ponovno kad se spojiš.",
    retry: "Pokušaj ponovno",
    home: "Idi na početnu stranicu",
  },
  rom: {
    title: "Vareso na gelo mishto",
    body: "I rig na putardili. Zumav palem. Te inke na kerel buchi, av palpale palo nekobor minute.",
    offlineBody: "Akana naj tut interneto. E gidurya so garadan shay drabares len vi akana. Zumav palem kana si tut interneto.",
    retry: "Zumav palem",
    home: "Zha ki angluni rig",
  },
};
