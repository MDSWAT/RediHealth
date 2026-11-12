import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { SmsPhoneAuthModal } from "@/components/portal/SmsPhoneAuthModal";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import type { Lang } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const descriptions: Record<Lang, string> = {
  ru: "См. советы, рецепты и назначения вашего врача. Войдите в систему, используя свой номер телефона.",

    ro: "Vezi sfaturile medicului, rețetele și programările tale. Intri cu numărul de telefon.",
    en: "See your doctor's advice, prescriptions and appointments. Sign in with your phone number.",
    sq: "Shiko këshillat e mjekut, recetat dhe takimet e tua. Hyr me numrin e telefonit.",
    it: "Vedi i consigli del medico, le ricette e gli appuntamenti. Accedi con il numero di telefono.",
    hr: "Pogledaj liječničke upute, recepte i svoje termine. Prijavi se brojem telefona.",
    rom: "Dikh e doktoreske sikavimata, recepte thaj che vrame. Khuves andre che telefoneske ginesa.",
  };

  return {
    title: localizedPageTitle(lang, "contul-meu", "Contul meu - RediHealth"),
    description: descriptions[lang] ?? descriptions.ro,
  };
}

const backCopy: Record<Lang, string> = {
  ru: "Вернуться на главную страницу",

  ro: "Înapoi la prima pagină",
  en: "Back to home page",
  sq: "Kthehu te faqja kryesore",
  it: "Torna alla pagina iniziale",
  hr: "Natrag na početnu stranicu",
  rom: "Palpale pe angluni rig",
};

export default async function ContulMeuPage() {
  const lang = await getRequestLang();

  return (
    <main id="main-content" className="flex-1 bg-background px-5 pt-6 pb-16 sm:px-6 lg:pt-16 dark:bg-ink-950">
      <div className="mx-auto mb-4 w-full max-w-md">
        <Link
          href={withLangPrefix("/", lang)}
          className="press-row -ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-(--radius-control) px-2 text-base font-semibold text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-mist dark:hover:text-paper dark:focus-visible:ring-paper"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          {backCopy[lang] ?? backCopy.ro}
        </Link>
      </div>

      <SmsPhoneAuthModal />
    </main>
  );
}
