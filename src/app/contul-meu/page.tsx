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
    ro: "Vezi sfaturile medicului, rețetele și programările tale. Intri cu numărul de telefon.",
    en: "See your doctor's advice, prescriptions and appointments. Sign in with your phone number.",
    sq: "Shiko këshillat e mjekut, recetat dhe takimet e tua. Hyr me numrin e telefonit.",
    it: "Vedi i consigli del medico, le ricette e gli appuntamenti. Accedi con il numero di telefono.",
  };

  return {
    title: localizedPageTitle(lang, "contul-meu", "Contul meu - RediHealth"),
    description: descriptions[lang] ?? descriptions.ro,
  };
}

const backCopy: Record<Lang, string> = {
  ro: "Înapoi la prima pagină",
  en: "Back to home page",
  sq: "Kthehu te faqja kryesore",
  it: "Torna alla pagina iniziale",
};

export default async function ContulMeuPage() {
  const lang = await getRequestLang();

  return (
    <main id="main-content" className="flex min-h-screen flex-col justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto mb-4 w-full max-w-md">
        <Link
          href={withLangPrefix("/", lang)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {backCopy[lang] ?? backCopy.ro}
        </Link>
      </div>

      <SmsPhoneAuthModal />
    </main>
  );
}
