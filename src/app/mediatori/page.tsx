import type { Metadata } from "next";
import { MediatorPublicHero } from "@/components/mediator/MediatorPublicHero";
import { CheckIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import type { Lang } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const descriptions: Record<Lang, string> = {
    ro: "Mediatorii sanitari RediHealth te ajută să te înscrii la medic, să faci actele și să vorbești cu un medic prin video de acasă.",
    en: "RediHealth health mediators help you register with a doctor, sort out documents and talk to a doctor by video from home.",
    sq: "Mediatorët shëndetësorë të RediHealth të ndihmojnë të regjistrohesh te mjeku, të rregullosh dokumentet dhe të flasësh me mjekun me video nga shtëpia.",
    it: "I mediatori sanitari di RediHealth ti aiutano a iscriverti dal medico, a sistemare i documenti e a parlare con un medico in video da casa.",
  };

  return {
    title: localizedPageTitle(lang, "mediatori", "Community health mediators - RediHealth"),
    description: descriptions[lang] ?? descriptions.en,
  };
}

const mediatoriPageCopy = {
  ro: {
    whoIsTitle: "Cine este mediatorul sanitar",
    whoIsDesc: "Mediatorul sanitar este un om din comunitatea ta, pregătit și atestat pentru această muncă. Te ajută cu medicul de familie, spitalul, asistența socială și primăria. Îți vorbește limba și nu spune nimănui ce afli de la tine.",
    bullets: [
      "Păstrează secretul medical și datele tale",
      "Nu îți cere niciodată bani sau alte foloase",
      "Ajută copii, adulți și vârstnici",
      "Lucrează împreună cu asistenții comunitari și cu medicii",
    ],
  },
  en: {
    whoIsTitle: "Who the health mediator is",
    whoIsDesc: "A health mediator is someone from your community, trained and certified for this work. They help you deal with your family doctor, hospitals, social services and the town hall. They speak your language and keep what you tell them private.",
    bullets: [
      "Keeps your medical and personal details private",
      "Never asks you for money or favours",
      "Helps children, adults and older people",
      "Works with community nurses and doctors",
    ],
  },
  sq: {
    whoIsTitle: "Kush është mediatori shëndetësor",
    whoIsDesc: "Mediatori shëndetësor është dikush nga komuniteti yt, i trajnuar dhe i certifikuar për këtë punë. Të ndihmon me mjekun e familjes, spitalin, shërbimet sociale dhe bashkinë. Flet gjuhën tënde dhe nuk ia tregon askujt atë që i thua.",
    bullets: [
      "Ruan sekretin mjekësor dhe të dhënat e tua",
      "Nuk të kërkon kurrë para apo favore",
      "Ndihmon fëmijë, të rritur dhe të moshuar",
      "Punon bashkë me infermierët e komunitetit dhe me mjekët",
    ],
  },
  it: {
    whoIsTitle: "Chi è il mediatore sanitario",
    whoIsDesc: "Il mediatore sanitario è una persona della tua comunità, formata e abilitata per questo lavoro. Ti aiuta con il medico di famiglia, l'ospedale, i servizi sociali e il comune. Parla la tua lingua e non racconta a nessuno quello che gli dici.",
    bullets: [
      "Tiene riservati i tuoi dati medici e personali",
      "Non ti chiede mai soldi o favori",
      "Aiuta bambini, adulti e anziani",
      "Lavora insieme agli infermieri di comunità e ai medici",
    ],
  },
};

export default async function MediatoriPublicPage() {
  const lang = await getRequestLang();
  const pageCopy = mediatoriPageCopy[lang] ?? mediatoriPageCopy.en;

  return (
    <main id="main-content" className="flex-1 bg-background">
      <MediatorPublicHero />

      <section className="py-10 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{pageCopy.whoIsTitle}</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{pageCopy.whoIsDesc}</p>
            </div>
            <ul className="space-y-3 text-base leading-relaxed text-foreground lg:pt-12">
              {pageCopy.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </main>
  );
}
