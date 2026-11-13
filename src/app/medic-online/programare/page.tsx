import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { AppointmentBookingCalendar } from "@/components/telemed/AppointmentBookingCalendar";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { translations, type Lang } from "@/lib/i18n/translations";

// Own titles here: the shared page-title table still says "video" for this page, and the call is voice only.
const META: Record<Lang, { title: string; description: string }> = {
  ru: { title: "Запишитесь на прием к врачу - RediHealth", description: "Выберите день и время для бесплатного звонка врача-волонтера." },

  ro: { title: "Programează un apel cu medicul - RediHealth", description: "Alege ziua și ora pentru un apel gratuit cu un medic voluntar." },
  en: { title: "Book a call with a doctor - RediHealth", description: "Choose a day and time for a free call with a volunteer doctor." },
  sq: { title: "Cakto një thirrje me mjekun - RediHealth", description: "Zgjidh ditën dhe orën për një thirrje falas me një mjek vullnetar." },
  it: { title: "Prenota una chiamata con il medico - RediHealth", description: "Scegli il giorno e l'ora per una chiamata gratuita con un medico volontario." },
  hr: { title: "Rezerviraj poziv s liječnikom - RediHealth", description: "Odaberi dan i vrijeme za besplatan poziv s liječnikom volonterom." },
  rom: { title: "Alosar vrama vash svato e doktoresa - RediHealth", description: "Alosar dives thaj chaso vash svato bi lovesko ekhe doktoresa volonteri." },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return META[lang] ?? META.ro;
}

export default async function AppointmentBookingPage() {
  const lang = await getRequestLang();
  const t = translations[lang] ?? translations.ro;
  const mp = t.medicOnlinePage;

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <div className="border-b border-border bg-card py-6 sm:py-8">
        <Container>
          <div className="max-w-2xl">
            <Link
              href={withLangPrefix("/medic-online", lang)}
              className="mb-2 inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-sm text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {mp.backToDoctorOnline}
            </Link>
            <h1 className="text-balance text-page text-foreground">{mp.bookingTitle}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">{mp.bookingSubtitle}</p>
          </div>
        </Container>
      </div>

      <AppointmentBookingCalendar />
    </main>
  );
}
