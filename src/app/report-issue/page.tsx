import type { Metadata } from "next";
import { ReportIssuePageContent } from "@/components/report-issue/ReportIssuePageContent";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

const descriptions: Record<Lang, string> = {
  ro: "Spune-ne ce n-a mers pe site. Echipa RediHealth se uită.",
  en: "Tell us what went wrong on the site. The RediHealth team will look at it.",
  sq: "Na trego çfarë nuk funksionoi në faqe. Ekipi i RediHealth do ta shohë.",
  it: "Dicci cosa non ha funzionato sul sito. Il team di RediHealth lo controlla.",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "report-issue", "Report a problem - RediHealth"),
    description: descriptions[lang],
  };
}

export default function ReportIssuePage() {
  return <ReportIssuePageContent />;
}
