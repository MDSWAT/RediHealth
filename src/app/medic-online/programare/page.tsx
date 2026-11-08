import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { AppointmentBookingCalendar } from "@/components/telemed/AppointmentBookingCalendar";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { translations, type Lang } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const descriptions: Record<Lang, string> = {
    ro: "Alege ziua și ora pentru o consultație video gratuită.",
    en: "Choose a day and time for a free video appointment.",
    sq: "Zgjidh ditën dhe orën për një vizitë falas me video.",
    it: "Scegli il giorno e l'ora per una visita video gratuita.",
  };

  return {
    title: localizedPageTitle(lang, "medic-online-programare", "Schedule video consultation - RediHealth"),
    description: descriptions[lang] ?? descriptions.en,
  };
}

export default async function AppointmentBookingPage() {
  const lang = await getRequestLang();
  const t = translations[lang] ?? translations.ro;
  const mp = t.medicOnlinePage;

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <div className="border-b border-border bg-card py-6 sm:py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Link
            href={withLangPrefix("/medic-online", lang)}
            className="mb-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {mp.backToDoctorOnline}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{mp.bookingTitle}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">{mp.bookingSubtitle}</p>
        </div>
      </div>

      <AppointmentBookingCalendar />
    </main>
  );
}
